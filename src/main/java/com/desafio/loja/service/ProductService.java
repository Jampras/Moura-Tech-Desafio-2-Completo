package com.desafio.loja.service;

import com.desafio.loja.exception.InvalidValueException;
import com.desafio.loja.exception.ResourceNotFoundException;
import com.desafio.loja.model.Product;
import com.desafio.loja.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Serviço responsável pela gestão de produtos.
 * 
 * <p>
 * Esta classe implementa todas as regras de negócio relacionadas a produtos,
 * incluindo validações de preço e estoque antes da persistência.
 * </p>
 * 
 * <p>
 * <b>Suporte a Paginação:</b> Os métodos findAll e findByName retornam
 * páginas para otimização de performance em listagens grandes.
 * </p>
 * 
 * @author Desafio Técnico
 * @version 2.0
 * @see ProductRepository
 * @see Product
 */
@Service
public class ProductService {

    private final ProductRepository productRepository;

    /**
     * Construtor com injeção de dependência.
     * 
     * @param productRepository repositório para operações de persistência de
     *                          produtos
     */
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Retorna todos os produtos cadastrados (versão paginada).
     * 
     * @param pageable configuração de paginação (page, size, sort)
     * @return página de produtos
     */
    public Page<Product> findAll(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    /**
     * Retorna todos os produtos cadastrados (versão lista - para compatibilidade).
     * 
     * @return lista de todos os produtos; lista vazia se não houver produtos
     */
    public List<Product> findAll() {
        return productRepository.findAll();
    }

    /**
     * Busca um produto pelo seu identificador único.
     * 
     * <p>
     * <b>Fail Fast:</b> Lança exceção imediatamente se o produto não existir.
     * </p>
     * 
     * @param id identificador único do produto
     * @return o produto encontrado
     * @throws ResourceNotFoundException se o produto não existir
     */
    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", id));
    }

    /**
     * Busca produtos cujo nome contenha o termo informado (versão paginada).
     * 
     * <p>
     * Utiliza o índice idx_product_name para performance otimizada.
     * </p>
     * 
     * @param name     termo a ser buscado no nome dos produtos
     * @param pageable configuração de paginação
     * @return página de produtos que correspondem ao critério
     */
    public Page<Product> findByName(String name, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCase(name, pageable);
    }

    /**
     * Busca produtos cujo nome contenha o termo informado (versão lista).
     * 
     * @param name termo a ser buscado no nome dos produtos
     * @return lista de produtos que correspondem ao critério
     */
    public List<Product> findByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    /**
     * Persiste um novo produto no banco de dados.
     * 
     * <p>
     * <b>Regras de Negócio Validadas:</b>
     * </p>
     * <ul>
     * <li>Preço deve ser maior que zero</li>
     * <li>Estoque não pode ser negativo</li>
     * </ul>
     * 
     * @param product produto a ser salvo
     * @return produto salvo com ID gerado
     * @throws InvalidValueException se o preço for menor ou igual a zero
     */
    @Transactional
    public Product save(Product product) {
        validateProduct(product);
        return productRepository.save(product);
    }

    /**
     * Atualiza um produto existente.
     * 
     * @param id             identificador do produto a ser atualizado
     * @param productDetails objeto contendo os novos dados
     * @return produto atualizado
     * @throws ResourceNotFoundException se o produto não existir
     * @throws InvalidValueException     se os dados violarem regras de negócio
     */
    @Transactional
    public Product update(Long id, Product productDetails) {
        Product existingProduct = findById(id);
        validateProduct(productDetails);

        existingProduct.setName(productDetails.getName());
        existingProduct.setPrice(productDetails.getPrice());
        existingProduct.setStock(productDetails.getStock());
        existingProduct.setImage(productDetails.getImage());
        existingProduct.setCategory(productDetails.getCategory());
        return productRepository.save(existingProduct);
    }

    /**
     * Remove um produto do sistema.
     * 
     * @param id identificador do produto a ser removido
     * @throws ResourceNotFoundException se o produto não existir
     */
    @Transactional
    public void delete(Long id) {
        Product product = findById(id);
        productRepository.delete(product);
    }

    /**
     * Valida as regras de negócio do produto.
     * 
     * @param product produto a ser validado
     * @throws InvalidValueException se alguma regra for violada
     */
    private void validateProduct(Product product) {
        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidValueException(
                    "O preço do produto deve ser maior que zero. Valor informado: " + product.getPrice());
        }

        if (product.getStock() != null && product.getStock() < 0) {
            throw new InvalidValueException(
                    "O estoque do produto não pode ser negativo. Valor informado: " + product.getStock());
        }
    }
}
