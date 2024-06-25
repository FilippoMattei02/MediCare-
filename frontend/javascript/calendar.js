let Helper;
let currentWeekStart = getStartOfTheWeek(new Date()); // Data di inizio della settimana corrente
const currentToken = localStorage.getItem('token');
// API per prendere i dati
async function connector() {
    
    try {
        const response = await fetch('https://medicare-p67f.onrender.com/auth/tokens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: currentToken })
        });

        if (!response.ok) {
            throw new Error('Errore di rete: ' + response.status);
        }

        const data = await response.json();
        Helper = data.message;
        return Helper; // Restituisce l'username
    } catch (error) {
        console.error('Errore durante il login:', error);
        alert("Credenziali errate o errore di rete.");
        return null;
    }
}

async function fetchTasks(username) {
    const currentToken = localStorage.getItem('token');
    try {
        const response = await fetch(`https://medicare-p67f.onrender.com/calendar/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': currentToken
            }
        });

        if (!response.ok) {
            throw new Error('Errore nella richiesta: ' + response.status);
        }
        const tasks = await response.json();

        let adjustedTasks = [];

        for (let task of tasks) {
            let startHour = task.start;
            let endHour = task.end;
            let taskDay = new Date(task.day);

            if (startHour > endHour) {
                // Split the task into two separate tasks
                let nextDay = new Date(taskDay);
                nextDay.setDate(nextDay.getDate() + 1);

                // First task: from startHour to 24:00 of the same day
                adjustedTasks.push({
                    day: taskDay.toISOString().split('T')[0], // Save only the date part
                    start: startHour,
                    end: 24 // Cap the end at 24 hours for the current day
                });

                // Second task: from 00:00 to endHour of the next day
                adjustedTasks.push({
                    day: nextDay.toISOString().split('T')[0], // Save only the date part
                    start: 0,
                    end: endHour
                });
            } else {
                // No need to split the task
                adjustedTasks.push(task);
            }
        }

        // Sort the tasks by day in ascending order
        adjustedTasks.sort((a, b) => new Date(a.day) - new Date(b.day));

        return adjustedTasks;
    } catch (error) {
        console.error('Errore nel caricamento dei task', error);
        return null;
    }
}

// Funzione per aggiungere un task a una cella specifica
function addTask(calendar, day, timeSlot, user) {
    const formattedUser = formatUsername(user);
    const cellId = `${day}-${calendar}-${timeSlot}`;
    console.log(`Adding task to cell: ${cellId}`);
    const cell = document.getElementById(cellId);
    if (cell) {
        cell.innerHTML += `<div><span class="user">(${formattedUser})</span></div>`;
    }
}

function getStartOfTheWeek(date) {
    const currentDate = new Date(date);
    const day = currentDate.getUTCDay();
    const difference = day === 0 ? 0 : -day; // Sunday (0) is the start of the week
    currentDate.setUTCDate(currentDate.getUTCDate() + difference);
    currentDate.setUTCHours(0, 0, 0, 0); // Reset time to midnight in UTC
    return currentDate;
}

function getEndOfTheWeek(date) {
    const currentDate = new Date(date);
    const day = currentDate.getUTCDay();
    const difference = day === 0 ? 6 : 6 - day; // Saturday (6) is the end of the week
    currentDate.setUTCDate(currentDate.getUTCDate() + difference);
    currentDate.setUTCHours(23, 59, 59, 999); // Set time to the end of the day in UTC
    return currentDate;
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
function formatDateToLocalString(date) {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toLocaleDateString();
}
// Funzione per aggiornare il calendario
async function updateCalendar(weekStart) {
    const weekEnd = getEndOfTheWeek(weekStart);
    const weekStartLocalString = formatDateToLocalString(weekStart);
    const weekEndAdjusted = new Date(weekEnd.getTime() - 24 * 60 * 60 * 1000); // Subtract one day
    const weekEndLocalString = formatDateToLocalString(weekEndAdjusted);
    document.getElementById('weekDates').innerText = `Week from ${weekStartLocalString} to ${weekEndLocalString}`;
    const calendarContainer = document.getElementById('calendarContainer');
    calendarContainer.innerHTML = createCalendarHTML('current');

    var username = await connector();
    if (!username) {
        console.error('Username non trovato o errore durante la connessione.');
        return;
    }
    var tasks = await fetchTasks(username);
    if (!tasks) {
        console.error('Nessun task trovato o errore durante il caricamento.');
        return;
    }

    console.log('Tasks fetched:', tasks);

    for (var k = 0; k < tasks.length; k++) {
        let taskDate = new Date(tasks[k].day);
        taskDate.setUTCHours(0, 0, 0, 0); // Normalize the hour part of the date to UTC
        console.log(`Task Date: ${taskDate}, Task:`, tasks[k]);

        // Verify if the task belongs to the current week
        if (taskDate >= weekStart && taskDate <= weekEnd) {
            console.log(`Task ${tasks[k].day} is within the current week.`);
            var startHour = tasks[k].start;
            var endHour = tasks[k].end;

            for (var y = startHour; y < endHour && y < 24; y++) {
                // Add the task only if the cell ID is valid
                let dayId = dayCalculator(taskDate);
                console.log(dayId);
                if (dayId) {
                    addTask('current', dayId, y, username);
                } else {
                    console.warn(`Giorno non valido per la data ${taskDate}`);
                }
            }
        } else {
            console.log(`Task non aggiunto alla settimana corrente: ${tasks[k].day}`);
        }
    }
}
function createCalendarHTML(calendar) {
    let days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']; // Modifica l'ordine dei giorni
    let weekHTML = `
        <table>
            <thead>
                <tr>
                    <th>Ora</th>
                    <th>Sunday</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                    <th>Saturday</th>
                </tr>
            </thead>
            <tbody>`;

    for (let hour = 0; hour < 24; hour++) {
        weekHTML += `<tr><td>${hour}:00 - ${hour + 1}:00</td>`;
        for (let day of days) {
            weekHTML += `<td id="${day}-${calendar}-${hour}"></td>`;
        }
        weekHTML += `</tr>`;
    }

    weekHTML += `</tbody></table>`;
    return weekHTML;
}
function dayCalculator(date) {
    let day = date.getDay();
    switch (day) {
        case 0: return 'sun';
        case 1: return 'mon';
        case 2: return 'tue';
        case 3: return 'wed';
        case 4: return 'thu';
        case 5: return 'fri';
        case 6: return 'sat';
        default: return '';
    }
}

function downloadCSV() {
    const calendarContainer = document.querySelector('#calendarContainer table');
    let csv = [];

    let rows = calendarContainer.querySelectorAll('tr');
    rows.forEach((row, rowIndex) => {
        let rowData = [];
        row.querySelectorAll('th, td').forEach(cell => {
            let cellText = cell.innerText.replace(/,/g, '');  // Rimuovi eventuali virgole
            rowData.push(`"${cellText}"`); // Aggiungi virgolette per gestire il testo lungo
        });
        csv.push(rowData.join(','));
    });

    let csvContent = csv.join('\n');
    let blob = new Blob([csvContent], { type: 'text/csv' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'calendario_settimanale.csv');
    a.click();
    URL.revokeObjectURL(url);
}

// Event listener per il download del CSV
document.getElementById('downloadBtn').addEventListener('click', downloadCSV);

document.getElementById('nextWeekBtn').addEventListener('click', async () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    await updateCalendar(currentWeekStart);
});

document.getElementById('prevWeekBtn').addEventListener('click', async () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    await updateCalendar(currentWeekStart);
});

// Funzione iniziale per caricare il calendario corrente
document.addEventListener('DOMContentLoaded', () => {
    updateCalendar(currentWeekStart);
});