
// Load Form from Local Storage
function loadForm() {
    var formdata = JSON.parse(localStorage.getItem('dataForm'));
    if (formdata) {
        document.getElementById('date').value = formdata.date;
        document.getElementById('vehicleNumber').value = formdata.vehicleNumber;
        document.getElementById('vehicleVariant').value = formdata.vehicleVariant;
        document.getElementById('fe1Expiry').value = formdata.fe1Expiry;
        document.getElementById('fe2Expiry').value = formdata.fe2Expiry;
        document.getElementById('startTime').value = formdata.startTime;
        document.getElementById('startEngineHour').value = formdata.startEngineHour;
        document.getElementById('endTime').value = formdata.endTime;
        document.getElementById('endEngineHour').value = formdata.endEngineHour;
        document.getElementById('polLevel').value = formdata.polLevel;
        document.getElementById('batteryVoltage').value = formdata.batteryVoltage;
        document.getElementById('remarks').value = formdata.remarks;
    }
}
window.onload = loadForm;

function submitForm() {
    var formdata = copyToClipboard();
    if (!!formdata) { //If validation passes 
        fetch("https://script.google.com/macros/s/AKfycbxWDIX-eqA604ZwfPj7WbU0-5I4lAb1z088Jx2sbYPul-j6sb_XbW1pm2pgOzH9ix-J/exec", {
            redirect: "follow",
            method: "POST",
            body: JSON.stringify(formdata)
        })
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    throw new Error(response.statusText);
                }
            })
            .then(data => {
                showToast("Form submitted successfully!", "success", 5000);
                // console.log('Response:', data); // Log response
                document.getElementById('dataForm').reset();
            })
            .catch(error => {
                showToast("An error occurred. Please try again later.", "success", 5000);
            });
    }
}

function getFormFields() {
    // Get input field values
    var date = document.getElementById("date").value;
    var vehicleNumber = document.getElementById("vehicleNumber").value;
    var vehicleVariant = document.getElementById("vehicleVariant").value;
    var fe1Expiry = document.getElementById("fe1Expiry").value;
    var fe2Expiry = document.getElementById("fe2Expiry").value;
    var startTime = document.getElementById("startTime").value;
    var startEngineHour = document.getElementById("startEngineHour").value;
    var endTime = document.getElementById("endTime").value;
    var endEngineHour = document.getElementById("endEngineHour").value;
    var polLevel = document.getElementById("polLevel").value;
    var batteryVoltage = document.getElementById("batteryVoltage").value;
    var remarks = document.getElementById("remarks").value;

    var EngineHourDiff = parseFloat(endEngineHour - startEngineHour).toFixed(1)   //round to 1dp (optional)
    var startDT = new Date("1/1/1999 " + startTime);                            //arbitrary date to use date difference
    var endDT = new Date("1/1/1999 " + endTime);                                //returns unix time
    var GenTimeDiff = ((endDT.getTime() - startDT.getTime()) / 60000).toFixed(1)  //divide by 60*1000 to get minutes
    return {
        date: date,
        vehicleNumber: vehicleNumber,
        vehicleVariant: vehicleVariant,
        fe1Expiry: fe1Expiry,
        fe2Expiry: fe2Expiry,
        startTime: startTime,
        startEngineHour: startEngineHour,
        endTime: endTime,
        endEngineHour: endEngineHour,
        EngineHourDiff: EngineHourDiff,
        GenTimeDiff: GenTimeDiff,
        polLevel: polLevel,
        batteryVoltage: batteryVoltage,
        remarks: remarks
    }
}

