export interface Empresa{
    id?: number;
    rfc: string;
    razonSocial: string;
    nombreComercial:string;
    descripcion?:string;
    logotipoPath?:string; 
    logotipoBase64?:string;
    giro?:number;
    grupo?:number;
}