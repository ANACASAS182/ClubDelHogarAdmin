import { Component, OnInit } from '@angular/core';
import { PeriodoDTO } from '../../models/DTOs/PeriodoDTO';
import { CorteMensual, DetalleEmbajadorCorteMensual, PeriodoService, CorteMensualEmpresas } from '../../services/api.back.services/periodo.service';
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

  // Filtros
  tipoCorteMensual: number = 1;       // 1=Embajadores, 2=Empresas
  empresaId?: number | null = null;   // "Todas" = null
  embajadorId?: number | null = null; // "Todos" = null

  empresas: Array<{id:number; nombre:string}> = [];
  embajadores: Array<{id:number; nombre:string}> = [];

  corteMensualEmbajadores?: CorteMensual;
  corteMensualEmpresas?: CorteMensualEmpresas;

  periodos: PeriodoDTO[] = [];
  periodoSeleccionado?: PeriodoDTO = undefined;

    // ===== Bonos locales (por ahora en front; luego los traemos del back) =====
  bonos: Record<number, number> = {};

  constructor(private periodoService: PeriodoService, private modalCtrl: ModalController) {}

  ngOnInit() {
    this.periodoSeleccionado = undefined;

    // 1) cargar periodos
    this.periodoService.getPeriodos().subscribe({
      next: (data) => {
        this.periodos = data;
        this.periodos.forEach(p => {
          if (!this.periodoSeleccionado && new Date(p.fechaFin) < new Date()) {
            this.periodoSeleccionado = p;
          }
        });
      }
    });

     // 2) cargar catálogos (simulado; conecta a tus services reales)
    // TODO: reemplaza por tus servicios reales de empresas/embajadores
    this.empresas = [{id: 0, nombre:'Todas las empresas'}]; // placeholder
    this.embajadores = [{id: 0, nombre:'Todos los embajadores'}]; // placeholder
  }

  corteMensual?: CorteMensual;

  // ===== KPIs solo para vista Embajadores (calculados en front) =====
  get embajadoresActivos(): number {
    const lista = this.corteMensualEmbajadores?.embajadores ?? [];
    return lista.filter(e => (e.referenciasDirectas + e.referenciasIndirectas) > 0
                           || (e.importeDirecto + e.importeIndirecto) > 0).length;
  }

  get referenciasConvertidas(): number {
    const lista = this.corteMensualEmbajadores?.embajadores ?? [];
    return lista.reduce((acc, e) => acc + (e.referenciasDirectas + e.referenciasIndirectas), 0);
  }

  bonoDe(embajadorId: number): number {
    return this.bonos[embajadorId] ?? 0;
  }

  totalAPagar(emb: { importeDirecto:number; importeIndirecto:number; id:number }): number {
    return (emb.importeDirecto || 0) + (emb.importeIndirecto || 0) + this.bonoDe(emb.id);
  }

  getCorteMensual() {
    if (!this.periodoSeleccionado?.id) return;

    // normaliza filtros (0 => null)
    const empresa = !this.empresaId || this.empresaId === 0 ? null : this.empresaId;
    const embajador = !this.embajadorId || this.embajadorId === 0 ? null : this.embajadorId;

    if (this.tipoCorteMensual === 1) {
      this.periodoService
        .getCorteMensualEmbajadores(this.periodoSeleccionado.id, empresa ?? undefined, embajador ?? undefined)
        .subscribe({
          next: (data) => {
            this.corteMensualEmbajadores = data;
            this.corteMensualEmpresas = undefined;
          }
        });
    } else {
      this.periodoService
        .getCorteMensualEmpresas(this.periodoSeleccionado.id, empresa ?? undefined)
        .subscribe({
          next: (data) => {
            this.corteMensualEmpresas = data;
            this.corteMensualEmbajadores = undefined;
          }
        });
    }
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