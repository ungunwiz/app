import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'weaponlist',
    pathMatch: 'full',
  },
  {
    path: 'weaponlist',
    loadChildren: () =>
      import('./weaponlist/weaponlist.module').then(
        (m) => m.WeaponListPageModule
      ),
  },
  {
    path: 'graph',
    loadChildren: () =>
      import('./graph/graph.module').then((m) => m.GraphPageModule),
  },
  {
    path: 'rawdata',
    loadChildren: () =>
      import('./rawdata/rawdata.module').then((m) => m.RawDataPageModule),
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./settings/settings.module').then((m) => m.SettingsPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
