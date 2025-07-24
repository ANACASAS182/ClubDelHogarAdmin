import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { PaginationModelDTO } from 'src/app/models/DTOs/PaginationModelDTO';
import { Producto } from 'src/app/models/Producto';
import { ProductoCatalogoDTO } from 'src/app/models/DTOs/ProductoCatalogoDTO';
import { ProductoCreateDTO } from 'src/app/models/DTOs/ProductoCreateDTO';

@Injectable({
    providedIn: 'root',
})

export class ProductoService {
    private apiUrl = environment.apiUrl + "api/Producto";

    constructor(private http: HttpClient) { }

    getProductoById(productoId: number): Observable<Producto> {
        return this.http.get<Producto>(`${this.apiUrl}/getProductoById?productoId=` + productoId);
    }

    getAllProductosEmpresa(empresaID: number): Observable<GenericResponseDTO<Producto[]>> {
        let params = new HttpParams().set("empresaID", empresaID);
        return this.http.get<GenericResponseDTO<Producto[]>>(`${this.apiUrl}/GetProductosEmpresa`, { params });
    }

    getProductoAllPaginated(params: { page: number, size: number, sortBy: string, sortDir: string, searchQuery: string, grupoID: number, empresaID: number, vigenciaFilter: number }): Observable<GenericResponseDTO<PaginationModelDTO<ProductoCatalogoDTO[]>>> {

        let parameters = {
            page: params.page.toString(),
            size: params.size.toString(),
            sortBy: params.sortBy,
            sortDir: params.sortDir,
            searchQuery: params.searchQuery,
            grupoID: params.grupoID,
            empresaID: params.empresaID,
            vigenciaFilter: params.vigenciaFilter.toString()
        }

        return this.http.get<GenericResponseDTO<PaginationModelDTO<ProductoCatalogoDTO[]>>>(`${this.apiUrl}/GetAllProductoPaginated`, { params: parameters });
    }

    getProductoByEmpresaPaginated(params: { id: number, page: number, size: number, sortBy: string, sortDir: string, searchQuery: string, vigenciaFilter: number }): Observable<GenericResponseDTO<PaginationModelDTO<ProductoCatalogoDTO[]>>> {

        let parameters = {
            empresaID: params.id.toString(),
            page: params.page.toString(),
            size: params.size.toString(),
            sortBy: params.sortBy,
            sortDir: params.sortDir,
            searchQuery: params.searchQuery,
            vigenciaFilter: params.vigenciaFilter.toString()
        }

        return this.http.get<GenericResponseDTO<PaginationModelDTO<ProductoCatalogoDTO[]>>>(`${this.apiUrl}/GetProductoByEmpresaPaginated`, { params: parameters });

    }

    save(model: ProductoCreateDTO): Observable<GenericResponseDTO<boolean>> {
        return this.http.post<GenericResponseDTO<boolean>>(`${this.apiUrl}/Save`, model);
    }

}