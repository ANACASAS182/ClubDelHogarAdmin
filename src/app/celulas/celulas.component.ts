import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-celulas',
  templateUrl: './celulas.component.html',
  styleUrls: ['./celulas.component.css']
})
export class CelulasComponent {

  celula_actual?: CelulaDTO;

  ngOnInit(): void {
    // Nivel 4 - Bisnietos
    const bisnieto1: NodoCelula = { nombre: 'Angel Romero', hijos: [] };
    const bisnieto2: NodoCelula = { nombre: 'Julio Martínez', hijos: [] };
    const bisnieto3: NodoCelula = { nombre: 'José Torres', hijos: [] };
    const bisnieto4: NodoCelula = { nombre: 'Antonio Puga', hijos: [] };
  
    // Nivel 3 - Nietos
    const nieto1: NodoCelula = { nombre: 'Karla Piña', hijos: [bisnieto1] };
    const nieto2: NodoCelula = { nombre: 'Irene Rivas', hijos: [bisnieto2, bisnieto3] };
    const nieto3: NodoCelula = { nombre: 'Angelica Granados', hijos: [] };
    const nieto4: NodoCelula = { nombre: 'Ileana Leon', hijos: [bisnieto4] };
  
    // Nivel 2 - Hijos
    const hijo1: NodoCelula = { nombre: 'Josue Angeles', hijos: [nieto1, nieto2] };
    const hijo2: NodoCelula = { nombre: 'Yonatan Castro', hijos: [nieto3] };
    const hijo3: NodoCelula = { nombre: 'Jesus Gomez', hijos: [nieto4] };
  
    // Nivel 1 - Yo
    const yo: NodoCelula = { nombre: 'Julio Laborin', hijos: [hijo1, hijo2, hijo3] };
  
    // Nivel 0 - Padre
    const padre: NodoCelula = { nombre: 'Ana Laura Casas', hijos: [yo] };
  
    // DTO
    this.celula_actual = {
      padre: padre,
      yo: yo,
      hijos: yo.hijos,
    };
  }
  

}


interface NodoCelula {
  nombre: string;
  hijos: NodoCelula[];
}

interface CelulaDTO {
  padre: NodoCelula;
  yo: NodoCelula;
  hijos: NodoCelula[];
}
