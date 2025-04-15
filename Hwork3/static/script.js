// script.js

// Async function to submit a loan application including an address
async function submitApplication() {
    // Get values from input fields for applicant name, zipcode, and address (if available)
    const applicantName = document.getElementById('applicantName').value;
    const zipcode = document.getElementById('zipcode').value;
    // If there's an input with id 'address', capture its value; otherwise, set to empty string
    const address = document.getElementById('address') ? document.getElementById('address').value : "";

    // Create the JSON object with the enhanced application data
    const applicationData = {
        name: applicantName,
        zipcode: zipcode,
        address: address  // New field for the full address
        // The server will assign "status" as "received" and initialize "notes" array.
    };

    try {
        // Send the application data to the backend via a POST request
        const response = await fetch('/api/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applicationData)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to submit application');
        }
        // Alert the user with the returned application number
        alert(`Application submitted successfully! Your application number is: ${data.application_number}`);
        // (Optional) Log or maintain the application data locally
        console.log('Submitted application:', { ...applicationData, application_number: data.application_number });
    } catch (error) {
        alert(error.message);
        console.error('Error submitting application:', error);
    }
}

// Async function to check the status of an application by its number
async function checkStatus() {
    const appNumber = document.getElementById('appNumber').value;

    try {
        // Send a GET request to the server for a specific application number
        const response = await fetch(`/api/status/${appNumber}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error('Application not found');
        }
        // Display the current status in the designated output element
        document.getElementById('statusOutput').textContent = `Status: ${data.status}`;
    } catch (error) {
        document.getElementById('statusOutput').textContent = `Error: ${error.message}`;
    }
}

// Async function to change the status of a specific application
async function changeStatus() {
    const appNumber = document.getElementById('changeAppNumber').value;
    const newStatus = document.getElementById('newStatus').value;
    
    const statusUpdate = {
        application_number: parseInt(appNumber, 10),
        new_status: newStatus
    };

    try {
        // Send the new status to the server via a POST request
        const response = await fetch('/api/change_status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(statusUpdate)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error('Failed to update status');
        }
        // Update the UI with the confirmation message
        document.getElementById('changeStatusOutput').textContent = data.message;
    } catch (error) {
        document.getElementById('changeStatusOutput').textContent = `Error: ${error.message}`;
    }
}

// Async function to display all submitted applications (for testing purposes)
async function showAllApplications() {
    try {
        // Fetch all application records from the server
        const response = await fetch('/api/applications');
        const data = await response.json();
        const appList = document.getElementById('applicationList');
        appList.innerHTML = ""; // Clear the current list

        // For each application returned, create HTML to display its details
        data.applications.forEach(app => {
            const appElement = document.createElement('div');
            appElement.innerHTML = `
                <h3>Application #${app.application_number}</h3>
                <p>Name: ${app.name}</p>
                <p>Zipcode: ${app.zipcode}</p>
                <p>Status: ${app.status}</p>
                ${app.address ? `<p>Address: ${app.address}</p>` : ""}
            `;
            appList.appendChild(appElement);
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
    }
}

// Optionally, add a DOMContentLoaded event to initialize any required functions
document.addEventListener("DOMContentLoaded", () => {
    // Initialize components if necessary
    console.log("Loan Application Portal is ready.");
});
