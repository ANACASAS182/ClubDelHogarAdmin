import { Component, Input, OnInit } from '@angular/core';
import { ProductoService } from '../../services/api.back.services/producto.service';
import { Producto } from 'src/app/models/Producto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-editar-producto',
  imports:[CommonModule],
  templateUrl: './modal-editar-producto.component.html',
  styleUrls: ['./modal-editar-producto.component.scss'],
})
export class ModalEditarProductoComponent  implements OnInit {

  @Input() productoId:number = 0;
  producto?:ProductoDisplay;

  constructor(private productoService:ProductoService) { 
    
  }

  ngOnInit() {
    this.loadData();
  }

  loadData(){
    this.productoService.getProductoById(this.productoId).subscribe({
      next:(data) =>{
        this.producto = data;

        
      },
      error:(err) =>{},
      complete:() =>{},
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
