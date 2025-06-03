import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { PaginationModelDTO } from 'src/app/models/DTOs/PaginationModelDTO';
import { Empresa } from 'src/app/models/Empresa';
import { EmpresaGrupo } from 'src/app/models/EmpresaGrupo';
import { EmpresaGrupoDTO } from 'src/app/models/DTOs/EmpresaGrupoDTO';

@Injectable({
    providedIn: 'root',
})

export class EmpresaGrupoService {
    private apiUrl = environment.apiUrl + "api/EmpresaGrupo";

    constructor(private http: HttpClient) { }

    getAllGruposByEmpresa(id: number): Observable<GenericResponseDTO<EmpresaGrupoDTO[]>> {
        let parameters = new HttpParams().set("id", id);
        return this.http.get<GenericResponseDTO<EmpresaGrupoDTO[]>>(`${this.apiUrl}/GetAllGruposByEmpresa`, { params: parameters });
    }

    save(model: EmpresaGrupo): Observable<GenericResponseDTO<boolean>> {
        return this.http.post<GenericResponseDTO<boolean>>(`${this.apiUrl}/Save`, model);
    }
    delete(model: EmpresaGrupo): Observable<GenericResponseDTO<boolean>> {
        return this.http.post<GenericResponseDTO<boolean>>(`${this.apiUrl}/Delete`, model);
    }


}