import { Component, OnInit } from '@angular/core';
import { EmpresaDTO } from 'src/Model/EmpresaDTO';
import { ApiService } from '../shared/api.service';
import { CommonModule } from '@angular/common';
import { ModalService } from '../shared/modal.service';
import { AgregarEditarEmpresaComponent } from '../modales/agregar-editar-empresa/agregar-editar-empresa.component';

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css']
})
export class EmpresasComponent implements OnInit {

  constructor(private apiService: ApiService,
    private modalService: ModalService
  ) { }

  empresas: EmpresaDTO[] = [];

  ngOnInit(): void {
    this.apiService.GetEmpresas().subscribe({
      next: (resultado) => {
        this.empresas = resultado;
      }
    });
  }

  AgregarEmpresa() {
    this.modalService.open(AgregarEditarEmpresaComponent);
  }

  EditarEmpresa(empresa: EmpresaDTO) {
    this.modalService.open(AgregarEditarEmpresaComponent, { empresa: empresa });
  }

}
