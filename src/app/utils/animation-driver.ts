import { EventBus } from 'src/app/engine/core/events';
import { AnimationAction } from 'three';
import { Subject } from 'src/app/engine/core/events';
import { AnimationData } from 'src/app/engine/core/systems';

export class AnimationDriver {

  private _playAction: (a: AnimationAction) => void;
  private _stopAction: (a: AnimationAction) => void;
  private _pauseAction: (a: AnimationAction) => void;
  private _resetAction: (a: AnimationAction) => void;
  private _jumpToAction: (a: AnimationAction, position: number) => void;
  private _haltAction: (a: AnimationAction) => void;

  constructor() {
    this._playAction = (a: AnimationAction) => {
      a.play();
    };
    this._stopAction = (a: AnimationAction) => {
      a.stop();
    };
    this._pauseAction = (a: AnimationAction) => {
      a.paused = true;
    };
    this._resetAction = (a: AnimationAction) => {
      a.reset();
    };
    this._jumpToAction = (a: AnimationAction, position: number) => {
      if(a.isRunning()) {
        a.stop();
      }
      const clip = a.getClip();
      let time = (position / 100) * clip.duration;

      a.time = time;
      a.paused = true;
      a.play();
    }

    this._haltAction = (a: AnimationAction) => {
      a.reset();
      a.stop();
    }
  }

  public play(actionName: string): void {
    const playAction = this._subject(actionName, this._playAction);
    EventBus.get().publish('animation', playAction);
  }

  public stop(actionName: string): void {
    const stopAction = this._subject(actionName, this._stopAction);
    EventBus.get().publish('animation', stopAction);
  }

  public pause(actionName: string): void {
    const pauseAction = this._subject(actionName, this._pauseAction);
    EventBus.get().publish('animation', pauseAction);
  }

  public jumpTo(actionName: string, position: number): void {
    const jumpToAction = this._subject(actionName, this._jumpToAction, position)
    EventBus.get().publish('animation', jumpToAction);
  }

  public reset(actionName: string): void {
    const resetAction = this._subject(actionName, this._resetAction);
    EventBus.get().publish('animation', resetAction);
  }

  public halt(actionName: string): void {
    const haltAction = this._subject(actionName, this._haltAction);
    EventBus.get().publish('animation', haltAction);
  }

  private _subject(actionName: string, callback: (a: AnimationAction, ...args: any[]) => void, ...args: any[]): Subject {
    const subject = new Subject();
    subject.data = new AnimationData(actionName, callback, args);
    return subject;
  }

}

export enum AnimationPosition {
  Beginning,
  End
}
