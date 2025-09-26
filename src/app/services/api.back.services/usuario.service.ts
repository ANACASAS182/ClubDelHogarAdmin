import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { LoginUsuarioDTO } from 'src/app/models/DTOs/LoginUsuarioDTO';
import { Usuario, UsuarioBasico } from 'src/app/models/Usuario';
import { PaginationModelDTO } from 'src/app/models/DTOs/PaginationModelDTO';
import { UsuarioCatalogoDTO } from 'src/app/models/DTOs/UsuarioCatalogoDTO';
import { BancoUsuarioDTO } from 'src/app/models/DTOs/BancoUsuarioDTO';
import { UsuarioFiscalDTO } from 'src/app/models/DTOs/UsuarioFiscalDTO';
import { UsuarioEditDTO } from 'src/app/models/DTOs/UsuarioEditDTO';
import { Empresa } from 'src/app/models/Empresa';
import { CelulaDisplay, CelulaNode } from 'src/app/pages/celulas/celulas.page';
import { UsuarioDTO } from 'src/app/pages/registro/registro.page';
import { HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { PasswordRecoveryDTO } from 'src/app/models/DTOs/PasswordRecoveryDTO';
import { PasswordResetDTO }  from 'src/app/models/DTOs/PasswordResetDTO';
import { InvitacionDTO } from 'src/app/models/DTOs/InvitacionDTO';

type GetUsuariosParams = {
  page: number;
  size: number;
  sortBy: string;
  sortDir: string;
  searchQuery: string;
  rolesId?: number | null; 
};

@Injectable({
  providedIn: 'root',
})

export class UsuarioService {
  private apiUrl = environment.apiUrl + "api/Usuario";
  private apiUrlEmbajadores = `${environment.apiUrl}api/Embajadores`;

  constructor(private http: HttpClient) { }

 login(user: LoginUsuarioDTO, skipErrorHandler = false): Observable<GenericResponseDTO<string>> {
  let url = this.apiUrl + "/LoginPanelAdministrador";

    let headers = new HttpHeaders();

    if (skipErrorHandler) {
      headers = headers.set('skipErrorHandler', 'true');
    }
    const options = { headers };

    return this.http.post<GenericResponseDTO<string>>(url, user, options);
  }

  GetDatosInvitacion(codigo: string) {
  return this.http.get<InvitacionDTO>(
    `${this.apiUrlEmbajadores}/GetDatosInvitacion`,
    { params: { codigo } as any }
  );
}

  RegistroUsuarioCodigoInvitacion(user: UsuarioDTO, skipErrorHandler = false): Observable<GenericResponseDTO<boolean>> {
    let headers = new HttpHeaders();

    if (skipErrorHandler) {
      headers = headers.set('skipErrorHandler', 'true');
    }
    const options = { headers };

    return this.http.post<GenericResponseDTO<boolean>>(`${this.apiUrl}/RegistroUsuarioCodigoInvitacion`, user, options);
  }


  getCelulaFromHere(embajadorId: number): Observable<CelulaDisplay> {
    return this.http.get<CelulaDisplay>(`${environment.apiUrl}api/Embajadores/getCelulaFromHere?embajadorBase=` + embajadorId);
  }

  // usuario.service.ts
getUsuario(skipErrorHandler = false): Observable<GenericResponseDTO<Usuario>> {
  let headers = new HttpHeaders()
    .set('ngsw-bypass', 'true')                // 👈 no uses caché del SW
    .set('Cache-Control', 'no-cache');         // 👈 pide revalidación

  if (skipErrorHandler) {
    headers = headers.set('skipErrorHandler', 'true');
  }
  const options = { headers };
  return this.http.get<GenericResponseDTO<Usuario>>(`${this.apiUrl}/GetUsuarioLogeado`, options);
}

getEmpresaByUsuario(id: number, skipErrorHandler = false): Observable<GenericResponseDTO<Empresa>> {
  let headers = new HttpHeaders()
    .set('ngsw-bypass', 'true')
    .set('Cache-Control', 'no-cache');

  if (skipErrorHandler) headers = headers.set('skipErrorHandler', 'true');

  return this.http.get<GenericResponseDTO<Empresa>>(
    `${this.apiUrl}/GetEmpresaUsuario`,
    { headers, params: { usuarioID: id } }
  );
}

  passwordRecoveryVerify(token: string) {
  const base = this.apiUrl.replace(/\/+$/,'');          // https://host/.../api/Usuario
  const safe = encodeURIComponent(token);
  return this.http.get<GenericResponseDTO<any>>(`${base}/PasswordRecovery/Verify/${safe}`);
}



  getEmbajadorPorCorreo(correo: string): Observable<UsuarioBasico> {
    return this.http.get<UsuarioBasico>(`${this.apiUrl}/getEmbajadorPorCorreo?correo=` + correo);
  }

  getTablePaginated(params: GetUsuariosParams): Observable<GenericResponseDTO<PaginationModelDTO<UsuarioCatalogoDTO[]>>> {

  let parameters: any = {
    page: params.page.toString(),
    size: params.size.toString(),
    sortBy: params.sortBy,
    sortDir: params.sortDir,
    searchQuery: params.searchQuery
  };

  if (params.rolesId !== undefined && params.rolesId !== null) {
    parameters.rolesId = params.rolesId.toString();
  }

  return this.http.get<GenericResponseDTO<PaginationModelDTO<UsuarioCatalogoDTO[]>>>(
    `${this.apiUrl}/GetUsuariosPaginated`,
    { params: parameters }
  );
}


  busquedaUsuario(searchQuery: string): Observable<GenericResponseDTO<UsuarioCatalogoDTO[]>> {
    let parameters = {
      searchParam: searchQuery,
    }
    return this.http.get<GenericResponseDTO<UsuarioCatalogoDTO[]>>(`${this.apiUrl}/GetUserBusqueda`, { params: parameters });
  }

  getUsuarioByID(id: number): Observable<GenericResponseDTO<UsuarioEditDTO>> {
    let parameters = {
      usuarioID: id,
    }
    return this.http.get<GenericResponseDTO<UsuarioEditDTO>>(`${this.apiUrl}/GetUserByID`, { params: parameters });
  }

  save(model: UsuarioEditDTO): Observable<GenericResponseDTO<boolean>> {
    return this.http.post<GenericResponseDTO<boolean>>(`${this.apiUrl}/Save`, model);
  }

  getArbolEmbajadores(baseId: number): Observable<any> {
  return this.http.get<any>(`${environment.apiUrl}api/Embajadores/getArbolEmbajadores?baseId=${baseId}`);
}

  getUsuarioFiscal(usuarioId: number) {
  return this.http.get<GenericResponseDTO<UsuarioFiscalDTO>>(
    `${environment.apiUrl}api/usuario/${usuarioId}/fiscal`
  );
  }

  getBancosUsuario(usuarioId: number) {
    return this.http.get<GenericResponseDTO<BancoUsuarioDTO[]>>(
      `${environment.apiUrl}api/usuario/${usuarioId}/bancos`
    );
  }

    descargarConstanciaDeUsuario(usuarioId: number) {
    return this.http.get(
      `${environment.apiUrl}api/fiscal/constancia/usuario/${usuarioId}`,
      { responseType: 'blob' }
    );
  }

    // Enviar correo de recuperación
  passwordRecovery(dto: PasswordRecoveryDTO, skipErrorHandler = false) {
    const url = `${this.apiUrl}/PasswordRecovery`;
    let headers = new HttpHeaders();
    if (skipErrorHandler) headers = headers.set('skipErrorHandler', 'true');
    return this.http.post<GenericResponseDTO<boolean>>(url, dto, { headers });
  }

  // Cambiar contraseña con token
  passwordReset(dto: PasswordResetDTO, skipErrorHandler = false) {
    const url = `${this.apiUrl}/PasswordReset`;
    let headers = new HttpHeaders();
    if (skipErrorHandler) headers = headers.set('skipErrorHandler', 'true');
    return this.http.post<GenericResponseDTO<boolean>>(url, dto, { headers });
  }

}