import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { PaginationModelDTO } from 'src/app/models/DTOs/PaginationModelDTO';
import { GrupoDTO } from 'src/app/models/DTOs/GrupoDTO';
import { Empresa } from 'src/app/models/Empresa';
import { EmpresaCatalogoDTO } from 'src/app/models/DTOs/EmpresaCatalogoDTO';

@Injectable({
  providedIn: 'root',
})

export class EmpresaService {
  private apiUrl = environment.apiUrl + "api/Empresa"; 

  constructor(private http: HttpClient) {}

  getAllEmpresas(): Observable<GenericResponseDTO<Empresa[]>>{
    return this.http.get<GenericResponseDTO<Empresa[]>>(`${this.apiUrl}/GetAllEmpresas`);
  }

  getTablePaginated(params: { page: number, size: number, sortBy: string, sortDir: string, searchQuery: string, grupoID: number}) : Observable<GenericResponseDTO<PaginationModelDTO<EmpresaCatalogoDTO[]>>>{
    
    let parameters = {
      page: params.page.toString(),
      size: params.size.toString(),
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      searchQuery: params.searchQuery,
      grupoID: params.grupoID.toString()
    }
    return this.http.get<GenericResponseDTO<PaginationModelDTO<EmpresaCatalogoDTO[]>>>(`${this.apiUrl}/GetEmpresasPaginated`, {params : parameters});
  }

  getByID(id: number): Observable<GenericResponseDTO<Empresa>>{
    let parameters = new HttpParams().set("empresaID",id);
    return this.http.get<GenericResponseDTO<Empresa>>(`${this.apiUrl}/GetEmpresaByID`, {params : parameters});
  }

  save(model : Empresa) : Observable<GenericResponseDTO<boolean>> {
    return this.http.post<GenericResponseDTO<boolean>>(`${this.apiUrl}/Save`,model);
  }



}