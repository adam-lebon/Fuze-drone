import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/skip';

@Injectable()
export class ConfigService {
  config:ReplaySubject<Object> = new ReplaySubject();

  defaultConfig: Object = {
    modeJoystick: "dynamic",
    tailleJoystick: 100,
    couleurGaucheJoystick: "red",
    couleurDroiteJoystick: "green",
    ipAdress: "10.9.0.1"
    }

  constructor(public storage: Storage){
    Observable.fromPromise(this.storage.ready())
      .mergeMap(() => Observable.fromPromise(this.storage.get('config')))
      .subscribe(config => this.config.next(Object.assign({}, this.defaultConfig, config)));

    this.config.skip(1).subscribe(config => this.storage.set('config', config));
      /*
    this.storage.ready().then((config) => {
       this.storage.get('config').then((config) => {
         this.config = Object.assign({}, this.defaultConfig, config);
         console.log(this.config);
       });
     });*/
  }

  save(){

  }
}
