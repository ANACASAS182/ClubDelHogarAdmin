export interface EmpresaDTO
{
    id:number;
    rfc:string;
    razonSocial:string;
    nombreComercial:string;
    logoBase64:string;
    grupoId:number;
}

export interface GrupoDTO{
    id:number;
    nombre:string;
}

export interface EmbajadorDTO{
    id:number;
    nombres:string;
    apellidos:string;
}