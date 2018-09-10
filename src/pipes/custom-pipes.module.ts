import { NgModule } from '@angular/core';
import { RemoveHifenPipe } from './remove-hifen';

@NgModule({
    imports: [
    ],
    declarations: [
        RemoveHifenPipe
    ],
    exports: [
        RemoveHifenPipe
    ]
})
export class CustomPipesModule {}