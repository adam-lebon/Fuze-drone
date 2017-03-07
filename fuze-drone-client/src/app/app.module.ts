import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { NavigationPage } from '../pages/navigation/navigation';
import { ParametresPage } from '../pages/parametres/parametres';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    NavigationPage,
    ParametresPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    NavigationPage,
    ParametresPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
