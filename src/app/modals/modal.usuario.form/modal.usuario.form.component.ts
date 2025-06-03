import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { debounceTime, finalize, firstValueFrom, Subject } from 'rxjs';
import { getRolesOptions, RolesEnum } from 'src/app/enums/roles.enum';
import { CatalogoEstado } from 'src/app/models/CatalogoEstado';
import { CatalogoPais } from 'src/app/models/CatalogoPais';
import { FuenteOrigenDTO } from 'src/app/models/DTOs/FuenteOrigenDTO';
import { GrupoDTO } from 'src/app/models/DTOs/GrupoDTO';
import { Empresa } from 'src/app/models/Empresa';
import { Usuario } from 'src/app/models/Usuario';
import { CatalogosService } from 'src/app/services/api.back.services/catalogos.service';
import { EmpresaService } from 'src/app/services/api.back.services/empresa.service';
import { FuenteOrigenService } from 'src/app/services/api.back.services/fuente.origen.service';
import { GrupoService } from 'src/app/services/api.back.services/grupo.service';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { IonicSelectableComponent, IonicSelectableMessageTemplateDirective } from 'ionic-selectable';
import { UsuarioCatalogoDTO } from 'src/app/models/DTOs/UsuarioCatalogoDTO';
import { GenericResponseDTO } from 'src/app/models/DTOs/GenericResponseDTO';
import { UsuarioEditDTO } from 'src/app/models/DTOs/UsuarioEditDTO';
import { cleanString } from 'src/app/classes/string-utils';
import { sinEspaciosValidator } from 'src/app/classes/custom.validars';

