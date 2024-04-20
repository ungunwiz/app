import { Injectable } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';
import { forceUpdate } from 'ionicons/dist/types/stencil-public-runtime';

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
    developer: {
      developerMode: false,
      forceUpdate: false,
    },
  };

  private init() {
    this.loadSettings();
    setTimeout(() => {
      this.apply();
    }, 10);
  }

  private loadSettings() {
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

  public resetSettings() {
    this.settings = this.defaultSettings;
    this.saveSettings();
    this.init();
  }

  public saveSettings() {
    localStorage.setItem('settings', JSON.stringify(this.settings));
    this.apply();
  }

  public apply() {
    this.applyColor();
    if (this.platform.is('capacitor')) {
      this.applyStatusbarColor();
    }
  }

  private async applyColor() {
    document.body.classList.remove('dark');

    if (this.isDarkMode()) {
      document.body.classList.add('dark');
    }
  }

  private async applyStatusbarColor() {
    const isDark = this.isDarkMode();
    await StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light,
    }).catch((error) => {
      console.error(error);
    });
    if (this.platform.is('android')) {
      const style = getComputedStyle(document.body);
      const bgColor = style.getPropertyValue('--ion-color-light-tint').trim();
      await StatusBar.setBackgroundColor({ color: bgColor }).catch((error) => {
        console.error(error);
      });
    }
  }

  private isDarkMode() {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const darkMode = this.settings.ui.darkMode;
    const autoTheme = this.settings.ui.autoTheme;

    return (autoTheme && prefersDark) || (!autoTheme && darkMode);
  }
}
