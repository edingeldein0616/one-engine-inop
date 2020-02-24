import { Component, OnInit, OnDestroy } from '@angular/core';
import { EngineService } from 'src/app/engine/engine.service';
import { LoaderService } from 'src/app/engine/loader.service';

@Component({
  selector: 'app-view-zst',
  templateUrl: './view-zst.component.html',
  styleUrls: ['./view-zst.component.scss']
})
export class ViewZstComponent implements OnInit, OnDestroy {

  constructor(private engineService: EngineService,
              private loaderService: LoaderService) { }

  ngOnInit() {
    this.loaderService.loadScene('view-zst');
  }

  ngOnDestroy() {
    this.engineService.dispose();
  }
}
