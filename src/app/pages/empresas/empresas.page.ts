import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ModalController } from '@ionic/angular';
import { catchError, debounceTime, distinctUntilChanged, firstValueFrom, map, merge, of, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { ModalEmpresaFormComponent } from 'src/app/modals/modal.empresa.form/modal.empresa.form.component';
import { EmpresaCatalogoDTO } from 'src/app/models/DTOs/EmpresaCatalogoDTO';
import { GrupoDTO } from 'src/app/models/DTOs/GrupoDTO';
import { Empresa } from 'src/app/models/Empresa';
import { EmpresaService } from 'src/app/services/api.back.services/empresa.service';
import { GrupoService } from 'src/app/services/api.back.services/grupo.service';

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.page.html',
  styleUrls: ['./empresas.page.scss'],
  standalone: false
})
export class EmpresasPage implements OnInit, AfterViewInit, OnDestroy {

  //table
  dataSourceTable = new MatTableDataSource<EmpresaCatalogoDTO>();
  displayedColumns: string[] = ['RFC', 'RazonSocial', 'NombreComercial', 'Grupo', 'Visualizar'];
  total: any;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  //input busqueda
  inputBuscar = new Subject<string>();
  query: string = "";
  grupos: GrupoDTO[] = [];
  private destroy$ = new Subject<void>();

  constructor(private empresaService: EmpresaService, private modalCtrl: ModalController, private gruposService: GrupoService) { }

  ngAfterViewInit() {
    this.dataSourceTable.paginator = this.paginator;
    this.loadtable();
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  async ngOnInit() {

    const responsegrupos = await firstValueFrom(this.gruposService.getAllGrupos());
    this.grupos = responsegrupos?.data || [];

    this.inputBuscar.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      takeUntil(this.destroy$))
      .subscribe(value => {
        this.query = value.toString();
        this.loadtable();
      });
  }

  onGrupoSelect(event: any) {
    if (event.value != null && event.value != undefined) {
      const idSelected = event.value.id;
      this.loadtable(idSelected);
    }
  }
  onGrupoClear(event: any) {
    this.loadtable();
  }

  loadtable(grupoid: number = 0) {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.empresaService.getTablePaginated({
            page: this.paginator.pageIndex,
            size: this.paginator.pageSize,
            sortBy: this.sort.active,
            sortDir: this.sort.direction,
            searchQuery: this.query,
            grupoID: grupoid
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
      component: ModalEmpresaFormComponent,
      cssClass: 'modal-empresa'
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      console.log(data);
      this.loadtable();
    }
  }

  async editModal(idEdit?: number) {
    const modal = await this.modalCtrl.create({
      component: ModalEmpresaFormComponent,
      cssClass: 'modal-empresa',
      componentProps: {
        id: idEdit
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      console.log(data);
      this.loadtable();
    }
  }


}
