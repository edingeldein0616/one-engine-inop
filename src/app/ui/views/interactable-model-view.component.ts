import { OnInit } from "@angular/core";
import { EventBus, Listener, Subject } from "src/app/engine/core/events";
import { ThreeEngineEvent } from "src/app/utils/static-text-data";
import { Intersection, Object3D } from "three";
import { ModelViewComponent } from "./model-view.component";
import { Raycastable } from "./raycastable";

/** Base class for views that implement interactivity with the 3D view via raycasting. Enforces a subscription to INTERSECT engine events through EventBus,
 *  and a change detection callback function. Provides logic for recieving intersect events and sending the root model to engine to provide raycasting.
 */
export abstract class InteractableModelViewComponent extends ModelViewComponent implements OnInit, Raycastable, Listener {

  /**
   * Proxy callback function ChangeDetectorRef.detectChanges(). Inheritance doesn't allow for injection of ChangeDetectorRef so it's
   * up to the child class to inject it.
   */
  protected abstract detectChange();

  constructor() {
    super();
  }

  /**
   * OnInit lifecycle that subscribes to the intersect engine event.
   */
  public ngOnInit() {
    EventBus.get().subscribe(ThreeEngineEvent.INTERSECT, this);
  }

  /** 
   * Implements dispose abstract function with unsubscription to the intersect engine event.
  */
  protected _dispose() {
    EventBus.get().unsubscribe(ThreeEngineEvent.INTERSECT, this);
  }

  /**
   * Sends the objects you want to enable raycasting for to the Three.js engine instance.
   * @param root Object3D types that serve as the root object for raycasting calculations.
   */
  public sendRootToRaycaster(...root: Object3D[]) {
    const sub = new Subject();
    sub.data = root;
    EventBus.get().publish(ThreeEngineEvent.SENDROOTTORAYCASTER, sub);
  }

  /**
   * Provides logic to read the results of the raycast and display data in the description panel depending on the object recieved.
   * @param topic Event topic
   * @param subject Event subject
   */
  public receive(topic: string, subject: Subject) {
    switch (topic) {
      case ThreeEngineEvent.INTERSECT: {
        console.log(subject.data);
        var firstIntersect = subject.data.shift() as Intersection;
        this.onLabelSelected(firstIntersect.object.name);
        this.detectChange();
      }
    }
  }
}