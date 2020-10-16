
export class TextDictionary {

  private static _dictonaryEntries: Entry[] = [
    { title: 'l-yaw-left', content: `<h3>This scale represents the yawing moment produced when an engine is inoperative. Since the operating engine is offset from the CG and the longitudinal axis of the aircraft, a strong yawing moment is produced towards the inoperative engine side. The strength of this moment depends primarily on the operating engine's distance from the CG, the thrust produced by the operating engine, and the amount of drag produced by the inoperative engine's propeller. This yaw is primarily counteracted by the use of the rudder.</h3>` },
    { title: 'l-yaw-right', content: `<h3>This scale represents the yawing moment produced when an engine is inoperative. Since the operating engine is offset from the CG and the longitudinal axis of the aircraft, a strong yawing moment is produced towards the inoperative engine side. The strength of this moment depends primarily on the operating engine's distance from the CG, the thrust produced by the operating engine, and the amount of drag produced by the inoperative engine's propeller. This yaw is primarily counteracted by the use of the rudder.</h3>` },
    { title: 'l-rudder-left', content: `<h3> This scale represents the rudder force being created to maintain directional control. The lateral force created by the rudder is a function of the rudder's deflection angle and speed of the aircraft. The rudder force required during single-engine operations is directly proportional to the magnitude of the yaw moment. </h3>` },
    { title: 'l-rudder-right', content: `<h3> This scale represents the rudder force being created to maintain directional control. The lateral force created by the rudder is a function of the rudder's deflection angle and speed of the aircraft. The rudder force required during single-engine operations is directly proportional to the magnitude of the yaw moment. </h3>` },
    { title: 't-bankMarkings-left', content: `<h3>The bank index at each wingtip shows the bank of the aircraft. In this simulation, the aircraft either flys wings-level in a sideslip or with a slight bank into the operating engine to establish a zero sideslip condition. The actual amount of bank needed to establish zero sideslip will vary depending on the type of aircraft.</h3>` },
    { title: 't-bankMarkings-right', content: `<h3>The bank index at each wingtip shows the bank of the aircraft. In this simulation, the aircraft either flys wings-level in a sideslip or with a slight bank into the operating engine to establish a zero sideslip condition. The actual amount of bank needed to establish zero sideslip will vary depending on the type of aircraft.</h3>` },
    { title: 's-drag-left', content: `<h3>The scales behind each engine nacelle represent the drag produced by each propeller.</h3>` },
    { title: 's-drag-right', content: `<h3>The scales behind each engine nacelle represent the drag produced by each propeller.</h3>` },
    { title: 's-roll-left', content: `<h3> The scales above each wing represent the rolling forces created when one engine is inoperative. The additional airflow created by the operating engine creates more lift on that side, causing a roll into the inoperative engine. The yaw created towards the inoperative engine accelerates the wing on the operating side, also producing more lift and adding to the rolling moment. In addition to rudder use, some aileron deflection is necessary to counteract this roll.</h3>` },
    { title: 's-roll-right', content: `<h3> The scales above each wing represent the rolling forces created when one engine is inoperative. The additional airflow created by the operating engine creates more lift on that side, causing a roll into the inoperative engine. The yaw created towards the inoperative engine accelerates the wing on the operating side, also producing more lift and adding to the rolling moment. In addition to rudder use, some aileron deflection is necessary to counteract this roll.</h3>` },
    { title: 's-thrust-left', content: `<h3>The scales in front of each propeller indicate the power output of each engine. Note that altitude changes will also affect the power output of an engine.</h3>` },
    { title: 's-thrust-right', content: `<h3>The scales in front of each propeller indicate the power output of each engine. Note that altitude changes will also affect the power output of an engine.</h3>` },
    { title: 'inop-engine', content: `<h3>This selection simulates a multiengine aircraft with counter-rotating propellers. See the "Critical Engine" section for details on differences encountered when both propellers turn in the same direction.</h3>` },
    { title: 'power', content: `<h3>The thrust produced by the operating engine will have a direct effect on the yaw/roll into the inoperative engine. Any decrease in thrust, caused by reducing the power setting and/or an increase in altitude, will decrease the ya/roll moment, lowering Vmca.</h3>` },
    { title: 'density-altitude', content: `<h3>Changing the density altitude changes the power output of the engine due to changes in the air density. Increasing altitude (decreasing air density) will result in a loss of power on the operating engine. The ya/roll moments iwll be reduced, lowering Vmca.</h3>` },
    { title: 'propeller', content: `<h3>A feathered propeller produces much less drag than a windmilling propeller, decreasing the yaw/roll into the inoperative engine, lowering Vmca.</h3>` },
    { title: 'control-technique', content: `<h3>Flying wings level with an inoperative engine requires much more rudder deflection than flying with zero sideslip. This is due in part to the angle of the relative wind on the rudder created by the side slip. Since the relative wind tends to parallel the rudder,
       the rudder must be deflected even further to get the same results. The rudder\'s effectiveness is reduced, raising Vmca. Also, without any bank into the operating engine, there is no horizontal component of lift to takesome of the workload off of the rudder.</h3>
       <br>
       <h3>A zero sideslip is established by banking slightly into the operating engine. This allows the aircraft ato fly with its longitudinal axis aligned with the flight path. The improved airflow over the rudder and the horizontal component of lift created towards the operating engine both enhance the
       rudder\'s effectiveness, lowering Vmca. See the "Zero sideslip" section for details.</h3>`},
    { title: 'airspeed', content: `<h3>Changing airspeed changes the speed of the airflow over the rudder. An increase in airspeed will increase the rudder's effectiveness, making it easier to maintain directional control. The Vmca speed, however, will not be affected.</h3>` },
    { title: 'weight', content: `<h3>For a given zero sideslip bank angle, an increase in weight will increase the horizontal component of lift. This will counteract more of the yaw/roll moment, taking more of the workload off of the rudder. The increased effectiveness of hte rudder results in a lower Vmca speed.</h3>
      <br>
      <h3>Note that in a wings-level condition, weight changes do not affect Vmca as there is no horizontal component of lift. For airplanes with critical engines, weight has an additional effect of Vmca. See the 'Critical Engine' section for more details.</h3>` },
    { title: 'cog', content: `<h3>The moment created by the rudder depends on the rudder's deflection and the distance from the rudder to the CG (force * arm = moment). Moving the CG forwards lengthens the arm, resulting in a greater moment for a given rudder deflection. This makes the rudder more effective
    (better able to counteract the yaw/roll created by the inoperative engine), lowering Vmca.</h3>` },
    { title: 'flaps', content: `<h3>When the flaps are lowered, the flap on the operating engine side will create more drag due to the propwash from the operating engine striking the flap. Since this will cause a yawing tendency into the operating engine, it makes the airplane more directionally stable and the
    rudder does not have to work as hard. The increased effectiveness of the rudder results in al lower Vmca speed.</h3>` },
    { title: 'gear', content: `<h3>When extended, the landing gear tend to act like small vertical stabilizers. Because of this, the aircraft has more directional stability, resisting the yawing moment created by the inoperative engine. The rudder's workload is reduced and its effectiveness is increased, lowering Vmca.</h3>` },
    { title: 'vmca', content: `<h3>Vmca is the minimum speed at which directional control can be maintained in flight when one engine suddenly fails and the remaining engine is at takeoff power. The Vmca speed also assumes that not more than 5 degrees of bank is being applied towards the operating engine.</h3>
     <h3>For certification purposes, the Vmca speed is determined under the following conditions:<h3>
     <ul>
        <li><h3>Critical engine (if applicable) inoperative</h3></li>
        <li><h3>Inoperative engine windmilling</h3></li>
        <li><h3>Up to 5 degree of bank towards the operating engine</h3></li>
        <li><h3>Takeoff power on the operating engine</h3></li>
        <li><h3>Landing gear up </h3></li>
        <li><h3>Flaps in takeoff position </h3></li>
        <li><h3>Minimum practical test weight </h3></li>
        <li><h3>Center of gravity at the aft limit </h3></li>
     </ul>
     <h3>Much of the text in this section will refer to "lowering Vmca" and "raising Vmca". From the definition above, "lowering Vmca" means reducing the speed at which directional control can be maintained and "raising Vmca" means raising that speed. A lower Vmca speed is safer, of course, but many of the factors which
     can lower the Vmca also reduce single-engine performance. See "Performance Factors" section for more details.</h3>`},
    { title: 'stall-speed', content: `<h3>The stall speed will vary with changes in many of the control factors listed. In a light twin like the seminole, it is possible for the stall speed to be higher than Vmca. In this condition, a stall with an inoperative engine may result in a spin and/or an unrecoverable loss of
      directional control.</h3>`},
    { title: 't-nose-deflection', content: `<h3> The deflection of the nose from the flight path is shown by this index. In this simulation, the aircraft is assumed to be maintaining a constant heading. Therefore, the aircraft is either flying wings-level in a sideslip (nose NOT aligned with the flight path) or in a zero sideslip condition (nose ALIGNED with the flight path).</h3>
      <h3>With an inoperative engine, the only way that the aircraft can maintain heading and fly wings-level with the nose aligned with the flight path is if the operating engine is at idle power.</h3>` },
    { title: 'vyse', content: '<h3>Vyse is the single-engine best rate of climb speed. For the Piper Seminole, that speed is 88 KIAS</h3>'},
    { title: 'excess-thp', content: `<h3>Excess thrust horsepower (THP) is the horsepower in excess of the amount required to maintain straight and level flight. An aircraft's rate of climb is a function of the excess THP available. An aircraft with zero excess THP at a given airspeed is using all of its horsepower just to maintain altitude at the speed.</h3>
      <h3>When a multiengine airplane suffers an engine failure, it loses 50% of its total horsepower, but it can lose 80-90% of is excess THP available. For example, assuming an aircraft with 360 HP requires 160 HP to maintain level flight at 88 KIAS, there would be 200 excess THP (360-160) that could be used to climb. If this aircraft had an engine failure, it would be down to 180HP (50% loss). However, the aircraft still needs 160 HP to maintain level flight at 88 KIAS. This means that there would only be 20 excess THP (180 - 160) available for climbing (90% loss).</h3>`},
    { title: 'rate-of-climb', content: `<h3>The rate of climb is a function of the excess THP available. A light twin like the Seminole will have difficulty maintaining a positive single-engine rate of climb if it is not flown in the best configuration possible, at the proper speed, and using proper control technique. An engine failure can result in an 80-90% decrease in climb performance.</h3>`},
    { title: 'service-ceiling', content: `<h3>The service ceiling is the altitude at which the aircraft can climb at no more than 100 feet per minute. At the single-engine service ceiling, the aircraft can climb no more than 50 feet per minute. The single-engine service ceiling is a valuable performance factor to calculate for preflight planning, especially for IFR flights and any flight over inhospitable terrain. The single-engine service ceiling gives the pilot a height above which he/she should not expect to be able to maintain altitude on one engine.</h3>`},
    { title: 'absolute-ceiling', content: `<h3>The absolute ceiling is the altitude at which the maximum rate of climb is zero. The single-engine absolute ceiling is the same altitude obtained on one engine. The absolute ceiling is theoretically impossible to obtain, since the rate of climb will continue to decrease as the aircraft gets closer to the ceiling.</h3>`}

  ];

  public static getContent(title: string): string {
    var entry = this._dictonaryEntries.find(e => e.title === title);
    if(entry) {
      return entry.content;
    }

  }

}

class Entry {
  public title: string;
  public content: string;
}
