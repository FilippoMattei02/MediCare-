let Helper;
//API per prendere i dati
async function connector() {
    const currentToken = localStorage.getItem('token');
    console.log("currentToken: ", currentToken);

    try {
        const response = await fetch('https://medicare-p67f.onrender.com/auth/tokens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: currentToken })
        });

        if (!response.ok) {
            throw new Error('Network error: ' + response.status);
        }

        const data = await response.json();
        console.log("Data message", data.message);
        Helper = data.message;
        return Helper; // Restituisce l'username
    } catch (error) {
        console.error('Error during login: ', error);
        alert("Wrong credentials or network error.");
        return null;
    }
}



async function fetchTasks(username) {
    console.log(`Fetching tasks for username: ${username}`);
    try {
        const response = await fetch(`https://medicare-p67f.onrender.com/calendar/${username}`);
        console.log(`Response status: ${response.status}`);
        if (!response.ok) {
            throw new Error('Request error: ' + response.status);
        }
        const tasks = await response.json();
        console.log('Tasks received:', tasks);
        return tasks;
    } catch (error) {
        console.error('Loading task error', error);
        return null;
    }
}



// Funzione per aggiungere un task a una cella specifica
function addTask(calendar, day, timeSlot, user) {
    const formattedUser = formatUsername(user);
    const cellId = calendar === "current" ? `${day}-${timeSlot}` : `${day}-${calendar}-${timeSlot}`;
    const cell = document.getElementById(cellId);
    if (cell) {
        cell.innerHTML += `<div> <span class="user">(${formattedUser})</span></div>`;
    }
}
//funzioni potenzialmente funzionanti

function getPreviousDay(date) {
    let previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    return previousDay;
}
function getNextDay(date) {
    let nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
}

function getStartOfTheWeek(date) {
    let date1 = new Date(date);
    let day = date1.getDay();
    if (day == 1) {
        return date1;
    } else {
        while (day != 1) {
            date1 = getPreviousDay(date1);
            day = date1.getDay();
        }
        return date1;
    }
}

function getEndOfTheWeek(date) {
    let date2 = new Date(date);
    let day = date2.getDay();
    if (day == 0) {
        return date2;
    } else {
        while (day != 0) {
            date2 = getNextDay(date2);
            day = date2.getDay();
        }
        return date2;
    }
}
function isCurrent(date){
let datealt=new Date();
var datealt2=new Date(date);
console.log(datealt2);
var date1=getEndOfTheWeek(datealt2);
var date2=getEndOfTheWeek(datealt);

if(date1.getDate()==date2.getDate()){
   
    return true;
}else{
   
    return false;
}

}

function dayCalculator(date){
    var date2=new Date(date)
    let day=date2.getDay();
    var dayn;
    switch(day){
        case 0:
            dayn='sun';
            break;
        case 1:
            dayn='mon';
            break;
        case 2:
            dayn='tue';
            break;
        case 3:
            dayn='wed';
            break;
        case 4:
            dayn='thu';
            break;
        case 5:
           dayn='fri';
                break;
        case 6:
            dayn='sat';
                break; 
        default:
            break;       

    }
    return dayn;
}
function outOfRange(date){
   var toconf=new Date(date);
    var conf=new Date();
    var conf2=new Date();
    conf2.setDate(conf2.getDate()+7);
    conf2=getEndOfTheWeek(conf2);
    conf=getStartOfTheWeek(conf);
    //console.log(toconf.getDay());
    conf.setDate(conf.getDate()-1);
    if((toconf.getTime()<conf.getTime())||(toconf.getTime()>conf2.getTime())){
     return true;
    }else{
     return false;
    }
 }

 function formatUsername(email) {
    if (!email) return '';
    let [name, domain] = email.split('@');
    let [firstName, lastName] = name.split('.');
    return `${capitalize(firstName)} ${capitalize(lastName)}`;
}

