import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import {
  catchError, debounceTime, distinctUntilChanged,
  firstValueFrom, map, merge, of, startWith, Subject, switchMap, takeUntil
} from 'rxjs';
import { RolesEnum } from 'src/app/enums/roles.enum';
import { ModalEditarProductoComponent } from 'src/app/modals/modal-editar-producto/modal-editar-producto.component';
import { ModalProductoFormComponent } from 'src/app/modals/modal.producto.form/modal.producto.form.component';
import { GrupoDTO } from 'src/app/models/DTOs/GrupoDTO';
import { ProductoCatalogoDTO } from 'src/app/models/DTOs/ProductoCatalogoDTO';
import { Empresa } from 'src/app/models/Empresa';
import { Usuario } from 'src/app/models/Usuario';
import { EmpresaService } from 'src/app/services/api.back.services/empresa.service';
import { GrupoService } from 'src/app/services/api.back.services/grupo.service';
import { ProductoService } from 'src/app/services/api.back.services/producto.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: false
})
export class ProductosPage implements OnInit, AfterViewInit, OnDestroy {

  // table
  dataSourceTable = new MatTableDataSource<ProductoCatalogoDTO>();
  displayedColumns: string[] = [];
  allColumns: string[] = ['Nombre', 'Comision', 'FechaCaducidad']; // base
  total: any;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // input busqueda
  inputBuscar = new Subject<string | undefined>();
  query: string = '';

  empresaID: number = 0;
  rolUsuario: RolesEnum | undefined;
  userid = 0;
  inputBusquedaText = 'Buscar por nombre de producto';

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

  constructor(
    private productoService: ProductoService,
    private loadingCtrl: LoadingController,
    private empresasService: EmpresaService,
    private grupoService: GrupoService,
    private modalCtrl: ModalController,
    private route: ActivatedRoute
  ) {}

