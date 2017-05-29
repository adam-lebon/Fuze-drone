import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { NavigationPage } from '../navigation/navigation';
import { ParametresPage } from '../parametres/parametres';
import { InformationsPage } from '../informations/informations';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit, OnDestroy {
  manager:any;
  navigationPage:any = NavigationPage;
  parametresPage:any = ParametresPage;
  informationsPage:any = InformationsPage;

  constructor(
    private statusBar: StatusBar,
    private platform:Platform,
    private websocketService: WebsocketService
  ) { }

  ngOnInit(){
    if(this.platform.is('mobile')) {
      this.statusBar.show();
    }
  }
  ngOnDestroy(){
    if(this.platform.is('mobile')) {
      this.statusBar.hide();
    }
  }
}
