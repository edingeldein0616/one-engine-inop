import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import lottie from 'lottie-web';

@Component({
  selector: 'app-exercise-dialog',
  templateUrl: './exercise-dialog.component.html',
  styleUrls: ['./exercise-dialog.component.scss']
})
export class ExerciseDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ExerciseDialogComponent>) { }

  ngOnInit(): void {
    var animation = lottie.loadAnimation({
      container: document.getElementById('bm'),
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: 'assets/step-2.json'
    });
  }


  public exitExercise(): void {
    this.dialogRef.close();
  }

}
