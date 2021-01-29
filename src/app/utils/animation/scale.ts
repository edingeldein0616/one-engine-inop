import { Mesh, MeshPhysicalMaterial } from 'three';

export class Scale {

  private _mesh: Mesh;
  private _material: MeshPhysicalMaterial;
  private readonly _base = 0.5;
  private readonly _top = -0.5;

  constructor(mesh: Mesh) {
    this._mesh = mesh;
    this._material = this._mesh.material as MeshPhysicalMaterial;
    if(this._material.map === null) return;
    this._material.map.offset.x = this._base;
  }

  public move(d: number) {
    const offset = this._material.map.offset.x;
    if(offset + d <= this._base && offset + d >= this._top) {
      this._material.map.offset.x += d;
    }
  }

  public set(p: number) {
    if(p > 1 || p < 0) return;

    let pos = 0.5 - p;
    this._material.map.offset.x = pos;
  }
}
