import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReferenciasPageRoutingModule } from './referencias-routing.module';

import { ReferenciasPage } from './referencias.page';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { IonicSelectableComponent, IonicSelectableMessageTemplateDirective } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReferenciasPageRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    IonicSelectableComponent,
    IonicSelectableMessageTemplateDirective
  ],
  declarations: [ReferenciasPage]
})
export class ReferenciasPageModule { }
