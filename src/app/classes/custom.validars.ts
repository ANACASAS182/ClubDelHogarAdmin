import { AbstractControl, ValidatorFn } from '@angular/forms';

export function sinEspaciosValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const valor = control.value || '';
    if (valor.trim().length === 0) {
      return { sinEspacios: true };
    }
    return null;
  };
}