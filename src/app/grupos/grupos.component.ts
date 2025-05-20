import { Component } from '@angular/core';
import { ApiService } from '../shared/api.service';
import { GrupoDTO } from 'src/Model/EmpresaDTO';
import { ModalService } from '../shared/modal.service';
import { AgregarEditarGrupoComponent } from '../modales/agregar-editar-grupo/agregar-editar-grupo.component';

@Component({
  selector: 'app-grupos',
  templateUrl: './grupos.component.html',
  styleUrls: ['./grupos.component.css']
})
export class GruposComponent {
constructor(
  private apiService:ApiService, 
  public modalService: ModalService
) { }

  grupos:GrupoDTO[] = [];

  ngOnInit(): void {
    this.apiService.GetGrupos().subscribe({
      next:(resultado) =>{
        this.grupos = resultado;
      }
    });
  }



    AgregarGrupo(){
      this.modalService.open(AgregarEditarGrupoComponent);
    }

    EditarGrupo(grupo:GrupoDTO){
      this.modalService.open(AgregarEditarGrupoComponent, {grupo:grupo});
    }

}
