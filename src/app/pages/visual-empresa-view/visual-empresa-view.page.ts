import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
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
  estatus?: string | null;          // por si después lo llenan
  correo?: string | null;
  telefono?: string | null;
  domicilio?: string | null;

  descripcion?: string | null;
  giro?: string | number | null;
  grupo?: string | number | null;
  embajadorId?: number | null;

  fechaCreacion?: Date | null;
  eliminado?: boolean | null;
  fechaEliminacion?: Date | null;

  logoSrc?: string | null;          // <- imagen final (base64 o url)
};

@Component({
  selector: 'app-visual-empresa-view',
  templateUrl: './visual-empresa-view.page.html',
  styleUrls: ['./visual-empresa-view.page.scss'],
  standalone: false
})
export class VisualEmpresaViewPage implements OnInit {
  cargando = true;
  empresa?: Empresa;
  view: EmpresaView = {};

  constructor(
    private usuarioSrv: UsuarioService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

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
      // tu SQL devuelve "YYYY-MM-DD HH:mm:ss.SSS" => lo normalizo a ISO
      const s = v.includes('T') ? v : v.replace(' ', 'T');
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  private buildLogoSrc(e: any): string | null {
    // 1) si ya viene como data:image/...;base64, úsalo
    const b64: string | null = e?.logotipoBase64 ?? e?.LogotipoBase64 ?? null;
    if (b64 && /^data:image\/(png|jpeg|jpg|gif);base64,/i.test(b64)) return b64;

    // 2) si viene base64 "pelón" sin prefijo (raro, pero por si acaso)
    if (b64 && !b64.startsWith('data:image')) {
      return `data:image/png;base64,${b64}`;
    }

    // 3) si hay path/URL
    const p: string | null = e?.logotipoPath ?? e?.LogotipoPath ?? null;
    if (p) {
      if (/^https?:\/\//i.test(p)) return p;               // url absoluta
      // relativo al API (ajústalo si tu backend sirve archivos en otro host)
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
      giro: e?.giro ?? e?.Giro ?? null,
      grupo: e?.grupo ?? e?.Grupo ?? null,
      embajadorId: e?.embajadorId ?? e?.EmbajadorId ?? null,

      fechaCreacion: this.toDate(e?.fechaCreacion ?? e?.FechaCreacion),
      eliminado: (e?.eliminado ?? e?.Eliminado) ? true : false,
      fechaEliminacion: this.toDate(e?.fechaEliminacion ?? e?.FechaEliminacion),

      logoSrc: this.buildLogoSrc(e)
    };
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
            } else {
              this.fail(this.getMsg(respEmp, 'No fue posible cargar la empresa.'));
            }
          },
          error: () => this.fail('Error al consultar la empresa.'),
          complete: () => this.cargando = false
        });
      },
      error: () => this.fail('Error al consultar el usuario.')
    });
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