@Component({
  selector: 'app-modal.usuario.form',
  templateUrl: './modal.usuario.form.component.html',
  styleUrls: ['./modal.usuario.form.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule, IonicSelectableComponent, IonicSelectableMessageTemplateDirective],

})

export class ModalUsuarioFormComponent implements OnInit {
  @ViewChild('selectableComponent') selectableComponent!: IonicSelectableComponent;

  formulario: FormGroup;
  btnName: string = "AGREGAR";
  title: string = "AGREGAR";

  formEnviado: boolean = false;
  paises: CatalogoPais[] = [];
  estados: CatalogoEstado[] = [];
  fuentesOrigen: FuenteOrigenDTO[] = [];

  isNacional: boolean = false;

  roles: { nombre: string; valor: RolesEnum }[] = [];
  grupos: GrupoDTO[] = []
  empresas: Empresa[] = []
  usuarios: UsuarioCatalogoDTO[] = [];

  mostrarGrupos: boolean = false;
  mostrarEmpresas: boolean = false;
  mostrarParent: boolean = false;

  searchSubject = new Subject<any>();
  firstSearch: boolean = false;
  textoPassword: string = "Contraseña";
  ContrasenaLabel: string = "Contraseña";

  @Input() id?: number = undefined;

  constructor(private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private toastController: ToastController,
    private loadingCtrl: LoadingController,
    private gruposService: GrupoService,
    private empresasService: EmpresaService,
    private fuenteOrigenService: FuenteOrigenService,
    private catalogosService: CatalogosService,
    private modalCtrl: ModalController) {

    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, sinEspaciosValidator()]],
      apellido: ['', [Validators.required, sinEspaciosValidator()]],
      email: ['', [Validators.required, sinEspaciosValidator(), Validators.email]],
      pais: ['', Validators.required],
      ciudad: ['', [Validators.required, sinEspaciosValidator()]],
      estado: [''],
      estadoTexto: [''],
      telefono: ['', [Validators.required, sinEspaciosValidator()]],
      password: ['', [Validators.minLength(6)]],
      fuenteOrigen: ['', Validators.required],
      rol: ['', Validators.required],
      grupo: [''],
      empresa: [''],
      parent: []
    });
    this.setupSearch();
  }

  async ngOnInit() {

    const loading = await this.loadingCtrl.create({
      message: 'Cargando datos...'
    });
    await loading.present();
    try {
      this.roles = getRolesOptions();

      const responsegrupos = await firstValueFrom(this.gruposService.getAllGrupos());
      this.grupos = responsegrupos?.data || [];

      const responseEmpresas = await firstValueFrom(this.empresasService.getAllEmpresas());
      this.empresas = responseEmpresas?.data || [];

      const responseFuentesOrigen = await firstValueFrom(this.fuenteOrigenService.getCatalogoFuentesOrigen());
      this.fuentesOrigen = responseFuentesOrigen?.data || [];

      const responseCatPaises = await firstValueFrom(this.catalogosService.getCatalogoPaises());
      this.paises = responseCatPaises?.data || [];

      const responseCatEstados = await firstValueFrom(this.catalogosService.getCatalogoEstados());
      this.estados = responseCatEstados?.data || [];

      const passwordControl = this.formulario.get('password');

      if (this.id != undefined) {
        this.btnName = "GUARDAR";
        this.title = "MODIFICAR";
        this.textoPassword = "Capture contraseña solo si desea cambiarla.";
        this.ContrasenaLabel = "Nueva contraseña";
        this.usuarioService.getUsuarioByID(this.id).subscribe({
          next: (response: GenericResponseDTO<UsuarioEditDTO>) => {
            // Patch del resto de datos, sin 'parent'
            this.formulario.patchValue({
              nombre: response.data.nombres,
              apellido: response.data.apellidos,
              email: response.data.email,
              pais: response.data.catalogoPaisID,
              estado: response.data.catalogoEstadoID,
              estadoTexto: response.data.estadoTexto,
              ciudad: response.data.ciudad,
              telefono: response.data.celular,
              fuenteOrigen: response.data.fuenteOrigenID,
              rol: response.data.rolesEnum,
              grupo: response.data.grupoID,
              empresa: response.data.empresaID
            });

            this.rolChange(response.data.rolesEnum!);

            this.isNacional = !!response.data.catalogoEstadoID;

            if (response.data.usuarioParentID != undefined && response.data.usuarioParentID > 0) {
              this.usuarioService.busquedaUsuario(response.data.usuarioParentNombreCompleto!.trim()).subscribe(responsebusqueda => {
                this.usuarios = responsebusqueda.data;

                this.formulario.patchValue({
                  parent: this.usuarios.find(u => u.id === response.data.usuarioParentID)
                });
              });
            }
          }
        });

      } else {
        //Mexico por default
        var mexico = this.paises.find(t => t.codigo == "MEX");
        this.formulario.patchValue({
          pais: mexico?.id
        });
        this.isNacional = true;

        //
        this.formulario.patchValue({
          password: this.generateSecurePassword(8)
        });

        passwordControl?.setValidators([Validators.required]);
        passwordControl?.updateValueAndValidity();
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

    var parent: UsuarioCatalogoDTO | null = this.formulario.controls["parent"].value;

    //si no es embajador, se elimina el parent si tiene uno
    var rol: RolesEnum = this.formulario.controls["rol"].value;
    if (rol != RolesEnum.Embajadores) {
      parent = null;
    }

    var model: UsuarioEditDTO = {
      nombres: cleanString(this.formulario.controls["nombre"].value)!,
      apellidos: cleanString(this.formulario.controls["apellido"].value)!,
      email: cleanString(this.formulario.controls["email"].value)!,
      celular: cleanString(this.formulario.controls["telefono"].value)!,
      catalogoPaisID: this.formulario.controls["pais"].value,
      catalogoEstadoID: this.formulario.controls["estado"].value == '' ? undefined : this.formulario.controls["estado"].value,
      estadoTexto: cleanString(this.formulario.controls["estadoTexto"].value),
      ciudad: cleanString(this.formulario.controls["ciudad"].value),
      fuenteOrigenID: this.formulario.controls["fuenteOrigen"].value,
      usuarioParentID: parent != null ? parent.id : undefined,
      rolesEnum: this.formulario.controls["rol"].value,
      grupoID: this.formulario.controls["grupo"].value == "" ? undefined : this.formulario.controls["grupo"].value,
      empresaID: this.formulario.controls["empresa"].value == "" ? undefined : this.formulario.controls["empresa"].value,
      password: (this.formulario.controls["password"].value || "").trim()
    };

    if (this.id != undefined) {
      model.id = this.id;
    }

    this.usuarioService.save(model).pipe(
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

  close() {
    this.modalCtrl.dismiss();
  }

  onPaisChange(event: any) {
    const idSelected = event.detail.value;

    var pais = this.paises.find(t => t.id == idSelected);

    const estadoControl = this.formulario.get('estado');
    const estadoTextoControl = this.formulario.get('estadoTexto');

    if (pais!.codigo == "MEX") {
      this.isNacional = true;
      estadoControl?.setValidators([Validators.required]);
      estadoTextoControl?.clearValidators();
    } else {
      this.isNacional = false;
      estadoTextoControl?.setValidators([Validators.required]);
      estadoControl?.clearValidators();
    }

    estadoControl?.updateValueAndValidity();
    estadoTextoControl?.updateValueAndValidity();
  }

  onRolChange(event: any) {
    const enumSelected: RolesEnum = event.detail.value;
    this.rolChange(enumSelected);
  }

  rolChange(enumSelected: RolesEnum) {
    var grupoRequired: boolean = false;
    var empresaRequired: boolean = false;
    this.mostrarEmpresas = false;
    this.mostrarGrupos = false;
    this.mostrarParent = false;

    switch (enumSelected) {
      case RolesEnum.Admin:
        break;
      case RolesEnum.Socio:
        //Si el tipo de usuario es Socio, debe estar ligado una empresa
        empresaRequired = true;
        this.mostrarEmpresas = true;
        break;
      case RolesEnum.Embajadores:
        //Si el tipo de usuario es Embajador,
        // debe estar ligado a un grupo  (obligatorio)
        // puede o no esar ligado a otro embajador con el campo UsuarioParent (opcional)
        // no debe estar ligado a una empresa
        grupoRequired = true;
        this.mostrarGrupos = true;
        this.mostrarParent = true;
        break;
      default:
        break;
    }



    const grupoControl = this.formulario.get('grupo');
    if (grupoRequired) {
      grupoControl?.setValidators([Validators.required]);
    } else {
      grupoControl?.clearValidators();
      grupoControl?.setValue("");
    }
    grupoControl?.updateValueAndValidity();


    const empresaControl = this.formulario.get('empresa');
    if (empresaRequired) {
      empresaControl?.setValidators([Validators.required]);
    } else {
      empresaControl?.clearValidators();
      empresaControl?.setValue("");
    }
    empresaControl?.updateValueAndValidity();
  }

  generateSecurePassword(length: number = 12): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    const all = upper + lower + numbers + symbols;

    let password = '';
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = password.length; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }

  refreshPassword() {
    this.formulario.patchValue({
      password: this.generateSecurePassword(8)
    });
  }

  onSearchChange(event: any) {
    event.component.startSearch();
    this.searchSubject.next(event);
  }

  setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(event => {
      const texto = event.text.trim();

      if (texto.length < 2 && texto != "") {
        event.component.items = this.usuarios;
        event.component.endSearch();
        return;
      }

      var parent: UsuarioCatalogoDTO = this.formulario.controls["parent"].value;

      this.usuarioService.busquedaUsuario(texto.toLowerCase()).subscribe(response => {
        // if (parent != null) {

        //   const existe = response.data.some(u => u.id === parent.id);
        //   if (!existe) {
        //     this.usuarios = [parent, ...response.data];
        //   } else {
        //     this.usuarios = response.data;
        //   }
        // } else {
        //   this.usuarios = response.data;
        // }
        this.usuarios = response.data;
        event.component.items = this.usuarios;
        event.component.endSearch();
      }, error => {
        event.component.items = [];
        event.component.endSearch();
      });
    });
  }

  //reescribe un metodo de la libreria, al parecer tiene error este metodo en la ultima version
  //si se actualiza la libreria, tal vez este codigo ya no haga falta.
  onOpen(event: any) {
    if (this.selectableComponent) {
      this.selectableComponent._onSearchbarClear = function () {
        this._searchText = ''; // Clear Search Text
        this._filterItems(); // Reeffects a filter on the items
      }
    }
  }
}
