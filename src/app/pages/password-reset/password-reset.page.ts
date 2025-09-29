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

  // UI flags
  showPass = false;
  showConfirm = false;
  validToken = false;     // se habilita si el backend valida el token
  showDownload = false;   // muestra la sección con links a las stores

  // Indicador de fuerza (opcional)
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
    // Lee token de ruta (soporta rutas padre/hijo)
    const sources = this.route.parent
      ? [this.route.paramMap, this.route.parent.paramMap]
      : [this.route.paramMap];

    this.sub = merge(...sources).subscribe(() => {
      const self = this.route.snapshot.paramMap.get('token');
      const parent = this.route.parent?.snapshot.paramMap.get('token') ?? null;
      this.token = self ?? parent ?? '';

      if (!this.token) {
        this.errorMsg = 'Token no proporcionado.';
        this.validToken = false;
        return;
      }

      // ✅ Verificar token en backend antes de mostrar el formulario
      this.usuarioService.passwordRecoveryVerify(this.token).subscribe({
        next: () => { this.validToken = true; },
        error: (err) => {
          this.validToken = false;
          this.errorMsg = err?.error?.message ?? 'El enlace ya no es válido.';
        }
      });
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  // ---- Eye toggles
  togglePass()   { this.showPass    = !this.showPass; }
  toggleConfirm(){ this.showConfirm = !this.showConfirm; }

  // ---- Fuerza de contraseña (opcional)
  checkStrength() {
    const v = (this.form.get('password')?.value as string) ?? '';
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

    const password         = (this.form.get('password')?.value as string) ?? '';
    const confirmPassword  = (this.form.get('confirmPassword')?.value as string) ?? '';

    if (password !== confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    this.usuarioService.passwordReset(
      { newPassword: password, confirmNewPassword: confirmPassword, token: this.token },
      /* skipErrorHandler */ false
    )
    .pipe(finalize(() => (this.loading = false)))
    .subscribe({
      next: () => {
        // ✅ Mostrar mensaje de éxito y la sección de descarga
        this.okMsg = 'Contraseña actualizada con éxito.';
        this.showDownload = true;
        this.validToken = false;     // oculta el formulario
        this.form.reset();

        // Opcional: scroll al inicio para que se vea el bloque de descarga
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
      },
      error: (err: any) => {
        this.errorMsg = err?.error?.message ?? 'No se pudo actualizar la contraseña.';
      }
    });
  }

  goLogin() {
    this.router.navigateByUrl('/login');
  }
}
