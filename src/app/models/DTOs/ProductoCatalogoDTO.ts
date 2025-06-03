import { TipoComisionEnum } from "src/app/enums/tipo.comision.enum";
import { GrupoDTO } from "./GrupoDTO";

export interface ProductoCatalogoDTO {
  id: number;
  empresaId: number;
  nombre?: string;
  descripcion?: string;
  tipoComision?: TipoComisionEnum;
  comisionCantidad?: number;
  comisionPorcentaje?: number;
  comisionPorcentajeCantidad?: number;
  precio?: number;
  fechaCaducidad?: Date;
  empresaRazonSocial?: string;
  grupos: GrupoDTO[];
}