import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {PokemonService} from '../shared/pokemon.service';
import {Pokemon} from '../shared/pokemon.model';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-pokemon-detail',
  templateUrl: './pokemon-detail.component.html',
  styleUrls: ['./pokemon-detail.component.scss']
})
export class PokemonDetailComponent implements OnInit, OnDestroy {
  pokemonId;
  pokemon;

  pokemonImageUrl;
  heightInMetres;
  heightInFeetInches;
  weightInKgs;
  weightInPounds;
  pokemonStats;
  maxPokemonStats = [];
  minPokemonStats = [];
  statsToShow = [];
  maxStat;
  maxMaxStat;
  maxMinStat;
  selectedStat = 'base';
  stats: string[] = ['0%', '0%', '0%', '0%', '0%', '0%'];
  imageLoading = true;
  abilities = [];
  abilitySelected = 0;
  allAbilitiesReceived = false;

  pokemonForms = [];
  formattedFormNames = [];
  selectedFormNo = 0;
  varietiesReversed = false; // For Magearna

  constructor(private activatedRoute: ActivatedRoute,
              private pokemonService: PokemonService) {
  }

  ngOnInit(): void {
    // Initialization Logic after Pokemon Fetching in Both If and Else Conditions
    this.activatedRoute.params.subscribe(
      (params) => {
        this.pokemonId = params['id'];
      }
    );
    // From List
    if (this.pokemonService.pokemons[0]) {
      const pokemonFromList = this.pokemonService.pokemons[this.pokemonId - 1];
      this.pokemon = new Pokemon(
        pokemonFromList.name,
        pokemonFromList.id,
        pokemonFromList.sprite,
        pokemonFromList.types,
        pokemonFromList.abilities,
        pokemonFromList.height,
        pokemonFromList.weight,
        pokemonFromList.baseExperience,
        pokemonFromList.forms,
        pokemonFromList.heldItems,
        pokemonFromList.gameIndices,
        pokemonFromList.is_default,
        pokemonFromList.location,
        pokemonFromList.moves,
        pokemonFromList.order,
        pokemonFromList.stats,
        pokemonFromList.species,
        pokemonFromList.speciesDetails,
        pokemonFromList.color,
        pokemonFromList.genera,
        pokemonFromList.varieties
      );
      this.pokemonService.getPokemonSpeciesById(this.pokemonId).subscribe(
        response => {
          this.pokemon.speciesDetails = response;
          this.pokemon.color = response['color']['name'];
          this.pokemonService.activePokemon.next(this.pokemon);
          this.pokemon.genera = response['genera'];
          this.pokemon.varieties = response['varieties'];
          this.requestForms();
          this.formatFormNames();
          // Store as first form in array
          this.pokemonForms.push(new Pokemon(
            this.pokemon.name,
            this.pokemon.id,
            this.pokemon.sprite,
            this.pokemon.types,
            this.pokemon.abilities,
            this.pokemon.height,
            this.pokemon.weight,
            this.pokemon.baseExperience,
            this.pokemon.forms,
            this.pokemon.heldItems,
            this.pokemon.gameIndices,
            this.pokemon.is_default,
            this.pokemon.location,
            this.pokemon.moves,
            this.pokemon.order,
            this.pokemon.stats,
            this.pokemon.species,
            this.pokemon.speciesDetails,
            this.pokemon.color,
            this.pokemon.genera,
            this.pokemon.varieties
          ));
        }
      );
      this.initializePokemonFields();
      // Directly From Link
    } else {
      forkJoin([this.pokemonService.getPokemonById(this.pokemonId),
        this.pokemonService.getPokemonSpeciesById(this.pokemonId)]).subscribe(
        results => {
          this.pokemon = new Pokemon(
            results[0]['name'],
            results[0]['id'],
            results[0]['sprites'],
            results[0]['types'].reverse(),
            results[0]['abilities'].reverse(),
            results[0]['height'],
            results[0]['weight'],
            results[0]['base_experience'],
            results[0]['forms'],
            results[0]['held_items'],
            results[0]['game_indices'],
            results[0]['is_default'],
            results[0]['location'],
            results[0]['moves'],
            results[0]['order'],
            results[0]['stats'],
            results[0]['species'],
            results[1],
            results[1]['color']['name'],
            results[1]['genera'],
            results[1]['varieties']
          );
          this.pokemon.speciesDetails = results[1];
          this.pokemon.genera = results[1]['genera'];
          this.pokemon.color = results[1]['color']['name'];
          // Why do i need this ???????????????????
          this.pokemonService.activePokemon.next(this.pokemon);
          // Store as first form in array
          this.pokemonForms.push(new Pokemon(
            this.pokemon.name,
            this.pokemon.id,
            this.pokemon.sprite,
            this.pokemon.types,
            this.pokemon.abilities,
            this.pokemon.height,
            this.pokemon.weight,
            this.pokemon.baseExperience,
            this.pokemon.forms,
            this.pokemon.heldItems,
            this.pokemon.gameIndices,
            this.pokemon.is_default,
            this.pokemon.location,
            this.pokemon.moves,
            this.pokemon.order,
            this.pokemon.stats,
            this.pokemon.species,
            this.pokemon.speciesDetails,
            this.pokemon.color,
            this.pokemon.genera,
            this.pokemon.varieties
          ));
          this.initializePokemonFields();
          this.requestForms();
          this.formatFormNames();
        }
      );
    }
  }

