import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { finalize, firstValueFrom } from 'rxjs';
import { sinEspaciosValidator } from 'src/app/classes/custom.validars';
import { cleanString } from 'src/app/classes/string-utils';
import { EmpresaCreateDTO } from 'src/app/models/DTOs/EmpresaCreateDTO';
import { EmpresaGrupoDTO } from 'src/app/models/DTOs/EmpresaGrupoDTO';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { GrupoDTO } from 'src/app/models/DTOs/GrupoDTO';
import { GrupoEmpresaDTO } from 'src/app/models/DTOs/GrupoEmpresaDTO';
import { Empresa } from 'src/app/models/Empresa';
import { EmpresaGrupoService } from 'src/app/services/api.back.services/empresa.grupo.service';
import { EmpresaService } from 'src/app/services/api.back.services/empresa.service';
import { GrupoService } from 'src/app/services/api.back.services/grupo.service';

@Component({
  selector: 'app-modal.empresa.form',
  templateUrl: './modal.empresa.form.component.html',
  styleUrls: ['./modal.empresa.form.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class ModalEmpresaFormComponent implements OnInit {

  formulario: FormGroup;
  btnName: string = "AGREGAR";
  title: string = "AGREGAR";
  formEnviado: boolean = false;
  imagenBase64: string | undefined = undefined;

  grupos: GrupoDTO[] = []
  gruposSelected: GrupoEmpresaDTO[] = [];

  @Input() id?: number = undefined;

  constructor(private fb: FormBuilder,
    private empresaService: EmpresaService,
    private empresaGrupoService: EmpresaGrupoService,
    private grupoService: GrupoService,
    private toastController: ToastController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController) {

    this.formulario = this.fb.group({
      rfc: ["", [Validators.required, Validators.pattern(/^([A-ZÑ&]{3,4}) ?-? ?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?-? ?([A-Z\d]{2})([A\d])$/)]],
      razonSocial: ["", [Validators.required, sinEspaciosValidator()]],
      nombreComercial: ["", [Validators.required, sinEspaciosValidator()]],
      descripcion: [""],
      itemSeleccionado: [""]
    });
  }


  async ngOnInit() {

    const loading = await this.loadingCtrl.create({
      message: 'Cargando datos...'
    });
    await loading.present();

    try {
      // Cargar 
      const responsegrupos = await firstValueFrom(this.grupoService.getAllGrupos());
      this.grupos = responsegrupos?.data || [];

      if (this.id != undefined) {
        this.btnName = "GUARDAR";
        this.title = "MODIFICAR";
        this.empresaService.getByID(this.id).subscribe({
          next: (response: GenericResponseDTO<Empresa>) => {
            this.formulario.patchValue({
              rfc: response.data.rfc,
              razonSocial: response.data.razonSocial,
              nombreComercial: response.data.nombreComercial,
              descripcion: response.data.descripcion
            });
            this.imagenBase64 = response.data.logotipoBase64;
          }
        });

        this.empresaGrupoService.getAllGruposByEmpresa(this.id).subscribe({
          next: (response: GenericResponseDTO<EmpresaGrupoDTO[]>) => {
            response.data.forEach(element => {
              var model: GrupoEmpresaDTO = {
              id: element.id,
              grupoID: element.grupoID,
              nombreGrupo: element.nombreGrupo,
              deleted: false
            };
            this.gruposSelected.push(model);
            });
          }
        });
      }

    } catch (error) {
      console.error('Error al cargar datos', error);
    } finally {
      loading.dismiss();
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

    if (!this.imagenBase64) {
      this.toastController.create({
        message: "No se agrego un logotipo",
        duration: 5000,
        color: "warning",
        position: 'top'
      }).then(toast => toast.present());
      // return;
    }
    
    var model: EmpresaCreateDTO = {
      rfc: cleanString(this.formulario.controls["rfc"].value.trim())!.toUpperCase(),
      razonSocial: cleanString(this.formulario.controls["razonSocial"].value)!,
      nombreComercial: cleanString(this.formulario.controls["nombreComercial"].value)!,
      descripcion: cleanString(this.formulario.controls["descripcion"].value),
      logotipoBase64: this.imagenBase64 ?? "",
      grupos: this.gruposSelected
    };

    if (this.id != undefined) {
      model.id = this.id;
    }

    this.empresaService.save(model).pipe(
      finalize(() => {
        this.formEnviado = false;
      })
    ).subscribe({
      next: (response: GenericResponseDTO<boolean>) => {
        if (response) {
          this.toastController.create({
            message: "Empresa guardada.",
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

  close() {
    this.modalCtrl.dismiss();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSelectChange(event: CustomEvent) {
    const selectedItem: GrupoDTO = event.detail.value;
    const exists = this.gruposSelected.find(x => x.grupoID === selectedItem.id);

    if (!exists) {

      var model: GrupoEmpresaDTO = {
        id: 0,
        grupoID: selectedItem.id,
        nombreGrupo: selectedItem.nombre,
        deleted: false
      };

      this.gruposSelected.push(model);
    }
    this.formulario.get('itemSeleccionado')?.reset();

  }

  removeItem(item: GrupoEmpresaDTO) {
    const index = this.gruposSelected.indexOf(item);
    const groupDeleted = this.gruposSelected[index];

    if (groupDeleted && typeof groupDeleted.id === 'number' && groupDeleted.id > 0) {
      groupDeleted.deleted = true;
    } else {
      this.gruposSelected.splice(index, 1);
    }
  }

  get visibleItems() {
    return this.gruposSelected.filter(x => !x.deleted);
  }
}
