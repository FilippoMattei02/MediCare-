

function generateRandomSets(peopleList, numberOfDays, peopleForShift, shiftDuration,role,yearMonth) {
    const sets = new Map();
    //const originalList = [...peopleList];
    const peopleCount = peopleList.length;
    const peopleForWorkday = peopleForShift * 24 / shiftDuration;
    const shiftForDay = 24 / shiftDuration;

    // Calcola quante volte ogni persona dovrebbe essere inserita
    const targetFrequency = Math.ceil(numberOfDays * peopleForWorkday / peopleCount);
    console.log(targetFrequency);

    // Mappa per tenere traccia delle occorrenze di ciascuna persona
    const occurrencesMap = new Map();
    peopleList.forEach(person => occurrencesMap.set(person, 0));

    // Data di inizio per la generazione dei turni
    //let startDate = new Date('2024-06-01');
    let availablePeople = [];
    let unavailablePeople = [];
    let variable=3
    for (let i = 0; i < numberOfDays; i++) {
        const shifts = [];
        
        let date = (i+1).toString().padStart(2, '0');
        date=yearMonth+date;
        //console.log(date);
        //let usersHoliday=getUsersByRoleAndDate(role,date);
        
        availablePeople = peopleList.filter(person => (occurrencesMap.get(person) < targetFrequency - variable) /*&& !(usersHoliday.includes(person))*/);
        unavailablePeople = peopleList.filter(person => (occurrencesMap.get(person) >= targetFrequency - variable) /*&& !(usersHoliday.includes(person))*/);

        
        if((availablePeople.length==0)&&variable>0){
            variable--;
        }

        const shuffledPeople = shuffle(availablePeople);
        shuffle(unavailablePeople);
        let selectedPeople = [];

        if (shuffledPeople.length < peopleForWorkday) {
            shuffledPeople.push(...unavailablePeople);
            
            selectedPeople = shuffledPeople.slice(0, peopleForWorkday);
        } else {
            selectedPeople = shuffledPeople.slice(0, peopleForWorkday);
        }

        selectedPeople = shuffle(selectedPeople);  // Ensure selectedPeople is shuffled correctly

        for (let l = 0; l < shiftForDay; l++) {
            for (let k = 0; k < peopleForShift; k++) {
                const startHour = l * shiftDuration;
                const endHour = startHour + shiftDuration;
                const personIndex = l * peopleForShift + k;

                if (personIndex < selectedPeople.length) {
                    const shift = {
                        employee: selectedPeople[personIndex],
                        startHour: startHour,
                        endHour: endHour
                    };
                    shifts.push(shift);
                }
            }
        }

        selectedPeople.forEach(person => {
            occurrencesMap.set(person, occurrencesMap.get(person) + 1);
            if (occurrencesMap.get(person) == targetFrequency) {
                peopleList = peopleList.filter(item => item !== person);
            }
        });

        sets.set(`Day ${i + 1}`, shifts);
    }

    occurrencesMap.forEach((value, key) => {
        console.log(`${key}: ${value}`);
    });

    return sets;
}

// Funzione per mescolare casualmente un array
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

async function getUsersByRoleAndDate(role, date) {
    const url = `http://localhost:3050/${role}/${date}`;
    
    try {
        const response = await fetch(url);
        
        // Verifica se la risposta è ok
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Converti la risposta in JSON
        const data = await response.json();
        
        // Elabora i dati (per esempio, logga i dati)
        console.log(data);
        
        // Restituisci i dati per ulteriore elaborazione
        return data;
        
    } catch (error) {
        // Gestisci eventuali errori
        console.error('Errore durante la chiamata API:', error);
    }
}

//Lista delle persone
const peopleList = ['Persona 1', 'Persona 2', 'Persona 3', 'Persona 4', 'Persona 5',
    'Persona 6', 'Persona 7', 'Persona 8', 'Persona 9', 'Persona 10',
    'Persona 11', 'Persona 12', 'Persona 13', 'Persona 14', 'Persona 15'];

// Genera i 20 set di 8 persone ciascuno con informazioni sui turni
const randomSets = generateRandomSets(peopleList, 31, 2, 8,"nurse","2024-12-");

// Output degli array generati con informazioni sui turni
// randomSets.forEach((shifts, day) => {
//     console.log(`${day}:`);
//     shifts.forEach(shift => {
//         console.log(`  ${shift.employee}: ${shift.startHour} - ${shift.endHour}`);
//     });
// });
