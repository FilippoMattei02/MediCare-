// Leggi i parametri dall'URL
var params = new URLSearchParams(window.location.search);
var id = params.get('id');
var day = params.get('day');
var points = params.get('points');
var role = params.get('role');
var description = params.get('description');

// Aggiorna il contenuto della pagina con le informazioni della richiesta
document.getElementById("id").textContent = id;
document.getElementById("day").textContent = day;
document.getElementById("points").textContent = points;
document.getElementById("role").textContent = role;
document.getElementById("description").textContent = description;