  ngAfterViewInit() {
    this.dataSourceTable.sort = this.sort;
    this.dataSourceTable.paginator = this.paginator;

    this.dataSourceTable.sortingDataAccessor = (item: any, property: string) => {
      if (property === 'Comision') {
        const txt = this.formatComision(item);
        const num = Number(String(txt).replace(/[^\d.-]/g, ''));
        return isNaN(num) ? -Infinity : num;
      }
      if (property === 'Nombre') return item?.nombre ?? '';
      if (property === 'FechaCaducidad') return new Date(item?.fechaCaducidad ?? 0).getTime();
      if (property === 'Empresa') return item?.empresaRazonSocial ?? '';
      return (item as any)[property];
    };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async ngOnInit() {
    const resolverData = this.route.snapshot.data['resolverData'];
    const user: Usuario = resolverData.usuario;
    this.rolUsuario = user.roles?.enumValue;
    this.userid = user.id!;

    this.displayedColumns = [...this.allColumns];
    if (this.rolUsuario === RolesEnum.Admin) {
      const idx = this.displayedColumns.indexOf('Nombre');
      if (idx !== -1) this.displayedColumns.splice(idx + 1, 0, 'Empresa');
      this.displayedColumns.push('Acciones');
      this.inputBusquedaText = 'Buscar por nombre de producto, empresa o grupo';
    }

    const loading = await this.loadingCtrl.create({ message: 'Cargando datos...' });
    await loading.present();

    try {
      if (this.rolUsuario === RolesEnum.Socio) {
        // 👇 usa tu EmpresaController.GetAllEmpresasByUsuarioId
        const resp = await firstValueFrom(
          this.empresasService.getAllEmpresasByUsuarioId(this.userid)
        );
        const lista: any[] = resp?.data ?? [];
        this.empresaID = Number(lista[0]?.id ?? 0); // toma la primera empresa asignada
        console.log('[Productos] empresaID socio =>', this.empresaID, 'lista:', lista);

        if (!this.empresaID) {
          console.warn('Usuario socio sin empresa asignada');
          this.total = 0;
          this.dataSourceTable.data = [];
          return;
        }
      } else {
        // Admin: catálogos globales (para filtros y columnas)
        const responseEmpresas = await firstValueFrom(this.empresasService.getAllEmpresas());
        this.empresas = responseEmpresas?.data || [];
        const responseSucursal = await firstValueFrom(this.grupoService.getAllGrupos());
        this.grupos = responseSucursal?.data || [];
      }

      // Carga la tabla
      this.dataSourceTable.paginator = this.paginator;
      this.loadtable();

    } catch (error) {
      console.error('Error al cargar datos', error);
    } finally {
      loading.dismiss();
    }

    // Buscador
    this.inputBuscar
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(value => {
        this.query = ((value as any) ?? '').toString().trim();
        if (this.paginator) this.paginator.firstPage();
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

  /** Admin: ve todo */
  loadtableAll() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() =>
          this.productoService.getProductoAllPaginated({
            page: this.paginator?.pageIndex ?? 0,
            size: this.paginator?.pageSize ?? 50,
            sortBy: this.sort?.active ?? 'Nombre',
            sortDir: this.sort?.direction || 'asc',
            searchQuery: this.query || '',
            grupoID: this.filterGrupoID,
            empresaID: this.filterEmpresID,
            vigenciaFilter: this.filterVigencia
          }).pipe(catchError(() => of(null)))
        ),
        map(res => {
          if (!res || res.success === false || !res.data) {
            this.total = 0;
            return [];
          }
          const { total, items } = res.data;
          this.total = total ?? (items?.length ?? 0);
          return items ?? [];
        })
      )
      .subscribe(items => (this.dataSourceTable = new MatTableDataSource(items)));
  }

  /** Socio: por su empresa */
  loadtableByEmpresa() {
    if (!this.empresaID) {
      this.total = 0;
      this.dataSourceTable.data = [];
      console.warn('[Productos] empresaID vacío.');
      return;
    }

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() =>
          this.productoService.getProductoByEmpresaPaginated({
            empresaID: this.empresaID,                    // 👈 alineado
            page: this.paginator?.pageIndex ?? 0,
            size: this.paginator?.pageSize ?? 50,
            sortBy: this.sort?.active ?? 'Nombre',
            sortDir: this.sort?.direction || 'asc',
            searchQuery: this.query || '',
            vigenciaFilter: this.filterVigencia
          }).pipe(catchError(err => {
            console.warn('[Productos] paginado ERROR →', err);
            return of({ items: [], total: 0 });
          }))
        ),
        switchMap(({ items, total }) => {
          if ((total ?? 0) === 0 || (items?.length ?? 0) === 0) {
            return this.productoService.getAllProductosEmpresa(this.empresaID)
              .pipe(
                map(arr => ({ items: arr as ProductoCatalogoDTO[], total: arr.length })),
                catchError(err => {
                  console.warn('[Productos] fallback NO paginado ERROR →', err);
                  return of({ items: [] as ProductoCatalogoDTO[], total: 0 });
                })
              );
          }
          return of({ items: items as ProductoCatalogoDTO[], total: total ?? (items?.length ?? 0) });
        })
      )
      .subscribe(({ items, total }) => {
        this.total = total ?? (items?.length ?? 0);
        this.dataSourceTable.data = (items ?? []) as ProductoCatalogoDTO[];
      });
  }

  async visualizarModal(id: number) {
    const modal = await this.modalCtrl.create({
      component: ModalEditarProductoComponent,
      // 👇 forzamos el tamaño ancho del modal
      cssClass: 'modal-empresa modal-empresa--wide',
      componentProps: { productoId: id }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) this.loadtable();
  }


  async verDetalle(id: number) {
  const modal = await this.modalCtrl.create({
    component: ModalEditarProductoComponent,
    cssClass: 'modal-empresa modal-empresa--wide', // 👈 igual que admin
    componentProps: { productoId: id, readOnly: true }
  });
  await modal.present();
}

  async addModal() {
    const modal = await this.modalCtrl.create({
      component: ModalProductoFormComponent,
      cssClass: 'modal-xl'
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) this.loadtable();
  }

  onGrupoSelect(event: any) {
    if (event.value != null && event.value != undefined) {
      this.filterGrupoID = event.value.id;
      this.loadtable();
    }
  }
  onGrupoClear(_: any) {
    this.filterGrupoID = 0;
    this.loadtable();
  }

  onEmpresaSelect(event: any) {
    if (event.value != null && event.value != undefined) {
      this.filterEmpresID = event.value.id;
      this.loadtable();
    }
  }
  onEmpresaClear(_: any) {
    this.filterEmpresID = 0;
    this.loadtable();
  }

  onVigenciaSelect(event: any) {
    if (event.value != null) {
      this.filterVigencia = event.value.valor;
      this.loadtable();
    }
  }
  onVigenciaClear(_: any) {
    this.filterVigencia = 0;
    this.loadtable();
  }

  // ===== Helpers UI =====
  formatComision(e: any): string {
    const porcentaje = e?.comision ?? e?.comisionPorcentaje ?? e?.porcentaje ?? e?.nivel_1 ?? e?.nivel1 ?? null;
    const montoFijo   = e?.monto ?? e?.montoFijo ?? e?.comisionMonto ?? null;
    const tipo = e?.comisionTipo ?? e?.tipoComision ?? (porcentaje != null ? 'P' : (montoFijo != null ? 'M' : null));

    if (tipo === 'P' && porcentaje != null) return `${Number(porcentaje)}%`;
    if (tipo === 'M' && montoFijo != null)
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(montoFijo));

    if (porcentaje != null) return `${Number(porcentaje)}%`;
    if (montoFijo != null)
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(montoFijo));
    return '—';
  }

  formatFecha(fecha?: Date): string {
    if (fecha == undefined) return 'No aplica';
    const f = new Date(fecha);
    const dia = f.getDate().toString().padStart(2, '0');
    let mes = f.toLocaleString('es-MX', { month: 'long' });
    mes = mes.charAt(0).toUpperCase() + mes.slice(1);
    const anio = f.getFullYear();
    return `${dia} ${mes} ${anio}`;
  }

  getVigencia(fecha?: Date) {
    if (fecha == undefined) return true;
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const f = new Date(fecha); f.setHours(0, 0, 0, 0);
    return f >= hoy;
  }
}