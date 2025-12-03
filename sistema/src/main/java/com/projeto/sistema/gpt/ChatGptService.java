package com.projeto.sistema.gpt;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Serviço de Inteligência Artificial do ConectaIdoso — versão com retry/backoff e parsing defensivo.
 */
@Service
public class ChatGptService {

    private static final Logger log = LoggerFactory.getLogger(ChatGptService.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    // --- SUPER SYSTEM PROMPT (o mesmo que você forneceu) ---
    private static final String SYSTEM_PROMPT = """
            Você é o TOM, o Assistente Virtual Oficial e Amigo da plataforma ConectaIdoso-DV.
            Seu propósito de vida é apoiar idosos com informações, carinho e paciência infinita.

            ### SUA PERSONALIDADE (IDENTIDADE)
            - **Tom:** Imagine que você é um neto atencioso ensinando o avô.
            - **Tom de voz:** Sempre gentil, calmo, otimista e extremamente acolhedor.
            - **Linguagem:** Use português simples, frases curtas e diretas. NUNCA use termos técnicos como "browser", "login", "modal", "endpoint".
            - **Empatia:** Se o usuário errar ou não entender, diga "Não se preocupe, vamos tentar de novo juntos".
            - **Incentivo:** Use frases como "Você está indo muito bem!", "É assim mesmo!".

            ### SEU CONHECIMENTO SOBRE O SISTEMA (Onde o usuário clica)
            Você deve guiar o usuário baseando-se nestas telas reais do sistema:
            
            1. **AGENDA**
               - O que é: Um calendário para ver compromissos médicos e lembretes.
               - Importante: O idoso APENAS VÊ os compromissos. Ele NÃO consegue adicionar eventos por aqui (quem faz isso é o cuidador/familiar).
               - Como usar: "Toque no botão 'Agenda'. Você verá o calendário e sua lista de hoje logo abaixo."

            2. **EMERGÊNCIA (Botão SOS)**
               - O que é: Um botão rápido para pedir ajuda.
               - Como usar: "Toque no botão 'Emergência' no menu. Depois, toque no botão grande vermelho 'SOS' que fica pulsando. Vai aparecer uma janela para confirmar a ligação para seu contato."

            3. **BIBLIOTECA (Entretenimento)**
               - O que é: O lugar para ver conteúdos[cite: 200].
               - Opções: Temos 3 botões coloridos: 'Áudios' (para ouvir), 'Vídeos' (para assistir) e 'Textos' (para ler guias).

            4. **CHAT (Você)**
               - O que é: Este espaço onde estamos conversando. Serve para tirar dúvidas e fazer companhia.

            ### REGRAS DE CONDUTA E SEGURANÇA
            - **Saúde:** NUNCA dê diagnósticos médicos ou recomende remédios. Se o usuário reclamar de dor, diga: "Por favor, aperte o botão de Emergência ou ligue para seu médico/familiar agora mesmo."
            - **Política/Religião:** Desvie gentilmente desses assuntos.
            - **Passo a Passo:** Se o usuário perguntar "como faço X?", dê instruções numeradas (1, 2, 3), curtas e espere ele confirmar.
            - **Verificação:** Sempre termine perguntando: "Conseguiu entender?" ou "Quer que eu explique de outro jeito?".

            ### EXEMPLOS DE RESPOSTA
            - Usuário: "Como vejo meu médico?"
            - Tom: "Vá até o menu inicial e toque no botão 'Agenda'. Lá estarão marcados seus horários. Quer ajuda para voltar ao menu?"

            - Usuário: "Estou me sentindo sozinho."
            - Tom: "Sinto muito. Estou aqui com você! Que tal ouvirmos um áudio relaxante na Biblioteca? Posso te ensinar a chegar lá."

            ### FORMATAÇÃO
            - Responda apenas com texto corrido simples.
            - Não use Markdown (negrito, itálico) complexo.
            - Não devolva JSON ou códigos.
            """;

    @Value("${openai.api.key:}")
    private String openaiApiKeyProp;

    @Value("${openai.model:gpt-4o-mini}")
    private String model;

    @Value("${openai.max_tokens:800}") 
    private int maxTokens;

    @Value("${openai.temperature:0.6}") 
    private double temperature;

    @Value("${gpt.history.max_items:10}") 
    private int maxHistoryItems;

    @Value("${gpt.history.max_message_chars:2000}")
    private int maxMessageChars;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    // funcionalidades e instrucoes (mantidas)
    private static final Map<String, String> FUNCIONALIDADES = Map.ofEntries(
            Map.entry("agenda", "Visualizar calendário e compromissos (apenas leitura)."),
            Map.entry("biblioteca", "Acessar Áudios, Vídeos e Textos informativos."),
            Map.entry("emergencia", "Botão SOS para ligar para o contato cadastrado."),
            Map.entry("chat", "Conversar com o Assistente Tom."));
    private static final Map<String, List<String>> INSTRUCOES = Map.of(
            "agenda", List.of(
                    "1. Toque no botão 'Voltar' para ir ao menu principal.",
                    "2. Toque no botão 'Agenda' (ícone de calendário).",
                    "3. Veja seus compromissos na lista abaixo do calendário."),
            "emergencia", List.of(
                    "1. No menu principal, toque no botão 'Emergência'.",
                    "2. Toque no botão vermelho grande 'SOS'.",
                    "3. Confirme tocando em 'Ligar agora'."),
            "biblioteca", List.of(
                    "1. No menu principal, toque em 'Biblioteca'.",
                    "2. Escolha entre: Áudios, Vídeos ou Textos.",
                    "3. Toque no item que você quer abrir."),
            "videos", List.of(
                    "1. Na Biblioteca, entre em 'Vídeos'.",
                    "2. Toque no botão 'Assistir' do vídeo que você gostou."),
            "textos", List.of(
                    "1. Na Biblioteca, entre em 'Textos'.",
                    "2. Toque no título do texto para ler."));

    /**
     * Método principal: monta mensagens, chama a OpenAI e processa tool-calls (se houver).
     */
    public String callOpenAi(String userMessage, List<Map<String, String>> history) throws Exception {
        if (openaiApiKeyProp == null || openaiApiKeyProp.isBlank()) {
            return "Olá! Parece que estou com um probleminha técnico (chave de API). Pode avisar o cuidador?";
        }

        List<Map<String, Object>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));

