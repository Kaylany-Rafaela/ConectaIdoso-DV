
/* ========================= */
/* Funções de Cadastro/Login */
/* ========================= */

/* Criada a função para entrar e navegar na aba de cadastro */
function Cadastrar() {
    window.location.href = "cadastrar.html";
}

async function cadastrarUsuario() {
  const nome = document.getElementById("nome") ? document.getElementById("nome").value : null;
  const telefone = document.getElementById("telefone") ? document.getElementById("telefone").value : null;
  const senha = document.getElementById("senha") ? document.getElementById("senha").value : null;
  const email = document.getElementById("email") ? document.getElementById("email").value : null;

  if (!(nome && telefone && senha && email)) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  try {
    const usuario = await registerUser({ nome, telefone, senha, email });
    // usuário comum -> painel
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
    localStorage.setItem("isAdmin", false);
    alert("Cadastro realizado com sucesso!");
    window.location.href = "painel.html";
  } catch (err) {
    alert("Erro ao cadastrar: " + err.message || err);
  }
}

// função genérica para registrar um usuário no backend e retornar o objeto salvo
async function registerUser(usuarioObj) {
  const resposta = await fetch("/usuarios/cadastrar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuarioObj)
  });

  if (!resposta.ok) {
    const texto = await resposta.text();
    throw new Error(texto || 'Erro no servidor');
  }

  return await resposta.json();
}

// fluxo de cadastro/associação para administradores
async function cadastrarAdminFlow() {
  // dados do idoso
  const nomeIdoso = document.getElementById("nomeIdoso").value;
  const telefoneIdoso = document.getElementById("telefoneIdoso").value;
  const emailIdoso = document.getElementById("emailIdoso") ? document.getElementById("emailIdoso").value : '';
  const senhaIdoso = document.getElementById("senhaIdoso") ? document.getElementById("senhaIdoso").value : '';
  const enderecoIdoso = document.getElementById("enderecoIdoso") ? document.getElementById("enderecoIdoso").value : '';

  // dados do admin
  const nomeAdm = document.getElementById("nomeAdm").value;
  const telefoneAdm = document.getElementById("telefoneAdm").value;
  const emailAdm = document.getElementById("emailAdm").value;
  const senhaAdm = document.getElementById("senhaAdm").value;
  const enderecoAdm = document.getElementById("enderecoAdm") ? document.getElementById("enderecoAdm").value : '';

  if (!(nomeIdoso && telefoneIdoso && nomeAdm && telefoneAdm && emailAdm && senhaAdm)) {
    alert('Por favor, preencha todos os campos do administrador e do idoso.');
    return;
  }

  try {
    // chama o novo endpoint que associa o admin ao idoso existente e cria o admin
    const payload = {
      nomeAdm: nomeAdm,
      telefoneAdm: telefoneAdm,
      emailAdm: emailAdm,
      senhaAdm: senhaAdm,
      telefoneIdoso: telefoneIdoso,
      emailIdoso: emailIdoso,
      enderecoIdoso: enderecoIdoso,
      enderecoAdm: enderecoAdm
    };

    const resposta = await fetch('/usuarios/associar-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!resposta.ok) {
      const txt = await resposta.text();
      throw new Error(txt || 'Erro ao associar administrador');
    }

    const adminSalvo = await resposta.json();
    localStorage.setItem('usuarioLogado', JSON.stringify(adminSalvo));
    localStorage.setItem('isAdmin', true);
    alert('Administrador cadastrado e associado com sucesso!');
    window.location.href = 'painel-adm.html';
  } catch (err) {
    alert('Erro no cadastro do administrador: ' + (err.message || err));
  }
}

// função exposta para o botão de cadastro decidir qual fluxo usar
function cadastrarOrAssociate() {
  const isAdmin = document.getElementById('isAdmin').checked;
  if (isAdmin) {
    cadastrarAdminFlow();
  } else {
    cadastrarUsuario();
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
      // Redireciona conforme role (isAdmin)
      const isAdmin = usuario.isAdmin === true || usuario.isAdmin === 'true' || usuario.isAdmin === 1;
      if (isAdmin) {
        localStorage.setItem("isAdmin", true);
        alert("Login de administrador realizado com sucesso!");
        window.location.href = "painel-adm.html";
      } else {
        localStorage.setItem("isAdmin", false);
        alert("Login realizado com sucesso!");
        window.location.href = "painel.html";
      }
    } else {
      const erro = await resposta.text();
      alert("Erro ao logar: " + erro);
    }
  } else {
    alert("Por favor, preencha todos os campos.");
  }
}

