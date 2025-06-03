import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReferenciasPage } from './referencias.page';

describe('ReferenciasPage', () => {
  let component: ReferenciasPage;
  let fixture: ComponentFixture<ReferenciasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenciasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
