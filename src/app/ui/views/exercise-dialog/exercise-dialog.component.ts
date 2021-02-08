import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-exercise-dialog',
  templateUrl: './exercise-dialog.component.html',
  styleUrls: ['./exercise-dialog.component.scss']
})
export class ExerciseDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ExerciseDialogComponent>) { }

  ngOnInit(): void {
  }

  public exitExercise(): void {
    this.dialogRef.close();
  }

}
