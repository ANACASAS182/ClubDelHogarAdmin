import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { PaginationModelDTO } from 'src/app/models/DTOs/PaginationModelDTO';
import { Empresa } from 'src/app/models/Empresa';
import { EmpresaCatalogoDTO } from 'src/app/models/DTOs/EmpresaCatalogoDTO';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private apiUrl = environment.apiUrl + 'api/Empresa';

  constructor(private http: HttpClient) {}

  /** Catálogo completo de empresas (Admin y usos generales) */
  getAllEmpresas(): Observable<GenericResponseDTO<Empresa[]>> {
    return this.http.get<GenericResponseDTO<Empresa[]>>(
      `${this.apiUrl}/GetAllEmpresas`
    );
  }

  /** Empresas paginadas (sólo Admin) */
  getTablePaginated(params: {
    page: number;
    size: number;
    sortBy: string;
    sortDir: string;
    searchQuery: string;
    grupoID: number;
  }): Observable<GenericResponseDTO<PaginationModelDTO<EmpresaCatalogoDTO[]>>> {
    const httpParams = new HttpParams()
      .set('page', String(params.page))
      .set('size', String(params.size))
      .set('sortBy', params.sortBy ?? '')
      .set('sortDir', params.sortDir ?? '')
      .set('searchQuery', params.searchQuery ?? '')
      .set('grupoID', String(params.grupoID ?? 0));

    return this.http.get<GenericResponseDTO<PaginationModelDTO<EmpresaCatalogoDTO[]>>>(
      `${this.apiUrl}/GetEmpresasPaginated`,
      { params: httpParams }
    );
  }

  /** Detalle por ID */
  getByID(id: number): Observable<GenericResponseDTO<Empresa>> {
    const params = new HttpParams().set('empresaID', String(id)); // 👈 cast a string
    return this.http.get<GenericResponseDTO<Empresa>>(
      `${this.apiUrl}/GetEmpresaByID`,
      { params }
    );
  }

  /** Lista de empresas asociadas a un usuario (usa tu EmpresaController.GetAllEmpresasByUsuarioId) */
  getAllEmpresasByUsuarioId(usuarioId: number): Observable<GenericResponseDTO<any[]>> {
    const params = new HttpParams().set('usuarioId', String(usuarioId));
    return this.http.get<GenericResponseDTO<any[]>>(
      `${this.apiUrl}/GetAllEmpresasByUsuarioId`,
      { params }
    );
  }

  /** Crear/actualizar empresa */
  save(model: Empresa): Observable<GenericResponseDTO<boolean>> {
    return this.http.post<GenericResponseDTO<boolean>>(
      `${this.apiUrl}/Save`,
      model
    );
  }
}
