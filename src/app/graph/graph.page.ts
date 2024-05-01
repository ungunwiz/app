import { GraphService } from '@service/graph.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, ChartConfiguration, ChartOptions } from 'chart.js';
import { ActivatedRoute } from '@angular/router';

import { PubgDataService } from '@service/pubgData.service';

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

  @ViewChild('damageChart') damageChart!: ElementRef;
  @ViewChild('velocityChart') velocityChart!: ElementRef;

  public weapons: any = [];

  private pubgData: any = {};
  private fixedOptions = {
    stacked: false,
    grid: {
      display: true,
      color: this.getStyleColor('--ion-color-step-text-800'),
      tickBorderDash: [1, 5],
    },
    border: {
      dash: [1, 5],
    },
    type: 'linear',
    title: {
      display: true,
      color: this.getStyleColor('--ion-color-step-text-800'),
      font: {
        size: 18,
      },
    },
    ticks: {
      color: this.getStyleColor('--ion-color-step-text-800'),
    },
  };
  private optionsDefault: ChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    maintainAspectRatio: false,
    events: ['mousemove'],
    plugins: {
      colors: {
        enabled: false,
      },
      legend: {
        display: false,
        position: 'top',
        labels: {
          color: this.getStyleColor('--ion-color-step-text-800'),
          font: {
            size: 14,
          },
        },
      },
    },
    scales: {
      // @ts-ignore
      x: {
        ...this.fixedOptions,
      },
      // @ts-ignore
      y: {
        ...this.fixedOptions,
      },
    },
  };
  private dataDamage: ChartConfiguration<'line'>['data'] = {
    datasets: [],
  };
  private dataVelocity: ChartConfiguration<'line'>['data'] = {
    datasets: [],
  };

  async ngOnInit() {
    this.pubgData = await this.pubgDataService.get();

    this.route.queryParamMap.subscribe((params) => {
      const weaponsParam = params.get('weapons');
      if (weaponsParam) {
        const weaponNames = JSON.parse(weaponsParam);
        this.weapons = this.pubgData.weapons.filter((weapon: any) => {
          return weaponNames.includes(weapon.name);
        });
      }
      this.updateGraph();
    });
  }

  ngAfterViewInit() {
    /* ---------------------------------- */
    /*               DAMAGE               */
    /* ---------------------------------- */
    let optionsDMG: any;
    optionsDMG = JSON.parse(JSON.stringify(this.optionsDefault));
    optionsDMG.scales.y.title.text = 'Damage';
    // this.OptionsDMG.scales.x.title.text = 'Distance (m)';
    const yDmgStepSize = 5;
    optionsDMG.scales.y.ticks.stepSize = yDmgStepSize;

    const damageChart = new Chart(this.damageChart.nativeElement, {
      type: 'line',
      data: this.dataDamage,
      options: {
        ...this.optionsDefault,
        ...optionsDMG,
        onHover: syncHover.bind(this, 'damage'),
      },
    });

    /* ---------------------------------- */
    /*              VELOCITY              */
    /* ---------------------------------- */
    let optionsVel: any;
    optionsVel = JSON.parse(JSON.stringify(this.optionsDefault));
    optionsVel.scales.y.title.text = 'Velocity (m/s)';
    optionsVel.scales.x.title.text = 'Distance (m)';
    const yVelStepSize = 100;
    optionsVel.scales.y.ticks.stepSize = yVelStepSize;

    const velocityChart = new Chart(this.velocityChart.nativeElement, {
      type: 'line',
      data: this.dataVelocity,
      options: {
        ...this.optionsDefault,
        ...optionsVel,
        onHover: syncHover.bind(this, 'velocity'),
      },
    });

    /* -------------- Hover ------------- */

    function syncHover(
      chartType: string,
      event: MouseEvent,
      activeElements: any[]
    ) {
      if (chartType === 'damage') {
        if (activeElements.length > 0) {
          const index = activeElements[0].index;
          const datasetMeta = velocityChart.getDatasetMeta(0);
          if (
            datasetMeta &&
            datasetMeta.data &&
            datasetMeta.data.length > index
          ) {
            // @ts-ignore
            velocityChart.tooltip.setActiveElements([
              { datasetIndex: 0, index },
            ]);
            // @ts-ignore
            velocityChart.tooltip.update(true);
            velocityChart.draw();
          }
        } else {
          // @ts-ignore
          velocityChart.tooltip._active = [];
          // @ts-ignore
          velocityChart.tooltip.update(true);
          velocityChart.draw();
        }
      } else if (chartType === 'velocity') {
        if (activeElements.length > 0) {
          const index = activeElements[0].index;
          const datasetMeta = damageChart.getDatasetMeta(0);
          if (
            datasetMeta &&
            datasetMeta.data &&
            datasetMeta.data.length > index
          ) {
            // @ts-ignore
            damageChart.tooltip.setActiveElements([{ datasetIndex: 0, index }]);
            // @ts-ignore
            damageChart.tooltip.update(true);
            damageChart.draw();
          }
        } else {
          // @ts-ignore
          damageChart.tooltip._active = [];
          // @ts-ignore
          velocityChart.tooltip.update(true);
          damageChart.draw();
        }
      }
    }
  }

  private addGraph(weapon: any) {
    /* ---------------------------------- */
    /*               DAMAGE               */
    /* ---------------------------------- */
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

    this.dataDamage.datasets.push({
      data: dataDMG,
      label: weapon.name,
      fill: false,
      tension: 0,
      backgroundColor: `#ffffff00`,
      borderWidth: 3,
      pointRadius: 0,
    });

    /* ---------------------------------- */
    /*              VELOCITY              */
    /* ---------------------------------- */
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

    this.dataVelocity.datasets.push({
      data: dataVel,
      label: weapon.name,
      fill: false,
      tension: 0,
      backgroundColor: `#ffffff00`,
      borderWidth: 3,
      pointRadius: 0,
      // borderDash: [1, 5],
    });

    /* ---------------- - --------------- */
  }

  private updateGraph() {
    this.weapons.forEach((weapon: any) => {
      this.addGraph(weapon);
    });
  }

  private getStyleColor(variable: string) {
    const body = document.getElementsByTagName('body')[0];
    const color = getComputedStyle(body).getPropertyValue(variable);
    return color;
  }
}
