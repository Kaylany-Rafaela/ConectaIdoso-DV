/* ========================= */
/* Funções de Cadastro/Login */
/* ========================= */

/* Criada a função para entrar e navegar na aba de cadastro */
function cadastrar() {
    window.location.href = "cadastrar.html";
}

/* Criada a função de login e senha, onde tem verificação de dados */
function entrar() {
  const usuarioInput = document.getElementById("usuario").value.trim(); // Pega o que foi digitado (Telefone/Email/Nome)
  const senhaInput = document.getElementById("senha").value;

  // Credenciais salvas no localStorage
  const usuarioCadastrado = localStorage.getItem("usuarioCadastrado"); // Telefone do Usuário ou Telefone do Idoso
  const senhaCadastrada = localStorage.getItem("senhaCadastrada"); // Senha do Usuário ou Senha do Admin
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  
  // Novos campos para flexibilizar o login (Idoso e Admin)
  const nomeUsuario = localStorage.getItem("nomeUsuario"); // NOVO: Nome do Idoso não-admin
  const nomeAdm = localStorage.getItem("nomeAdm");
  const emailAdm = localStorage.getItem("emailAdm"); 
  const nomeIdoso = localStorage.getItem("nomeIdoso"); // Nome do Idoso (ligado ao Admin)
  
  // 1. Definição da Identidade: Verifica se o input corresponde a alguma das credenciais salvas
  let credencialCorreta = false;
  
  if (!isAdmin) {
      // 🚨 NOVO: Lógica para USUÁRIO COMUM (Idoso não-admin)
      // O Idoso pode logar com o Telefone OU o Nome
      if (usuarioInput === usuarioCadastrado || usuarioInput === nomeUsuario) {
          credencialCorreta = true;
      }
  } else if (isAdmin) {
      // Lógica para ADMINISTRADOR (pode logar com 4 opções)
      // Verifica Telefone do Idoso (usuarioCadastrado), Nome do Admin, Email do Admin ou Nome do Idoso
      if (usuarioInput === usuarioCadastrado || usuarioInput === nomeAdm || usuarioInput === emailAdm || usuarioInput === nomeIdoso) {
          credencialCorreta = true;
      }
  }

  // 2. Verificação Final: Se a credencial foi identificada E a senha corresponde
  if (
    (credencialCorreta && senhaInput === senhaCadastrada) ||
    (usuarioInput === "teste" && senhaInput === "1234") // Login de teste
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

/* ======================== */
/* NAVEGAÇÃO DINÂMICA       */
/* ======================== */

/**
 * Função inteligente para voltar ao painel correto
 * baseado em quem está logado.
 */
function voltarParaPainel() {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  
  if (isAdmin) {
    window.location.href = "painel-adm.html";
  } else {
    window.location.href = "painel.html";
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
  // Proteção para não quebrar em páginas que não têm calendário
  if (!diasEl) return; 
  
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