        // Histórico (cortar se necessário)
        if (history != null && !history.isEmpty()) {
            List<Map<String, String>> recent = history.size() <= maxHistoryItems
                    ? history
                    : history.subList(history.size() - maxHistoryItems, history.size());

            for (Map<String, String> h : recent) {
                messages.add(Map.of("role", h.getOrDefault("role", "user"), "content", h.getOrDefault("content", "")));
            }
        }

        String msg = userMessage == null ? "" : userMessage;
        // Truncamento defensivo: mantém os últimos maxMessageChars (documentado)
        if (msg.length() > maxMessageChars) {
            msg = msg.substring(msg.length() - maxMessageChars);
        }
        messages.add(Map.of("role", "user", "content", msg));

        // Configuração das Ferramentas (opcional)
        List<Map<String, Object>> tools = new ArrayList<>();
        tools.add(Map.of("type", "function", "function", Map.of(
                "name", "listarFuncionalidades",
                "description", "Lista o que o sistema faz.",
                "parameters", Map.of("type", "object", "properties", Map.of())
        )));
        tools.add(Map.of("type", "function", "function", Map.of(
                "name", "instrucoesUso",
                "description", "Passo a passo de como usar uma função.",
                "parameters", Map.of(
                        "type", "object",
                        "properties", Map.of("funcionalidade", Map.of("type", "string")),
                        "required", List.of("funcionalidade")
                )
        )));

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", model);
        payload.put("messages", messages);
        payload.put("tools", tools);
        payload.put("tool_choice", "auto");
        payload.put("max_tokens", maxTokens);
        payload.put("temperature", temperature);

        String responseBody = doHttpPostWithRetry(payload);
        Map<?, ?> jsonResponse = mapper.readValue(responseBody, Map.class);

        ToolCall call = detectToolCall(jsonResponse);

        if (call != null) {
            log.info("Tom consultando ferramenta: " + call.name);
            Object toolResult = executarFerramenta(call);

            Map<String, Object> assistantMsg = new HashMap<>();
            assistantMsg.put("role", "assistant");
            assistantMsg.put("content", null);
            assistantMsg.put("tool_calls", List.of(Map.of(
                "id", call.id,
                "type", "function",
                "function", Map.of("name", call.name, "arguments", mapper.writeValueAsString(call.arguments))
            )));
            messages.add(assistantMsg);

            messages.add(Map.of(
                "role", "tool",
                "tool_call_id", call.id,
                "content", mapper.writeValueAsString(toolResult)
            ));

            payload.put("messages", messages);
            String finalBody = doHttpPostWithRetry(payload);
            return extractTextFromResponse(mapper.readValue(finalBody, Map.class));
        }