  initializePokemonFields() {
    this.requestAbilityDetails();
    // Conditionally Add HQ or Normal Images
    // if (this.pokemon.id > 151) {
    //   // Normal
    //   this.pokemonImageUrl = 'https://raw.githubusercontent.com/HybridShivam/pokemon.json/master/images/' +
    //     this.pad(this.pokemon.id, 3) + '.png';
    // } else {
    // HD
    if (this.pokemon.is_default) {
      this.pokemonImageUrl = 'https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/images/' +
        this.pad(this.pokemon.id, 3) + '.png';
    }
    // }
    this.heightInMetres = (this.pokemon.height * 0.1).toFixed(1);
    this.heightInFeetInches = Math.floor(this.heightInMetres * 3.2808) + '"' + Math.round(((this.heightInMetres * 3.2808) % 1) * 12) + '\'';
    this.weightInKgs = (this.pokemon.weight * 0.1).toFixed(1);
    this.weightInPounds = (this.weightInKgs * 2.205).toFixed(1);
    this.pokemonStats = [
      this.pokemon.stats[5]['base_stat'],
      this.pokemon.stats[4]['base_stat'],
      this.pokemon.stats[3]['base_stat'],
      this.pokemon.stats[2]['base_stat'],
      this.pokemon.stats[1]['base_stat'],
      this.pokemon.stats[0]['base_stat']
    ];
    this.maxStat = Math.max(...this.pokemonStats);
    setTimeout(() => {
      this.calculateStats();
    }, 500);
  }

  pad(number, length) {
    let str = '' + number;
    while (str.length < length) {
      str = '0' + str;
    }
    return str;
  }

  imagePreload() {
    this.imageLoading = false;
  }

  calculateStats() {
    for (let i = 0; i < 6; i++) {
      let calculatedStat = this.pokemonStats[i] / this.maxStat * 100;
      if (calculatedStat > 10) {
        this.stats[i] = calculatedStat + '%';
      } else {
        calculatedStat = 10;
        this.stats[i] = calculatedStat + '%';
      }
    }
    this.statsToShow = this.pokemonStats;
    this.calculateMinStats();
    this.calculateMaxStats();
  }

  calculateMaxStats() {
    this.maxPokemonStats[0] = Math.floor((2 * this.pokemonStats[0] + 31 + 63) * 100 / 100 + 100 + 10);
    for (let i = 1; i < 6; i++) {
      this.maxPokemonStats[i] = Math.floor(Math.floor((2 * this.pokemonStats[i] + 31 + 63) * 100 / 100 + 5) * 1.1);
    }
    this.maxMaxStat = Math.max(...this.maxPokemonStats);
  }

  calculateMinStats() {
    this.minPokemonStats[0] = Math.floor((2 * this.pokemonStats[0]) * 100 / 100 + 100 + 10);
    for (let i = 1; i < 6; i++) {
      this.minPokemonStats[i] = Math.floor(Math.floor((2 * this.pokemonStats[i]) * 100 / 100 + 5) * 0.9);
    }
    this.maxMinStat = Math.max(...this.minPokemonStats);
  }

