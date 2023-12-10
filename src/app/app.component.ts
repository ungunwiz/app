import { Component, OnInit } from '@angular/core';
import { PubgDataService } from '@service/pubgData.service';
import { SettingsService } from '@service/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private pubgDataService: PubgDataService,
    private settingsService: SettingsService
  ) {}
  public appPages = [
    {
      type: 'route',
      title: 'Weapon Profiles',
      url: '/weaponprofiles',
      icon: 'stats-chart',
    },
    { type: 'divider' },
    { type: 'route', title: 'Raw Data', url: '/rawdata', icon: 'code' },
    {
      type: 'route',
      title: 'About (WIP)',
      url: '/about',
      icon: 'information-circle',
      disabled: true,
    },
    {
      type: 'route',
      title: 'Settings',
      url: '/settings',
      icon: 'settings',
    },
  ];

  public pubgData: any = {};

  ngOnInit() {
    // localStorage.removeItem('pubgData');
    this.onSystemDarkModechange();
    this.generateDistances();

    Promise.all([
      this.getWeapons(),
      this.getDamageFalloffs(),
      this.getVelocityFalloffs(),
      this.getDamageAreas(),
    ]).then((data: any) => {
      const pubgData = {
        weapons: data[0],
        damageFalloffs: data[1],
        velocityFalloffs: data[2],
        damageAreas: data[3],
      };
      localStorage.setItem('pubgData', JSON.stringify(pubgData));
      this.pubgData = pubgData;
      console.debug(`pubgData:`, pubgData);
    });
  }

  /* ---------------------------------- */
  /*                 UI                 */
  /* ---------------------------------- */

  onSystemDarkModechange() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDark.addListener((mediaQuery) => {
      this.settingsService.apply();
    });
  }

  /* ---------------------------------- */
  /*           DATA PROCESSING          */
  /* ---------------------------------- */

  distances: any = [];
  calculatedDamageMultiplier: any = [];
  calculatedDamageFalloffs: any = {};

  generateDamageFallOffs() {
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

  generateDamageFallOff(weapon: any, distance: number) {
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

  calcDamage(weapon: any, options: any | null = null) {
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

  map(
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

  /* ---------------------------------- */
  /*              PUBG DATA             */
  /* ---------------------------------- */

  getWeapons() {
    return new Promise((resolve, reject) => {
      this.pubgDataService.getWeapons().subscribe((response: any) => {
        if (response.status === 'success') {
          resolve(response.data);
        }
      });
    });
  }
  getDamageFalloffs() {
    return new Promise((resolve, reject) => {
      this.pubgDataService.getDamageFalloffs().subscribe((response: any) => {
        if (response.status === 'success') {
          resolve(response.data);
        }
      });
    });
  }
  getVelocityFalloffs() {
    return new Promise((resolve, reject) => {
      this.pubgDataService.getVelocityFalloffs().subscribe((response: any) => {
        if (response.status === 'success') {
          resolve(response.data);
        }
      });
    });
  }
  getDamageAreas() {
    return new Promise((resolve, reject) => {
      this.pubgDataService.getDamageAreas().subscribe((response: any) => {
        if (response.status === 'success') {
          resolve(response.data);
        }
      });
    });
  }
}
