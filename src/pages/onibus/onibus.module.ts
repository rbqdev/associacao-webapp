import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OnibusPage } from './onibus';
import { OnibusModal } from './onibus-modal/onibus-modal';
import { OnibusSingle } from './onibus-single/onibus-single';
import { OnibusForm } from './onibus-form/onibus-form';
import { TextMaskModule } from 'angular2-text-mask';
import { CustomPipesModule } from './../../pipes/custom-pipes.module';

@NgModule({
  declarations: [
    OnibusPage,
    OnibusModal,
    OnibusSingle,
    OnibusForm
  ],
  imports: [
    IonicPageModule.forChild(OnibusPage),
    CustomPipesModule,
    TextMaskModule
  ],
  exports: [
    OnibusPage,
    OnibusModal,
    OnibusSingle,
    OnibusForm
  ],
  entryComponents:[
  	OnibusPage,
    OnibusModal,
    OnibusSingle,
    OnibusForm
  ]
})
export class OnibusModule {}