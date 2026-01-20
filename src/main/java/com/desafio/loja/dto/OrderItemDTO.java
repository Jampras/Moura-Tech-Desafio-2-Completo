package com.desafio.loja.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

/**
 * Record DTO para representar um item do pedido na resposta.
 * 
 * @param productId   ID do produto
 * @param productName Nome do produto
 * @param quantity    Quantidade
 * @param unitPrice   Preço unitário
 * @param subtotal    Subtotal (quantidade x preço)
 */
@Schema(description = "Item de um pedido")
public record OrderItemDTO(
        @Schema(description = "ID do produto", example = "1") Long productId,

        @Schema(description = "Nome do produto", example = "Camiseta Polo") String productName,

        @Schema(description = "Quantidade", example = "2") Integer quantity,

        @Schema(description = "Preço unitário", example = "99.90") BigDecimal unitPrice,

        @Schema(description = "Subtotal (quantidade x preço)", example = "199.80") BigDecimal subtotal) {
}
