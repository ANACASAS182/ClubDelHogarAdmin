import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalSeguimientoReferenciaComponent } from './modal.seguimiento.referencia.component';

describe('ModalSeguimientoReferenciaComponent', () => {
  let component: ModalSeguimientoReferenciaComponent;
  let fixture: ComponentFixture<ModalSeguimientoReferenciaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalSeguimientoReferenciaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalSeguimientoReferenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
