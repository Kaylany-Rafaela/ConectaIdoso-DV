// Função de login (exemplo básico)
function entrar() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;

  if (usuario === "teste" && senha === "1234") {
    window.location.href = "painel.html";
  } else {
    alert("Usuário ou senha incorretos!");
  }
}

// Sair do app
function sair() {
  if (confirm("Deseja realmente sair do aplicativo?")) {
    window.location.href = "index.html";
  }
}

// Exemplo de botão de emergência
function chamarEmergencia() {
  alert("🚨 Ligando para o contato de emergência...");
}
