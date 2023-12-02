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
      title: 'Settings (WIP)',
      url: '/settings',
      icon: 'settings',
    },
  ];

  public pubgData: any = {};

  ngOnInit() {
    this.onSystemDarkModechange();

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
    });
  }

  onSystemDarkModechange() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDark.addListener((mediaQuery) => {
      this.settingsService.applyColor();
    });
  }

  /* ------------ Pubg Data ----------- */

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
