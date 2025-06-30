import { TipoComisionEnum } from "src/app/enums/tipo.comision.enum";

export interface ProductoCreateDTO {
  empresaID: number;
  nombre: string;
  descripcion?: string;
  tipoComision?: TipoComisionEnum;
  fechaCaducidad?: Date;

  permitirQr?:boolean;
  cantidadQrLimite?:number;

  nivel1?: number;
  nivel2?: number;
  nivel3?: number;
  nivel4?: number;
  nivelMaster?: number;
  nivelInvitacion?: number;
}