import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PeriodosPage } from './periodos.page';

describe('PeriodosPage', () => {
  let component: PeriodosPage;
  let fixture: ComponentFixture<PeriodosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
