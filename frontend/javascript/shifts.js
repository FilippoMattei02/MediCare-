let Helper;
const currentToken = localStorage.getItem('token');
//API per prendere i dati
async function connector() {
    
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
            throw new Error('Errore di rete: ' + response.status);
        }

        const data = await response.json();
        console.log("Data message", data.message);
        Helper = data.message;
        return Helper; // Restituisce l'username
    } catch (error) {
        console.error('Errore durante il login:', error);
        alert("Credenziali errate o errore di rete.");
        return null;
    }
}



async function fetchTasks(username) {
    console.log(`Fetching tasks for username: ${username}`);
    try {
        const response = await fetch(`https://medicare-p67f.onrender.com/shifts/${username}`,
            {
                headers:{'Authorization': currentToken}
            }
        );
        console.log(`Response status: ${response.status}`);
        if (!response.ok) {
            throw new Error('Errore nella richiesta: ' + response.status);
        }
        const tasks = await response.json();
        console.log('Tasks ricevuti:', tasks);
        return tasks;
    } catch (error) {
        console.error('Errore nel caricamento dei task', error);
        return null;
    }
}



// Funzione per aggiungere un task a una cella specifica
function addTask(calendar, day, timeSlot, task, user) {
    if(calendar=="current"){
    const cellId = `${day}-${timeSlot}`;
    const cell = document.getElementById(cellId);
    cell.innerHTML += `<div> <span class="user">(${user})</span></div>`;
    }else{
       
            const cellId = `${day}-${calendar}-${timeSlot}`;
            const cell = document.getElementById(cellId);
            cell.innerHTML += `<div> <span class="user">(${user})</span></div>`;
        
        
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



// Function to create a new workspace for a specific role, year, and month
async function createWorkspace(role, year, month) {
    console.log(`Creating workspace for role: ${role}, year: ${year}, month: ${month}`);
    try {
        const response = await fetch(`https://medicare-p67f.onrender.com/workspace/${role}/${year}/${month}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': currentToken
            }
        });
        console.log(`Response status: ${response.status}`);
        if(response.status ===  409){
            await deleteEmployeeWork(role, year, month); 
            await deleteDaysOfWork(role, year, month);
            return;                     
        }
        else if(!response.ok && !(response.status=== 409)) {
            throw new Error('Errore nella richiesta: ' + response.status);
        }
        const data = await response.json();
        console.log('Workspace created successfully:', data);
        return data;
    } catch (error) {
        console.error('Error creating workspace:', error);
        return null;
    }
}

// Function to update shift details for a specific role, year, and month
async function updateShiftType(role, year, month, shiftData) {
    console.log(`Updating shift type for role: ${role}, year: ${year}, month: ${month}`);
    try {
        const response = await fetch(`https://medicare-p67f.onrender.com/workspace/${role}/${year}/${month}/shiftType`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': currentToken
            },
            body: JSON.stringify(shiftData)
        });
        const data = await response.json();
        if (!response.ok && response.status==400 && data.error==='people of this role required for a day of work are not enough: decrease the number of people for shift or increase the shift duration number') {
            alert(response.error);
            throw new Error('Error in request: ' + response.status);
        }
        console.log('Shift type updated successfully:', data);
        return data;
    } catch (error) {
        console.error('Error updating shift type:', error);
        return null;
    }
}

// Function to delete old employee shifts for a specific role, year, and month
async function deleteEmployeeWork(role, year, month) {
    console.log(`Deleting old employee shifts for role: ${role}, year: ${year}, month: ${month}`);
    try {
        const response = await fetch(`https://medicare-p67f.onrender.com/workspace/employee/${role}/${year}/${month}/work`, {
            method: 'DELETE',
            headers:{'Authorization': currentToken}
            
        });
        console.log(`Response status: ${response.status}`);
        if (!response.ok) {
            throw new Error('Error in request: ' + response.status);
        }
        const data = await response.json();
        console.log('Employee work deleted successfully:', data);
        return data;
    } catch (error) {
        console.error('Error deleting employee work:', error);
        return null;
    }
}

