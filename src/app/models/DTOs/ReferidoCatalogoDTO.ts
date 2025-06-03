import { GrupoDTO } from "./GrupoDTO";

export interface ReferidoCatalogoDTO {
  id: number;
  nombre?: string;
  email?: string;
  celular?: string;
  producto?: string;
  estatusRerefencia?: string;
  productoVigente: boolean;
  empresa?: string;
  embajador?:string;
  grupos?: GrupoDTO[];
  codigoCupon? :string;
}