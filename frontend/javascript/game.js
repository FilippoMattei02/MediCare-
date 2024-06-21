// Leggi i parametri dall'URL
var params = new URLSearchParams(window.location.search);
var id = params.get('id');
var day = params.get('day');
var start = params.get('start');
var end = params.get('end');
var req_username = params.get('req_username');
var message = params.get('message');
var role = params.get('role'); // Leggi il parametro ruolo

// Aggiorna il contenuto della pagina con le informazioni della richiesta
document.getElementById("id").textContent = id;
document.getElementById("day").textContent = day;
document.getElementById("start").textContent = start;
document.getElementById("end").textContent = end;
document.getElementById("req_username").textContent = req_username;
document.getElementById("message").textContent = message;
document.getElementById("role").textContent = role; // Aggiorna il contenuto del ruolo

// Aggiungi un gestore di eventi per il pulsante "Accept"
document.getElementById("acceptBtn").addEventListener("click", function() {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
        console.error('No token found');
        return;
    }
    fetch('https://medicare-p67f.onrender.com/auth/tokens', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: currentToken })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network error: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log("Data message", data.message);
        const resUsername = data.message;

        fetch(`https://medicare-p67f.onrender.com/coverage/${role}/${resUsername}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                req_username: req_username,
                day: day,
                start: start
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            alert("Request successfully updated.");
            // Puoi aggiungere qui qualsiasi azione che vuoi intraprendere dopo il successo della richiesta
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Error updating request: " + error.message);
            // Puoi aggiungere qui la gestione degli errori
        });
    })
    .catch(error => {
        console.error('Error during token verification:', error);
        alert("Invalid credentials or network error.");
    });
});
