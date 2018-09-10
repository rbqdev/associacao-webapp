import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { IonicPageModule } from 'ionic-angular';
import { MotoristasPage } from './motoristas';
import { MotoristasModal } from './motoristas-modal/motoristas-modal';
import { MotoristasSinglePage } from './motoristas-single/motoristas-single';
import { TextMaskModule } from 'angular2-text-mask';
import { CustomPipesModule } from './../../pipes/custom-pipes.module';


@NgModule({
  declarations: [
    MotoristasPage,
    MotoristasModal,
    MotoristasSinglePage
  ],
  imports: [
    // CommonModule,
    IonicPageModule.forChild(MotoristasPage),
    CustomPipesModule,
    TextMaskModule
  ],
  exports: [
      MotoristasPage,
      MotoristasModal,
      MotoristasSinglePage
  ],
  entryComponents:[
    MotoristasPage,
    MotoristasModal,
    MotoristasSinglePage
  ]
})
export class MotoristasModule {}