import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { Empresa } from 'src/app/models/Empresa';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { Usuario } from 'src/app/models/Usuario';
import { environment } from 'src/environments/environment';

type EmpresaView = {
  id?: number | null;
  rfc?: string | null;
  razonSocial?: string | null;
  nombreComercial?: string | null;
  estatus?: string | null;
  correo?: string | null;
  telefono?: string | null;
  domicilio?: string | null;

  descripcion?: string | null;
  giro?: string | number | null;
  giroNombre?: string | null;          // 👈 nombre del giro si está disponible
  grupo?: string | number | null;
  grupoNombre?: string | null;         // 👈 nombre del grupo si está disponible
  embajadorId?: number | null;
  embajadorNombre?: string | null;     // 👈 nombre del embajador si está disponible

  fechaCreacion?: Date | null;
  eliminado?: boolean | null;
  fechaEliminacion?: Date | null;

  logoSrc?: string | null;
};

@Component({
  selector: 'app-visual-empresa-view',
  templateUrl: './visual-empresa-view.page.html',
  styleUrls: ['./visual-empresa-view.page.scss'],
  standalone: false
})
export class VisualEmpresaViewPage implements OnInit {
  cargando = true;
  guardando = false;

  empresa?: Empresa;
  view: EmpresaView = {};

  formFiscales!: FormGroup;

  constructor(
    private usuarioSrv: UsuarioService,
    private alertCtrl: AlertController,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargar();
  }

  // ====== Helpers de respuesta
  private isOk<T>(resp: GenericResponseDTO<T>): boolean {
    const r: any = resp as any;
    return r?.estatus === 1 || r?.success === true || r?.ok === true;
  }
  private getMsg<T>(resp: GenericResponseDTO<T>, fallback: string): string {
    const r: any = resp as any;
    return r?.mensaje ?? r?.message ?? r?.error ?? fallback;
  }

