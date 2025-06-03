import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductosPageRoutingModule } from './productos-routing.module';

import { ProductosPage } from './productos.page';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { IonicSelectableComponent, IonicSelectableMessageTemplateDirective } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductosPageRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    IonicSelectableComponent,
    IonicSelectableMessageTemplateDirective
  ],
  declarations: [ProductosPage]
})
export class ProductosPageModule { }
