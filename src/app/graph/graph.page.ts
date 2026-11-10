import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart, ChartConfiguration, Plugin } from 'chart.js';
import {
  ArmorLevel,
  CombatResult,
  CombatScenario,
  CombatService,
  HitZone,
} from '@service/combat.service';
import { PubgDataService } from '@service/pubgData.service';

type CompareMetric = 'damage' | 'stk' | 'ttk' | 'velocity';

interface WeaponSnapshot {
  weapon: any;
  result: CombatResult;
  color: string;
}

@Component({
  selector: 'app-graph',
  templateUrl: './graph.page.html',
  styleUrls: ['./graph.page.scss'],
})
export class GraphPage implements OnInit, OnDestroy {
  constructor(
    private pubgDataService: PubgDataService,
    private combatService: CombatService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  @ViewChild('compareChart')
  public set compareChart(element: ElementRef<HTMLCanvasElement> | undefined) {
    this.chartElement = element;
    if (element) {
      setTimeout(() => this.refreshChart());
    }
  }

  public pubgData: any = {};
  public selectedWeapons: any[] = [];
  public snapshots: WeaponSnapshot[] = [];
  public loading = true;
  public maxRange = 500;
  public metric: CompareMetric = 'damage';
  public readonly armorLevels: ArmorLevel[] = [0, 1, 2, 3];
  public readonly zones: Array<{ value: HitZone; label: string }> = [
    { value: 'head', label: 'Head' },
    { value: 'neck', label: 'Neck' },
    { value: 'chest', label: 'Chest' },
    { value: 'torso', label: 'Torso' },
    { value: 'stomach', label: 'Stomach' },
    { value: 'limbs', label: 'Limbs' },
  ];
  public readonly metricLabels: Record<CompareMetric, string> = {
    damage: 'Damage',
    stk: 'Shots to kill',
    ttk: 'Time to kill',
    velocity: 'Velocity',
  };
  public readonly combatMetrics: CompareMetric[] = ['damage', 'stk', 'ttk'];

  private chart?: Chart<'line'>;
  private chartElement?: ElementRef<HTMLCanvasElement>;
  public readonly colors = [
    '#b566ff',
    '#3d9cff',
    '#ffb020',
    '#ff5d75',
    '#42d987',
    '#f06be5',
    '#33c8c2',
    '#d9d45b',
  ];
  private scenario: CombatScenario = {
    distance: 100,
    zone: 'torso',
    vest: 2,
    helmet: 2,
  };

  async ngOnInit() {
    this.pubgData = await this.pubgDataService.get();
    this.restoreScenario();

    const weaponsParam = this.route.snapshot.queryParamMap.get('weapons');
    const names = this.parseWeaponNames(weaponsParam);
    this.selectedWeapons = this.pubgData.weapons.filter((weapon: any) =>
      names.includes(weapon.name)
    );
    this.loading = false;
    this.refresh();
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  public get distance(): number {
    return this.scenario.distance;
  }

  public get zone(): HitZone {
    return this.scenario.zone;
  }

  public get vest(): ArmorLevel {
    return this.scenario.vest;
  }

  public get helmet(): ArmorLevel {
    return this.scenario.helmet;
  }

  public setDistance(value: number | string) {
    this.scenario.distance = Number(value);
    this.refresh();
  }

  public setZone(zone: HitZone) {
    this.scenario.zone = zone;
    this.refresh();
  }

  public setArmor(type: 'vest' | 'helmet', level: ArmorLevel) {
    this.scenario[type] = level;
    this.refresh();
  }

  public setMetric(metric: CompareMetric) {
    this.metric = metric;
    this.refreshChart();
  }

  public toggleRange() {
    this.maxRange = this.maxRange === 500 ? 1000 : 500;
    if (this.distance > this.maxRange) {
      this.scenario.distance = this.maxRange;
    }
    this.refresh();
  }

  public removeWeapon(weapon: any) {
    this.selectedWeapons = this.selectedWeapons.filter(
      (entry) => entry.name !== weapon.name
    );
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        weapons: JSON.stringify(
          this.selectedWeapons.map((entry) => entry.name)
        ),
      },
      replaceUrl: true,
    });
    this.refresh();
  }

  public armorLabel(level: ArmorLevel): string {
    return level === 0 ? 'None' : `Lv ${level}`;
  }

  public isBest(snapshot: WeaponSnapshot, key: keyof CombatResult): boolean {
    if (this.snapshots.length < 2) {
      return false;
    }
    const values = this.snapshots.map((entry) => entry.result[key] as number);
    const lowerWins = key === 'stk' || key === 'ttk' || key === 'timeToTarget';
    const best = lowerWins ? Math.min(...values) : Math.max(...values);
    return (snapshot.result[key] as number) === best;
  }

  public trackWeapon(_index: number, snapshot: WeaponSnapshot): string {
    return snapshot.weapon.name;
  }

  private refresh() {
    this.snapshots = this.selectedWeapons.map((weapon, index) => ({
      weapon,
      result: this.combatService.calculate(weapon, this.scenario, this.pubgData),
      color: this.colors[index % this.colors.length],
    }));
    sessionStorage.setItem(
      'compareScenario',
      JSON.stringify({
        scenario: this.scenario,
        maxRange: this.maxRange,
        metric: this.metric,
      })
    );
    this.refreshChart();
  }

  private refreshChart() {
    if (
      !this.chartElement ||
      !this.selectedWeapons.length
    ) {
      return;
    }

    const styles = getComputedStyle(document.body);
    const textColor =
      styles.getPropertyValue('--ion-color-step-text-800').trim() || '#777';
    const gridColor =
      styles.getPropertyValue('--compare-grid').trim() ||
      'rgba(128, 128, 128, .18)';
    const datasets = this.selectedWeapons.map((weapon, index) => ({
      label: weapon.name,
      data: this.buildSeries(weapon),
      borderColor: this.colors[index % this.colors.length],
      backgroundColor: this.colors[index % this.colors.length],
      borderWidth: 3,
      pointRadius: 0,
      pointHoverRadius: 5,
      tension: 0.22,
    }));

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: { datasets },
      plugins: [this.distanceMarkerPlugin()],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 260 },
        interaction: { mode: 'index', intersect: false },
        events: [
          'mousemove',
          'mouseout',
          'click',
          'touchstart',
          'touchmove',
        ],
        parsing: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: textColor,
              usePointStyle: true,
              pointStyle: 'line',
              padding: 18,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: ${this.formatMetric(
                  Number(context.parsed.y)
                )}`,
            },
          },
        },
        scales: {
          x: {
            type: 'linear',
            min: 0,
            max: this.maxRange,
            grid: { color: gridColor },
            ticks: { color: textColor },
            title: {
              display: true,
              text: 'Distance (m)',
              color: textColor,
            },
          },
          y: {
            beginAtZero: this.metric !== 'velocity',
            grid: { color: gridColor },
            ticks: { color: textColor },
            title: {
              display: true,
              text: this.axisLabel(),
              color: textColor,
            },
          },
        },
      },
    };

    this.chart?.destroy();
    this.chart = new Chart(this.chartElement.nativeElement, config);
  }

  private buildSeries(weapon: any): Array<{ x: number; y: number }> {
    const step = this.maxRange === 1000 ? 20 : 10;
    const points: Array<{ x: number; y: number }> = [];
    for (let distance = 0; distance <= this.maxRange; distance += step) {
      const result = this.combatService.calculate(
        weapon,
        { ...this.scenario, distance },
        this.pubgData
      );
      points.push({ x: distance, y: result[this.metric] });
    }
    return points;
  }

  private distanceMarkerPlugin(): Plugin<'line'> {
    return {
      id: 'compareDistanceMarker',
      afterDatasetsDraw: (chart) => {
        const x = chart.scales['x'].getPixelForValue(this.distance);
        const { top, bottom } = chart.chartArea;
        const ctx = chart.ctx;
        ctx.save();
        ctx.strokeStyle = this.colors[0];
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.stroke();
        ctx.restore();
      },
    };
  }

  private formatMetric(value: number): string {
    if (this.metric === 'stk') {
      return `${Math.round(value)} shots`;
    }
    if (this.metric === 'ttk') {
      return `${value.toFixed(3)} s`;
    }
    if (this.metric === 'velocity') {
      return `${Math.round(value)} m/s`;
    }
    return `${value.toFixed(1)} dmg`;
  }

  private axisLabel(): string {
    const labels: Record<CompareMetric, string> = {
      damage: 'Damage per hit',
      stk: 'Shots to kill',
      ttk: 'Time to kill (s)',
      velocity: 'Velocity (m/s)',
    };
    return labels[this.metric];
  }

  private restoreScenario() {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem('compareScenario') || '{}'
      );
      if (saved.scenario) {
        this.scenario = { ...this.scenario, ...saved.scenario };
      }
      if (saved.maxRange === 500 || saved.maxRange === 1000) {
        this.maxRange = saved.maxRange;
      }
      if (['damage', 'stk', 'ttk', 'velocity'].includes(saved.metric)) {
        this.metric = saved.metric;
      }
    } catch {
      sessionStorage.removeItem('compareScenario');
    }
  }

  private parseWeaponNames(value: string | null): string[] {
    if (!value) {
      return [];
    }
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter(
          (name: unknown): name is string => typeof name === 'string'
        )
        : [];
    } catch {
      return [];
    }
  }
}
