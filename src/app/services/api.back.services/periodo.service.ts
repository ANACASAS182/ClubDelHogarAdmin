import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { PaginationModelDTO } from 'src/app/models/DTOs/PaginationModelDTO';
import { PeriodoDTO } from 'src/app/models/DTOs/PeriodoDTO';

@Injectable({
  providedIn: 'root',
})

export class PeriodoService {
  private apiUrl = environment.apiUrl + "api/Periodo";

  constructor(private http: HttpClient) { }

  getTablePaginated(params: { page: number, size: number, sortBy: string, sortDir: string, searchQuery: string }): Observable<GenericResponseDTO<PaginationModelDTO<PeriodoDTO[]>>> {

    let parameters = {
      page: params.page.toString(),
      size: params.size.toString(),
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      searchQuery: params.searchQuery
    }
    return this.http.get<GenericResponseDTO<PaginationModelDTO<PeriodoDTO[]>>>(`${this.apiUrl}/GetPeriodosPaginated`, { params: parameters });
  }

  getByID(id: number): Observable<GenericResponseDTO<PeriodoDTO>> {
    let parameters = new HttpParams().set("id", id);
    return this.http.get<GenericResponseDTO<PeriodoDTO>>(`${this.apiUrl}/GetByID`, { params: parameters });
  }

  save(model: PeriodoDTO): Observable<GenericResponseDTO<boolean>> {
    return this.http.post<GenericResponseDTO<boolean>>(`${this.apiUrl}/Save`, model);
  }



}