function copyToClipboard() {
    // Get form fields
    if (!$('#dataForm')[0].checkValidity()) {
        $('#dataForm')[0].reportValidity() //Show HTML5 Built-In Validation
        var invalidFields = Array.from($('#dataForm')[0].querySelectorAll(':invalid'));
        // var errorMessage = invalidFields.map(field => field.validationMessage).join('\n');
        var errorMessage = invalidFields[0].validationMessage
        showToast(errorMessage, "warning", 5000);
        return false;
    }
    var {
        date,
        vehicleNumber,
        vehicleVariant,
        fe1Expiry,
        fe2Expiry,
        startTime,
        startEngineHour,
        endTime,
        endEngineHour,
        EngineHourDiff,
        GenTimeDiff,
        polLevel,
        batteryVoltage,
        remarks
    } = getFormFields();

    //***** VALIDATION *****//
    date = new Date(date).toLocaleDateString('en-sg', { day: "numeric", month: "long", year: "numeric" });
    fe1Expiry = new Date(fe1Expiry).toLocaleDateString('en-sg', { month: "long", year: "numeric" });
    fe2Expiry = new Date(fe2Expiry).toLocaleDateString('en-sg', { month: "long", year: "numeric" });

    // Check if end time is ahead of start time
    var startDateTime = new Date(date + " " + startTime);
    var endDateTime = new Date(date + " " + endTime);
    if (endDateTime < startDateTime) {
        showToast("End Time must be ahead of Start Time.", "warning", 5000);
        return false;
    }

    // Check if end engine hour is more than start engine hour
    else if (parseFloat(endEngineHour) <= parseFloat(startEngineHour)) {
        showToast("End Engine Hour must be more than Start Engine Hour.", "warning", 5000);
        return false;
    }

    else {
        // Concatenate values
        var copiedText = "Date: " + date + "\n" +
            "Vehicle Number: " + vehicleNumber + " MID\n" +
            "Vehicle Variant: " + vehicleVariant + "\n" +
            "FE1 Expiry: " + fe1Expiry + "\n" +
            "FE2 Expiry: " + fe2Expiry + "\n" +
            "Start Time: " + startTime + "\n" +
            "Start Engine Hour: " + startEngineHour + "\n" +
            "End Time: " + endTime + "\n" +
            "End Engine Hour: " + endEngineHour + "\n" +
            "Gen. Run Results: " + `${EngineHourDiff} Engine Hours in ${GenTimeDiff} Minutes.\n` +
            "POL Level: " + polLevel + " Bar(s)\n" +
            "Battery Voltage: " + batteryVoltage + " Volts\n\n" +
            "Remarks / faults (if any): \n--------------------------\n" + remarks;

        // Copy to clipboard
        navigator.clipboard.writeText(copiedText).then(function () {
            showToast("Copied to clipboard!", "success", 5000);
        }, function () {
            showToast("Failed to copy to clipboard!", "error", 5000);
        });
        return true
    }

}

function updateRangeOutput(rangeId, outputId) {
    document.getElementById(outputId).innerText = document.getElementById(rangeId).value;
}

function devFill() {
    document.getElementById('date').value = '2024-03-22'
    document.getElementById('vehicleNumber').value = "12345"
    document.getElementById('vehicleVariant').value = "DSM's Car"
    document.getElementById('fe1Expiry').value = "2025-10"
    document.getElementById('fe2Expiry').value = "2025-10"
    document.getElementById('startTime').value = "12:30"
    document.getElementById('startEngineHour').value = "1234"
    document.getElementById('endTime').value = "13:30"
    document.getElementById('endEngineHour').value = "1235"
    document.getElementById('polLevel').value = "6"
    document.getElementById('batteryVoltage').value = "27"
    document.getElementById('remarks').value = "[THIS IS A SAMPLE SUBMISSION]"
}

function resetForm() {
    document.getElementById('dataForm').reset();
    localStorage.clear();
}

// Save Form to Local Stoage
window.addEventListener("DOMContentLoaded", (event) => {
    const form = document.getElementById('dataForm');
    function saveForm() {
        var formdata = getFormFields();
        localStorage.setItem('dataForm', JSON.stringify(formdata));
    }
    if (form) {
        form.addEventListener('input', saveForm);
    }
});