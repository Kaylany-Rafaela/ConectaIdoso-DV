
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
            agendaUsuarioAlvoId = idoso.id;
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
      agendaUsuarioAlvoId = usuario.id;
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

/* ============================================================
   AGENDA - SISTEMA COMPLETO DE COMPROMISSOS
   Exclusivo: somente ADMIN pode cadastrar, editar e excluir.
   Usuário comum só visualiza compromissos.
============================================================ */

/* ============================================================
   1) VARIÁVEIS DE CONTROLE
============================================================ */
let diaSelecionado = null;
let indiceEditando = null;
let agendaMesAtual = null;
let agendaAnoAtual = null;
let agendaUsuarioAlvoId = null;

/* ============================================================
   2) FUNÇÃO DE PERMISSÃO
============================================================ */

function usuarioEhAdmin() {
    return localStorage.getItem("isAdmin") === "true";
}

/* ============================================================
   3) CALENDÁRIO — GERAR MÊS ATUAL
============================================================ */

function gerarCalendario() {
    const diasEl = document.getElementById("dias");
    if (!diasEl) return; // evita erro em páginas sem calendário

    diasEl.innerHTML = "";

    const hoje = new Date();
    agendaAnoAtual = hoje.getFullYear();
    agendaMesAtual = hoje.getMonth();
    const ano = agendaAnoAtual;
    const mes = agendaMesAtual;

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();

    let dia = 1;

    for (let i = 0; i < 6; i++) {
        const linha = document.createElement("tr");

        for (let j = 0; j < 7; j++) {
            const celula = document.createElement("td");

            if (i === 0 && j < primeiroDia) {
                celula.textContent = "";
            } else if (dia > ultimoDia) {
                celula.textContent = "";
            } else {

                celula.textContent = dia;

                // Evita bug tradicional de clicar no dia e pegar valor errado (ex: 31→32)
                let diaAtual = dia;

                celula.onclick = () => selecionarDia(diaAtual);
                dia++;
            }

            linha.appendChild(celula);
        }

        diasEl.appendChild(linha);
    }
}

document.addEventListener("DOMContentLoaded", gerarCalendario);

/* ============================================================
   4) FUNÇÃO AO CLICAR EM UM DIA
============================================================ */

function selecionarDia(dia) {
    diaSelecionado = dia;

    // Remove seleção anterior
    document.querySelectorAll(".calendario td").forEach(td =>
        td.classList.remove("dia-selecionado")
    );

    // Marca o dia clicado
    const alvo = [...document.querySelectorAll(".calendario td")]
        .find(td => td.innerText == dia);

    if (alvo) alvo.classList.add("dia-selecionado");

    // Atualiza textos da interface
    document.getElementById("titulo-dia").textContent =
        "Compromissos do dia " + dia;

    const diaTxt = document.getElementById("diaEscolhido");
    if (diaTxt) diaTxt.textContent = "Dia selecionado: " + dia;

    carregarCompromissos();
    ativarBotao();
}

/* ============================================================
   5) BOTÃO DE CADASTRAR — SOMENTE ADMIN
============================================================ */

function ativarBotao() {
    const btn = document.getElementById("btnAdd");
    if (!btn) return;

    if (usuarioEhAdmin() && diaSelecionado) {
        btn.disabled = false;
        btn.classList.add("enabled");
    } else {
        btn.disabled = true;
        btn.classList.remove("enabled");
    }
}

/* ============================================================
   6) LISTAR COMPROMISSOS DO DIA
============================================================ */

function carregarCompromissos() {
    const lista = document.getElementById("lista-compromissos");
    if (!lista) return;

    const eventosDia = (window.agendaEventos || [])
      .filter(ev => {
        if (!ev.dataHora) return false;
        const d = new Date(ev.dataHora);
        const ano = agendaAnoAtual !== null ? agendaAnoAtual : new Date().getFullYear();
        const mes = agendaMesAtual !== null ? agendaMesAtual : new Date().getMonth();
        return d.getFullYear() === ano && d.getMonth() === mes && d.getDate() === Number(diaSelecionado);
      })
      .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

    lista.innerHTML = "";

    if (!eventosDia.length) {
        lista.innerHTML = "<p class='mensagem-vazia'>Nenhum compromisso para este dia.</p>";
        return;
    }

    const ehAdmin = usuarioEhAdmin();
    eventosDia.forEach((c, indice) => {
        const hora = c.dataHora ? new Date(c.dataHora).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}) : '';
        const botoesAdmin = ehAdmin ? `
          <button class="btn-edit" onclick="editarCompromisso(${indice})">Editar</button>
          <button class="btn-delete" onclick="excluirCompromisso(${indice})">Excluir</button>
        ` : '';
        
        lista.innerHTML += `
        <div class="item-compromisso">
          <div>
            <strong>${hora}</strong> — ${c.titulo || c.descricao || ''}
          </div>
          <div class="acoes-compromisso">${botoesAdmin}</div>
        </div>`;
    });
}

