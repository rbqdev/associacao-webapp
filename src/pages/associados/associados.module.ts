import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CustomPipesModule } from './../../pipes/custom-pipes.module';
import { TextMaskModule } from 'angular2-text-mask';
import { AssociadosPage } from './associados';
import { AssociadosModal } from './associados-modal/associados-modal';
import { AssociadosSinglePage } from './associados-single/associados-single';
import { AssociadosSingleModal } from './associados-single/assoc-single-modal/assoc-single-modal';
import { AssociadosFilter } from './associados-filter/associados-filter';

@NgModule({
  declarations: [
    AssociadosPage,
    AssociadosModal,
    AssociadosSinglePage,
    AssociadosSingleModal,
    AssociadosFilter
  ],
  imports: [
    IonicPageModule.forChild(AssociadosPage),
    CustomPipesModule,
    TextMaskModule
  ],
  exports: [
      AssociadosPage,
      AssociadosModal,
      AssociadosSinglePage,
      AssociadosSingleModal,
      AssociadosFilter
  ],
  entryComponents:[
      AssociadosPage,
      AssociadosModal,
      AssociadosSinglePage,
      AssociadosSingleModal,
      AssociadosFilter
  ]
})
export class AssociadosModule {}