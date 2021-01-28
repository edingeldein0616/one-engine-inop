import { environment } from "src/environments/environment";
import { OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { AppInjector } from "src/app/app-injector.service";
import { EngineService } from "src/app/engine/engine.service";
import { SeminoleActionModel, AnimationDriver, AnimationActions, Parts, ThreeEngineEvent, AerodynamicsModel } from "src/app/utils";
import { DisplayViewComponent } from "./display-view.component";

export abstract class ModelViewComponent extends DisplayViewComponent implements OnDestroy {

    protected abstract _dispose();
    protected abstract _aeroModel: AerodynamicsModel;

    protected _animationDriver: AnimationDriver;
    protected _seminoleActionModel: SeminoleActionModel;

    protected _disposables: Subscription[];

    protected engineService: EngineService;

    constructor() {
        super();

        const injector = AppInjector.getInjector();
        this.engineService = injector.get(EngineService);

        this._animationDriver = new AnimationDriver();
        this._seminoleActionModel = new SeminoleActionModel();
    }

    public ngOnDestroy() {
        this.engineService.dispose();
        while (this._disposables.length > 0) {
            this._disposables.pop().unsubscribe();
        }
        this._disposables = [];

        this._dispose();
    }

    protected _controlTechnique(controlTechnique: string, inopEngine: string, idle: boolean) {
        this._neutralOrientation();
        if (!idle) {
            this._rudder(inopEngine);

            if (controlTechnique === 'WINGS LEVEL') {
                this._wingsLevel(inopEngine);
            } else {
                this._zeroSideSlip(inopEngine);
            }
        }
    }

    protected _propellers(propeller: string, inopEngine: string, idle: boolean) {
        this._animationDriver.play(environment.seminole, AnimationActions.PropLeft);
        this._animationDriver.play(environment.seminole, AnimationActions.PropRightCr);
        const inopPropAction = inopEngine === 'LEFT' ? AnimationActions.PropLeft : AnimationActions.PropRightCr;
        const inopPropVis = inopEngine === 'LEFT' ? Parts.propLeft : Parts.propRight;
        const inopPropHide = inopEngine === 'LEFT' ? Parts.propRight : Parts.propLeft;
        const opPropVis = inopEngine === 'LEFT' ? Parts.operativePropRight : Parts.operativePropLeft;
        const opPropHide = inopEngine === 'LEFT' ? Parts.operativePropLeft : Parts.operativePropRight;

        if (!idle) {
            this.engineService.hideObject(inopPropVis, false);
            this.engineService.hideObject(inopPropHide, true);
            this.engineService.hideObject(opPropVis, false);
            this.engineService.hideObject(opPropHide, true);
        } else {
            this.engineService.hideObject(Parts.operativePropRight, true);
            this.engineService.hideObject(Parts.operativePropLeft, true);
            this.engineService.hideObject(Parts.propRight, false);
            this.engineService.hideObject(Parts.propLeft, false);
        }

        if (propeller === 'FEATHER') {
            this._animationDriver.stop(environment.seminole, inopPropAction);
        }
    }

    protected _rudder(inopEngine: string) {
        const jumpToLocation = inopEngine === 'LEFT' ? 0 : 100;
        this._animationDriver.jumpTo(environment.seminole, 'rudder-action', jumpToLocation);
    }

    protected _gear(down: boolean): void {
        this._animationDriver.jumpTo(environment.seminole, 'gear-action', down ? 0 : 100);
    }

    protected _flaps(notch: number): void {
        const flapsAction = 'flaps-action';

        if (notch == (0 / 3) * 100) {
            this._animationDriver.jumpTo(environment.seminole, flapsAction, 0);
        } else if (notch == (1 / 3) * 100) {
            this._animationDriver.jumpTo(environment.seminole, flapsAction, 33);
        } else if (notch == (2 / 3) * 100) {
            this._animationDriver.jumpTo(environment.seminole, flapsAction, 66);
        } else if (notch == (3 / 3) * 100) {
            this._animationDriver.jumpTo(environment.seminole, flapsAction, 100);
        }
    }

    protected _cog(position: number): void {
        if (position == (0 / 4) * 100) {
            this._animationDriver.jumpTo(environment.attachedMarkings, AnimationActions.COG, 0);
        } else if (position == (1 / 4) * 100) {
            this._animationDriver.jumpTo(environment.attachedMarkings, AnimationActions.COG, 25);
        } else if (position == (2 / 4) * 100) {
            this._animationDriver.jumpTo(environment.attachedMarkings, AnimationActions.COG, 50);
        } else if (position == (3 / 4) * 100) {
            this._animationDriver.jumpTo(environment.attachedMarkings, AnimationActions.COG, 75);
        } else if (position == (4 / 4) * 100) {
            this._animationDriver.jumpTo(environment.attachedMarkings, AnimationActions.COG, 100);
        }
    }

    protected _neutralOrientation() {
        this._animationDriver.stop(environment.seminole, AnimationActions.SeminoleYawRight);
        this._animationDriver.stop(environment.attachedMarkings, AnimationActions.AttachedYawRight);
        this._animationDriver.stop(environment.seminole, AnimationActions.SeminoleYawLeft);
        this._animationDriver.stop(environment.attachedMarkings, AnimationActions.AttachedYawLeft);
        this._animationDriver.stop(environment.seminole, AnimationActions.SeminoleRollRight);
        this._animationDriver.stop(environment.attachedMarkings, AnimationActions.AttachedRollRight);
        this._animationDriver.stop(environment.seminole, AnimationActions.SeminoleRollLeft);
        this._animationDriver.stop(environment.attachedMarkings, AnimationActions.AttachedRollLeft);
    }

    private _wingsLevel(inopEngine: string) {
        const yawAction = inopEngine === 'LEFT' ? AnimationActions.SeminoleYawRight : AnimationActions.SeminoleYawLeft;
        const attachedAction = inopEngine === 'LEFT' ? AnimationActions.AttachedYawRight : AnimationActions.AttachedYawLeft;

        this._animationDriver.jumpTo(environment.seminole, yawAction, 100);
        this._animationDriver.jumpTo(environment.attachedMarkings, attachedAction, 100);

        this._animationDriver.jumpTo(environment.attachedMarkings, AnimationActions.AttachedRollLeft, 0);
    }

    private _zeroSideSlip(inopEngine: string) {
        const rollAction = inopEngine === 'LEFT' ? AnimationActions.SeminoleRollRight : AnimationActions.SeminoleRollLeft;
        const attachedAction = inopEngine === 'LEFT' ? AnimationActions.AttachedRollRight : AnimationActions.AttachedRollLeft;

        this._animationDriver.jumpTo(environment.seminole, rollAction, 100);
        this._animationDriver.jumpTo(environment.attachedMarkings, attachedAction, 100);

        this._animationDriver.jumpTo(environment.attachedMarkings, AnimationActions.AttachedYawLeft, 0);
    }
}