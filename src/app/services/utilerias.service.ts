import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtileriasService {

  constructor() { }


public formatearFechaCorta(fecha: Date): string {
const dia = fecha.getDate();
  const mes = fecha.getMonth(); // 0 = enero, 11 = diciembre
  const anio = fecha.getFullYear();

  let nombreMes: string;

  switch (mes) {
    case 0: nombreMes = 'Ene.'; break;
    case 1: nombreMes = 'Feb.'; break;
    case 2: nombreMes = 'Mar.'; break;
    case 3: nombreMes = 'Abr.'; break;
    case 4: nombreMes = 'May.'; break;
    case 5: nombreMes = 'Jun.'; break;
    case 6: nombreMes = 'Jul.'; break;
    case 7: nombreMes = 'Ago.'; break;
    case 8: nombreMes = 'Sep.'; break;
    case 9: nombreMes = 'Oct.'; break;
    case 10: nombreMes = 'Nov.'; break;
    case 11: nombreMes = 'Dic.'; break;
    default: nombreMes = ''; break;
  }

  return `${dia} ${nombreMes}`;
}

  public formatearFecha(fecha: Date): string {
  const dia = fecha.getDate();
  const mes = fecha.getMonth(); // 0 = enero, 11 = diciembre
  const anio = fecha.getFullYear();

  let nombreMes: string;

  switch (mes) {
    case 0: nombreMes = 'Enero'; break;
    case 1: nombreMes = 'Febrero'; break;
    case 2: nombreMes = 'Marzo'; break;
    case 3: nombreMes = 'Abril'; break;
    case 4: nombreMes = 'Mayo'; break;
    case 5: nombreMes = 'Junio'; break;
    case 6: nombreMes = 'Julio'; break;
    case 7: nombreMes = 'Agosto'; break;
    case 8: nombreMes = 'Septiembre'; break;
    case 9: nombreMes = 'Octubre'; break;
    case 10: nombreMes = 'Noviembre'; break;
    case 11: nombreMes = 'Diciembre'; break;
    default: nombreMes = ''; break;
  }

  return `${dia} de ${nombreMes} del ${anio}`;
}

}
