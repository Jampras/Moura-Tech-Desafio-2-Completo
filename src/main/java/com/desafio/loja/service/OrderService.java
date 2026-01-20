package com.desafio.loja.service;

import com.desafio.loja.dto.CartItemDTO;
import com.desafio.loja.exception.BusinessException;
import com.desafio.loja.exception.InsufficientStockException;
import com.desafio.loja.exception.ResourceNotFoundException;
import com.desafio.loja.model.Order;
import com.desafio.loja.model.OrderItem;
import com.desafio.loja.model.OrderStatus;
import com.desafio.loja.model.Product;
import com.desafio.loja.repository.OrderRepository;
import com.desafio.loja.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Serviço responsável pela gestão de pedidos e operações de checkout.
 * 
 * <p>
 * Esta classe implementa a lógica crítica de checkout com controle
 * transacional para garantir a integridade do estoque.
 * </p>
 * 
 * <p>
 * <b>Por que usar @Transactional no checkout?</b><br>
 * O checkout envolve múltiplas operações (verificar estoque, decrementar,
 * criar pedido). Se qualquer operação falhar (ex: estoque insuficiente no
 * terceiro item), todas as alterações anteriores são revertidas automaticamente
 * (rollback), garantindo consistência dos dados.
 * </p>
 * 
 * @author Desafio Técnico
 * @version 1.0
 * @see OrderRepository
 * @see ProductRepository
 */
