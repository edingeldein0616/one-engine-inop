import { Engine } from "@nova-engine/ecs";
import { EngineService } from "src/app/engine/engine.service";
import { environment } from "src/environments/environment";
import { AnimationDriver } from "../../animation-driver";
import { ActionPair } from "../action-pair";

export abstract class MarkingsBase {

    constructor(protected _engineService: EngineService, protected _animationDriver: AnimationDriver) {}

    protected abstract _map: MarkingsMapBase;

    public abstract animate(...args: any[]): void;
    public abstract hide(): void;
}

export abstract class MarkingsMapBase {

    protected abstract _map: Map<string, ActionPair>;

    public get(key: string): ActionPair {
        return this._map.get(key);
    }
    public getValues(): ActionPair[] {
        return Array.from(this._map.values());
    }
}