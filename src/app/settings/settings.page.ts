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

  ngOnInit() {
    this.settings = this.settingsService.settings;
  }

  resetSettings() {
    this.settingsService.resetSettings();
    this.ngOnInit();
  }

  saveSettings() {
    this.settingsService.saveSettings();
    this.settingsService.applyColor();
  }
}
