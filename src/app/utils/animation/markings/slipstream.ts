import { environment } from 'src/environments/environment';
import { ActionPair } from '../action-pair';
import { MarkingsMapBase, MarkingsBase } from './markings';

export class Slipstream extends MarkingsBase {
    
    protected _map: SlipstreamMap = new SlipstreamMap();
    
    public animate(inopEngine: string, engineConfig: string): void {
        let direction: string;
        let force: string;
        let spiral: string;
        let rudder: string;
        if (inopEngine === 'LEFT') {
            force = engineConfig === 'CONVENTIONAL' ? SlipstreamMap.forceConvRight : SlipstreamMap.forceCrRight;
            direction = engineConfig === 'CONVENTIONAL' ? SlipstreamMap.directionConvRight : SlipstreamMap.directionCrRight;
            spiral = engineConfig === 'CONVENTIONAL' ? SlipstreamMap.spiralConvRight : SlipstreamMap.spiralCrRight;
            rudder = SlipstreamMap.rudderLeft;
        } else {
            force = SlipstreamMap.forceLeft;
            direction = SlipstreamMap.directionLeft;
            spiral = SlipstreamMap.spiralLeft;
            rudder = SlipstreamMap.rudderRight;
        }

        let d = this._map.get(direction);
        let f = this._map.get(force);
        let s = this._map.get(spiral);
        let r = this._map.get(rudder);

        this._engineService.hideObject(d.obj, false);
        this._engineService.hideObject(f.obj, false);
        this._engineService.hideObject(s.obj, false);
        this._animationDriver.play(environment.slipstreamMarkings, d.action);
        this._animationDriver.play(environment.slipstreamMarkings, s.action);
        this._animationDriver.play(environment.slipstreamMarkings, f.action);

        if (inopEngine === 'RIGHT' || engineConfig !== 'CONVENTIONAL') {
            this._engineService.hideObject(r.obj, false);
            this._animationDriver.play(environment.slipstreamMarkings, r.action);
        }
    }
    
    public hide(): void {
        for(let entry of this._map.getValues()) {
            this._engineService.hideObject(entry.obj, true);
            this._animationDriver.stop(environment.slipstreamMarkings, entry.action);
        }
    }

}

class SlipstreamMap extends MarkingsMapBase {
    
    public static readonly directionConvRight = 'directionConvRight';
    public static readonly directionCrRight = 'directionCrRight';
    public static readonly directionLeft = 'directionLeft';
    public static readonly forceConvRight = 'forceConvRight';
    public static readonly forceCrRight = 'forceCrRight';
    public static readonly forceLeft = 'forceLeft';
    public static readonly spiralConvRight = 'spiralConvRight';
    public static readonly spiralCrRight = 'spiralCrRight';
    public static readonly spiralLeft = 'spiralLeft';
    public static readonly rudderLeft = 'rudderLeft';
    public static readonly rudderRight = 'rudderRight';

    protected _map: Map<string, ActionPair> = new Map<string, ActionPair>([
        [SlipstreamMap.directionConvRight, new ActionPair('slipstream-direction-arrow-conv-right', 'slipstream-direction-action-conv-right')],
        [SlipstreamMap.directionCrRight, new ActionPair('slipstream-direction-arrow-cr-right', 'slipstream-direction-action-cr-right')],
        [SlipstreamMap.directionLeft, new ActionPair('slipstream-direction-arrow-left', 'slipstream-direction-action-left')],
        [SlipstreamMap.forceConvRight, new ActionPair('slipstream-force-arrow-conv-right', 'slipstream-force-action-conv-right')],
        [SlipstreamMap.forceCrRight, new ActionPair('slipstream-force-arrow-cr-right', 'slipstream-force-action-cr-right')],
        [SlipstreamMap.forceLeft, new ActionPair('slipstream-force-arrow-left', 'slipstream-force-action-left')],
        [SlipstreamMap.spiralConvRight, new ActionPair('slipstream-spiral-arrow-conv-right', 'slipstream-spiral-action-conv-right')],
        [SlipstreamMap.spiralCrRight, new ActionPair('slipstream-spiral-arrow-cr-right', 'slipstream-spiral-action-cr-right')],
        [SlipstreamMap.spiralLeft, new ActionPair('slipstream-spiral-arrow-left', 'slipstream-spiral-action-left')],
        [SlipstreamMap.rudderRight, new ActionPair('slipstream-rudder-arrow-right', 'slipstream-rudder-action-right')],
        [SlipstreamMap.rudderLeft, new ActionPair('slipstream-rudder-arrow-left', 'slipstream-rudder-action-left')]
    ]);
    
}