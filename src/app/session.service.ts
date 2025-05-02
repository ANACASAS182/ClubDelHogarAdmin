import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  SesionIniciada:boolean = false;

  private apiUrl = 'https://localhost:7146/'; // Cambia al puerto y endpoint real de tu backend
  

    constructor(private http: HttpClient) {}
  
  
}
