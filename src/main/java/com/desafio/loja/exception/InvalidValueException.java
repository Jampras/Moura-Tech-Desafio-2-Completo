package com.desafio.loja.exception;

/**
 * Exceção lançada quando um valor inválido é fornecido (ex: preço negativo).
 */
public class InvalidValueException extends BusinessException {

    public InvalidValueException(String message) {
        super(message);
    }

    public InvalidValueException(String field, Object value) {
        super(String.format("Valor inválido para o campo '%s': %s", field, value));
    }

}
