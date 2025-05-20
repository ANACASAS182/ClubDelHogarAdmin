import { Injectable, Type } from '@angular/core';
import { ModalComponent } from './modal/modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  modalHost!: ModalComponent;

  open<T>(component: Type<T>, data?: Partial<T>) {
    this.modalHost.open(component, data);
  }

  close() {
    this.modalHost.close();
  }
}
