import { useState } from "react";
import "./App.css";
import { registerUser } from "./api/mockApi";

const initialForm = {
  name: "",
  email: "",
  password: ""
};

const initialTouched = {
  name: false,
  email: false,
  password: false
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-z \-']+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=[\]{};':"\\|,.<>/?`~]).{8,}$/;

function validate(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (values.name.trim().length > 50) {
    errors.name = "Name must be at most 50 characters.";
  } else if (!nameRegex.test(values.name.trim())) {
    errors.name = "Name can contain letters, spaces, hyphens, and apostrophes only.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!emailRegex.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.includes(" ")) {
    errors.password = "Password must not contain spaces.";
  } else if (!passwordRegex.test(values.password)) {
    errors.password =
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
  }

  return errors;
}

function App() {
  const [formValues, setFormValues] = useState(initialForm);
  const [touched, setTouched] = useState(initialTouched);
  const [errors, setErrors] = useState({});
  const [apiMessage, setApiMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValues = { ...formValues, [name]: value };
    setFormValues(nextValues);
    setErrors(validate(nextValues));
    setApiMessage("");
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate(formValues));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const allTouched = Object.keys(initialTouched).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    const validationErrors = validate(formValues);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setApiMessage("Please fix validation errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    setApiMessage("");

    try {
      const response = await registerUser({
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        password: formValues.password
      });
      setApiMessage(response.message);
      setFormValues(initialForm);
      setTouched(initialTouched);
      setErrors({});
    } catch (error) {
      if (error.code === "EMAIL_TAKEN") {
        setErrors((prev) => ({
          ...prev,
          email: "This email is already in use."
        }));
        setApiMessage("Submission blocked: email must be unique.");
      } else if (error.message?.includes("Missing API configuration")) {
        setApiMessage(
          "API is not configured. Set VITE_API_BASE_URL in Vercel to your backend HTTPS URL."
        );
      } else {
        setApiMessage("Something went wrong while saving the form.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page">
      <section className="card">
        <header className="card-header">
          <h1>Create account</h1>
          <p className="subtitle">
            Join in a few seconds. All fields are required.
          </p>
        </header>

        <ul className="rules">
          <li>
            <span className="rule-title">Name</span> 2–50 characters, letters,
            spaces, hyphens, and apostrophes only.
          </li>
          <li>
            <span className="rule-title">Email</span> Valid format and must be
            unique.
          </li>
          <li>
            <span className="rule-title">Password</span> 8+ characters with
            uppercase, lowercase, number, and special character. No spaces.
          </li>
        </ul>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={formValues.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ada Lovelace"
              className={touched.name && errors.name ? "input error-input" : "input"}
            />
            {touched.name && errors.name && (
              <p className="error">{errors.name}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formValues.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="you@example.com"
              className={
                touched.email && errors.email ? "input error-input" : "input"
              }
            />
            {touched.email && errors.email && (
              <p className="error">{errors.email}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formValues.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="At least 8 characters"
              className={
                touched.password && errors.password
                  ? "input error-input"
                  : "input"
              }
            />
            {touched.password && errors.password && (
              <p className="error">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Create account"}
          </button>
        </form>

        {apiMessage && (
          <p
            className={
              apiMessage.toLowerCase().includes("success")
                ? "status status-success"
                : "status status-error"
            }
          >
            {apiMessage}
          </p>
        )}
      </section>
    </main>
  );
}

export default App
