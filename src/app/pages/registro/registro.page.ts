import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../services/api.back.services/usuario.service';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false,
})
export class RegistroPage implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private usuarioService: UsuarioService
  ) {}

  // Datos del invitador / invitación
  usuarioInvita: string = '';
  codigoInvitacion: string = '';
  email: string = '';
  EmbajadorReferenteId: number = 0;

  // Auth
  password: string = '';
  confirmPassword: string = '';
  aceptaTerminos: boolean = false;

  // UI
  registroExitoso: boolean = false;
  cargando: boolean = false;
  enviando: boolean = false;

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
  }

  /** Validaciones mínimas */
  formularioValido(): boolean {
    const emailOk = !!this.email;
    const passOk = this.password.length >= 6 && this.password === this.confirmPassword;

    return (
      emailOk &&
      !!this.codigoInvitacion &&
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

    const user: UsuarioDTO = {
      email: this.email.trim().toLowerCase(),
      password: this.password,
      codigoInvitacion: this.codigoInvitacion
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

/** DTO que envías al backend */
export interface UsuarioDTO {
  email: string;
  password?: string;
  codigoInvitacion?: string;
}

interface DatosInvitacionDTO {
  nombreInvitador: string;
  correoElectronicoInvitacion: string;
  embajadorReferenteId: number;
}