function capitalize(word) {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

//fine funzioni potenzialmente funzionanti
//inserire connessione a DB qui 

//inizio prova



document.getElementById('downloadBtn').addEventListener('click', downloadCSV);

document.getElementById('downloadBtn').addEventListener('click', downloadCSV);

function downloadCSV() {
    const currentWeekTable = document.querySelector('#currentWeek table');
    const nextWeekTable = document.querySelector('#nextWeek table');

    let csv = [];
    
    // Funzione per estrarre i dati da una tabella e formattarli come CSV
    function extractTableData(table, title) {
        let rows = table.querySelectorAll('tr');
        csv.push(title);  // Aggiungi un titolo per la sezione della tabella
        rows.forEach((row, rowIndex) => {
            let rowData = [];
            row.querySelectorAll('th, td').forEach(cell => {
                let cellText = cell.innerText.replace(/,/g, '');  // Rimuovi eventuali virgole
                rowData.push(`"${cellText}"`); // Aggiungi virgolette per gestire il testo lungo
            });
            csv.push(rowData.join(','));
        });
        csv.push('');  // Aggiungi una riga vuota per separare le tabelle
    }

    // Estrai i dati della tabella della settimana corrente
    extractTableData(currentWeekTable, 'Settimana Corrente');

    // Estrai i dati della tabella della prossima settimana
    extractTableData(nextWeekTable, 'Settimana Successiva');

    // Unisce tutte le linee in un'unica stringa separata da caratteri di nuova linea
    let csvContent = csv.join('\n');

    // Crea un blob e scaricalo
    let blob = new Blob([csvContent], { type: 'text/csv' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'calendario_settimanale.csv');
    a.click();
    URL.revokeObjectURL(url);
}


// Esempio di utilizzo: caricare i task quando la pagina è pronta
document.addEventListener('DOMContentLoaded', async () => {
    var username = await connector();
    console.log("Il mio username ha valore: ", username);
    if (!username) {
        console.error('Username non trovato o errore durante la connessione.');
        return;
    }
    var tasks = await fetchTasks(username);
    if (!tasks) {
        console.error('Nessun task trovato o errore durante il caricamento.');
        return;
    }

    for (var k = 0; k < tasks.length; k++) {
        let taskDate = new Date(tasks[k].day);
        taskDate.setDate(taskDate.getDate() - 1);

        if (!outOfRange(taskDate)) {
            var startHour = tasks[k].start;
            var endHour = tasks[k].end;

            if (startHour < endHour) {
                // Turno nello stesso giorno
                for (var y = startHour; y < endHour && y < 24; y++) {
                    if (isCurrent(taskDate)) {
                        addTask('current', dayCalculator(taskDate), y, username);
                    } else {
                        addTask('next', dayCalculator(taskDate), y, username);
                    }
                }
            } else {
                // Turno che attraversa la mezzanotte
                for (var y = startHour; y < 24; y++) {
                    if (isCurrent(taskDate)) {
                        addTask('current', dayCalculator(taskDate), y, username);
                    } else {
                        addTask('next', dayCalculator(taskDate), y, username);
                    }
                }

                // Incrementa la data per il giorno successivo
                taskDate.setDate(taskDate.getDate() + 1);

                for (var y = 0; y < endHour && y < 24; y++) {
                    if (isCurrent(taskDate)) {
                        addTask('current', dayCalculator(taskDate), y, username);
                    } else {
                        addTask('next', dayCalculator(taskDate), y, username);
                    }
                }
            }
        }
    }
});
//fine prova







document.getElementById('nextWeekBtn').addEventListener('click', () => {
    document.getElementById('currentWeek').style.display = 'none';
    document.getElementById('nextWeek').style.display = 'block';
    document.getElementById('nextWeekBtn').style.display = 'none';
    document.getElementById('prevWeekBtn').style.display = 'inline-block';
});

document.getElementById('prevWeekBtn').addEventListener('click', () => {
    document.getElementById('currentWeek').style.display = 'block';
    document.getElementById('nextWeek').style.display = 'none';
    document.getElementById('nextWeekBtn').style.display = 'inline-block';
    document.getElementById('prevWeekBtn').style.display = 'none';
});