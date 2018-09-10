import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { HomePage } from './home';
import { HomeModal } from './home-modal/home-modal';
// import { HomePopover } from './home-popover/home-popover';

@NgModule({
  declarations: [
    HomePage,
    HomeModal,
    // HomePopover
  ],
  imports: [
    IonicPageModule.forChild(HomePage),
  ],
  exports: [
      HomePage,
      HomeModal,
      // HomePopover
  ],
  entryComponents:[
      HomePage,
      HomeModal,
      // HomePopover
  ]
})
export class HomeModule {}