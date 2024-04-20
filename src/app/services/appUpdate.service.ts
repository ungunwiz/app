import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CapacitorHttp } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { InstallPermission } from '@zlyfer/cap-plugin-install-permission';
import {
  FileOpener,
  FileOpenerOptions,
} from '@capacitor-community/file-opener';
import { SettingsService } from '@service/settings.service';

@Injectable({
  providedIn: 'root',
})
export class AppUpdateService {
  private apiUrl = 'https://api.github.com/repos/ungunwiz/app/releases/latest';
  private content_type = 'application/vnd.android.package-archive';

  constructor(
    private http: HttpClient,

    private settingsService: SettingsService
  ) {}

  private settings = this.settingsService.settings;

  public checkForUpdate() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.http
          .get(this.apiUrl)
          .toPromise()
          .then((response: any) => {
            const appInfo = JSON.parse(localStorage.getItem('appInfo') || '{}');
            const currentVersion = appInfo.version;

            const updateInfo: any = {
              version: response.tag_name,
              name: response.name,
              updateAvailable: false,
            };

            if (
              updateInfo.version !== `v${currentVersion}` ||
              (this.settings.developer.developerMode &&
                this.settings.developer.forceUpdate)
            ) {
              updateInfo.updateAvailable = true;
              const apkAsset = response.assets.find(
                (asset: any) => asset.name === 'ungunwiz.apk'
              );
              if (apkAsset) {
                updateInfo.apkUrl = apkAsset.browser_download_url;
                updateInfo.apkName = apkAsset.name;
                updateInfo.apkSize = apkAsset.size;
              }
            }

            resolve(updateInfo);
          })
          .catch((error) => {
            console.error(error);
            reject(error);
          });
      }, 1500);
    });
  }

  async downloadUpdate(url: string) {
    try {
      const response: any = await CapacitorHttp.get({
        url,
        headers: {
          'Content-Type': this.content_type,
        },
        responseType: 'blob',
      });

      Filesystem.checkPermissions()
        .then(async (result: any) => {
          if (result.publicStorage === 'granted') {
            const writeResult = await Filesystem.writeFile({
              path: `apks/ungunwiz.apk`,
              data: response.data,
              directory: Directory.Data,
              recursive: true,
            });
            await InstallPermission.checkPermission()
              .then((result: { granted: boolean }) => {
                if (result.granted) {
                  this.installUpdate(writeResult.uri);
                } else {
                  InstallPermission.requestPermission();
                }
              })
              .catch((error: any) => {
                console.error(error);
              });
          }
        })
        .catch((error: any) => {
          console.error(`error:`, error);
        });
    } catch (error) {
      console.error('Error fetching or processing blob:', error);
      throw error;
    }
  }

  async installUpdate(uri: string) {
    console.debug('installUpdate');
    try {
      const fileOpenerOptions: FileOpenerOptions = {
        filePath: uri,
        contentType: this.content_type,
      };
      await FileOpener.open(fileOpenerOptions);
    } catch (e) {
      console.log('Error opening file', e);
    }
  }
}
