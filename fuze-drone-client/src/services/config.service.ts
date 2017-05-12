import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class ConfigService {
  config:any = {};

  defaultConfig: Object = {
    modeJoystick: "semi",
    tailleJoystick: 100,
    couleurGaucheJoystick: "red",
    couleurDroiteJoystick: "green",
    ipAdress: "10.9.0.1"
    }

  constructor(private storage: Storage){
    this.storage.ready().then(() => {
       this.storage.get('config').then((config) => {
         this.config = Object.assign({}, this.defaultConfig, config);
         console.log(this.config);
       });
     });
  }

  save(){
    return this.storage.set('config', this.config);
  }
}
