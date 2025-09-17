import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { FormsModule } from '@angular/forms';   

// Angular Material solo visual
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface FilaPago {
  totalCierres: number;
  numero: number;
  producto: string;
  fechaCierre: string;
  monto: number;
  facturada?: string;
  pagada?: string;
}

@Component({
  selector: 'app-panel-pagos-comisiones',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './panel-pagos-comisiones.component.html',
  styleUrls: ['./panel-pagos-comisiones.component.scss']
})
export class PanelPagosComisionesComponent {
  // Cabezal/resumen (solo display)
  resumen = { mes: 'AGOSTO', totalCierres: 4, totalMonto: 800 };

  // Filtros (solo UI, sin lógica)
  searchText = '';
  meses = [
    'ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
    'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'
  ];
  mesSeleccionado = 'AGOSTO';
  estatusFactura = ['Cualquiera', 'Facturada', 'No facturada'];
  estatusPago    = ['Cualquiera', 'Pagada', 'No pagada'];
  estatusFacturaSel = 'Cualquiera';
  estatusPagoSel    = 'Cualquiera';

  // Data dummy (solo UI)
  data: FilaPago[] = [
    { totalCierres: 1, numero: 1, producto: 'Taller IA desde CERO', fechaCierre: '1 de agosto de 2025', monto: 200 },
    { totalCierres: 1, numero: 1, producto: 'Curso IA Nivel 2',     fechaCierre: '1 de agosto de 2025', monto: 200 },
    { totalCierres: 1, numero: 1, producto: 'Taller IA desde CERO', fechaCierre: '1 de agosto de 2025', monto: 200 },
    { totalCierres: 1, numero: 1, producto: 'Curso IA Nivel 2',     fechaCierre: '1 de septiembre de 2025', monto: 200 }
  ];

  displayedColumns = ['totalCierres','numero','producto','fechaCierre','monto','facturada','pagada'];
  //notaOrden = 'ORDENAR SIEMPRE POR LO MÁS RECIENTE';
}
