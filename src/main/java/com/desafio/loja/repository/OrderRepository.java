package com.desafio.loja.repository;

import com.desafio.loja.model.Order;
import com.desafio.loja.model.OrderStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository para a entidade Order.
 * 
 * <p>
 * Utiliza @EntityGraph para evitar problema N+1 ao carregar itens do pedido.
 * </p>
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Busca um pedido por ID com itens e produtos carregados em uma única query.
     * Evita N+1 Select Problem.
     */

    List<Order> findByUser_Id(Long userId);

    @EntityGraph(attributePaths = { "items", "items.product" })
    Optional<Order> findWithItemsById(Long id);

    /**
     * Busca todos os pedidos com itens e produtos carregados.
     * Evita N+1 Select Problem em listagens.
     */
    @EntityGraph(attributePaths = { "items", "items.product" })
    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    List<Order> findAllWithItems();

    /**
     * Busca pedidos por status com itens carregados.
     */
    @EntityGraph(attributePaths = { "items", "items.product" })
    List<Order> findByStatus(OrderStatus status);

    /**
     * Busca pedidos criados após uma data específica com itens carregados.
     */
    @EntityGraph(attributePaths = { "items", "items.product" })
    List<Order> findByCreatedAtAfter(LocalDateTime dateTime);

    /**
     * Busca pedidos criados entre duas datas com itens carregados.
     */
    @EntityGraph(attributePaths = { "items", "items.product" })
    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

}
