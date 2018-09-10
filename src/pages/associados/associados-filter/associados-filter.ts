
import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { Global } from './../../../providers/global';

@Component({
  selector: 'page-associados-filter',
  templateUrl: 'associados-filter.html'
})
export class AssociadosFilter {

    private filters: any = {
        status:[
            {
                title: 'Nenhum Filtro',
                slug: 'todos'
            },
            {
                title: 'Regular',
                slug: 'regular'
            },
            {
                title: 'Pendente',
                slug: 'pendente'
            },
            {
                title: 'Inadimplente',
                slug: 'inadimplente'
            },
            {
                title: 'Em Negociação',
                slug: 'negociacao'
            },
            {
                title: 'Isento',
                slug: 'isento'
            },
            {
                title: 'Desassociado',
                slug: 'desassociado'
            }
        ],
        turno:[
            {
                title: 'Nenhum Filtro',
                slug: 'todos'
            },
            {
                title: 'Matutino',
                slug: 'matutino'
            },
            {
                title: 'Vespertino',
                slug: 'vespertino'
            },
            {
                title: 'Noturno',
                slug: 'noturno'
            }
        ],
        inst:[
            {
                title: 'Nenhum Filtro',
                slug: 'todos'
            },
            {
                title: 'FAINOR',
                slug: 'fainor'
            },
            {
                title: 'FTC',
                slug: 'ftc'
            },
            {
                title: 'IFBA',
                slug: 'ifba'
            },
            {
                title: 'Mauricio de Nassau',
                slug: 'mauricio-de-nassau'
            },
            {
                title: 'Santo Agostinho',
                slug: 'santo-agostinho'
            },
            {
                title: 'UESB',
                slug: 'uesb'
            },
            {
                title: 'UFBA',
                slug: 'ufba'
            }
        ],
        curso:[
            {
                title: 'Nenhum Filtro',
                slug: 'todos',
                id: ''
            }
        ]
    };

    private filtros_html_selecionados: any = {
        status: 'todos',
        inst:   'todos',
        turno:  'todos',
        curso:  'todos'
    }
    private filtros_selecionados: any = {
        status: '',
        inst:   '',
        turno:  '',
        curso_id:  ''
    };

    constructor(
        public navParams: NavParams,
        public viewCtrl: ViewController,
        public global: Global
    ){

        let cursos = this.global.get('informacoes-carregadas__cursos');
        for( let j = 0; j < cursos.length; j++ ){
            let element = {
                title: cursos[j].title,
                slug: cursos[j].slug,
                id: cursos[j].id
            };
            this.filters.curso.push(element);
        }

        let filtroSelect = this.global.get('filtros_html_selecionados');
        if( filtroSelect && typeof filtroSelect !== undefined ){
            this.filtros_html_selecionados = filtroSelect;
            if( typeof this.global.get('filtro_html_single') !== undefined ){
                this.global.get('filtro_html_single', key => {
                    this.filtros_html_selecionados[key] = 'todos';
                });
            }
        }

    }

    setFiltro(){

        this.filters.status.forEach(element => {
            if( element.slug === this.filtros_html_selecionados.status && this.filtros_html_selecionados.status !== 'todos' ){
                this.filtros_html_selecionados.status = element.slug;
                this.filtros_selecionados.status = element.slug;
            }
        });
        this.filters.turno.forEach(element => {
            if( element.slug === this.filtros_html_selecionados.turno && this.filtros_html_selecionados.turno !== 'todos' ){
                this.filtros_html_selecionados.turno = element.slug;
                this.filtros_selecionados.turno = element.slug;
            }
        });
        this.filters.inst.forEach(element => {
            if( element.slug === this.filtros_html_selecionados.inst && this.filtros_html_selecionados.inst !== 'todos' ){
                this.filtros_html_selecionados.inst = element.slug;
                this.filtros_selecionados.inst = element.slug;
            }
        });
        this.filters.curso.forEach(element => {
            if( element.slug === this.filtros_html_selecionados.curso && this.filtros_html_selecionados.curso !== 'todos' ){
                this.filtros_html_selecionados.curso = element.slug;
                this.filtros_selecionados.curso_id = element.id;
            }
        });

        this.global.set('filtros_html_selecionados', this.filtros_html_selecionados);
        this.global.set('filtros_selecionados', this.filtros_selecionados);
        this.modal_dismiss(true);

    }

    resetFiltros() {
        this.filtros_selecionados = {
            status: '',
            inst:   '',
            turno:  '',
            curso_id:  ''
        };
        this.filtros_html_selecionados.status = 'todos';
        this.filtros_html_selecionados.turno = 'todos';
        this.filtros_html_selecionados.inst = 'todos';
        this.filtros_html_selecionados.curso = 'todos';
    }

    modal_dismiss(data?: any) {
        this.viewCtrl.dismiss(data);
    }

}
