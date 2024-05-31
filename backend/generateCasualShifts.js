async function generateWorkSets(peopleList, numberOfDays, peopleForShift, shiftDuration, role, yearMonth) {
    const sets = new Map();
    
    const peopleCount = peopleList.length;
    const peopleForWorkday = peopleForShift * 24 / shiftDuration;
    const shiftForDay = 24 / shiftDuration;

    const targetFrequency = Math.ceil(numberOfDays * peopleForWorkday / peopleCount);
    //console.log(targetFrequency);

    const occurrencesMap = new Map();
    peopleList.forEach(person => occurrencesMap.set(person, 0));

    // Start date for shift generation
    let availablePeople = [];
    let unavailablePeople = [];
    let variable = 3;
    for (let i = 0; i < numberOfDays; i++) {
        const shifts = [];
        
        let date = (i + 1).toString().padStart(2, '0');
        date = yearMonth + date;
        
        let usersHoliday = await getUsersByRoleAndDate(role, date);
        //console.log(usersHoliday);
        availablePeople = peopleList.filter(person => (occurrencesMap.get(person) < targetFrequency - variable) && !(usersHoliday.includes(person)));
        unavailablePeople = peopleList.filter(person => (occurrencesMap.get(person) >= targetFrequency - variable) && !(usersHoliday.includes(person)));

        if ((availablePeople.length == 0) && variable > 0) {
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

        sets.set(date, shifts);
    }

    // occurrencesMap.forEach((value, key) => {
    //     console.log(`${key}: ${value}`);
    // });

    return sets;
}

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
    const url = `http://localhost:3050/holiday/${role}/${date}`;
    
    try {
        const response = await fetch(url);
        
        // Check if the response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Convert the response to JSON
        const data = await response.json();
        
        // Process the data (e.g., log the data)
        console.log(data);
        
        // Return the data for further processing
        return data;
        
    } catch (error) {
        // Handle any errors
        console.error('Error during API call:', error);
    }
}

module.exports= generateWorkSets;