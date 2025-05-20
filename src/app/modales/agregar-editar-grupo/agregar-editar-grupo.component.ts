import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GrupoDTO } from 'src/Model/EmpresaDTO';
import { ApiService } from '../../shared/api.service';


@Component({
  selector: 'app-agregar-editar-grupo',
  templateUrl: './agregar-editar-grupo.component.html',
  styleUrls: ['./agregar-editar-grupo.component.css']
})
export class AgregarEditarGrupoComponent {
  grupoForm: FormGroup;

  @Input() grupo?: GrupoDTO;
  nuevo:boolean = true;

  constructor(private fb: FormBuilder,
    private apiService: ApiService
  ) {

    this.grupoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if (this.grupo) {
      this.grupoForm.patchValue({
        nombre: this.grupo?.nombre
      });
      this.nuevo = false;
    }

  }

  onSubmit(): void {
    if (this.grupoForm.valid) {
      let nuevoGrupo: GrupoDTO = this.grupoForm.value;

      if (this.grupo) {
        nuevoGrupo.id = this.grupo.id;
      }

      this.apiService.AgregarEditarGrupo(nuevoGrupo).subscribe({
        next: (data) => {
          console.log("Grupo Agregado");
        }
      });

    }
  }

}
