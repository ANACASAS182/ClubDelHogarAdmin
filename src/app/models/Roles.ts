import { RolesEnum } from "../enums/roles.enum";

export interface Roles{
    id?:  number;
    enumValue: RolesEnum;
    nombre: string;
}