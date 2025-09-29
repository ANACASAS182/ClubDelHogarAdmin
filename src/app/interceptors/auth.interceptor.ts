import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService) {}

  private isPublicRequest(req: HttpRequest<any>): boolean {
    // 🔓 Endpoints públicos (no deben llevar Authorization)
    // agrega aquí cualquier otro público: login, registro, recuperar, etc.
    const PUBLIC_PATHS = [
    '/api/Embajadores/GetDatosInvitacion',
    '/api/Usuario/Login',
    '/api/Usuario/RegistroUsuarioCodigoInvitacion',
    // 👇 añade estas si no están
    '/api/Usuario/PasswordRecovery',
    '/api/Usuario/PasswordReset',
    '/api/Usuario/PasswordRecovery/Verify'
  ];

    // Evita pegar token a dominios externos que no sean tu API
    const isSameApi =
      req.url.startsWith(environment.apiUrl) ||
      req.url.startsWith(environment.apiUrl.replace(/\/$/, ''));

    if (!isSameApi) return true;

    return PUBLIC_PATHS.some(p => req.url.includes(p));
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.tokenService.getToken()).pipe(
      switchMap(token => {
        // Si es pública o no hay token, pasa tal cual
        if (!token || this.isPublicRequest(req)) {
          return next.handle(req);
        }

        // Si es privada y hay token, lo adjuntamos
        const cloned = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next.handle(cloned);
      })
    );
  }
}