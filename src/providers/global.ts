import { Events } from 'ionic-angular';
import { Injectable } from '@angular/core';

@Injectable()
export class Global {

    public var: any[] = [];

    constructor(
        private events: Events
    ){}

    set ( key, val, callback = null ) {

        this.var[key] = val;

        if( callback ) callback( true );

        return true;
    }

    get ( key, callback = null ) {

        if( callback ) callback( this.var[key] );

        return this.var[key];
    }

    delete ( key, callback = null ) {

        if( callback ) callback( delete this.var[key] );

        delete this.var[key];

    }

    subscribe ( key, callback = null ) {

        if( callback ) callback( this.var[key] );

        this.events.subscribe( key, (data)=>{
            callback( this.var[key] );
        });

    }

    publish ( key, val ) {

        this.var[key] = val;

        this.events.publish( key, val );

        return true;
    }

    event ( key ) {

        this.events.publish( key, this.get( key ) );

    }

}