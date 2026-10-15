
const form = document.getElementById("studentForm");
const passwordInput = document.getElementById("password");
const passwordConditions = document.getElementById("passwordConditions");
const phoneInput = document.getElementById("phone");
const message = document.getElementById("message");
const submitButton = form.querySelector('button[type="submit"]');

// Password validation rules
const rules = {
  length: /^.{8}$/,
  uppercase: /[A-Z]/,
  digit: /[0-9]/,
  special: /[@#$!]/,
  allowed: /^[A-Za-z0-9@#$!]*$/
};

const ruleMessages = {
  length: "Exactly 8 characters",
  uppercase: "At least one uppercase letter (A-Z)",
  digit: "At least one digit (0-9)",
  special: "At least one special character (@#$!)",
  allowed: "No spaces or unsupported characters"
};

// Show password conditions on focus
passwordInput.addEventListener("focus", () => {
  passwordConditions.hidden = false;
});

// Update conditions while typing
passwordInput.addEventListener("input", () => {
  const password = passwordInput.value;

  for (const [id, regex] of Object.entries(rules)) {
    const condition = document.getElementById(id);
    const isValid = regex.test(password);

    condition.classList.toggle("valid", isValid);
    condition.classList.toggle("invalid", !isValid);

    condition.textContent =
      (isValid ? "✓ " : "✗ ") + ruleMessages[id];
  }
});

// Hide conditions if the password is empty after leaving the field
passwordInput.addEventListener("blur", () => {
  if (passwordInput.value === "") {
    passwordConditions.hidden = true;
  }
});

// Restrict phone input to digits and 10 characters
phoneInput.addEventListener("input", () => {
  phoneInput.value = phoneInput.value
    .replace(/\D/g, "")
    .slice(0, 10);
});

// Check whether all password rules pass
function isPasswordValid(password) {
  return Object.values(rules).every((regex) => regex.test(password));
}

// Submit form to backend API
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  message.textContent = "";
  message.style.color = "red";

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = passwordInput.value;
  const phone = phoneInput.value;

  // Validate name
  if (!name) {
    message.textContent = "Please enter your full name.";
    return;
  }

  // Validate password
  if (!isPasswordValid(password)) {
    passwordConditions.hidden = false;
    message.textContent = "Please satisfy all password conditions.";
    passwordInput.focus();
    return;
  }

  // Validate phone
  if (!/^[0-9]{10}$/.test(phone)) {
    message.textContent = "Phone number must contain exactly 10 digits.";
    phoneInput.focus();
    return;
  }

  const student = {
    name,
    email,
    password,
    phone
  };

  try {
    submitButton.disabled = true;
    submitButton.textContent = "Registering...";

    const response = await fetch(
      "http://localhost:5000/api/students/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(student)
      }
    );

    const responseText = await response.text();

let result;

try {
  result = JSON.parse(responseText);
} catch {
  console.error("Server returned HTML or invalid JSON:", responseText);
  throw new Error(
    "Backend returned HTML instead of JSON. Check the server URL and API route."
  );
}

    if (!response.ok) {
      throw new Error(result.message || "Registration failed.");
    }

    message.style.color = "green";
    message.textContent =
      result.message || "Student registered successfully!";

    form.reset();
    passwordConditions.hidden = true;

    // Reset the password condition indicators
    for (const id of Object.keys(rules)) {
      const condition = document.getElementById(id);
      condition.classList.remove("valid");
      condition.classList.add("invalid");
      condition.textContent = "✗ " + ruleMessages[id];
    }

  } catch (error) {
    message.style.color = "red";
    message.textContent =
      error.message || "Unable to connect to the server.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Register";
  }
});
