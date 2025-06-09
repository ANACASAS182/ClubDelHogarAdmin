import { GrupoEmpresaDTO } from "./GrupoEmpresaDTO";

export interface EmpresaCreateDTO {
    id?: number;
    rfc:string;
    razonSocial: string;
    nombreComercial: string;
    descripcion?:string;
    logotipoBase64: string;
    giro:number;
    grupo:number;
}