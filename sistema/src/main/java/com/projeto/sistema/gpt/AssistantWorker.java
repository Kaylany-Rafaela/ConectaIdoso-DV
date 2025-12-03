package com.projeto.sistema.gpt;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.task.TaskExecutor;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

/**
 * Worker que roda chamadas ao GPT de forma assíncrona, usando TaskExecutor do Spring.
 */
@Component
public class AssistantWorker {

    private static final Logger log = LoggerFactory.getLogger(AssistantWorker.class);

    private final TaskExecutor executor;
    private final ChatGptService chatGptService;
    private final boolean enabled;

    public AssistantWorker(TaskExecutor executor,
                           ChatGptService chatGptService,
                           @Value("${gpt.enabled:true}") boolean enabled) {
        this.executor = executor;
        this.chatGptService = chatGptService;
        this.enabled = enabled;
    }

    public void spawnAssistantJob(String message, Long chatId, Long userId, List<Map<String, String>> history) {
        if (!enabled) {
            log.debug("GPT disabled — ignorando spawnAssistantJob para chat {}", chatId);
            return;
        }

        try {
            executor.execute(() -> {
                try {
                    String assistantReply = chatGptService.callOpenAi(message, history);
                    log.info("[AssistantWorker] reply (chat {}): {} chars", chatId,
                            assistantReply == null ? 0 : assistantReply.length());
                } catch (Exception ex) {
                    log.error("Erro ao executar assistant job para chat {}", chatId, ex);
                }
            });
        } catch (Exception e) {
            log.error("Falha ao submeter tarefa ao executor: {}", e.getMessage(), e);
        }
    }
}
