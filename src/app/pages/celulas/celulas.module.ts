import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CelulasPageRoutingModule } from './celulas-routing.module';

import { CelulasPage } from './celulas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CelulasPageRoutingModule
  ],
  declarations: [CelulasPage]
})
export class CelulasPageModule {}
