import { Component, OnInit, OnDestroy } from '@angular/core';
import { EngineService } from 'src/app/engine/engine.service';

@Component({
  selector: 'app-view-zst',
  templateUrl: './view-zst.component.html',
  styleUrls: ['./view-zst.component.scss']
})
export class ViewZstComponent implements OnInit, OnDestroy {

  constructor(private engineService: EngineService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    // this.engineService.dispose();
  }
}
