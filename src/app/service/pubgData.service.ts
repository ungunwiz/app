import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PubgDataService {
  constructor(private http: HttpClient) {
    console.log(`Production: ${environment.production}`);
  }

  private api = environment.api;

  /* ------------ Get Data ------------ */

  getWeapons() {
    return this.http.get(`${this.api}/weapons`);
  }
  getDamageFalloffs() {
    return this.http.get(`${this.api}/damagefalloffs`);
  }
  getVelocityFalloffs() {
    return this.http.get(`${this.api}/velocityfalloffs`);
  }
  getDamageAreas() {
    return this.http.get(`${this.api}/damageareas`);
  }
}
