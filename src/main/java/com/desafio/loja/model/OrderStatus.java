package com.desafio.loja.model;

/**
 * Enum para representar os status possíveis de um pedido.
 */
public enum OrderStatus {
    PENDING,    // Pedido criado, aguardando processamento
    CONFIRMED,  // Pedido confirmado/pago
    CANCELLED   // Pedido cancelado
}
