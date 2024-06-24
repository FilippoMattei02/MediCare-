document.addEventListener('DOMContentLoaded', function() {
    var tbody = document.querySelector("#infoTable tbody");

    // Funzione per riempire la tabella con i dati
    function populateTable(data, role) {
        // Cancella il contenuto precedente della tabella
        tbody.innerHTML = "";

        // Per ogni oggetto nell'array data, crea una nuova riga nella tabella
        data.forEach(function(item, index) {
            var row = document.createElement("tr");
            row.innerHTML = "<td>" + (index + 1) + "</td>" + // Genera un ID incrementale
                            "<td>" + item.day + "</td>" +
                            "<td>" + item.start + " - " + item.end + "</td>" + // Mostra l'intervallo di tempo
                            "<td>" + item.req_username + "</td>" + // Mostra l'username
                            "<td>" + item.message + "</td>" +
                            "<td>" + role + "</td>"; // Mostra il ruolo inserito dall'utente
            tbody.appendChild(row);

            // Aggiungi un listener di evento al clic sulla riga per reindirizzare l'utente
            row.addEventListener("click", function() {
                // Genera l'URL della pagina di destinazione con i parametri relativi alla riga selezionata
                var url = "game.html?id=" + encodeURIComponent(index + 1) +
                          "&day=" + encodeURIComponent(item.day) +
                          "&start=" + encodeURIComponent(item.start) +
                          "&end=" + encodeURIComponent(item.end) +
                          "&req_username=" + encodeURIComponent(item.req_username) +
                          "&message=" + encodeURIComponent(item.message) +
                          "&role=" + encodeURIComponent(role); // Aggiungi il ruolo all'URL

                // Reindirizza alla pagina di destinazione
                window.location.href = url;
            });

            tbody.appendChild(row);
        });
    }

    // Funzione per ottenere i dati dall'API
    function fetchData() {
        const currentToken = localStorage.getItem('token');
<<<<<<< HEAD
        fetch('https://medicare-p67f.onrender.com/auth/tokens', {
=======
        fetch('http://localhost:3050/auth/tokens', {
>>>>>>> coverage
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
            const username = data.message;
<<<<<<< HEAD
            fetch(`https://medicare-p67f.onrender.com/employees/role/type/${username}`)
=======
            fetch(`http://localhost:3050/employees/role/type/${username}`)
>>>>>>> coverage
            .then(response => {
                if (!response.ok) {
                // Gestisci i casi di errore
                if (response.status === 404) {
                    throw new Error('Employee not found');
                } else {
                    throw new Error('Internal server error');
                }
                }
                return response.json();
            })
            .then(data => {
                const role = data.role;
                console.log(`Role: ${data.role}`);
<<<<<<< HEAD
                fetch(`https://medicare-p67f.onrender.com/coverage/${role}`)
=======
                fetch(`http://localhost:3050/coverage/${role}`)
>>>>>>> coverage
                .then(response => response.json())
                .then(data => {
                    // Popola la tabella con i dati ottenuti dall'API e il ruolo inserito. 
                    populateTable(data, role);
                })
                .catch(error => console.error('Error fetching data:', error));
            })
            .catch(error => {
                // Gestisci eventuali errori
                console.error('Error:', error.message);
            });
        })
        .catch(error => {
            console.error('Error during token verification:', error);
            alert("Invalid credentials or network error.");
        });
    }

    fetchData();
});
