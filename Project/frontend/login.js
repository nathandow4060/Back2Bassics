document.addEventListener("DOMContentLoaded", () => {
    // ---- LOGIN ----
    document.getElementById("login-btn").addEventListener("click", () => {
      let tag = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
  
      if (!tag || !password) {
        showError("Please enter your tag and password.");
        return;
      }
  
      if (!tag.startsWith("@")) tag = "@" + tag;
  
      fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag, password }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            showError(data.error);
          } else {
            localStorage.setItem("user_tag", data.user.Tag);
             // Save tag & role, then go to Landing
            localStorage.setItem("user_tag",  data.user.Tag);
            localStorage.setItem("user_role", data.user.Role);
            window.location.href = "./landing.html";
          }
        })
        .catch(err => {
          console.error("Login error:", err);
          showError("Server error. Try again.");
        });
    });
  
    function showError(msg) {
      const err = document.getElementById("login-error");
      err.textContent = msg;
      err.style.display = "block";
    }
  
    // ---- SIGNUP MODAL OPEN/CLOSE ----
    document.querySelector("a[href='#']").addEventListener("click", () => {
      document.getElementById("signup-modal").style.display = "block";
    });
  
    document.getElementById("close-signup").addEventListener("click", () => {
      document.getElementById("signup-modal").style.display = "none";
    });
  
    // ---- CREATE ACCOUNT ----
    document.getElementById("create-account-btn").addEventListener("click", () => {
      let tag = document.getElementById("new-tag").value.trim();
      const name = document.getElementById("full-name").value.trim();
      const pass = document.getElementById("new-password").value.trim();
      const confirm = document.getElementById("confirm-password").value.trim();
      const type = document.querySelector("input[name='user-type']:checked");
      const error = document.getElementById("signup-error");
  
      error.textContent = "";
  
      if (!tag || !name || !pass || !confirm || !type) {
        error.textContent = "Please fill out all fields.";
        return;
      }
  
      if (!tag.startsWith("@")) tag = "@" + tag;
  
      if (pass !== confirm) {
        error.textContent = "Passwords do not match.";
        return;
      }
  
      fetch("http://127.0.0.1:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tag,
          name,
          password: pass,
          role: type.value, // "artist" or "listener"
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            error.textContent = data.error;
          } else {
            alert("Account created! You can now log in.");
            document.getElementById("signup-modal").style.display = "none";
            // Clear form fields
            document.getElementById("new-tag").value = "";
            document.getElementById("full-name").value = "";
            document.getElementById("new-password").value = "";
            document.getElementById("confirm-password").value = "";
            document.getElementById("signup-error").textContent = "";
            const selected = document.querySelector("input[name='user-type']:checked");
            if (selected) selected.checked = false;
          }
        })
        .catch(err => {
          console.error("Signup error:", err);
          error.textContent = "Something went wrong.";
        });
    });
  });
  