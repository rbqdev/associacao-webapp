import { Pipe } from '@angular/core';

@Pipe({
	name: 'removeHifen'
})
export class RemoveHifenPipe {
	public transform(value: any) {
		let newValue: string;
        let re = /-/gi;
        newValue = value.replace( re, " " );
        return newValue;
	}
}