import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UsuarioService } from 'src/app/services/api.back.services/usuario.service';

type RoleBox = 'root' | 'n2' | 'n3';

class BoxNode {
  x = 0; y = 0; w = 180; h = 60;
  usuarioId = 0;
  parentId = 0;
  nombre = ''; contacto = ''; role: RoleBox = 'n3';

  // paths
  rutaDesdeBus?: string;     // n2: vertical bus -> nodo
  rutaDesdePadre?: string;   // n3: vertical padre -> nodo
}

@Component({
  selector: 'app-embajadores-diagrama',
  templateUrl: './embajadores-diagrama.page.html',
  styleUrls: ['./embajadores-diagrama.page.scss'],
  standalone: false
})
export class EmbajadoresDiagramaPage implements OnInit {

  @ViewChild('svgRef', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  // Pan & zoom
  scale = 1;
  panX = 0;
  panY = 0;
  transform = 'translate(0,0) scale(1)';
  private isPanning = false;
  private startX = 0;
  private startY = 0;

  // Escena
  miniWidth = 1200;  // solo para cálculos iniciales
  miniHeight = 500;

  // Nodos
  rootNode?: BoxNode;
  n2Nodes: BoxNode[] = [];
  n3Nodes: BoxNode[] = [];

  // Conectores
  busVerticalPath = '';
  busHorizontalPath = '';

  // Layout (igualado a Empresas)
  private topMargin = 90;
  private gapRootN2 = 90;      // distancia raíz -> fila N2
  private gapN2N3 = 90;        // distancia N2 -> N3
  private colGapX = 340;       // separación horizontal N2
  private busOffset = 45;      // raíz->bus (línea vertical hasta aquí)

  // Medidor de texto
  private ctx: CanvasRenderingContext2D | null = null;

  getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }


  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    const canvas = document.createElement('canvas');
    this.ctx = canvas.getContext('2d');

    // Carga inicial (0 = raíz)
    this.load(0);

