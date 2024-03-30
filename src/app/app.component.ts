import { Component, OnInit } from '@angular/core';
import { App } from '@capacitor/app';
import { environment } from 'src/environments/environment';

import { PubgDataService } from 'src/app/services/pubgData.service';
import { SettingsService } from 'src/app/services/settings.service';

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

  public appPages: any = [
    {
      title: 'Weapons',
      type: 'route',
      url: 'weaponlist',
      icon: 'stats-chart-sharp',
      location: 'tabbar',
      addDivider: false,
      disabled: false,
      hidden: false,
      debug: false,
    },
    {
      title: 'Raw Data',
      type: 'route',
      url: 'rawdata',
      icon: 'code-sharp',
      location: 'sidebar',
      addDivider: true,
      disabled: false,
      hidden: false,
      debug: true,
    },
    {
      title: 'GitHub',
      type: 'external',
      url: 'https://github.com/ungunwiz/app',
      icon: 'logo-github',
      location: 'sidebar',
      addDivider: false,
      disabled: false,
      hidden: false,
      debug: false,
    },
    {
      title: 'About (WIP)',
      type: 'route',
      url: 'about',
      icon: 'information-circle-sharp',
      location: 'sidebar',
      addDivider: false,
      disabled: false,
      hidden: true,
      debug: false,
    },
    {
      title: 'Settings',
      type: 'route',
      url: 'settings',
      icon: 'settings-sharp',
      location: 'sidebar',
      addDivider: false,
      disabled: false,
      hidden: false,
      debug: false,
    },
  ];
  public environment = environment;

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
