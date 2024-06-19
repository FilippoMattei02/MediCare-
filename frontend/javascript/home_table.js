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
    function fetchData(role) {
        fetch(`http://localhost:3050/coverage/${role}`)
            .then(response => response.json())
            .then(data => {
                // Popola la tabella con i dati ottenuti dall'API e il ruolo inserito
                populateTable(data, role);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // Aggiungi un listener di evento per il campo di input del ruolo
    var roleInput = document.getElementById('role');
    roleInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            var role = roleInput.value;
            fetchData(role);
        }
    });

    // Aggiungi un listener di evento per il clic sul pulsante Fetch Data
    var fetchRoleBtn = document.getElementById('fetchRoleBtn');
    fetchRoleBtn.addEventListener('click', function() {
        var role = roleInput.value;
        fetchData(role);
    });

    // Esegui una richiesta iniziale con un valore di ruolo predefinito (opzionale)
    fetchData('defaultRole'); // Sostituisci 'defaultRole' con un ruolo predefinito, se desiderato
});
