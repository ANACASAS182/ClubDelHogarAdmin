import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { LoginUsuarioDTO } from 'src/app/models/DTOs/LoginUsuarioDTO';
import { Usuario, UsuarioBasico } from 'src/app/models/Usuario';
import { PaginationModelDTO } from 'src/app/models/DTOs/PaginationModelDTO';
import { UsuarioCatalogoDTO } from 'src/app/models/DTOs/UsuarioCatalogoDTO';
import { UsuarioEditDTO } from 'src/app/models/DTOs/UsuarioEditDTO';
import { Empresa } from 'src/app/models/Empresa';
import { CelulaDisplay, CelulaNode } from 'src/app/pages/celulas/celulas.page';

@Injectable({
  providedIn: 'root',
})

export class UsuarioService {
  private apiUrl = environment.apiUrl + "api/Usuario";

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

  getCelulaFromHere(embajadorId:number): Observable<CelulaDisplay> {
    return this.http.get<CelulaDisplay>(`${environment.apiUrl}api/Embajadores/getCelulaFromHere?embajadorBase=` + embajadorId);
  }

  getUsuario(skipErrorHandler = false): Observable<GenericResponseDTO<Usuario>> {
    let headers = new HttpHeaders();

    if (skipErrorHandler) {
      headers = headers.set('skipErrorHandler', 'true');
    }
    const options = { headers };
    return this.http.get<GenericResponseDTO<Usuario>>(`${this.apiUrl}/GetUsuarioLogeado`, options);
  }

   getEmbajadorPorCorreo(correo:string): Observable<UsuarioBasico> {
    return this.http.get<UsuarioBasico>(`${this.apiUrl}/getEmbajadorPorCorreo?correo=` + correo);
  }

  getTablePaginated(params: { page: number, size: number, sortBy: string, sortDir: string, searchQuery: string }): Observable<GenericResponseDTO<PaginationModelDTO<UsuarioCatalogoDTO[]>>> {

    let parameters = {
      page: params.page.toString(),
      size: params.size.toString(),
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      searchQuery: params.searchQuery
    }
    return this.http.get<GenericResponseDTO<PaginationModelDTO<UsuarioCatalogoDTO[]>>>(`${this.apiUrl}/GetUsuariosPaginated`, { params: parameters });
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

   getEmpresaByUsuario(id: number): Observable<GenericResponseDTO<Empresa>> {
    let parameters = {
      usuarioID: id,
    }
    return this.http.get<GenericResponseDTO<Empresa>>(`${this.apiUrl}/GetEmpresaUsuario`, { params: parameters });
  }
  
  save(model: UsuarioEditDTO): Observable<GenericResponseDTO<boolean>> {
    return this.http.post<GenericResponseDTO<boolean>>(`${this.apiUrl}/Save`, model);
  }

}