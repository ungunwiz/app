import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';

import { WeaponProfilesPage } from './weaponprofiles.page';
import { WeaponProfilesPageRoutingModule } from './weaponprofiles-routing.module';

import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [WeaponProfilesPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WeaponProfilesPageRoutingModule,
    NgChartsModule,
  ],
})
export class WeaponProfilesPageModule {}
