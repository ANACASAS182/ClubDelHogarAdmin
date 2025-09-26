import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PasswordResetPage } from './password-reset.page';

const routes: Routes = [
  { path: '', component: PasswordResetPage }   // sin :token aquí
];

@NgModule({
  declarations: [PasswordResetPage],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class PasswordResetModule {}