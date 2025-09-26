import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Subscription, merge } from 'rxjs';
import { UsuarioService } from '../../services/api.back.services/usuario.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss'],
  standalone: false
})
export class PasswordResetPage implements OnDestroy {
  token = '';
  loading = false;
  errorMsg = '';
  okMsg = '';
  private sub?: Subscription;
  showPass = false;
  showConfirm = false;
  validToken = false;

  strengthVal = 0;           // 0 – 100
  strengthState: 'weak' | 'medium' | 'strong' = 'weak';
  strengthText = 'Débil';


  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  constructor(
  private fb: FormBuilder,
  private route: ActivatedRoute,
  private router: Router,
  private usuarioService: UsuarioService
) {
  this.sub = merge(this.route.paramMap, this.route.parent?.paramMap ?? [])
    .subscribe(() => {
      const self = this.route.snapshot.paramMap.get('token');
      const parent = this.route.parent?.snapshot.paramMap.get('token');
      this.token = self ?? parent ?? '';

      if (!this.token) {
        this.errorMsg = 'Token no proporcionado.';
        return;
      }

      // ✅ Verificar en backend
      this.usuarioService.passwordRecoveryVerify(this.token).subscribe({
        next: () => { this.validToken = true; },
        error: (err) => {
          this.validToken = false;
          this.errorMsg = err?.error?.message ?? 'El enlace ya no es válido.';
          // Opcional: redirigir después de mostrar el mensaje
          // setTimeout(() => this.router.navigateByUrl('/login'), 1600);
        }
      });
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  checkStrength() {
    const v = this.form.controls.password.value ?? '';
    let s = 0;
    if (v.length >= 6) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    if (v.length >= 10) s++;

    if (s <= 2) {
      this.strengthVal = 25; this.strengthState = 'weak'; this.strengthText = 'Débil';
    } else if (s === 3 || s === 4) {
      this.strengthVal = 55; this.strengthState = 'medium'; this.strengthText = 'Media';
    } else {
      this.strengthVal = 100; this.strengthState = 'strong'; this.strengthText = 'Fuerte';
    }
  }

  submit() {
    this.errorMsg = '';

    if (this.form.invalid || !this.token) {
      this.form.markAllAsTouched();
      if (!this.token) this.errorMsg = 'Token no proporcionado.';
      return;
    }

    const { password, confirmPassword } = this.form.value;
    if (password !== confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    this.usuarioService.passwordReset(
      {
        newPassword: password!,
        confirmNewPassword: confirmPassword!,
        token: this.token
      },
      /* showLoader */ false
    )
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.okMsg = 'Contraseña actualizada con éxito. Redirigiendo…';
          setTimeout(() => this.router.navigateByUrl('/login'), 1500);
        },
        error: (err: any) => {
          this.errorMsg = err?.error?.message ?? 'No se pudo actualizar la contraseña.';
        }
      });
  }
}