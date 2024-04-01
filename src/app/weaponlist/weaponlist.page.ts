import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
// import { register } from 'swiper/element/bundle';
import { PubgDataService } from 'src/app/services/pubgData.service';

// register();

@Component({
  selector: 'app-weaponlist',
  templateUrl: './weaponlist.page.html',
  styleUrls: ['./weaponlist.page.scss'],
})
export class WeaponListPage implements OnInit {
  constructor(private pubgDataService: PubgDataService) {}

  public loading = true;
  public pubgData: any = {};
  public weapons: any = [];
  public searchText: string = '';
  public selectedWeapons: any = [];
  // selectedWeapons: any = [];
  // selectedWeaponCounter: number = 0;

  private sortType: string = 'name';
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

  /* -------------- Chart ------------- */
  // lineChartDataDamage: ChartConfiguration<'line'>['data'] = {
  //   datasets: [],
  // };
  // lineChartDataVelocity: ChartConfiguration<'line'>['data'] = {
  //   datasets: [],
  // };
  // TODO: Fix tooltip color of weapon not matching line color:
  // lineChartOptionsDefault: any = {
  //   responsive: true,
  //   interaction: {
  //     mode: 'index',
  //     intersect: false,
  //   },
  //   maintainAspectRatio: false,
  //   plugins: {
  //     legend: {
  //       display: true,
  //       position: 'top',
  //       labels: {
  //         color: this.getStyleColor('--ion-color-step-text-800'),
  //         font: {
  //           size: 16,
  //         },
  //       },
  //     },
  //   },
  //   scales: {
  //     x: {
  //       stacked: false,
  //       grid: {
  //         display: true,
  //         color: this.getStyleColor('--ion-color-step-text-800'),
  //         borderDash: [1, 5],
  //         tickBorderDash: [1, 5],
  //         lineWidth: 1,
  //       },
  //       type: 'linear',
  //       min: 0,
  //       max: 1000,
  //       title: {
  //         display: true,
  //         color: this.getStyleColor('--ion-color-step-text-800'),
  //         font: {
  //           size: 20,
  //         },
  //       },
  //       ticks: {
  //         color: this.getStyleColor('--ion-color-step-text-800'),
  //         stepSize: 100,
  //       },
  //     },
  //     y: {
  //       stacked: false,
  //       grid: {
  //         display: true,
  //         color: this.getStyleColor('--ion-color-step-text-800'),
  //         borderDash: [1, 5],
  //         tickBorderDash: [1, 5],
  //         lineWidth: 1,
  //       },
  //       type: 'linear',
  //       min: 0,
  //       title: {
  //         display: true,
  //         color: this.getStyleColor('--ion-color-step-text-800'),
  //         font: {
  //           size: 20,
  //         },
  //       },
  //       ticks: {
  //         color: this.getStyleColor('--ion-color-step-text-800'),
  //       },
  //     },
  //   },
  // };
  // lineChartOptionsDMG: any = JSON.parse(
  //   JSON.stringify(this.lineChartOptionsDefault)
  // );
  // lineChartOptionsVel: any = JSON.parse(
  //   JSON.stringify(this.lineChartOptionsDefault)
  // );
  // lineChartLegend = true;

  async ngOnInit() {
    this.pubgData = await this.pubgDataService.get();

    // this.lineChartOptionsDMG.scales.x.title.text = 'Distance (m)';
    // this.lineChartOptionsDMG.scales.y.title.text = 'Damage';
    // this.lineChartOptionsDMG.scales.y.ticks.stepSize = 25;

    // this.lineChartOptionsVel.scales.x.title.text = 'Distance (m)';
    // this.lineChartOptionsVel.scales.y.title.text = 'Velocity (m/s)';
    // this.lineChartOptionsVel.scales.y.ticks.stepSize = 250;

    this.search();
    this.sortWeapons();

    this.loading = false;
  }

  printWeaponIDCSSValues() {
    let log = '';
    const props: any = ['top', 'right'];
    this.weapons.forEach((weapon: any) => {
      const wep = document.getElementById(weapon.name);
      const wepImg = wep?.getElementsByClassName('weaponImage')[0];
      const computedStyle = getComputedStyle(wepImg!);
      const cssValues: any = {};
      for (let i = 0; i < computedStyle.length; i++) {
        const cssProp = computedStyle[i];
        cssValues[cssProp] = computedStyle.getPropertyValue(cssProp);
      }
      log = log + `.weapon#${weapon.name} .weaponImage {\n`;
      for (const prop in cssValues) {
        if (props.includes(prop)) {
          if (prop === 'top') {
            cssValues[prop] = parseFloat(cssValues[prop]) - 10;
          }
          log = log + `  ${prop}: ${cssValues[prop]};\n`;
        }
      }
      log = log + '}\n';
    });
    console.log(log);
  }

  public search() {
    const searchText = this.searchText.toLowerCase();

    this.weapons = this.pubgData.weapons.filter((weapon: any) => {
      return weapon.name.toLowerCase().includes(searchText);
    });
  }

  private sortWeapons() {
    this.weapons.sort((a: any, b: any) => {
      return a[this.sortType] > b[this.sortType] ? 1 : -1;
    });
  }

  /* ---------------------------------- */
  /*              FUNCTIONS             */
  /* ---------------------------------- */

  public toggleWeapon(weapon: any) {
    if (this.isSelected(weapon)) {
      this.selectedWeapons = this.selectedWeapons.filter((w: any) => {
        return w.name !== weapon.name;
      });
    } else {
      this.selectedWeapons.push(weapon);
    }
  }

