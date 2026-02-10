function toggle(inputId, buttonId) {
  const input = document.getElementById(inputId)
  const btn = document.getElementById(buttonId)
  if (!input || !btn) return

  btn.addEventListener("click", () => {
    const isPassword = input.type === "password"
    input.type = isPassword ? "text" : "password"
    btn.textContent = isPassword ? "Hide Password" : "Show Password"
  })
}

toggle("password", "togglePassword")
toggle("newPassword", "toggleNewPassword")