/* ==========================
   Funções para recuperar usuário do servidor
   ========================== */

async function fetchUsuarioPorId(id) {
  if (!id) throw new Error('id ausente');
  const resposta = await fetch(`/usuarios/${id}`);
  if (!resposta.ok) {
    const txt = await resposta.text();
    throw new Error(txt || 'Usuário não encontrado');
  }
  return await resposta.json();
}

async function fetchUsuarioPorTelefone(telefone) {
  if (!telefone) throw new Error('telefone ausente');
  const resposta = await fetch(`/usuarios/por-telefone/${encodeURIComponent(telefone)}`);
  if (!resposta.ok) {
    const txt = await resposta.text();
    throw new Error(txt || 'Usuário não encontrado');
  }
  return await resposta.json();
}

// Garante que localStorage.usuarioLogado esteja preenchido com dados do servidor quando possível.
// Retorna o objeto usuario (do localStorage ou recém-buscado) ou null.
async function buscarEAtualizarUsuarioLogado() {
  try {
    const raw = localStorage.getItem('usuarioLogado');
    let usuario = null;
    if (raw) {
      try { usuario = JSON.parse(raw); } catch (e) { usuario = null; }
    }

    // Se já temos id e informações, retorna
    if (usuario && usuario.id) return usuario;

    // Tentar obter telefone em chaves locais
    const possiveisTelefones = [];
    if (usuario) {
      if (usuario.telefone) possiveisTelefones.push(usuario.telefone);
      if (usuario.contato) possiveisTelefones.push(usuario.contato);
    }
    const localTelefoneIdoso = localStorage.getItem('telefoneIdoso');
    const localTelefoneAdm = localStorage.getItem('telefoneAdm');
    if (localTelefoneIdoso) possiveisTelefones.push(localTelefoneIdoso);
    if (localTelefoneAdm) possiveisTelefones.push(localTelefoneAdm);

    // Remover duplicatas e vazios
    const telefones = Array.from(new Set(possiveisTelefones.map(t => (t||'').toString().trim()).filter(Boolean)));

    for (const tel of telefones) {
      try {
        const servidorUsuario = await fetchUsuarioPorTelefone(tel);
        if (servidorUsuario) {
          localStorage.setItem('usuarioLogado', JSON.stringify(servidorUsuario));
          return servidorUsuario;
        }
      } catch (e) {
        // tenta próximo telefone
        console.debug('fetchUsuarioPorTelefone falhou para', tel, e.message || e);
      }
    }

    return usuario; // pode ser null
  } catch (e) {
    console.warn('buscarEAtualizarUsuarioLogado falhou:', e);
    return null;
  }
}

// Exportar globalmente para páginas estáticas acessarem
window.fetchUsuarioPorId = fetchUsuarioPorId;
window.fetchUsuarioPorTelefone = fetchUsuarioPorTelefone;
window.buscarEAtualizarUsuarioLogado = buscarEAtualizarUsuarioLogado;

// Função global para voltar ao painel correto dependendo do tipo de usuário (admin ou não)
function voltarParaPainel() {
  try {
    const isAdminRaw = localStorage.getItem('isAdmin');
    const isAdmin = isAdminRaw === true || isAdminRaw === 'true' || (typeof isAdminRaw === 'string' && JSON.parse(isAdminRaw) === true);
    if (isAdmin) {
      window.location.href = 'painel-adm.html';
    } else {
      window.location.href = 'painel.html';
    }
  } catch (e) {
    // fallback
    window.location.href = 'painel.html';
  }
}
window.voltarParaPainel = voltarParaPainel;

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
/* CHAT - Integração GPT (Tom) */
/* ======================== */

