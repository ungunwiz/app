import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NgChartsModule } from 'ng2-charts';

import { GraphPage } from './graph.page';
import { GraphPageRoutingModule } from './graph-routing.module';

@NgModule({
  declarations: [GraphPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GraphPageRoutingModule,
    NgChartsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GraphPageModule {}
