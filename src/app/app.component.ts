import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { TokenService } from './services/token.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  constructor(
    private tokenService: TokenService,
    private nav: NavController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.tokenService.init();

    const logged = await this.tokenService.isLoggedIn();

    // 🔓 Si ya está logueado, siempre mándalo al dashboard
    if (logged) {
      await this.nav.navigateRoot('/dashboard');
    } 
    else {
      // ❗ Solo manda al login si la URL actual es raíz
      const currentUrl = this.router.url;
      if (currentUrl === '/' || currentUrl === '') {
        await this.nav.navigateRoot('/login');
      }
      // Si está en /registro/:codigo o /registro, NO lo toques,
      // deja que el router cargue la página de registro.
    }
  }
}