/* ============================================================
   7) NOVO COMPROMISSO — ABRIR MODAL (APENAS ADMIN)
============================================================ */

document.getElementById("btnAdd").onclick = () => {
    if (!usuarioEhAdmin()) {
        alert("Apenas administradores podem cadastrar compromissos.");
        return;
    }

    if (!diaSelecionado) return;

    document.getElementById("modal").style.display = "flex";
};

/* ============================================================
   8) SALVAR NOVO COMPROMISSO — APENAS ADMIN
============================================================ */

document.getElementById("btnSalvar").onclick = async () => {
    if (!usuarioEhAdmin()) {
        alert("Apenas administradores podem cadastrar compromissos.");
        return;
    }

    if (!agendaUsuarioAlvoId) {
        alert("Não foi possível identificar o usuário para salvar o compromisso.");
        return;
    }

    const titulo = document.getElementById("tituloComp").value;
    const hora = document.getElementById("horaComp").value;

    if (!titulo || !hora || !diaSelecionado) {
        alert("Preencha todos os campos.");
        return;
    }

    const usuarioRaw = localStorage.getItem('usuarioLogado');
    const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;
    const criadorId = usuario && usuario.id ? String(usuario.id) : null;

    const hoje = new Date();
    const ano = agendaAnoAtual !== null ? agendaAnoAtual : hoje.getFullYear();
    const mes = agendaMesAtual !== null ? agendaMesAtual : hoje.getMonth();
    
    const [hh, mm] = hora.split(':');
    const diaStr = String(diaSelecionado).padStart(2, '0');
    const mesStr = String(mes + 1).padStart(2, '0');
    const anoStr = String(ano);
    const dataHoraIso = `${anoStr}-${mesStr}-${diaStr}T${hh}:${mm}:00`;

    const payload = {
      descricao: titulo,
      titulo: titulo,
      dataHora: dataHoraIso,
      cor: '#e67e22',
      idosoId: String(agendaUsuarioAlvoId),
      criadorId: criadorId
    };

    try {
      const resp = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Falha ao salvar evento');
      }

      const salvo = await resp.json();
      window.agendaEventos = (window.agendaEventos || []).concat(salvo);
      document.getElementById("modal").style.display = "none";
      document.getElementById("tituloComp").value = '';
      document.getElementById("horaComp").value = '';
      carregarCompromissos();
      marcarEventosNoCalendario(window.agendaEventos);
      alert('Compromisso cadastrado com sucesso!');
    } catch (e) {
      alert('Erro ao salvar compromisso: ' + e.message);
    }
};

/* ============================================================
   9) EDITAR COMPROMISSO — APENAS ADMIN
============================================================ */

function editarCompromisso(indice) {
    if (!usuarioEhAdmin()) {
        alert("Apenas administradores podem editar compromissos.");
        return;
    }

    const ano = agendaAnoAtual !== null ? agendaAnoAtual : new Date().getFullYear();
    const mes = agendaMesAtual !== null ? agendaMesAtual : new Date().getMonth();
    
    const eventosDia = (window.agendaEventos || [])
      .filter(ev => {
        if (!ev.dataHora) return false;
        const d = new Date(ev.dataHora);
        return d.getFullYear() === ano && d.getMonth() === mes && d.getDate() === Number(diaSelecionado);
      })
      .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

    const item = eventosDia[indice];
    if (!item) {
        alert("Compromisso não encontrado.");
        return;
    }

    indiceEditando = indice;
    window.eventoEditandoId = item.id;

    const dataHora = new Date(item.dataHora);
    const hora = dataHora.toTimeString().substring(0, 5);

    document.getElementById("editarTitulo").value = item.titulo || item.descricao || '';
    document.getElementById("editarHora").value = hora;

    document.getElementById("modalEdit").style.display = "flex";
}

/* ============================================================
   10) SALVAR EDIÇÃO — APENAS ADMIN
============================================================ */

