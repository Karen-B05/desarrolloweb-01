// ------ Funciones de Batalla Pokemon ------
let p1 = { nombre: '', img: '', hp: 100, turnosPasados: 0, defendiendo: false, defEspecial: false };
let p2 = { nombre: '', img: '', hp: 100, turnosPasados: 0, defendiendo: false, defEspecial: false };
let turnoActual = 1;
let movimientosTotales = 0;

const MAX_MOVIMIENTOS = 5;
window.addEventListener("load", cargarListaPokemon);

async function cargarListaPokemon() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
    const data = await response.json();
    const dataList = document.getElementById('pokemon-list');
    data.results.forEach(poke => {
        const option = document.createElement('option');
        option.value = poke.name;
        dataList.appendChild(option);
    });
}

async function iniciarBatalla() {
    const input1 = document.getElementById("poke1-input").value;
    const input2 = document.getElementById("poke2-input").value;

    if (!input1 || !input2) {
        alert("Selecciona dos pokemon");
        return;
    }

    const data1 = await obtenerPokemon(input1);
    const data2 = await obtenerPokemon(input2);

    configurarPokemon(p1, data1, "p1");
    configurarPokemon(p2, data2, "p2");

    document.getElementById("selection-screen").classList.remove("active");
    document.getElementById("battle-screen").classList.add("active");

    actualizarNarrador("¡Inicia el combate!");

    setTimeout(simularTurno, 1500);
}

async function obtenerPokemon(nombre) {
    const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre.toLowerCase()}`);
    return await r.json();
}

function configurarPokemon(obj, data, prefix) {
    obj.nombre = data.name.toUpperCase();
    obj.img = data.sprites.other["official-artwork"].front_default;
    obj.hp = 100;
    obj.turnosPasados = 0;
    document.getElementById(`${prefix}-name`).innerText = obj.nombre;
    document.getElementById(`${prefix}-img`).src = obj.img;
}

function simularTurno() {
    movimientosTotales++;
    if (movimientosTotales > MAX_MOVIMIENTOS) {
        finalizarPorLimite();
        return;
    }

    if (p1.hp <= 0 || p2.hp <= 0) return;

    const atacante = turnoActual === 1 ? p1 : p2;
    const defensor = turnoActual === 1 ? p2 : p1;
    let opciones = ['ataque', 'defensa'];

    if (atacante.turnosPasados >= 3) opciones.push('especial');
    if (atacante.turnosPasados >= 2) opciones.push('def-especial');

    const accion = opciones[Math.floor(Math.random() * opciones.length)];
    const falla = Math.random() < 0.20;

    if (falla) {
        actualizarNarrador(`${atacante.nombre} intentó ${accion} pero falló`);
    } else {
        procesarAccion(atacante, defensor, accion);
    }
    atacante.turnosPasados++;
    if (defensor.hp <= 0) {
        setTimeout(() => mostrarGanador(atacante), 1000);
    } else {
        turnoActual = turnoActual === 1 ? 2 : 1;
        setTimeout(simularTurno, 2000);
    }
}

function procesarAccion(atacante, defensor, tipo) {
    let danio = 0;
    atacante.defendiendo = false;
    atacante.defEspecial = false;
    let msg = `${atacante.nombre}: `;

    if (tipo === "ataque") {
        danio = Math.floor(Math.random() * 15) + 10;
        msg += "Ataque normal.";
    }
    else if (tipo === "especial") {
        danio = Math.floor(Math.random() * 25) + 20;
        msg += "ATAQUE ESPECIAL";
        atacante.turnosPasados = -1;
    }
    else if (tipo === "defensa") {
        atacante.defendiendo = true;
        msg += "Se defiende.";
    }
    else if (tipo === "def-especial") {
        atacante.defEspecial = true;
        msg += "DEFENSA ESPECIAL";
        atacante.turnosPasados = -1;
    }
    if (danio > 0) {
        if (defensor.defEspecial) {
            danio = 0;
            msg += " Bloqueado";
        }
        else if (defensor.defendiendo) {
            danio = Math.floor(danio / 2);
        }
        defensor.hp -= danio;
        if (defensor.hp < 0) defensor.hp = 0;

        const imgId = turnoActual === 1 ? 'p2-img' : 'p1-img';
        document.getElementById(imgId).classList.add('shake');
        setTimeout(() => document.getElementById(imgId).classList.remove('shake'), 500);
    }

    actualizarNarrador(`${msg} daño ${danio}. ${defensor.nombre} tiene ${defensor.hp}%`);
    actualizarBarrasHP();
}

function actualizarNarrador(m) {
    document.getElementById("narrator-text").innerText = m;
    const li = document.createElement("li");
    li.innerText = m;
    document.getElementById("log-list").prepend(li);
}

function actualizarBarrasHP() {
    document.getElementById("p1-hp-bar").style.width = p1.hp + "%";
    document.getElementById("p1-hp-text").innerText = p1.hp;
    document.getElementById("p2-hp-bar").style.width = p2.hp + "%";
    document.getElementById("p2-hp-text").innerText = p2.hp;
}

function finalizarPorLimite() {
    if (p1.hp === p2.hp) {
        alert("Empate");
        location.reload();
    } else {
        const ganador = p1.hp > p2.hp ? p1 : p2;
        mostrarGanador(ganador);
    }

}

function mostrarGanador(g) {
    document.getElementById("battle-screen").classList.remove("active");
    document.getElementById("winner-screen").classList.add("active");
    document.getElementById("winner-name").innerText = g.nombre;
    document.getElementById("winner-img").src = g.img;
}

function reiniciarBatalla() {
    location.reload();
}

window.iniciarBatalla = iniciarBatalla;