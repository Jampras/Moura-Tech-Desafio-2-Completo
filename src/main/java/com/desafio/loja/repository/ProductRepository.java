package com.desafio.loja.repository;

import com.desafio.loja.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository para a entidade Product.
 * Estende JpaRepository para operações CRUD padrão e suporte a paginação.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Busca produtos pelo nome (contendo, case-insensitive) - versão paginada.
     * Utiliza o índice idx_product_name para performance.
     * 
     * @param name     termo de busca
     * @param pageable configuração de paginação
     * @return página de produtos
     */
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    /**
     * Busca produtos pelo nome (contendo, case-insensitive) - versão lista.
     * Mantido para compatibilidade.
     */
    List<Product> findByNameContainingIgnoreCase(String name);

    /**
     * Busca produtos com estoque maior que o valor especificado.
     */
    List<Product> findByStockGreaterThan(Integer stock);

    /**
     * Verifica se existe um produto com o nome especificado.
     */
    boolean existsByNameIgnoreCase(String name);

}