async function salvarEdicao() {
    if (!usuarioEhAdmin()) {
        alert("Apenas administradores podem editar compromissos.");
        return;
    }

    if (!window.eventoEditandoId) {
        alert("Erro: ID do evento não encontrado.");
        return;
    }

    const novoTitulo = document.getElementById("editarTitulo").value;
    const novaHora = document.getElementById("editarHora").value;

    if (!novoTitulo || !novaHora) {
        alert("Preencha todos os campos.");
        return;
    }

    const hoje = new Date();
    const ano = agendaAnoAtual !== null ? agendaAnoAtual : hoje.getFullYear();
    const mes = agendaMesAtual !== null ? agendaMesAtual : hoje.getMonth();

    const [hh, mm] = novaHora.split(':');
    const diaStr = String(diaSelecionado).padStart(2, '0');
    const mesStr = String(mes + 1).padStart(2, '0');
    const anoStr = String(ano);
    const dataHoraIso = `${anoStr}-${mesStr}-${diaStr}T${hh}:${mm}:00`;

    const payload = {
      titulo: novoTitulo,
      descricao: novoTitulo,
      dataHora: dataHoraIso
    };

    try {
      const resp = await fetch(`/api/agenda/${window.eventoEditandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Falha ao atualizar evento');
      }

      const atualizado = await resp.json();
      
      const idx = window.agendaEventos.findIndex(e => e.id === window.eventoEditandoId);
      if (idx !== -1) window.agendaEventos[idx] = atualizado;

      document.getElementById("modalEdit").style.display = "none";
      carregarCompromissos();
      marcarEventosNoCalendario(window.agendaEventos);
      alert('Compromisso atualizado com sucesso!');
    } catch (e) {
      alert('Erro ao atualizar compromisso: ' + e.message);
    }
}

/* ============================================================
   11) EXCLUIR COMPROMISSO — APENAS ADMIN
============================================================ */

async function excluirCompromisso(indice) {
    if (!usuarioEhAdmin()) {
        alert("Apenas administradores podem excluir compromissos.");
        return;
    }

    if (!confirm("Deseja realmente excluir este compromisso?")) {
        return;
    }

    const ano = agendaAnoAtual !== null ? agendaAnoAtual : new Date().getFullYear();
    const mes = agendaMesAtual !== null ? agendaMesAtual : new Date().getMonth();

    const eventosDia = (window.agendaEventos || [])
      .filter(ev => {
        if (!ev.dataHora) return false;
        const d = new Date(ev.dataHora);
        return d.getFullYear() === ano && d.getMonth() === mes && d.getDate() === Number(diaSelecionado);
      })
      .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

    const item = eventosDia[indice];
    if (!item || !item.id) {
        alert("Compromisso não encontrado.");
        return;
    }

    try {
      const resp = await fetch(`/api/agenda/${item.id}`, {
        method: 'DELETE'
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Falha ao excluir evento');
      }

      window.agendaEventos = window.agendaEventos.filter(e => e.id !== item.id);

      carregarCompromissos();
      marcarEventosNoCalendario(window.agendaEventos);
      alert('Compromisso excluído com sucesso!');
    } catch (e) {
      alert('Erro ao excluir compromisso: ' + e.message);
    }
}

/* ============================================================
   PERFIL — EDITAR E SALVAR INFORMAÇÕES
============================================================ */


function editarInformacoes() {
  document.querySelectorAll(".bloco-perfil input").forEach(input => input.disabled = false);
  const btnEditar = document.getElementById("btnEditar");
  const btnSalvar = document.getElementById("btnSalvar");
  if (btnEditar) btnEditar.style.display = "none";
  if (btnSalvar) btnSalvar.style.display = "inline-block";
}


async function salvarInformacoes() {
  try {
    const usuarioRaw = localStorage.getItem('usuarioLogado');
    let usuario = null;
    try {
      usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;
    } catch (e) {
      alert("Erro ao carregar dados do usuário. Faça login novamente.");
      return;
    }

    if (!usuario || !usuario.id) {
      alert("Erro: usuário não identificado. Faça login novamente.");
      return;
    }

    const isAdmin = usuario.isAdmin === true || usuario.isAdmin === 'true' || usuario.isAdmin === 1;

   
    const dadosUsuarioLogado = {
      nome: isAdmin ? document.getElementById('nomeAdmPerfil').value : document.getElementById('nomeIdosoPerfil').value,
      telefone: isAdmin ? document.getElementById('telefoneAdmPerfil').value : document.getElementById('telefoneIdosoPerfil').value,
      endereco: isAdmin ? document.getElementById('enderecoAdmPerfil').value : document.getElementById('enderecoIdosoPerfil').value
    };

    const respostaUsuario = await fetch(`/usuarios/atualizar/${usuario.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosUsuarioLogado)
    });

    if (!respostaUsuario.ok) {
      const erro = await respostaUsuario.text();
      alert("Erro ao atualizar suas informações: " + erro);
      return;
    }

    const usuarioAtualizado = await respostaUsuario.json();

    
    if (isAdmin && usuario.contato) {
      try {
        const idosoResponse = await window.fetchUsuarioPorTelefone(usuario.contato);
        if (idosoResponse && idosoResponse.id) {
          const dadosIdoso = {
            nome: document.getElementById('nomeIdosoPerfil').value,
            telefone: document.getElementById('telefoneIdosoPerfil').value,
            endereco: document.getElementById('enderecoIdosoPerfil').value
          };

          const respostaIdoso = await fetch(`/usuarios/atualizar/${idosoResponse.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosIdoso)
          });

          if (!respostaIdoso.ok) {
            console.warn("Não foi possível atualizar dados do idoso associado");
          }
        }
      } catch (e) {
        console.warn("Erro ao atualizar idoso associado:", e);
      }
    }

    
    if (!isAdmin && usuario.contato) {
      try {
        const adminResponse = await window.fetchUsuarioPorTelefone(usuario.contato);
        if (adminResponse && adminResponse.id) {
          const dadosAdmin = {
            nome: document.getElementById('nomeAdmPerfil').value,
            telefone: document.getElementById('telefoneAdmPerfil').value,
            endereco: document.getElementById('enderecoAdmPerfil').value
          };

          const respostaAdmin = await fetch(`/usuarios/atualizar/${adminResponse.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAdmin)
          });

          if (!respostaAdmin.ok) {
            console.warn("Não foi possível atualizar dados do administrador associado");
          }
        }
      } catch (e) {
        console.warn("Erro ao atualizar administrador associado:", e);
      }
    }

    
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));
    localStorage.setItem("nomeIdoso", document.getElementById("nomeIdosoPerfil").value);
    localStorage.setItem("telefoneIdoso", document.getElementById("telefoneIdosoPerfil").value);
    localStorage.setItem("enderecoIdoso", document.getElementById("enderecoIdosoPerfil").value);
    localStorage.setItem("nomeAdm", document.getElementById("nomeAdmPerfil").value);
    localStorage.setItem("telefoneAdm", document.getElementById("telefoneAdmPerfil").value);
    localStorage.setItem("enderecoAdm", document.getElementById("enderecoAdmPerfil").value);

    
    document.querySelectorAll(".bloco-perfil input").forEach(input => input.disabled = true);
    const btnEditar = document.getElementById("btnEditar");
    const btnSalvar = document.getElementById("btnSalvar");
    if (btnEditar) btnEditar.style.display = "inline-block";
    if (btnSalvar) btnSalvar.style.display = "none";

    alert("Informações atualizadas com sucesso no banco de dados!");

  } catch (error) {
    console.error("Erro ao salvar informações:", error);
    alert("Erro ao salvar informações. Tente novamente.");
  }
}


