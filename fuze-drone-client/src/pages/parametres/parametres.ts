import { Component, OnInit } from '@angular/core';
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
    this.configService.config.subscribe(config => this.config = config);
  }

  save(){
    this.configService.config.next(this.config);
  }
}
