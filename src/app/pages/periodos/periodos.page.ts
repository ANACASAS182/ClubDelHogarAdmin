import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ModalController } from '@ionic/angular';
import { catchError, debounceTime, distinctUntilChanged, map, merge, of, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { ModalPeriodoFormComponent } from 'src/app/modals/modal.periodo.form/modal.periodo.form.component';
import { PeriodoDTO } from 'src/app/models/DTOs/PeriodoDTO';
import { PeriodoService } from 'src/app/services/api.back.services/periodo.service';

@Component({
  selector: 'app-periodos',
  templateUrl: './periodos.page.html',
  styleUrls: ['./periodos.page.scss'],
  standalone: false
})
export class PeriodosPage implements OnInit, OnDestroy {

  //table
  dataSourceTable = new MatTableDataSource<PeriodoDTO>();
  displayedColumns: string[] = ['Anio', 'Mes', "FechaInicio", "FechaFin", "FechaPagoEmpresas", "FechaPagoEmbajadores", 'Visualizar'];
  total: any;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  //input busqueda
  inputBuscar = new Subject<string>();
  query: string = "";
  showNoData = false;
  private destroy$ = new Subject<void>();

  constructor(private periodoService: PeriodoService, private modalCtrl: ModalController) { }

  ngAfterViewInit() {
    this.dataSourceTable.paginator = this.paginator;
    this.loadtable();
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngOnInit() {
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
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.periodoService.getTablePaginated({
            page: this.paginator.pageIndex,
            size: this.paginator.pageSize,
            sortBy: this.sort.active,
            sortDir: this.sort.direction,
            searchQuery: this.query
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
        this.dataSourceTable = new MatTableDataSource(response || []);
        this.showNoData = (response || []).length === 0;
      });
  }


  async addModal() {
    const modal = await this.modalCtrl.create({
      component: ModalPeriodoFormComponent,
      cssClass: 'modal-periodo'
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
      component: ModalPeriodoFormComponent,
      cssClass: 'modal-periodo',
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

  nombreMes(mes: number) {
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return meses[mes - 1] || "";
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

}
