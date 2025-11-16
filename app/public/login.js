document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (res.ok) {
    console.log("Login success:", data);

    // Verify with whoami
    const who = await fetch("/auth/whoami");
    const whoJson = await who.json();
    console.log("whoami:", whoJson);

    // Redirect after login
    window.location.href = "/";
  } else {
    document.getElementById("msg").textContent = data.message || "Login failed.";
  }
});
