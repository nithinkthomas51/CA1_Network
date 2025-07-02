document.addEventListener("DOMContentLoaded", () => {
  const addUserLink = document.getElementById("addUserLink");
  const usersLink = document.getElementById("usersLink");
  const addUserSection = document.getElementById("addUserSection");
  const usersSection = document.getElementById("usersSection");
  const userForm = document.getElementById("userForm");
  const message = document.getElementById("message");
  const userCards = document.getElementById("userCards");

  function showSection(section) {
    addUserSection.classList.add("hidden");
    usersSection.classList.add("hidden");
    section.classList.remove("hidden");
  }

  addUserLink.addEventListener("click", (e) => {
    e.preventDefault();
    showSection(addUserSection);
    message.textContent = "";
  });

  usersLink.addEventListener("click", async (e) => {
    e.preventDefault();
    showSection(usersSection);
    userCards.innerHTML = "";
    try {
      const res = await fetch("http://3.250.199.103:3000/users");
      const users = await res.json();
      users.forEach((user) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<strong>${user.name}</strong><br>${user.email}`;
        userCards.appendChild(card);
      });
    } catch (err) {
      console.log(err.message);
      userCards.innerHTML = "<p>Failed to load users.</p>";
    }
  });

  userForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(userForm);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
    };

    try {
      const res = await fetch("http://3.250.199.103:3000/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        message.textContent = "User added successfully!";
        userForm.reset();
      } else {
        message.textContent = "Failed to add user.";
      }
    } catch (err) {
      message.textContent = "Server error.";
    }
  });
});
