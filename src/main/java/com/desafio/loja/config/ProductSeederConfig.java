package com.desafio.loja.config;

import com.desafio.loja.model.Product;
import com.desafio.loja.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

/**
 * Configuração de Dados Iniciais - Produtos.
 * 
 * Popula o banco com produtos de exemplo ao iniciar a aplicação,
 * caso a tabela esteja vazia.
 * 
 * @author Desafio Técnico Moura Tech
 */
@Configuration
public class ProductSeederConfig {

    private static final Logger log = LoggerFactory.getLogger(ProductSeederConfig.class);

    /**
     * Seed de produtos de exemplo.
     * 
     * Produtos criados:
     * - Bateria automotiva (carros)
     * - Bateria para motos
     * - Bateria para caminhões
     * - Bateria náutica
     * - Bateria estacionária/nobreak
     */
    @Bean
    CommandLineRunner seedProducts(ProductRepository productRepository) {
        return args -> {
            // Só insere se a tabela estiver vazia
            if (productRepository.count() == 0) {
                log.info("📦 Iniciando seed de produtos de exemplo...");

                List<Product> produtos = List.of(
                        // 1. Bateria Automotiva
                        createProduct(
                                "Moura M60GD - 60Ah EFB",
                                new BigDecimal("599.90"),
                                25,
                                "Automotiva (Carros)"),
                        // 2. Bateria para Motos
                        createProduct(
                                "Moura MA5-D - 5Ah AGM",
                                new BigDecimal("189.90"),
                                40,
                                "Motos"),
                        // 3. Bateria para Caminhões/Ônibus
                        createProduct(
                                "Moura M150BD - 150Ah Convencional",
                                new BigDecimal("1299.00"),
                                10,
                                "Pesados (Caminhões/Ônibus)"),
                        // 4. Bateria Náutica
                        createProduct(
                                "Moura Boat MB105 - 105Ah Dual Purpose",
                                new BigDecimal("899.00"),
                                8,
                                "Náutica / Boats"),
                        // 5. Bateria Estacionária/Nobreak
                        createProduct(
                                "Moura Clean 12MF63 - 63Ah VRLA",
                                new BigDecimal("459.90"),
                                15,
                                "Estacionária / Solar / Nobreak"));

                productRepository.saveAll(produtos);

                log.info("✅ {} produtos de exemplo cadastrados com sucesso!", produtos.size());
                log.info("📋 Produtos disponíveis:");
                produtos.forEach(p -> log.info("   → {} | R$ {} | Estoque: {}",
                        p.getName(), p.getPrice(), p.getStock()));
            } else {
                log.info("📦 Tabela de produtos já contém {} itens. Seed ignorado.",
                        productRepository.count());
            }
        };
    }

    /**
     * Cria um produto com os dados fornecidos.
     */
    private Product createProduct(String name, BigDecimal price, int stock, String category) {
        Product product = new Product();
        product.setName(name);
        product.setPrice(price);
        product.setStock(stock);
        product.setCategory(category);
        // Imagem é opcional, deixamos null
        product.setImage(null);
        return product;
    }
}
