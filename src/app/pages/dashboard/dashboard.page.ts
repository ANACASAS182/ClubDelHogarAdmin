import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuPagesEnum } from 'src/app/enums/menu.pages.enum';
import { RolesEnum } from 'src/app/enums/roles.enum';
import { Usuario } from 'src/app/models/Usuario';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit, OnDestroy {
  public appPages = [
    { enum: MenuPagesEnum.Grupos, title: 'Grupos', url: '/dashboard/grupos', icon: 'people', visible: false, access: [RolesEnum.Admin] },
    { enum: MenuPagesEnum.Empresas, title: 'Empresas', url: '/dashboard/empresas', icon: 'business', visible: false, access: [RolesEnum.Admin] },
    { enum: MenuPagesEnum.Embajadores, title: 'Embajadores', url: '/dashboard/embajadores', icon: 'flag', visible: false, access: [RolesEnum.Admin] },
    { enum: MenuPagesEnum.Celulas, title: 'Células', url: '/dashboard/celulas', icon: 'grid', visible: false, access: [RolesEnum.Admin] },
    { enum: MenuPagesEnum.Productos, title: 'Productos', url: '/dashboard/productos', icon: 'archive', visible: false, access: [RolesEnum.Admin, RolesEnum.Socio] },
    { enum: MenuPagesEnum.Referencias, title: 'Referencias', url: '/dashboard/referencias', icon: 'star', visible: false, access: [RolesEnum.Admin, RolesEnum.Socio] },
    // { enum: MenuPagesEnum.Movimientos, title: 'Movimientos', url: '/dashboard/movimientos', icon: 'sync-circle', visible: false, access: [RolesEnum.Admin] },
    { enum: MenuPagesEnum.Configuración, title: 'Periodos', url: '/dashboard/periodos', icon: 'calendar', visible: false, access: [RolesEnum.Admin] },
    { enum: MenuPagesEnum.CorteMensual, title: 'Corte mensual', url: '/dashboard/corte', icon: 'calendar', visible: false, access: [RolesEnum.Admin] },
    { enum: MenuPagesEnum.Configuración, title: 'Configuración', url: '/dashboard/configuracion', icon: 'settings', visible: false, access: [RolesEnum.Admin, RolesEnum.Socio] },

  ];

  public userName = "";

  constructor(private router: Router, private route: ActivatedRoute,
    private tokenService: TokenService, private datePipe: DatePipe, private usuarioService: UsuarioService) { }

  ngOnDestroy() {
  }

  ngOnInit() {
    const resolverData = this.route.snapshot.data['resolverData'];
    let user: Usuario = resolverData.usuario;
    this.userName = user.nombres + " " + user.apellidos;

    if (user.roles == undefined) {
      return;
    }

    this.appPages.forEach(element => {
      const show = element.access.includes(user.roles?.enumValue!);
      if (show) {
        element.visible = true;
      } else {
        element.visible = false;
      }
    });
  }

  async logout() {
    await this.tokenService.removeToken();
    this.appPages.forEach(p => p.visible = false); // limpiar menú visible
    this.router.navigate(['/login'], { replaceUrl: true });

  }

}
