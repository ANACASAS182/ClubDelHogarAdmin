import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PeriodosPage } from './periodos.page';

const routes: Routes = [
  {
    path: '',
    component: PeriodosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PeriodosPageRoutingModule {}
