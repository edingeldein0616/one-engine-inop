import { Subject, Observable } from 'rxjs';

export class SeminoleActionModel {

  private _inopEngine: string;
  private _inopEngineSubject: Subject<string>;
  public get inopEngineObservable(): Observable<string> {
    return this._inopEngineSubject.asObservable();
  }
  public get inopEngine(): string {
    return this._inopEngine;
  }
  public set inopEngine(value: string) {
    if(value === 'LEFT' || value === 'RIGHT') {
      this._inopEngine = value;
      this._inopEngineSubject.next(value);
    }
  }

  /**
   *
   */
  constructor() {
    this._inopEngineSubject = new Subject();
  }

}
