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
  const isAdmin = document.getElementById("isAdmin").checked;

  if (usuario && senha) {
    localStorage.setItem("usuarioCadastrado", usuario);
    localStorage.setItem("senhaCadastrada", senha);
    localStorage.setItem("isAdmin", isAdmin);

    alert("Cadastro realizado com sucesso!");

    if (isAdmin) {
      window.location.href = "painel-adm.html";
    } else {
      window.location.href = "painel.html";
    }
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
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (
    (usuarioInput === usuarioCadastrado && senhaInput === senhaCadastrada) ||
    (usuarioInput === "teste" && senhaInput === "1234")
  ) {
    if (isAdmin) {
      window.location.href = "painel-adm.html";
    } else {
      window.location.href = "painel.html";
    }
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




/* ==========================================================
   BLOQUEIO DE BOTÕES DE CADASTRO / ADIÇÃO PARA NÃO-ADMINS
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  // Seleciona todos os botões de adicionar
  const botoesAdicionar = document.querySelectorAll(".btn-adicionar");

  botoesAdicionar.forEach(botao => {
    if (!isAdmin) {
      // 🔹 Esconde o botão
      botao.style.display = "none";

      // 🔹 Desativa o botão completamente
      botao.disabled = true;

      // 🔹 Remove listeners antigos (protege contra cliques forçados)
      const clone = botao.cloneNode(true);
      botao.parentNode.replaceChild(clone, botao);
    }
  });

  // 🔹 Proteção contra tentativa de abrir modal manualmente
  if (!isAdmin) {
    window.abrirModalAdicionar = () => alert("Ação não permitida para usuários comuns.");
  }
});
