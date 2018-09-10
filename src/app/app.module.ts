import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

// Components/Pages/Modules
import { MyApp } from './app.component';
import { LoginPage } from './../pages/login/login';

import { HomeModule } from './../pages/home/home.module';
import { AssociadosModule } from './../pages/associados/associados.module';
import { MotoristasModule } from './../pages/motoristas/motoristas.module';
import { OnibusModule } from './../pages/onibus/onibus.module';
import { LogsModule } from './../pages/logs/logs.module';
import { ConfigModule } from './../pages/config/config.module';

// Providers
import { HttpModule } from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';

import { ApiFunctions } from './../providers/api-functions';
import { HelperFunctions } from './../providers/helper-functions';
import { Global } from './../providers/global';


@NgModule({
  declarations: [
    MyApp,
    LoginPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    BrowserModule,
    HttpModule,
    HomeModule,
    AssociadosModule,
    MotoristasModule,
    OnibusModule,
    LogsModule,
    ConfigModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ApiFunctions,
    HelperFunctions,
    Global
  ]
})
export class AppModule {}