  public isSelected(weapon: any) {
    return this.selectedWeapons.includes(weapon);
  }

  public getWeaponIcon(weapon: any, simple: boolean = false) {
    const wepDir = simple ? 'weaponsSimple' : 'weapons';
    return `assets/gameAssets/${wepDir}/${weapon.name.replace(/\s/g, '_')}.png`;
  }

  public getWeaponAmmoIcon(weapon: any) {
    let ammo = weapon.ammo;
    const ammoFix: any = {
      '300Magnum': '300_Magnum',
      '5Cal': '.50_Caliber',
      '12Guage': '12_Guage',
      '12GuageSlug': '12_Guage_Slug',
      '45ACP': '45_ACP',
    };
    if (ammoFix[ammo]) {
      ammo = ammoFix[ammo];
    }
    return `assets/gameAssets/ammo/${ammo}.png`;
  }

  // toggleWeapon(weapon: any) {
  //   if (this.isSelected(weapon)) {
  //     this.selectedWeapons = this.selectedWeapons.filter((w: any) => {
  //       return w.name !== weapon.name;
  //     });
  //   } else {
  //     if (this.selectedWeapons.length >= this.colors.length * 2) {
  //       return;
  //     }
  //     this.selectedWeapons.push(weapon);
  //   }
  //   this.updateGraph();
  // }

  // isSelected(weapon: any) {
  //   return this.selectedWeapons.includes(weapon);
  // }

  // categorizedWeapons(category: string) {
  //   let weapons: any = {};

  //   this.pubgData.weapons.forEach((weapon: any) => {
  //     if (!weapons[weapon[category]]) {
  //       weapons[weapon[category]] = [];
  //     }
  //     weapons[weapon[category]].push(weapon);
  //   });

  //   const data = {
  //     weapons: weapons,
  //     categories: Object.keys(weapons),
  //   };

  //   return data;
  // }

  // addGraph(weapon: any) {
  //   const color = this.colors[this.selectedWeaponCounter % this.colors.length];

  //   /* ------------- Damage ------------- */
  //   var dataDMG: any = [];
  //   const weaponDamageFalloff = this.pubgData.damageFalloffs.filter(
  //     (entry: any) => {
  //       return entry.weapon_name === weapon.name;
  //     }
  //   );

  //   if (weaponDamageFalloff.length === 0) {
  //     dataDMG.push({
  //       x: 0,
  //       y: weapon.damage,
  //     });
  //   } else {
  //     weaponDamageFalloff.forEach((damageFalloff: any) => {
  //       dataDMG.push({
  //         x: damageFalloff.distance,
  //         y: damageFalloff.multiplier * weapon.damage,
  //       });
  //     });
  //   }
  //   if (dataDMG[dataDMG.length - 1].x < 1000) {
  //     dataDMG.push({
  //       x: 1000,
  //       y: dataDMG[dataDMG.length - 1].y,
  //     });
  //   }

  //   this.lineChartDataDamage.datasets.push({
  //     data: dataDMG,
  //     label: weapon.name,
  //     fill: false,
  //     tension: 0,
  //     borderColor: color,
  //     backgroundColor: `#ffffff00`,
  //     borderWidth: 3,
  //     pointRadius: 0,
  //     // borderDash: [
  //     //   3,
  //     //   this.lineChartData.datasets.length >= this.colors.length ? 1 : 0,
  //     // ],
  //   });

  //   /* ------------ Velocity ------------ */

  //   var dataVel: any = [];
  //   const weaponVelocityFalloff = this.pubgData.velocityFalloffs.filter(
  //     (entry: any) => {
  //       return entry.weapon_name === weapon.name;
  //     }
  //   );

  //   if (weaponVelocityFalloff.length === 0) {
  //     dataVel.push({
  //       x: 0,
  //       y: 0,
  //     });
  //   } else {
  //     weaponVelocityFalloff.forEach((velocityFalloff: any) => {
  //       dataVel.push({
  //         x: velocityFalloff.distance,
  //         y: velocityFalloff.velocity,
  //       });
  //     });
  //   }

  //   if (dataVel[dataVel.length - 1].x < 1000) {
  //     dataVel.push({
  //       x: 1000,
  //       y: dataVel[dataVel.length - 1].y,
  //     });
  //   }

  //   this.lineChartDataVelocity.datasets.push({
  //     data: dataVel,
  //     label: weapon.name,
  //     fill: false,
  //     tension: 0,
  //     borderColor: color,
  //     backgroundColor: `#ffffff00`,
  //     borderWidth: 3,
  //     pointRadius: 0,
  //     // borderDash: [1, 5],
  //   });

  //   /* ---------------- - --------------- */

  //   this.selectedWeaponCounter++;
  // }

  // updateGraph() {
  //   this.selectedWeaponCounter = 0;
  //   this.lineChartDataDamage.datasets = [];
  //   this.lineChartDataVelocity.datasets = [];
  //   this.selectedWeapons.forEach((weapon: any) => {
  //     this.addGraph(weapon);
  //   });
  //   this.lineChartDataDamage = { ...this.lineChartDataDamage };
  //   this.lineChartDataVelocity = { ...this.lineChartDataVelocity };
  // }

  // getStyleColor(variable: string) {
  //   const body = document.getElementsByTagName('body')[0];
  //   const color = getComputedStyle(body).getPropertyValue(variable);
  //   return color;
  // }
}
