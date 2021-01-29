import { environment } from 'src/environments/environment';
import { ActionPair } from "../action-pair";
import { MarkingsBase, MarkingsMapBase } from "./markings";

export class Torque extends MarkingsBase {
    
    protected _map: TorqueMap = new TorqueMap();

    public animate(inopEngine: string, engineConfig: string): void {
        let direction: string;
        let counter: string;
        let roll: string;
        if (inopEngine === 'LEFT') {
            direction = engineConfig === 'CONVENTIONAL' ? TorqueMap.directionConvRight : TorqueMap.directionCrRight;
            counter = engineConfig === 'CONVENTIONAL' ? TorqueMap.counterConvRight : TorqueMap.counterCrRight;
            roll = engineConfig === 'CONVENTIONAL' ? TorqueMap.rollConvRight : TorqueMap.rollCrRight;
        } else {
            direction = TorqueMap.directionLeft;
            counter = TorqueMap.counterLeft;
            roll = TorqueMap.rollLeft;
        }

        let d = this._map.get(direction);
        let c = this._map.get(counter);
        let r = this._map.get(roll);

        this._engineService.hideObject(d.obj, false);
        this._engineService.hideObject(c.obj, false);
        this._engineService.hideObject(r.obj, false);
        this._animationDriver.play(environment.torqueMarkings, d.action);
        this._animationDriver.play(environment.torqueMarkings, c.action);
        this._animationDriver.play(environment.torqueMarkings, r.action);
    }

    public hide(): void {
        for (let entry of this._map.getValues()) {
            this._engineService.hideObject(entry.obj, true);
            this._animationDriver.stop(environment.torqueMarkings, entry.action);
        }
    }

}

export class TorqueMap extends MarkingsMapBase {
    public static readonly directionConvRight = 'directionConvRight';
    public static readonly directionCrRight = 'directionCrRight';
    public static readonly directionLeft = 'directionLeft';
    public static readonly counterConvRight = 'counterConvRight';
    public static readonly counterCrRight = 'counterCrRight';
    public static readonly counterLeft = 'counterLeft';
    public static readonly rollConvRight = 'rollConvRight';
    public static readonly rollCrRight = 'rollCrRight';
    public static readonly rollLeft = 'rollLeft';
    
    protected _map: Map<string, ActionPair> = new Map<string, ActionPair>([
        [TorqueMap.directionConvRight, new ActionPair('torque-direction-arrow-conv-right', 'torque-direction-action-conv-right')],
        [TorqueMap.directionCrRight, new ActionPair('torque-direction-arrow-cr-right', 'torque-direction-action-cr-right')],
        [TorqueMap.directionLeft, new ActionPair('torque-direction-arrow-left', 'torque-direction-action-left')],
        [TorqueMap.counterConvRight, new ActionPair('torque-counter-arrow-conv-right', 'torque-counter-action-conv-right')],
        [TorqueMap.counterCrRight, new ActionPair('torque-counter-arrow-cr-right', 'torque-counter-action-cr-right')],
        [TorqueMap.counterLeft, new ActionPair('torque-counter-arrow-left', 'torque-counter-action-left')],
        [TorqueMap.rollConvRight, new ActionPair('torque-roll-arrow-conv-right', 'torque-roll-action-conv-right')],
        [TorqueMap.rollCrRight, new ActionPair('torque-roll-arrow-cr-right', 'torque-roll-action-cr-right')],
        [TorqueMap.rollLeft, new ActionPair('torque-roll-arrow-left', 'torque-roll-action-left')]
    ])
    
}