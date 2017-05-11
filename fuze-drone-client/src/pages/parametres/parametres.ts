import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ToastController } from 'ionic-angular';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'parametres',
  templateUrl: 'parametres.html'
})

export class ParametresPage implements OnInit {
  config: Object = {};



  constructor(private toastCtrl: ToastController, private configService: ConfigService) { }

  ngOnInit(){
    this.config = this.configService.config;
  }

  save(){
    this.configService.save().then(() => {
      this.toastCtrl.create({
        message: 'Config saved !',
        duration: 2500
      }).present();
    });
  }
}
