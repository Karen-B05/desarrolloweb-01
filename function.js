// Cargar header
fetch("header.html")
.then(response => response.text())
.then(data => {
    document.getElementById("header").innerHTML = data;
    configurarSesion();
});

// Cargar footer
fetch("footer.html")
.then(response => response.text())
.then(data => {
    document.getElementById("footer").innerHTML = data;
});

// Token sesion
function configurarSesion(){
    const token = localStorage.getItem("token");
    const usuario = localStorage.getItem("usuarioActivo");

    if(token && usuario){
        document.getElementById("usuarioLogueado").textContent = "Sesión iniciada como: " + usuario;
        document.getElementById("logoutBtn").style.display = "inline";
        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("usuarioActivo");
            window.location.href = "login.html";
        });
    }
}

// Consumir API Pokémon
const API_BASE = 'https://pokeapi.co/api/v2';

// Buscar un pokemon por nombre, ID o tipo
async function buscarPokemon() {
    const input = document.getElementById("pokemonInput").value.toLowerCase().trim();
    const resultado = document.getElementById("resultado");
    if (!input) {
        resultado.innerHTML = "<p>Escribe un nombre, ID o tipo.</p>";
        return;
    }
    resultado.innerHTML = "<p>Buscando...</p>";
    try {
        let response = await fetch(`${API_BASE}/pokemon/${input}`);
        if (response.ok) {
            const data = await response.json();
            mostrarPokemon(data);
            return;
        }
        response = await fetch(`${API_BASE}/type/${input}`);
        if (response.ok) {
            const data = await response.json();
            if (data.pokemon.length > 0) {
                const nombrePokemon = data.pokemon[0].pokemon.name;
                const pokemonResponse = await fetch(`${API_BASE}/pokemon/${nombrePokemon}`);
                const pokemonData = await pokemonResponse.json();
                mostrarPokemon(pokemonData);
                return;
            }
        }
        resultado.innerHTML = "<p>No se encontraron pokemon.</p>";
    } catch (error) {
        resultado.innerHTML = "<p>Error al buscar.</p>";
        console.error(error);
    }
}

// Mostrar el pokemon
function mostrarPokemon(pokemon) {
    const resultado = document.getElementById("resultado");
    resultado.innerHTML = `
        <h2>${pokemon.name.toUpperCase()}</h2>
        <img src="${pokemon.sprites.front_default}">
        <p><strong>ID:</strong> ${pokemon.id}</p>
        <p><strong>Tipo:</strong> ${pokemon.types.map(t => t.type.name).join(", ")}</p>
        <p><strong>Altura:</strong> ${pokemon.height}</p>
        <p><strong>Peso:</strong> ${pokemon.weight}</p>
    `;
}