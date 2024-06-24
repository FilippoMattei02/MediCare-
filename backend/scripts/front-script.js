prova();

async function prova(){
    let month = "11";
    let year = "2024";
    let role = "nurse";
    let shiftDuration = "4";
    let employeesForShift = "1";
    const shiftData = { peopleForShift: employeesForShift, shiftDuration: shiftDuration };

    await createWorkspace(role, year, month);
    let ret=await updateShiftType(role, year, month, shiftData);
    if(ret!=null){
        await automateAndPublishShifts(role, year, month); 
    }
    

}
async function createWorkspace(role, year, month) {
    console.log(`Creating workspace for role: ${role}, year: ${year}, month: ${month}`);
    try {
        const response = await fetch(`http://localhost:3050/workspace/${role}/${year}/${month}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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
        const response = await fetch(`http://localhost:3050/workspace/${role}/${year}/${month}/shiftType`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(shiftData)
        });
        console.log(`Response status: ${response.status}`);
        const data = await response.json();
        if (!response.ok && response.status==400 && data.error==='people of this role required for a day of work are not enough: decrease the number of people for shift or increase the shift duration number') {
            alert(response.error);
            //console.log("ERRORE!"+data.error);
            throw new Error('Error in request: ' + response.status);
        }
        
        console.log('Shift type updated successfully:', data);
        return data;
    } catch (error) {
        
        return null;
    }
}

// Function to delete old employee shifts for a specific role, year, and month
async function deleteEmployeeWork(role, year, month) {
    console.log(`Deleting old employee shifts for role: ${role}, year: ${year}, month: ${month}`);
    try {
        const response = await fetch(`http://localhost:3050/workspace/employee/${role}/${year}/${month}/work`, {
            method: 'DELETE'
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
        const response = await fetch(`http://localhost:3050/workspace/${role}/${year}/${month}/daysOfWork`, {
            method: 'DELETE'
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
        const automateResponse = await fetch(`http://localhost:3050/workspace/automate/${role}/${year}/${month}/daysOfWork`, {
            method: 'PUT'
        });
        console.log(`Automate response status: ${automateResponse.status}`);
        if (!automateResponse.ok) {
            throw new Error('Error in automate request: ' + automateResponse.status);
        }
        const automateData = await automateResponse.json();
        console.log('Automated shifts generated successfully:', automateData);

        // Publish automated shifts
        const publishResponse = await fetch(`http://localhost:3050/workspace/employee/${role}/${year}/${month}/work`, {
            method: 'PUT'
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



    
 



