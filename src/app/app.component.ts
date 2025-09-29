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

    const path = (typeof window !== 'undefined' && window.location && window.location.pathname) 
      ? window.location.pathname 
      : '/';

    const isPublicDeepLink =
      path.startsWith('/password/reset/') ||
      path.startsWith('/registro/') ||
      path === '/registro';

    if (logged) {
      if (path === '/' || path === '' || path === '/login') {
        await this.nav.navigateRoot('/dashboard');
      }
      return;
    }

    if (!isPublicDeepLink && (path === '/' || path === '')) {
      await this.nav.navigateRoot('/login');
    }
  }

}
