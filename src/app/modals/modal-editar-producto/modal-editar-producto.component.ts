import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

import { ProductoService } from '../../services/api.back.services/producto.service';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';

type ProductoSaveDTO = {
  id?: number;
  nombre: string;
  descripcion: string;
  tipoComision: number;
  fechaCaducidad?: Date | null;
  nivel1?: number;
  nivel2?: number;
  nivel3?: number;
  nivel4?: number;
  nivelInvitacion?: number;
  nivelMaster?: number;
};

@Component({
  selector: 'app-modal-editar-producto',
  standalone: true,
  imports:[CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  templateUrl: './modal-editar-producto.component.html',
  styleUrls: ['./modal-editar-producto.component.scss'],
})
export class ModalEditarProductoComponent implements OnInit {

  @Input() productoId:number = 0;

  isSocio = false;          // rol socio
  isReadOnly = true;        // admin puede alternar edición
  roleLoaded = false;       // evita “parpadeo” de controles mientras carga el rol
  saving = false;

  form!: FormGroup;
  totalCalculado = 0;

  private original!: any;   // snapshot para "Descartar"

  // rangos para ion-datetime
  minVigencia = '1900-01-01';
  maxVigencia = '2100-12-31';

  get unidad(): 'MXN' | '%' {
    return this.form?.value?.tipoComision === 1 ? '%' : 'MXN';
  }

  get estaVigente(): boolean {
    const v = this.form?.value?.fechaCaducidad;
    if (!v) return true; // sin fecha => vigente
    const d = new Date(v); d.setHours(0,0,0,0);
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    return d >= hoy;
  }

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private productoService:ProductoService,
    private usuarioService: UsuarioService,
  ) {}

  ngOnInit() {
    // formulario
    this.form = this.fb.group({
      id: [0],
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: ['', [Validators.maxLength(2000)]],
      tipoComision: [1], // 1 = %
      nivel1: [0],
      nivel2: [0],
      nivel3: [0],
      nivel4: [0],
      nivelInvitacion: [0],
      nivelMaster: [0],
      fechaCaducidad: [null],  // editable
      // solo lectura
      vigenciaLetra: [''],
      creacionLetra: ['']
    });

    this.form.valueChanges.subscribe(() => this.recalcularTotal());

    // rol usuario
    this.usuarioService.getUsuario(true).subscribe({
      next: (res) => {
        const rolEnum = res?.data?.roles?.enumValue;
        this.isSocio = (rolEnum === 2);
        this.isReadOnly = true; // por defecto
        this.roleLoaded = true;
      },
      error: () => { this.isSocio = false; this.roleLoaded = true; }
    });

    this.loadData();
  }

  // ===== helpers de UI =====
  formatMonto(n: number | string | null | undefined): string {
    const val = Number(n || 0);
    return this.form?.value?.tipoComision === 1
      ? `${val.toFixed(2)}%`
      : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
  }

  onToggleChange(ev: CustomEvent) {
    this.isReadOnly = !ev.detail.checked;
    // no ensuciar el form por cambios visuales
    setTimeout(() => this.form.updateValueAndValidity(), 0);
  }

  // ===== datos =====
  private loadData(){
    this.productoService.getProductoById(this.productoId).subscribe({
      next:(data: any) =>{
        const iso = data?.vigencia ? new Date(data.vigencia).toISOString() : null;

        // snapshot original
        this.original = {
          id: data?.id ?? 0,
          nombre: data?.nombre ?? '',
          descripcion: data?.descripcion ?? '',
          tipoComision: data?.tipoComision ?? 1,
          nivel1: data?.nivel1 ?? 0,
          nivel2: data?.nivel2 ?? 0,
          nivel3: data?.nivel3 ?? 0,
          nivel4: data?.nivel4 ?? 0,
          nivelInvitacion: data?.nivelInvitacion ?? 0,
          nivelMaster: data?.nivelMaster ?? 0,
          fechaCaducidad: iso,
          vigenciaLetra: data?.vigenciaLetra ?? '',
          creacionLetra: data?.creacionLetra ?? '',
        };

        // reset sin disparar valueChanges
        this.form.reset(this.original, { emitEvent: false });
        this.recalcularTotalFrom(this.original);
        this.form.markAsPristine();
        this.form.markAsUntouched();
      }
    });
  }

  reset() {
    if (!this.original) return;
    this.form.reset(this.original, { emitEvent: false });
    this.recalcularTotalFrom(this.original);
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.isReadOnly = true; // vuelve a lectura
  }

  private recalcularTotalFrom(v: any) {
    this.totalCalculado =
      Number(v.nivel1 || 0) +
      Number(v.nivel2 || 0) +
      Number(v.nivel3 || 0) +
      Number(v.nivel4 || 0) +
      Number(v.nivelInvitacion || 0) +
      Number(v.nivelMaster || 0);
  }

  private recalcularTotal() {
    this.recalcularTotalFrom(this.form.getRawValue());
  }

  guardar() {
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const fechaCad = v.fechaCaducidad ? new Date(v.fechaCaducidad) : null;

    const payload: ProductoSaveDTO = {
      id: v.id,
      nombre: v.nombre,
      descripcion: v.descripcion,
      tipoComision: v.tipoComision,
      fechaCaducidad: fechaCad,
      nivel1: v.nivel1,
      nivel2: v.nivel2,
      nivel3: v.nivel3,
      nivel4: v.nivel4,
      nivelInvitacion: v.nivelInvitacion,
      nivelMaster: v.nivelMaster
    };

    this.saving = true;
    this.productoService.save(payload as any).subscribe({
      next: async (res) => {
        this.saving = false;
        if (res?.success) {
          await this.modalCtrl.dismiss(true);
        }
      },
      error: () => { this.saving = false; }
    });
  }
}
