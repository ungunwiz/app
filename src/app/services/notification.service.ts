import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private toastController: ToastController) {}

  private toast: any = null;

  public async createCustom(
    header: string,
    opts: any = {},
    position: 'top' | 'bottom' | 'middle' = 'top'
  ) {
    if (this.toast) this.toast.dismiss();

    let options = {
      ...{
        message: '',
        type: 0,
        duration: Math.max(header.split(' ').length * 1000, 5000),
      },
      ...opts,
    };
    const color = ['success', 'warning', 'danger'][options.type];
    const icon = [
      'checkmark-circle-outline',
      'warning-outline',
      'alert-circle-outline',
    ][options.type];
    if (options.header === '') {
      if (options.type == 1) options.header = 'Info';
      if (options.type == 2) options.header = 'Fehler';
    }

    this.toast = await this.toastController.create({
      header,
      message: options.message,
      color,
      duration: options.duration,
      icon,
      position,
      mode: 'ios',
      cssClass: 'notification',
      buttons: [{ side: 'end', icon: 'close-outline', role: 'cancel' }],
    });
    this.toast.present();
  }
}
