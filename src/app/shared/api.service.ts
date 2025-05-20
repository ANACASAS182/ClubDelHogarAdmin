import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmbajadorDTO, EmpresaDTO, GrupoDTO } from 'src/Model/EmpresaDTO';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'https://localhost:7146/'; // Cambia al puerto y endpoint real de tu backend

  constructor(private http: HttpClient) {}

  //GRUPOS -----------------------------
  GetGrupos(): Observable<GrupoDTO[]> {
    return this.http.get<GrupoDTO[]>(`${this.apiUrl}Admin/GetGrupos`);
  }

  AgregarEditarGrupo(grupo:GrupoDTO): Observable<GrupoDTO[]> {
    return this.http.post<GrupoDTO[]>(`${this.apiUrl}Admin/AgregarEditarGrupo`, grupo);
  }

  //EMPRESAS -----------------------------
  GetEmpresas(): Observable<EmpresaDTO[]> {
    return this.http.get<EmpresaDTO[]>(`${this.apiUrl}Admin/GetEmpresas`);
  }

  AgregarEditarEmpresa(empresa:EmpresaDTO): Observable<EmpresaDTO[]> {
    return this.http.post<EmpresaDTO[]>(`${this.apiUrl}Admin/AgregarEditarEmpresa`, empresa);
  }

  // EMBAJADORES  -----------------------------

  GetEmbajadores(): Observable<EmbajadorDTO[]> {
    return this.http.get<EmbajadorDTO[]>(`${this.apiUrl}Admin/GetEmbajadores`);
  }
}
