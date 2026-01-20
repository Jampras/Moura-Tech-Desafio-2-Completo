package com.desafio.loja.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Schema(description = "Dados do produto para criação/atualização")
public record ProductDTO(
        @Schema(description = "Nome do produto", example = "Camiseta Polo") 
        @NotBlank(message = "O nome do produto é obrigatório") 
        String name,

        @Schema(description = "Categoria do produto", example = "Periféricos") 
        @NotBlank(message = "A categoria é obrigatória") // <--- ADICIONADO AQUI
        String category,

        @Schema(description = "Preço do produto (deve ser maior que zero)", example = "99.90") 
        @NotNull(message = "O preço é obrigatório") 
        @DecimalMin(value = "0.01", message = "O preço deve ser maior que zero") 
        BigDecimal price,

        @Schema(description = "Quantidade em estoque (mínimo 1)", example = "50") 
        @NotNull(message = "O estoque é obrigatório") 
        @Min(value = 1, message = "O estoque inicial deve ser no mínimo 1 item") 
        Integer stock,

        @Schema(description = "Imagem do produto em Base64", example = "data:image/png;base64...") 
        String image) {
}