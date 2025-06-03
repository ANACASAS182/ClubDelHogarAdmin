import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UsuarioService } from '../services/api.back.services/usuario.service';

@Injectable({ providedIn: 'root' })

export class ProductosResolver implements Resolve<any> {
  constructor(private usuarioService : UsuarioService) {}

  resolve(): Observable<any> {
    return forkJoin({
      usuario: this.usuarioService.getUsuario().pipe(map(response => response.data),catchError(() => of([]))),
    });
  }
}