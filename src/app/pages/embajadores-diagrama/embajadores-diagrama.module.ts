import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EmbajadoresDiagramaRoutingModule } from './embajadores-diagrama-routing.module';
import { EmbajadoresDiagramaPage } from './embajadores-diagrama.page';

@NgModule({
  declarations: [EmbajadoresDiagramaPage],
  imports: [CommonModule, IonicModule, EmbajadoresDiagramaRoutingModule],
})
export class EmbajadoresDiagramaModule {}