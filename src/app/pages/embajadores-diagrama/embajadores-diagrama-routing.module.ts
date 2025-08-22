import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmbajadoresDiagramaPage } from './embajadores-diagrama.page';

const routes: Routes = [
  { path: '', component: EmbajadoresDiagramaPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmbajadoresDiagramaRoutingModule {}