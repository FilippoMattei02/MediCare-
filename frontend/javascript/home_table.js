 // Array di oggetti contenente le informazioni da inserire nella tabella
 var data = [            
    { id: 1, date: "2024-04-26", points: 80, role: "Doctor", description: "I cannot work on this day due to a personal emergency." },
    { id: 2, date: "2024-04-27", points: 65, role: "Nurse", description: "I have a medical appointment scheduled for this day." },            
    { id: 3, date: "2024-04-28", points: 55, role: "Anesthetist", description: "I need to attend a family event on this day." },
    { id: 4, date: "2024-04-29", points: 90, role: "Doctor", description: "I am feeling unwell and unable to come to work." },            
    { id: 5, date: "2024-04-30", points: 70, role: "Nurse", description: "My car broke down, and I cannot arrange alternative transportation." },            
    { id: 6, date: "2024-05-01", points: 45, role: "Anesthetist", description: "I have a training session scheduled for this day." },            
    { id: 7, date: "2024-05-02", points: 85, role: "Doctor", description: "I need to take care of a family member who is unwell." },            
    { id: 8, date: "2024-05-03", points: 60, role: "Nurse", description: "I have an important personal commitment and cannot come to work." },            
    { id: 9, date: "2024-05-04", points: 40, role: "Anesthetist", description: "I will be on vacation during this time period." }        
];

var tbody = document.querySelector("#infoTable tbody");

 // Per ogni oggetto nell'array data, crea una nuova riga nella tabella
 data.forEach(function(item) {
     var row = document.createElement("tr");
     row.innerHTML = "<td>" + item.id + "</td>" +
                     "<td>" + item.date + "</td>" +
                     "<td>" + item.points + "</td>" +
                     "<td>" + item.role + "</td>" +
                     "<td>" + item.description + "</td>";
     tbody.appendChild(row);

     // Aggiungi un listener di evento al clic sulla riga per reindirizzare l'utente
     row.addEventListener("click", function() {
         // Genera l'URL della pagina di destinazione con i parametri relativi alla riga selezionata
         var url = "game.html?id=" + encodeURIComponent(item.id) +
                   "&day=" + encodeURIComponent(item.date) +
                   "&points=" + encodeURIComponent(item.points) +
                   "&role=" + encodeURIComponent(item.role) +
                   "&description=" + encodeURIComponent(item.description);

         // Reindirizza alla pagina di destinazione
         window.location.href = url;
     });

     tbody.appendChild(row);
 });