const signInBtn = document.getElementById("signIn");
const signUpBtn = document.getElementById("signUp");
const firstForm = document.getElementById("form1");
const secondForm = document.getElementById("form2");
const container = document.querySelector(".container");

signInBtn.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
});

signUpBtn.addEventListener("click", () => {
    container.classList.add("right-panel-active");
});

// Handle form submission for firstForm (Sign Up)
firstForm.addEventListener("submit", (e) => {
    // Optional: Handle any validation here
    // Example:
    const name = firstForm.querySelector("input[name='name']").value;
    if (name.trim() === "") {
        alert("Name is required!");
        e.preventDefault(); // Prevent submission if validation fails
        return; // Exit the function
    }
    // Form will submit normally if validation passes
});

// Handle form submission for secondForm (Sign In)
secondForm.addEventListener("submit", (e) => {
    // Optional: Handle any validation here
    // Example:
    const email = secondForm.querySelector("input[name='email']").value;
    if (email.trim() === "") {
        alert("Email is required!");
        e.preventDefault(); // Prevent submission if validation fails
        return; // Exit the function
    }
    // Form will submit normally if validation passes
});
