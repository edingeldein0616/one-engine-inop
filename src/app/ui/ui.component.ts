import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssetManager } from 'src/app/engine/core/AssetManager';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ui',
  templateUrl: 'ui.component.html',
  styleUrls: ['ui.component.scss']
})
export class UiComponent implements OnInit, OnDestroy {

  public loading: boolean;

  private _loadingSub: Subscription;

  public ngOnInit(): void {
    this._loadingSub = AssetManager.get().loadingObservable.subscribe(
      value => this.loading = value
    );
  }

  public ngOnDestroy(): void {
    this._loadingSub.unsubscribe();
  }

}
