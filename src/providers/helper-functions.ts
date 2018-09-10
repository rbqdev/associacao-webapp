import { Injectable } from '@angular/core';
import { ApiFunctions } from './api-functions';
import {
    ActionSheetController,
    AlertController,
    Events,
    LoadingController,
    PopoverController,
    ToastController,
    ModalController
} from 'ionic-angular';

@Injectable()
export class HelperFunctions {

    constructor(
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        public popoverCtrl: PopoverController,
        public actionSheetCtrl: ActionSheetController,
        public events: Events,
        public api: ApiFunctions,
        public modalCtrl: ModalController
    ){}

    // FUNÇÕES DO IONIC
    // ---------------------------
    mostra_toast( mensagem: string, pos: string = 'bottom', duracao?: number, toastClass?: string ){
        return this.toastCtrl.create({
            message: mensagem,
            position: pos,
            duration: duracao,
            cssClass: toastClass
        });
    }

    mostra_loader( mensagem: string, duracao?: number ){
        return this.loadingCtrl.create({
            content: mensagem
        });
    }

    mostra_alert( title: string, subtitle: string, callbackFunction?: any ){

        if( !callbackFunction ){
            return this.alertCtrl.create({
                title: title,
                subTitle: subtitle,
                buttons: [
                    {
                        text: 'Ok',
                    }
                ]
            });
        } else {

            return this.alertCtrl.create({
                title: title,
                subTitle: subtitle,
                buttons: [
                    {
                        text: 'Cancelar'
                    },
                    {
                        text: 'Ok',
                        handler: data => {
                            callbackFunction();
                        }
                    }
                ]
            });

        }
    }
    /** 
     * Something
    */
    mostra_alert_prompt( title: string, subtitle: string = null, inputs: any, buttonOk: any = 'Salvar', callbackFunction: any ) {

        return this.alertCtrl.create({
            title: title,
            subTitle: subtitle,
            inputs: [
                {
                    name: inputs.name,
                    placeholder: inputs.placeholder,
                    value: inputs.value
                }
            ],
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: buttonOk,
                    role: buttonOk.toLowerCase(),
                    handler: data => {
                        callbackFunction( data );
                    }
                }
            ]
        });

    }

    mostra_popover( page: any, data?: any, classPopover?: string ) {
        return this.popoverCtrl.create( page, { data }, {cssClass: classPopover+'-popover'} );
    }

    mostra_actionsheet( title: string, buttonsArray?: any ) {
        return this.actionSheetCtrl.create({
            title: title,
            buttons: buttonsArray
        });
    }

    // FUNÇÕES DE STRING
    // -------------------------------
	string_minuscula( value: any ){
		let newValue: string;
        return newValue = value.toLowerCase();
	}
	remove_hifen( string ){
		let newValue: string;
		let re = /-/gi;
		newValue = string.replace( re, " " );
		return newValue;
	}
    remove_underline( string ){
		let newValue: string;
		let re = /_/gi;
		newValue = string.replace( re, " " );
		return newValue;
    }
    gerar_senha_aleatoria( tamanhoString: number ) {
        let senha = '';
        let charset = "abcdefghijklmnopqrstuvwxyz0123456789";
        for( var i = 0; i < tamanhoString; i++ )
            senha += charset.charAt(Math.floor(Math.random() * charset.length));

        return senha;
    }
    trimLastCharacter( data: any, limit: number ) {
        // Determine de max length to trim the extra character
        if ( data.length > limit ) {
            data = data.slice(0, data.length - 1);
        }
        return data;
    }


    // FUNÇÕES DE DATA
    // ------------------------------
    get_data_atual(){
        let meses = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
        let data = new Date();

        let retorno = {
            ano: data.getFullYear().toString(),
            mes: meses[data.getMonth()].toLocaleLowerCase(),
            dia: data.toLocaleString(),
            timestamp: data.getTime()
        }
        return retorno;
    }

    get_dia_atual( somente_dia: boolean = false ){

        let data;
        data = new Date();

        let data_completa = data.getUTCFullYear() + '-' +
        ('00' + (data.getUTCMonth() + 1)).slice(-2) + '-' +
        ('00' + data.getUTCDate()).slice(-2) + ' ' +
        ('00' + data.getUTCHours()).slice(-2) + ':' +
        ('00' + data.getUTCMinutes()).slice(-2) + ':' +
        ('00' + data.getUTCSeconds()).slice(-2);

        if( !somente_dia )
            return data_completa;

        return data.getUTCFullYear() + '-' +
        ('00' + (data.getUTCMonth() + 1)).slice(-2) + '-' +
        ('00' + data.getUTCDate()).slice(-2);


    }

    parse_date_app( data: any ){
        let newData = data.split('-');
        newData[1] = ( newData[1].length === 1 ) ? '0'+newData[1] : newData[1];
        newData[2] = newData[2].substring(0, 2);
        data = newData[0] + '-' + newData[1] + '-' + newData[2];

        return data;
    }

    parse_date_banco( data: any ){

        // Se caso houver quantidade acima do normal de caracteres
        if( data.length >= 19 ){
            let newData = data.split(' ');
            data = newData[1];
        }

        let localeString = new Date();
        data = data +' '+ localeString.toLocaleTimeString();

        return data;
    }


    // Funçoes de imagens
    // -------------------------------
    processa_size_fotos( data: any, isArray: boolean = true ){

        if( isArray ){
            data.forEach( element => {
                if( element.foto !== '' && element.foto !== false ){
                    element.foto_thumb = this.parse_thumb_imagem( element.foto, 'thumb' );
                    element.foto_media = this.parse_thumb_imagem( element.foto );
                }
            });
        } else {
            if( data.foto !== '' && data.foto !== false ){
                data.foto_thumb = this.parse_thumb_imagem( data.foto, 'thumb' );
                data.foto_media = this.parse_thumb_imagem( data.foto );
            }
        }

        return data;

    }
    parse_thumb_imagem( url_imagem: string, tamanho_imagem?: string ){
        if( url_imagem !== null && url_imagem !== undefined && ( url_imagem.indexOf('.jpg') !== -1 || url_imagem.indexOf('.png') ) ) {
            let extensao = (url_imagem.indexOf('.jpg') !== -1) ? '.jpg' : '.png';
            let newExtensao = (tamanho_imagem === 'thumb') ? '-150x150'+extensao : '-600x600'+extensao;

            let thumb = url_imagem.replace( extensao, newExtensao );

            return thumb;
        }

    }
    console_imagem_helper( id_input: any, callback ) {

        this.getImagem( id_input, imagem => {

            if( imagem ) {

                callback( imagem.src );

            } else {

                let alertSucesso = this.mostra_alert( 'Imagem inválida', 'Envie uma imagem JPG ou PNG, com até 2MB' );
                alertSucesso.present();

            }

        });

    }

    getImagem( id_input: any, callback ) {
        var imagem = document.getElementById( id_input );

        if ((<HTMLInputElement> imagem).files && (<HTMLInputElement> imagem).files[0]) {

            var filesize = (((<HTMLInputElement> imagem).files[0].size/1024)/1024).toFixed(4);

            if( Number ( filesize ) < 2 ) {

                var reader = new FileReader();

                reader.onload = function (e) {

                    var image = new Image();
                    image.src = e.target['result'];

                    image.onload = function() {
                        callback( { src: e.target['result'] } );
                    };
                }

                reader.readAsDataURL((<HTMLInputElement> imagem).files[0]);

            } else {

                let alertError = this.mostra_alert( 'Imagem muito grande', 'Envie uma imagem JPG ou PNG, com até 2MB' );
                alertError.present();

            }
        }

    }

}