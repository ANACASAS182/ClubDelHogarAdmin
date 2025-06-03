import { Component, Injectable, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class MonthYearDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${month.toString().padStart(2, '0')}/${year}`;
    }
    return super.format(date, displayFormat);
  }
}

export const MONTH_YEAR_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'input',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-mes-anio-picker',
  standalone: true,
  template: `
     <mat-form-field appearance="fill" class="custom-datepicker">
      <mat-label>{{label}}</mat-label>
      <input matInput [matDatepicker]="picker" [formControl]="control"
        (dateChange)="onChange()" />
      <mat-hint>MM/YYYY</mat-hint>
      <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker touchUi #picker startView="multi-year" panelClass="month-year-picker"
        (monthSelected)="setMonthAndYear($event, picker)"></mat-datepicker>
    </mat-form-field>
  `,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: MonthYearDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MONTH_YEAR_FORMATS },
  ],
})
export class MesAnioPickerComponent {
  @Input() control!: FormControl;
  @Input() label = 'Mes/Año';

  setMonthAndYear(normalizedMonth: Date, datepicker: MatDatepicker<Date>) {
    const newDate = new Date(normalizedMonth.getFullYear(), normalizedMonth.getMonth(), 1);
    this.control.setValue(newDate);
    datepicker.close();
  }

  onChange() {
    this.control.setValue(this.control.value);
  }
}
