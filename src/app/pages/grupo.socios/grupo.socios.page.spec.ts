import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GrupoSociosPage } from './grupo.socios.page';

describe('GrupoSociosPage', () => {
  let component: GrupoSociosPage;
  let fixture: ComponentFixture<GrupoSociosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GrupoSociosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
