
/* ========================= */
/* Funções de Cadastro/Login */
/* ========================= */

/* Criada a função para entrar e navegar na aba de cadastro */
function Cadastrar() {
    window.location.href = "cadastrar.html";
}

async function cadastrarUsuario() {
  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;
  const senha = document.getElementById("senha").value;
  const email = document.getElementById("email").value;
  const contato = document.getElementById("contato").value;

  if (nome && telefone && senha && email) {
        const resposta = await fetch("/usuarios/cadastrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, telefone, senha, email, contato })
        });

        if (resposta.ok) {
            const usuario = await resposta.json();
            localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
            alert("Login realizado com sucesso!");
            window.location.href = "painel.html";
        } else {
            const erro = await resposta.text();
            alert("Erro ao logar: " + erro);
        }
  } else {
      alert("Por favor, preencha todos os campos.");
  }
}
/* Criada a função para Lembrar acesso*/
window.onload = function() {
  const emailSalvo = localStorage.getItem("emailLembrado");
  if (emailSalvo) {
    const emailInput = document.getElementById("email");
    if (emailInput) {
      emailInput.value = emailSalvo;
    }
    const lembrarCheck = document.getElementById("lembrar");
    if (lembrarCheck) {
      lembrarCheck.checked = true;
    }
  }
}

async function loginUsuario() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const lembrar = document.getElementById("lembrar").checked;

  if (email && senha) {
    const resposta = await fetch("/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    if (resposta.ok) {
      const usuario = await resposta.json();
      localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
      // Lógica lembrar acesso
      if (lembrar) {
        localStorage.setItem("emailLembrado", email);
      } else {
        localStorage.removeItem("emailLembrado");
      }
      alert("Login realizado com sucesso!");
      window.location.href = "painel.html";
    } else {
      const erro = await resposta.text();
      alert("Erro ao logar: " + erro);
    }
  } else {
    alert("Por favor, preencha todos os campos.");
  }
}

const formRedefinir = document.getElementById("formRedefinirSenha");
if (formRedefinir) {
  formRedefinir.addEventListener("submit", async function(e) {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const telefone = document.getElementById("telefone").value;
  const senha = document.getElementById("senha").value;

  const resposta = await fetch("/usuarios/redefinir-senha", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, telefone, senha })
  });

  if (resposta.ok) {
    alert("Senha redefinida com sucesso!");
    window.location.href = "login.html";
  } else {
    const erro = await resposta.text();
    alert("Erro: " + erro);
  }
  });
}

/* Criada a função de sair do webApp */
function sair() {
    confirmacao = confirm("Deseja realmente sair do WebApp?")
    if (confirmacao) {
      localStorage.removeItem("usuarioLogado")
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

/* EMERGÊNCIA (Estrutura Botao + Ligar Emergencia) */

(function() {
  function abrirModalContatoUnico() {
    const modal = document.getElementById('modalContatoUnico');
    if (modal) modal.style.display = 'flex';
  }

  function fecharModalContatoUnico() {
    const modal = document.getElementById('modalContatoUnico');
    if (modal) modal.style.display = 'none';
  }

  function ligarNumero(telefone) {
    if (!telefone) return;
    const tel = telefone.toString().replace(/\D/g, '');
    if (!tel) return;
    window.location.href = `tel:${tel}`;
  }

  async function dispararEmergenciaFlow() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado || !usuarioLogado.id) {
      alert('Você precisa estar logado!');
      return;
    }

    try {
      await fetch(`/emergencias/disparar/${usuarioLogado.id}`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({descricao: 'Emergência acionada pelo botão SOS'})
      });
    } catch (err) {
      console.warn('Falha ao registrar emergência:', err);
    }

    const contatoRaw = usuarioLogado.contato || '';
    const contato = contatoRaw.toString().trim();

    const resumo = document.getElementById('contatoResumo');
    const btnLigar = document.getElementById('btnLigarContato');

    if (!resumo || !btnLigar) {
      alert('Contato: ' + contato || 'Nenhum contato cadastrado.');
      return;
    }

    if (!contato) {
      resumo.textContent = 'Nenhum contato cadastrado no seu perfil.';
      btnLigar.disabled = true;
      btnLigar.style.opacity = '0.6';
      btnLigar.onclick = null;
    } else {
      resumo.textContent = contato;
      btnLigar.disabled = false;
      btnLigar.style.opacity = '1';
      btnLigar.onclick = function() { ligarNumero(contato); };
    }

    abrirModalContatoUnico();
  }

  function initEmergencia() {
    const btn = document.getElementById('btnEmergencia');
    if (btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        dispararEmergenciaFlow();
      });
    }

    const modal = document.getElementById('modalContatoUnico');
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) fecharModalContatoUnico();
      });
    }

    window.fecharModalContatoUnico = fecharModalContatoUnico;
    window.ligarNumero = ligarNumero;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmergencia);
  } else {
    initEmergencia();
  }
})();
