import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CorteMensualPage } from './corte-mensual.page';

describe('CorteMensualPage', () => {
  let component: CorteMensualPage;
  let fixture: ComponentFixture<CorteMensualPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CorteMensualPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
