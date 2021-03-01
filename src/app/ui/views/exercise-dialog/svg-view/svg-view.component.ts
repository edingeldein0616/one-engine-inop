import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import lottie, { AnimationItem } from 'lottie-web';
import { ContentDictionaryService } from 'src/app/services/content-dictionary.service';

@Component({
  selector: 'app-svg-view',
  templateUrl: './svg-view.component.html',
  styleUrls: ['./svg-view.component.scss']
})
export class SvgViewComponent implements AfterViewInit {

  private static _assetPath = 'assets/';

  public content: string;

  @Input() animation: string;
  @Input() autoplay: boolean;
  @Input() loop: boolean;
  private _animationItem: AnimationItem
  private _container: HTMLElement;

  constructor(private _contentDictionary: ContentDictionaryService) { }

  public ngAfterViewInit(): void {
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

    this.content = this._contentDictionary.getContent(this.animation);
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
