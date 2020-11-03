import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ViewManagerService {

  private _currentView: string;
  public get currentView() : string {
    return this._currentView;
  }

  public setCurrentView(currentView: string) {
    if(currentView === '') this._currentView = '';
    else this._currentView = `--- ${currentView}`;
  }

  constructor() { }
}
