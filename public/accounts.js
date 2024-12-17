/*
 * Functions for the signup/login page. (index.html) 
 */


// Registers a new user to the Collector tables
async function registerCollector(event) {
    event.preventDefault();

    console.log("Registering");
    
    const nameValue = document.getElementById('registerName').value;
    const emailValue = document.getElementById('registerEmail').value;
    const passwordValue = document.getElementById('registerPassword').value;

    const response = await fetch("/register", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: nameValue,
            email: emailValue,
            password: passwordValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('registerCollectorResultMsg');

    if (responseData.success) {
        messageElement.textContent = "User registered successfully!";
    } else {
        messageElement.textContent = "Error registering user!";
    }
}

// Logs in a registered user
async function loginCollector(event) {
    event.preventDefault();
    
    const emailValue = document.getElementById('loginEmail').value;
    const passwordValue = document.getElementById('loginPassword').value;

    const response = await fetch("/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: emailValue,
            password: passwordValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('loginCollectorResultMsg');

    if (responseData.success) {
        // messageElement.textContent = "User logged in successfully!";
        window.location.href = '/home.html';
    } else {
        messageElement.textContent = "Error logging in user!";
    }
}




// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    document.getElementById("registerCollector").addEventListener("submit", registerCollector);
    document.getElementById("loginCollector").addEventListener("submit", loginCollector);

};