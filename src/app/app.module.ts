import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EmpresasComponent } from './empresas/empresas.component';
import { EmbajadoresComponent } from './embajadores/embajadores.component';
import { CelulasComponent } from './celulas/celulas.component';

import { HttpClientModule } from '@angular/common/http';
import { SafeUrl64Pipe } from './sanitizer.pipe';
import { GruposComponent } from './grupos/grupos.component';
import { LoaderComponent } from './loader/loader.component';
import { NodoCelulaComponent } from './nodo-celula/nodo-celula.component';

@NgModule({
  declarations: [
    AppComponent,
    EmpresasComponent,
    EmbajadoresComponent,
    CelulasComponent,
    SafeUrl64Pipe,
    GruposComponent,
    LoaderComponent,
    NodoCelulaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
