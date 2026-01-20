package com.desafio.loja.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Record DTO para representar um item no carrinho/checkout.
 * 
 * @param productId ID do produto
 * @param quantity  Quantidade (mínimo 1)
 */
public record CartItemDTO(
        @NotNull(message = "O ID do produto é obrigatório") Long productId,

        @NotNull(message = "A quantidade é obrigatória") @Min(value = 1, message = "A quantidade deve ser pelo menos 1") Integer quantity) {
}
