import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './ui/menu/menu.component';
import { UiComponent } from './ui/ui.component';
import { OeiControlsModule } from './ui/controls/oei-controls.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    UiComponent
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
