import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PubgDataService } from '@service/pubgData.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-weaponlist',
  templateUrl: './weaponlist.page.html',
  styleUrls: ['./weaponlist.page.scss'],
})
export class WeaponListPage implements OnInit {
  constructor(
    private pubgDataService: PubgDataService,
    private router: Router,
    private http: HttpClient
  ) {}

  private sortType: string = 'name';

  public loading = true;
  public pubgData: any = {};
  public weapons: any = [];
  public searchText: string = '';
  public selectedWeapons: any = [];
  public weaponStats: any = {};
  public minImageHeight: number = 10000;
  public maxImageHeight: number = 0;

  async ngOnInit() {
    this.pubgData = await this.pubgDataService.get();

    // TODO: Use Promise.all and this.loading to remove *ngIf="weapon.meta":
    this.prepareWeapons();
    this.search();
    this.scaleWeaponStats();
    this.getWeaponMetaData();

    this.loading = false;
  }

  getWeaponMetaData() {
    this.weapons.forEach((weapon: any) => {
      const weaponName = weapon.name.replace(/\s/g, '_');
      this.http.get(`/assets/gameAssets/weapons/${weaponName}.json`).subscribe({
        next: (data: any) => {
          weapon.meta = {
            height: data.height,
            width: data.width,
          };
          if (data.height > this.maxImageHeight) {
            this.maxImageHeight = data.height;
          }
          if (data.height < this.minImageHeight) {
            this.minImageHeight = data.height;
          }
        },
        error: (error) => console.error(weaponName, error),
      });
    });
  }

  mapT(value: number) {
    return this.map(value, this.minImageHeight, this.maxImageHeight, 50, 60);
  }

  map(value: number, min1: number, max1: number, min2: number, max2: number) {
    return ((value - min1) * (max2 - min2)) / (max1 - min1) + min2;
  }

  public search() {
    const searchText = this.searchText.toLowerCase();

    this.weapons = this.pubgData.weapons.filter((weapon: any) => {
      return weapon.name.toLowerCase().includes(searchText);
    });
  }

  private prepareWeapons() {
    // this.weapons.sort((a: any, b: any) => {
    //   return a[this.sortType] > b[this.sortType] ? 1 : -1;
    // });
    // sort by type and name:
    this.weapons = this.pubgData.weapons.sort((a: any, b: any) => {
      if (a.type > b.type) {
        return 1;
      } else if (a.type < b.type) {
        return -1;
      } else {
        return a.name > b.name ? 1 : -1;
      }
    });
    this.weapons.forEach((weapon: any) => {
      weapon.selected = false;
    });
  }

  private scaleWeaponStats() {
    const minMax: any = {
      damage: {
        min: 10000,
        max: -10000,
      },
      speed: {
        min: 10000,
        max: -10000,
      },
      clip: {
        min: 10000,
        max: -10000,
      },
      rof: {
        min: 10000,
        max: -10000,
      },
      range: {
        min: 10000,
        max: -10000,
      },
    };

    this.weapons.forEach((weapon: any) => {
      weapon = {
        ...weapon,
        damage: parseFloat(weapon.damage),
        speed: parseFloat(weapon.speed),
        clip: parseFloat(weapon.clip),
        rof: parseFloat(weapon.rof),
        range: parseFloat(weapon.range),
      };

      if (weapon.damage < minMax.damage.min) {
        minMax.damage.min = weapon.damage;
      }
      if (weapon.damage > minMax.damage.max) {
        minMax.damage.max = weapon.damage;
      }
      if (weapon.speed < minMax.speed.min) {
        minMax.speed.min = weapon.speed;
      }
      if (weapon.speed > minMax.speed.max) {
        minMax.speed.max = weapon.speed;
      }
      if (weapon.clip < minMax.clip.min) {
        minMax.clip.min = weapon.clip;
      }
      if (weapon.clip > minMax.clip.max) {
        minMax.clip.max = weapon.clip;
      }
      if (weapon.rof < minMax.rof.min) {
        minMax.rof.min = weapon.rof;
      }
      if (weapon.rof > minMax.rof.max) {
        minMax.rof.max = weapon.rof;
      }
    });

    this.weapons.forEach((weapon: any) => {
      weapon = {
        ...weapon,
        damage: parseFloat(weapon.damage),
        speed: parseFloat(weapon.speed),
        clip: parseFloat(weapon.clip),
        rof: parseFloat(weapon.rof),
        range: parseFloat(weapon.range),
      };

      const percentages: any = {
        _damage: weapon.damage,
        _speed: weapon.speed,
        _clip: weapon.clip,
        _tbs: weapon.rof,
      };

      percentages.damage = this.pubgDataService.map(
        weapon.damage,
        minMax.damage.min,
        minMax.damage.max,
        0,
        100
      );
      percentages.speed = this.pubgDataService.map(
        weapon.speed,
        minMax.speed.min,
        minMax.speed.max,
        0,
        100
      );
      percentages.clip = this.pubgDataService.map(
        weapon.clip,
        minMax.clip.min,
        minMax.clip.max,
        0,
        100
      );
      percentages.rof = this.pubgDataService.map(
        weapon.rof,
        minMax.rof.min,
        minMax.rof.max,
        0,
        100
      );
      percentages.range = this.pubgDataService.map(
        weapon.range,
        minMax.range.min,
        minMax.range.max,
        0,
        100
      );

      this.weaponStats[weapon.name] = percentages;
    });
  }

  /* ---------------------------------- */
  /*              FUNCTIONS             */
  /* ---------------------------------- */

  navigateWithWeapons() {
    const weapons = this.selectedWeapons.map((weapon: any) => {
      return weapon.name;
    });
    const queryParams: any = {
      queryParams: { weapons: JSON.stringify(weapons) },
      queryParamsHandling: 'merge',
    };

    this.router.navigate(['/graph'], queryParams);
  }

  public toggleWeapon(weapon: any) {
    weapon.selected = !weapon.selected;

    if (this.isSelected(weapon)) {
      this.selectedWeapons = this.selectedWeapons.filter((w: any) => {
        return w.name !== weapon.name;
      });
    } else if (this.selectedWeapons.length < 8) {
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
}
