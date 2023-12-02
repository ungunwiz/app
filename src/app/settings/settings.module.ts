import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { SettingsPage } from './settings.page';
import { SettingsPageRoutingModule } from './settings-routing.module';

@NgModule({
  declarations: [SettingsPage],
  imports: [CommonModule, FormsModule, IonicModule, SettingsPageRoutingModule],
})
export class SettingsPageModule {}
