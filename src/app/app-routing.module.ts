import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CelulasComponent } from './celulas/celulas.component';
import { EmbajadoresComponent } from './embajadores/embajadores.component';
import { EmpresasComponent } from './empresas/empresas.component';
import { GruposComponent } from './grupos/grupos.component';

const routes: Routes  = [
  { path: 'celulas', component: CelulasComponent },
  { path: 'embajadores', component: EmbajadoresComponent },
  { path: 'empresas', component: EmpresasComponent },
  { path: 'grupos', component: GruposComponent },
  { path: '', redirectTo: '/empresas', pathMatch: 'full' }, // ruta por defecto
  { path: '**', redirectTo: '/empresas' } // ruta para no encontrados
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