  showStats(type: string) {
    let stats;
    let maxStat;
    switch (type) {
      case 'base': {
        stats = this.pokemonStats;
        maxStat = this.maxStat;
        this.statsToShow = this.pokemonStats;
        this.selectedStat = 'base';
        break;
      }
      case 'max': {
        stats = this.maxPokemonStats;
        maxStat = this.maxMaxStat;
        this.statsToShow = this.maxPokemonStats;
        this.selectedStat = 'max';
        break;
      }
      case 'min': {
        stats = this.minPokemonStats;
        maxStat = this.maxMinStat;
        this.statsToShow = this.minPokemonStats;
        this.selectedStat = 'min';
      }
    }
    for (let i = 0; i < 6; i++) {
      let calculatedStat = stats[i] / maxStat * 100;
      if (calculatedStat > 15) {
        this.stats[i] = calculatedStat + '%';
      } else {
        calculatedStat = 15;
        this.stats[i] = calculatedStat + '%';
      }
    }
  }

  requestAbilityDetails() {
    const requests = [];
    for (const ability of this.pokemon.abilities) {
      requests.push(this.pokemonService.getAbility(ability['ability']['url']));
    }
    forkJoin(...requests).subscribe(
      (responses) => {
        for (let i = 0; i < responses.length; i++) {
          this.abilities[i] = responses[i];
        }
        this.allAbilitiesReceived = true;
      });
  }

  abilitySelect(no: number) {
    this.abilitySelected = no;
  }

  totalBaseStats() {
    return (this.pokemonStats[0] + this.pokemonStats[1] + this.pokemonStats[2] + this.pokemonStats[3]
      + this.pokemonStats[4] + this.pokemonStats[5]);
  }

  formatFormNames() {
    for (let i = 0; i < this.pokemon.varieties.length; i++) {
      var formattedName;
      var name = this.pokemon.varieties[i]['pokemon']['name'];
      if (this.pokemon.id !== 774) { // excluding Minior
        if (name.indexOf('-totem') !== -1 || name.indexOf('-battle-bond') !== -1) {
          continue;
        } else if (name.indexOf('-mega') !== -1 || name.indexOf('-primal') !== -1 || name === 'greninja-ash') {
          const re = '(' + this.pokemon.species['name'] + ')[-]([a-z]*)';
          const regExp = new RegExp(re, 'g');
          formattedName = name.replace(regExp, '$2 $1');
          formattedName = formattedName.replace(/-/g, ' ');
        } else if (name.indexOf('-alola') !== -1 && this.pokemon.id !== 25) { // Excluding Alola-Cap Pikachu
          formattedName = 'Alolan ' + this.pokemon.species['name'];
        } else {
          const re = '(' + this.pokemon.species['name'] + ')[-]([a-z]*)';
          const regExp = new RegExp(re, 'g');
          formattedName = name.replace(regExp, '$2');
          if (this.pokemon.id !== 250) { // excluding Ho-Oh
            formattedName = formattedName.replace(/-/g, ' ');
          }
        }
      } else { // If minior
        if (name === 'minior-red') {
          formattedName = 'core';
        } else if (name === 'minior-red-meteor') {
          formattedName = 'meteor';
        } else {
          continue;
        }
      }
      this.formattedFormNames.push(formattedName);
    }
  }

