import { Component } from '@angular/core';
import { NavigationPage} from '../navigation/navigation';

@Component({
  selector: 'home',
  templateUrl: 'home.html'
})
export class HomePage {

  navigationPage:any = NavigationPage;
  constructor() {

  }
}
