import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import { NavigationPage } from '../navigation/navigation';


@Component({
  selector: 'home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit, OnDestroy {
  manager:any;
  navigationPage:any = NavigationPage;
  constructor(private platform:Platform) { }



  ngOnInit(){
    if(this.platform.is('mobile')) {
      StatusBar.show();
    //  ScreenOrientation.lockOrientation('landscape');
    }
  }
  ngOnDestroy(){
    if(this.platform.is('mobile')) {
      StatusBar.hide();
    }
  }
}
