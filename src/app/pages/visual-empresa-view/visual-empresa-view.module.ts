import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { VisualEmpresaViewPageRoutingModule } from './visual-empresa-view-routing.module';
import { VisualEmpresaViewPage } from './visual-empresa-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisualEmpresaViewPageRoutingModule
  ],
  declarations: [VisualEmpresaViewPage]
})
export class VisualEmpresaViewPageModule {}