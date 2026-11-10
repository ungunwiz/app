import { Injectable } from '@angular/core';

export type ArmorLevel = 0 | 1 | 2 | 3;
export type HitZone =
  | 'head'
  | 'neck'
  | 'chest'
  | 'torso'
  | 'stomach'
  | 'limbs';

export interface CombatScenario {
  distance: number;
  zone: HitZone;
  vest: ArmorLevel;
  helmet: ArmorLevel;
  health?: number;
}

export interface CombatResult {
  damage: number;
  stk: number;
  ttk: number;
  dps: number;
  velocity: number;
  timeToTarget: number;
}

@Injectable({
  providedIn: 'root',
})
export class CombatService {
  /**
   * PUBG's intact-armor damage reduction. The equipment blueprints are not
   * present in this repository, so keep this sourced table explicit.
   */
  public readonly armorReduction: Record<ArmorLevel, number> = {
    0: 0,
    1: 0.3,
    2: 0.4,
    3: 0.55,
  };

  private readonly zoneParts: Record<HitZone, string> = {
    head: 'head',
    neck: 'neck_01',
    chest: 'spine_03',
    torso: 'spine_02',
    stomach: 'spine_01',
    limbs: 'thigh_l',
  };

  private readonly weaponClasses: Record<string, string> = {
    AR: 'Rifle',
    DMR: 'DMR',
    SR: 'Sniper',
    LMG: 'LMG',
    SMG: 'SMG',
    Shotgun: 'Shotgun',
    Handgun: 'Pistol',
    Misc: 'Crossbow',
  };

  public falloffAt(
    weapon: any,
    distance: number,
    damageFalloffs: any[]
  ): number {
    const points = damageFalloffs
      .filter((entry) => entry.weapon_name === weapon.name)
      .map((entry) => ({
        distance: Number(entry.distance),
        value: Number(entry.multiplier),
      }))
      .sort((a, b) => a.distance - b.distance);

    return this.interpolate(points, distance, 1);
  }

  public velocityAt(
    weapon: any,
    distance: number,
    velocityFalloffs: any[]
  ): number {
    const points = velocityFalloffs
      .filter((entry) => entry.weapon_name === weapon.name)
      .map((entry) => ({
        distance: Math.abs(Number(entry.distance)),
        value: Number(entry.velocity),
      }))
      .sort((a, b) => a.distance - b.distance);

    return this.interpolate(points, distance, Number(weapon.speed) || 0);
  }

  public hitDamage(
    weapon: any,
    scenario: CombatScenario,
    data: any
  ): number {
    const falloff = this.falloffAt(
      weapon,
      scenario.distance,
      data.damageFalloffs || []
    );
    const multipliers = this.getHitMultipliers(
      weapon,
      scenario.zone,
      data.damageAreas || []
    );
    const armor = this.armorForZone(scenario);

    return (
      Number(weapon.damage) *
      falloff *
      multipliers.part *
      multipliers.weaponClass *
      (1 - armor)
    );
  }

  public calculate(
    weapon: any,
    scenario: CombatScenario,
    data: any
  ): CombatResult {
    const damage = this.hitDamage(weapon, scenario, data);
    const health = scenario.health ?? 100;
    const stk = damage > 0 ? Math.ceil(health / damage) : 0;
    const rate = Number(weapon.rof) || 0;
    const ttk = rate > 0 && stk > 0 ? (stk - 1) / rate : 0;
    const velocity = this.velocityAt(
      weapon,
      scenario.distance,
      data.velocityFalloffs || []
    );

    return {
      damage,
      stk,
      ttk,
      dps: damage * rate,
      velocity,
      timeToTarget:
        velocity > 0 ? Math.max(0, scenario.distance) / velocity : 0,
    };
  }

  public fullDamageRange(weapon: any, damageFalloffs: any[]): number {
    const points = damageFalloffs
      .filter((entry) => entry.weapon_name === weapon.name)
      .map((entry) => ({
        distance: Number(entry.distance),
        multiplier: Number(entry.multiplier),
      }))
      .sort((a, b) => a.distance - b.distance);

    if (!points.length) {
      return Number(weapon.maxDistance) || 0;
    }

    const firstReducedPoint = points.find((point) => point.multiplier < 1);
    if (!firstReducedPoint) {
      return points[points.length - 1].distance;
    }

    const previous = [...points]
      .reverse()
      .find(
        (point) =>
          point.distance <= firstReducedPoint.distance &&
          point.multiplier >= 1
      );
    return previous?.distance ?? 0;
  }

  public classForWeapon(weapon: any): string {
    return this.weaponClasses[weapon.type] || weapon.type;
  }

  private getHitMultipliers(
    weapon: any,
    zone: HitZone,
    damageAreas: any[]
  ): { part: number; weaponClass: number } {
    const part = this.zoneParts[zone];
    const weaponClass = this.classForWeapon(weapon);
    const area = damageAreas.find(
      (entry) =>
        entry.part === part && entry.weaponClass === weaponClass
    );

    return {
      part: Number(area?.partMultiplier) || 1,
      weaponClass: Number(area?.weaponClassMultiplier) || 1,
    };
  }

  private armorForZone(scenario: CombatScenario): number {
    if (scenario.zone === 'head' || scenario.zone === 'neck') {
      return this.armorReduction[scenario.helmet];
    }
    if (scenario.zone === 'limbs') {
      return 0;
    }
    return this.armorReduction[scenario.vest];
  }

  private interpolate(
    points: Array<{ distance: number; value: number }>,
    distance: number,
    fallback: number
  ): number {
    if (!points.length) {
      return fallback;
    }

    const target = Math.max(0, Number(distance) || 0);
    if (target <= points[0].distance) {
      return points[0].value;
    }

    for (let index = 1; index < points.length; index += 1) {
      const end = points[index];
      if (target <= end.distance) {
        const start = points[index - 1];
        const span = end.distance - start.distance;
        if (span === 0) {
          return end.value;
        }
        const progress = (target - start.distance) / span;
        return start.value + (end.value - start.value) * progress;
      }
    }

    return points[points.length - 1].value;
  }
}
