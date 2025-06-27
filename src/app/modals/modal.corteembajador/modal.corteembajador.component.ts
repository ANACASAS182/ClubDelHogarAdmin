import { Component, Input, OnInit } from '@angular/core';
import { DetalleEmbajadorCorteMensual, PeriodoService } from 'src/app/services/api.back.services/periodo.service';
import { CorteMensualEmbajador } from '../../services/api.back.services/periodo.service';
import { UtileriasService } from '../../services/utilerias.service';
import { IonGrid } from "@ionic/angular/standalone";
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal.corteembajador',
  templateUrl: './modal.corteembajador.component.html',
  imports:[IonicModule, CommonModule],
  standalone:true,
  styleUrls: ['./modal.corteembajador.component.scss'],
})
export class ModalCorteembajadorComponent  implements OnInit {

  @Input() embajadorId:number = 0;
  @Input() periodoId:number = 0;

  detalleEmbajador?:DetalleEmbajadorCorteMensual;
  fechaRegistroTexto:string = "";

  constructor(private periodoService:PeriodoService, private utilerias:UtileriasService) { }
  
  ngOnInit() {
    this.loadData();
  }

  loadData(){
    this.periodoService.getDetalleEmbajadorMes(this.embajadorId, this.periodoId).subscribe({
      next:(data) =>{
          this.detalleEmbajador = data;
          this.fechaRegistroTexto = this.utilerias.formatearFecha(new Date(this.detalleEmbajador.fechaRegistro));

          data.referencias.forEach(rf => {
            rf.fechaEfectivaTexto = this.utilerias.formatearFechaCorta(new Date(rf.fechaEfectiva));
          });
      }
    });
  }

}
