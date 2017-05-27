import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { NavigationPage } from '../pages/navigation/navigation';
import { ParametresPage } from '../pages/parametres/parametres';
import { InformationsPage } from '../pages/informations/informations';
import { ConfigService } from '../services/config.service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;
  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public menu: MenuController,
    public configService: ConfigService
  ) {
    this.initializeApp();

    this.pages = [
      { title: 'Accueil', component: HomePage },
      { title: 'Navigation', component: NavigationPage },
      { title: 'Parametres', component: ParametresPage }
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    this.menu.close();
    this.nav.setRoot(page.component);
  }
}
