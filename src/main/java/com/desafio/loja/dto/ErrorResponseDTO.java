package com.desafio.loja.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Record DTO padronizado para respostas de erro.
 * 
 * <p>
 * Nota: Este DTO mantém um construtor personalizado para conveniência.
 * </p>
 * 
 * @param timestamp        Timestamp do erro
 * @param status           Código HTTP
 * @param error            Tipo do erro
 * @param message          Mensagem de erro
 * @param path             Path da requisição
 * @param validationErrors Lista de erros de validação
 */
@Schema(description = "Resposta de erro padronizada")
public record ErrorResponseDTO(
        @Schema(description = "Timestamp do erro") LocalDateTime timestamp,

        @Schema(description = "Código HTTP", example = "400") int status,

        @Schema(description = "Tipo do erro", example = "Bad Request") String error,

        @Schema(description = "Mensagem de erro", example = "Estoque insuficiente") String message,

        @Schema(description = "Path da requisição", example = "/cart/checkout") String path,

        @Schema(description = "Lista de erros de validação (se houver)") List<String> validationErrors) {
    /**
     * Construtor de conveniência sem erros de validação.
     */
    public ErrorResponseDTO(int status, String error, String message, String path) {
        this(LocalDateTime.now(), status, error, message, path, null);
    }
}
