// Funzione per eseguire il login
function login() {
    var usernameInput = document.querySelector('.login-input[type="text"]');
    var passwordInput = document.querySelector('.login-input[type="password"]');
    
    var username = usernameInput.value;
    var password = passwordInput.value;

    // Verifica che username e password non siano vuoti
    if (username.trim() === '' || password.trim() === '') {
        alert("Inserisci username e password.");
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
        fetch(`https://medicare-p67f.onrender.com/employees/role/${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Errore di rete: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            // Controlla se il ruolo è stato ricevuto
            console.log('Ruolo ricevuto:', data.shiftManager);
                // Puoi salvare il ruolo in localStorage o usarlo come preferisci
            //localStorage.setItem('employeeRole', data.shiftManager);
            //const shift = data.shiftManager;
            // Esegui altre operazioni basate sul ruolo, ad esempio reindirizzamento
            if (data) {
                window.location.href = "html/homeShiftManager.html";
            } else {
                window.location.href = "html/homeUser.html";
            }
        })
        .catch(error => {
            // Gestione degli errori durante la richiesta al server
            console.error('Errore durante il recupero del ruolo:', error);
            alert("Errore durante il recupero del ruolo. Per favore, riprova.");
        });
        //window.location.href = "html/homeUser.html";
    })
    .catch(error => {
        // Gestione degli errori durante la richiesta al server
        console.error('Errore durante il login:', error);
        alert("Credenziali errate o errore di rete.");
    });
}