// Histórico da conversa para manter contexto
let chatHistory = [];

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("inputMensagem");
  const btnEnviar = document.getElementById("btnEnviar");
  const areaMensagens = document.getElementById("areaMensagens");

  if (input && btnEnviar && areaMensagens) {

    // Adiciona mensagem na tela
    function adicionarMensagem(texto, tipo) {
      if (!texto) return;
      
      const msg = document.createElement("div");
      msg.className = "mensagem " + tipo;
      // Converte quebras de linha para HTML
      msg.innerHTML = texto.replace(/\n/g, '<br>');
      
      areaMensagens.appendChild(msg);
      areaMensagens.scrollTop = areaMensagens.scrollHeight;
    }

    // Feedback visual "Tom está digitando..."
    function mostrarDigitando() {
        const loader = document.createElement("div");
        loader.id = "loader-tom";
        loader.textContent = "Tom está digitando...";
        areaMensagens.appendChild(loader);
        areaMensagens.scrollTop = areaMensagens.scrollHeight;
    }

    function removerDigitando() {
        const loader = document.getElementById("loader-tom");
        if (loader) loader.remove();
    }

    // Função Principal de Envio
    async function enviarMensagem() {
      const textoUsuario = input.value.trim();
      if (textoUsuario === "") return;

      // 1. Exibe msg do usuário imediatamente
      adicionarMensagem(textoUsuario, "enviada");
      input.value = "";
      input.focus();

      // 2. Mostra que o Tom está pensando
      mostrarDigitando();

      try {
        // 3. Prepara dados para o backend (ChatRequest.java)
        const payload = {
            message: textoUsuario,
            history: chatHistory
        };

        // 4. Chamada POST para o backend
        const response = await fetch("/api/chat-gpt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        removerDigitando();

        if (response.ok) {
            const data = await response.json(); // ChatResponse.java
            const respostaTom = data.reply;

            // 5. Exibe a resposta do Tom
            adicionarMensagem(respostaTom, "recebida");

            // 6. Atualiza histórico local
            chatHistory.push({ role: "user", content: textoUsuario });
            chatHistory.push({ role: "assistant", content: respostaTom });

        } else {
            adicionarMensagem("Ocorreu um erro ao falar com o Tom. Tente novamente.", "recebida");
        }
      } catch (error) {
        removerDigitando();
        console.error("Erro no chat:", error);
        adicionarMensagem("Sem conexão com o servidor.", "recebida");
      }
    }

    // Event Listeners
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
  // 1. Tenta encontrar o elemento
  const diasEl = document.getElementById("dias");

  // 2. SÓ executa o resto do código SE o elemento existir!
  if (diasEl) {
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
}

// Busca eventos da agenda para um usuário (usa o endpoint REST criado)
async function fetchAgendaUsuario(id) {
  if (!id) return [];
  try {
    const resp = await fetch(`/api/agenda/usuario/${id}`);
    if (!resp.ok) return [];
    return await resp.json();
  } catch (e) {
    console.warn('fetchAgendaUsuario erro', e);
    return [];
  }
}

// Renderiza pontos coloridos no calendário com base nos eventos (agendaEventos é array de eventos)
function marcarEventosNoCalendario(agendaEventos) {
  if (!Array.isArray(agendaEventos)) return;
  const diasEl = document.getElementById('dias');
  if (!diasEl) return;

  // percorre todas as células e remove marcadores anteriores
  diasEl.querySelectorAll('td').forEach(td => {
    const existente = td.querySelector('.dia-ponto');
    if (existente) existente.remove();
  });

  const hoje = new Date();
  agendaEventos.forEach(ev => {
    // ev.dataHora vem como string ISO -> converter
    const data = ev.dataHora ? new Date(ev.dataHora) : null;
    if (!data) return;
    const ano = data.getFullYear();
    const mes = data.getMonth();
    const dia = data.getDate();

    // encontra a célula que corresponde ao dia no calendário atual
    // O calendário gera células sequenciais com números como texto
    diasEl.querySelectorAll('td').forEach(td => {
      const texto = td.textContent && td.textContent.trim();
      if (!texto) return;
      const numero = parseInt(texto);
      if (numero !== dia) return;

      // Verifica se a célula pertence ao mesmo mês/ano atual usando presença de 'hoje' ou contexto simplificado
      // (este calendário mostra sempre mês atual, então basta comparar o dia)
      const ponto = document.createElement('span');
      ponto.className = 'dia-ponto';
      ponto.style.display = 'inline-block';
      ponto.style.width = '10px';
      ponto.style.height = '10px';
      ponto.style.borderRadius = '50%';
      ponto.style.marginLeft = '6px';
      ponto.style.verticalAlign = 'middle';
      ponto.style.backgroundColor = ev.cor || '#e67e22';
      td.appendChild(ponto);
    });
  });
}

// Renderiza a lista de compromissos abaixo do calendário
function renderListaAgenda(agendaEventos) {
  const listaContainer = document.querySelector('.lista-agenda ul');
  if (!listaContainer) return;
  listaContainer.innerHTML = '';
  if (!Array.isArray(agendaEventos) || agendaEventos.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Nenhum compromisso agendado.';
    listaContainer.appendChild(li);
    return;
  }

  agendaEventos.forEach(ev => {
    const li = document.createElement('li');
    // formata data e hora
    let textoData = '';
    if (ev.dataHora) {
      const d = new Date(ev.dataHora);
      const dd = String(d.getDate()).padStart(2,'0');
      const mm = String(d.getMonth()+1).padStart(2,'0');
      const yy = String(d.getFullYear()).slice(-2);
      const hh = String(d.getHours()).padStart(2,'0');
      textoData = `${dd}/${mm}/${yy}`;
      textoData += ` ${ev.titulo || ev.descricao || ''} – ${hh}h`;
    } else {
      textoData = ev.titulo || ev.descricao || '';
    }

    // cor marcador
    const marcador = document.createElement('span');
    marcador.style.display = 'inline-block';
    marcador.style.width = '10px';
    marcador.style.height = '10px';
    marcador.style.borderRadius = '50%';
    marcador.style.backgroundColor = ev.cor || '#e67e22';
    marcador.style.marginRight = '8px';
    li.appendChild(marcador);

    const texto = document.createTextNode(textoData);
    li.appendChild(texto);
    listaContainer.appendChild(li);
  });
}

// Carrega agenda do usuário logado (não-admin) e atualiza calendário/lista
async function carregarAgendaUsuario() {
  try {
    const usuario = await buscarEAtualizarUsuarioLogado();
    if (!usuario) return;
    const isAdmin = usuario.isAdmin === true || usuario.isAdmin === 'true' || usuario.isAdmin === 1;
    let eventos = [];

    if (isAdmin) {
      // para admins, tentamos carregar a agenda do idoso vinculado usando o campo contato (telefone do idoso)
      const contato = usuario.contato;
      if (contato) {
        try {
          // fetch usuario idoso via telefone
          const resp = await fetch(`/usuarios/por-telefone/${encodeURIComponent(contato)}`);
          if (resp.ok) {
            const idoso = await resp.json();
            eventos = await fetchAgendaUsuario(idoso.id);
            // mostra botão de cadastrar
            const btn = document.getElementById('btn-cadastrar-evento');
            if (btn) {
              btn.style.display = 'inline-block';
              btn.addEventListener('click', function() { window.location.href = '/cadastrar-evento.html'; });
            }
          } else {
            console.warn('idoso vinculado nao encontrado pelo contato', contato);
          }
        } catch (e) {
          console.warn('erro ao obter idoso por contato', e);
        }
      } else {
        console.warn('admin sem contato vinculado');
      }
    } else {
      eventos = await fetchAgendaUsuario(usuario.id);
    }
    window.agendaEventos = eventos;
    // Regenera calendário (ele usa células com números)
    gerarCalendario();
    marcarEventosNoCalendario(eventos);
    renderListaAgenda(eventos);
  } catch (e) {
    console.warn('carregarAgendaUsuario erro', e);
  }
}

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


// Inicializa ao carregar a página
// Inicializa calendário e agenda quando a página tiver o elemento do calendário
document.addEventListener("DOMContentLoaded", function() {
  // se página tem o calendário, carregamos agenda do usuário
  if (document.getElementById('dias')) {
    carregarAgendaUsuario();
  } else {
    // mantemos comportamentos antigos
    gerarCalendario();
  }
});

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
