import { Component, OnInit, OnDestroy } from '@angular/core';
import { EngineService } from 'src/app/engine/engine.service';
import { LoaderService } from 'src/app/engine/loader.service';

@Component({
  selector: 'app-view-cef',
  templateUrl: './view-cef.component.html',
  styleUrls: ['./view-cef.component.scss']
})
export class ViewCefComponent implements OnInit, OnDestroy {

  constructor(private engineService: EngineService,
              private loaderService: LoaderService) { }

  ngOnInit() {
    this.loaderService.loadScene('view-cef');
  }

  ngOnDestroy() {
    this.engineService.dispose();
  }
}
