document.getElementById('registerForm').addEventListener('submit', function(e) {
    let email = document.getElementById('email').value;
    let studentId = document.getElementById('studentId').value;

    // Validate Drexel email
    if (!email.endsWith('@drexel.edu')) {
        alert('Please use your Drexel email address.');
        e.preventDefault();
        return;
    }

    // Validate Drexel Student ID - should exactly be 8-digits
    if (!/^\d{8}$/.test(studentId)) {
        alert('Student ID must be 8 digits.');
        e.preventDefault();
        return;
    }
});