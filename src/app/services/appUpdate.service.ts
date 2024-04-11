import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root',
})
export class AppUpdateService {
  private apiUrl = 'https://api.github.com/repos/ungunwiz/app/releases/latest';

  constructor(private http: HttpClient) {}

  public checkForUpdate() {
    return new Promise((resolve, reject) => {
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

          if (updateInfo.version !== `${currentVersion}`) {
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
    });
  }
}
