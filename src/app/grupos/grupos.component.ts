import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { GrupoDTO } from 'src/Model/EmpresaDTO';

@Component({
  selector: 'app-grupos',
  templateUrl: './grupos.component.html',
  styleUrls: ['./grupos.component.css']
})
export class GruposComponent {
constructor(private apiService:ApiService) { }

  grupos:GrupoDTO[] = [];

  ngOnInit(): void {
    this.apiService.GetGrupos().subscribe({
      next:(resultado) =>{
        this.grupos = resultado;
      }
    });
  }
}
