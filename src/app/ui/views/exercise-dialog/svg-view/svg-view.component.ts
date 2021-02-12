import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import lottie, { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-svg-view',
  templateUrl: './svg-view.component.html',
  styleUrls: ['./svg-view.component.scss']
})
export class SvgViewComponent implements AfterViewInit {

  private static _assetPath = 'assets/';

  @Input() animation: string;
  @Input() autoplay: boolean;
  @Input() loop: boolean;
  private _animationItem: AnimationItem
  private _container: HTMLElement;

  constructor() { }

  ngAfterViewInit(): void {
    console.log('animation: ' + this.animation + ', typeof ' + typeof this.animation);
    console.log('autoplay: ' + this.autoplay + ', typeof ' + typeof this.autoplay);
    console.log('loop: ' + this.loop + ', typeof ' + typeof this.loop);
    this._container = document.getElementById(this.animation);
    this._animationItem = lottie.loadAnimation({
      container: this._container,
      renderer: 'svg',
      loop: this.loop,
      autoplay: this.autoplay,
      path: SvgViewComponent._assetPath + this.animation + '.json'
    });

    if(!this.autoplay) {
      this._animationItem.hide();
    }
  }

  public play() {
    this._animationItem.show();
    this._animationItem.play();
  }

  public stop() {
    this._animationItem.stop();
    this._animationItem.hide();
  }

}
