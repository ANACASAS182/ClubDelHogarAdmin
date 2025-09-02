import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, LoadingController, ModalController, ToastController } from '@ionic/angular';
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

  @Input() id?: number;

  formulario: FormGroup;
  formStatus: FormGroup;
  formEnviado = false;

  numSeguimientos = 0;
  seguimientos: SeguimientoReferido[] = [];
  referido?: ReferidoDTO;

  estatus = getEstatusReferenciaOptions();
  estatusReferenciaEnum = EstatusReferenciaEnum;

  showSegForm = false; // controla “Agregar seguimiento”

  compareNum = (a: any, b: any) => Number(a) === Number(b);

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private toastController: ToastController,
    private loadingCtrl: LoadingController,
    private referidoService: ReferidoService,
    private seguimientoReferidoService: SeguimientoReferidoService
  ) {
    this.formulario = this.fb.group({
      comentario: ['', [Validators.required, sinEspaciosValidator()]],
    });

    this.formStatus = this.fb.group({
      status: [null as unknown as number, Validators.required],
    });
  }

  get statusCtrl(): FormControl<number> {
    return this.formStatus.get('status') as FormControl<number>;
  }
  get comentarioCtrl(): FormControl<string> {
    return this.formulario.get('comentario') as FormControl<string>;
  }
  getControl(name: string) { return this.formulario.get(name); }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando datos...' });
    await loading.present();

    try {
      const refResponse = await firstValueFrom(this.referidoService.getByID(this.id!));
      this.referido = refResponse.data;

      // 👇 LEE CON EL CASE CORRECTO (y alternativas) PARA NO QUEDAR EN BLANCO
      const r = this.referido as any;
      const currentStatus = Number(
        r?.estatusReferenciaEnum ??
        r?.EstatusReferenciaEnum ??
        r?.estatusReferenciaID ??
        r?.EstatusReferenciaID ??
        null
      );

      if (Number.isFinite(currentStatus)) {
        this.statusCtrl.setValue(currentStatus as number);
      } else {
        this.formStatus.reset();
      }

      // mostrar el bloque “Agregar seguimiento” si aplica
      this.showSegForm = this.statusCtrl.value === EstatusReferenciaEnum.Seguimiento;
      this.statusCtrl.valueChanges.subscribe(v => {
        this.showSegForm = Number(v) === EstatusReferenciaEnum.Seguimiento;
      });

      this.getSeguimientos();
    } catch (e) {
      console.error('Error al cargar datos', e);
    } finally {
      loading.dismiss();
    }
  }

  getSeguimientos() {
    this.seguimientoReferidoService.getSeguimientosReferido(this.id!).subscribe({
      next: (response: GenericResponseDTO<SeguimientoReferido[]>) => {
        this.seguimientos = response.data || [];
        this.numSeguimientos = this.seguimientos.length;
      }
    });
  }

  isCreadoDisabled(valor: number): boolean {
    return valor === EstatusReferenciaEnum.Creado &&
           this.statusCtrl.value !== EstatusReferenciaEnum.Creado;
  }

  enviarFormularioStatus() {
    if (this.formEnviado) return;
    this.formEnviado = true;

    if (this.formStatus.invalid) {
      this.formStatus.markAllAsTouched();
      this.formEnviado = false;
      return;
    }

    const nuevo = Number(this.statusCtrl.value);

    const model: EstatusReferidoDTO = {
      id: this.id!,
      estatusReferenciaEnum: nuevo
    };

    this.referidoService.updateEstatus(model).pipe(
      finalize(() => this.formEnviado = false)
    ).subscribe({
      next: (response: GenericResponseDTO<boolean>) => {
        if (response?.data) {
          if (this.referido) {
            (this.referido as any).estatusReferenciaEnum = nuevo;
            (this.referido as any).EstatusReferenciaID   = nuevo;
          }
          this.showSegForm = nuevo === EstatusReferenciaEnum.Seguimiento;

          this.toastController.create({
            message: 'Estatus actualizado.',
            duration: 2200,
            color: 'success',
            position: 'top'
          }).then(t => t.present());

          this.getSeguimientos();
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

    const model: SeguimientoReferido = {
      comentario: cleanString(this.comentarioCtrl.value)!,
      referidoID: this.id!,
    };

    this.seguimientoReferidoService.save(model).pipe(
      finalize(() => this.formEnviado = false)
    ).subscribe({
      next: (response: GenericResponseDTO<boolean>) => {
        if (response?.data) {
          this.toastController.create({
            message: 'Seguimiento guardado.',
            duration: 2200,
            color: 'success',
            position: 'top'
          }).then(t => t.present());
          this.getSeguimientos();
          this.formulario.reset();
        }
      }
    });
  }

  close() { this.modalCtrl.dismiss(); }

  formatFecha(fecha: Date): string {
    const f = new Date(fecha);
    const dia = f.getDate().toString().padStart(2, '0');
    let mes = f.toLocaleString('es-MX', { month: 'long' });
    mes = mes.charAt(0).toUpperCase() + mes.slice(1);
    const anio = f.getFullYear();
    return `${dia}-${mes}-${anio}`;
  }

  mostrarTodos = false;
  trackByIndex(i: number) { return i; }
}