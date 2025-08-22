import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../services/api.back.services/usuario.service';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { CatalogosService } from 'src/app/services/api.back.services/catalogos.service';

// Modelos con camelCase
import { CatalogoPais } from 'src/app/models/CatalogoPais';
import { CatalogoEstado } from 'src/app/models/CatalogoEstado';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false,
})
export class RegistroPage implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private catalogosService: CatalogosService
  ) {}

  // Catálogos
  paises: CatalogoPais[] = [];
  paisesFiltrados: CatalogoPais[] = [];

  estadosActuales: CatalogoEstado[] = [];   // estados del país actual (para MEX vienen del back)
  estadosFiltrados: CatalogoEstado[] = [];  // filtro por buscador

  // Selección
  paisCodigo: string = '';    // ej. 'MEX'
  estadoCodigo: string = '';  // ej. 'CHH'
  ciudad: string = '';        // ej. 'Juárez'

  // Datos del invitador / invitación
  usuarioInvita: string = '';
  codigoInvitacion: string = '';
  email: string = '';
  EmbajadorReferenteId: number = 0;

  // Campos NOT NULL
  nombres: string = '';
  apellidos: string = '';
  celular: string = '';

  // Auth
  password: string = '';
  confirmPassword: string = '';
  aceptaTerminos: boolean = false;

  // UI
  registroExitoso: boolean = false;
  cargando: boolean = false;
  enviando: boolean = false;

  // (Si tu HTML ya no usa SVG, puedes borrar estas 3)
  canvasWidth: number = 1200;
  canvasHeight: number = 800;
  transform: string = 'translate(0,0) scale(1)';

  ngOnInit() {
    // Cargar invitación
    this.route.paramMap.subscribe(params => {
      this.codigoInvitacion = params.get('codigo') || '';
      if (!this.codigoInvitacion) return;

      this.cargando = true;
      this.usuarioService.GetDatosInvitacion(this.codigoInvitacion).subscribe({
        next: (data: DatosInvitacionDTO) => {
          this.usuarioInvita = data?.nombreInvitador || '';
          this.email = (data?.correoElectronicoInvitacion || '').toLowerCase();
          this.EmbajadorReferenteId = data?.embajadorReferenteId || 0;
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
          alert('No se pudo validar el código de invitación.');
        }
      });
    });

    // Cargar países al iniciar
    this.loadPaises();
  }

  // ======= Catálogos =======
  loadPaises() {
    this.catalogosService.getCatalogoPaises().subscribe({
      next: (resp: GenericResponseDTO<CatalogoPais[]>) => {
        if (!resp?.success || !resp?.data) {
          this.paises = [];
          this.paisesFiltrados = [];
          return;
        }
        this.paises = resp.data;
        this.paisesFiltrados = [...this.paises];
      },
      error: () => {
        this.paises = [];
        this.paisesFiltrados = [];
      }
    });
  }

  // Solo para MEX llamamos al back; para otros países no hay endpoint de estados
  loadEstadosMex() {
    this.catalogosService.getCatalogoEstados().subscribe({
      next: (resp: GenericResponseDTO<CatalogoEstado[]>) => {
        if (!resp?.success || !resp?.data) {
          this.estadosActuales = [];
          this.estadosFiltrados = [];
          return;
        }
        this.estadosActuales = resp.data;
        this.estadosFiltrados = [...this.estadosActuales];
      },
      error: () => {
        this.estadosActuales = [];
        this.estadosFiltrados = [];
      }
    });
  }

  // ======= Handlers buscadores/selects =======
  onPaisSearch(ev: any) {
    const q = (ev?.target?.value || '').toString().trim().toLowerCase();
    if (!q) {
      this.paisesFiltrados = [...this.paises];
      return;
    }
    this.paisesFiltrados = this.paises.filter(p =>
      (p.codigo || '').toLowerCase().includes(q) ||
      (p.descripcion || '').toLowerCase().includes(q)
    );
  }

  onPaisChange(_: any) {
    // Reset de estado cuando cambie el país
    this.estadoCodigo = '';

    // Cargar estados solo si es MEX
    if (this.paisCodigo === 'MEX') {
      this.loadEstadosMex();
    } else {
      this.estadosActuales = [];
      this.estadosFiltrados = [];
    }
  }

  onEstadoSearch(ev: any) {
  const q = (ev?.target?.value || '').toString().trim().toLowerCase();
  if (!q) {
    this.estadosFiltrados = [...this.estadosActuales];
    return;
  }
  this.estadosFiltrados = this.estadosActuales.filter(e =>
    (e.codigo || '').toLowerCase().includes(q) ||
    (e.nombre || '').toLowerCase().includes(q)
  );
}


  /** Validaciones mínimas */
  formularioValido(): boolean {
    const nombreOk   = this.nombres.trim().length >= 2;
    const apellidoOk = this.apellidos.trim().length >= 2;

    const celDigits  = this.celular.replace(/\D/g, '');
    const celularOk  = celDigits.length >= 8 && celDigits.length <= 15;

    const passOk     = this.password.length >= 6 && this.password === this.confirmPassword;

    const paisOk     = !!this.paisCodigo;
    const ciudadOk   = this.ciudad.trim().length >= 2;

    // Estado requerido SOLO si país = MEX (porque sí tienes catálogo)
    const estadoOk   = this.paisCodigo === 'MEX' ? !!this.estadoCodigo : true;

    return (
      !!this.email &&
      !!this.codigoInvitacion &&
      nombreOk &&
      apellidoOk &&
      celularOk &&
      paisOk &&
      estadoOk &&
      ciudadOk &&
      passOk &&
      this.aceptaTerminos &&
      !this.cargando &&
      !this.enviando
    );
  }

  registrarUsuario() {
    if (!this.formularioValido()) {
      alert('Verifica que todos los campos estén completos correctamente.');
      return;
    }

    this.enviando = true;

    // Resolver IDs por CÓDIGO (camelCase)
    const paisSel   = this.paises.find(p => p.codigo === this.paisCodigo) || null;
    const estadoSel = this.estadosActuales.find(e => e.codigo === this.estadoCodigo) || null;

    const user: UsuarioDTO = {
      email: this.email.trim().toLowerCase(),
      password: this.password,
      codigoInvitacion: this.codigoInvitacion,
      nombres: this.nombres.trim(),
      apellidos: this.apellidos.trim(),
      celular: this.celular.replace(/\D/g, ''),

      // NUEVOS (usa camelCase en los modelos)
      catalogoPaisId: paisSel?.id,
      catalogoEstadoId: this.paisCodigo === 'MEX' ? (estadoSel?.id ?? undefined) : undefined,
      ciudad: this.ciudad.trim(),
      estadoTexto: this.paisCodigo === 'MEX' ? (estadoSel?.nombre || '') : ''
    };

    this.usuarioService.RegistroUsuarioCodigoInvitacion(user).subscribe({
      next: (response: GenericResponseDTO<boolean>) => {
        this.enviando = false;
        if (response?.success) {
          this.registroExitoso = true;
        } else {
          alert(response?.message || 'No se pudo completar el registro.');
        }
      },
      error: (err) => {
        this.enviando = false;
        alert('Error al registrar: ' + (err?.error?.message || 'intenta más tarde'));
      }
    });
  }
}

/** DTO que envías al backend (AMPLIADO) */
export interface UsuarioDTO {
  email: string;
  password?: string;
  codigoInvitacion?: string;
  nombres: string;
  apellidos: string;
  celular: string;

  // NUEVOS
  catalogoPaisId?: number;
  catalogoEstadoId?: number;
  ciudad?: string;
  estadoTexto?: string;
}

interface DatosInvitacionDTO {
  nombreInvitador: string;
  correoElectronicoInvitacion: string;
  embajadorReferenteId: number;
}
