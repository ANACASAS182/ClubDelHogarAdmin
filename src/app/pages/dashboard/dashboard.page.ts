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
  public MenuPagesEnum = MenuPagesEnum;

  public appPages = [
    { enum: MenuPagesEnum.Grupos,        title: 'Grupos',        url: '/dashboard/grupos',       icon: 'people',    visible: false, access: [RolesEnum.Admin] },
    { enum: MenuPagesEnum.Empresas,      title: 'Empresas',      url: '/dashboard/empresas',     icon: 'business',  visible: false, access: [RolesEnum.Admin] },
    { enum: MenuPagesEnum.Productos,     title: 'Productos',     url: '/dashboard/productos',    icon: 'archive',   visible: false, access: [RolesEnum.Admin, RolesEnum.Socio] },
    { enum: MenuPagesEnum.Celulas,       title: 'Células',       url: '/dashboard/celulas',      icon: 'grid',      visible: false, access: [RolesEnum.Admin] },
    { enum: MenuPagesEnum.Embajadores,   title: 'Usuarios',   url: '/dashboard/embajadores',  icon: 'flag',      visible: false, access: [RolesEnum.Admin] },
    { enum: MenuPagesEnum.Referencias,   title: 'Referencias',   url: '/dashboard/referencias',  icon: 'star',      visible: false, access: [RolesEnum.Admin, RolesEnum.Socio] },
    { enum: MenuPagesEnum.Configuración, title: 'Periodos',      url: '/dashboard/periodos',     icon: 'calendar',  visible: false, access: [RolesEnum.Admin] },
    { enum: MenuPagesEnum.CorteMensual,  title: 'Corte mensual', url: '/dashboard/corte',        icon: 'calendar',  visible: false, access: [RolesEnum.Admin] },
    { enum: MenuPagesEnum.Configuración, title: 'Configuración', url: '/dashboard/configuracion', icon: 'settings',  visible: false, access: [RolesEnum.Admin, RolesEnum.Socio] },
  ];

  public userName = '';
  public celulasVisible = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tokenService: TokenService,
    private datePipe: DatePipe,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    const resolverData = this.route.snapshot.data['resolverData'];
    const user: Usuario = resolverData.usuario;
    this.userName = `${user.nombres} ${user.apellidos}`;

    if (!user.roles) return;

    this.appPages.forEach(el => {
      el.visible = el.access.includes(user.roles!.enumValue!);
    });

    // habilita el submenú si el item Células es visible para el rol
    this.celulasVisible = !!this.appPages.find(p => p.enum === MenuPagesEnum.Celulas && p.visible);
  }

  ngOnDestroy() {}

  async logout() {
    await this.tokenService.removeToken();
    this.appPages.forEach(p => p.visible = false);
    this.celulasVisible = false;
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
