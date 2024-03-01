import { Injectable } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(private platform: Platform) {
    this.init();
  }

  public settings: any;
  public defaultSettings: any = {
    ui: {
      autoTheme: true,
      darkMode: true,
    },
  };

  init() {
    this.loadSettings();
    setTimeout(() => {
      this.apply();
    }, 10);
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
    this.apply();
  }

  apply() {
    this.applyColor();
    if (this.platform.is('capacitor')) {
      this.applyStatusbarColor();
    }
  }

  async applyColor() {
    document.body.classList.remove('dark');

    if (this.isDarkMode()) {
      document.body.classList.add('dark');
    }
  }

  async applyStatusbarColor() {
    const isDark = this.isDarkMode();
    await StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light,
    }).catch((e) => {
      console.error(e);
    });
    if (this.platform.is('android')) {
      const style = getComputedStyle(document.body);
      const bgColor = style.getPropertyValue('--ion-color-light-tint').trim();
      await StatusBar.setBackgroundColor({ color: bgColor }).catch((e) => {
        console.error(e);
      });
    }
  }

  isDarkMode() {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const darkMode = this.settings.ui.darkMode;
    const autoTheme = this.settings.ui.autoTheme;

    return (autoTheme && prefersDark) || (!autoTheme && darkMode);
  }
}
