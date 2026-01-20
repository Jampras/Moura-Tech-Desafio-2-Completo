package com.desafio.loja.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Entidade Product - Representa um produto da loja.
 * 
 * <p>
 * Campos validados:
 * </p>
 * <ul>
 * <li>name: obrigatório, não pode estar em branco (indexado para busca)</li>
 * <li>price: obrigatório, deve ser maior que zero</li>
 * <li>stock: obrigatório, mínimo de 1 item para cadastro inicial</li>
 * <li>image: opcional, armazena imagem em Base64 (TEXT para strings
 * longas)</li>
 * </ul>
 * 
 * <p>
 * <b>Índices:</b> A coluna 'name' possui índice para otimizar buscas.
 * </p>
 */
@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_product_name", columnList = "name")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome do produto é obrigatório")
    @Column(nullable = false)
    private String name;

    @NotNull(message = "O preço é obrigatório")
    @DecimalMin(value = "0.01", message = "O preço deve ser maior que zero")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @NotNull(message = "O estoque é obrigatório")
    @Min(value = 0, message = "O estoque não pode ser negativo")
    @Column(nullable = false)
    private Integer stock;

    /**
     * Imagem do produto em formato Base64.
     * Utiliza columnDefinition = "TEXT" para suportar strings longas no PostgreSQL.
     */
    @Column(columnDefinition = "TEXT")
    private String image;

    private String category;
}
