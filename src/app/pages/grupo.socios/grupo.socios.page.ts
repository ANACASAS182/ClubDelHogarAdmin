import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ModalController } from '@ionic/angular';
import { catchError, debounceTime, distinctUntilChanged, map, merge, of, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { ModalGrupoFormComponent } from 'src/app/modals/modal.grupo.form/modal.grupo.form.component';
import { GrupoDTO } from 'src/app/models/DTOs/GrupoDTO';
import { GrupoService } from 'src/app/services/api.back.services/grupo.service';

@Component({
  selector: 'app-grupo.socios',
  templateUrl: './grupo.socios.page.html',
  styleUrls: ['./grupo.socios.page.scss'],
  standalone: false
})
export class GrupoSociosPage implements OnInit, AfterViewInit, OnDestroy {

  //table
  dataSourceTable = new MatTableDataSource<GrupoDTO>();
  displayedColumns: string[] = ['Nombre', 'Visualizar'];
  total: any;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  //input busqueda
  inputBuscar = new Subject<string>();
  query: string = "";
  private destroy$ = new Subject<void>();

  constructor(private grupoService: GrupoService, private modalCtrl: ModalController) { }

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
          return this.grupoService.getTablePaginated({
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
        this.dataSourceTable = new MatTableDataSource(response);
      });
  }


  async addModal() {
    const modal = await this.modalCtrl.create({
      component: ModalGrupoFormComponent,
      cssClass: 'modal-grupo'
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
      component: ModalGrupoFormComponent,
      cssClass: 'modal-grupo',
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
