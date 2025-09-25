// Função para navegar para a página de cadastro
function Cadastrar() {
  window.location.href = "Cadastrar.html";
}

// Função para salvar os dados do novo usuário
function realizarCadastro() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;

  // Verifica se ambos os campos foram preenchidos
  if (usuario && senha) {
    // Salva os dados no armazenamento local do navegador
    localStorage.setItem("usuarioCadastrado", usuario);
    localStorage.setItem("senhaCadastrada", senha);

    alert("Cadastro realizado com sucesso! \nVocê será redirecionado para a tela de login.");
    window.location.href = "index.html"; // Redireciona para a tela de login
  } else {
    alert("Por favor, preencha todos os campos.");
  }
}

// Função de login (modificada)
function entrar() {
  const usuarioInput = document.getElementById("usuario").value;
  const senhaInput = document.getElementById("senha").value;

  // Pega os dados salvos durante o cadastro
  const usuarioCadastrado = localStorage.getItem("usuarioCadastrado");
  const senhaCadastrada = localStorage.getItem("senhaCadastrada");

  // Verifica se o login corresponde ao usuário cadastrado OU ao usuário padrão
  if ((usuarioInput === usuarioCadastrado && senhaInput === senhaCadastrada) || (usuarioInput === "teste" && senhaInput === "1234")) {
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