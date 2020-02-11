import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UiComponent } from './ui/ui.component';
import { OeiControlsModule } from './ui/controls/oei-controls.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ViewDcvComponent } from './ui/views/view-dcv/view-dcv.component';
import { ViewSepComponent } from './ui/views/view-sep/view-sep.component';
import { ViewCefComponent } from './ui/views/view-cef/view-cef.component';
import { ViewZstComponent } from './ui/views/view-zst/view-zst.component';
import { ViewMenuComponent } from './ui/views/view-menu/view-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    UiComponent,
    ViewDcvComponent,
    ViewSepComponent,
    ViewCefComponent,
    ViewZstComponent,
    ViewMenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    OeiControlsModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
