import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewDcvComponent } from './ui/views/view-dcv/view-dcv.component';
import { ViewSepComponent } from './ui/views/view-sep/view-sep.component';
import { ViewCefComponent } from './ui/views/view-cef/view-cef.component';

const routes: Routes = [
  { path: '', component: ViewCefComponent },
  { path: 'single-engine-performance', component: ViewSepComponent },
  { path: 'directional-control-vmca', component: ViewDcvComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
