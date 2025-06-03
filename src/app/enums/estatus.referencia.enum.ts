export enum EstatusReferenciaEnum {
    Creado = 1,
    Seguimiento = 2,
    Cerrado = 3,
  }

  export const EstatusReferenciaLabels: Record<keyof typeof EstatusReferenciaEnum, string> = {
    Creado: 'Creado',
    Seguimiento: 'Seguimiento',
    Cerrado: 'Cerrado'
  };
  
  export function getEstatusReferenciaOptions(): { nombre: string; valor: EstatusReferenciaEnum }[] {
    return Object.keys(EstatusReferenciaEnum)
      .filter(key => isNaN(Number(key)))
      .map(key => ({
        nombre: EstatusReferenciaLabels[key as keyof typeof EstatusReferenciaEnum],
        valor: EstatusReferenciaEnum[key as keyof typeof EstatusReferenciaEnum]
      }));
  }