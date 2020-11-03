import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-ui',
  templateUrl: 'ui.component.html',
  styleUrls: ['ui.component.scss']
})
export class UiComponent implements OnInit, OnDestroy {

  public loading: boolean;

  private _loadingSub: Subscription;

  constructor(private _loaderService: LoaderService) {
  }

  public ngOnInit(): void {
    this._loadingSub = this._loaderService.isLoadingObservable
      .subscribe(value => this.loading = value);
  }

  public ngOnDestroy(): void {
    this._loadingSub.unsubscribe();
  }

}
