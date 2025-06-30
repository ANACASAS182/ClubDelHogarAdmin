export enum TipoComisionEnum {
  CantidadFija = 0,
  Porcentaje = 1
}

export const ComisionLabels: Record<keyof typeof TipoComisionEnum, string> = {
  CantidadFija: 'Cantidad',
  Porcentaje: 'Porcentaje',
};

export function getTiposComisionOptions(): { nombre: string; valor: TipoComisionEnum }[] {
  return Object.keys(TipoComisionEnum)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      nombre: ComisionLabels[key as keyof typeof TipoComisionEnum],
      valor: TipoComisionEnum[key as keyof typeof TipoComisionEnum]
    }));
}


