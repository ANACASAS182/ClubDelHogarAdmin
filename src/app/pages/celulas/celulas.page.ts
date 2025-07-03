import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-celulas',
  templateUrl: './celulas.page.html',
  styleUrls: ['./celulas.page.scss'],
  standalone:false
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

  ngOnInit() {
    const svg = this.svgRef.nativeElement;

    svg.addEventListener('mousedown', this.onMouseDown);
    svg.addEventListener('mousemove', this.onMouseMove);
    svg.addEventListener('mouseup', this.onMouseUp);
    svg.addEventListener('mouseleave', this.onMouseUp);
    svg.addEventListener('wheel', this.onWheel, { passive: false });
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
