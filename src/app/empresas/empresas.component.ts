import { Component, OnInit } from '@angular/core';
import { EmpresaDTO } from 'src/Model/EmpresaDTO';
import { ApiService } from '../api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css']
})
export class EmpresasComponent implements OnInit {

  constructor(private apiService:ApiService) { }

  empresas:EmpresaDTO[] = [];

  ngOnInit(): void {
    this.apiService.GetEmpresas().subscribe({
      next:(resultado) =>{
        this.empresas = resultado;
      }
    });
  }

}
