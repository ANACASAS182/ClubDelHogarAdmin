import { Component } from '@angular/core';
import { SessionService } from './session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'EBGAdmin';

  sesionIniciada:boolean = false;

  cargando = true;
  constructor(private sessionService:SessionService){
    setTimeout(() => {
      this.cargando = false;
    }, 3000);
  }

  ngOnInit(): void {
    this.sesionIniciada = this.sessionService.SesionIniciada;
  }

}
