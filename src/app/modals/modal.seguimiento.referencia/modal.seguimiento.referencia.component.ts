import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { IonHeader } from "@ionic/angular/standalone";
import { finalize, firstValueFrom } from 'rxjs';
import { sinEspaciosValidator } from 'src/app/classes/custom.validars';
import { cleanString } from 'src/app/classes/string-utils';
import { EstatusReferenciaEnum, getEstatusReferenciaOptions } from 'src/app/enums/estatus.referencia.enum';
import { EstatusReferidoDTO } from 'src/app/models/DTOs/EstatusReferidoDTO';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { ReferidoDTO } from 'src/app/models/DTOs/ReferidoDTO';
import { SeguimientoReferido } from 'src/app/models/SeguimientoReferido';
import { ReferidoService } from 'src/app/services/api.back.services/referido.service';
import { SeguimientoReferidoService } from 'src/app/services/api.back.services/seguimientos.service';

@Component({
  selector: 'app-modal.seguimiento.referencia',
  templateUrl: './modal.seguimiento.referencia.component.html',
  styleUrls: ['./modal.seguimiento.referencia.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class ModalSeguimientoReferenciaComponent implements OnInit {
  formulario: FormGroup;
  formStatus: FormGroup;
  formEnviado: boolean = false;
  numSeguimientos: number = 0;
  seguimientos: SeguimientoReferido[] = [];
  referido: ReferidoDTO | undefined;

  estatus: { nombre: string; valor: EstatusReferenciaEnum }[] = [];

  estatusReferenciaEnum = EstatusReferenciaEnum;

  @Input() id?: number = undefined;


  constructor(private fb: FormBuilder, private modalCtrl: ModalController,
    private toastController: ToastController,
    private loadingCtrl: LoadingController,
    private referidoService: ReferidoService,
    private seguimientoReferidoService: SeguimientoReferidoService) {

    this.formulario = this.fb.group({
      comentario: ["", [Validators.required, sinEspaciosValidator()]],
    });
    this.formStatus = this.fb.group({
      status: ["", Validators.required],
    });
  }

  async ngOnInit() {

    this.estatus = getEstatusReferenciaOptions();

    const loading = await this.loadingCtrl.create({
      message: 'Cargando datos...'
    });
    await loading.present();

    try {
      const refResponse = await firstValueFrom(this.referidoService.getByID(this.id!));
      this.referido = refResponse.data;
      this.formStatus.patchValue({
        status: this.referido.estatusReferenciaEnum
      });

      this.getSeguimientos();
    } catch (error) {
      console.error('Error al cargar datos', error);
    } finally {
      loading.dismiss();
    }


  }

  getSeguimientos() {
    this.seguimientoReferidoService.getSeguimientosReferido(this.id!).subscribe({
      next: (response: GenericResponseDTO<SeguimientoReferido[]>) => {
        this.seguimientos = response.data;
        this.numSeguimientos = this.seguimientos.length;
      }
    });
  }


  enviarFormularioStatus() {
    if (this.formEnviado) return;

    this.formEnviado = true;

    if (this.formStatus.invalid) {
      this.formStatus.markAllAsTouched();
      this.formEnviado = false;
      return;
    }

    var model: EstatusReferidoDTO = {
      id: this.id!,
      estatusReferenciaEnum  :this.formStatus.controls["status"].value
    };

    this.referidoService.updateEstatus(model).pipe(
      finalize(() => {
        this.formEnviado = false;
      })
    ).subscribe({
      next: (response: GenericResponseDTO<boolean>) => {
        if (response) {
          this.toastController.create({
            message: "Estatus actualizado.",
            duration: 3000,
            color: "success",
            position: 'top'
          }).then(toast => toast.present());
          this.getSeguimientos();
          this.referido!.estatusReferenciaEnum = model.estatusReferenciaEnum;
        }
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

    var model: SeguimientoReferido = {
      comentario: cleanString(this.formulario.controls["comentario"].value)!,
      referidoID: this.id!,
    };

    this.seguimientoReferidoService.save(model).pipe(
      finalize(() => {
        this.formEnviado = false;
      })
    ).subscribe({
      next: (response: GenericResponseDTO<boolean>) => {
        if (response) {
          this.toastController.create({
            message: "seguimiento guardado.",
            duration: 3000,
            color: "success",
            position: 'top'
          }).then(toast => toast.present());
          this.getSeguimientos();
          this.formulario.reset();
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
  formatFecha(fecha: Date): string {
    const f = new Date(fecha);
    const dia = f.getDate().toString().padStart(2, '0');
    let mes = f.toLocaleString('es-MX', { month: 'long' });
    mes = mes.charAt(0).toUpperCase() + mes.slice(1);
    const anio = f.getFullYear();
    return `${dia}-${mes}-${anio}`;
  }
}
