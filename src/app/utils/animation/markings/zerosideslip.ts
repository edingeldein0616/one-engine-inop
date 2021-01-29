import { environment } from 'src/environments/environment';
import { ActionPair } from "../action-pair";
import { MarkingsBase, MarkingsMapBase } from "./markings";

export class ZeroSideslip extends MarkingsBase {
    
    protected _map: ZeroSideslipMap = new ZeroSideslipMap();
    
    public animate(inopEngine: string, controlTechnique: string): void {        

        let direction: string = ZeroSideslipMap.directionForward;
        let prop: string;
        let rudder: string;
        let slide: string;

        if (inopEngine === 'LEFT') {
            prop = ZeroSideslipMap.propRight;
            rudder = ZeroSideslipMap.rudderLeft;
            slide = ZeroSideslipMap.slideRight;
        } else {
            prop = ZeroSideslipMap.propLeft;
            rudder = ZeroSideslipMap.rudderRight;
            slide = ZeroSideslipMap.slideLeft;
        }

        let d = this._map.get(direction);
        let p = this._map.get(prop);
        let r = this._map.get(rudder);
        let s = this._map.get(slide);

        this._engineService.hideObject(d.obj, false);
        this._engineService.hideObject(p.obj, false);
        this._engineService.hideObject(r.obj, false);
        this._animationDriver.play(environment.zerosideslipMarkings, d.action);
        this._animationDriver.play(environment.zerosideslipMarkings, p.action);
        this._animationDriver.play(environment.zerosideslipMarkings, r.action);

        if (controlTechnique !== 'WINGS LEVEL') {
            this._engineService.hideObject(s.obj, false);
            this._animationDriver.play(environment.zerosideslipMarkings, s.action);
        }
    }
    public hide(): void {
        for (let entry of this._map.getValues()) {
            this._engineService.hideObject(entry.obj, true);
            this._animationDriver.stop(environment.zerosideslipMarkings, entry.action);
        }
    }
    
}

class ZeroSideslipMap extends MarkingsMapBase {
    public static readonly directionForward = 'directionForward';
    public static readonly propLeft = 'propLeft';
    public static readonly propRight = 'propRight';
    public static readonly rudderLeft = 'rudderLeft';
    public static readonly rudderRight = 'rudderRight';
    public static readonly slideRight = 'slideRight';
    public static readonly slideLeft = 'slideLeft';
    
    protected _map: Map<string, ActionPair> = new Map<string, ActionPair>([
        [ ZeroSideslipMap.directionForward, new ActionPair('zerosideslip-direction-arrow-forward', 'zerosideslip-direction-action-forward') ],
        [ ZeroSideslipMap.propLeft, new ActionPair('zerosideslip-prop-arrow-left', 'zerosideslip-prop-action-left') ],
        [ ZeroSideslipMap.propRight, new ActionPair('zerosideslip-prop-arrow-right', 'zerosideslip-prop-action-right') ],
        [ ZeroSideslipMap.rudderLeft, new ActionPair('zerosideslip-rudder-arrow-left', 'zerosideslip-rudder-action-left') ],
        [ ZeroSideslipMap.rudderRight, new ActionPair('zerosideslip-rudder-arrow-right', 'zerosideslip-rudder-action-right') ],
        [ ZeroSideslipMap.slideRight, new ActionPair('zerosideslip-slide-arrow-right', 'zerosideslip-slide-action-right') ],
        [ ZeroSideslipMap.slideLeft, new ActionPair('zerosideslip-slide-arrow-left', 'zerosideslip-slide-action-left') ]
    ]);

}