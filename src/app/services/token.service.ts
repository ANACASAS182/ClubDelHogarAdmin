import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  private isInitialized = false;

  async init() {
    if (!this.isInitialized) {
      const storage = await this.storage.create();
      this._storage = storage;
      this.isInitialized = true;
    }
  }

  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  private async ensureReady() {
    if (!this.isInitialized) await this.init();
  }
  async saveToken(token: string) { 
    await this.ensureReady(); 
    await this._storage!.set('jwt-token', token); 
  }
  async getToken() { 
    await this.ensureReady(); 
    return await this._storage!.get('jwt-token'); 
  }
  async removeToken() { 
    await this.ensureReady(); 
    await this._storage!.remove('jwt-token'); 
  }
  async clearAll() { 
    await this.ensureReady(); 
    await this._storage!.clear(); 
  }

  
}