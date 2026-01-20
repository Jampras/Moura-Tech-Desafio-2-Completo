package com.desafio.loja.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidade Order - Representa um pedido/carrinho finalizado.
 * Atualizada para incluir a relação com o Usuário, permitindo a busca por ID de usuário.
 */
@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Relacionamento com o Usuário dono do pedido.
     * Mapeado para a coluna 'user_id' no banco de dados.
     */
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    /**
     * Adiciona um item ao pedido e recalcula o total.
     */
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
        recalculateTotal();
    }

    /**
     * Remove um item do pedido e recalcula o total.
     */
    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
        recalculateTotal();
    }

    /**
     * Recalcula o total do pedido somando todos os subtotais.
     */
    public void recalculateTotal() {
        this.total = items.stream()
                .map(OrderItem::getSubtotal)
                .filter(subtotal -> subtotal != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}