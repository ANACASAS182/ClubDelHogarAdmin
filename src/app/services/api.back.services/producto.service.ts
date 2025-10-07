import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { PaginationModelDTO } from 'src/app/models/DTOs/PaginationModelDTO';
import { Producto } from 'src/app/models/Producto';
import { ProductoCatalogoDTO } from 'src/app/models/DTOs/ProductoCatalogoDTO';
import { ProductoCreateDTO } from 'src/app/models/DTOs/ProductoCreateDTO';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private apiUrl = environment.apiUrl + 'api/Producto';

  constructor(private http: HttpClient) {}

  getProductoById(productoId: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/getProductoById`, {
      params: new HttpParams().set('productoId', String(productoId)),
    });
  }

  /** (NO paginado) productos por empresa — devuelve SIEMPRE un arreglo */
  getAllProductosEmpresa(empresaID: number) {
    const params = new HttpParams().set('empresaID', String(empresaID));
    return this.http
      .get<GenericResponseDTO<ProductoCatalogoDTO[]>>(`${this.apiUrl}/GetProductosEmpresa`, { params })
      .pipe(
        map(resp => resp?.data ?? []),
        catchError(() => of([] as ProductoCatalogoDTO[]))
      );
  }

  /** Paginado global (Admin) */
  getProductoAllPaginated(params: {
    page: number;
    size: number;
    sortBy: string;
    sortDir: string;
    searchQuery: string;
    grupoID: number;
    empresaID: number;
    vigenciaFilter: number;
  }): Observable<GenericResponseDTO<PaginationModelDTO<ProductoCatalogoDTO[]>>> {
    const httpParams = new HttpParams()
      .set('page', String(params.page))
      .set('size', String(params.size))
      .set('sortBy', params.sortBy ?? '')
      .set('sortDir', params.sortDir ?? '')
      .set('searchQuery', params.searchQuery ?? '')
      .set('grupoID', String(params.grupoID ?? 0))
      .set('empresaID', String(params.empresaID ?? 0))
      .set('vigenciaFilter', String(params.vigenciaFilter ?? 0));

    return this.http.get<GenericResponseDTO<PaginationModelDTO<ProductoCatalogoDTO[]>>>(
      `${this.apiUrl}/GetAllProductoPaginated`,
      { params: httpParams }
    );
  }

  /** Paginado por empresa (Socio/Admin) */
  getProductoByEmpresaPaginated(params: {
    empresaID: number;          // 👈 alineado con el backend
    page: number;
    size: number;
    sortBy: string;
    sortDir: string;
    searchQuery: string;
    vigenciaFilter: number;
  }): Observable<{ items: ProductoCatalogoDTO[]; total: number }> {
    const httpParams = new HttpParams()
      .set('empresaID', String(params.empresaID))
      .set('page', String(params.page))
      .set('size', String(params.size))
      .set('sortBy', params.sortBy ?? '')
      .set('sortDir', params.sortDir ?? '')
      .set('searchQuery', params.searchQuery ?? '')
      .set('vigenciaFilter', String(params.vigenciaFilter ?? 0));

    return this.http
      .get<GenericResponseDTO<PaginationModelDTO<ProductoCatalogoDTO[]>>>(
        `${this.apiUrl}/GetProductoByEmpresaPaginated`,
        { params: httpParams }
      )
      .pipe(
        map((resp: any) => {
          const data = resp?.data ?? {};
          const items = data.items ?? data.Items ?? [];
          const total = data.total ?? data.Total ?? (Array.isArray(items) ? items.length : 0);
          return { items, total };
        }),
        catchError(() => of({ items: [], total: 0 }))
      );
  }

  save(model: ProductoCreateDTO): Observable<GenericResponseDTO<boolean>> {
    return this.http.post<GenericResponseDTO<boolean>>(`${this.apiUrl}/Save`, model);
  }
}
