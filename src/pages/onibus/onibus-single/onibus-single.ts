import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { OnibusForm } from './../onibus-form/onibus-form';

@Component({
  selector: 'page-onibus-single',
  templateUrl: 'onibus-single.html',
})
export class OnibusSingle {

  onibus: any;

  segment_rota_2: string = 'ida';

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams ) {

      this.onibus = this.navParams.get('onibus');
      if(this.onibus.qtd_turnos === '1') this.segment_rota_2 = 'ida'; 

    }

  editar_onibus( onibus: any ) {
    this.navCtrl.push( OnibusForm, { requisicao: 'editar', onibus : this.onibus });
  }

}
