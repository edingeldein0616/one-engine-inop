import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-button',
  templateUrl: './card-button.component.html',
  styleUrls: ['./card-button.component.scss']
})
export class CardButtonComponent {

  @Input() title: string;
  @Input() link: string;

  constructor() { }

}
