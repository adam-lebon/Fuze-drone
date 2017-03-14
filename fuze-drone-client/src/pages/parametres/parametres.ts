import { Component } from '@angular/core';

@Component({
  selector: 'parametres',
  templateUrl: 'parametres.html'
})

export class ParametresPage {
  modeJoystick:any = "semi";
  sensibiliteJoystick:any = "400";
  tailleJoystick:any = "500";
  couleurGaucheJoystick:any="rouge";
  couleurDroiteJoystick:any="vert";
  constructor() { }


}
