import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { catchError, debounceTime, distinctUntilChanged, firstValueFrom, map, merge, of, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { RolesEnum } from 'src/app/enums/roles.enum';
import { ModalProductoFormComponent } from 'src/app/modals/modal.producto.form/modal.producto.form.component';
import { GrupoDTO } from 'src/app/models/DTOs/GrupoDTO';
import { ProductoCatalogoDTO } from 'src/app/models/DTOs/ProductoCatalogoDTO';
import { Empresa } from 'src/app/models/Empresa';
import { Producto } from 'src/app/models/Producto';
import { Usuario } from 'src/app/models/Usuario';
import { EmpresaService } from 'src/app/services/api.back.services/empresa.service';
import { GrupoService } from 'src/app/services/api.back.services/grupo.service';
import { ProductoService } from 'src/app/services/api.back.services/producto.service';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: false
})
export class ProductosPage implements OnInit, AfterViewInit, OnDestroy {
  //table
  dataSourceTable = new MatTableDataSource<ProductoCatalogoDTO>();
  displayedColumns: string[] = [];
  allColumns: string[] = ['Nombre', 'ComisionCantidad', 'ComisionPorcentaje', 'ComisionPorcentajeCantidad', 'FechaCaducidad'];
  total: any;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  //input busqueda
  inputBuscar = new Subject<string>();
  query: string = "";

  empresaID: number = 0;
  rolUsuario: RolesEnum | undefined;
  userid = 0;
  inputBusquedaText = "Buscar por nombre de producto";

  RolesEnum = RolesEnum;

  grupos: GrupoDTO[] = [];
  empresas: Empresa[] = [];

  filterEmpresID: number = 0;
  filterGrupoID: number = 0;
  filterVigencia: number = 0;

  vigencia: { nombre: string; valor: number }[] = [
    { nombre: 'Vigentes', valor: 1 },
    { nombre: 'No vigentes', valor: 2 }
  ];

  private destroy$ = new Subject<void>();


  constructor(private productoService: ProductoService,
    private loadingCtrl: LoadingController,
    private empresasService: EmpresaService,
    private grupoService: GrupoService,
    private usuarioService: UsuarioService, private modalCtrl: ModalController, private route: ActivatedRoute) { }

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
    this.userid = user.id!;

    this.displayedColumns = [...this.allColumns];

    if (this.rolUsuario === RolesEnum.Admin) {
      const insertAfter = 'Nombre';
      const index = this.displayedColumns.indexOf(insertAfter);
      if (index !== -1) {
        this.displayedColumns.splice(index + 1, 0, 'Empresa');
        this.displayedColumns.splice(index + 2, 0, 'Grupo');
      }
      this.inputBusquedaText = "Buscar por nombre de producto, empresa o grupo"
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
          return this.productoService.getProductoAllPaginated({
            page: this.paginator.pageIndex,
            size: this.paginator.pageSize,
            sortBy: this.sort.active,
            sortDir: this.sort.direction,
            searchQuery: this.query,
            grupoID: this.filterGrupoID,
            empresaID: this.filterEmpresID,
            vigenciaFilter: this.filterVigencia
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
          return this.productoService.getProductoByEmpresaPaginated({
            id: this.empresaID,
            page: this.paginator.pageIndex,
            size: this.paginator.pageSize,
            sortBy: this.sort.active,
            sortDir: this.sort.direction,
            searchQuery: this.query,
            vigenciaFilter: this.filterVigencia
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


  async addModal() {
    const modal = await this.modalCtrl.create({
      component: ModalProductoFormComponent,
      cssClass: 'modal-empresa'
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      console.log(data);
      this.loadtable();
    }
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


  onVigenciaSelect(event: any) {
    if (event.value != null) {
      const idSelected = event.value.valor;
      this.filterVigencia = idSelected;
      this.loadtable();
    }
  }
  onVigenciaClear(event: any) {
    this.filterVigencia = 0;
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
  getVigencia(fecha?: Date) {
    if (fecha == undefined) {
      return true;
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const f = new Date(fecha);
    f.setHours(0, 0, 0, 0);

    return f >= hoy;

  }

}
