let Helper;
//API per prendere i dati
async function connector() {
    const currentToken = localStorage.getItem('token');
    console.log("currentToken: ", currentToken);

    try {
        const response = await fetch('http://localhost:3050/auth/tokens', {
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
        const response = await fetch(`http://localhost:3050/shifts/${username}`);
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

class Shift{
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
}

/*
var datep=new Date();
//datep.setDate(22);
var user ='Jamal';

var shift=new Shift();
shift.setterdate(datep);
shift.setteruser(user);
var begin=9;
var end=15;
shift.setterhours(begin, end);
/*var shift=new Shift(datep,user);
var help=shift.retDate();
var help2=shift.retUser();*/
//addTask('current', dayCalculator(shift.date), 1, 'Guardare la vernice asciugarsi', shift.user);
/*
for(var j=shift.retBegin();j<shift.retEnd();j++){

    if(isCurrent(shift.retDate())==true){
        addTask('current', dayCalculator(shift.retDate()) , j, 'Guardare la vernice asciugarsi', 'Jamal');
    }else{
        addTask('next', dayCalculator(shift.retDate()) , j, 'Guardare la vernice asciugarsi', shift.retUser());
    }


}
*/


// Esempio di utilizzo: caricare i task quando la pagina è pronta
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
    for (var k = 0; k < tasks.length; k++) {
        // Corregge la data del task sottraendo un giorno
        let taskDate = new Date(tasks[k].day);
        taskDate.setDate(taskDate.getDate() - 1);

        if (!outOfRange(taskDate)) {
            var y = tasks[k].start;
            while (y < tasks[k].end && y < 24) {
                if (isCurrent(taskDate)) {
                    addTask('current', dayCalculator(taskDate), y, 'Guardare la vernice asciugarsi', username);
                } else {
                    addTask('next', dayCalculator(taskDate), y, 'Guardare la vernice asciugarsi', username);
                }
                y++;
            }
        }
    }
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