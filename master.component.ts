import {Component, OnInit} from '@angular/core';
import {Hero} from '../models/Hero';
import {HeroService} from '../services/hero.service';
import {Router} from '@angular/router'
@Component({
	selector: 'hero-master',
	template: `
		<div *ngIf="!heroes">Fetching...</div>
		<grid-layout [propLayout]="layout">
			<test-grid></test-grid>
			<test-grid></test-grid>
			<test-grid></test-grid>
		</grid-layout>
	`,
	styles: [`
	  .selected {
	    background-color: #CFD8DC;
	    color: white;
	  }
	  .heroes {
	    margin: 0 0 2em 0;
	    list-style-type: none;
	    padding: 0;
	    width: 15em;
	  }
	  .heroes .text {
	    position: relative;
	    top: -3px;
	  }
	  .heroes .badge {
	    display: inline-block;
	    font-size: small;
	    color: white;
	    padding: 0.8em 0.7em 0 0.7em;
	    background-color: #607D8B;
	    line-height: 1em;
	    position: relative;
	    left: -1px;
	    top: -4px;
	    height: 1.8em;
	    margin-right: .8em;
	    border-radius: 4px 0 0 4px;
	  }
	`],
})
export class MasterComponent implements OnInit {
	heroes : Hero[];
	selectedHero : Hero;
	layout;
	constructor(private heroService: HeroService,
				private router: Router){

		this.layout = [
	      {i: 'a', x: 0, y: 0, w: 1, h: 2},
	      {i: 'b', x: 1, y: 0, w: 3, h: 2},
	      {i: 'c', x: 4, y: 0, w: 1, h: 2}
	    ];

	}
	ngOnInit(): void{
		this.getHeroes();
	}
	getHeroes(): void{
		this.heroService.getHeroes().then(heroes => this.heroes = heroes);
	}
	onSelect(hero): void{
		this.selectedHero = hero;
	}
	gotoDetail(){
		this.router.navigate(['detail',this.selectedHero.id]);
	}

}
