/* ========================= */
/* Funções de Cadastro/Login */
/* ========================= */

/* Criada a função para entrar e navegar na aba de cadastro */
function Cadastrar() {
    window.location.href = "cadastrar.html";
}

/* Criada a função para salvar os dados de novos usuários */
function realizarCadastro() {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if (usuario && senha) {
        localStorage.setItem("usuarioCadastrado", usuario);
        localStorage.setItem("senhaCadastrada", senha);

        alert("Cadastro realizado com sucesso! \n Você será redirecionado para o painel.");
        window.location.href = "painel.html";
    } else {
        alert("Por favor, preencha todos os campos.");
    }
}

/* Criada a função de login e senha, onde tem verificação de dados */
function entrar() {
    const usuarioInput = document.getElementById("usuario").value;
    const senhaInput = document.getElementById("senha").value;

    const usuarioCadastrado = localStorage.getItem("usuarioCadastrado");
    const senhaCadastrada = localStorage.getItem("senhaCadastrada");

    if (
        (usuarioInput === usuarioCadastrado && senhaInput === senhaCadastrada) ||
        (usuarioInput === "teste" && senhaInput === "1234")
    ) {
        window.location.href = "painel.html";
    } else {
        alert("Usuário ou senha incorretos!");
    }
}

/* Criada a função de sair do webApp */
function sair() {
    if (confirm("Deseja realmente sair do WebApp?")) {
        window.location.href = "login.html";
    }
}

/* Criada a função para alertar no botão de emergência */
function chamarEmergencia() {
    alert("🚨 Ligando para o contato de emergência...");
}


/* ======================== */
/* CHAT - Envio de Mensagens */
/* ======================== */

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("inputMensagem");
  const btnEnviar = document.getElementById("btnEnviar");
  const areaMensagens = document.getElementById("areaMensagens");

  if (input && btnEnviar && areaMensagens) {
    function adicionarMensagem(texto, tipo) {
      if (!texto) return;
      const msg = document.createElement("div");
      msg.className = "mensagem " + tipo;
      msg.textContent = texto;
      areaMensagens.appendChild(msg);
      areaMensagens.scrollTop = areaMensagens.scrollHeight;
    }

    function enviarMensagem() {
      const texto = input.value.trim();
      if (texto === "") return;
      adicionarMensagem(texto, "enviada");
      input.value = "";
      input.focus();
    }

    btnEnviar.addEventListener("click", (e) => {
      e.preventDefault();
      enviarMensagem();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        enviarMensagem();
      }
    });
  }
});

// Função para gerar o calendário atual
function gerarCalendario() {
  const diasEl = document.getElementById("dias");
  diasEl.innerHTML = "";

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();

  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  const inicioSemana = primeiroDia.getDay();
  const diasMes = ultimoDia.getDate();

  let data = 1;
  for (let i = 0; i < 6; i++) {
    let linha = document.createElement("tr");
    for (let j = 0; j < 7; j++) {
      let celula = document.createElement("td");
      if (i === 0 && j < inicioSemana) {
        celula.textContent = "";
      } else if (data > diasMes) {
        celula.textContent = "";
      } else {
        celula.textContent = data;
        if (
          data === hoje.getDate() &&
          mes === hoje.getMonth() &&
          ano === hoje.getFullYear()
        ) {
          celula.classList.add("hoje");
        }
        data++;
      }
      linha.appendChild(celula);
    }
    diasEl.appendChild(linha);
  }
}

// Inicializa ao carregar a página
document.addEventListener("DOMContentLoaded", gerarCalendario);
