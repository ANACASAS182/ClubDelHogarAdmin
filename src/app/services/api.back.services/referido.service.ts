import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { PaginationModelDTO } from 'src/app/models/DTOs/PaginationModelDTO';
import { ReferidoCatalogoDTO } from 'src/app/models/DTOs/ReferidoCatalogoDTO';
import { ReferidoDTO } from 'src/app/models/DTOs/ReferidoDTO';
import { EstatusReferidoDTO } from 'src/app/models/DTOs/EstatusReferidoDTO';
import { EstatusReferenciaEnum } from 'src/app/enums/estatus.referencia.enum';

@Injectable({
    providedIn: 'root',
})

export class ReferidoService {
    private apiUrl = environment.apiUrl + "api/Referido";

    constructor(private http: HttpClient) { }

    getAllReferidosPaginated(params: { page: number, size: number, sortBy: string, sortDir: string, searchQuery: string, grupoID: number, empresaID: number, statusEnum?: number, usuarioID: number }): Observable<GenericResponseDTO<PaginationModelDTO<ReferidoCatalogoDTO[]>>> {

        let httpParams = new HttpParams()
            .set('page', params.page.toString())
            .set('size', params.size.toString())
            .set('sortBy', params.sortBy)
            .set('sortDir', params.sortDir)
            .set('searchQuery', params.searchQuery || '')
            .set('empresaID', params.empresaID.toString())
            .set('grupoID', params.grupoID.toString())
            .set('usuarioID', params.usuarioID.toString());

        if (params.statusEnum !== undefined && params.statusEnum !== null) {
            httpParams = httpParams.set('estatus', params.statusEnum.toString());
        }

        return this.http.get<GenericResponseDTO<PaginationModelDTO<ReferidoCatalogoDTO[]>>>(`${this.apiUrl}/GetAllReferidosPaginated`, { params: httpParams });
    }

    getReferidosByEmpresaPaginated(params: { id: number, page: number, size: number, sortBy: string, sortDir: string, searchQuery: string, statusEnum?: number, usuarioID: number  }): Observable<GenericResponseDTO<PaginationModelDTO<ReferidoCatalogoDTO[]>>> {

        let httpParams = new HttpParams()
            .set('empresaID', params.id.toString())
            .set('page', params.page.toString())
            .set('size', params.size.toString())
            .set('sortBy', params.sortBy)
            .set('sortDir', params.sortDir)
            .set('usuarioID', params.usuarioID.toString())
            .set('searchQuery', params.searchQuery || '');

        if (params.statusEnum !== undefined && params.statusEnum !== null) {
            httpParams = httpParams.set('estatus', params.statusEnum.toString());
        }

        return this.http.get<GenericResponseDTO<PaginationModelDTO<ReferidoCatalogoDTO[]>>>(`${this.apiUrl}/GetReferidosByEmpresaPaginated`, { params: httpParams });

    }

    getByID(id: number): Observable<GenericResponseDTO<ReferidoDTO>> {
        let parameters = new HttpParams().set("id", id);
        return this.http.get<GenericResponseDTO<ReferidoDTO>>(`${this.apiUrl}/GetReferidoByID`, { params: parameters });
    }

    updateEstatus(model: EstatusReferidoDTO): Observable<GenericResponseDTO<boolean>> {
        return this.http.post<GenericResponseDTO<boolean>>(`${this.apiUrl}/UpdateStatus`, model);
    }

    getQR(codigo: string): Observable<GenericResponseDTO<string>> {
        let parameters = new HttpParams().set("codigo", codigo);
        return this.http.get<GenericResponseDTO<string>>(`${this.apiUrl}/GetQR`, { params: parameters });
    }


}