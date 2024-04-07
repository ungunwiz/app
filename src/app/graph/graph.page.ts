import { GraphService } from '@service/graph.service';
import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { register } from 'swiper/element/bundle';
import { ActivatedRoute } from '@angular/router';

import { PubgDataService } from 'src/app/services/pubgData.service';

register();

@Component({
  selector: 'app-graph',
  templateUrl: './graph.page.html',
  styleUrls: ['./graph.page.scss'],
})
export class GraphPage implements OnInit {
  constructor(
    private graphService: GraphService,
    private pubgDataService: PubgDataService,
    private route: ActivatedRoute
  ) {}

  private colors: any = [
    '#F44336',
    '#2196F3',
    '#8BC34A',
    '#FFEB3B',
    '#FF9800',
    '#673AB7',
    '#E91E63',
    '#009688',
  ];
  private pubgData: any = {};
  private selectedWeaponCounter: number = 0;

  public weapons: any = [];
  public weaponsStringList: any = [];
  // TODO: Fix tooltip color of weapon not matching line color:
  private lineChartOptionsDefault: any = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: this.getStyleColor('--ion-color-step-text-800'),
          font: {
            size: 16,
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: true,
          color: this.getStyleColor('--ion-color-step-text-800'),
          borderDash: [1, 5],
          tickBorderDash: [1, 5],
          lineWidth: 1,
        },
        type: 'linear',
        min: 0,
        max: 1000,
        title: {
          display: true,
          color: this.getStyleColor('--ion-color-step-text-800'),
          font: {
            size: 20,
          },
        },
        ticks: {
          color: this.getStyleColor('--ion-color-step-text-800'),
          stepSize: 100,
        },
      },
      y: {
        stacked: false,
        grid: {
          display: true,
          color: this.getStyleColor('--ion-color-step-text-800'),
          borderDash: [1, 5],
          tickBorderDash: [1, 5],
          lineWidth: 1,
        },
        type: 'linear',
        min: 0,
        title: {
          display: true,
          color: this.getStyleColor('--ion-color-step-text-800'),
          font: {
            size: 20,
          },
        },
        ticks: {
          color: this.getStyleColor('--ion-color-step-text-800'),
        },
      },
    },
  };

  public lineChartDataDamage: ChartConfiguration<'line'>['data'] = {
    datasets: [],
  };
  public lineChartDataVelocity: ChartConfiguration<'line'>['data'] = {
    datasets: [],
  };
  public lineChartOptionsDMG: any = JSON.parse(
    JSON.stringify(this.lineChartOptionsDefault)
  );
  public lineChartOptionsVel: any = JSON.parse(
    JSON.stringify(this.lineChartOptionsDefault)
  );
  public lineChartLegend = true;

  async ngOnInit() {
    this.pubgData = await this.pubgDataService.get();

    this.lineChartOptionsDMG.scales.x.title.text = 'Distance (m)';
    this.lineChartOptionsDMG.scales.y.title.text = 'Damage';
    this.lineChartOptionsDMG.scales.y.ticks.stepSize = 25;
    this.lineChartOptionsVel.scales.x.title.text = 'Distance (m)';
    this.lineChartOptionsVel.scales.y.title.text = 'Velocity (m/s)';
    this.lineChartOptionsVel.scales.y.ticks.stepSize = 250;

    this.route.queryParamMap.subscribe((params) => {
      const weaponsParam = params.get('weapons');
      if (weaponsParam) {
        const weaponNames = JSON.parse(weaponsParam);
        const weapons = this.pubgData.weapons.filter((weapon: any) => {
          return weaponNames.includes(weapon.name);
        });

        this.weapons = weapons;
        this.updateGraph();
      }
    });
  }

  private addGraph(weapon: any) {
    const color = this.colors[this.selectedWeaponCounter % this.colors.length];
    this.weaponsStringList.push({
      name: weapon.name,
      color: color,
    });

    /* ------------- Damage ------------- */
    let dataDMG: any = [];
    const weaponDamageFalloff = this.pubgData.damageFalloffs.filter(
      (entry: any) => {
        return entry.weapon_name === weapon.name;
      }
    );

    if (weaponDamageFalloff.length === 0) {
      dataDMG.push({
        x: 0,
        y: weapon.damage,
      });
    } else {
      weaponDamageFalloff.forEach((damageFalloff: any) => {
        dataDMG.push({
          x: damageFalloff.distance,
          y: damageFalloff.multiplier * weapon.damage,
        });
      });
    }
    if (dataDMG[dataDMG.length - 1].x < 1000) {
      dataDMG.push({
        x: 1000,
        y: dataDMG[dataDMG.length - 1].y,
      });
    }

    this.lineChartDataDamage.datasets.push({
      data: dataDMG,
      label: weapon.name,
      fill: false,
      tension: 0,
      borderColor: color,
      backgroundColor: `#ffffff00`,
      borderWidth: 3,
      pointRadius: 0,
      // borderDash: [
      //   3,
      //   this.lineChartData.datasets.length >= this.colors.length ? 1 : 0,
      // ],
    });

    //   /* ------------ Velocity ------------ */

    var dataVel: any = [];
    const weaponVelocityFalloff = this.pubgData.velocityFalloffs.filter(
      (entry: any) => {
        return entry.weapon_name === weapon.name;
      }
    );

    if (weaponVelocityFalloff.length === 0) {
      dataVel.push({
        x: 0,
        y: 0,
      });
    } else {
      weaponVelocityFalloff.forEach((velocityFalloff: any) => {
        dataVel.push({
          x: velocityFalloff.distance,
          y: velocityFalloff.velocity,
        });
      });
    }

    if (dataVel[dataVel.length - 1].x < 1000) {
      dataVel.push({
        x: 1000,
        y: dataVel[dataVel.length - 1].y,
      });
    }

    this.lineChartDataVelocity.datasets.push({
      data: dataVel,
      label: weapon.name,
      fill: false,
      tension: 0,
      borderColor: color,
      backgroundColor: `#ffffff00`,
      borderWidth: 3,
      pointRadius: 0,
      // borderDash: [1, 5],
    });

    /* ---------------- - --------------- */

    this.selectedWeaponCounter++;
  }

  private updateGraph() {
    this.selectedWeaponCounter = 0;
    this.lineChartDataDamage.datasets = [];
    this.lineChartDataVelocity.datasets = [];
    this.weapons.forEach((weapon: any) => {
      this.addGraph(weapon);
    });
    this.lineChartDataDamage = { ...this.lineChartDataDamage };
    this.lineChartDataVelocity = { ...this.lineChartDataVelocity };
  }

  private getStyleColor(variable: string) {
    const body = document.getElementsByTagName('body')[0];
    const color = getComputedStyle(body).getPropertyValue(variable);
    return color;
  }
}
