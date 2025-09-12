export interface BancoUsuarioDTO {
  id: number;
  usuarioId: number;
  nombreBanco: string;
  nombreTitular: string;
  numeroCuenta: string;          // guarda completo; en UI lo enmascaras
  catBancoId?: number | null;
  bancoOtro?: string | null;
  tipoCuenta: number;            // 0 = Tarjeta, 1 = CLABE
  fechaCreacion?: string | null;
  eliminado?: boolean;
}
