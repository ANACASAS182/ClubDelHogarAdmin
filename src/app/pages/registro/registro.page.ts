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

  constructor(    private route: ActivatedRoute, private usuarioService:UsuarioService
) { }

  ngOnInit() {
     // Capturamos el parámetro 'codigo' de la URL
    this.route.paramMap.subscribe(params => {
      this.codigoInvitacion = params.get('codigo') || '';
      console.log('Código recibido:', this.codigoInvitacion);
      this.usuarioService.GetDatosInvitacion(this.codigoInvitacion).subscribe({
        next : (data) =>{
          this.usuarioInvita = data.nombreInvitador;
          this.email = data.correoElectronicoInvitacion;
          this.EmbajadorReferenteId = data.embajadorReferenteId;
        }
      });
    });
  }

  usuarioInvita:string = '';
  codigoInvitacion:string = '';
  email:string = '';
  EmbajadorReferenteId:number = 0;

  password: string = '';
  confirmPassword: string = '';
  aceptaTerminos: boolean = false;
  registroExitoso: boolean = false;

  formularioValido(): boolean {
    return (
      this.password.length >= 6 &&
      this.password === this.confirmPassword &&
      this.aceptaTerminos
    );
  }

  registrarUsuario() {
    if (this.formularioValido()) {


var user: UsuarioDTO = {
      email: this.email,
      password: this.password,
      codigoInvitacion:this.codigoInvitacion
      }
    this.usuarioService.RegistroUsuarioCodigoInvitacion(user).subscribe({
      next: (response: GenericResponseDTO<boolean>) => {
        if (response.success){

      // Simulación del registro
      console.log('Registro exitoso');
      this.registroExitoso = true;
        }
      }
    });



    } else {
      alert('Verifica que todos los campos estén completos correctamente.');
    }
  }

}


export interface UsuarioDTO {
    email: string;
    password?: string;
    codigoInvitacion?: string;

  }
  