import { NgModule } from '@angular/core';

import {
  MatToolbarModule,
  MatMenuModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatIconModule,
  MatCardModule,
  MatProgressBarModule,
  MatDialogModule,
  MatGridListModule,
  MatTabsModule
} from '@angular/material';

@NgModule({
  declarations: [],
  imports: [
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatDialogModule,
    MatGridListModule,
    MatTabsModule
  ],
  exports: [
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatDialogModule,
    MatGridListModule,
    MatTabsModule
  ]
})
export class MaterialModule { }
