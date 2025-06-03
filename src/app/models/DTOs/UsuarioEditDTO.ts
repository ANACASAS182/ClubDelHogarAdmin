import { RolesEnum } from "src/app/enums/roles.enum";

export interface UsuarioEditDTO {
  id?: number;
  nombres: string;
  apellidos: string;
  email: string;
  celular: string;
  catalogoPaisID?: number;
  catalogoEstadoID?: number;
  estadoTexto?: string;
  ciudad?: string;
  fuenteOrigenID: number;
  usuarioParentID?: number;
  usuarioParentNombreCompleto?: string;
  codigoInvitacion?: string;
  rolesID?: number;
  rolesEnum?: RolesEnum;
  grupoID?: number;
  empresaID?: number;
  password? : string;
}
