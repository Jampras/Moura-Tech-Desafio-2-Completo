package com.desafio.loja.dto;

import com.desafio.loja.model.Product;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Dados do produto para resposta")
public record ProductResponseDTO(
        @Schema(description = "ID único do produto", example = "1") Long id,

        @Schema(description = "Nome do produto", example = "Camiseta Polo") String name,
        
        @Schema(description = "Categoria do produto", example = "Periféricos") String category, // <--- ADICIONADO

        @Schema(description = "Preço do produto", example = "99.90") BigDecimal price,

        @Schema(description = "Quantidade em estoque", example = "50") Integer stock,

        @Schema(description = "Imagem do produto em Base64") String image) {
    
    /**
     * Factory method: converte entidade Product para ProductResponseDTO.
     */
    public static ProductResponseDTO fromEntity(Product product) {
        return new ProductResponseDTO(
                product.getId(),
                product.getName(),
                product.getCategory(), // <--- ADICIONADO AQUI TAMBÉM
                product.getPrice(),
                product.getStock(),
                product.getImage());
    }
}