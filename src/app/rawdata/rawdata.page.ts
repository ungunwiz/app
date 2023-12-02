import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rawdata',
  templateUrl: './rawdata.component.html',
  styleUrls: ['./rawdata.component.scss'],
})
export class RawDataPage implements OnInit {
  constructor() {}

  loading = true;
  pubgData: any = {};

  ngOnInit() {
    this.pubgData = JSON.parse(localStorage.getItem('pubgData') || '{}');
    this.loading = false;
  }
}
