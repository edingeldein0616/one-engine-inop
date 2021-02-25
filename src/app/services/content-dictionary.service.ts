import { Injectable } from '@angular/core';
import { GeneralTitle, DCVTitle, SEPTitle, RaycastTitle, CEFTitle, ZSTTitle, StarterTitle, ZSExercise } from 'src/app/utils/static-text-data';

@Injectable({
  providedIn: 'root'
})
export class ContentDictionaryService {

  public readonly starterContent: string = ``;

  private _textDictionary: TextDictionary;

  constructor() { 
    this._textDictionary = new TextDictionary();
  }

  public getContent(title: string) { return this._textDictionary.getContent(title); }

}

export class TextDictionary {

  private _dictonaryEntries: Entry[] = [
    { title: StarterTitle.DCV, content: `<p>This section covers single-engine directional control and V<sub>MCA</sub>.</p>
        <p>Click on the "Data" and "Control Factors" text labels to read descriptive text here.<p>
        <p>Clicking on the arrows marking aerodynamic and control forces around the aircraft will display additional text here.</p>`},
    { title: StarterTitle.SEP, content: `<p>This section covers single-engine performance.</p>
        <p>Click on the "Data" and "Performance Factors" text labels to read descriptive text here.<p>
        <p>Clicking on the arrows marking aerodynamic and control forces around the aircraft will display additional text here.</p>`},
    { title: StarterTitle.CEF, content: `<p>This section covers critical engine factors that affect multiengine aircraft without counterrotating propellers.
        In most US-designed multiengine aircraft, both engines rotate to the right (clockwise) when viewed from the rear. Select a critical engine
        factor to see how each one makes the left engine the critical engine. The critical engine is the engine whose failure will most adversely affect
        the performance and handling characterstics of the aircraft. The "Counter-Rotating" option can be used to compare a conventional vs.
        counter-rotating configuration.</p>`},
    { title: StarterTitle.ZST, content: `<p>This section covers the zero sideslip technique.</p>`},
    { title: DCVTitle.InopEngine, content: `<p>This selection simulates a multiengine aircraft with counter-rotating propellers. See the "Critical Engine" section for details on differences encountered when both propellers turn in the same direction.</p>` },
    { title: DCVTitle.Power, content: `<p>The thrust produced by the operating engine will have a direct effect on the yaw/roll into the inoperative engine. Any decrease in thrust, caused by reducing the power setting and/or an increase in altitude, will decrease the yaw/roll moment, lowering V<sub>MCA</sub>.</p>` },
    { title: DCVTitle.DensityAltitude, content: `<p>Changing the density altitude changes the power output of the engine due to changes in the air density. Increasing altitude (decreasing air density) will result in a loss of power on the operating engine. The yaw/roll moments will be reduced, lowering V<sub>MCA</sub>.</p>` },
    { title: DCVTitle.Propeller, content: `<p>A feathered propeller produces much less drag than a windmilling propeller, decreasing the yaw/roll into the inoperative engine, lowering V<sub>MCA</sub>.</p>` },
    { title: DCVTitle.ControlTechnique, content: `<p>Flying wings level with an inoperative engine requires much more rudder deflection than flying with zero sideslip. This is due in part to the angle of the relative wind on the rudder created by the side slip. Since the relative wind tends to parallel the rudder,
       the rudder must be deflected even further to get the same results. The rudder\'s effectiveness is reduced, raising V<sub>MCA</sub>. Also, without any bank into the operating engine, there is no horizontal component of lift to take some of the workload off of the rudder.</p>
       <p>A zero sideslip is established by banking slightly into the operating engine. This allows the aircraft to fly with its longitudinal axis aligned with the flight path. The improved airflow over the rudder and the horizontal component of lift created towards the operating engine both enhance the rudder\'s effectiveness, lowering V<sub>MCA</sub>. See the "Zero sideslip" section for details.</p>`},       
    { title: DCVTitle.Airspeed, content: `<p>Changing airspeed changes the speed of the airflow over the rudder. An increase in airspeed will increase the rudder's effectiveness, making it easier to maintain directional control. The V<sub>MCA</sub> speed, however, will not be affected.</p>` },
    { title: DCVTitle.Weight, content: `<p>For a given zero sideslip bank angle, an increase in weight will increase the horizontal component of lift. This will counteract more of the yaw/roll moment, taking more of the workload off of the rudder. The increased effectiveness of the rudder results in a lower V<sub>MCA</sub> speed.</p>
      <p>Note that in a wings-level condition, weight changes do not affect V<sub>MCA</sub> as there is no horizontal component of lift. For airplanes with critical engines, weight has an additional effect on V<sub>MCA</sub>. See the 'Critical Engine' section for more details.</p>` },
    { title: DCVTitle.COG, content: `<p>Changing the center of gravity (CG) changes the length of the arm from the CG to the rudder. The moment created by the rudder depends on the rudder's deflection and the distance from the rudder to the CG (force * arm = moment). Moving the CG forwards lengthens the arm, resulting in a greater moment for a given rudder deflection. This makes the rudder more effective (better able to counteract the yaw/roll created by the inoperative engine), lowering V<sub>MCA</sub>.</p>` },
    { title: DCVTitle.Flaps, content: `<p>When the flaps are lowered, the flap on the operating engine side will create more drag due to the propwash from the operating engine striking the flap. Since this will cause a yawing tendency into the operating engine, it makes the airplane more directionally stable and the rudder does not have to work as hard. The increased effectiveness of the rudder results in al lower V<sub>MCA</sub> speed.</p>` },
    { title: DCVTitle.LandingGear, content: `<p>When extended, the landing gear tend to act like small vertical stabilizers. Because of this, the aircraft has more directional stability, resisting the yawing moment created by the inoperative engine. The rudder's workload is reduced and its effectiveness is increased, lowering V<sub>MCA</sub>.</p>` },
    { title: DCVTitle.VMCA, content: `<p>V<sub>MCA</sub> is the minimum speed at which directional control can be maintained in flight when one engine suddenly fails and the remaining engine is at takeoff power. The V<sub>MCA</sub> speed also assumes that not more than 5 degrees of bank is being applied towards the operating engine.</p>
     <p>For certification purposes, the V<sub>MCA</sub> speed is determined under the following conditions:<p>
     <ul>
     <li><p>Critical engine (if applicable) inoperative</p></li>
        <li><p>Inoperative engine windmilling</p></li>
        <li><p>Up to 5 degrees of bank towards the operating engine</p></li>
        <li><p>Takeoff power on the operating engine</p></li>
        <li><p>Landing gear up </p></li>
        <li><p>Flaps in takeoff position </p></li>
        <li><p>Minimum practical test weight </p></li>
        <li><p>Center of gravity at the aft limit </p></li>
        </ul>
        <p>Much of the text in this section will refer to "lowering V<sub>MCA</sub>" and "raising V<sub>MCA</sub>". From the definition above, "lowering V<sub>MCA</sub>" means reducing the speed at which directional control can be maintained and "raising V<sub>MCA</sub>" means raising that speed. A lower V<sub>MCA</sub> speed is safer, of course, but many of the factors which
        can lower the V<sub>MCA</sub> also reduce single-engine performance. See the "Performance Factors" section for more details.</p>`},
    { title: DCVTitle.StallSpeed, content: `<p>The stall speed will vary with changes in many of the control factors listed. In a light twin like the Seminole, it is possible for the stall speed to be higher than V<sub>MCA</sub>. In this condition, a stall with an inoperative engine may result in a spin and/or an unrecoverable loss of
      directional control.</p>`},
    { title: SEPTitle.Power, content: `<p>To achieve maximum performance, the operating engine is set to full power in this simulation. Obviously, any decrease in power will result in a decrease in performance, as can be seen by changing the density altitude at which the aircraft is operating.</p>` },
    { title: SEPTitle.DensityAltitude, content: `<p>Changing the density altitude changes the power output of the engine due to changes in the air density. Increasing altitude (decreasing air density) will result in a loss of power on the operating engine.</p>` },
    { title: SEPTitle.Propeller, content: `<p>A feathered propeller produces much less drag than a windmilling propeller, increasing the aircraft's climb performance.</p>` },
    { title: SEPTitle.ControlTechnique, content: `<p>Flying wings level with an inoperative engine creates much more drag than flying with zero sideslip. This is due in part to the angle of the relative wind on the fuselage, vertical stabalizer, and rudder created by the side slip. Since the relative wind tends to parallel the rudder, the rudder must be deflected even further to get the same results.</p>
    <p>A zero sideslip is established by banking slightly into the operating engine. This allows the aircraft to fly with its longitudinal axis aligned with the flight path, creating much less drag and improving climb performance. See the "Zero sideslip" section for details.</p>`},
    { title: SEPTitle.Airspeed, content: `<p>Changing airspeed above or below Vyse will gnerally decrease climb performance.</p>
      <p>The indicated airspeed for the best rate of climb actually decreases slightly with altitude. As a result, it is possible at higher altitudes that flying slower than the published Vyse speed may actually yield slightly improved climb performance. This effect is not simulated here.</p>` },
    { title: SEPTitle.Weight, content: `<p>An increase in weight requires the aircraft to generate more lift and fly at a higher angle of attack for any given airspeed, creating more drag and decreasing climb performance.</p>` },
    { title: SEPTitle.COG, content: `<p>Shifting the center of gravity (CG) requires a change in the amount of taildown force in order to balance the aircraft along the longitudinal axis. This in turn changes the amount of lift the wings must produce to maintain altitude at a given speed. The aircraft will have to fly at a different angle of attack, changing the amount of lift and drag being produced. For example, a CG shifted forward will require an increase in taildown force, an increase in angle of attack and lift, and an increase in drag, decreasing climb performance.</p>` },
    { title: SEPTitle.Flaps, content: `<p>Lowering flaps will produce more drag and decrease climb performance.</p>` },
    { title: SEPTitle.LandingGear, content: `<p>Extending the landing gear will create more drag and reduce climb performance.</p>` },
    { title: SEPTitle.Vyse, content: '<p>Vyse is the single-engine best rate of climb speed. For the Piper Seminole, that speed is 88 KIAS</p>' },
    { title: SEPTitle.ExcessTHP, content: `<p>Excess thrust horsepower (THP) is the horsepower in excess of the amount required to maintain straight and level flight. An aircraft's rate of climb is a function of the excess THP available. An aircraft with zero excess THP at a given airspeed is using all of its horsepower just to maintain altitude at that speed.</p>
      <p>When a multiengine airplane suffers an engine failure, it loses 50% of its total horsepower, but it can lose 80-90% of its excess THP available. For example, assuming an aircraft with 360 HP requires 160 HP to maintain level flight at 88 KIAS, there would be 200 excess THP (360-160) that could be used to climb. If this aircraft had an engine failure, it would be down to 180HP (50% loss). However, the aircraft still needs 160 HP to maintain level flight at 88 KIAS. This means that there would only be 20 excess THP (180-160) available for climbing (a 90% loss).</p>`},
    { title: SEPTitle.RateOfClimb, content: `<p>The rate of climb is a function of the excess THP available. A light twin like the Seminole will have difficulty maintaining a positive single-engine rate of climb if it is not flown in the best configuration possible, at the proper speed, and using proper control technique. An engine failure can result in an 80-90% decrease in climb performance.</p>` },
    { title: SEPTitle.ServiceCeiling, content: `<p>The service ceiling is the altitude at which the aircraft can climb at no more than 100 feet per minute. At the single-engine service ceiling, the aircraft can climb no more than 50 feet per minute. The single-engine service ceiling is a valuable performance factor to calculate for preflight planning, especially for IFR flights and any flight over inhospitable terrain. The single-engine service ceiling gives the pilot a height above which he/she should not expect to be able to maintain altitude on one engine.</p>` },
    { title: SEPTitle.AbsoluteCeiling, content: `<p>The absolute ceiling is the altitude at which the maximum rate of climb is zero. The single-engine absolute ceiling is the same altitude obtained on one engine. The absolute ceiling is theoretically impossible to obtain, since the rate of climb will continue to decrease as the aircraft gets closer to the ceiling.</p>` },
    { title: 't-nose-deflection', content: `<p> The deflection of the nose from the flight path is shown by this index. In this simulation, the aircraft is assumed to be maintaining a constant heading. Therefore, the aircraft is either flying wings-level in a sideslip (nose NOT aligned with the flight path) or in a zero sideslip condition (nose ALIGNED with the flight path).</p>
      <p>With an inoperative engine, the only way that the aircraft can maintain heading and fly wings-level with the nose aligned with the flight path is if the operating engine is at idle power.</p>` },
    { title: RaycastTitle.YawLeft, content: `<p>This scale represents the yawing moment produced when an engine is inoperative. Since the operating engine is offset from the CG and the longitudinal axis of the aircraft, a strong yawing moment is produced towards the inoperative engine side. The strength of this moment depends primarily on the operating engine's distance from the CG, the thrust produced by the operating engine, and the amount of drag produced by the inoperative engine's propeller. This yaw is primarily counteracted by the use of the rudder.</p>` },
    { title: RaycastTitle.YawRight, content: `<p>This scale represents the yawing moment produced when an engine is inoperative. Since the operating engine is offset from the CG and the longitudinal axis of the aircraft, a strong yawing moment is produced towards the inoperative engine side. The strength of this moment depends primarily on the operating engine's distance from the CG, the thrust produced by the operating engine, and the amount of drag produced by the inoperative engine's propeller. This yaw is primarily counteracted by the use of the rudder.</p>` },
    { title: RaycastTitle.RudderLeft, content: `<p> This scale represents the rudder force being created to maintain directional control. The lateral force created by the rudder is a function of the rudder's deflection angle and speed of the aircraft. The rudder force required during single-engine operations is directly proportional to the magnitude of the yaw moment. </p>` },
    { title: RaycastTitle.RudderRight, content: `<p> This scale represents the rudder force being created to maintain directional control. The lateral force created by the rudder is a function of the rudder's deflection angle and speed of the aircraft. The rudder force required during single-engine operations is directly proportional to the magnitude of the yaw moment. </p>` },
    { title: RaycastTitle.BankLeft, content: `<p>The bank index at each wingtip shows the bank of the aircraft. In this simulation, the aircraft either flys wings-level in a sideslip or with a slight bank into the operating engine to establish a zero sideslip condition. The actual amount of bank needed to establish zero sideslip will vary depending on the type of aircraft.</p>` },
    { title: RaycastTitle.BankRight, content: `<p>The bank index at each wingtip shows the bank of the aircraft. In this simulation, the aircraft either flys wings-level in a sideslip or with a slight bank into the operating engine to establish a zero sideslip condition. The actual amount of bank needed to establish zero sideslip will vary depending on the type of aircraft.</p>` },
    { title: RaycastTitle.DragLeft, content: `<p>The scales behind each engine nacelle represent the drag produced by each propeller.</p>` },
    { title: RaycastTitle.DragRight, content: `<p>The scales behind each engine nacelle represent the drag produced by each propeller.</p>` },
    { title: RaycastTitle.RollLeft, content: `<p> The scales above each wing represent the rolling forces created when one engine is inoperative. The additional airflow created by the operating engine creates more lift on that side, causing a roll into the inoperative engine. The yaw created towards the inoperative engine accelerates the wing on the operating side, also producing more lift and adding to the rolling moment. In addition to rudder use, some aileron deflection is necessary to counteract this roll.</p>` },
    { title: RaycastTitle.RollRight, content: `<p> The scales above each wing represent the rolling forces created when one engine is inoperative. The additional airflow created by the operating engine creates more lift on that side, causing a roll into the inoperative engine. The yaw created towards the inoperative engine accelerates the wing on the operating side, also producing more lift and adding to the rolling moment. In addition to rudder use, some aileron deflection is necessary to counteract this roll.</p>` },
    { title: RaycastTitle.ThrustLeft, content: `<p>The scales in front of each propeller indicate the power output of each engine. Note that altitude changes will also affect the power output of an engine.</p>` },
    { title: RaycastTitle.ThrustRight, content: `<p>The scales in front of each propeller indicate the power output of each engine. Note that altitude changes will also affect the power output of an engine.</p>` },
    { title: CEFTitle.InopEngine, content: `<p>Use these buttons to select which engine is inoperative.</p>`},
    { title: CEFTitle.EngineConfiguration, content: `<p>Use these buttons to select the aircraft's engine configuration. In a conventional configuration, both engines turn in the same direction. In a US-designed multiengine airplane, this direction will be to the right (clockwise) when viewed from the rear. In the counter-rotating configuration, the engines turn in opposite directions, eliminating critical engine factors.</p>`},
    { title: CEFTitle.Pfactor, content: `<p>A multiengine aircraft flying with one engine inoperative will fly at a higher angle of attack as it attempts to climb or maintain altitude. This creates a P-factor (asymmetrical thrust) effect on the operating engine, where the descending propeller blade has a higher angle of attack and creates more thrust than the ascending blade.</p>
      <p>If the left engine is operating, P-factor creates additional thrust on the right side of the engine, close to the fuselage and the center of gravity. If the right engine is operating, the P-factor also creates additional thrust on the right side of the engine. However, this thrust acts much further from the aircraft's center of gravity, causing a much greater yawing moment. Losing the left engine has a greater negative effect than losing the right.</p>
      <p>The P-factor effect also results in accelerated slipstreams. Select the 'Accelerated Slipstream' option to see how this affects the aircraft.`},
    {title: CEFTitle.Slipstream, content: `<p>Spinning propellers impart a rotational flow to the air that is forced backwards when creating thrust. When the left engine is operating, the spiraling slipstream tends to impact the left side of the rudder and vertical stabilizer. This push on the tail to the right helps counteract the tendency of the aircraft to roll and yaw to the right, improving single-engine control and performance. When the right engine is operating, the spiraling slipstream does not impact the vertical stabilizer and does not help counteract the aircraft's rolling and yawing tendency to the left. Single-engine control and performance are degraded when the left engine is inoperative.</p>`},
    {title: CEFTitle.Accelerated, content: `<p>The additional thrust created by the operating engine's descending propeller blade (P-factor) is created by accelerating a greater amount of air rearward.</p>
      <p>If generated by the left engine, this accelerated slipstream creates additional lift close to the center of gravity, adding little to the rolling moment. This accelerated slipstream also flows closely along the fuselage and impacts the rudder, making it more effective.</p>
      <p>Accelerated slipstream from the right engine, however, generates additional lift much farther from the center of gravity, adding more to the rolling moment. This accelerated air does not help with rudder effectiveness either, doing nothing to help counteract the rolling/yawing tendency.</p>
      <p>The effects of an inoperative left engine are much worse.</p>`},
    {title: CEFTitle.Torque, content: `<p>"For every action there is an equal and opposite reaction." -- Because of this, as an engine turns its propeller in one direction, the engine tends to rotate in the opposite direction. Since the propellers turn to the right (clockwise), the engines (and the aircraft they are attached to) will tend to roll to the left.</p>
      <p> If the left engine is operating, this engine torque will actually help counteract the aircraft's tendency to roll to the right (into the inoperative engine).</p>
      <p>If the right engine is operating, the engine torque adds to the left-rolling tendency into the inoperative engine. The rolling tendency is worse if the left engine is inoperative.</p>`},
    {title: CEFTitle.EngineConfigurationCr, content:'<p>With a counter-rotating engine configuration, the critical engine factors listed here have the same effect for both engines. Aircraft performance and control characteristics will be the same regardless of which engine is inoperative.</p>'},
    {title: GeneralTitle.RudderEffectiveness, content: `<p>This scale represents rudder effectiveness, showing the rudder's ability to counteract the yawing and rolling forces caused by an inoperative engine.</p>
      <p>Any factors that increase directional stability or enhance the rudder's ability to do its job make the rudder more effective. An increase in rudder effectiveness allows the aircraft to maintain directional control at lower airspeeds, lowering V<sub>MCA</sub>.</p>`},
    {title: ZSTTitle.InopEngine, content: `<p>Use these buttons to select which engine is inoperative.</p>`},
    {title: ZSTTitle.InopEngineLeft, content: `<p>With the left engine inoperative, the aircraft will tend to roll and yaw to the left. Right rudder deflection creates lateral lift on the tail to counteract this tendency. If the aircraft is flown wings level, the combination of lateral lift and operating engine thrust will result in a sideslip into the inoperative engine.</p>`},
    {title: ZSTTitle.InopEngineRight, content: `<p>With the right engine inoperative, the aircraft will tend to roll and yaw to the right. Left rudder deflection creates lateral lift on the tail to counteract this tendency. If the aircraft is flown wings level, the combination of lateral lift and operating engine thrust will result in a sideslip into the inoperative engine.</p>`},
    {title: ZSTTitle.WingsLevel, content: `<p>If the aircraft is flown wings level, a sideslip into the inoperative engine will result. The vertical fin produces an unbalanced lateral lift force due to the large rudder deflection required to counteract the asymmetric thrust. This side force causes the aircraft to accelerate sideways until the lateral drag caused by the sideslip equals the rudder force. There are four major disadvantages to sideslipping:</p>
        <ol>
          <li>The relative wind striking the tail on the inoperative engine side increases the yawing moment.</li>
          <li>Stall characteristics are degraded due to the fuselage blocking some airflow to the wing on the operating engine side.</li>
          <li>Extra drag is produced by both the fuselage and the rudder deflection, decreasing performance. The rudder must be deflected further because of the greater yawing moment and because of the angle of the relative wind. Since the relative wind in the sideslip tends to parallel the rudder, it must be deflected even further to get the same results.</li>
          <li>Rudder effectiveness is decreased, resulting in a higher V<sub>MCA</sub> speed.</li>
        </ol>`},
    {title: ZSTTitle.ZeroSideslip, content: `<p>By banking into the operating engine, a horizontal component of lift is created that balances the lateral lift force of athe rudder and vertical stabilizer. With the lateral forces balanced, the aircraft flies with its longitudinal axis aligned with the relative wind (zero sideslip). The exact angle of the bank required to maintain zero sideslip varies for each aircraft. The major advantages of using a zero sideslip instead of flying wings level are:</p>
        <ol>
          <li>The yawing moment is reduced since the relative wind no longer strikes the inoperative engine side of the tail.</li>
          <li>Uniform airflow over both wings improves stall characteristics.</li>
          <li>Less rudder deflection is required due to the decreased yawing moment. This decreased rudder deflection and the lack of relative wind striking the side of the fuselage reduces overall drag and improves performance.</li>
          <li>Rudder effectiveness is increased resulting in a lower V<sub>MCA</sub> speed.</li>
        </ol>`},
    {title: ZSTTitle.Inclinometer, content: `<p>The inclinometer, or "ball" can be used to establish a zero sideslip condition. Using a yaw string, a zero sideslip can be established, noting the position of the ball. This ball position can then be used to help establish a zero sideslip for future single-engine conditions when a yaw string is not available.</p>
      <p>In the Seminole, a zero sideslip is established with about 1/2 ball deflection towards the operating engine. In a zero sideslip condition, there are no rolling or yawing forces present - the ball merely sits at the lowest point in the inclinometer tube, which is slightly off center due to the aircraft's bank angle.</p>`},
    {title: ZSTTitle.ControlTechnique, content: '<p>Use these buttons to select which control technique to use.</p>'},
    {title: ZSExercise.Step1, content: '<h2>To try out this demonstration of zero sideslip, you will need two people, a multiengine airplane model, and a clear table.</h2>'},
    {title: ZSExercise.Step2, content: '<h2>To simulate a wings-level condition, one person should pull on the operating engine to simulate thrust while the other pushes on the tail to simulate the rudder force.</h2>'},
    {title: ZSExercise.Step3, content: '<h2>As the airplane is pulled accross the table, apply enough force on the tail to keep the airplane on a constant heading. The airplane moves towards the inoperative engine.</h2>'},
    {title: ZSExercise.Step4, content: '<h2>To simulate a zero sideslip condition, add an additional component of lift created by banking into the operating engine.</h2>'},
    {title: ZSExercise.Step5, content: '<h2>Apply enough "horizontal component of lift" force to counteract the rudder force, and the airplane will move straight across the table while holding a heading.</h2>'}
  ];

  public getContent(title: string): string {
    var entry = this._dictonaryEntries.find(e => e.title === title);
    if(entry) {
      return entry.content;
    } else {
      return 'Content not found.';
    }
  }

}

class Entry {
  public title: string;
  public content: string;
}

