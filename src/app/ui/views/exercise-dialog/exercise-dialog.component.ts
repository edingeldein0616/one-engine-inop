import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import lottie, { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-exercise-dialog',
  templateUrl: './exercise-dialog.component.html',
  styleUrls: ['./exercise-dialog.component.scss']
})
export class ExerciseDialogComponent implements OnInit {

  private _containers: HTMLCollectionOf<Element>;
  private _animations: AnimationItem[];
  private _currentAnimation: number;

  constructor(public dialogRef: MatDialogRef<ExerciseDialogComponent>) {
  }

  ngOnInit(): void {
    var animation = lottie.loadAnimation({
      container: document.getElementById('step-1'),
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/step-2.json'
    });
    var animation = lottie.loadAnimation({
      container: document.getElementById('step-2'),
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/step-1.json'
    });
  }

  public next(): void {
  }

  public previous(): void {
  }

  public exitExercise(): void {
    this.dialogRef.close();
  }

}
