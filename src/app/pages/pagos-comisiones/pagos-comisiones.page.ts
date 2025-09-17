import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { PanelPagosComisionesComponent } from '../../components/panel-pagos-comisiones/panel-pagos-comisiones.component';

@Component({
  selector: 'app-pagos-comisiones',
  standalone: true,
  imports: [CommonModule, IonicModule, PanelPagosComisionesComponent],
  templateUrl: './pagos-comisiones.page.html',
  styleUrls: ['./pagos-comisiones.page.scss'],
})
export class PagosComisionesPage {}
