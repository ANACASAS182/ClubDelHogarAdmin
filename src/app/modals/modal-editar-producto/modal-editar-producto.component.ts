import { Component, Input, OnInit } from '@angular/core';
import { ProductoService } from '../../services/api.back.services/producto.service';
import { Producto } from 'src/app/models/Producto';
import { CommonModule } from '@angular/common';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';

@Component({
  selector: 'app-modal-editar-producto',
  imports:[CommonModule],
  templateUrl: './modal-editar-producto.component.html',
  styleUrls: ['./modal-editar-producto.component.scss'],
})
export class ModalEditarProductoComponent  implements OnInit {

  @Input() productoId:number = 0;
  producto?:ProductoDisplay;

  isSocio = false; // rol = 2

  constructor(
    private productoService:ProductoService,
    private usuarioService: UsuarioService,
  ) {}

  ngOnInit() {
    this.loadData();
    this.usuarioService.getUsuario(true).subscribe({
      next: (res) => {
        const rolEnum = res?.data?.roles?.enumValue;
        this.isSocio = (rolEnum === 2);
      },
      error: () => { this.isSocio = false; } // si falla, muestra todo excepto el caso Socio
    });
  }

  loadData(){
    this.productoService.getProductoById(this.productoId).subscribe({
      next:(data) =>{
        this.producto = data;
      }
    });
  }
}

export interface ProductoDisplay{
  id?:number;
  nombre?:string;
  tipoComision?:number;
  descripcion?:string;
  vigenciaLetra?:string;
  creacionLetra?:string;
  nivel1?:number;
  nivel2?:number;
  nivel3?:number;
  nivel4?:number;
  nivelInvitacion?:number;
  nivelMaster?:number;
  totalComision?:number;
}
