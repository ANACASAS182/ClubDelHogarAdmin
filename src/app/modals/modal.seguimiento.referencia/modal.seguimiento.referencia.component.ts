import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
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

  private serverStatus: number | null = null;
  private updatingStatus = false;

  // ====== Forms ======
  formulario: FormGroup = this.fb.group({
    comentario: ['', [Validators.required, sinEspaciosValidator()]],
  });

  // IonSelect trabaja con string; guardamos el status como string
  formStatus: FormGroup = this.fb.group({
    status: [null as string | null, Validators.required],
  });

  formEnviado = false;

  // ====== Datos ======
  numSeguimientos = 0;
  seguimientos: SeguimientoReferido[] = [];
  referido?: ReferidoDTO;

  estatus = getEstatusReferenciaOptions();
  estatusReferenciaEnum = EstatusReferenciaEnum;

  // controla “Agregar seguimiento”
  showSegForm = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private toastController: ToastController,
    private loadingCtrl: LoadingController,
    private referidoService: ReferidoService,
    private seguimientoReferidoService: SeguimientoReferidoService,
    private cdr: ChangeDetectorRef
  ) {}

  // ====== Getters ======
  get statusCtrl(): FormControl<string | null> {
    return this.formStatus.get('status') as FormControl<string | null>;
  }
  get comentarioCtrl(): FormControl<string> {
    return this.formulario.get('comentario') as FormControl<string>;
  }
  get isClosed(): boolean {
    return String(this.serverStatus) === String(EstatusReferenciaEnum.Cerrado);
  }

  get serverStatusStr(): string | null {
  return this.serverStatus == null ? null : String(this.serverStatus);
  }
  get seguimientoStr(): string {
    return String(this.estatusReferenciaEnum.Seguimiento);
  }
  get isSelectedSeguimiento(): boolean {
    return String(this.statusCtrl.value) === this.seguimientoStr;
  }

  getControl(name: string) { return this.formulario.get(name); }

  // Helper: si el back manda raro, normalizamos
  private toNumOrNull(v: any): number | null {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando datos...' });
    await loading.present();
    try {
      const refResponse = await firstValueFrom(this.referidoService.getByID(this.id!));
      this.referido = refResponse.data;

      const r: any = this.referido ?? {};
      const currentStatusNum =
        this.toNumOrNull(r.estatusReferenciaID) ??
        this.toNumOrNull(r.EstatusReferenciaID) ??
        this.toNumOrNull(r.estatusReferenciaEnum) ??
        this.toNumOrNull(r.EstatusReferenciaEnum);

      this.serverStatus = currentStatusNum ?? null;                // 👈 guardamos el estatus confirmado
      const statusStr = currentStatusNum != null ? String(currentStatusNum) : null;

      this.formStatus.patchValue({ status: statusStr }, { emitEvent: false });
      this.statusCtrl.updateValueAndValidity({ emitEvent: false });

      this.showSegForm = String(this.statusCtrl.value) === String(EstatusReferenciaEnum.Seguimiento);

      // si cambian el select, solo controlamos la UI (el back se actualiza en el botón)
      this.statusCtrl.valueChanges.subscribe(v => {
        this.showSegForm = String(v) === String(EstatusReferenciaEnum.Seguimiento);
      });

      this.getSeguimientos();
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

  // Deshabilita “Creado” cuando NO es el estatus actual (para no impedir ver el valor vigente)
  isCreadoDisabled(valor: number): boolean {
    return String(valor) === String(EstatusReferenciaEnum.Creado) &&
           this.statusCtrl.value !== String(EstatusReferenciaEnum.Creado);
  }

  // ====== Actualizar estatus ======
  enviarFormularioStatus() {
    if (this.formEnviado || this.isClosed) {
      if (this.isClosed) {
        this.toastController.create({
          message: 'La referencia está cerrada; no puede cambiarse el estatus.',
          duration: 2200, color: 'warning', position: 'top'
        }).then(t => t.present());
      }
      return;
    }

    this.formEnviado = true;
    if (this.formStatus.invalid) {
      this.formStatus.markAllAsTouched();
      this.formEnviado = false;
      return;
    }

    // Convertir a number para el backend
    const nuevo = Number(this.statusCtrl.value);
    const model: EstatusReferidoDTO = { id: this.id!, estatusReferenciaEnum: nuevo };

    this.referidoService.updateEstatus(model).pipe(
      finalize(() => this.formEnviado = false)
    ).subscribe({
      next: (response: GenericResponseDTO<boolean>) => {
        if (response?.data) {
          this.serverStatus = nuevo;                             // 👈 ahora el servidor ya quedó así
          if (this.referido) {
            (this.referido as any).estatusReferenciaEnum = nuevo;
            (this.referido as any).EstatusReferenciaID   = nuevo;
          }
          this.showSegForm = String(nuevo) === String(EstatusReferenciaEnum.Seguimiento);

          this.toastController.create({
            message: 'Estatus actualizado.',
            duration: 2200, color: 'success', position: 'top'
          }).then(t => t.present());

          this.getSeguimientos();
        }
      }
    });
  }

  // ====== Agregar seguimiento manual ======
  async enviarFormulario() {
    if (this.formEnviado || this.isClosed) {
      if (this.isClosed) {
        this.toastController.create({
          message: 'La referencia está cerrada; no se pueden agregar seguimientos.',
          duration: 2200, color: 'warning', position: 'top'
        }).then(t => t.present());
      }
      return;
    }

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const selected = Number(this.statusCtrl.value);
    const server   = Number(this.serverStatus);

    try {
      this.formEnviado = true;

      // 1) Si el usuario eligió "Seguimiento" pero el servidor sigue en "Creado",
      //    primero actualizamos el estatus en el back y luego guardamos el seguimiento.
      if (String(selected) === String(EstatusReferenciaEnum.Seguimiento) &&
          String(server)   !== String(EstatusReferenciaEnum.Seguimiento)) {

        if (!this.updatingStatus) {
          this.updatingStatus = true;
          const model: EstatusReferidoDTO = { id: this.id!, estatusReferenciaEnum: selected };
          const ok = await firstValueFrom(this.referidoService.updateEstatus(model));
          this.updatingStatus = false;

          if (!ok?.data) throw new Error('No se pudo actualizar el estatus.');
          this.serverStatus = selected;
        }
      }

      // 2) Guardar el seguimiento
      const modelSeg: SeguimientoReferido = {
        comentario: cleanString(this.comentarioCtrl.value)!,
        referidoID: this.id!,
      };

      const resp = await firstValueFrom(this.seguimientoReferidoService.save(modelSeg));
      if (resp?.data) {
        this.toastController.create({
          message: 'Seguimiento guardado.',
          duration: 2200, color: 'success', position: 'top'
        }).then(t => t.present());

        this.getSeguimientos();
        this.formulario.reset();
      }
    } catch (err) {
      console.error(err);
      this.toastController.create({
        message: 'Error: intenta actualizar el estatus y vuelve a enviar.',
        duration: 2500, color: 'danger', position: 'top'
      }).then(t => t.present());
    } finally {
      this.formEnviado = false;
    }
  }

  close() { this.modalCtrl.dismiss(); }

  // ====== Util ======
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