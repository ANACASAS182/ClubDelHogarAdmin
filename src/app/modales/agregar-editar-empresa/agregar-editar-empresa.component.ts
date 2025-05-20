import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/shared/api.service';
import { EmpresaDTO } from 'src/Model/EmpresaDTO';

@Component({
  selector: 'app-agregar-editar-empresa',
  templateUrl: './agregar-editar-empresa.component.html',
  styleUrls: ['./agregar-editar-empresa.component.css']
})
export class AgregarEditarEmpresaComponent {
  empresaForm: FormGroup;

  @Input() empresa?: EmpresaDTO;
  nuevo:boolean = true;

  constructor(private fb: FormBuilder,
    private apiService: ApiService
  ) {

    this.empresaForm = this.fb.group({
      rfc: ['', [Validators.required, Validators.minLength(3)]],
      razonSocial: ['', [Validators.required, Validators.minLength(3)]],
      nombreComercial: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if (this.empresa) {
      this.empresaForm.patchValue({
        nombre: this.empresa?.razonSocial
      });
      this.nuevo = false;
    }

  }

  onSubmit(): void {
    if (this.empresaForm.valid) {
      let nuevaEmpresa: EmpresaDTO = this.empresaForm.value;

      if (this.empresa) {
        nuevaEmpresa.id = this.empresa.id;
      }

      this.apiService.AgregarEditarEmpresa(nuevaEmpresa).subscribe({
        next: (data) => {
          console.log("Empresa agregada");
        }
      });

    }
  }
}
