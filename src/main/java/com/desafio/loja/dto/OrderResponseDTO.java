package com.desafio.loja.dto;

import com.desafio.loja.model.Order;
import com.desafio.loja.model.OrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Record DTO para resposta de pedidos.
 * 
 * @param id        ID único do pedido
 * @param items     Lista de itens do pedido
 * @param total     Total do pedido
 * @param createdAt Data de criação
 * @param status    Status do pedido
 */
@Schema(description = "Dados do pedido para resposta")
public record OrderResponseDTO(
                @Schema(description = "ID único do pedido", example = "1") Long id,

                @Schema(description = "Lista de itens do pedido") List<OrderItemDTO> items,

                @Schema(description = "Total do pedido", example = "299.70") BigDecimal total,

                @Schema(description = "Data de criação do pedido") LocalDateTime createdAt,

                @Schema(description = "Status do pedido", example = "CONFIRMED") OrderStatus status) {
        /**
         * Factory method: converte entidade Order para OrderResponseDTO.
         */
        public static OrderResponseDTO fromEntity(Order order) {
                List<OrderItemDTO> itemDTOs = order.getItems().stream()
                                .map(item -> new OrderItemDTO(
                                                item.getProduct().getId(),
                                                item.getProduct().getName(),
                                                item.getQuantity(),
                                                item.getUnitPrice(),
                                                item.getSubtotal()))
                                .toList();

                return new OrderResponseDTO(
                                order.getId(),
                                itemDTOs,
                                order.getTotal(),
                                order.getCreatedAt(),
                                order.getStatus());
        }
}
