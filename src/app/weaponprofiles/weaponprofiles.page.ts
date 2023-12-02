import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-weaponprofiles',
  templateUrl: './weaponprofiles.page.html',
  styleUrls: ['./weaponprofiles.page.scss'],
})
export class WeaponProfilesPage implements OnInit {
  constructor() {}

  loading = true;
  pubgData: any = {};
  colors: any = [
    '#F44336',
    '#2196F3',
    '#8BC34A',
    '#FFEB3B',
    '#FF9800',
    '#673AB7',
    '#E91E63',
    '#009688',
  ];

  selectedWeapon: any = [];

  /* -------------- Chart ------------- */
  lineChartData: ChartConfiguration<'line'>['data'] = {
    datasets: [],
  };
  lineChartOptions: ChartOptions<'line'> = {
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
          color: this.getStyleColor('--ion-color-step-400'),
          font: {
            size: 16,
          },
        },
      },
      tooltip: {
        axis: 'x',
        callbacks: {
          label: function (context: any) {
            var label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2);
            }
            return '  ' + label;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: true,
          color: this.getStyleColor('--ion-color-step-400'),
          borderDash: [1, 2],
          tickBorderDash: [1, 2],
          lineWidth: 1,
        },
        type: 'linear',
        min: 0,
        max: 1000,
        title: {
          display: true,
          text: 'Distance',
          color: this.getStyleColor('--ion-color-step-400'),

          font: {
            size: 20,
          },
        },
        ticks: {
          color: this.getStyleColor('--ion-color-step-400'),
          stepSize: 100,
          callback: function (value, index, values) {
            return `${value}m`;
          },
        },
      },
      y: {
        stacked: false,
        grid: {
          display: true,
          color: this.getStyleColor('--ion-color-step-400'),
          borderDash: [1, 2],
          tickBorderDash: [1, 2],

          lineWidth: 1,
        },
        type: 'linear',
        min: 0,
        title: {
          display: true,
          text: 'Damage',
          color: this.getStyleColor('--ion-color-step-400'),
          font: {
            size: 20,
          },
        },
        ticks: {
          color: this.getStyleColor('--ion-color-step-400'),
          stepSize: 25,
          callback: function (value, index, values) {
            return `${value}`;
          },
        },
      },
    },
  };
  lineChartLegend = true;

  ngOnInit() {
    this.pubgData = JSON.parse(localStorage.getItem('pubgData') || '{}');

    this.loading = false;
  }

  /* ---------------------------------- */
  /*              FUNCTIONS             */
  /* ---------------------------------- */

  toggleWeapon(weapon: any) {
    if (this.isSelected(weapon)) {
      this.selectedWeapon = this.selectedWeapon.filter((w: any) => {
        return w.name !== weapon.name;
      });
    } else {
      if (this.selectedWeapon.length >= this.colors.length * 2) {
        return;
      }
      this.selectedWeapon.push(weapon);
    }
    this.updateGraph();
  }

  isSelected(weapon: any) {
    return this.selectedWeapon.includes(weapon);
  }

  addGraph(weapon: any) {
    var data: any = [];
    const color =
      this.colors[this.lineChartData.datasets.length % this.colors.length];

    const weaponDamageFalloff = this.pubgData.damageFalloffs.filter(
      (entry: any) => {
        return entry.weapon_name === weapon.name;
      }
    );

    if (weaponDamageFalloff.length === 0) {
      data.push({
        x: 0,
        y: weapon.damage,
      });
    } else {
      weaponDamageFalloff.forEach((damageFalloff: any) => {
        data.push({
          x: damageFalloff.distance,
          y: damageFalloff.multiplier * weapon.damage,
        });
      });
    }
    if (data[data.length - 1].x < 1000) {
      data.push({
        x: 1000,
        y: data[data.length - 1].y,
      });
    }

    this.lineChartData.datasets.push({
      data,
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
  }

  updateGraph() {
    this.lineChartData.datasets = [];
    this.selectedWeapon.forEach((weapon: any) => {
      this.addGraph(weapon);
    });
    this.lineChartData = { ...this.lineChartData };
  }

  getStyleColor(variable: string) {
    const color = getComputedStyle(document.documentElement).getPropertyValue(
      variable
    );
    return color;
  }
}
