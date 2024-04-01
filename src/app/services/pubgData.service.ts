import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PubgDataService {
  constructor(private http: HttpClient) {}

  private api = environment.api;
  private lastUpdated = JSON.parse(
    localStorage.getItem('pubgDataLastUpdated') || '0'
  );
  private updateInterval = 3600;

  public pubgData: any;

  public get() {
    return new Promise((resolve, reject) => {
      if (this.pubgData) {
        resolve(this.pubgData);
      } else {
        setInterval(() => {
          this.get().then((data: any) => {
            resolve(data);
          });
        }, 100);
      }
    });
  }

  /* ---------------------------------- */
  /*             DATA FETCH             */
  /* ---------------------------------- */

  public initData() {
    return new Promise((resolve, reject) => {
      const savedData = localStorage.getItem('pubgData');
      const lastUpdated = JSON.parse(
        localStorage.getItem('pubgDataLastUpdated') || '0'
      );

      if (savedData) {
        this.pubgData = JSON.parse(savedData);
      }

      if (
        lastUpdated < Math.floor(Date.now() / 1000) - this.updateInterval ||
        !this.pubgData
      ) {
        Promise.all([
          this.getWeapons(),
          this.getDamageFalloffs(),
          this.getVelocityFalloffs(),
          this.getDamageAreas(),
        ])
          .then((data: any) => {
            this.pubgData = {
              weapons: data[0],
              damageFalloffs: data[1],
              velocityFalloffs: data[2],
              damageAreas: data[3],
            };

            this.lastUpdated = Math.floor(Date.now() / 1000);
            localStorage.setItem(
              'pubgDataLastUpdated',
              JSON.stringify(this.lastUpdated)
            );
            localStorage.setItem('pubgData', JSON.stringify(this.pubgData));
            this.generateDistances();
            resolve(this.pubgData);
          })
          .catch((error) => {
            console.error(error);
            reject();
          });
      } else {
        const lastUpdate = new Date(lastUpdated * 1000).toLocaleTimeString();
        const nextUpdate = new Date(
          (lastUpdated + this.updateInterval) * 1000
        ).toLocaleTimeString();
        console.info(
          `Using saved data. Last updated: ${lastUpdate}. Next update at ${nextUpdate}.`
        );
        resolve(this.pubgData);
      }
    });
  }

  private getWeapons() {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/weapons`).subscribe((data: any) => {
        if (data.status === 'success') {
          resolve(data.data);
        } else {
          reject();
        }
      });
    });
  }
  private getDamageFalloffs() {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/damagefalloffs`).subscribe((data: any) => {
        if (data.status === 'success') {
          resolve(data.data);
        } else {
          reject();
        }
      });
    });
  }
  private getVelocityFalloffs() {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/velocityfalloffs`).subscribe((data: any) => {
        if (data.status === 'success') {
          resolve(data.data);
        } else {
          reject();
        }
      });
    });
  }
  private getDamageAreas() {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/damageareas`).subscribe((data: any) => {
        if (data.status === 'success') {
          resolve(data.data);
        } else {
          reject();
        }
      });
    });
  }

  /* ---------------------------------- */
  /*           DATA PROCESSING          */
  /* ---------------------------------- */

  distances: any = [];
  calculatedDamageMultiplier: any = [];
  calculatedDamageFalloffs: any = {};

  private generateDamageFallOffs() {
    this.pubgData.weapons.forEach((weapon: any) => {
      this.calculatedDamageFalloffs[weapon.name] = [];
      this.distances.forEach((distance: any) => {
        const { start, end } = this.generateDamageFallOff(weapon, distance);
        this.calculatedDamageMultiplier.push({
          weapon: weapon.name,
          start: { distance: start.distance, multiplier: start.multiplier },
          end: { distance: end.distance, multiplier: end.multiplier },
        });
        var multiplier: any = this.map(
          distance,
          start.distance,
          end.distance,
          start.multiplier,
          end.multiplier
        );
        this.calculatedDamageFalloffs[weapon.name].push(multiplier);
      });
    });
  }

  private generateDamageFallOff(weapon: any, distance: number) {
    const damageFalloffs = this.pubgData.damageFalloffs.filter((entry: any) => {
      return entry.weapon_name === weapon.name;
    });
    if (damageFalloffs.length === 0) {
      return {
        start: { distance: '0', multiplier: 1 },
        end: { distance: '1000', multiplier: 1 },
      };
    } else if (damageFalloffs.length === 1) {
      return {
        start: { distance: '0', multiplier: 1 },
        end: damageFalloffs[0],
      };
    }
    damageFalloffs.sort((a: any, b: any) => a.distance - b.distance);
    const last = damageFalloffs[damageFalloffs.length - 1];
    if (last.distance < 1000) {
      damageFalloffs.push({ distance: '1000', multiplier: last.multiplier });
    }

    let start: any = damageFalloffs[0] || { distance: '1', multiplier: 1 };
    let end: any = damageFalloffs[1] || { distance: '1000', multiplier: 1 };
    let endSelected = false;
    damageFalloffs.forEach((damageFalloff: any) => {
      if (distance > damageFalloff.distance) {
        start = damageFalloff;
      }
      if (distance <= damageFalloff.distance && !endSelected) {
        end = damageFalloff;
        endSelected = true;
      }
    });

    return { start, end };
  }

  public calcDamage(weapon: any, options: any | null = null) {
    let damage = weapon.damage;
    if (options.distance) {
      options.distance -= 1;
      damage *= this.calculatedDamageFalloffs[weapon.name][options.distance];
    }
    if (options.area) {
      // TODO: Implement:
    }
    if (options.weaponType) {
      // TODO: Implement:
    }

    return damage;
  }

  /* ---------------------------------- */
  /*          HELPER FUNCTIONS          */
  /* ---------------------------------- */

  private map(
    value: number,
    start1: number,
    stop1: number,
    start2: number,
    stop2: number
  ) {
    value = parseFloat(value.toString());
    start1 = parseFloat(start1.toString());
    stop1 = parseFloat(stop1.toString());
    start2 = parseFloat(start2.toString());
    stop2 = parseFloat(stop2.toString());
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  }

  generateDistances(start: number = 1, end: number = 1000) {
    for (let i = start; i <= end; i++) {
      this.distances.push(i);
    }
  }
}