@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    /**
     * Construtor com injeção de dependência via construtor.
     * 
     * <p>
     * Padrão recomendado pelo Spring: garante imutabilidade das dependências
     * e facilita a criação de mocks em testes unitários.
     * </p>
     * 
     * @param orderRepository   repositório para operações de pedidos
     * @param productRepository repositório para operações de produtos
     */
    public OrderService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    /**
     * Retorna todos os pedidos com itens e produtos carregados.
     * 
     * <p>
     * <b>Otimização N+1:</b> Usa {@code findAllWithItems()} que aplica
     * {@code @EntityGraph} para carregar items e products em uma única query SQL,
     * evitando N+1 selects.
     * </p>
     * 
     * @return lista de pedidos ordenada por data de criação (mais recente primeiro)
     */
    public List<Order> findAll() {
        return orderRepository.findAllWithItems();
    }

    /**
     * Busca um pedido pelo seu identificador único com itens carregados.
     * 
     * <p>
     * <b>Otimização N+1:</b> Usa {@code findWithItemsById()} para evitar
     * queries adicionais ao acessar items e products do pedido.
     * </p>
     * 
     * @param id identificador único do pedido
     * @return o pedido encontrado com todos os itens
     * @throws ResourceNotFoundException se o pedido não existir
     */
    public Order findById(Long id) {
        return orderRepository.findWithItemsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", id));
    }

    /**
     * Busca pedidos por status.
     * 
     * @param status status desejado (PENDING, CONFIRMED, CANCELLED)
     * @return lista de pedidos com o status especificado
     */
    public List<Order> findByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    /**
     * Realiza o checkout do carrinho de compras.
     * 
     * <p>
     * <b>Operação Transacional Crítica:</b> Este método é anotado com
     * {@code @Transactional} para garantir que:
     * </p>
     * <ul>
     * <li>Todas as operações sejam atômicas</li>
     * <li>Em caso de falha, o estoque seja restaurado automaticamente
     * (rollback)</li>
     * <li>Não haja inconsistência entre estoque e pedidos</li>
     * </ul>
     * 
     * <p>
     * <b>Fluxo de Execução:</b>
     * </p>
     * <ol>
     * <li>Valida se o carrinho não está vazio (Fail Fast)</li>
     * <li>Para cada item: busca produto, valida estoque, decrementa estoque</li>
     * <li>Cria os itens do pedido com preço congelado</li>
     * <li>Calcula total e salva o pedido como CONFIRMED</li>
     * </ol>
     * 
     * <p>
     * <b>Por que congelar o preço?</b> O preço unitário é copiado do produto
     * no momento da compra para que futuras alterações de preço não afetem
     * pedidos já realizados.
     * </p>
     * 
     * @param cartItems lista de itens do carrinho (productId e quantity)
     * @return pedido criado com status CONFIRMED
     * @throws BusinessException          se o carrinho estiver vazio
     * @throws ResourceNotFoundException  se algum produto não existir
     * @throws InsufficientStockException se algum produto não tiver estoque
     *                                    suficiente
     */
    @Transactional
    public Order checkout(List<CartItemDTO> cartItems) {
        log.info("Iniciando checkout com {} itens", cartItems.size());

        // Fail Fast: valida carrinho vazio primeiro
        if (cartItems == null || cartItems.isEmpty()) {
            throw new BusinessException("O carrinho não pode estar vazio para realizar o checkout");
        }

        Order order = new Order();

        // Processa cada item
        for (CartItemDTO cartItem : cartItems) {
            processCartItem(order, cartItem);
        }

        order.setStatus(OrderStatus.CONFIRMED);
        Order savedOrder = orderRepository.save(order);

        log.info("Checkout concluído. Pedido #{} - Total: R$ {}",
                savedOrder.getId(), savedOrder.getTotal());

        return savedOrder;
    }

    /**
     * Processa um item individual do carrinho.
     * 
     * <p>
     * <b>Responsabilidades:</b>
     * </p>
     * <ul>
     * <li>Buscar o produto no banco</li>
     * <li>Validar disponibilidade de estoque</li>
     * <li>Decrementar o estoque do produto</li>
     * <li>Criar o item do pedido com preço congelado</li>
     * </ul>
     * 
     * @param order    pedido ao qual o item será adicionado
     * @param cartItem dados do item (productId e quantity)
     * @throws ResourceNotFoundException  se o produto não existir
     * @throws InsufficientStockException se o estoque for insuficiente
     */
    private void processCartItem(Order order, CartItemDTO cartItem) {
        Product product = productRepository.findById(cartItem.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto", cartItem.productId()));

        int requested = cartItem.quantity();
        int available = product.getStock();

        // Fail Fast: valida estoque antes de prosseguir
        if (available < requested) {
            log.warn("Estoque insuficiente: {} (solicitado: {}, disponível: {})",
                    product.getName(), requested, available);
            throw new InsufficientStockException(product.getName(), requested, available);
        }

        // Decrementa estoque
        product.setStock(available - requested);
        productRepository.save(product);

        // Cria item do pedido com preço congelado
        OrderItem orderItem = new OrderItem();
        orderItem.setProduct(product);
        orderItem.setQuantity(requested);
        orderItem.setUnitPrice(product.getPrice());
        orderItem.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(requested)));

        order.addItem(orderItem);

        log.debug("Item processado: {} x{} = R$ {}",
                product.getName(), requested, orderItem.getSubtotal());
    }

    /**
     * Cancela um pedido e restaura o estoque dos produtos.
     * 
     * <p>
     * <b>Operação Transacional:</b> Garante que o estoque seja restaurado
     * corretamente mesmo em caso de falha durante o processo.
     * </p>
     * 
     * <p>
     * <b>Regras:</b>
     * </p>
     * <ul>
     * <li>Pedidos já cancelados não podem ser cancelados novamente</li>
     * <li>O estoque de cada produto é incrementado com a quantidade do item</li>
     * </ul>
     * 
     * @param orderId identificador do pedido a ser cancelado
     * @return pedido com status atualizado para CANCELLED
     * @throws ResourceNotFoundException se o pedido não existir
     * @throws BusinessException         se o pedido já estiver cancelado
     */
    @Transactional
    public Order cancelOrder(Long orderId) {
        Order order = findById(orderId);

        // Fail Fast: verifica se já está cancelado
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessException("O pedido já está cancelado");
        }

        // Restaura estoque de cada item
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);

            log.debug("Estoque restaurado: {} +{}", product.getName(), item.getQuantity());
        }

        order.setStatus(OrderStatus.CANCELLED);
        log.info("Pedido #{} cancelado com sucesso", orderId);

        return orderRepository.save(order);
    }
}
