import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardPage } from './dashboard.page';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { AdminGuard } from 'src/app/guards/admin.guard';
import { ProductosResolver } from 'src/app/resolvers/productos.resolver';
import { ReferenciasResolver } from 'src/app/resolvers/referencias.resolver';
import { DashboardResolver } from 'src/app/resolvers/dashboard.resolver';

const routes: Routes = [
  {
    path: '',
    component: DashboardPage,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'inicio',
        loadChildren: () => import('../inicio/inicio.module').then(m => m.InicioPageModule)
      },
      {
        path: 'grupos',
        loadChildren: () => import('../grupo.socios/grupo.socios.module').then(m => m.GrupoSociosPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'empresas',
        loadChildren: () => import('../empresas/empresas.module').then(m => m.EmpresasPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'embajadores',
        loadChildren: () => import('../embajadores/embajadores.module').then(m => m.EmbajadoresPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'celulas',
        loadChildren: () => import('../celulas/celulas.module').then(m => m.CelulasPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'productos',
        loadChildren: () => import('../productos/productos.module').then(m => m.ProductosPageModule),
        resolve: {
          resolverData: ProductosResolver
        }
      },
      {
        path: 'referencias',
        loadChildren: () => import('../referencias/referencias.module').then(m => m.ReferenciasPageModule),
        resolve: {
          resolverData: ReferenciasResolver
        }
      },
      {
        path: 'movimientos',
        loadChildren: () => import('../movimientos/movimientos.module').then(m => m.MovimientosPageModule),
        canActivate: [AdminGuard]
      },
      {
        path: 'configuracion',
        loadChildren: () => import('../configuracion/configuracion.module').then(m => m.ConfiguracionPageModule)
      },
      {
        path: 'periodos',
        loadChildren: () => import('../periodos/periodos.module').then(m => m.PeriodosPageModule),
        canActivate: [AdminGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardPageRoutingModule { }
