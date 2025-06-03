import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { PaginationModelDTO } from 'src/app/models/DTOs/PaginationModelDTO';
import { GrupoDTO } from 'src/app/models/DTOs/GrupoDTO';

@Injectable({
  providedIn: 'root',
})

export class GrupoService {
  private apiUrl = environment.apiUrl + "api/Grupo";

  constructor(private http: HttpClient) { }

  getAllGrupos(): Observable<GenericResponseDTO<GrupoDTO[]>> {
    return this.http.get<GenericResponseDTO<GrupoDTO[]>>(`${this.apiUrl}/GetAllGrupos`);
  }

  getTablePaginated(params: { page: number, size: number, sortBy: string, sortDir: string, searchQuery: string }): Observable<GenericResponseDTO<PaginationModelDTO<GrupoDTO[]>>> {

    let parameters = {
      page: params.page.toString(),
      size: params.size.toString(),
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      searchQuery: params.searchQuery
    }
    return this.http.get<GenericResponseDTO<PaginationModelDTO<GrupoDTO[]>>>(`${this.apiUrl}/GetGruposPaginated`, { params: parameters });
  }

  getByID(id: number): Observable<GenericResponseDTO<GrupoDTO>> {
    let parameters = new HttpParams().set("id", id);
    return this.http.get<GenericResponseDTO<GrupoDTO>>(`${this.apiUrl}/GetByID`, { params: parameters });
  }

  save(model: GrupoDTO): Observable<GenericResponseDTO<boolean>> {
    return this.http.post<GenericResponseDTO<boolean>>(`${this.apiUrl}/Save`, model);
  }



}