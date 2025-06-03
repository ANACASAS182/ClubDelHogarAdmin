import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal.qr.view',
  templateUrl: './modal.qr.view.component.html',
  styleUrls: ['./modal.qr.view.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],

})
export class ModalQrViewComponent implements OnInit {

  @Input() imagenBase64?: string = "";

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() { }

  close() {
    this.modalCtrl.dismiss();
  }
}
