import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { finalize, firstValueFrom } from 'rxjs';
import { getTiposComisionOptions, TipoComisionEnum } from 'src/app/enums/tipo.comision.enum';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core'; // o MatMomentDateModule si usas moment.js
import { MatIconModule } from '@angular/material/icon';
import { Empresa } from 'src/app/models/Empresa';
import { EmpresaService } from 'src/app/services/api.back.services/empresa.service';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { RolesEnum } from 'src/app/enums/roles.enum';
import { ProductoCreateDTO } from 'src/app/models/DTOs/ProductoCreateDTO';
import { ProductoService } from 'src/app/services/api.back.services/producto.service';
import { cleanString } from 'src/app/classes/string-utils';
import { sinEspaciosValidator } from 'src/app/classes/custom.validars';

@Component({
  selector: 'app-modal.producto.form',
  templateUrl: './modal.producto.form.component.html',
  styleUrls: ['./modal.producto.form.component.scss'],
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [IonicModule, ReactiveFormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class ModalProductoFormComponent implements OnInit {

  formulario: FormGroup;
  btnName: string = "AGREGAR";
  title: string = "AGREGAR";

  formEnviado: boolean = false;
  tiposComision: { nombre: string; valor: TipoComisionEnum }[] = [];

  @Input() id?: number = undefined;
  TipoComisionEnum = TipoComisionEnum;

  empresas: Empresa[] = [];
  mostrarEmpresas: boolean = false;
  rolUser: RolesEnum | undefined;
  empresaID: number = 0;

  constructor(private fb: FormBuilder,
    private toastController: ToastController,
    private loadingCtrl: LoadingController,
    private empresasService: EmpresaService,
    private productoService: ProductoService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController) {

    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, sinEspaciosValidator()]],
      descripcion: [''],
      fechaVencimiento: ['', Validators.required],
      empresa: [''],
      tipoComision: ['', Validators.required],
      comisionCantidad: [''],
      comisionPorcentaje: [''],
      cantidadPorcentaje: [''],
      otroTipoComision: ['', Validators.required],
      nivel_1: ['', Validators.required],
      nivel_2: ['', Validators.required],
      nivel_3: ['', Validators.required],
      nivel_4: ['', Validators.required],
      nivel_master: ['', Validators.required],
      nivel_base: ['', Validators.required]
    });
  }

  async ngOnInit() {
    this.tiposComision = getTiposComisionOptions();

    const loading = await this.loadingCtrl.create({
      message: 'Cargando datos...'
    });
    await loading.present();

    try {
      const responseEmpresas = await firstValueFrom(this.empresasService.getAllEmpresas());
      this.empresas = responseEmpresas?.data || [];

      const responseUsuarios = await firstValueFrom(this.usuarioService.getUsuario());
      const user = responseUsuarios?.data;

      this.rolUser = user.roles?.enumValue;

      if (user.roles?.enumValue == RolesEnum.Admin) {
        this.mostrarEmpresas = true;

        const empresaControl = this.formulario.get('empresa');
        empresaControl?.setValidators([Validators.required]);
        empresaControl?.updateValueAndValidity();

        this.cdr.detectChanges();
      } else {
        const responseEmpresaUser = await firstValueFrom(this.usuarioService.getEmpresaByUsuario(user.id!));
        this.empresaID = responseEmpresaUser?.data.id!;
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

    const fechaCaducidad: Date = this.formulario.controls["fechaVencimiento"].value;
    const hoy = new Date();

    if (fechaCaducidad < hoy) {
      this.toastController.create({
        message: "Fecha de vencimiento tiene que ser superior a la actual.",
        duration: 3000,
        color: "warning",
        position: 'top'
      }).then(toast => toast.present());
      this.formEnviado = false;
      return;
    }

    const IDEmpresa = this.rolUser == RolesEnum.Admin ? this.formulario.controls["empresa"].value : this.empresaID;

    var model: ProductoCreateDTO = {
      nombre: cleanString(this.formulario.controls["nombre"].value)!,
      descripcion: cleanString(this.formulario.controls["descripcion"].value),
      empresaID: IDEmpresa,
      tipoComisionNivel: this.formulario.controls["otroTipoComision"].value,
      comisionCantidad: this.formulario.controls["comisionCantidad"].value == '' ? undefined : this.formulario.controls["comisionCantidad"].value,
      comisionPorcentaje: this.formulario.controls["comisionPorcentaje"].value == '' ? undefined : this.formulario.controls["comisionPorcentaje"].value,
      comisionPorcentajeCantidad: this.formulario.controls["cantidadPorcentaje"].value == '' ? undefined : this.formulario.controls["cantidadPorcentaje"].value,
      fechaCaducidad: this.formulario.controls["fechaVencimiento"].value,
      nivel1: this.formulario.controls["nivel_1"].value,
      nivel2: this.formulario.controls["nivel_2"].value,
      nivel3: this.formulario.controls["nivel_3"].value,
      nivel4: this.formulario.controls["nivel_4"].value,
      nivelBase: this.formulario.controls["nivel_base"].value,
      nivelMaster: this.formulario.controls["nivel_master"].value,
      tipoComision: this.formulario.controls["tipoComision"].value,
      precio: 0
    };

    this.productoService.save(model).pipe(
      finalize(() => {
        this.formEnviado = false;
      })
    ).subscribe({
      next: (response: GenericResponseDTO<boolean>) => {
        if (response) {
          this.toastController.create({
            message: "producto guardado.",
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

  onTipoComisionChange(event: any) {
    const enumSelected: TipoComisionEnum = event.detail.value;
    const comisionCantidadControl = this.formulario.get('comisionCantidad');
    const comisionPorcentajeControl = this.formulario.get('comisionPorcentaje');
    const cantidadPorcentajeControl = this.formulario.get('cantidadPorcentaje');

    switch (enumSelected) {
      case TipoComisionEnum.CantidadFija:
        comisionCantidadControl?.setValidators([Validators.required]);

        comisionPorcentajeControl?.clearValidators();
        comisionPorcentajeControl?.setValue("");
        cantidadPorcentajeControl?.clearValidators();
        cantidadPorcentajeControl?.setValue("");
        break;
      case TipoComisionEnum.Porcentaje:
        comisionPorcentajeControl?.setValidators([Validators.required]);
        cantidadPorcentajeControl?.setValidators([Validators.required]);

        comisionCantidadControl?.clearValidators();
        comisionCantidadControl?.setValue("");
        break;
      default:
        break;
    }

    comisionCantidadControl?.updateValueAndValidity();
    comisionPorcentajeControl?.updateValueAndValidity();
    comisionPorcentajeControl?.updateValueAndValidity();
  }

}
