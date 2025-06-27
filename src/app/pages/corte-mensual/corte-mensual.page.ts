import { Component, OnInit } from '@angular/core';
import { PeriodoDTO } from '../../models/DTOs/PeriodoDTO';
import { CorteMensual, DetalleEmbajadorCorteMensual, PeriodoService } from '../../services/api.back.services/periodo.service';
import { ModalCorteembajadorComponent } from 'src/app/modals/modal.corteembajador/modal.corteembajador.component';
import { ModalController } from '@ionic/angular';

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

  constructor(private periodoService: PeriodoService, private modalCtrl: ModalController) { }

  ngOnInit() {
    this.periodoSeleccionado = undefined;
    this.periodoService.getPeriodos().subscribe({
      next: (data) => {
        console.log(data);
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
        console.log(data);
        this.corteMensual = data;
      }
    });
  }


  detalleEmbajadorSeleccionado?: DetalleEmbajadorCorteMensual;


  async mostrarDetalleEmbajadorMes(embajadorId:number) {
    this.detalleEmbajadorSeleccionado = undefined;

    const modal = await this.modalCtrl.create({
      component: ModalCorteembajadorComponent,
      cssClass: 'modal-corte-mensual',
      componentProps: {
        embajadorId: embajadorId,
        periodoId:this.periodoSeleccionado?.id 
      }
    });

    await modal.present();

  }

}
