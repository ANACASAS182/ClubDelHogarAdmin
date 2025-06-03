import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmbajadoresPage } from './embajadores.page';

describe('EmbajadoresPage', () => {
  let component: EmbajadoresPage;
  let fixture: ComponentFixture<EmbajadoresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmbajadoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
