import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CorteMensualPageRoutingModule } from './corte-mensual-routing.module';

import { CorteMensualPage } from './corte-mensual.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CorteMensualPageRoutingModule
  ],
  declarations: [CorteMensualPage]
})
export class CorteMensualPageModule {}
