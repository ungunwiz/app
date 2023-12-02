import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { Component, OnInit } from '@angular/core';
import { PubgDataService } from '@service/pubgData.service';

@Component({
  selector: 'app-weaponprofiles',
  templateUrl: './weaponprofiles.page.html',
  styleUrls: ['./weaponprofiles.page.scss'],
})
export class WeaponProfilesPage implements OnInit {
  constructor(private pubgDataService: PubgDataService) {}

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

  distances: any = [];
  calculatedDamageMultiplier: any = [];
  calculatedDamageFalloffs: any = {};

  /* -------------- Chart ------------- */
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: this.distances,
    datasets: [],
  };
  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      x: {
        stacked: false,
        grid: {
          display: true,
          color: '#ffffff',
        },
        type: 'linear',
        title: {
          display: true,
          text: 'Distance',
        },
        ticks: {
          stepSize: 100,
          callback: function (value, index, values) {
            return Number(value) % 100 === 0 ? value + 'm' : '';
          },
        },
      },
      y: {
        stacked: false,
        grid: {
          display: true,
          color: '#ffffff',
        },
        title: {
          display: true,
          text: 'Damage',
        },
      },
    },
  };
  lineChartLegend = true;

  ngOnInit() {
    // this.weapon = this.activatedRoute.snapshot.paramMap.get(
    //   'weapon'
    // ) as string;
    this.pubgData = JSON.parse(localStorage.getItem('pubgData') || '{}');
    this.generateDistances();
    /* ------------ Debugging ----------- */
    // console.debug(`this.pubgData.weapons:`, this.pubgData.weapons[7]);
    // console.table(
    //   `this.pubgData.damageFalloffs:`,
    //   this.pubgData.damageFalloffs.filter((entry: any) => {
    //     return entry.weapon_name === this.pubgData.weapons[7].name;
    //   })
    // );
    // this.pubgData.weapons = this.pubgData.weapons.slice(0, 3);
    // this.pubgData.damageFalloffs = this.pubgData.damageFalloffs.filter(
    //   (entry: any) => {
    //     return this.pubgData.weapons.find((weapon: any) => {
    //       return weapon.name === entry.weapon_name;
    //     });
    //   }
    // );
    /* ---------------- - --------------- */
    this.pubgData.weapons.forEach((weapon: any) => {
      this.calculatedDamageFalloffs[weapon.name] = [];
      this.distances.forEach((distance: any) => {
        const { start, end } = this.generateDamageFallOffs(weapon, distance);
        // console.debug(
        //   `${start.distance <= distance && distance <= end.distance},d,s,e`,
        //   distance,
        //   start.distance,
        //   end.distance
        // );
        this.calculatedDamageMultiplier.push({
          weapon: weapon.name,
          start: { distance: start.distance, multiplier: start.multiplier },
          end: { distance: end.distance, multiplier: end.multiplier },
        });
        var multiplier: any = this.map(
          distance,
          start.distance,
          end.distance,
          start.multiplier,
          end.multiplier
        );
        this.calculatedDamageFalloffs[weapon.name].push(multiplier);
      });
    });

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

  updateGraph() {
    this.lineChartData.datasets = [];
    this.selectedWeapon.forEach((weapon: any) => {
      this.addGraph(weapon);
    });
    this.lineChartData = { ...this.lineChartData };
  }

  addGraph(weapon: any) {
    var transparency: number = 1 / this.pubgData.weapons.length;
    transparency +=
      this.lineChartData.datasets.length * (1 / this.pubgData.weapons.length);

    var color = null;

    if (this.lineChartData.datasets.length < this.colors.length) {
      color = this.colors[this.lineChartData.datasets.length];
    } else {
      color =
        this.colors[this.lineChartData.datasets.length % this.colors.length];
    }

    var dataset: any = {
      data: [],
      label: weapon.name,
      fill: false,
      tension: 0.5,
      borderColor: color,
      backgroundColor: `#ffffff00`,
      borderWidth: 3,
      pointRadius: 0,
      pointBackgroundColor: 'white',
      pointBorderWidth: 0,
      borderDash: [
        3,
        this.lineChartData.datasets.length >= this.colors.length ? 1 : 0,
      ],
    };

    this.distances.forEach((distance: any) => {
      dataset.data.push(this.calcDamage(weapon, { distance }));
    });
    this.lineChartData.datasets.push(dataset);
    console.debug(`dataset:`, dataset);
  }

  calcDamage(weapon: any, options: any | null = null) {
    let damage = weapon.damage;
    if (options.distance) {
      options.distance -= 1;
      damage *= this.calculatedDamageFalloffs[weapon.name][options.distance];
    }
    if (options.area) {
      // TODO: Implement:
    }
    if (options.weaponType) {
      // TODO: Implement:
    }

    return damage;
  }

  generateDamageFallOffs(weapon: any, distance: number) {
    const damageFalloffs = this.pubgData.damageFalloffs.filter((entry: any) => {
      return entry.weapon_name === weapon.name;
    });
    if (damageFalloffs.length === 0) {
      return {
        start: { distance: '0', multiplier: 1 },
        end: { distance: '1000', multiplier: 1 },
      };
    } else if (damageFalloffs.length === 1) {
      return {
        start: { distance: '0', multiplier: 1 },
        end: damageFalloffs[0],
      };
    }
    damageFalloffs.sort((a: any, b: any) => a.distance - b.distance);
    const last = damageFalloffs[damageFalloffs.length - 1];
    if (last.distance < 1000) {
      damageFalloffs.push({ distance: '1000', multiplier: last.multiplier });
    }

    let start: any = damageFalloffs[0] || { distance: '1', multiplier: 1 };
    let end: any = damageFalloffs[1] || { distance: '1000', multiplier: 1 };
    let endSelected = false;
    damageFalloffs.forEach((damageFalloff: any) => {
      if (distance > damageFalloff.distance) {
        start = damageFalloff;
      }
      if (distance <= damageFalloff.distance && !endSelected) {
        end = damageFalloff;
        endSelected = true;
      }
    });

    return { start, end };
  }

  map(
    value: number,
    start1: number,
    stop1: number,
    start2: number,
    stop2: number
  ) {
    value = parseFloat(value.toString());
    start1 = parseFloat(start1.toString());
    stop1 = parseFloat(stop1.toString());
    start2 = parseFloat(start2.toString());
    stop2 = parseFloat(stop2.toString());
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  }

  generateDistances(start: number = 1, end: number = 1000) {
    for (let i = start; i <= end; i++) {
      this.distances.push(i);
    }
  }
}
