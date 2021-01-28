import { Object3D } from 'three';

export interface Raycastable {
    sendRootToRaycaster(...root: Object3D[]): void;
}