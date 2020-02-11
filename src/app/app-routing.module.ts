import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewMenuComponent } from './ui/views/view-menu/view-menu.component';
import { ViewZstComponent } from './ui/views/view-zst/view-zst.component';
import { ViewDcvComponent } from './ui/views/view-dcv/view-dcv.component';
import { ViewSepComponent } from './ui/views/view-sep/view-sep.component';
import { ViewCefComponent } from './ui/views/view-cef/view-cef.component';

const routes: Routes = [
  { path: '', component: ViewMenuComponent },
  { path: 'zero-sideslip-technique', component: ViewZstComponent },
  { path: 'critical-engine-factors', component: ViewCefComponent },
  { path: 'single-engine-performance', component: ViewSepComponent },
  { path: 'directional-control-vmca', component: ViewDcvComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
