import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PubgDataService {
  constructor(private http: HttpClient) {}

  // endpoint = "https://api.ungunwiz.app";
  endpoint = 'http://127.0.0.1:8080';

  /* ------------ Get Data ------------ */

  getWeapons() {
    return this.http.get(`${this.endpoint}/weapons`);
  }
  getDamageFalloffs() {
    return this.http.get(`${this.endpoint}/damagefalloffs`);
  }
  getVelocityFalloffs() {
    return this.http.get(`${this.endpoint}/velocityfalloffs`);
  }
  getDamageAreas() {
    return this.http.get(`${this.endpoint}/damageareas`);
  }
}
