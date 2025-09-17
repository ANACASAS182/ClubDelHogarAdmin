import { Component, OnInit } from '@angular/core';
import { PeriodoDTO } from '../../models/DTOs/PeriodoDTO';
import { CorteMensual, DetalleEmbajadorCorteMensual, PeriodoService } from '../../services/api.back.services/periodo.service';
import { ModalCorteembajadorComponent } from 'src/app/modals/modal.corteembajador/modal.corteembajador.component';
import { ModalController } from '@ionic/angular';
import * as XLSX from 'xlsx';

// === Alias de celda compatible con tu versión de xlsx ===
type Cell = string | number | boolean | Date | null;

@Component({
  selector: 'app-corte-mensual',
  templateUrl: './corte-mensual.page.html',
  styleUrls: ['./corte-mensual.page.scss'],
  standalone: false
})
export class CorteMensualPage implements OnInit {

  periodos: PeriodoDTO[] = [];
  periodoSeleccionado?: PeriodoDTO = undefined;
  tipoCorteMensual: number = 1;

  constructor(private periodoService: PeriodoService, private modalCtrl: ModalController) {}

  ngOnInit() {
    this.periodoSeleccionado = undefined;
    this.periodoService.getPeriodos().subscribe({
      next: (data) => {
        this.periodos = data;
        this.periodos.forEach(p => {
          if (this.periodoSeleccionado == undefined) {
            if (new Date(p.fechaFin) < new Date()) {
              this.periodoSeleccionado = p;
              this.getCorteMensual();
            }
          }
        });
      }
    });
  }

  corteMensual?: CorteMensual;

  getCorteMensual() {
    this.periodoService.getCorteMensual(this.periodoSeleccionado?.id!).subscribe({
      next: (data) => {
        this.corteMensual = data;
      }
    });
  }

  detalleEmbajadorSeleccionado?: DetalleEmbajadorCorteMensual;

  async mostrarDetalleEmbajadorMes(embajadorId: number) {
    this.detalleEmbajadorSeleccionado = undefined;

    const modal = await this.modalCtrl.create({
      component: ModalCorteembajadorComponent,
      cssClass: 'modal-corte-mensual',
      componentProps: {
        embajadorId: embajadorId,
        periodoId: this.periodoSeleccionado?.id
      }
    });

    await modal.present();
  }

  exportarExcel() {
    if (!this.corteMensual) { return; }

    // ===== Hoja RESUMEN =====
    const resumenAOA: Cell[][] = [
      ['Periodo', this.periodoSeleccionado ? `${this.periodoSeleccionado.mesLetra} ${this.periodoSeleccionado.anio}` : ''],
      ['Tipo de corte', this.tipoCorteMensual === 1 ? 'Embajadores' : 'Empresas'],
      ['Embajadores / Mes', this.corteMensual?.embajadoresMes ?? 0],
      ['Importe Total Mes', this.corteMensual?.importeTotal ?? 0],
      ['Importe acumulado Embassy', this.corteMensual?.importeEmbassy ?? 0],
    ];
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenAOA);

    // ancho simple para 2 columnas
    (wsResumen as any)['!cols'] = [{ wch: 28 }, { wch: 22 }];

    // Formato moneda a filas 4 y 5 (índices 3 y 4) col 2 (índice 1)
    if ((wsResumen as any)['!ref']) {
      const r = XLSX.utils.decode_range((wsResumen as any)['!ref']);
      // filas 3 y 4 (0-based: 3 y 4) columna 1 (segunda columna)
      [3, 4].forEach(row => {
        const addr = XLSX.utils.encode_cell({ r: row, c: 1 });
        const cell = (wsResumen as any)[addr];
        if (cell && typeof cell.v === 'number') cell.z = '$#,##0.00';
      });
    }

    // ===== Hoja DETALLE =====
    const detalleAOA: Cell[][] = [
      ['Embajador', 'Referencias Directas', 'Ganancias Directas', 'Referencias Indirectas', 'Ganancias Indirectas']
    ];

    (this.corteMensual?.embajadores ?? []).forEach(e => {
      detalleAOA.push([
        e.nombre ?? '',
        e.referenciasDirectas ?? 0,
        e.importeDirecto ?? 0,
        e.referenciasIndirectas ?? 0,
        e.importeIndirecto ?? 0,
      ]);
    });

    const wsDetalle = XLSX.utils.aoa_to_sheet(detalleAOA);

    // Anchos de columna del detalle
    (wsDetalle as any)['!cols'] = [{ wch: 28 }, { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];

    // Formato moneda en columnas C y E (índices 2 y 4), desde la fila 2 en adelante
    if ((wsDetalle as any)['!ref']) {
      const rango = XLSX.utils.decode_range((wsDetalle as any)['!ref']);
      for (let r = 1; r <= rango.e.r; r++) { // saltar encabezado (r=0)
        [2, 4].forEach(c => {
          const addr = XLSX.utils.encode_cell({ r, c });
          const cell = (wsDetalle as any)[addr];
          if (cell && typeof cell.v === 'number') cell.z = '$#,##0.00';
        });
      }
    }

    // ===== Libro y guardado =====
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
    XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle');

    const nombreArchivo = `CorteMensual_${this.periodoSeleccionado?.anio ?? ''}_${this.periodoSeleccionado?.mesLetra ?? ''}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  }
}