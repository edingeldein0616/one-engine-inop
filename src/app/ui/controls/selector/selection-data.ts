export class SelectionData {
  label: string;
  value: string;
  percent: number;
}

export class Labels {
  static inopEngine = 'INOP ENGINE';
  static power = 'POWER';
  static densityAlt = 'DENSITY ALTITUDE';
  static prop = 'PROPELLER';
  static ctrlTech = 'CONTROL TECHNIQUE';
  static airspeed = 'AIRSPEED (KIAS)';
  static weight = 'WEIGHT';
  static cog = 'CENTER OF GRAVITY';
  static flaps = 'FLAPS';
  static landingGear = 'LANDING GEAR';
}

export class Values {
  static left = 'LEFT';
  static right = 'RIGHT';
  static windmill = 'WINDMILL';
  static feather = 'FEATHER';
  static wingsLevel = 'WINGS LEVEL';
  static zeroSideSlip = 'ZERO SIDE SLIP';
  static up = 'UP';
  static down = 'DOWN';
}