  private toDate(v: any): Date | null {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v === 'number') return new Date(v);
    if (typeof v === 'string') {
      const s = v.includes('T') ? v : v.replace(' ', 'T');
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  private buildLogoSrc(e: any): string | null {
    const b64: string | null = e?.logotipoBase64 ?? e?.LogotipoBase64 ?? null;
    if (b64 && /^data:image\/(png|jpeg|jpg|gif);base64,/i.test(b64)) return b64;
    if (b64 && !b64.startsWith('data:image')) return `data:image/png;base64,${b64}`;

    const p: string | null = e?.logotipoPath ?? e?.LogotipoPath ?? null;
    if (p) {
      if (/^https?:\/\//i.test(p)) return p;
      return `${environment.apiUrl}${p.startsWith('/') ? '' : '/'}${p}`;
    }
    return null;
  }

  private normalizeEmpresa(e: any): EmpresaView {
    return {
      id: e?.id ?? e?.ID ?? null,
      rfc: e?.rfc ?? e?.RFC ?? null,
      razonSocial: e?.razonSocial ?? e?.RazonSocial ?? null,
      nombreComercial: e?.nombreComercial ?? e?.NombreComercial ?? null,
      estatus: e?.estatus ?? e?.Estatus ?? null,

      correo: e?.correo ?? e?.Correo ?? e?.email ?? e?.Email ?? null,
      telefono: e?.telefono ?? e?.Telefono ?? e?.tel ?? null,
      domicilio: e?.domicilio ?? e?.Domicilio ?? e?.direccion ?? e?.Direccion ?? null,

      descripcion: e?.descripcion ?? e?.Descripcion ?? null,

      // Giro: acepta nombre si viene, si no, valor crudo
      giro: e?.giro ?? e?.Giro ?? null,
      giroNombre: e?.giroNombre ?? e?.GiroNombre ?? null,

      // Grupo: nombre + id si existen
      grupo: e?.grupo ?? e?.Grupo ?? null,
      grupoNombre: e?.grupoNombre ?? e?.GrupoNombre ?? null,

      // Embajador: nombre + id
      embajadorId: e?.embajadorId ?? e?.EmbajadorId ?? e?.EmbajadorID ?? null,
      embajadorNombre: e?.embajadorNombre ?? e?.EmbajadorNombre ?? null,

      fechaCreacion: this.toDate(e?.fechaCreacion ?? e?.FechaCreacion),
      eliminado: (e?.eliminado ?? e?.Eliminado) ? true : false,
      fechaEliminacion: this.toDate(e?.fechaEliminacion ?? e?.FechaEliminacion),

      logoSrc: this.buildLogoSrc(e)
    };
  }

  private initForm() {
    this.formFiscales = this.fb.group({
      rfc: ['', [Validators.required, Validators.pattern(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{2,3}$/i)]],
      razonSocial: ['', [Validators.required]],
      cp: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      metodoPago: ['', [Validators.required]],
      usoCfdi: ['', [Validators.required]]
    });
  }

  fc(name: string) {
    return this.formFiscales.get(name)!;
  }

  private cargar() {
    this.cargando = true;

    this.usuarioSrv.getUsuario(true).subscribe({
      next: (respUser: GenericResponseDTO<Usuario>) => {
        if (!this.isOk(respUser) || !(respUser as any)?.data) {
          this.fail(this.getMsg(respUser, 'No fue posible identificar al usuario actual.'));
          return;
        }
        const u = (respUser as any).data as any;
        const usuarioId: number | undefined = u?.id ?? u?.ID ?? u?.Id;
        if (!usuarioId) {
          this.fail('El usuario no trae un ID válido.');
          return;
        }

        this.usuarioSrv.getEmpresaByUsuario(usuarioId).subscribe({
          next: (respEmp: GenericResponseDTO<Empresa>) => {
            if (this.isOk(respEmp)) {
              this.empresa = (respEmp as any).data as Empresa;
              this.view = this.normalizeEmpresa(this.empresa);

              // Prellenar datos fiscales si ya existen
              this.formFiscales.patchValue({
                rfc: this.view.rfc || '',
                razonSocial: this.view.razonSocial || '',
                cp: (this.empresa as any)?.CP || (this.empresa as any)?.Cp || '',
                metodoPago: (this.empresa as any)?.MetodoPago || '',
                usoCfdi: (this.empresa as any)?.UsoCFDI || (this.empresa as any)?.UsoCfdi || ''
              });
            } else {
              this.fail(this.getMsg(respEmp, 'No fue posible cargar la empresa.'));
            }
          },
          error: () => this.fail('Error al consultar la empresa.'),
          complete: () => (this.cargando = false)
        });
      },
      error: () => this.fail('Error al consultar el usuario.')
    });
  }

  async submitFiscales() {
    if (this.formFiscales.invalid || !this.view.id) {
      this.formFiscales.markAllAsTouched();
      return;
    }

    const dto = {
      empresaId: this.view.id,
      rfc: this.fc('rfc').value?.toUpperCase(),
      razonSocial: this.fc('razonSocial').value,
      cp: this.fc('cp').value,
      metodoPago: this.fc('metodoPago').value,
      usoCfdi: this.fc('usoCfdi').value
    };

    this.guardando = true;
    /*this.usuarioSrv.updateDatosFiscales(dto).subscribe({
      next: async (resp: GenericResponseDTO<boolean>) => {
        this.guardando = false;
        if (this.isOk(resp)) {
          const a = await this.alertCtrl.create({ header: 'Listo', message: 'Datos fiscales guardados.', buttons: ['OK'] });
          a.present();
        } else {
          this.fail(this.getMsg(resp, 'No fue posible guardar los datos fiscales.'));
        }
      },
      error: () => {
        this.guardando = false;
        this.fail('Error al guardar los datos fiscales.');
      }
    });*/
  }

  async fail(msg: string) {
    this.cargando = false;
    const a = await this.alertCtrl.create({ header: 'Ups', message: msg, buttons: ['OK'] });
    a.present();
  }

  refrescar(ev: any) {
    this.cargar();
    setTimeout(() => ev?.target?.complete?.(), 500);
  }
}