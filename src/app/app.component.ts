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
    // Asegura storage listo
    await this.tokenService.init();

    // Decide ruta inicial (sin dejar historial)
    const logged = await this.tokenService.isLoggedIn();
    if (logged) {
      await this.nav.navigateRoot('/dashboard');
    } else {
      await this.nav.navigateRoot('/login');
    }
  }
}
