import { environment } from 'src/environments/environment';
import { ActionPair } from "../action-pair";
import { MarkingsBase, MarkingsMapBase } from "./markings";

export class Accelerated extends MarkingsBase {
    
    protected _map: AcceleratedMap = new AcceleratedMap();

    public animate(inopEngine: string, engineConfig: string): void {
        let direction: string;
        let flow: string;
        let roll: string;
        let yaw: string;
        let rudder: string;
        let scale: string;
        if (inopEngine === 'LEFT') {
            direction = engineConfig === 'CONVENTIONAL' ? AcceleratedMap.directionConvRight : AcceleratedMap.directionCrRight;
            flow = engineConfig === 'CONVENTIONAL' ? AcceleratedMap.flowConvRight : AcceleratedMap.flowCrRight;
            roll = engineConfig === 'CONVENTIONAL' ? AcceleratedMap.rollConvRight : AcceleratedMap.rollCrRight;
            yaw = engineConfig === 'CONVENTIONAL' ? AcceleratedMap.yawConvRight : AcceleratedMap.yawCrRight;
            rudder = AcceleratedMap.rudderLeft;
            scale = engineConfig === 'CONVENTIONAL' ? AcceleratedMap.scaleConvRight : AcceleratedMap.scaleCrRight;
        } else {
            direction = AcceleratedMap.directionLeft;
            flow = AcceleratedMap.flowLeft;
            roll = AcceleratedMap.rollLeft;
            yaw = AcceleratedMap.yawLeft;
            rudder = AcceleratedMap.rudderRight;
            scale = AcceleratedMap.scaleLeft;
        }

        let d = this._map.get(direction);
        let f = this._map.get(flow);
        let ro = this._map.get(roll);
        let y = this._map.get(yaw);
        let ru = this._map.get(rudder);
        let s = this._map.get(scale);

        this._engineService.hideObject(d.obj, false);
        this._engineService.hideObject(f.obj, false);
        this._engineService.hideObject(ro.obj, false);
        this._engineService.hideObject(y.obj, false);
        this._engineService.hideObject(s.obj, false);
        this._animationDriver.play(environment.acceleratedMarkings, d.action);
        this._animationDriver.play(environment.acceleratedMarkings, f.action);
        this._animationDriver.play(environment.acceleratedMarkings, ro.action);
        this._animationDriver.play(environment.acceleratedMarkings, y.action);

        if (inopEngine !== 'LEFT' || engineConfig !== 'CONVENTIONAL') {
            this._engineService.hideObject(ru.obj, false);
            this._animationDriver.play(environment.acceleratedMarkings, ru.action);
        }
    }

    public hide() {
        for(let entry of this._map.getValues()) {
            this._engineService.hideObject(entry.obj, true);
            this._animationDriver.stop(environment.acceleratedMarkings, entry.action);
        }
    }

}

class AcceleratedMap extends MarkingsMapBase {
    public static readonly directionConvRight = 'directionConvRight';
    public static readonly directionCrRight = 'directionCrRight';
    public static readonly directionLeft = 'directionLeft';
    public static readonly flowConvRight = 'flowConvRight';
    public static readonly flowCrRight = 'flowCrRight';
    public static readonly flowLeft = 'flowLeft';
    public static readonly rollConvRight = 'rollConvRight';
    public static readonly rollCrRight = 'rollCrRight';
    public static readonly rollLeft = 'rollLeft';
    public static readonly yawConvRight = 'yawConvRight';
    public static readonly yawCrRight = 'yawCrRight';
    public static readonly yawLeft = 'yawLeft';
    public static readonly rudderLeft = 'rudderLeft';
    public static readonly rudderRight = 'rudderRight';
    public static readonly scaleConvRight = 'scaleConvRight';
    public static readonly scaleCrRight = 'scaleCrRight';
    public static readonly scaleLeft = 'scaleLeft';
    
    protected _map: Map<string, ActionPair> = new Map<string, ActionPair>([
        [AcceleratedMap.directionConvRight, new ActionPair('accelerated-direction-arrow-conv-right', 'accelerated-direction-action-conv-right')],
        [AcceleratedMap.directionCrRight, new ActionPair('accelerated-direction-arrow-cr-right', 'accelerated-direction-action-cr-right')],
        [AcceleratedMap.directionLeft, new ActionPair('accelerated-direction-action-left', 'accelerated-direction-action-left')],
        [AcceleratedMap.flowConvRight, new ActionPair('accelerated-flow-arrow-conv-right', 'accelerated-flow-action-conv-right')],
        [AcceleratedMap.flowCrRight, new ActionPair('accelerated-flow-arrow-cr-right', 'accelerated-flow-action-cr-right')],
        [AcceleratedMap.flowLeft, new ActionPair('accelerated-flow-action-left', 'accelerated-flow-action-left')],
        [AcceleratedMap.rollConvRight, new ActionPair('accelerated-roll-arrow-conv-right', 'accelerated-roll-action-conv-right')],
        [AcceleratedMap.rollCrRight, new ActionPair('accelerated-roll-arrow-cr-right', 'accelerated-roll-action-cr-right')],
        [AcceleratedMap.rollLeft, new ActionPair('accelerated-roll-action-left', 'accelerated-roll-action-left')],
        [AcceleratedMap.yawConvRight, new ActionPair('accelerated-yaw-arrow-conv-right', 'accelerated-yaw-action-conv-right')],
        [AcceleratedMap.yawCrRight, new ActionPair('accelerated-yaw-arrow-cr-right', 'accelerated-yaw-action-cr-right')],
        [AcceleratedMap.yawLeft, new ActionPair('accelerated-yaw-action-left', 'accelerated-yaw-action-left')],
        [AcceleratedMap.rudderRight, new ActionPair('accelerated-rudder-arrow-right', 'accelerated-rudder-action-right')],
        [AcceleratedMap.rudderLeft, new ActionPair('accelerated-rudder-action-left', 'accelerated-rudder-action-left')],
        [AcceleratedMap.scaleConvRight, new ActionPair('accelerated-scale-conv-right', '')],
        [AcceleratedMap.scaleCrRight, new ActionPair('accelerated-scale-cr-right', '')],
        [AcceleratedMap.scaleLeft, new ActionPair('accelerated-scale-left', '')]
    ])
}