    // Eventos pan & zoom
    const svg = this.svgRef.nativeElement;
    svg.addEventListener('mousedown', this.onMouseDown);
    svg.addEventListener('mousemove', this.onMouseMove);
    svg.addEventListener('mouseup', this.onMouseUp);
    svg.addEventListener('mouseleave', this.onMouseUp);
    svg.addEventListener('wheel', this.onWheel, { passive: false });
  }

  // ------------------  Pan & Zoom  ------------------
  private updateTransform() {
    this.transform = `translate(${this.panX}, ${this.panY}) scale(${this.scale})`;
  }
  private onMouseDown = (e: MouseEvent) => {
    this.isPanning = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
  };
  private onMouseMove = (e: MouseEvent) => {
    if (!this.isPanning) return;
    this.panX += e.clientX - this.startX;
    this.panY += e.clientY - this.startY;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.updateTransform();
  };
  private onMouseUp = () => { this.isPanning = false; };
  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const k = 0.1;
    const dir = e.deltaY < 0 ? 1 : -1;
    this.scale *= (1 + dir * k);
    this.updateTransform();
  };

  // ------------------  Helpers  ------------------
  private nameOf(u?: any) {
    if (!u) return '';
    if (u.nombre) return String(u.nombre);
    return [u.nombres, u.apellidos].filter(Boolean).join(' ').trim();
  }
  private contactOf(u?: any) {
    if (!u) return '';
    return u.contacto ?? u.email ?? u.celular ?? '';
  }
  private idOf(u?: any) {
    return u?.usuarioId ?? u?.id ?? 0;
  }
  private measureW(nombre: string, contacto: string, padLeft = 14) {
    const rightPad = 14;
    if (!this.ctx) return 180;
    this.ctx.font = '18px sans-serif';
    const w1 = this.ctx.measureText(nombre || '').width;
    this.ctx.font = '12px sans-serif';
    const w2 = this.ctx.measureText(contacto || '').width;
    return Math.max(220, Math.ceil(Math.max(w1, w2) + padLeft + rightPad));
  }

  // ------------------  Carga + Layout  ------------------
  private load(usuarioBaseId: number) {
    // reset
    this.n2Nodes = [];
    this.n3Nodes = [];
    this.busVerticalPath = '';
    this.busHorizontalPath = '';
    this.panX = 0; this.panY = 0; this.scale = 1; this.updateTransform();

    const hostW = this.svgRef?.nativeElement?.parentElement?.clientWidth || 1200;
    this.miniWidth = hostW;

    this.usuarioService.getArbolEmbajadores(usuarioBaseId).subscribe({
        next: (data: any) => {
        // -------- raíz (nivel1) centrada --------
        const root = new BoxNode();
        root.role = 'root';
        root.nombre = this.nameOf(data?.nivel1);
        root.contacto = this.contactOf(data?.nivel1);
        root.usuarioId = this.idOf(data?.nivel1);
        root.parentId  = data?.nivel1?.parentId ?? 0;
        root.w = this.measureW(root.nombre, root.contacto);
        root.h = 60;
        root.x = Math.round(this.miniWidth/2 - root.w/2);
        root.y = this.topMargin;
        this.rootNode = root;

        // -------- nivel 2 (hijos directos) en una fila --------
        const n2 = (data?.nivel2 || []) as any[];
        const yN2 = root.y + this.gapRootN2;
        const centersN2: number[] = [];
        const rootCx = Math.round(root.x + root.w/2);
        // La barra horizontal (bus) va a mitad del gap
        const busY = Math.round(root.y + (this.gapRootN2 / 2));

        if (n2.length > 0) {
        const totalWidth = (n2.length - 1) * this.colGapX;
        const firstCenterX = (this.miniWidth/2) - totalWidth/2;

        n2.forEach((n: any, idx: number) => {
            const node = new BoxNode();
            node.role = 'n2';
            node.usuarioId = this.idOf(n);
            node.parentId  = n?.parentId ?? 0;
            node.nombre = this.nameOf(n);
            node.contacto = this.contactOf(n);
            node.w = this.measureW(node.nombre, node.contacto);
            node.h = 60;

            const colCenterX = firstCenterX + idx * this.colGapX;
            node.x = Math.round(colCenterX - node.w/2);
            node.y = yN2;

            // === LÍNEA VERTICAL BUS -> N2 (recta) ===
            const cx = Math.round(node.x + node.w/2);
            node.rutaDesdeBus = `M ${cx} ${busY} L ${cx} ${node.y}`;
            centersN2.push(cx);

            this.n2Nodes.push(node);
        });

        // === VERTICAL raíz -> BUS (recta) ===
        this.busVerticalPath   = `M ${rootCx} ${root.y + root.h} L ${rootCx} ${busY}`;

        // === HORIZONTAL BUS (recta) ===
        if (centersN2.length === 1) {
            const only = centersN2[0];
            const left  = Math.min(rootCx, only);
            const right = Math.max(rootCx, only);
            this.busHorizontalPath = `M ${left} ${busY} L ${right} ${busY}`;
        } else {
            this.busHorizontalPath = `M ${Math.min(...centersN2)} ${busY} L ${Math.max(...centersN2)} ${busY}`;
        }
        }

        // -------- nivel 3 (debajo de cada n2, recto) --------
        const n3 = (data?.nivel3 || []) as any[];
        this.n2Nodes.forEach((p: BoxNode) => {
        const hijos = n3.filter((x: any) => (x?.parentId ?? 0) === p.usuarioId);
        if (!hijos.length) return;

        const parentCx = Math.round(p.x + p.w/2);
        const baseY = p.y + p.h + (this.gapN2N3 - 40);

        hijos.forEach((h: any, j: number) => {
            const child = new BoxNode();
            child.role = 'n3';
            child.usuarioId = this.idOf(h);
            child.parentId  = h?.parentId ?? 0;
            child.nombre = this.nameOf(h);
            child.contacto = this.contactOf(h);
            child.w = this.measureW(child.nombre, child.contacto);
            child.h = 60;

            // apilar centrados bajo su padre
            child.x = Math.round(parentCx - child.w/2);
            child.y = baseY + j * (child.h + 18);

            // === VERTICAL PADRE -> N3 (recta) ===
            child.rutaDesdePadre = `M ${parentCx} ${p.y + p.h} L ${parentCx} ${child.y}`;

            this.n3Nodes.push(child);
        });
        });

        // Alto SVG
        const bottoms = [
          (this.rootNode?.y ?? 0) + (this.rootNode?.h ?? 0),
          ...this.n2Nodes.map(n => n.y + n.h),
          ...this.n3Nodes.map(n => n.y + n.h),
        ];
        const maxBottom = bottoms.length ? Math.max(...bottoms) : 0;
        this.miniHeight = Math.max(maxBottom + 120, 520);
      }
    });
  }

  // Navegación por clicks
  goHome() { this.load(0); }
  goUp()   { if (this.rootNode?.parentId) this.load(this.rootNode.parentId); }
  onN2Click(node: BoxNode) { this.load(node.usuarioId); }
}