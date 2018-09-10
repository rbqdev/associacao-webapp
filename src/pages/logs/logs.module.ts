import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LogsPage } from './logs';
import { LogsFilter } from './logs-filter/logs-filter';
import { CustomPipesModule } from '../../pipes/custom-pipes.module';

@NgModule({
  declarations: [
    LogsPage,
    LogsFilter
  ],
  imports: [
    IonicPageModule.forChild(LogsPage),
    CustomPipesModule
  ],
  exports: [
    LogsPage,
    LogsFilter
  ],
  entryComponents:[
    LogsPage,
    LogsFilter
  ]
})
export class LogsModule {}
