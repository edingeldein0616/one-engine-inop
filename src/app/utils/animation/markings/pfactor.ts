import { environment } from 'src/environments/environment';
import { ActionPair } from '../action-pair';
import { MarkingsBase, MarkingsMapBase } from './markings';

export class Pfactor extends MarkingsBase{

    protected _map: PfactorMap = new PfactorMap();

    public animate(inopEngine: string, engineConfig: string) {
        let direction: string;
        let force: string;
        let lift: string;
        let scale: string;
        if(inopEngine === 'LEFT') {
          force = engineConfig === 'CONVENTIONAL' ? PfactorMap.forceConvRight : PfactorMap.forceCrRight;
          direction = engineConfig === 'CONVENTIONAL' ? PfactorMap.directionConvRight : PfactorMap.directionCrRight;
          lift = engineConfig === 'CONVENTIONAL' ? PfactorMap.liftConvRight : PfactorMap.liftCrRight;
          scale = engineConfig === 'CONVENTIONAL' ? PfactorMap.scaleConvRight : PfactorMap.scaleCrRight;
        } else {
          force = PfactorMap.forceLeft;
          direction = PfactorMap.directionLeft;
          lift = PfactorMap.liftLeft;
          scale = PfactorMap.scaleLeft;
        }

        let d = this._map.get(direction);
        let f = this._map.get(force);
        let l = this._map.get(lift);
        let s = this._map.get(scale);
    
        this._engineService.hideObject(d.obj, false);
        this._engineService.hideObject(f.obj, false);
        this._engineService.hideObject(l.obj, false);
        this._engineService.hideObject(s.obj, false);
        this._animationDriver.play(environment.pfactorMarkings, l.action);
        this._animationDriver.play(environment.pfactorMarkings, d.action);
        this._animationDriver.play(environment.pfactorMarkings, f.action);
    }

    public hide() {
        for(let entry of this._map.getValues()) {
            this._engineService.hideObject(entry.obj, true);
            this._animationDriver.stop(environment.pfactorMarkings, entry.action);
        }
    }
}

class PfactorMap extends MarkingsMapBase {
    public static readonly directionConvRight = 'directionConvRight';
    public static readonly directionCrRight = 'directionCrRight';
    public static readonly directionLeft = 'directionLeft';
    public static readonly forceLeft = 'forceLeft';
    public static readonly forceConvRight = 'forceConvRight';
    public static readonly forceCrRight = 'forceCrRight';
    public static readonly liftConvRight = 'liftConvRight';
    public static readonly liftCrRight = 'liftCrRight';
    public static readonly liftLeft = 'liftLeft';
    public static readonly scaleConvRight = 'scaleConvRight';
    public static readonly scaleCrRight = 'scaleCrRight';
    public static readonly scaleLeft = 'scaleLeft';

    protected _map: Map<string, ActionPair> = new Map<string, ActionPair> ([
        [PfactorMap.directionConvRight, new ActionPair('pfactor-direction-arrow-conv-right', 'pfactor-direction-action-conv-right')],
        [PfactorMap.directionCrRight, new ActionPair('pfactor-direction-arrow-cr-right', 'pfactor-direction-action-cr-right')],
        [PfactorMap.directionLeft, new ActionPair('pfactor-direction-arrow-left', 'pfactor-direction-action-left')],
        [PfactorMap.forceConvRight, new ActionPair('pfactor-force-arrow-conv-right', 'pfactor-force-action-conv-right')],
        [PfactorMap.forceCrRight, new ActionPair('pfactor-force-arrow-cr-right', 'pfactor-force-action-cr-right')],
        [PfactorMap.forceLeft, new ActionPair('pfactor-force-arrow-left', 'pfactor-force-action-left')],
        [PfactorMap.liftConvRight, new ActionPair('pfactor-lift-arrow-conv-right', 'pfactor-lift-action-conv-right')],
        [PfactorMap.liftCrRight, new ActionPair('pfactor-lift-arrow-cr-right', 'pfactor-lift-action-cr-right')],
        [PfactorMap.liftLeft, new ActionPair('pfactor-lift-arrow-left', 'pfactor-lift-action-left')],
        [PfactorMap.scaleConvRight, new ActionPair('pfactor-scale-conv-right', '')],
        [PfactorMap.scaleCrRight, new ActionPair('pfactor-scale-cr-right', '')],
        [PfactorMap.scaleLeft, new ActionPair('pfactor-scale-left', '')]
    ])
    
  }