import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UsuarioService } from '../../services/api.back.services/usuario.service';

@Component({
  selector: 'app-celulas',
  templateUrl: './celulas.page.html',
  styleUrls: ['./celulas.page.scss'],
  standalone: false
})
export class CelulasPage implements OnInit {

  @ViewChild('svgRef', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  scale: number = 1;
  panX: number = 0;
  panY: number = 0;
  transform: string = 'translate(0,0) scale(1)';

  private isPanning = false;
  private startX = 0;
  private startY = 0;



  baseNode: CelulaNode;
  precalculatedNodes: CelulaNode[] = [];
  precalculatedNodesReversed: CelulaNode[] = [];

  xBase: number = 100;
  yBase: number = 40;

  nodeTextLeftPadding: number = 16;

  xSemiStep: number = 20;
  ySemiStep: number = 20;
  xStep: number = 260;
  yStep: number = 100;

  constructor(private usuarioSerivice: UsuarioService) {


    this.baseNode = new CelulaNode();
    this.baseNode.nombre = "Embassy";
    this.baseNode.contacto = "";
    this.baseNode.x = this.xBase;
    this.baseNode.y = this.yBase;
  }


  nivelSuperior(parent:number){
    this.loadDataCelula(parent);
  }

  loadDataCelula(usuariobaseId: number) {

    this.precalculatedNodes = [];

    this.panX = 0;
    this.panY = 0;

    this.usuarioSerivice.getCelulaFromHere(usuariobaseId).subscribe({
      next: (data) => {

        console.log(data);
        this.baseNode = data.nivel1!;
        this.baseNode.parentId = data.nivel1?.parentId!;

        this.baseNode.x = this.xBase;
        this.baseNode.y = this.yBase;


        let indexNivel2 = 1;
        data.nivel2?.forEach(nI => {
          let n1 = new CelulaNode();
          n1.usuarioId = nI.usuarioId;
          n1.nombre = nI.nombre;
          n1.contacto = nI.contacto;
          n1.x = this.xBase + this.xSemiStep;
          n1.y = this.yBase + (this.yStep * indexNivel2);
          n1.parent = this.baseNode;


           this.precalculatedNodes.push(n1);

          let indexNivel3 = 1;
          data.nivel3?.forEach(nJ => {

            if (nJ.parentId == n1.usuarioId) {
              let n1A = new CelulaNode();
              n1A.usuarioId = nJ.usuarioId;
              n1A.parent = n1;
              n1A.nombre = nJ.nombre;
              n1A.contacto = nJ.contacto;
              n1A.x = this.xBase + (this.xStep * indexNivel3);
              n1A.y = n1A.parent.y + this.ySemiStep;
              n1A.nivel = 1;

              let indexNivel4 = 1;
              n1A.children = [];
              data.nivel4?.forEach(nK => {

                if (nK.parentId == n1A.usuarioId) {

                  n1A.children!.push(nK.nombre);

                  indexNivel4++;

                  //this.precalculatedNodes.push(n1A);

                  // 

                }
              });



              indexNivel3++;

              this.precalculatedNodes.push(n1A);

             
            }



          });





         

          indexNivel2++;
        });


        this.precalculatedNodesReversed = this.precalculatedNodes.slice().reverse();

      }
    });
  }


  ngOnInit() {
    const svg = this.svgRef.nativeElement;

    this.loadDataCelula(0);


    svg.addEventListener('mousedown', this.onMouseDown);
    svg.addEventListener('mousemove', this.onMouseMove);
    svg.addEventListener('mouseup', this.onMouseUp);
    svg.addEventListener('mouseleave', this.onMouseUp);
    svg.addEventListener('wheel', this.onWheel, { passive: false });



  }

  onRectClick(nuevoUsuario: number) {
    this.loadDataCelula(nuevoUsuario);
  }

  updateTransform() {
    this.transform = `translate(${this.panX}, ${this.panY}) scale(${this.scale})`;
  }

  onMouseDown = (e: MouseEvent) => {
    this.isPanning = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
  };

  onMouseMove = (e: MouseEvent) => {
    if (!this.isPanning) return;
    this.panX += e.clientX - this.startX;
    this.panY += e.clientY - this.startY;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.updateTransform();
  };

  onMouseUp = () => {
    this.isPanning = false;
  };

  onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const dir = e.deltaY < 0 ? 1 : -1;
    this.scale *= (1 + dir * zoomIntensity);
    this.updateTransform();
  };

}

export class CelulaDisplay {
  nivel1?: CelulaNode;
  nivel2?: CelulaNode[];
  nivel3?: CelulaNode[];
  nivel4?: CelulaNode[];
}


export class CelulaNode {
  usuarioId: number = 0;
  nombre: string = "";
  contacto: string = "";
  
  parentId: number = 0;
  parentNombre: string = "";


  nivel: number = 0;

  x: number = 0;
  y: number = 0;

  children?: string[]
  parent?: CelulaNode;




  get ruta(): string {
    return `M ${this.parent!.x + 10} ${this.parent!.y + 60} C ${this.parent!.x + 10} ${this.y + 30}, ${this.parent!.x + 10} ${this.y + 30}, ${this.x} ${this.y + 30}`;
  }
}