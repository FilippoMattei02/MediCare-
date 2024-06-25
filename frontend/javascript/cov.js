const currentToken = localStorage.getItem('token');
document.getElementById('coverageForm').addEventListener('submit', function(event) {
    event.preventDefault();
    sendRequest();
});

function sendRequest() {
   
    const employeeId = document.getElementById('employeeId').value;
    const date = document.getElementById('date').value;
    const role = document.getElementById('role').value;
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;
    const message = document.getElementById('message').value;

    if (!currentToken) {
        console.error('No token found');
        return;
    }

    fetch('https://medicare-p67f.onrender.com/auth/tokens', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            

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

        fetch(`https://medicare-p67f.onrender.com/coverage/${role}/${username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': currentToken
            },
            body: JSON.stringify({
                day: date,
                start: start,
                end: end,
                message: message
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error creating coverage request: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('response').innerText = "Coverage request created successfully!";
            console.log("Coverage request response:", data);
        })
        .catch(error => {
            document.getElementById('response').innerText = error.message;
            console.error('Error creating coverage request:', error.message);
        });
    })
    .catch(error => {
        console.error('Error during token verification:', error);
        alert("Invalid credentials or network error.");
    });
}
