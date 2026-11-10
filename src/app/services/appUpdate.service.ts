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
  ) { }

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

  // async downloadUpdate(url: string, onProgress: (percentage: number) => void) {
  //   try {
  //     const response = await fetch(url, {
  //       headers: {
  //         'Content-Type': this.content_type,
  //       },
  //       method: 'GET',
  //     });

  //     console.debug(response);
  //     if (!response.ok) {
  //       throw new Error('Network response was not ok');
  //     }
  //     const contentLength = response.headers.get('content-length');
  //     if (!contentLength) {
  //       throw new Error('Content-Length response header is missing');
  //     }
  //     const total = parseInt(contentLength, 10);
  //     let loaded = 0;
  //     const reader = response.body?.getReader();
  //     const stream = new ReadableStream({
  //       async start(controller) {
  //         while (true) {
  //           const { done, value } = await reader?.read()!;
  //           if (done) {
  //             break;
  //           }

  //           loaded += value.length;
  //           onProgress((loaded / total) * 100);
  //           controller.enqueue(value);
  //         }
  //         controller.close();
  //       },
  //     });
  //     const blob = await new Response(stream).blob();
  //     return this.writeFile(blob);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async downloadUpdateWithProgress(
    url: string,
    onProgress: (percentage: number) => void
  ) {
    try {
      const totalSize = await this.getFileSize(url);
      let loaded = 0;

      const response = await CapacitorHttp.request({
        method: 'GET',
        url: url,
        responseType: 'blob',
      });

      const reader = response.data?.getReader();
      const stream = new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader?.read()!;
            if (done) {
              break;
            }

            loaded += value.length;
            onProgress((loaded / totalSize) * 100);
            controller.enqueue(value);
          }
          controller.close();
        },
      });

      const blob = await new Response(stream).blob();
      return this.writeFile(blob);
    } catch (error) {
      throw error;
    }
  }

  private async getFileSize(url: string): Promise<number> {
    try {
      const response = await CapacitorHttp.request({
        method: 'GET',
        url: url,
        responseType: 'blob',
      });

      console.debug(`GET response:`, response);

      if (!response.data) {
        throw new Error('No data received');
      }

      return response.data.size;
    } catch (error) {
      console.error('Error in getFileSize:', error);
      throw error;
    }
  }

  /* ---------------- - --------------- */

  private async writeFile(blob: Blob) {
    const permission = await Filesystem.requestPermissions();
    if (permission.publicStorage !== 'granted') {
      throw new Error('Permission denied');
    }
    const writeResult = await Filesystem.writeFile({
      path: `apks/ungunwiz.apk`,
      data: blob,
      directory: Directory.Data,
      recursive: true,
    });

    return writeResult.uri;
  }

  async installUpdate(uri: string) {
    await InstallPermission.checkPermission()
      .then((result: { granted: boolean }) => {
        if (result.granted) {
          this.installUpdate(uri);
        } else {
          InstallPermission.requestPermission();
        }
      })
      .catch((error: any) => {
        console.error(error);
      });
  }
}
