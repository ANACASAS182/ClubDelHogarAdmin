import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { catchError, debounceTime, distinctUntilChanged, firstValueFrom, map, merge, of, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { EstatusReferenciaEnum, getEstatusReferenciaOptions } from 'src/app/enums/estatus.referencia.enum';
import { RolesEnum } from 'src/app/enums/roles.enum';
import { ModalQrViewComponent } from 'src/app/modals/modal.qr.view/modal.qr.view.component';
import { ModalSeguimientoReferenciaComponent } from 'src/app/modals/modal.seguimiento.referencia/modal.seguimiento.referencia.component';
import { GrupoDTO } from 'src/app/models/DTOs/GrupoDTO';
import { ReferidoCatalogoDTO } from 'src/app/models/DTOs/ReferidoCatalogoDTO';
import { UsuarioCatalogoDTO } from 'src/app/models/DTOs/UsuarioCatalogoDTO';
import { Empresa } from 'src/app/models/Empresa';
import { Usuario } from 'src/app/models/Usuario';
import { EmpresaService } from 'src/app/services/api.back.services/empresa.service';
import { GrupoService } from 'src/app/services/api.back.services/grupo.service';
import { ReferidoService } from 'src/app/services/api.back.services/referido.service';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';

@Component({
  selector: 'app-referencias',
  templateUrl: './referencias.page.html',
  styleUrls: ['./referencias.page.scss'],
  standalone: false
})
export class ReferenciasPage implements OnInit, AfterViewInit, OnDestroy {

  //table
  dataSourceTable = new MatTableDataSource<ReferidoCatalogoDTO>();
  displayedColumns: string[] = [];
  allColumns: string[] = ['Nombre', 'Email', 'Celular', 'Producto', 'Embajador', 'EstatusReferencia', 'QR', 'Visualizar'];
  total: any;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  //input busqueda
  inputBuscar = new Subject<string>();
  query: string = "";

  empresaID: number = 0;
  rolUsuario: RolesEnum | undefined;
  userid = 0;
  inputBusquedaText = "Buscar por nombre, email, celular o producto";

  RolesEnum = RolesEnum;

  grupos: GrupoDTO[] = [];
  empresas: Empresa[] = [];
  estatus: { nombre: string; valor: EstatusReferenciaEnum }[] = [];


  filterEmpresID: number = 0;
  filterGrupoID: number = 0;
  filterEstatusEnum?: number = undefined;
  filterUsuario: number = 0;

  usuarios: UsuarioCatalogoDTO[] = [];
  searchSubject = new Subject<any>();
  @ViewChild('selectableComponent') selectableComponent!: IonicSelectableComponent;
  private destroy$ = new Subject<void>();


  constructor(private loadingCtrl: LoadingController, private empresasService: EmpresaService,
    private grupoService: GrupoService, private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private referidoService: ReferidoService
  ) {
    this.setupSearch();
  }

  ngAfterViewInit() {
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async ngOnInit() {
    const resolverData = this.route.snapshot.data['resolverData'];
    let user: Usuario = resolverData.usuario;

    this.rolUsuario = user.roles?.enumValue;
    this.estatus = getEstatusReferenciaOptions();
    this.userid = user.id!;

    this.displayedColumns = [...this.allColumns];

    if (this.rolUsuario === RolesEnum.Admin) {
      const insertAfter = 'Producto';
      const index = this.displayedColumns.indexOf(insertAfter);
      if (index !== -1) {
        this.displayedColumns.splice(index + 1, 0, 'Empresa');
        this.displayedColumns.splice(index + 2, 0, 'Grupo');
      }
      this.inputBusquedaText = "Buscar por nombre, email, celular, producto, empresa o grupo"
    }

    const loading = await this.loadingCtrl.create({
      message: 'Cargando datos...'
    });
    await loading.present();

    try {
      if (this.rolUsuario == RolesEnum.Socio) {
        //obtener id empresa
        const empresaResponse = await firstValueFrom(this.usuarioService.getEmpresaByUsuario(this.userid));
        this.empresaID = empresaResponse.data.id!;
      } else {
        const responseEmpresas = await firstValueFrom(this.empresasService.getAllEmpresas());
        this.empresas = responseEmpresas?.data || [];

        const responseSucursal = await firstValueFrom(this.grupoService.getAllGrupos());
        this.grupos = responseSucursal?.data || [];
      }

      this.dataSourceTable.paginator = this.paginator;
      this.loadtable();

    } catch (error) {
      console.error('Error al cargar datos', error);
    } finally {
      loading.dismiss();
    }

    this.inputBuscar.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      takeUntil(this.destroy$))
      .subscribe(value => {
        this.query = value.toString();
        this.loadtable();
      });
  }

  loadtable() {
    switch (this.rolUsuario) {
      case RolesEnum.Admin:
        this.loadtableAll();
        break;
      case RolesEnum.Socio:
        this.loadtableByEmpresa();
        break;
      default:
        break;
    }
  }

  loadtableAll() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.referidoService.getAllReferidosPaginated({
            page: this.paginator.pageIndex,
            size: this.paginator.pageSize,
            sortBy: this.sort.active,
            sortDir: this.sort.direction,
            searchQuery: this.query,
            grupoID: this.filterGrupoID,
            empresaID: this.filterEmpresID,
            statusEnum: this.filterEstatusEnum,
            usuarioID: this.filterUsuario
          })
            .pipe(catchError(() => of(null)));
        }),
        map(response => {
          if (response === null) {
            return [];
          }
          this.total = response.data.total;
          return response.data.items;
        }),
      )
      .subscribe(response => {
        this.dataSourceTable = new MatTableDataSource(response);
      });
  }


  loadtableByEmpresa() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.referidoService.getReferidosByEmpresaPaginated({
            id: this.empresaID,
            page: this.paginator.pageIndex,
            size: this.paginator.pageSize,
            sortBy: this.sort.active,
            sortDir: this.sort.direction,
            searchQuery: this.query,
            statusEnum: this.filterEstatusEnum,
            usuarioID: this.filterUsuario
          })
            .pipe(catchError(() => of(null)));
        }),
        map(response => {
          if (response === null) {
            return [];
          }
          this.total = response.data.total;
          return response.data.items;
        }),
      )
      .subscribe(response => {
        this.dataSourceTable = new MatTableDataSource(response);
      });
  }


  async seguimientoModal(ID: Number) {
    const modal = await this.modalCtrl.create({
      component: ModalSeguimientoReferenciaComponent,
      cssClass: 'modal-empresa',
      componentProps: {
        id: ID
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    this.loadtable();
  }

  formatFecha(fecha?: Date): string {

    if (fecha == undefined) {
      return "No aplica";
    }

    const f = new Date(fecha);
    const dia = f.getDate().toString().padStart(2, '0');
    let mes = f.toLocaleString('es-MX', { month: 'long' });
    mes = mes.charAt(0).toUpperCase() + mes.slice(1);
    const anio = f.getFullYear();
    return `${dia} ${mes} ${anio}`;
  }

  onGrupoSelect(event: any) {
    if (event.value != null && event.value != undefined) {
      const idSelected = event.value.id;
      this.filterGrupoID = idSelected;
      this.loadtable();
    }
  }
  onGrupoClear(event: any) {
    this.filterGrupoID = 0;
    this.loadtable();
  }


  onEmpresaSelect(event: any) {
    if (event.value != null && event.value != undefined) {
      const idSelected = event.value.id;
      this.filterEmpresID = idSelected;
      this.loadtable();
    }
  }
  onEmpresaClear(event: any) {
    this.filterEmpresID = 0;
    this.loadtable();
  }

  onEstatusSelect(event: any) {
    if (event.value != null && event.value != undefined) {
      const idSelected = event.value.valor;
      this.filterEstatusEnum = idSelected;
      this.loadtable();
    }
  }
  onEstatusClear(event: any) {
    this.filterEstatusEnum = undefined;
    this.loadtable();
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
      this.usuarioService.busquedaUsuario(texto.toLowerCase()).subscribe(response => {
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


  onUsuarioSelect(event: any) {
    if (event.value != null && event.value != undefined) {
      const idSelected = event.value.id;
      this.filterUsuario = idSelected;
      this.loadtable();
    }
  }
  onUsuarioClear(event: any) {
    this.filterUsuario = 0;
    this.loadtable();
  }


  async viewQR(codigo: string){

    var qrBase64 = await firstValueFrom(this.referidoService.getQR(codigo));

     const modal = await this.modalCtrl.create({
      component: ModalQrViewComponent,
      cssClass: 'modal-empresa',
      componentProps: {
        imagenBase64: qrBase64.data
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
  }

}
