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
}
