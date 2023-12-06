import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor() {
    this.init();
  }

  public settings: any;
  public defaultSettings: any = {
    ui: {
      darkMode: '0',
      darkModeAmoled: false,
      transparency: false,
    },
  };

  init() {
    this.loadSettings();
    this.apply();
  }

  apply() {
    this.applyColor();
    this.applyTransparency();
  }

  loadSettings() {
    const avail_settings = localStorage.getItem('settings');
    if (avail_settings) {
      this.settings = {
        ...this.defaultSettings,
        ...JSON.parse(avail_settings),
      };
    } else {
      this.settings = this.defaultSettings;
    }
    this.saveSettings();
  }

  resetSettings() {
    this.settings = this.defaultSettings;
    this.saveSettings();
    this.init();
  }

  saveSettings() {
    localStorage.setItem('settings', JSON.stringify(this.settings));
    this.applyColor();
  }

  async applyColor() {
    const darkMode = this.settings.ui.darkMode;
    const darkModeAmoled = this.settings.ui.darkModeAmoled;

    document.body.classList.remove('dark');
    document.body.classList.remove('amoled');

    if (this.isDarkMode()) {
      if (darkModeAmoled) {
        document.body.classList.add('amoled');
      } else {
        document.body.classList.add('dark');
      }
    } else if (darkMode == '2' && !darkModeAmoled)
      document.body.classList.add('dark');
    else if (darkMode == '2' && darkModeAmoled)
      document.body.classList.add('amoled');
  }

  async applyTransparency() {
    const transparency = this.settings.ui.transparency;

    document.body.classList.remove('transparency');

    if (transparency) {
      document.body.classList.add('transparency');
    }
  }

  isDarkMode() {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const darkMode = this.settings.ui.darkMode;
    return (
      (darkMode != '1' && darkMode != '0') || (darkMode == 0 && prefersDark)
    );
  }
}
