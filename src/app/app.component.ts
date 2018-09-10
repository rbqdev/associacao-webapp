import { Storage } from '@ionic/storage';
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LoginPage } from './../pages/login/login';
import { HomePage } from '../pages/home/home';
import { AssociadosPage } from './../pages/associados/associados';

import { ApiFunctions } from './../providers/api-functions';
import { HelperFunctions } from './../providers/helper-functions';
import { Global } from './../providers/global'; 

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  rootPage:any;
  currentPage: any;

  pagesPrincipais: Array<{ title?: string, component?: any, icon?: any }>;
  pagesPublicas: Array<{ title?: string, component?: any, icon?: any }>;
  pagesEstatisticas: Array<{ title?: string, component?: any, icon?: any }>;
  pagesConfiguracoes: Array<{ title?: string, component?: any, icon?: any }>;

  // Usuario Atual do Sistema
  usuario: any = {};
  first_letter: string = '';

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public modalCtrl: ModalController,
    private events: Events,
    private api: ApiFunctions,
    private helperCtrl: HelperFunctions,
    private storage: Storage,
    private global: Global
  ){

    // Recebe Usuario Logado no Sistema, quando o mesmo usa o formulario de login para entrar no sistema
    this.events.subscribe('usuario_logado-event', (usuario) => {
      if(usuario){

        // Inicia funçoes de sincronizacao de informacoes
        this.set_variaveis_global_carregamento( sucesso => {
          this.sincronizacoes_sistema();
        });

        this.usuario = usuario;
        this.first_letter = this.usuario.nome.charAt(0);
        this.global.set( 'usuario_atual', this.usuario );
      }
    });

    // Lazy Load Pages with ''
    this.pagesPrincipais = [
      { title: 'Inicio', component: HomePage, icon: 'home' },
      { title: 'Associados', component: AssociadosPage, icon: 'contacts' },
      { title: 'Motoristas', component: 'MotoristasPage', icon: 'contacts' }
    ];
    this.pagesPublicas = [
      { title: 'Onibus e Rotas', component: 'OnibusPage', icon: 'bus' }
      // { title: 'Prestacao de Contas', component: 'OnibusPage', icon: 'cash' }
    ];
    this.pagesEstatisticas = [
      { title: 'Comunicados Importantes', component: 'HomePage', icon: 'alert' },
      { title: 'Assembléias', component: 'OnibusPage', icon: 'clipboard' },
      { title: 'Votações', component: 'HomePage', icon: 'list' },
      { title: 'Relatórios', component: 'HomePage', icon: 'stats' }
    ];
    this.pagesConfiguracoes = [
      { title: 'Log de Usuários', component: 'LogsPage', icon: 'list-box' }
      // { title: 'Configurações', component: 'ConfigPage', icon: 'settings' }
    ];

    this.currentPage = this.pagesPrincipais[0];

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      // statusBar.styleDefault();
      // splashScreen.hide();

      // Verifica se já existe um token valido, se sim, leva o usuario diretamente para a 'HomePage'
      this.api.existeToken( sucesso => {

        let loader = this.helperCtrl.mostra_loader( 'Sincronizando...' );
        loader.present();

        this.storage.get('usuario_logado-storage').then(usuario => {

            if(usuario){

              // Inicia funçoes de sincronizacao de informacoes
              this.set_variaveis_global_carregamento( sucesso => {
                this.sincronizacoes_sistema();
              });

              this.usuario = usuario;
              this.global.set( 'usuario_atual', this.usuario );
              this.first_letter = this.usuario.nome.charAt(0);

              this.rootPage = HomePage; 
              loader.dismiss();

            } else {

              this.storage.remove('token');
              this.storage.remove('usuario_logado-storage');
              this.rootPage = LoginPage;
              loader.dismiss();

              let toast = this.helperCtrl.mostra_toast('Houve algum error com os dados do usuário, porfavor, faça o login novamente!', null, 2000, 'alert' );
              toast.present();

            }

        }, error => {

            loader.dismiss();
            this.storage.remove('token');
            this.storage.remove('usuario_logado-storage');
            this.rootPage = LoginPage;

            let toast = this.helperCtrl.mostra_toast('Não foi possivel autenticar o ultimo usuário, porfavor, faça o login novamente!', null, 2000, 'alert' );
            toast.present();

        });
      }, error => {

          this.rootPage = LoginPage;

      });

    });

  }

  openPage( page: any ){
    this.nav.setRoot(page.component);
    this.currentPage = page;
  }

  checaPaginaAtual( page: any ){
    return page === this.currentPage;
  }

  logout(){

    let loader = this.helperCtrl.mostra_loader( 'Saindo do sistema...' );
    loader.present();
    setTimeout(() => {
      this.api.logout( sucesso => {

        this.nav.setRoot(LoginPage);
        loader.dismiss();

      }, error => {
        console.log('error');
      });
    }, 1000);

  }

  /*
  * Variaveis Global de carregamentos das informacoes do banco de dados
  */
  set_variaveis_global_carregamento( successCallback ) {
    
    this.global.set( 'carregou_informacoes-gerais', false );
    this.global.set( 'carregou_informacoes-single', false );
    this.global.set( 'carregou_lista-geral', false );
    this.global.set( 'carregou_lista-single', false );

    successCallback( true );

  }

  /*
  * Sincroniza informaçoes do sistema
  */
  sincronizacoes_sistema( forcar_atualizar: boolean = false ){

      if( forcar_atualizar === true ||
        typeof this.global.get('informacoes-carregadas__cursos') === 'undefined' ||
        typeof this.global.get('informacoes-carregadas__onibus') === 'undefined' ||
        typeof this.global.get('carregar_novamente') === 'undefined' ||
        this.global.get('carregou_lista-geral') === false || 
        this.global.get('carregar_novamente') === true
      ){

        this.api.getAuth( '/sync/',
          result => {

            this.global.set( 'carregou_lista-geral', true );
            this.global.set( 'informacoes-carregadas__cursos', result.cursos );
            this.global.set( 'informacoes-carregadas__onibus', result.onibus );

            this.global.set( 'carregar_novamente', false );

          }, error => {

            let toast = this.helperCtrl.mostra_toast('Não foi possivel sincronizar os dados do sistema, tente novamente mais tarde!', null, 3000 );
            toast.present();

          }
        );

      }

  }


}