// Function to delete old employee shifts for a specific role, year, and month
async function deleteDaysOfWork(role, year, month) {
    console.log(`Deleting days of work in workspace for role: ${role}, year: ${year}, month: ${month}`);
    try {
        const response = await fetch(`https://medicare-p67f.onrender.com/workspace/${role}/${year}/${month}/daysOfWork`, {
            method: 'DELETE',
            headers:{'Authorization': currentToken}
        });
        console.log(`Response status: ${response.status}`);
        if (!response.ok) {
            throw new Error('Error in request: ' + response.status);
        }
        const data = await response.json();
        console.log('Work days deleted successfully:', data);
        return data;
    } catch (error) {
        console.error('Error deleting work days:', error);
        return null;
    }
}


// Function to automate and publish shifts for a specific role, year, and month
async function automateAndPublishShifts(role, year, month) {
    console.log(`Automating and publishing shifts for role: ${role}, year: ${year}, month: ${month}`);
    try {
        // Automate shifts
        const automateResponse = await fetch(`https://medicare-p67f.onrender.com/workspace/automate/${role}/${year}/${month}/daysOfWork`, {
            method: 'PUT',
            headers:{'Content-Type': 'application/json',
                'Authorization': currentToken}
        });
        console.log(`Automate response status: ${automateResponse.status}`);
        console.log(automateResponse.body);
        if (!automateResponse.ok) {
            throw new Error('Error in automate request: ' + automateResponse.status);
        }
        const automateData = await automateResponse.json();
        console.log('Automated shifts generated successfully:', automateData);

        // Publish automated shifts
        const publishResponse = await fetch(`https://medicare-p67f.onrender.com/workspace/employee/${role}/${year}/${month}/work`, {
            method: 'PUT',
            headers:{'Content-Type': 'application/json',
                'Authorization': currentToken}
        });
        console.log(`Publish response status: ${publishResponse.status}`);
        if (!publishResponse.ok) {
            throw new Error('Error in publish request: ' + publishResponse.status);
        }
        const publishData = await publishResponse.json();
        console.log('Automated shifts published successfully:', publishData);

        return { automateData, publishData };
    } catch (error) {
        console.error('Error automating and publishing shifts:', error);
        return null;
    }
}

/*class Shift{
    date;
    user;
    begin;
    end;
    Shift(){
        date=new Date();
        user='';
        begin=0;
        end=0;
    }
   Shift(date,user,begin,end){
    date=new Date();
        user='';
   this.date=date;
   this.user=user;
   this.begin=begin;
   this.end=end;

   }
   retDate(){
       return this.date;
  }
  setterdate(val){
    this.date=val;
  }
  setteruser(val){
    this.user=val;
  }
  setterhours(val1, val2){
    begin=val1;
    end=val2;
  }
  retUser(){
    return user;
  }
  retBegin(){
    return begin;
  }
  retEnd(){
    return end;
  }
}*/

function formatDateToISO(dateString, timeString = "00:00:00.000Z") {
    const date = new Date(dateString);
    
    if (isNaN(date)) {
        throw new Error("Invalid Date");
    }
    
    const [hours, minutes, seconds] = timeString.split(/[:.]/);
    
    date.setUTCHours(hours, minutes, seconds, 0);
    
    return date.toISOString();
}

document.getElementById('deleteBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const date = document.getElementById('date').value;
    const startInput = document.getElementById('start').value;
    const endInput = document.getElementById('end').value;

    // Verifica se gli input sono valori numerici
    const start = parseInt(startInput);
    const end = parseInt(endInput);

    if (isNaN(start) || isNaN(end)) {
        alert('I valori di inizio e fine devono essere numerici');
        return;
    }

    if (!email || !date) {
        alert('Tutti i campi sono obbligatori');
        return;
    }


    try {
        const formattedDate = formatDateToISO(date, "00:00:00.000Z");

        const response = await fetch(`https://medicare-p67f.onrender.com/employees/${email}/work`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': currentToken
            },
            body: JSON.stringify({
                day: formattedDate,
                start: start,
                end: end
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Shift eliminato con successo');
            // Aggiorna la vista del calendario se necessario
            //await updateCalendar();
            window.location.reload();
        } else {
            alert(`Errore: ${result.error}`);
        }
    } catch (error) {
        console.error('Errore durante l\'eliminazione dello shift:', error);
        alert('Errore durante l\'eliminazione dello shift');
    }
});

