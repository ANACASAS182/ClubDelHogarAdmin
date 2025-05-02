export interface EmpresaDTO
{
    id:number;
    razonSocial:string;
    nombreComercial:string;
    logoBase64:string;
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