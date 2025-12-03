package com.projeto.sistema.gpt;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ChatGptController {

    private static final Logger log = LoggerFactory.getLogger(ChatGptController.class);

    @Autowired
    private ChatGptService chatGptService;

    // Endpoint isolado: POST /api/chat-gpt
    @PostMapping("/chat-gpt")
    public ResponseEntity<?> chat(@RequestBody ChatRequest req) {
        try {
            String reply = chatGptService.callOpenAi(req.getMessage(), req.getHistory());
            return ResponseEntity.ok(new ChatResponse(reply));
        } catch (Exception e) {
            log.error("Erro ao chamar OpenAI", e);
            return ResponseEntity.status(502).body(
                    Map.of("error", "Erro ao processar a resposta do assistente. Tente novamente mais tarde.")
            );
        }
    }

    // >>> Novo endpoint: GET /api/gpt/models
    @GetMapping("/gpt/models")
    public ResponseEntity<?> listModels() {
        try {
            Object models = chatGptService.listAvailableModels();
            return ResponseEntity.ok(models);
        } catch (Exception e) {
            log.error("Erro ao listar modelos OpenAI", e);
            return ResponseEntity.status(502).body(Map.of("error", "Não foi possível listar modelos."));
        }
    }
}
