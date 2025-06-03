import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { IonButton } from "@ionic/angular/standalone";
import { finalize } from 'rxjs';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { PeriodoDTO } from 'src/app/models/DTOs/PeriodoDTO';
import { PeriodoService } from 'src/app/services/api.back.services/periodo.service';
import { MesAnioPickerComponent } from "../../components/mes-anio-picker.component";

@Component({
  selector: 'app-modal.periodo.form',
  templateUrl: './modal.periodo.form.component.html',
  styleUrls: ['./modal.periodo.form.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MesAnioPickerComponent],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ModalPeriodoFormComponent implements OnInit {

  formulario: FormGroup;
  btnName: string = "AGREGAR";
  title: string = "AGREGAR";
  @Input() id?: number = undefined;

  formEnviado: boolean = false;
  minDate: Date | undefined;
  maxDate: Date | undefined;
  mesAnioSelected: boolean = false;

  constructor(private fb: FormBuilder,
    private periodoService: PeriodoService,
    private toastController: ToastController,
    private modalCtrl: ModalController) {

    this.formulario = this.fb.group({
      mesAnio: ["", Validators.required],
      fechaInicio: ["", Validators.required],
      fechaFin: ["", Validators.required],
      fechaPagoEmpresas: ["", Validators.required],
      fechaPagoEmbajadores: ["", Validators.required],
    });
  }

  ngOnInit() {
    if (this.id != undefined) {
      this.btnName = "GUARDAR";
      this.title = "MODIFICAR";
      this.periodoService.getByID(this.id).subscribe({
        next: (response: GenericResponseDTO<PeriodoDTO>) => {
          this.formulario.patchValue({
            mesAnio: new Date(response.data.anio, response.data.mes-1, 1),
            fechaInicio: response.data.fechaInicio,
            fechaFin: response.data.fechaInicio,
            fechaPagoEmpresas: response.data.fechaPagoEmpresas,
            fechaPagoEmbajadores: response.data.fechaPagoEmbajadores,
          });
        }
      });
    }

    this.formulario.get('mesAnio')?.valueChanges.subscribe((fecha: Date) => {
      if (fecha instanceof Date) {
        this.mesAnioSelected = true;
        const anio = fecha.getFullYear();
        const mes = fecha.getMonth();

        this.minDate = new Date(anio, mes, 1);
        this.maxDate = new Date(anio, mes + 1, 0);
      }
    });

  }

  enviarFormulario() {
    if (this.formEnviado) return;

    this.formEnviado = true;

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.formEnviado = false;
      return;
    }

    const fecha: Date = this.formulario.value.mesAnio;
    const mes: number = fecha.getMonth() + 1;
    const anio: number = fecha.getFullYear();

    var model: PeriodoDTO = {
      anio: anio,
      mes: mes,
      fechaInicio: this.formulario.controls["fechaInicio"].value,
      fechaFin: this.formulario.controls["fechaFin"].value,
      fechaPagoEmbajadores: this.formulario.controls["fechaPagoEmbajadores"].value,
      fechaPagoEmpresas: this.formulario.controls["fechaPagoEmpresas"].value
    };

    if (this.id != undefined) {
      model.id = this.id;
    }

    this.periodoService.save(model).pipe(
      finalize(() => {
        this.formEnviado = false;
      })
    ).subscribe({
      next: (response: GenericResponseDTO<boolean>) => {
        if (response) {
          this.toastController.create({
            message: "periodo guardado.",
            duration: 3000,
            color: "success",
            position: 'top'
          }).then(toast => toast.present());
          this.modalCtrl.dismiss(true);
        }
      }
    });

  }

  getControl(name: string) {
    return this.formulario.get(name);
  }

  close() {
    this.modalCtrl.dismiss();
  }

  get mesAnioControl(): FormControl {
    return this.formulario.get('mesAnio') as FormControl;
  }

}