window.editarInformacoes = editarInformacoes;
window.salvarInformacoes = salvarInformacoes;

/* ============================================================
   CORREÇÃO: CARREGAR DADOS DO PERFIL AO ABRIR A PÁGINA
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    // Se não estiver na página de perfil (se os campos não existirem), para aqui.
    if (!document.getElementById("nomeIdosoPerfil") && !document.getElementById("nomeAdmPerfil")) {
        return;
    }

    // 1. Pega os dados que estão salvos no navegador
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    // 2. Mapeia: ID do Campo no HTML  <--->  Onde buscar o valor
    const camposParaPreencher = [
        // Campos do Idoso
        { 
            id: "nomeIdosoPerfil", 
            valor: localStorage.getItem("nomeIdoso") || (!isAdmin ? usuarioLogado.nome : "") 
        },
        { 
            id: "telefoneIdosoPerfil", 
            valor: localStorage.getItem("telefoneIdoso") || (!isAdmin ? usuarioLogado.telefone : "") 
        },
        { 
            id: "enderecoIdosoPerfil", 
            valor: localStorage.getItem("enderecoIdoso") || (!isAdmin ? usuarioLogado.endereco : "") 
        },

        // Campos do Admin
        { 
            id: "nomeAdmPerfil", 
            valor: localStorage.getItem("nomeAdm") || (isAdmin ? usuarioLogado.nome : "") 
        },
        { 
            id: "telefoneAdmPerfil", 
            valor: localStorage.getItem("telefoneAdm") || (isAdmin ? usuarioLogado.telefone : "") 
        },
        { 
            id: "enderecoAdmPerfil", 
            valor: localStorage.getItem("enderecoAdm") || (isAdmin ? usuarioLogado.endereco : "") 
        }
    ];

    // 3. Loop para preencher os campos se eles existirem na tela
    camposParaPreencher.forEach(campo => {
        const elemento = document.getElementById(campo.id);
        if (elemento && campo.valor) {
            elemento.value = campo.valor;
        }
    });

    // 4. Trava os campos (Modo Leitura) e ajusta os botões
    const inputsPerfil = document.querySelectorAll(".bloco-perfil input");
    if (inputsPerfil.length > 0) {
        inputsPerfil.forEach(input => input.disabled = true);
    }

    const btnEditar = document.getElementById("btnEditar");
    const btnSalvar = document.getElementById("btnSalvar");

    if (btnEditar) btnEditar.style.display = "inline-block";
    if (btnSalvar) btnSalvar.style.display = "none";
});