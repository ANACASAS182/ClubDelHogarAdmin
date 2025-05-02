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


  // Ejemplo: obtener lista de items
  GetEmpresas(): Observable<EmpresaDTO[]> {
    return this.http.get<EmpresaDTO[]>(`${this.apiUrl}Admin/GetEmpresas`);
  }

  GetGrupos(): Observable<GrupoDTO[]> {
    return this.http.get<GrupoDTO[]>(`${this.apiUrl}Admin/GetGrupos`);
  }

  GetEmbajadores(): Observable<EmbajadorDTO[]> {
    return this.http.get<EmbajadorDTO[]>(`${this.apiUrl}Admin/GetEmbajadores`);
  }
}
