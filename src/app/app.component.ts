import { Component, OnInit } from '@angular/core';
import { App } from '@capacitor/app';

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

  async ngOnInit() {
    this.onSystemDarkModechange();
    this.setAppDetails();
    this.pubgDataService.initData();
  }

  /* ---------------------------------- */
  /*               SYSTEM               */
  /* ---------------------------------- */

  async setAppDetails() {
    await App.getInfo()
      .then((res) => {
        const appInfo = {
          package: res.id,
          version: res.version,
          build: res.build,
          name: res.name,
        };
        localStorage.setItem('appInfo', JSON.stringify(appInfo));
      })
      .catch((err) => {
        const appInfo = {
          package: 'UnGunWiz',
          version: 'Web',
          build: 'Web',
          name: 'UnGunWiz',
        };
        localStorage.setItem('appInfo', JSON.stringify(appInfo));
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
}
