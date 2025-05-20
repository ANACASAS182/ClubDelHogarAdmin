import {
  Component,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  Type,
  AfterViewInit
} from '@angular/core';
import { ModalService } from '../modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html' // 👈 usamos archivo externo
})
export class ModalComponent implements AfterViewInit {
  @ViewChild('modalContainer', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;

  isVisible = false;
  private componentRef?: ComponentRef<any>;

  constructor(private modalService: ModalService) {}

  ngAfterViewInit() {
    this.modalService.modalHost = this;
  }

  open<T>(component: Type<T>, data?: Partial<T>) {
    this.container.clear();
    this.isVisible = true;
    this.componentRef = this.container.createComponent(component);

    if (data) {
      Object.assign(this.componentRef.instance, data);
    }

    this.isVisible = true;
  }

  close() {
    this.container.clear();
    this.isVisible = false;
  }
}
