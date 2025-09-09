import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { VisualEmpresaViewPageRoutingModule } from './visual-empresa-view-routing.module';
import { VisualEmpresaViewPage } from './visual-empresa-view.page';

import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisualEmpresaViewPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [VisualEmpresaViewPage]
})
export class VisualEmpresaViewPageModule {}