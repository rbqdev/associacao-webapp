import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Http, RequestOptions, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

@Injectable()
export class ApiFunctions {

	// private urlBase = 'http://localhost:8888/aeesp/api';
	private urlBase = 'https://api.aeesp-pocoes.com.br/api';
	private versao = '/v1';

	constructor( private http: Http, public storage: Storage ) {}

	public getToken( successCallBack, errorCallBack ) {

		this.storage.get('token').then((token) => {
			successCallBack ( token );
   		}, error => {
			errorCallBack ( error );
		});

  	}

	public existeToken( successCallBack, errorCallBack ) {

		this.getToken( (token)=>{

			let url = this.urlBase + '/jwt-auth/v1/token/validate';
			let headers = new Headers({ 'Authorization': 'Bearer ' + token });
			let options = new RequestOptions({ headers: headers });

			this.http.post( url, null, options ).map(res => res.json()).subscribe( result  => {
				successCallBack( result );
			}, error => {
				errorCallBack( error );
			});

		}, ( error )=>{
			errorCallBack( false );
		});


	}

	public login( data: any, successCallBack, errorCallBack ) {

		let url = this.urlBase + '/jwt-auth/v1/token/';
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers: headers });

		this.http.post( url, data, options ).map(res => res.json()).subscribe( result  => {
			successCallBack( result );
		}, error => {
			errorCallBack( error );
		});

	}

	public logout( successCallBack, errorCallBack ){

		if( this.storage.get('token') && this.storage.get('usuario_logado-storage') ){
			this.storage.remove('token');
    		this.storage.remove('usuario_logado-storage').then((token) => {
				successCallBack ( true );
			}, error => {
				errorCallBack ( false );
			});
		}

	}

	public get( url_endpoint: string, successCallBack, errorCallBack ) {

		let url = this.urlBase + this.versao + url_endpoint;
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers: headers });

		this.http.get( url, options ).map(res => res.json()).subscribe( result  => {
			successCallBack( result );
		}, error => {
			errorCallBack( error );
		});

	}

	public getAuth( url_endpoint: string, successCallBack, errorCallBack ) {

		this.getToken( (token)=>{

			let url = this.urlBase + this.versao + url_endpoint;
			let headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
			});
			let options = new RequestOptions({ headers: headers });

			this.http.get( url, options ).map(res => res.json()).subscribe( usuario  => {
				successCallBack( usuario );
			}, error => {
				errorCallBack( error );
			});

		}, ( error )=>{
			errorCallBack( false );
		});
	}

	public post( url_endpoint: string, data: any, successCallBack, errorCallBack ){

		let url = this.urlBase + this.versao + url_endpoint;
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers: headers });

		this.http.post( url, JSON.stringify(data), options ).map(res => res.json()).subscribe( result  => {
			successCallBack( result );
		}, error => {
			errorCallBack( error );
		});

	}

	public postAuth( url_endpoint: string, data: any, successCallBack, errorCallBack ){

		this.getToken( (token)=>{

			let url = this.urlBase + this.versao + url_endpoint;
			let headers = new Headers({
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
			});
			let options = new RequestOptions({ headers: headers });

			this.http.post( url, JSON.stringify(data), options ).map(res => res.json()).subscribe( result  => {
				successCallBack( result );
			}, error => {
				errorCallBack( error );
			});

		}, ( error )=>{

			errorCallBack( false );

		});

	}

	public formataInformacoesLog( data: any, usuario_atual: any, objeto?: any, objeto_desc?: any, objeto_nome?: any ){

		data['id_autor'] = usuario_atual.id;
		data['nome_autor'] = usuario_atual.nome;
		data['objeto'] = ( objeto ) ? objeto : '';
		data['objeto_desc'] = ( objeto_desc ) ? objeto_desc : '';
		data['objeto_nome'] = ( objeto_nome ) ? objeto_nome : '';
		data['cargo'] = usuario_atual.cargo;

		return data;

	}

}