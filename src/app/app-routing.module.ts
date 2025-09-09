import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NoAuthGuard } from './guards/no-auth.guard';
import { AuthGuard } from './guards/auth.guard';
import { DashboardResolver } from './resolvers/dashboard.resolver';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // 🔓 públicas
  { path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule),
    canActivate: [NoAuthGuard],
    runGuardsAndResolvers: 'always'
  },
  { path: 'registro',
    loadChildren: () => import('./pages/registro/registro.module').then(m => m.RegistroPageModule),
    runGuardsAndResolvers: 'always'
  },
  { path: 'registro/:codigo',
    loadChildren: () => import('./pages/registro/registro.module').then(m => m.RegistroPageModule),
    runGuardsAndResolvers: 'always'
  },

  // 🔒 protegidas
  { path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule),
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
    resolve: { resolverData: DashboardResolver }
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      onSameUrlNavigation: 'reload',
      enableTracing: true // 👈 temporal, verás logs en consola
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
