import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GrupoSociosPage } from './grupo.socios.page';

const routes: Routes = [
  {
    path: '',
    component: GrupoSociosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GrupoSociosPageRoutingModule {}
