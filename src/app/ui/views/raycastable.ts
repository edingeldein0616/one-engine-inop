import { Object3D } from 'three';

/**
 * Enforces raycasting functions for a view that implements raycasting.
 */
export interface Raycastable {
    sendRootToRaycaster(...root: Object3D[]): void;
}