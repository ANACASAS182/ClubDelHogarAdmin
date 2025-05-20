import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/api.service';
import { EmbajadorDTO } from '../../Model/EmpresaDTO';

@Component({
  selector: 'app-embajadores',
  templateUrl: './embajadores.component.html',
  styleUrls: ['./embajadores.component.css']
})
export class EmbajadoresComponent implements OnInit {

  constructor(private apiService:ApiService) { }
  
    embajadores:EmbajadorDTO[] = [];
  
    ngOnInit(): void {
      this.apiService.GetEmbajadores().subscribe({
        next:(resultado) =>{
          this.embajadores = resultado;
        }
      });
    }

}
