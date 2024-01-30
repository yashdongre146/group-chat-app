const name = document.getElementById('name');
const email = document.getElementById('email');
const number = document.getElementById('number');
const password = document.getElementById('password');

function signup(e) {
    e.preventDefault();
    const userDetails = {
        name: name.value,
        email: email.value,
        number: number.value,
        password: password.value
    };

    axios.post('/signup', userDetails)
        .then((res) => {
            window.location.href = '/login';
        })
        .catch((err) => {
            if (err) {
                alert("Email must be unique"); // Access the error response data
            }
        });
}