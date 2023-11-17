function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const btnID = document.getElementById("loginBtn");
btnID.addEventListener("click", (e) => {
    login(e);
})


const signUpForm = document.getElementById('signUpForm');
signUpForm.addEventListener('submit', (e) => {

    const passReg = document.getElementById('passReg').value;
    const rePassReg = document.getElementById('RePassReg').value;


    let formError = false;


    if (passReg.length < 8 || passReg.length > 20) {

        console.log(passReg);
        console.log(rePassReg);
        alert('password must be between 8 to 20 characters');
        formError = true;
    }

    if (passReg !== rePassReg) {
        alert(`Your password fields don't match`);
        formError = true;
    }

    if (!formError) {

        register(e);
    }
    else {
        e.preventDefault();
    }

})
async function register(e) {
    e.preventDefault();
    const username = document.getElementById('usernameReg').value;
    const useremail = document.getElementById('useremailReg').value;
    const password = document.getElementById('passReg').value;

    try {
        const response = await fetch('http://localhost:3000/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, useremail, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.error);
        }
        else {

            const successMessage = await response.json();
            alert(successMessage.message);
            window.location.href = '/';
        }


        // Redirect or perform other actions after successful signup
    } catch (error) {
        // Handle signup failure
        console.error('Signup failed:', error.message);
    }
}





async function login(e) {
    e.preventDefault();
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }

        // Assuming the server responds with a token
        const { token } = await response.json();

        // Store the token in localStorage or a secure place for subsequent requests
        localStorage.setItem('token', token);

        // Redirect or perform other actions after successful login
        window.location.href = '/home';
    } catch (error) {
        // Handle login failure
        alert(`Login failed: ${error.message}`);
    }
}