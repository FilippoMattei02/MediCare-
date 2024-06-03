// Funzione per eseguire il login
function login() {
    var usernameInput = document.querySelector('.login-input[type="text"]');
    var passwordInput = document.querySelector('.login-input[type="password"]');
    var loginButton = document.querySelector('.btn-container .btn'); // Aggiungi questa linea per riferire il pulsante

    var username = usernameInput.value;
    var password = passwordInput.value;

    // Disabilita il pulsante all'inizio del processo di login
    loginButton.disabled = true;

    // Verifica che username e password non siano vuoti
    if (username.trim() === '' || password.trim() === '') {
        alert("Inserisci username e password.");
        loginButton.disabled = false; // Riabilita il pulsante se ci sono errori di input
        return; // Esce dalla funzione senza eseguire il login
    }
    
    var jsonData = {
        "username": username,
        "password": password // Invia la password in chiaro al server per l'hashing
    }

    // Chiama le API usando POST per il login
    fetch('https://medicare-p67f.onrender.com/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    })
    .then(response => {
        console.log("I'm here");
        if (!response.ok) {
            throw new Error('Errore di rete: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        // Salva il token nel localStorage o in un cookie come preferisci
        // Reindirizza l'utente alla pagina dopo il login
        if (data.token) {
            console.log('Token ricevuto:', data.token);
            localStorage.setItem('token', data.token);
            console.log('Token salvato: ', localStorage.getItem('token'));
        }
        window.location.href = "html/homeUser.html";
    })
    .catch(error => {
        // Gestione degli errori durante la richiesta al server
        console.error('Errore durante il login:', error);
        alert("Credenziali errate o errore di rete.");
        loginButton.disabled = false; // Riabilita il pulsante in caso di errore
    });
}