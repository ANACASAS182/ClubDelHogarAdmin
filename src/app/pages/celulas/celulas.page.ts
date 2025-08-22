import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { UsuarioService } from '../../services/api.back.services/usuario.service';

@Component({
  selector: 'app-celulas',
  templateUrl: './celulas.page.html',
  styleUrls: ['./celulas.page.scss'],
  standalone: false
})
export class CelulasPage implements OnInit, AfterViewInit {

  @ViewChild('svgRef', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  // Tamaño del lienzo (se recalcula)
  canvasWidth = 1200;
  canvasHeight = 800;

  // Tamaños base de nodo
  private readonly defaultNodeW = 180;
  private readonly defaultNodeH = 60;

  // Layout
  private topMargin = 60;
  private gapRootToHeaders = 100;   // raíz → admins
  private gapHeaderToItems = 50;    // admin → empresas
  private colGapX = 600;            // separación entre admins
  private rowGapItems = 24;         // separación vertical entre empresas

  private readonly chipsMax = 4;

  // Pan/Zoom
  scale = 1;
  panX = 0;
  panY = 0;
  transform = 'translate(0,0) scale(1)';
  private isPanning = false;
  private startX = 0;
  private startY = 0;

  // Escena
  baseNode: CelulaNode;
  precalculatedNodes: CelulaNode[] = [];
  precalculatedNodesReversed: CelulaNode[] = [];
  private svgWidth = 1200;
  nodeTextLeftPadding = 16;

  // “bus” raíz ↔ admins
  busY = 0;
  busVerticalPath = '';
  busHorizontalPath = '';

  // Medidor de texto
  private measureCtx: CanvasRenderingContext2D | null = null;

  constructor(private usuarioSerivice: UsuarioService) {
    this.baseNode = new CelulaNode();
    this.baseNode.nombre = 'Embassy';
    this.baseNode.contacto = '';
  }

  ngOnInit() {
    const canvas = document.createElement('canvas');
    this.measureCtx = canvas.getContext('2d');

    const svg = this.svgRef.nativeElement;
    // pan & zoom
    svg.addEventListener('mousedown', this.onMouseDown);
    svg.addEventListener('mousemove', this.onMouseMove);
    svg.addEventListener('mouseup', this.onMouseUp);
    svg.addEventListener('mouseleave', this.onMouseUp);
    svg.addEventListener('wheel', this.onWheel, { passive: false });
  }

  ngAfterViewInit() {
    // medir ya con layout listo
    const svg = this.svgRef.nativeElement;
    const bbox = svg.getBoundingClientRect();
    if (bbox.width > 0) this.svgWidth = bbox.width;

    // cargar y encuadrar
    this.loadDataCelula(0);
  }

  @HostListener('window:resize')
  onResize() {
    // re-medimos ancho disponible y re-encuadramos
    const svg = this.svgRef.nativeElement;
    const bbox = svg.getBoundingClientRect();
    if (bbox.width > 0) this.svgWidth = bbox.width;
    this.recomputeCanvasSize();
    this.fitToView();
  }

  // click centralizado: ignora empresas
  onNodeClick(node: CelulaNode) {
    if (node.tipoNodo === 'empresa') return;       // ← NO navega en empresas
    this.loadDataCelula(node.usuarioId);
  }

  // (opcional) si quieres mantener onRectClick para raíz/botones:
  onRectClick(target: number | CelulaNode) {
    if (typeof target === 'number') {
      this.loadDataCelula(target);
      return;
    }
    const node = target as CelulaNode;
    if (node.tipoNodo === 'empresa') return;       // ← por si acaso
    this.loadDataCelula(node.usuarioId);
  }

    // Gradiente por tipo
    gradientFor(node?: CelulaNode, isRoot = false): string {
      if (isRoot) return 'url(#gradRoot)';
      if (!node) return 'url(#gradAdmin)';
      return node.tipoNodo === 'empresa' ? 'url(#gradEmpresa)' : 'url(#gradAdmin)';
    }

  // Medir ancho mínimo del rectángulo según textos
  private measureNodeWidth(nombre: string, contacto: string): number {
    const ctx = this.measureCtx;
    if (!ctx) return this.defaultNodeW;

    const leftPad = this.nodeTextLeftPadding;
    const rightPad = 16;

    ctx.font = '18px sans-serif';
    const w1 = ctx.measureText(nombre || '').width;

    ctx.font = '12px sans-serif';
    const w2 = ctx.measureText(contacto || '').width;

    const content = Math.max(w1, w2);
    return Math.max(this.defaultNodeW, Math.ceil(content + leftPad + rightPad));
  }

  // Recalcular tamaño del SVG para no cortar contenido
  private recomputeCanvasSize() {
    const margin = 160;
    const nodes = [this.baseNode, ...this.precalculatedNodes];
    if (!nodes.length) {
      this.canvasWidth = 1200;
      this.canvasHeight = 800;
      return;
    }
    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x + n.w));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y + n.h));

    const contentW = (maxX - minX) + margin * 2;
    const contentH = (maxY - minY) + margin * 2;

    const svgEl = this.svgRef?.nativeElement;
    const viewportW = svgEl?.clientWidth || 1200;
    const viewportH = svgEl?.clientHeight || 600;

    this.canvasWidth  = Math.max(contentW, viewportW);
    this.canvasHeight = Math.max(contentH, viewportH);
  }

  // Ir a nivel superior (home o padre)
  nivelSuperior(parent: number) {
    this.loadDataCelula(parent);
  }

  // Carga de datos + layout
  loadDataCelula(usuariobaseId: number) {
    // reset
    this.precalculatedNodes = [];
    this.precalculatedNodesReversed = [];
    this.busVerticalPath = '';
    this.busHorizontalPath = '';
    this.panX = 0; this.panY = 0; this.scale = 1;
    this.updateTransform();

    this.usuarioSerivice.getCelulaFromHere(usuariobaseId).subscribe({
      next: (data: CelulaDisplay) => {

        const esDrilldown = usuariobaseId !== 0; // si no es Embassy (estás en un Admin)

        // --- raíz ---
        this.baseNode = data.nivel1 ?? new CelulaNode();
        this.baseNode.parentId = data.nivel1?.parentId ?? 0;
        this.baseNode.tipoNodo = 'usuario';
        this.baseNode.w = this.measureNodeWidth(this.baseNode.nombre, this.baseNode.contacto);
        this.baseNode.h = this.defaultNodeH;

        // Centrar raíz
        const centerX = this.svgWidth / 2;
        this.baseNode.x = Math.round(centerX - this.baseNode.w / 2);
        this.baseNode.y = this.topMargin;

        // Datos crudos
        const nivel2 = data.nivel2 ?? []; // en raíz = admins, en drilldown = empresas del admin actual
        const nivel3 = data.nivel3 ?? [];
        const nivel4 = data.nivel4 ?? [];

        // === MODO DRILLDOWN: mostrar EMPRESAS del admin en COLUMNA ===
        if (esDrilldown) {
          // sin “bus” horizontal en esta vista
          this.busVerticalPath = '';
          this.busHorizontalPath = '';

          // construir empresas (nivel2 en esta vista)
          const empresas = nivel2.map(n2 => {
            const it = new CelulaNode();
            it.usuarioId = n2.usuarioId;
            it.nombre    = n2.nombre;
            it.contacto  = n2.contacto;
            it.parent    = this.baseNode;     // el admin es el padre
            it.nivel     = 1;                 // empresa
            it.tipoNodo  = 'empresa';
            it.w         = this.measureNodeWidth(it.nombre, it.contacto);
            it.h         = this.defaultNodeH;

            const n4 = nivel4.filter(x => x.parentId === it.usuarioId);
            it.childrenCount   = n4.length;
            it.childrenPreview = n4.slice(0, this.chipsMax).map(x => x.nombre);
            it.children        = n4.map(x => x.nombre);

            return it;
          });

          // apilar vertical bajo el admin (centradas)
          const blockCenterX = this.baseNode.x + this.baseNode.w / 2;
          let cursorY = this.baseNode.y + this.baseNode.h + this.gapHeaderToItems;

          empresas.forEach(item => {
            item.x = Math.round(blockCenterX - item.w / 2);
            item.y = cursorY;
            this.precalculatedNodes.push(item);
            cursorY += item.h + this.rowGapItems;
          });

          this.precalculatedNodesReversed = this.precalculatedNodes.slice().reverse();
          this.recomputeCanvasSize();
          this.fitToView();
          return; // 👈 no ejecutar el layout de múltiples admins
        }

        // === MODO RAÍZ: admins centrados y sus empresas debajo ===

        // admins en fila centrada
        const nCols = Math.max(1, nivel2.length);
        const totalWidth = (nCols - 1) * this.colGapX;
        const firstColCenterX = centerX - totalWidth / 2;

        const headerNodes: CelulaNode[] = [];
        let colIndex = 0;

        for (const n2 of nivel2) {
          // Header/Admin
          const header = new CelulaNode();
          header.usuarioId = n2.usuarioId;
          header.nombre    = n2.nombre;
          header.contacto  = n2.contacto;
          header.parent    = this.baseNode;
          header.nivel     = 0;
          header.tipoNodo  = 'usuario';
          header.w         = this.measureNodeWidth(header.nombre, header.contacto);
          header.h         = this.defaultNodeH;

          const colCenterX = firstColCenterX + colIndex * this.colGapX;
          header.x = Math.round(colCenterX - header.w / 2);
          header.y = this.baseNode.y + this.baseNode.h + this.gapRootToHeaders;

          headerNodes.push(header);
          this.precalculatedNodes.push(header);

          // Empresas del admin
          const hijos = nivel3.filter(n3 => n3.parentId === n2.usuarioId);

          // Crear nodos empresa preliminares
          let prelim: CelulaNode[] = hijos.map(h => {
            const item = new CelulaNode();
            item.usuarioId = h.usuarioId;
            item.nombre    = h.nombre;
            item.contacto  = h.contacto;
            item.parent    = header;
            item.nivel     = 1;
            item.tipoNodo  = 'empresa';
            item.w         = this.measureNodeWidth(item.nombre, item.contacto);
            item.h         = this.defaultNodeH;

            // Chips (embajadores por empresa)
            const hijosN4 = nivel4.filter(n4 => n4.parentId === item.usuarioId);
            item.childrenCount   = hijosN4.length;
            item.childrenPreview = hijosN4.slice(0, this.chipsMax).map(x => x.nombre);
            item.children        = hijosN4.map(x => x.nombre);

            return item;
          });

          if (prelim.length > 10) {
            prelim = prelim.slice(0, 10);
          }

          // Si hay un solo admin en raíz → columna vertical bajo ese admin
          if (nivel2.length === 1) {
            const blockCenterX = header.x + header.w / 2;
            let cursorY = header.y + header.h + this.gapHeaderToItems;
            prelim.forEach(item => {
              item.x = Math.round(blockCenterX - item.w / 2);
              item.y = cursorY;
              this.precalculatedNodes.push(item);
              cursorY += item.h + this.rowGapItems;
            });
          } else {
            // Varios admins → grid balanceado por columnas
            const maxPorCol = 10;
            const colCount  = Math.min(4, Math.max(1, Math.ceil(prelim.length / maxPorCol)));
            let columns: CelulaNode[][] = Array.from({ length: colCount }, () => []);
            const heights: number[] = new Array(colCount).fill(0);
            prelim.forEach(node => {
              let best = 0;
              for (let i = 1; i < colCount; i++) {
                if (heights[i] < heights[best]) best = i;
              }
              columns[best].push(node);
              heights[best] += node.h + this.rowGapItems;
            });

            const colWidths = columns.map(col => col.reduce((m, n) => Math.max(m, n.w), 0));
            const interColGap = 24;
            const blockWidth  = colWidths.reduce((a, b) => a + b, 0) + interColGap * (colCount - 1);

            const blockCenterX = header.x + header.w / 2;
            const blockLeft = blockCenterX - blockWidth / 2;
            const topY = header.y + header.h + this.gapHeaderToItems;

            let cursorX = blockLeft;
            columns.forEach((col, ci) => {
              const colW = colWidths[ci];
              let cursorY = topY;
              col.forEach(item => {
                item.x = Math.round(cursorX + (colW - item.w) / 2);
                item.y = cursorY;
                this.precalculatedNodes.push(item);
                cursorY += item.h + this.rowGapItems;
              });
              cursorX += colW + interColGap;
            });
          }

          colIndex++;
        }

        // --- “bus” raíz ↔ admins ---
        if (headerNodes.length > 0) {
          const rootCx = this.baseNode.x + this.baseNode.w / 2;

          if (headerNodes.length === 1) {
            // caso especial: solo un admin → línea recta hacia abajo
            this.busY = headerNodes[0].y;
            this.busVerticalPath = `M ${rootCx} ${this.baseNode.y + this.baseNode.h} L ${rootCx} ${this.busY}`;
            this.busHorizontalPath = '';
            headerNodes[0].busY = this.busY;
          } else {
            // varios admins → línea horizontal normal
            this.busY = this.baseNode.y + this.baseNode.h + Math.floor(this.gapRootToHeaders / 2);
            const centers = headerNodes.map(h => h.x + h.w / 2);
            const minX = Math.min(...centers);
            const maxX = Math.max(...centers);

            this.busVerticalPath   = `M ${rootCx} ${this.baseNode.y + this.baseNode.h} L ${rootCx} ${this.busY}`;
            this.busHorizontalPath = `M ${minX} ${this.busY} L ${maxX} ${this.busY}`;

            headerNodes.forEach(h => h.busY = this.busY);
          }
        }

        this.precalculatedNodesReversed = this.precalculatedNodes.slice().reverse();
        this.recomputeCanvasSize();
        this.fitToView(); // auto-encuadre
      }
    });
  }

  // Encaja todo en el viewport del SVG
  private fitToView() {
    const nodes = [this.baseNode, ...this.precalculatedNodes];
    if (!nodes.length) return;

    const minX = Math.min(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxX = Math.max(...nodes.map(n => n.x + n.w));
    const maxY = Math.max(...nodes.map(n => n.y + n.h));

    const svgEl = this.svgRef.nativeElement;
    const vw = svgEl.clientWidth, vh = svgEl.clientHeight;
    const contentW = Math.max(1, maxX - minX);
    const contentH = Math.max(1, maxY - minY);

    const padding = 120;
    const zoomFactor = 0.7;
    const sx = (vw - padding * 2) / contentW;
    const sy = (vh - padding * 2) / contentH;
    this.scale = Math.max(0.2, Math.min(sx, sy)) * zoomFactor;

    const cx = minX + contentW / 2;
    const cy = minY + contentH / 2;
    this.panX = vw / 2 - this.scale * cx;
    this.panY = vh / 2 - this.scale * cy;
    this.updateTransform();
  }

  // Pan/zoom handlers
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
}

