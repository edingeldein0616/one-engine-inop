import { EventBus } from 'src/app/engine/core/events';
import { AnimationAction } from 'three';
import { Subject } from 'src/app/engine/core/events';
import { AnimationData } from 'src/app/engine/core/systems';

export class AnimationDriver {

  private _playAction: (a: AnimationAction) => void;
  private _stopAction: (a: AnimationAction) => void;
  private _jumpToAction: (a: AnimationAction, position: AnimationPosition) => void;

  constructor() {
    this._playAction = (a: AnimationAction) => {
      a.play();
    };
    this._stopAction = (a: AnimationAction) => {
      a.stop();
    };
    this._jumpToAction = (a: AnimationAction, position: AnimationPosition) => {
      const clip = a.getClip();
      let time = position == AnimationPosition.Beginning
        ? 0
        : clip.duration;

      a.time = time;
      a.paused = true;
      a.play();
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

  public jumpTo(actionName: string, position: AnimationPosition): void {
    const jumpToAction = this._subject(actionName, this._jumpToAction, position)
    EventBus.get().publish('animation', jumpToAction);
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
