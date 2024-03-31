import { Component, OnInit } from '@angular/core';
import { SettingsService } from '@service/settings.service';
import { NotificationService } from '@service/notification.service';
import { WordingService } from '@service/wording.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsPage implements OnInit {
  constructor(
    private settingsService: SettingsService,
    private notificationService: NotificationService,
    private wordingService: WordingService
  ) {}

  public settings: any;
  public appName: any;
  public appVersion: any;
  public appBuild: any;
  public devMode = localStorage.getItem('devMode') === 'true' || false;

  private buildTaps = 0;
  private buildTimeout: any;
  private devModeMessage = `Please ${this.wordingService.getWord(
    'restart'
  )} the ${this.wordingService.getWord('app')} to apply the changes.`;

  ngOnInit() {
    this.settings = this.settingsService.settings;
    this.getAppDetails();
  }

  public resetSettings() {
    this.settingsService.resetSettings();
    this.ngOnInit();
  }

  public saveSettings() {
    this.settingsService.saveSettings();
    this.settingsService.apply();
  }

  private async getAppDetails() {
    const appInfo = JSON.parse(localStorage.getItem('appInfo') || '{}');
    this.appName = appInfo.name;
    this.appVersion = appInfo.version;
    this.appBuild = appInfo.build;
  }

  public enableDevMode() {
    this.buildTaps++;
    clearTimeout(this.buildTimeout);

    if (this.buildTaps == 10) {
      if (this.devMode) {
        this.notificationService.createCustom('Debug mode already enabled');
      } else {
        this.devMode = true;
        localStorage.setItem('devMode', 'true');
        this.notificationService.createCustom('Debug mode enabled', {
          message: this.devModeMessage,
        });
      }
    } else {
      this.buildTimeout = setTimeout(() => {
        this.buildTaps = 0;
      }, 2000);
    }
  }

  public disableDebugMode() {
    this.devMode = false;
    localStorage.setItem('devMode', 'false');
    this.notificationService.createCustom('Debug mode disabled', {
      message: this.devModeMessage,
    });
  }
}
