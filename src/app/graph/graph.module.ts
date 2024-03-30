import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { GraphPage } from './graph.page';
import { GraphPageRoutingModule } from './graph-routing.module';

@NgModule({
  declarations: [GraphPage],
  imports: [CommonModule, FormsModule, IonicModule, GraphPageRoutingModule],
})
export class GraphPageModule {}
