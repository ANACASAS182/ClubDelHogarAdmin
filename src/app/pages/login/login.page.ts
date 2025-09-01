import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { TokenService } from 'src/app/services/token.service';
import { Router } from '@angular/router';
import { finalize, firstValueFrom } from 'rxjs';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { LoginUsuarioDTO } from 'src/app/models/DTOs/LoginUsuarioDTO';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  hasError = false;
  messageError = '';
  formEnviado = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService,
    private toastController: ToastController,
    private tokenService: TokenService
  ) {
    this.loginForm = this.fb.group({
      user: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {}

  async onSubmit() {
    if (this.formEnviado) return;
    this.formEnviado = true;

    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      this.formEnviado = false;
      return;
    }

    const user: LoginUsuarioDTO = {
      email: this.loginForm.controls['user'].value,
      password: this.loginForm.controls['password'].value,
    };

    try {
      // 1) Login: obten token
      const res = await firstValueFrom(
        this.usuarioService.login(user, true).pipe(
          finalize(() => (this.formEnviado = false))
        )
      );

      if (!res?.success || !res?.data) {
        this.hasError = true;
        this.messageError = res?.message || 'No se pudo iniciar sesión.';
        return;
      }

      // 2) Persistir token (AWAIT obligatorio para evitar carreras)
      await this.tokenService.saveToken(res.data);

      // 3) (Opcional recomendado) Obtener perfil fresco y guardarlo localmente
      try {
        const perfil = await firstValueFrom(this.usuarioService.getUsuario(true));
        if (perfil?.success && perfil?.data) {
          localStorage.setItem('usuario-actual', JSON.stringify(perfil.data));
        } else {
          localStorage.removeItem('usuario-actual');
        }
      } catch {
        // Si falla, limpiamos perfil para no reciclar datos viejos
        localStorage.removeItem('usuario-actual');
      }

      // 4) Navegar “en frío” (sin dejar la pila del login)
      await this.router.navigate(['/dashboard'], { replaceUrl: true });
    } catch (err: any) {
      this.hasError = true;
      this.messageError =
        err?.error?.message || 'Error al iniciar sesión. Intenta de nuevo.';
    }
  }

  getControl(campo: string) {
    return this.loginForm.get(campo);
  }
}
