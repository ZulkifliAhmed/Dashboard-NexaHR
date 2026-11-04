// ========== Login Elements ==========

const loginForm = document.querySelector("#loginForm");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");

const togglePassword = document.querySelector("#togglePassword");
const loginMessage = document.querySelector("#loginMessage");
const rememberMe = document.querySelector("#rememberMe");

// ========== Demo Account ==========

const demoAccount = {
    email: "ahmed@nexahr.com",
    password: "Admin123"
};

// ========== Check Login Status ==========

if (
    localStorage.getItem("nexahrLoggedIn") === "true" ||
    sessionStorage.getItem("nexahrLoggedIn") === "true"
) {
    window.location.href = "index.html";
}

// ========== Show / Hide Password ==========

togglePassword.addEventListener("click", function () {
    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";

    this.innerHTML = isPassword
        ? '<i class="fa-regular fa-eye-slash"></i>'
        : '<i class="fa-regular fa-eye"></i>';

    this.setAttribute(
        "aria-label",
        isPassword ? "Hide password" : "Show password"
    );
});


// ========== Login Form ==========

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    // Validate Login Information
    if (
        email === demoAccount.email &&
        password === demoAccount.password
    ) {
        // Save Login Status
        if (rememberMe.checked) {
            localStorage.setItem("nexahrLoggedIn", "true");
            localStorage.setItem("nexahrUser", email);
        } else {
            sessionStorage.setItem("nexahrLoggedIn", "true");
            sessionStorage.setItem("nexahrUser", email);
        }

        // Redirect to Dashboard
        window.location.href = "index.html";

    } else {
        loginMessage.textContent = "Invalid email or password.";

        passwordInput.value = "";
        passwordInput.focus();
    }
});