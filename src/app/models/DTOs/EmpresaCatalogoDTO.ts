import { GrupoDTO } from "./GrupoDTO";

export interface EmpresaCatalogoDTO {
  id: number;
  rfc?: string;
  razonSocial?: string;
  nombreComercial?: string;
  descripcion?: string;
  grupos?: GrupoDTO[];
}