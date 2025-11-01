document.getElementById('registerForm').addEventListener('submit', function(e) {
    let email = document.getElementById('email').value;
    let studentId = document.getElementById('studentId').value;
    let password = document.getElementById('password').value;

    // Validate email - should end with @drexel.edu
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

    // Validate password - should not be less than 4 characters
    if (password.length < 4) {
        alert('Password must be at least 8 characters long.');
        e.preventDefault();
        return;
    }
});