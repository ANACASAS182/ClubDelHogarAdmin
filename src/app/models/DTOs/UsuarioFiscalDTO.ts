export interface UsuarioFiscalDTO {
  id: number;
  usuarioId: number;
  nombreSAT: string;
  rfc: string;
  curp: string;
  codigoPostal: string;
  regimenClave: number;
  constanciaPath?: string | null;
  constanciaHash?: string | null;
  verificadoSAT: boolean;
  fechaVerificacion?: string | null;
  fechaCreacion?: string | null;
  fechaActualizacion?: string | null;
}