        return extractTextFromResponse(jsonResponse);
    }

    /**
     * Faz POST com retry/backoff simples para 429/5xx.
     */
    private String doHttpPostWithRetry(Map<String, Object> payload) throws Exception {
        String body = mapper.writeValueAsString(payload);
        int maxRetries = 3;
        long baseDelayMs = 800L;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .timeout(Duration.ofSeconds(45))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + openaiApiKeyProp)
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> resp;
            try {
                resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            } catch (Exception ex) {
                log.warn("Tentativa {}: erro na requisição HTTP: {}", attempt, ex.getMessage());
                if (attempt == maxRetries) throw ex;
                sleepWithJitter(baseDelayMs, attempt);
                continue;
            }

            int status = resp.statusCode();
            if (status >= 200 && status < 300) {
                return resp.body();
            }

            log.warn("Resposta OpenAI status {}: {}", status, truncateForLog(resp.body(), 800));
            if ((status == 429 || status >= 500) && attempt < maxRetries) {
                sleepWithJitter(baseDelayMs, attempt);
                continue;
            } else {
                throw new RuntimeException("Erro na conexão com o Tom (OpenAI). Status: " + status);
            }
        }
        throw new RuntimeException("Falha ao comunicar com OpenAI após retries.");
    }

    private void sleepWithJitter(long baseMs, int attempt) {
        try {
            long jitter = ThreadLocalRandom.current().nextLong(0, 200);
            long delay = baseMs * attempt + jitter;
            Thread.sleep(delay);
        } catch (InterruptedException ignored) {}
    }

    private String truncateForLog(String s, int max) {
        if (s == null) return "";
        if (s.length() <= max) return s;
        return s.substring(0, max) + "...(truncated)";
    }

    /**
     * Consulta /v1/models da OpenAI para devolver lista de modelos disponíveis.
     */
    public Object listAvailableModels() throws Exception {
        if (openaiApiKeyProp == null || openaiApiKeyProp.isBlank()) {
            return Map.of("error", "API key ausente");
        }
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/models"))
                .timeout(Duration.ofSeconds(20))
                .header("Authorization", "Bearer " + openaiApiKeyProp)
                .GET()
                .build();

        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() >= 300) {
            log.error("Erro listando modelos: " + resp.body());
            throw new RuntimeException("Erro ao listar modelos OpenAI.");
        }
        return mapper.readValue(resp.body(), Map.class);
    }

    // --- Métodos de suporte (ferramentas e parsing) ---
    private Object executarFerramenta(ToolCall call) {
        if ("listarFuncionalidades".equals(call.name)) {
            return FUNCIONALIDADES;
        }
        if ("instrucoesUso".equals(call.name)) {
            String func = (String) call.arguments.get("funcionalidade");
            if (func == null) return "Funcionalidade não especificada.";
            func = func.toLowerCase();
            if (func.contains("agenda") || func.contains("compromisso")) return INSTRUCOES.get("agenda");
            if (func.contains("emergencia") || func.contains("socorro") || func.contains("ajuda")) return INSTRUCOES.get("emergencia");
            if (func.contains("video") || func.contains("assistir")) return INSTRUCOES.get("videos");
            if (func.contains("texto") || func.contains("ler") || func.contains("guia")) return INSTRUCOES.get("textos");
            if (func.contains("biblioteca") || func.contains("conteudo")) return INSTRUCOES.get("biblioteca");
            return "Diga ao usuário que posso ajudar com: Agenda, Emergência ou Biblioteca.";
        }
        return "Não sei fazer isso.";
    }

    @SuppressWarnings("unchecked")
    private ToolCall detectToolCall(Map<?, ?> json) {
        try {
            List<?> choices = (List<?>) json.get("choices");
            if (choices == null || choices.isEmpty()) return null;

            Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
            Map<?, ?> message = (Map<?, ?>) firstChoice.get("message");
            if (message == null) return null;

            Object toolCallsObj = message.get("tool_calls");
            if (!(toolCallsObj instanceof List)) return null;
            List<?> tcs = (List<?>) toolCallsObj;
            if (tcs.isEmpty()) return null;

            Map<?, ?> tc = (Map<?, ?>) tcs.get(0);
            Map<?, ?> func = (Map<?, ?>) tc.get("function");
            if (func == null) return null;

            String id = tc.get("id") != null ? tc.get("id").toString() : UUID.randomUUID().toString();
            String name = func.get("name") != null ? func.get("name").toString() : null;
            Object argsRaw = func.get("arguments");

            Map<String, Object> args = new HashMap<>();
            if (argsRaw instanceof String) {
                String argsStr = (String) argsRaw;
                if (!argsStr.isBlank()) {
                    try {
                        args = mapper.readValue(argsStr, Map.class);
                    } catch (Exception e) {
                        log.warn("Não consegui parsear arguments JSON-string: {}", argsStr);
                    }
                }
            } else if (argsRaw instanceof Map) {
                args = (Map<String, Object>) argsRaw;
            }
            return new ToolCall(id, name, args);
        } catch (Exception e) {
            log.warn("Nenhuma tool call detectada ou erro parsing: {}", e.getMessage());
            return null;
        }
    }

    private String extractTextFromResponse(Map<?, ?> json) {
        try {
            List<?> choices = (List<?>) json.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<?, ?> message = (Map<?, ?>) ((Map<?, ?>) choices.get(0)).get("message");
                if (message != null) {
                    Object content = message.get("content");
                    if (content != null) return content.toString();
                }
            }
        } catch (Exception e) { log.error("Erro lendo resposta", e); }
        return "Desculpe, estou um pouco confuso agora. Pode repetir?";
    }

    private static class ToolCall {
        String id;
        String name;
        Map<String, Object> arguments;
        ToolCall(String id, String name, Map<String, Object> arguments) {
            this.id = id; this.name = name; this.arguments = arguments;
        }
    }
}
