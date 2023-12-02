import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PubgDataService {
  constructor(private http: HttpClient) {}

  /* ------------ Get Data ------------ */

  getWeapons() {
    return this.http.get('http://192.168.178.25:8080/pubg_parser/weapons');
  }
  getDamageFalloffs() {
    return this.http.get(
      'http://192.168.178.25:8080/pubg_parser/damagefalloffs'
    );
  }
  getVelocityFalloffs() {
    return this.http.get(
      'http://192.168.178.25:8080/pubg_parser/velocityfalloffs'
    );
  }
  getDamageAreas() {
    return this.http.get('http://192.168.178.25:8080/pubg_parser/damageareas');
  }
}
