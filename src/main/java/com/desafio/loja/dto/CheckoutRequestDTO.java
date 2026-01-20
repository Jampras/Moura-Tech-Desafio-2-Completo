package com.desafio.loja.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * Record DTO para requisição de checkout do carrinho.
 * 
 * @param items Lista de itens do carrinho
 */
@Schema(description = "Dados do carrinho para checkout")
public record CheckoutRequestDTO(
        @Schema(description = "Lista de itens do carrinho") @NotEmpty(message = "O carrinho não pode estar vazio") @Valid List<CartItemDTO> items) {
}
