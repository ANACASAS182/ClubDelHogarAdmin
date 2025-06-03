import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { sinEspaciosValidator } from 'src/app/classes/custom.validars';
import { cleanString } from 'src/app/classes/string-utils';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { GrupoDTO } from 'src/app/models/DTOs/GrupoDTO';
import { GrupoService } from 'src/app/services/api.back.services/grupo.service';

@Component({
  selector: 'app-modal.grupo.form',
  templateUrl: './modal.grupo.form.component.html',
  styleUrls: ['./modal.grupo.form.component.scss'],
  standalone:true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class ModalGrupoFormComponent  implements OnInit {

  formulario: FormGroup;
  btnName: string = "AGREGAR";
  title: string = "AGREGAR";
  @Input() id?: number = undefined;

  formEnviado: boolean = false;

  constructor(private fb: FormBuilder,
    private grupoService: GrupoService,
    private toastController: ToastController,
    private modalCtrl: ModalController) {

    this.formulario = this.fb.group({
      nombre: ["", [Validators.required, sinEspaciosValidator()]],
    });
  }

  ngOnInit() {
    if (this.id != undefined) {
      this.btnName = "GUARDAR";
      this.title = "MODIFICAR";
      this.grupoService.getByID(this.id).subscribe({
        next: (response: GenericResponseDTO<GrupoDTO>) => {
          this.formulario.patchValue({
            nombre: response.data.nombre,
          });
        }
      });
    }
  }

  enviarFormulario() {
    if (this.formEnviado) return;

    this.formEnviado = true;

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.formEnviado = false;
      return;
    }

    var model: GrupoDTO = {
      nombre: cleanString(this.formulario.controls["nombre"].value)!,
    };

    if (this.id != undefined) {
      model.id = this.id;
    }

    this.grupoService.save(model).pipe(
      finalize(() => {
        this.formEnviado = false;
      })
    ).subscribe({
      next: (response: GenericResponseDTO<boolean>) => {
        if (response) {
          this.toastController.create({
            message: "Grupo guardado.",
            duration: 3000,
            color: "success",
            position: 'top'
          }).then(toast => toast.present());
          this.modalCtrl.dismiss(true);
        }
      }
    });

  }

  getControl(name: string) {
    return this.formulario.get(name);
  }

  close(){
    this.modalCtrl.dismiss();
  }

}
