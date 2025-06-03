import { EstatusReferenciaEnum } from "src/app/enums/estatus.referencia.enum";

export interface ReferidoDTO {
  id?: number;
  nombreCompleto?: string;
  email?: string;
  celular?: string;
  usuarioID?: number;
  productoID?: number;
  empresaID?: number;
  estatusReferenciaID?: number;
  estatusReferenciaDescripcion?: string;
  estatusReferenciaEnum?: EstatusReferenciaEnum;
  empresaRazonSocial?: string;
  productoNombre?: string;
  comision?: number;
  comisionTexto?: string;
  comisionCantidad?: number;
  comisionPorcentaje?: number;
  fechaRegistro?: Date;
  usuarioNombre?: string;
  usuarioApellido?: string;
  usuarioNombreCompleto? : string;
  fechaVencimiento? : Date;
}