/* ====== Tipos de datos ====== */
export class CelulaDisplay {
  nivel1?: CelulaNode;
  nivel2?: CelulaNode[];
  nivel3?: CelulaNode[];
  nivel4?: CelulaNode[];
}

export class CelulaNode {
  usuarioId = 0;
  nombre = '';
  contacto = '';
  parentId = 0;
  parentNombre = '';

  w = 180;
  h = 60;

  nivel = 0;
  x = 0;
  y = 0;

  tipoNodo: 'usuario' | 'empresa' = 'usuario';
  busY?: number;

  children: string[] = [];
  parent?: CelulaNode;
  childrenCount = 0;
  childrenPreview: string[] = [];

  get ruta(): string {
    if (!this.parent) return '';

    if (this.nivel === 0 && this.busY !== undefined) {
      const cx = this.x + this.w / 2;
      return `M ${cx} ${this.busY} L ${cx} ${this.y}`;
    }

    if (this.nivel === 1 && this.parent) {
      const parentCenterX = this.parent.x + this.parent.w / 2;
      const parentBottomY = this.parent.y + this.parent.h;
      const childCenterX = this.x + this.w / 2;
      const childTopY = this.y;

      return `M ${parentCenterX} ${parentBottomY}
              L ${childCenterX} ${parentBottomY}
              L ${childCenterX} ${childTopY}`;
    }

    return '';
  }
}