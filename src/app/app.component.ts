import { Component, OnInit } from '@angular/core';
import { App } from '@capacitor/app';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

import { PubgDataService } from 'src/app/services/pubgData.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-root',
  templateUrl:
    environment.platform === 'web'
      ? 'app.component.html'
      : 'app.component.app.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private pubgDataService: PubgDataService,
    private settingsService: SettingsService,
    private http: HttpClient
  ) {}

  public appPages: any = [
    {
      title: 'Weapons',
      type: 'route',
      url: 'weaponlist',
      icon: 'stats-chart',
      location: 'tabbar',
      addDivider: false,
      disabled: false,
      hidden: false,
      debug: false,
    },
    {
      title: 'Graph',
      type: 'route',
      url: 'graph',
      icon: 'analytics-sharp',
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
      icon: 'code',
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
      icon: 'information-circle',
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
  public devMode = localStorage.getItem('devMode') === 'true' || false;

  ngOnInit() {
    this.onSystemDarkModechange();
    this.setAppDetails();
    this.pubgDataService.initData().then((pubgData: any) => {
      if (this.devMode) {
        console.debug(`pubgData:`, pubgData);
      }
    });
  }

  /* ---------------------------------- */
  /*               SYSTEM               */
  /* ---------------------------------- */

  private async setAppDetails() {
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
        this.http.get('/assets/version.json').subscribe({
          next: (data: any) => {
            const appInfo = {
              package: 'app.ungunwiz.net',
              version: data.version,
              build: data.buildNumber,
              name: 'UnGunWiz',
            };
            localStorage.setItem('appInfo', JSON.stringify(appInfo));
          },
          error: (error) => console.error('Error loading version info:', error),
        });
      });
  }

  /* ---------------------------------- */
  /*                 UI                 */
  /* ---------------------------------- */

  private onSystemDarkModechange() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDark.addListener((mediaQuery) => {
      this.settingsService.apply();
    });
  }
}
