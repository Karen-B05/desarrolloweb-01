// ------ Funciones del Pokedex ------
(() => {
  'use strict';

  // Consumir API Pokemon
  const API = "https://pokeapi.co/api/v2";
  const PAGE_LIMIT=24;

  let offset=0;

  let currentQuery="";
  let currentType="";
  let currentSort="id-asc";

  // Referencias al DOM
  const els = {
    results:document.getElementById("results"),
    form:document.getElementById("controlsForm"),
    q:document.getElementById("q"),
    typeFilter:document.getElementById("typeFilter"),
    sortBy:document.getElementById("sortBy"),
    loadMore:document.getElementById("loadMore"),
    tpl:document.getElementById("pokemon-card-template")
  };

  // Iniciar
  init();
  bindUI();

  async function init(){
    await loadTypes();
    loadPage();
  }

  // Eventos UI
  function bindUI(){
    els.form.addEventListener("submit",e=>{
      e.preventDefault();

      currentQuery=els.q.value.trim().toLowerCase();
      currentType=els.typeFilter.value;
      currentSort=els.sortBy.value;

      offset=0;
      clearGrid();
      loadPage();
    });
    els.loadMore.addEventListener("click",()=>{loadPage();});
  }

  // Cargar por tipo
  async function fetchByType(type){
    const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    const data = await res.json();
    const pokemonNames = data.pokemon.map(p => p.pokemon.name);
    const details = await Promise.all(pokemonNames.map(n => fetchPokemon(n)));

    return details;
  }

  // Cargar pagina
  async function loadPage(){
    let pokemons=[];

    if (currentQuery) {
      const p = await fetchPokemon(currentQuery);
      if (p) pokemons = [p];
    }
    else if (currentType) {
      pokemons = await fetchByType(currentType);
      els.loadMore.style.display = "none";
    }
    else {
      pokemons = await fetchList(offset, PAGE_LIMIT);
      offset += PAGE_LIMIT;
      els.loadMore.style.display = "inline";
    }

    pokemons = sortPokemons(pokemons, currentSort);
    renderCards(pokemons);
  }

  // Cargar lista
  async function fetchList(offset,limit){
    const res = await fetch(`${API}/pokemon?limit=${limit}&offset=${offset}`);
    const data = await res.json();
    const names = data.results.map(p => p.name);
    const details = await Promise.all(names.map(n => fetchPokemon(n)));

    return details;
  }

  // Cargar detalles
  async function fetchPokemon(name){
    try{
      const res=await fetch(`${API}/pokemon/${name}`);
      return await res.json();
    }catch{
      return null;
    }
  }

  // Tipos
  async function loadTypes(){
    const res=await fetch(`${API}/type`);
    const data=await res.json();
    data.results.forEach(t=>{
      if(t.name==="unknown"||t.name==="shadow") return;
      const opt=document.createElement("option");
      opt.value=t.name;
      opt.textContent=capitalize(t.name);
      els.typeFilter.appendChild(opt);
    });
  }

  // Renderizar tarjetas
  function renderCards(pokemons){
    const frag = document.createDocumentFragment();
    pokemons.forEach(p => {
      const node = els.tpl.content.cloneNode(true);
      node.querySelector(".card-img").src = p.sprites.other["official-artwork"].front_default;
      node.querySelector(".pokemon-name").textContent = capitalize(p.name);
      node.querySelector(".pokemon-id").textContent = "#" + p.id;

      const types = node.querySelector(".types");
      p.types.forEach(t => {
        const span = document.createElement("span");
        span.className = "type-chip";
        span.textContent = t.type.name;
        types.appendChild(span);
      });

      const abilities = node.querySelector(".ability-list");
      p.abilities.forEach(a => {
        const li = document.createElement("li");
        li.textContent = a.ability.name;
        abilities.appendChild(li);
      });

      const stats = node.querySelector(".stats-list");
      p.stats.forEach(s => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${s.stat.name}</span> <strong>${s.base_stat}</strong>`;
        stats.appendChild(li);
      });
      frag.appendChild(node);
    });
    els.results.appendChild(frag);
  }

  // Utilidades
  function sortPokemons(arr,sort){
    const out = [...arr];
    switch (sort) {
      case "id-asc":
        out.sort((a, b) => a.id - b.id);
        break;
      case "id-desc":
        out.sort((a, b) => b.id - a.id);
        break;
      case "name-asc":
        out.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        out.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
    return out;
  }

  function clearGrid() {
    els.results.innerHTML = "";
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
})();