import { environment } from "src/environments/environment";
import { OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { AppInjector } from "src/app/app-injector.service";
import { EngineService } from "src/app/engine/engine.service";
import { SeminoleActionModel, AerodynamicsModel } from "src/app/utils/aerodynamics";
import { AnimationDriver, SeminoleAnimationAction, PropParts } from 'src/app/utils/animation';
import { DisplayViewComponent } from "./display-view.component";

/**
 * Base class for all views that display the Seminole model and aerodynamic markings. Enforces garbage collectionand provides animation functions,
 * calculation functions, and access to the Three.js engine via the EngineService class.
 */
export abstract class ModelViewComponent extends DisplayViewComponent implements OnDestroy {

    /**
     * Callback for necessary manual garbage collection. Called during ngOnDestroy.
     */
    protected abstract _dispose();
    /**
     * Model that handles aerodynamic calculation for data display and scale markers. 
     */
    protected abstract _aeroModel: AerodynamicsModel;

    /**
     * Communicates animation events to the Three.js engine.
     */
    protected _animationDriver: AnimationDriver;
    /**
     * Holds the state of the Seminole and triggers animation changes and value calculations through use of observables.
     */
    protected _seminoleActionModel: SeminoleActionModel;

    /**
     * Holds observable subscriptions of the SeminoleActionModel.
     */
    protected _disposables: Subscription[];

    /**
     * Contains the instance of the Three.js engine. Handles loading of models and limited communication with the Three.js engine.
     */
    protected _engineService: EngineService;

    constructor() {
        super();

        // Manually inject engine service so child class doesn't have to.
        const injector = AppInjector.getInjector();
        this._engineService = injector.get(EngineService);

        // Create instances of the animation driver and seminole action model.
        this._animationDriver = new AnimationDriver();
        this._seminoleActionModel = new SeminoleActionModel();
    }

    /**
     * Handles disposal of engine and observable subscriptions. Calls the dispose callback function passed by child classes.
     */
    public ngOnDestroy() {
        this._engineService.dispose();
        while (this._disposables.length > 0) {
            this._disposables.pop().unsubscribe();
        }
        this._disposables = [];

        this._dispose();
    }

    /**
     * Handles control technique animation logic.
     * @param controlTechnique Control technique value
     * @param inopEngine Inoperative engine value
     * @param idle If power is idle
     */
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

    /**
     * Handles propeller animation logic of the Seminole model given input states.
     * @param propeller Propeller state value
     * @param inopEngine Inoperative engine state value
     * @param idle If the power is idle
     */
    protected _propellers(propeller: string, inopEngine: string, idle: boolean) {
        this._animationDriver.play(environment.seminole, SeminoleAnimationAction.PropLeft);
        this._animationDriver.play(environment.seminole, SeminoleAnimationAction.PropRightCr);
        const inopPropAction = inopEngine === 'LEFT' ? SeminoleAnimationAction.PropLeft : SeminoleAnimationAction.PropRightCr;
        const inopPropVis = inopEngine === 'LEFT' ? PropParts.propLeft : PropParts.propRight;
        const inopPropHide = inopEngine === 'LEFT' ? PropParts.propRight : PropParts.propLeft;
        const opPropVis = inopEngine === 'LEFT' ? PropParts.operativePropRight : PropParts.operativePropLeft;
        const opPropHide = inopEngine === 'LEFT' ? PropParts.operativePropLeft : PropParts.operativePropRight;

        if (!idle) {
            this._engineService.hideObject(inopPropVis, false);
            this._engineService.hideObject(inopPropHide, true);
            this._engineService.hideObject(opPropVis, false);
            this._engineService.hideObject(opPropHide, true);
        } else {
            this._engineService.hideObject(PropParts.operativePropRight, true);
            this._engineService.hideObject(PropParts.operativePropLeft, true);
            this._engineService.hideObject(PropParts.propRight, false);
            this._engineService.hideObject(PropParts.propLeft, false);
        }

        if (propeller === 'FEATHER') {
            this._animationDriver.stop(environment.seminole, inopPropAction);
        }
    }

    /**
     * Handles rudder animation logic for Seminole model.
     * @param inopEngine Inoperative engine state
     */
    protected _rudder(inopEngine: string) {
        const jumpToLocation = inopEngine === 'LEFT' ? 0 : 100;
        this._animationDriver.jumpTo(environment.seminole, 'rudder-action', jumpToLocation);
    }

    /**
     * Handles gear animation logic for the Seminole model
     * @param down If the gear is down
     */
    protected _gear(down: boolean): void {
        this._animationDriver.jumpTo(environment.seminole, 'gear-action', down ? 0 : 100);
    }

    /**
     * Handles flap extension animation logic for the Seminole model.
     * @param notch Percentage of flap extension
     */
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

    /**
     * Handles center of gravity animation logic for the Seminole model.
     * @param position Position of the center of gravity as a percentage of distance from aft.
     */
    protected _cog(position: number): void {
        if (position == (0 / 4) * 100) {
            this._animationDriver.jumpTo(environment.attachedMarkings, SeminoleAnimationAction.COG, 0);
        } else if (position == (1 / 4) * 100) {
            this._animationDriver.jumpTo(environment.attachedMarkings, SeminoleAnimationAction.COG, 25);
        } else if (position == (2 / 4) * 100) {
            this._animationDriver.jumpTo(environment.attachedMarkings, SeminoleAnimationAction.COG, 50);
        } else if (position == (3 / 4) * 100) {
            this._animationDriver.jumpTo(environment.attachedMarkings, SeminoleAnimationAction.COG, 75);
        } else if (position == (4 / 4) * 100) {
            this._animationDriver.jumpTo(environment.attachedMarkings, SeminoleAnimationAction.COG, 100);
        }
    }

    /**
     * Stops all seminole orientation animations, neutralizing Seminole orientation.
     */
    protected _neutralOrientation() {
        this._animationDriver.stop(environment.seminole, SeminoleAnimationAction.SeminoleYawRight);
        this._animationDriver.stop(environment.attachedMarkings, SeminoleAnimationAction.AttachedYawRight);
        this._animationDriver.stop(environment.seminole, SeminoleAnimationAction.SeminoleYawLeft);
        this._animationDriver.stop(environment.attachedMarkings, SeminoleAnimationAction.AttachedYawLeft);
        this._animationDriver.stop(environment.seminole, SeminoleAnimationAction.SeminoleRollRight);
        this._animationDriver.stop(environment.attachedMarkings, SeminoleAnimationAction.AttachedRollRight);
        this._animationDriver.stop(environment.seminole, SeminoleAnimationAction.SeminoleRollLeft);
        this._animationDriver.stop(environment.attachedMarkings, SeminoleAnimationAction.AttachedRollLeft);
    }

    /**
     * Sets Seminole orientation to wings level control technique.
     * @param inopEngine Inoperative engine state
     */
    private _wingsLevel(inopEngine: string) {
        const yawAction = inopEngine === 'LEFT' ? SeminoleAnimationAction.SeminoleYawRight : SeminoleAnimationAction.SeminoleYawLeft;
        const attachedAction = inopEngine === 'LEFT' ? SeminoleAnimationAction.AttachedYawRight : SeminoleAnimationAction.AttachedYawLeft;

        this._animationDriver.jumpTo(environment.seminole, yawAction, 100);
        this._animationDriver.jumpTo(environment.attachedMarkings, attachedAction, 100);

        this._animationDriver.jumpTo(environment.attachedMarkings, SeminoleAnimationAction.AttachedRollLeft, 0);
    }

    /**
     * Sets Seminole orientation to Zero Sideslip control technique.
     * @param inopEngine Inoperative engine state
     */
    private _zeroSideSlip(inopEngine: string) {
        const rollAction = inopEngine === 'LEFT' ? SeminoleAnimationAction.SeminoleRollRight : SeminoleAnimationAction.SeminoleRollLeft;
        const attachedAction = inopEngine === 'LEFT' ? SeminoleAnimationAction.AttachedRollRight : SeminoleAnimationAction.AttachedRollLeft;

        this._animationDriver.jumpTo(environment.seminole, rollAction, 100);
        this._animationDriver.jumpTo(environment.attachedMarkings, attachedAction, 100);

        this._animationDriver.jumpTo(environment.attachedMarkings, SeminoleAnimationAction.AttachedYawLeft, 0);
    }
}