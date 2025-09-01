import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NavController } from '@ionic/angular';
import { TokenService } from './token.service';
import { Usuario } from 'src/app/models/Usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _usuario$ = new BehaviorSubject<Usuario | null>(null);
  usuario$ = this._usuario$.asObservable();

  constructor(private tokenSvc: TokenService, private nav: NavController) {}

  /** Llama esto DESPUÉS del login */
  async setSesion(token: string, usuario: Usuario) {
    await this.tokenSvc.saveToken(token);                   // persistir primero
    localStorage.setItem('usuario-actual', JSON.stringify(usuario));
    this._usuario$.next(usuario);                           // luego emitir
  }

  cargarSesionDeStorage() {
    const raw = localStorage.getItem('usuario-actual');
    if (raw) {
      try { this._usuario$.next(JSON.parse(raw)); } catch {}
    }
  }

  async logout() {
    this._usuario$.next(null);
    localStorage.removeItem('usuario-actual');
    await this.tokenSvc.removeToken();
    await this.nav.navigateRoot('/login');                 // corta la pila
  }
}