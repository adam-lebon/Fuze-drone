import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { IonicStorageModule } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { NavigationPage } from '../pages/navigation/navigation';
import { ParametresPage } from '../pages/parametres/parametres';
import { InformationsPage } from '../pages/informations/informations';
import { ConfigService } from '../services/config.service';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    NavigationPage,
    ParametresPage,
    InformationsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    NavigationPage,
    ParametresPage,
    InformationsPage
  ],
  providers: [
    ConfigService,
    StatusBar,
    SplashScreen,
    ScreenOrientation,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
