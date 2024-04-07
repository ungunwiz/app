import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';

import { WeaponListPage } from './weaponlist.page';
import { WeaponListPageRoutingModule } from './weaponlist-routing.module';

@NgModule({
  declarations: [WeaponListPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WeaponListPageRoutingModule,
  ],
})
export class WeaponListPageModule {}
