import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmpresasPageRoutingModule } from './empresas-routing.module';

import { EmpresasPage } from './empresas.page';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { IonicSelectableComponent, IonicSelectableMessageTemplateDirective } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmpresasPageRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    IonicSelectableComponent, 
    IonicSelectableMessageTemplateDirective
  ],
  declarations: [EmpresasPage]
})
export class EmpresasPageModule {}
