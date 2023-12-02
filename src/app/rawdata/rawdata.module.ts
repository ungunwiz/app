import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { RawDataPage } from './rawdata.page';
import { RawDataPageRoutingModule } from './rawdata-routing.module';

@NgModule({
  declarations: [RawDataPage],
  imports: [CommonModule, FormsModule, IonicModule, RawDataPageRoutingModule],
})
export class RawDataPageModule {}
