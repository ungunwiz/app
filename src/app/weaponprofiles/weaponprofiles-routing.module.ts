import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WeaponProfilesPage } from './weaponprofiles.page';

const routes: Routes = [
  {
    path: '',
    component: WeaponProfilesPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WeaponProfilesPageRoutingModule {}
