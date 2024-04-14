import { Component, OnInit } from '@angular/core';
import { SettingsService } from '@service/settings.service';
import { NotificationService } from '@service/notification.service';
import { WordingService } from '@service/wording.service';
import { AppUpdateService } from '@service/appUpdate.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsPage implements OnInit {
  constructor(
    private settingsService: SettingsService,
    private notificationService: NotificationService,
    private wordingService: WordingService,
    private appUpdateService: AppUpdateService
  ) {}

  public settings: any;
  public appName: any;
  public appVersion: any;
  public appBuild: any;
  public allowDevMode =
    localStorage.getItem('allowDevMode') === 'true' || false;
  public isApp = environment.platform === 'app';
  public updateSearching = false;
  public updateInfo: any = {
    updateAvailable: false,
  };

  private buildTaps = 0;
  private buildTimeout: any;
  private devModeMessage = `Please ${this.wordingService.getWord(
    'restart'
  )} the ${this.wordingService.getWord('app')} to apply the changes.`;

  ngOnInit() {
    this.settings = this.settingsService.settings;
    this.getAppDetails();
    if (this.isApp) {
      this.checkForUpdate();
    }
  }

  private async getAppDetails() {
    const appInfo = JSON.parse(localStorage.getItem('appInfo') || '{}');
    this.appName = appInfo.name;
    this.appVersion = appInfo.version;
    this.appBuild = appInfo.build;
  }

  public checkForUpdate() {
    if (this.isApp) {
      this.updateSearching = true;
      this.appUpdateService.checkForUpdate().then((updateInfo: any) => {
        console.debug(updateInfo);
        this.updateInfo = updateInfo;
        this.updateSearching = false;
      });
    }
  }

  public async downloadUpdate() {
    this.appUpdateService.downloadUpdate(this.updateInfo.apkUrl);
  }

  public resetSettings() {
    this.settingsService.resetSettings();
    this.ngOnInit();
  }

  public saveSettings() {
    this.settingsService.saveSettings();
    this.settingsService.apply();
  }

  public enableDevMode() {
    this.buildTaps++;
    clearTimeout(this.buildTimeout);

    if (this.buildTaps == 10) {
      if (this.allowDevMode) {
        this.notificationService.createCustom('Debug mode already enabled.');
      } else {
        this.allowDevMode = true;
        localStorage.setItem('allowDevMode', 'true');
        this.notificationService.createCustom('Debug mode enabled.', {
          message: this.devModeMessage,
        });
      }
    } else {
      this.buildTimeout = setTimeout(() => {
        this.buildTaps = 0;
      }, 2000);
    }
  }
}
