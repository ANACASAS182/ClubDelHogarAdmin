export interface PeriodoDTO {
  id?: number;
  anio: number;
  mes: number;
  mesLetra?:string;
  fechaInicio: Date;
  fechaFin: Date;
  fechaPagoEmpresas: Date;
  fechaPagoEmbajadores: Date;
}