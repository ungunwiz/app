import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';

import { WeaponListPage } from './weaponlist.page';
import { WeaponListPageRoutingModule } from './weaponlist-routing.module';

import { NgChartsModule } from 'ng2-charts';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  declarations: [WeaponListPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WeaponListPageRoutingModule,
    NgChartsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WeaponListPageModule {}
