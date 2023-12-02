import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'weaponprofiles',
    pathMatch: 'full',
  },
  {
    path: 'weaponprofiles',
    loadChildren: () =>
      import('./weaponprofiles/weaponprofiles.module').then(
        (m) => m.WeaponProfilesPageModule
      ),
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
