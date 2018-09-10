import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { Global } from './../../../providers/global';

@Component({
  selector: 'page-logs-filter',
  templateUrl: 'logs-filter.html'
})
export class LogsFilter {

    private filters: any = {
        acao:[
            {
                title: 'Nenhum Filtro',
                slug: 'todos'
            },
            {
                title: 'Adição',
                slug: 'adicao'
            },
            {
                title: 'Edição',
                slug: 'edicao'
            },
            {
                title: 'Remoção',
                slug: 'remocao'
            }
        ],
        objeto:[
            {
                title: 'Nenhum Filtro',
                slug: 'todos'
            },
            {
                title: 'Associado',
                slug: 'associado'
            },
            {
                title: 'Motorista',
                slug: 'motorista'
            },
            {
                title: 'Onibus',
                slug: 'onibus'
            }
        ]
    };

    private logs_filtros_html_selecionados: any = {
        acao: 'todos',
        objeto: 'todos'
    }
    private logs_filtros_selecionados: any = {
        acao: '',
        objeto:   ''
    };

    constructor(
        public navParams: NavParams,
        public viewCtrl: ViewController,
        public global: Global
    ){
        let filtroSelect = this.global.get('logs-filtros_html_selecionados');
        if( filtroSelect && typeof filtroSelect !== undefined ){
            this.logs_filtros_html_selecionados = filtroSelect;
            if( typeof this.global.get('log-filtro_html_single') !== undefined ){
                this.global.get('log-filtro_html_single', key => {
                    this.logs_filtros_html_selecionados[key] = 'todos';
                });
            }
        }
    }

    setFiltro(){

        this.filters.acao.forEach(element => {
            if( element.slug === this.logs_filtros_html_selecionados.acao && this.logs_filtros_html_selecionados.acao !== 'todos' ){
                this.logs_filtros_html_selecionados.acao = element.slug;
                this.logs_filtros_selecionados.acao = element.slug;
            }
        });
        this.filters.objeto.forEach(element => {
            if( element.slug === this.logs_filtros_html_selecionados.objeto && this.logs_filtros_html_selecionados.objeto !== 'todos' ){
                this.logs_filtros_html_selecionados.objeto = element.slug;
                this.logs_filtros_selecionados.objeto = element.slug;
            }
        });

        this.global.set('logs-filtros_html_selecionados', this.logs_filtros_html_selecionados, callBack => {
            if( callBack ) {
                this.global.set('logs-filtros_selecionados', this.logs_filtros_selecionados, dismiss => {
                    this.modal_dismiss(dismiss);
                });
            }
        });

    }

    resetFiltros() {
        this.logs_filtros_selecionados = {
            acao: '',
            objeto:   ''
        };
        this.logs_filtros_html_selecionados.acao = 'todos';
        this.logs_filtros_html_selecionados.objeto = 'todos';
    }

    modal_dismiss(data?: any) {
        this.viewCtrl.dismiss(data);
    }

}
