
export class AnimationActions {
  public static SeminoleRollRight = 'seminole-roll-right-action';
  public static SeminoleRollLeft = 'seminole-roll-left-action';
  public static SeminoleYawRight = 'seminole-yaw-right-action';
  public static SeminoleYawLeft = 'seminole-yaw-left-action';

  public static AttachedRollRight = 'attached-roll-right-action';
  public static AttachedRollLeft = 'attached-roll-left-action';
  public static AttachedYawRight = 'attached-yaw-right-action';
  public static AttachedYawLeft = 'attached-yaw-left-action';

  public static ZerosideslipYaw = 'zerosideslip-yaw-action';

  public static PropLeft = 'prop-left-action';
  public static PropRightCr = 'prop-right-cr-action';
  public static PropRightConv = 'prop-right-conv-action';

  public static Rudder = 'rudder-action';
  public static Gear = 'gear-action';
}

export class ActionPair {
  public readonly obj: string;
  public readonly action: string;
  constructor(obj: string, action: string) {
    this.obj = obj;
    this.action = action;
  }
}

export class PfactorPair {
  public static readonly directionConvRight = new ActionPair('pfactor-direction-arrow-conv-right', 'pfactor-direction-action-conv-right');
  public static readonly directionCrRight = new ActionPair('pfactor-direction-arrow-cr-right', 'pfactor-direction-action-cr-right');
  public static readonly directionLeft = new ActionPair('pfactor-direction-arrow-left', 'pfactor-direction-action-left');
  public static readonly forceLeft = new ActionPair('pfactor-force-arrow-left', 'pfactor-force-action-left');
  public static readonly forceRight = new ActionPair('pfactor-force-arrow-right', 'pfactor-force-action-right');
  public static readonly liftConvRight = new ActionPair('pfactor-lift-arrow-conv-right', 'pfactor-lift-action-conv-right');
  public static readonly liftCrRight = new ActionPair('pfactor-lift-arrow-cr-right', 'pfactor-lift-action-cr-right');
  public static readonly liftLeft = new ActionPair('pfactor-lift-arrow-left', 'pfactor-lift-action-left');
  public static readonly scaleConvRight = new ActionPair('pfactor-scale-conv-right', '');
  public static readonly scaleCrRight = new ActionPair('pfactor-scale-cr-right', '');
  public static readonly scaleLeft = new ActionPair('pfactor-scale-left', '');
}

export class SlipstreamPair {
  public static readonly directionConvRight = new ActionPair('slipstream-direction-arrow-conv-right', 'slipstream-direction-action-conv-right');
  public static readonly directionCrRight = new ActionPair('slipstream-direction-arrow-cr-right', 'slipstream-direction-action-cr-right');
  public static readonly directionLeft = new ActionPair('slipstream-direction-arrow-left', 'slipstream-direction-action-left');
  public static readonly forceLeft = new ActionPair('slipstream-force-arrow-left', 'slipstream-force-action-left');
  public static readonly forceRight = new ActionPair('slipstream-force-arrow-right', 'slipstream-force-action-right');
  public static readonly spiralConvRight = new ActionPair('slipstream-spiral-arrow-conv-right', 'slipstream-spiral-conv-right-action');
  public static readonly spiralCrRight = new ActionPair('slipstream-spiral-arrow-cr-right', 'slipstream-spiral-cr-right-action');
  public static readonly spiralLeft = new ActionPair('slipstream-spiral-arrow-left', 'slipstream-spiral-left-action');
  public static readonly rudderLeft = new ActionPair('slipstream-rudder-arrow-left', 'slipstream-rudder-action-left');
  public static readonly rudderRight = new ActionPair('slipstream-rudder-arrow-right', 'slipstream-rudder-action-right');
}

export class AcceleratedPair {
  public static readonly flowConvRight = new ActionPair('accelerated-flow-arrow-conv-right', 'accelerated-flow-action-conv-right');
  public static readonly flowCrRight = new ActionPair('accelerated-flow-arrow-cr-right', 'accelerated-flow-action-cr-right');
  public static readonly flowLeft = new ActionPair('accelerated-flow-arrow-left', 'accelerated-flow-action-left');
  public static readonly rollConvRight = new ActionPair('accelerated-roll-arrow-conv-right', 'accelerated-roll-action-conv-right');
  public static readonly rollCrRight = new ActionPair('accelerated-roll-arrow-cr-right', 'accelerated-roll-action-cr-right');
  public static readonly rollLeft = new ActionPair('accelerated-roll-arrow-left', 'accelerated-roll-action-left');
  public static readonly yawConvRight = new ActionPair('accelerated-yaw-arrow-conv-right', 'accelerated-yaw-action-conv-right');
  public static readonly yawCrRight = new ActionPair('accelerated-yaw-arrow-cr-right', 'accelerated-yaw-action-cr-right');
  public static readonly yawLeft = new ActionPair('accelerated-yaw-arrow-left', 'accelerated-yaw-action-left');
  public static readonly rudderLeft = new ActionPair('accelerated-rudder-arrow-left', 'accelerated-rudder-action-left');
  public static readonly rudderRight = new ActionPair('accelerated-rudder-arrow-right', 'accelerated-rudder-action-right');
  public static readonly scaleConvRight = new ActionPair('accelerated-scale-conv-right', '');
  public static readonly scaleCrRight = new ActionPair('accelerated-scale-cr-right', '');
  public static readonly scaleLeft = new ActionPair('accelerated-scale-left', '');
}

export class TorquePair {
  public static readonly directionConvRight = new ActionPair('torque-direction-arrow-conv-right', 'torque-direction-action-conv-right');
  public static readonly directionCrRight = new ActionPair('torque-direction-arrow-cr-right', 'torque-direction-action-cr-right');
  public static readonly directionLeft = new ActionPair('torque-direction-arrow-left', 'torque-direction-action-left');
  public static readonly counterConvRight = new ActionPair('torque-counter-arrow-conv-right', 'torque-counter-action-conv-right');
  public static readonly counterCrRight = new ActionPair('torque-counter-arrow-cr-right', 'torque-counter-action-cr-right');
  public static readonly counterLeft = new ActionPair('torque-counter-arrow-left', 'torque-counter-action-left');
  public static readonly rollConvRight = new ActionPair('torque-roll-arrow-conv-right', 'torque-roll-action-conv-right');
  public static readonly rollCrRight = new ActionPair('torque-roll-arrow-cr-right', 'torque-roll-action-cr-right');
  public static readonly rollLeft = new ActionPair('torque-roll-arrow-left', 'torque-roll-action-left');
}

export class ZerosideslipPair {
  public static readonly directionForward = new ActionPair('zerosideslip-direction-arrow-forward', 'zerosideslip-direction-action-forward');
  public static readonly propLeft = new ActionPair('zerosideslip-prop-arrow-left', 'zerosideslip-prop-action-left');
  public static readonly propRight = new ActionPair('zerosideslip-prop-arrow-right', 'zerosideslip-prop-action-right');
  public static readonly rudderRight = new ActionPair('zerosideslip-rudder-arrow-right', 'zerosideslip-rudder-action-right');
  public static readonly rudderLeft = new ActionPair('zerosideslip-rudder-arrow-left', 'zerosideslip-rudder-action-left');
  public static readonly slideRight = new ActionPair('zerosideslip-slide-arrow-right', 'zerosideslip-slide-action-right');
  public static readonly slideLeft = new ActionPair('zerosideslip-slide-arrow-left', 'zerosideslip-slide-action-left');
}
