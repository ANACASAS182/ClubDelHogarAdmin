export enum RolesEnum {
    Admin = 1,
    Socio = 2,
    Embajadores = 3,
}
export const RolesLabels: Record<keyof typeof RolesEnum, string> = {
  Admin: 'Administrador',
  Socio: 'Socio',
  Embajadores: 'Embajador'
};

export function getRolesOptions(): { nombre: string; valor: RolesEnum }[] {
  return Object.keys(RolesEnum)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      nombre: RolesLabels[key as keyof typeof RolesEnum],
      valor: RolesEnum[key as keyof typeof RolesEnum]
    }));
}