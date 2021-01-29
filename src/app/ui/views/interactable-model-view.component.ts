import { OnInit } from "@angular/core";
import { EventBus, Listener, Subject } from "src/app/engine/core/events";
import { ThreeEngineEvent } from "src/app/utils";
import { Intersection, Object3D } from "three";
import { ModelViewComponent } from "./model-view.component";
import { Raycastable } from "./raycastable";

export abstract class InteractableModelViewComponent extends ModelViewComponent implements OnInit, Raycastable, Listener {

  protected abstract detectChange();

  constructor() {
    super();
  }

  public ngOnInit() {
    EventBus.get().subscribe(ThreeEngineEvent.INTERSECT, this);
  }

  protected _dispose() {
    EventBus.get().unsubscribe(ThreeEngineEvent.INTERSECT, this);
  }

  public sendRootToRaycaster(...root: Object3D[]) {
    const sub = new Subject();
    sub.data = root;
    EventBus.get().publish(ThreeEngineEvent.SENDROOTTORAYCASTER, sub);
  }

  public receive(topic: string, subject: Subject) {
    switch (topic) {
      case ThreeEngineEvent.INTERSECT: {
        var firstIntersect = subject.data.shift() as Intersection;
        this.onLabelSelected(firstIntersect.object.name);
        this.detectChange();
      }
    }
  }
}