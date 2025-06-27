import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { UtileriasService } from '../../services/utilerias.service';

@Component({
  selector: 'app-modal.producto.form',
  templateUrl: './modal.producto.form.component.html',
  styleUrls: ['./modal.producto.form.component.scss'],
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [IonicModule, ReactiveFormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, FormsModule],
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


  estatusDatosbasicos: number = 1;
  estatusDatosComisiones: number = 0;
  estatusDatosValidacion: number = 0;


  nombreProductoAgregando: string = "";
  descripcionProductoAgregando: string = "";
  vigenciaProductoAgregando: string = "";

  nivel1ProductoAgregando: string = "";
  nivel2ProductoAgregando: string = "";
  nivel3ProductoAgregando: string = "";
  nivel4ProductoAgregando: string = "";
  nivelInvitacionProductoAgregando: string = "";
  nivelMasterProductoAgregando: string = "";
  comisionTotalProductoAgregando: string = "";
  tipoComisionAgregando: number = 0;
  fechaVigenciaTextoAgregando: string = "";

  confirmacionProductoAgregado:boolean = false;


  constructor(private fb: FormBuilder,
    private toastController: ToastController,
    private loadingCtrl: LoadingController,
    private empresasService: EmpresaService,
    private productoService: ProductoService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    private utilerias:UtileriasService,
    private modalCtrl: ModalController) {


    let fechaSugerida: Date = this.obtenerUltimoDiaDeTresMesesDespues();

    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, sinEspaciosValidator()]],
      descripcion: [''],
      fechaVencimiento: [fechaSugerida, Validators.required],
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
      nivel_invitacion: ['', Validators.required]
    });
  }

  obtenerUltimoDiaDeTresMesesDespues(): Date {
    const fechaActual = new Date();
    const fechaTresMesesDespues = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 13, 1);
    const ultimoDia = new Date(fechaTresMesesDespues.getFullYear(), fechaTresMesesDespues.getMonth(), 0);
    return ultimoDia;
  }

  pasoActual: string = "Descripción";

  siguientePaso(paso: number) {

    this.confirmacionProductoAgregado = false;

    this.nombreProductoAgregando = cleanString(this.formulario.controls["nombre"].value)!;
    this.descripcionProductoAgregando = this.formulario.controls["descripcion"].value;

    this.fechaVigenciaTextoAgregando =this.utilerias.formatearFecha(this.formulario.controls["fechaVencimiento"].value)

    let tipoComision:number = this.formulario.controls["tipoComision"].value;

    this.tipoComisionAgregando = tipoComision;

    let nivel1Suma: number = Number.parseFloat(this.formulario.controls["nivel_1"].value);
    let nivel2Suma: number = Number.parseFloat(this.formulario.controls["nivel_2"].value);
    let nivel3Suma: number = Number.parseFloat(this.formulario.controls["nivel_3"].value);
    let nivel4Suma: number = Number.parseFloat(this.formulario.controls["nivel_4"].value);
    let nivelInvitacionSuma: number = Number.parseFloat(this.formulario.controls["nivel_invitacion"].value);
    let nivelMasterSuma: number = Number.parseFloat(this.formulario.controls["nivel_master"].value);
    let comisionTotal: number = nivel1Suma + nivel2Suma + nivel3Suma + nivel4Suma + nivelInvitacionSuma + nivelMasterSuma;

    if (tipoComision == 0) {
      this.nivel1ProductoAgregando = "$" + nivel1Suma.toFixed(2) + " MXN";
      this.nivel2ProductoAgregando = "$" + nivel2Suma.toFixed(2) + "MXN";
      this.nivel3ProductoAgregando = "$" + nivel3Suma.toFixed(2) + "MXN";
      this.nivel4ProductoAgregando = "$" + nivel4Suma.toFixed(2) + "MXN";
      this.nivelInvitacionProductoAgregando = "$" + nivelInvitacionSuma.toFixed(2) + "MXN";
      this.nivelMasterProductoAgregando = "$" + nivelMasterSuma.toFixed(2) + "MXN";

      this.comisionTotalProductoAgregando = "$" + comisionTotal.toFixed(2) + "MXN";
    }

    if (tipoComision == 1) {
      this.nivel1ProductoAgregando = nivel1Suma.toFixed(2) + "%";
      this.nivel2ProductoAgregando = nivel2Suma.toFixed(2) + "%";
      this.nivel3ProductoAgregando = nivel3Suma.toFixed(2) + "%";
      this.nivel4ProductoAgregando = nivel4Suma.toFixed(2) + "%";
      this.nivelInvitacionProductoAgregando = nivelInvitacionSuma.toFixed(2) + "%";
      this.nivelMasterProductoAgregando = nivelMasterSuma.toFixed(2) + "%";

      this.comisionTotalProductoAgregando = comisionTotal.toFixed(2) + "%";
    }



    if (paso == 1) {
      this.estatusDatosbasicos = 0;
      this.estatusDatosComisiones = 1;
      this.estatusDatosValidacion = 0;

      this.pasoActual = "Comisiones";
    }
    if (paso == 2) {
      this.estatusDatosbasicos = 0;
      this.estatusDatosComisiones = 0;
      this.estatusDatosValidacion = 1;

      this.pasoActual = "Validación";
    }

  }
  pasoAnterior(paso: number) {
    this.confirmacionProductoAgregado = false;

    if (paso == 1) {
      this.estatusDatosbasicos = 1;
      this.estatusDatosComisiones = 0;
      this.estatusDatosValidacion = 0;

      this.pasoActual = "Descripción";
    }
    if (paso == 2) {
      this.estatusDatosbasicos = 0;
      this.estatusDatosComisiones = 1;
      this.estatusDatosValidacion = 0;

      this.pasoActual = "Comisiones";
    }
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
      fechaCaducidad: this.formulario.controls["fechaVencimiento"].value,
      nivel1: this.formulario.controls["nivel_1"].value,
      nivel2: this.formulario.controls["nivel_2"].value,
      nivel3: this.formulario.controls["nivel_3"].value,
      nivel4: this.formulario.controls["nivel_4"].value,
      nivelInvitacion: this.formulario.controls["nivel_invitacion"].value,
      nivelMaster: this.formulario.controls["nivel_master"].value,
      tipoComision: this.formulario.controls["tipoComision"].value,
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