  requestForms() {
    if (this.pokemon.id === 801 && !this.varietiesReversed) { // For magearna Reverse the varities
      this.pokemon.varieties.reverse();
      this.varietiesReversed = true;
    }
    const formRequests = [];
    if (this.pokemon.id !== 774) { // Skipping Minior
      for (const variety of this.pokemon.varieties.slice(1)) {
        if (variety['pokemon']['name'].indexOf('-totem') !== -1 || variety['pokemon']['name'] === 'greninja-battle-bond') {
          continue;
          // Skipping these forms
        }
        formRequests.push(this.pokemonService.getPokemonByURL(variety['pokemon']['url']));
      }
    } else {
      for (const variety of this.pokemon.varieties.slice(1)) {
        if (variety['pokemon']['name'] === 'minior-red' || variety['pokemon']['name'] === 'minior-red-meteor') {
          formRequests.push(this.pokemonService.getPokemonByURL(variety['pokemon']['url']));
        }
      }
    }
    forkJoin(formRequests).subscribe(
      results => {
        for (let i = 0; i < results.length; i++) {
          this.pokemonForms[i + 1] = new Pokemon(
            results[i]['name'],
            this.pokemon.id,
            results[i]['sprites'],
            results[i]['types'].reverse(),
            results[i]['abilities'].reverse(),
            results[i]['height'],
            results[i]['weight'],
            results[i]['base_experience'],
            results[i]['forms'],
            results[i]['held_items'],
            results[i]['game_indices'],
            results[i]['is_default'],
            results[i]['location'],
            results[i]['moves'],
            results[i]['order'],
            results[i]['stats'],
            results[i]['species'],
            this.pokemon.speciesDetails,
            this.pokemon.color,
            this.pokemon.genera,
            this.pokemon.varieties
          );
        }
        this.initializePokemonFields();
      }
    );
  }

  selectForm(i) {
    if (this.selectedFormNo === i) {
      return;
    }
    this.selectedFormNo = i;
    if (this.pokemonForms[i]['name'] === this.pokemon.species['name']) {
      this.pokemon.name = this.pokemon.species['name'];
    } else if (this.pokemonForms[i]['name'].indexOf('-mega') !== -1
      || this.pokemonForms[i]['name'].indexOf('-primal') !== -1
      || this.pokemonForms[i]['name'].indexOf('-alola') !== -1
      || this.pokemonForms[i]['name'] === 'greninja-ash'
      && this.pokemon.id !== 25) { // excluding Pikachu
      this.pokemon.name = this.formattedFormNames[i];
    } else {
      this.pokemon.name = this.pokemon.species['name'] + ' [' + this.formattedFormNames[i] + ']';
    }

    // this.pokemon.id = this.pokemonForms[i]['id'];
    this.pokemon.sprites = this.pokemonForms[i]['sprites'];
    this.pokemon.types = this.pokemonForms[i]['types'];
    this.pokemon.abilities = this.pokemonForms[i]['abilities'];
    this.pokemon.height = this.pokemonForms[i]['height'];
    this.pokemon.weight = this.pokemonForms[i]['weight'];
    this.pokemon.baseExperience = this.pokemonForms[i]['base_experience'];
    this.pokemon.forms = this.pokemonForms[i]['forms'];
    this.pokemon.heldItems = this.pokemonForms[i]['held_items'];
    this.pokemon.gameIndices = this.pokemonForms[i]['game_indices'];
    this.pokemon.is_default = this.pokemonForms[i]['is_default'];
    this.pokemon.location = this.pokemonForms[i]['location'];
    this.pokemon.moves = this.pokemonForms[i]['moves'];
    this.pokemon.order = this.pokemonForms[i]['order'];
    this.pokemon.stats = this.pokemonForms[i]['stats'];
    this.pokemon.species = this.pokemonForms[i]['species'];
    // For Non Default Forms Only
    if (!this.pokemon.is_default) {
      const re = '(' + this.pokemon.species['name'] + ')[-]([a-z]*)';
      const regExp = new RegExp(re, 'g');
      const str = this.pokemonForms[i]['name'].replace(regExp, '$2');
      this.pokemonImageUrl = 'https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/images/' +
        this.pad(this.pokemon.id, 3) + '-' + this.capitalizeSplitJoin(str, '-', '-') + '.png';
      console.log(this.pokemonImageUrl);
    }
    // For Default Forms and Initializing Fields
    this.initializePokemonFields();
  }

  capitalizeSplitJoin(str, split: string, join: string) {
    str = str.split(split);
    for (let i = 0, x = str.length; i < x; i++) {
      str[i] = str[i][0].toUpperCase() + str[i].substr(1);
    }
    return str.join(join);
  }


  ngOnDestroy() {
    this.pokemonService.activePokemon.next(null);
    this.pokemonService.previousPokemonID.next(this.pokemonId);
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('modal-open');
    const elements = document.getElementsByClassName('modal-backdrop');
    while (elements.length > 0) {
      elements[0].remove();
    }
    // this.pokemonService.searchItemSubject.next('');
  }
}
