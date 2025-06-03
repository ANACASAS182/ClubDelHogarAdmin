import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UsuarioService } from '../services/api.back.services/usuario.service';
import { lastValueFrom } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { RolesEnum } from '../enums/roles.enum';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private userService: UsuarioService, private toastController: ToastController, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const user = await lastValueFrom(this.userService.getUsuario());
    
    if (user.data.roles != null && user.data.roles?.enumValue == RolesEnum.Admin) {
      return true;
    } else {
      await this.showToast('No tienes permiso para acceder a esta sección');
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
   private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      position: 'bottom',
      color: 'danger'
    });
    toast.present();
  }
}