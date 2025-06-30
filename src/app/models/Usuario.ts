import { Roles } from "./Roles";

export interface Usuario{
    id?:  number;
    nombres: string;
    apellidos: string;
    email: string;
    password: string;
    celular?: string;
    catalogoPaisID?: number;
    catalogoEstadoID?: number;
    estadoTexto?: string;
    ciudad?: string;
    fuenteOrigenID?: number;
    fechaCreacion?: Date;
    rolesID?: number;
    roles?: Roles;
    grupoID?: number;
}

export interface UsuarioBasico{
    id:  number;
    nombre: string;
    email: string;
}
