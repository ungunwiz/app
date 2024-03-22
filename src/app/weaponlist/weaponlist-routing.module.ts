import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WeaponListPage } from './weaponlist.page';

const routes: Routes = [
  {
    path: '',
    component: WeaponListPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WeaponListPageRoutingModule {}
