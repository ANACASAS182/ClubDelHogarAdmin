import { TipoComisionEnum } from "src/app/enums/tipo.comision.enum";

export interface ProductoCreateDTO {
  empresaID: number;
  nombre: string;
  descripcion?: string;
  tipoComision?: TipoComisionEnum;
  comisionCantidad?: number;
  comisionPorcentaje?: number;
  comisionPorcentajeCantidad?: number;
  precio?: number;
  fechaCaducidad?: Date;
  tipoComisionNivel: TipoComisionEnum;
  nivel1?: number;
  nivel2?: number;
  nivel3?: number;
  nivel4?: number;
  nivelMaster?: number;
  nivelBase?: number;
}