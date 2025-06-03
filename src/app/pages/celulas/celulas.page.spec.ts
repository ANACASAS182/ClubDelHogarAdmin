import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CelulasPage } from './celulas.page';

describe('CelulasPage', () => {
  let component: CelulasPage;
  let fixture: ComponentFixture<CelulasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CelulasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
