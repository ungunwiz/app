import { Component, OnInit } from '@angular/core';
import { SettingsService } from '@service/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsPage implements OnInit {
  constructor(public settingsService: SettingsService) {}

  settings: any;
  appName: any;
  appVersion: any;
  appBuild: any;

  buildTaps = 0;
  buildTimeout: any;
  devMode = localStorage.getItem('devMode') === 'true' || false;

  ngOnInit() {
    this.settings = this.settingsService.settings;
    this.getAppDetails();
  }

  resetSettings() {
    this.settingsService.resetSettings();
    this.ngOnInit();
  }

  saveSettings() {
    this.settingsService.saveSettings();
    this.settingsService.apply();
  }

  async getAppDetails() {
    const appInfo = JSON.parse(localStorage.getItem('appInfo') || '{}');
    this.appName = appInfo.name;
    this.appVersion = appInfo.version;
    this.appBuild = appInfo.build;
  }

  enableDevMode() {
    this.buildTaps++;
    clearTimeout(this.buildTimeout);

    if (this.buildTaps == 10) {
      this.devMode = true;
      localStorage.setItem('devMode', 'true');
      // TODO: Mesasge: devMode enabled, restart app
    } else {
      this.buildTimeout = setTimeout(() => {
        this.buildTaps = 0;
      }, 2000);
    }
  }
}
