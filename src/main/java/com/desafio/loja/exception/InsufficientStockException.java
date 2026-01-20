package com.desafio.loja.exception;

/**
 * Exceção lançada quando o estoque é insuficiente para uma operação.
 */
public class InsufficientStockException extends BusinessException {

    public InsufficientStockException(String productName, Integer requested, Integer available) {
        super(String.format(
            "Estoque insuficiente para o produto '%s'. Solicitado: %d, Disponível: %d",
            productName, requested, available
        ));
    }

    public InsufficientStockException(String message) {
        super(message);
    }

}
