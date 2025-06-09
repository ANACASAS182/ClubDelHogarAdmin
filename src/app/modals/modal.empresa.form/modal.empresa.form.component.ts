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
import { GiroDTO, GrupoDTO } from 'src/app/models/DTOs/GrupoDTO';
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
  giros: GiroDTO[] = []
  grupo?: GrupoEmpresaDTO;

  @Input() id?: number = undefined;

  constructor(private fb: FormBuilder,
    private empresaService: EmpresaService,
    private grupoService: GrupoService,
    private toastController: ToastController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController) {

    this.giros = [
      { id: 1, nombre: 'Alimentos y Bebidas' },
      { id: 2, nombre: 'Bienes Raíces' },
      { id: 3, nombre: 'Comercio' },
      { id: 4, nombre: 'Construcción' },
      { id: 5, nombre: 'Educación' },
      { id: 6, nombre: 'Finanzas' },
      { id: 7, nombre: 'Manufactura' },
      { id: 8, nombre: 'Salud' },
      { id: 9, nombre: 'Tecnología' },
      { id: 10, nombre: 'Transporte y Logística' }
    ];


    this.formulario = this.fb.group({
      rfc: ["", [Validators.required, Validators.pattern(/^([A-ZÑ&]{3,4}) ?-? ?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?-? ?([A-Z\d]{2})([A\d])$/)]],
      razonSocial: ["", [Validators.required, sinEspaciosValidator()]],
      nombreComercial: ["", [Validators.required, sinEspaciosValidator()]],
      descripcion: [""],
      grupo: [""],
      giro: [""],

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
              descripcion: response.data.descripcion,
              grupo: response.data.grupo,
              giro: response.data.giro,
            });
            this.imagenBase64 = response.data.logotipoBase64;
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

    let grupo: GrupoEmpresaDTO[] = [];

    var model: EmpresaCreateDTO = {
      rfc: cleanString(this.formulario.controls["rfc"].value.trim())!.toUpperCase(),
      razonSocial: cleanString(this.formulario.controls["razonSocial"].value)!,
      nombreComercial: cleanString(this.formulario.controls["nombreComercial"].value)!,
      descripcion: cleanString(this.formulario.controls["descripcion"].value),
      logotipoBase64: this.imagenBase64 ?? "",
      giro:this.formulario.controls["giro"].value,
      grupo:this.formulario.controls["grupo"].value
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

}
