import { EventBus } from 'src/app/engine/core/events';
import { AnimationAction } from 'three';
import { Subject } from 'src/app/engine/core/events';
import { AnimationData } from 'src/app/engine/core/systems';
import { ThreeEngineEvent } from './custom-events';

export class AnimationDriver {

  private _playAction: (a: AnimationAction) => void;
  private _stopAction: (a: AnimationAction) => void;
  private _pauseAction: (a: AnimationAction) => void;
  private _resetAction: (a: AnimationAction) => void;
  private _jumpToAction: (a: AnimationAction, args: number[]) => void;
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
    this._jumpToAction = (a: AnimationAction, args: number[]) => {
      const position = args[0];
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

  public play(modelName: string, actionName: string): void {
    const playAction = this._subject(modelName, actionName, this._playAction, modelName);
    EventBus.get().publish(ThreeEngineEvent.ANIMATION, playAction);
  }

  public stop(modelName: string, actionName: string): void {
    const stopAction = this._subject(modelName, actionName, this._stopAction, modelName);
    EventBus.get().publish(ThreeEngineEvent.ANIMATION, stopAction);
  }

  public pause(modelName: string, actionName: string): void {
    const pauseAction = this._subject(modelName, actionName, this._pauseAction, modelName);
    EventBus.get().publish(ThreeEngineEvent.ANIMATION, pauseAction);
  }

  public jumpTo(modelName:string, actionName: string, position: number): void {
    const jumpToAction = this._subject(modelName, actionName, this._jumpToAction, position)
    EventBus.get().publish(ThreeEngineEvent.ANIMATION, jumpToAction);
  }

  public reset(modelName: string, actionName: string): void {
    const resetAction = this._subject(modelName, actionName, this._resetAction, modelName);
    EventBus.get().publish(ThreeEngineEvent.ANIMATION, resetAction);
  }

  public halt(modelName: string, actionName: string): void {
    const haltAction = this._subject(modelName, actionName, this._haltAction, modelName);
    EventBus.get().publish(ThreeEngineEvent.ANIMATION, haltAction);
  }

  private _subject(targetName: string, actionName: string, callback: (a: AnimationAction, ...args: any[]) => void, ...args: any[]): Subject {
    const subject = new Subject();
    subject.data = new AnimationData(targetName, actionName, callback, args);
    return subject;
  }

}

export enum AnimationPosition {
  Beginning,
  End
}
