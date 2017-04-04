import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class ConfigService {
  config:any = {};

  defaultConfig: Object = {
    modeJoystick: "semi",
    sensibiliteJoystick: 200,
    tailleJoystick: 150,
    couleurGaucheJoystick: "rouge",
    couleurDroiteJoystick: "vert"
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
