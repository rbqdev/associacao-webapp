import { Component } from '@angular/core';
import { MenuController, NavController, Events } from 'ionic-angular';
import { HomePage } from './../home/home';

import { Storage } from '@ionic/storage';
import { ApiFunctions } from './../../providers/api-functions';
import { HelperFunctions } from './../../providers/helper-functions';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  usuario = {
      username: '',
      password: ''
  };

  constructor(
    private navController: NavController,
    private menuCtrl: MenuController,
    private events: Events,
    private storage: Storage,
    private api: ApiFunctions,
    private helperCtrl: HelperFunctions,
  ){

    // Esconde o Menu na Pagina de Login
    this.menuCtrl.enable(false);

  }

  ionViewWillLeave() {
    // Habilita o menu ao sair da pagina de Login
    this.menuCtrl.enable(true);
  }

  public login() {

    let loader = this.helperCtrl.mostra_loader( 'Logando, aguarde...' );
    loader.present();
    
    // Verifica se os campos estao vazios
    if( this.usuario.username === '' || this.usuario.password === '' ) {
        
        loader.dismiss();

        let toast = this.helperCtrl.mostra_toast('Por favor, preencha todos os campos!', null, 2000 );
        toast.present();

        return;

    } else {

        this.api.login(
          this.usuario,
          usuario_logado => {

            loader.dismiss();
            this.storage.set('token', usuario_logado.token).then((data) => {

                let loader = this.helperCtrl.mostra_loader( 'Autenticando usuário...' );
                loader.present();

                this.api.getAuth( '/usuario/auth/',
                  usuario_logado => {

                    // Se for TRUE para as duas condições
                    if( usuario_logado ){

                      if( usuario_logado.tipo === 'administrator' || usuario_logado.admin ){

                          this.storage.set('usuario_logado-storage', usuario_logado).then((data)=>{

                            this.events.publish('usuario_logado-event', usuario_logado);

                            loader.dismiss();
                            this.navController.setRoot(HomePage);

                            let toast = this.helperCtrl.mostra_toast('Login efetuado com sucesso!', null, 3000, 'success' );
                            toast.present();

                            return false;

                         });

                      } else {

                        loader.dismiss();
                        let toast = this.helperCtrl.mostra_toast('O usuário informado não tem permissão para acessar o sistema!', null, 3000 );
                        toast.present();

                        return false;

                      }

                    } else {

                      loader.dismiss();
                      let toast = this.helperCtrl.mostra_toast('O usuário informado não tem permissão para acessar o sistema!', null, 3000 );
                      toast.present();
                      
                      return false;

                    }
                    
                  }, error => {

                    loader.dismiss();
                    let toast = this.helperCtrl.mostra_toast('O usuário informado não tem permissão para acessar o sistema!', null, 3000 );
                    toast.present();
                    return false;

                });
  
            });

        }, error => {

          loader.dismiss();
          
          let errorMessage = error.json();
          if (errorMessage && errorMessage.message) {
            let toast = this.helperCtrl.mostra_toast('Usuário ou senha inválida!', null, 3000 );
            toast.present();
          }

        });

    }

  }


}
