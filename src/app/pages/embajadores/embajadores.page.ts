import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ModalController } from '@ionic/angular';
import { catchError, debounceTime, distinctUntilChanged, map, merge, of, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { ModalUsuarioFormComponent } from 'src/app/modals/modal.usuario.form/modal.usuario.form.component';
import { UsuarioCatalogoDTO } from 'src/app/models/DTOs/UsuarioCatalogoDTO';
import { Usuario } from 'src/app/models/Usuario';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';

@Component({
  selector: 'app-embajadores',
  templateUrl: './embajadores.page.html',
  styleUrls: ['./embajadores.page.scss'],
  standalone: false
})
export class EmbajadoresPage implements OnInit, AfterViewInit, OnDestroy {

  //table
  dataSourceTable = new MatTableDataSource<UsuarioCatalogoDTO>();
  displayedColumns: string[] = ['NombreCompleto', 'Rol', 'Email', 'Celular', 'Visualizar'];
  total: any;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  //input busqueda
  inputBuscar = new Subject<string>();
  query: string = "";
  private destroy$ = new Subject<void>();

  constructor(private usuarioService: UsuarioService, private modalCtrl: ModalController) { }

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
          return this.usuarioService.getTablePaginated({
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
      component: ModalUsuarioFormComponent,
      cssClass: 'modal-usuario'
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
      component: ModalUsuarioFormComponent,
      cssClass: 'modal-usuario',
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
