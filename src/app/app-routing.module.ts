import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CelulasComponent } from './celulas/celulas.component';
import { EmbajadoresComponent } from './embajadores/embajadores.component';
import { EmpresasComponent } from './empresas/empresas.component';
import { GruposComponent } from './grupos/grupos.component';


const routes: Routes = [
  { path: 'celulas', component: CelulasComponent }, // Ruta protegida
  { path: 'embajadores', component: EmbajadoresComponent}, // Ruta protegida
  { path: 'empresas', component: EmpresasComponent }, // Ruta protegida
  { path: 'grupos', component: GruposComponent}, // Ruta protegida
  { path: '', redirectTo: '/empresas', pathMatch: 'full' }, // Ruta por defecto
  { path: '**', redirectTo: '/empresas' } // Ruta para no encontrados
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
