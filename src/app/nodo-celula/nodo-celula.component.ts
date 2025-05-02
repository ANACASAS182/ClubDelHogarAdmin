import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-nodo-celula',
  templateUrl: './nodo-celula.component.html',
  styleUrls: ['./nodo-celula.component.css']
})
export class NodoCelulaComponent {
  @Input() nodo!: NodoCelula;
}

interface NodoCelula {
  nombre: string;
  hijos: NodoCelula[];
}