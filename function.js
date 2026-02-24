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
