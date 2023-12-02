import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RawDataPage } from './rawdata.page';

const routes: Routes = [
  {
    path: '',
    component: RawDataPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RawDataPageRoutingModule {}