document.getElementById('addBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const date = document.getElementById('date').value;
    
    const startInput = document.getElementById('start').value;
    const endInput = document.getElementById('end').value;

    // Verifica se gli input sono valori numerici
    const start = parseInt(startInput);
    const end = parseInt(endInput);

    if (isNaN(start) || isNaN(end)) {
        alert('I valori di inizio e fine devono essere numerici');
        return;
    }

    console.log("date:", date);console.log("start:", start);console.log("end:", end);
    if (!email || !date ) {
        alert('Tutti i campi sono obbligatori');
        return;
    }


    try {
        const formattedDate = formatDateToISO(date, "00:00:00.000Z");

        const response = await fetch(`https://medicare-p67f.onrender.com/employees/${email}/work/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': currentToken
            },
            body: JSON.stringify({
                day: formattedDate,
                start: start,
                end: end
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Shift aggiunto con successo');
            // Aggiorna la vista del calendario se necessario
            //await updateCalendar();
            window.location.reload();
        } else {
            alert(`Errore: ${result.error}`);
        }
    } catch (error) {
        console.error('Errore durante l\'aggiunta dello shift:', error);
        alert('Errore durante l\'aggiunta dello shift');
    }
});

/*document.addEventListener('DOMContentLoaded', async () => {
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
    
    console.log("stampa nello shift:", tasks);
    tasks.forEach(task => {
        task.work.forEach(workItem => {
            // Corregge la data del task sottraendo un giorno
            let taskDate = new Date(workItem.day);
            taskDate.setDate(taskDate.getDate() - 1);

            if (!outOfRange(taskDate)) {
                var y = workItem.start;
                while (y < workItem.end && y < 24) {
                    if (isCurrent(taskDate)) {
                        var st = task.username;
                        var username = st.replace("@apss.it", "").replace(".", " ");
                        addTask('current', dayCalculator(taskDate), y, 'Guardare la vernice asciugarsi', username);

                    } else {
                        var st = task.username;
                        var username = st.replace("@apss.it", "").replace(".", " ");
                        addTask('next', dayCalculator(taskDate), y, 'Guardare la vernice asciugarsi', username);
                    }
                    y++;
                }
            }
        });
    });
});*/


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

    console.log("stampa nello shift:", tasks);

    for (var k = 0; k < tasks.length; k++) {
        let task = tasks[k];
        task.work.forEach(workItem => {
            let taskDate = new Date(workItem.day);
            taskDate.setDate(taskDate.getDate() - 1);

            if (!outOfRange(taskDate)) {
                var startHour = workItem.start;
                var endHour = workItem.end;

                var st = task.username;
                var formattedUsername = st.replace("@apss.it", "").replace(".", " ");

                if (startHour < endHour) {
                    // Turno nello stesso giorno
                    for (var y = startHour; y < endHour && y < 24; y++) {
                        if (isCurrent(taskDate)) {
                            addTask('current', dayCalculator(taskDate), y, 'Guardare la vernice asciugarsi', formattedUsername);
                        } else {
                            addTask('next', dayCalculator(taskDate), y, 'Guardare la vernice asciugarsi', formattedUsername);
                        }
                    }
                } else {
                    // Turno che attraversa la mezzanotte
                    for (var y = startHour; y < 24; y++) {
                        if (isCurrent(taskDate)) {
                            addTask('current', dayCalculator(taskDate), y, 'Guardare la vernice asciugarsi', formattedUsername);
                        } else {
                            addTask('next', dayCalculator(taskDate), y, 'Guardare la vernice asciugarsi', formattedUsername);
                        }
                    }

                    // Incrementa la data per il giorno successivo
                    taskDate.setDate(taskDate.getDate() + 1);

                    for (var y = 0; y < endHour && y < 24; y++) {
                        if (isCurrent(taskDate)) {
                            addTask('current', dayCalculator(taskDate), y, 'Guardare la vernice asciugarsi', formattedUsername);
                        } else {
                            addTask('next', dayCalculator(taskDate), y, 'Guardare la vernice asciugarsi', formattedUsername);
                        }
                    }
                }
            }
        });
    }
});

document.getElementById("automateButton").addEventListener("click", async () => {
    
    const monthYearString = document.getElementById('month2').value;
    const [year, month] = monthYearString.split('-');
    let role = document.getElementById("role2").value;
    let shiftDuration = document.getElementById("shiftDuration").value;
    let employeesForShift = document.getElementById("employeesForShift").value;
    const shiftData = { peopleForShift: employeesForShift, shiftDuration: shiftDuration };

    await createWorkspace(role, year, month);
    let ret=await updateShiftType(role, year, month, shiftData);
    if(ret!=null){
        await automateAndPublishShifts(role, year, month); 
    } 


    window.location.reload();

});

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