import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PubgDataService } from '@service/pubgData.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '@service/notification.service';
import { SettingsService } from '@service/settings.service';

@Component({
  selector: 'app-weaponlist',
  templateUrl: './weaponlist.page.html',
  styleUrls: ['./weaponlist.page.scss'],
})
export class WeaponListPage implements OnInit {
  constructor(
    private pubgDataService: PubgDataService,
    private router: Router,
    private http: HttpClient,
    private notificationService: NotificationService,
    public settingsService: SettingsService
  ) {}

  public settings = this.settingsService.settings;

  public loading = true;
  public pubgData: any = {};
  public weapons: any = [];
  public searchText: string = '';
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

  private getWeaponMetaData() {
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

  private map(
    value: number,
    min1: number,
    max1: number,
    min2: number,
    max2: number
  ) {
    return ((value - min1) * (max2 - min2)) / (max1 - min1) + min2;
  }

  public search() {
    const searchText = this.searchText.toLowerCase();

    this.weapons = this.pubgData.weapons.filter((weapon: any) => {
      return weapon.name.toLowerCase().includes(searchText);
    });
  }

  private prepareWeapons() {
    const typeOrder = [
      'Handgun',
      'Shotgun',
      'SMG',
      'AR',
      'LMG',
      'DMR',
      'SR',
      'Misc',
    ];
    this.pubgData.weapons.forEach((weapon: any) => {
      weapon.typeOrder = typeOrder.indexOf(weapon.type);
    });
    this.weapons = this.pubgData.weapons.sort((a: any, b: any) => {
      a.selected = false;
      if (a.typeOrder > b.typeOrder) {
        return 1;
      } else if (a.typeOrder < b.typeOrder) {
        return -1;
      } else {
        return a.name > b.name ? 1 : -1;
      }
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

  public mapT(value: number) {
    return this.map(value, this.minImageHeight, this.maxImageHeight, 50, 60);
  }

  public countSelected() {
    return this.weapons.filter((weapon: any) => weapon.selected).length;
  }
  public allSelected() {
    return this.countSelected() === this.weapons.length;
  }
  public toggleAllWeapons() {
    const allSelected = this.allSelected();
    this.weapons.forEach((weapon: any) => {
      weapon.selected = !allSelected;
    });
  }
  public toggleWeapon(weapon: any) {
    weapon.selected = !weapon.selected;
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
  public getWeaponTypeName(type: string) {
    const dictionary: any = {
      AR: 'Assault Rifles',
      DMR: 'Designated Marksman Rifles',
      LMG: 'Light Machine Guns',
      SMG: 'Submachine Guns',
      Shotgun: 'Shotguns',
      SR: 'Sniper Rifles',
      Handgun: 'Handguns',
    };

    return dictionary[type] || type;
  }

  public navigateWithWeapons() {
    const selectedWeapons = this.weapons.filter((weapon: any) => {
      return weapon.selected;
    });

    if (
      selectedWeapons.length > 8 &&
      !this.settings.developer.ignoreDetailsLimit
    ) {
      this.notificationService.createCustom('Too many weapons selected!', {
        type: 2,
        message: 'Please only select up to 8 weapons.',
      });
      return;
    }
    const weapons = selectedWeapons.map((weapon: any) => {
      return weapon.name;
    });
    const queryParams: any = {
      queryParams: { weapons: JSON.stringify(weapons) },
      queryParamsHandling: 'merge',
    };

    this.router.navigate(['/graph'], queryParams);
  }
}
