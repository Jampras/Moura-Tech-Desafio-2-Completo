package com.desafio.loja.exception;

import com.desafio.loja.dto.ErrorResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

/**
 * Handler Global de Exceções para toda a aplicação.
 * 
 * <h2>Como funciona a interceptação:</h2>
 * <p>
 * O Spring utiliza o padrão <b>AOP (Aspect Oriented Programming)</b> para
 * interceptar
 * exceções lançadas em qualquer Controller. Quando uma exceção é lançada:
 * </p>
 * <ol>
 * <li>O Spring verifica se existe um método anotado com
 * {@code @ExceptionHandler}
 * que trate aquele tipo específico de exceção</li>
 * <li>A anotação {@code @RestControllerAdvice} indica que esta classe é um
 * "conselheiro" global que se aplica a todos os controllers</li>
 * <li>O método handler mais específico é executado (exceção mais específica tem
 * prioridade)</li>
 * <li>O retorno do método é serializado como JSON e enviado ao cliente</li>
 * </ol>
 * 
 * <h2>Hierarquia de Exceções Tratadas:</h2>
 * 
 * <pre>
 * Exception (genérica - captura tudo)
 *   └── RuntimeException
 *         └── BusinessException (400 Bad Request)
 *               ├── InvalidValueException (preço negativo)
 *               └── InsufficientStockException (estoque insuficiente)
 *         └── ResourceNotFoundException (404 Not Found)
 *   └── MethodArgumentNotValidException (validação de DTO - 400)
 * </pre>
 * 
 * <h2>Por que usar @RestControllerAdvice?</h2>
 * <ul>
 * <li><b>Centralização:</b> Toda lógica de tratamento de erro em um único
 * lugar</li>
 * <li><b>Consistência:</b> Todas as respostas de erro seguem o mesmo formato
 * JSON</li>
 * <li><b>Manutenibilidade:</b> Fácil adicionar novos handlers ou modificar
 * existentes</li>
 * <li><b>Segurança:</b> Evita expor stacktraces sensíveis ao cliente</li>
 * </ul>
 * 
 * @author Desafio Técnico
 * @version 1.0
 * @see ErrorResponseDTO
 * @see BusinessException
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

        private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

        /*
         * ========================================================================
         * HANDLERS DE VALIDAÇÃO DE DTO (Bean Validation / @Valid)
         * ========================================================================
         */

        /**
         * Trata erros de validação de DTOs anotados com {@code @Valid}.
         * 
         * <h3>Quando é acionado:</h3>
         * <p>
         * Quando um DTO falha na validação do Bean Validation (JSR-380), por exemplo:
         * </p>
         * <ul>
         * <li>{@code @NotBlank} - campo obrigatório vazio</li>
         * <li>{@code @DecimalMin("0.01")} - preço menor ou igual a zero</li>
         * <li>{@code @Min(0)} - estoque negativo</li>
         * </ul>
         * 
         * <h3>Exemplo de requisição que dispara este handler:</h3>
         * 
         * <pre>
         * POST /products
         * {
         *   "name": "",           // viola @NotBlank
         *   "price": -10.00,      // viola @DecimalMin
         *   "stock": -5           // viola @Min
         * }
         * </pre>
         * 
         * @param ex      exceção contendo os erros de validação
         * @param request requisição HTTP para extrair a URI
         * @return resposta com status 400 e lista de erros de validação
         */
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponseDTO> handleValidationException(
                        MethodArgumentNotValidException ex,
                        HttpServletRequest request) {

                // Extrai todas as mensagens de erro dos campos inválidos
                List<String> validationErrors = ex.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .map(this::formatFieldError)
                                .toList();

                log.warn("Erro de validação em {}: {}", request.getRequestURI(), validationErrors);

                ErrorResponseDTO error = new ErrorResponseDTO(
                                java.time.LocalDateTime.now(),
                                HttpStatus.BAD_REQUEST.value(),
                                "Validation Error",
                                "Erro de validação nos dados enviados",
                                request.getRequestURI(),
                                validationErrors);

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        /*
         * ========================================================================
         * HANDLERS DE EXCEÇÕES DE NEGÓCIO (Custom Business Exceptions)
         * ========================================================================
         */

        /**
         * Trata exceções de recurso não encontrado.
         * 
         * <h3>Quando é acionado:</h3>
         * <p>
         * Quando uma busca por ID não retorna resultado, por exemplo:
         * </p>
         * <ul>
         * <li>GET /products/999 - produto não existe</li>
         * <li>GET /cart/orders/999 - pedido não existe</li>
         * </ul>
         * 
         * @param ex      exceção com a mensagem de recurso não encontrado
         * @param request requisição HTTP
         * @return resposta com status 404 Not Found
         */
        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ErrorResponseDTO> handleResourceNotFound(
                        ResourceNotFoundException ex,
                        HttpServletRequest request) {

                log.warn("Recurso não encontrado: {} - {}", request.getRequestURI(), ex.getMessage());

                ErrorResponseDTO error = new ErrorResponseDTO(
                                HttpStatus.NOT_FOUND.value(),
                                "Not Found",
                                ex.getMessage(),
                                request.getRequestURI());

                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        /**
         * Trata exceções de estoque insuficiente.
         * 
         * <h3>Quando é acionado:</h3>
         * <p>
         * Durante o checkout, quando a quantidade solicitada excede o estoque
         * disponível.
         * </p>
         * 
         * <h3>Exemplo de cenário:</h3>
         * 
         * <pre>
         * Produto "Camiseta" tem 5 unidades em estoque.
         * Usuário tenta comprar 10 unidades.
         * → InsufficientStockException("Camiseta", 10, 5)
         * </pre>
         * 
         * @param ex      exceção com detalhes do produto e quantidades
         * @param request requisição HTTP
         * @return resposta com status 400 e mensagem explicativa
         */
        @ExceptionHandler(InsufficientStockException.class)
        public ResponseEntity<ErrorResponseDTO> handleInsufficientStock(
                        InsufficientStockException ex,
                        HttpServletRequest request) {

                log.warn("Estoque insuficiente: {}", ex.getMessage());

                ErrorResponseDTO error = new ErrorResponseDTO(
                                HttpStatus.BAD_REQUEST.value(),
                                "Insufficient Stock",
                                ex.getMessage(),
                                request.getRequestURI());

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        /**
         * Trata exceções de valor inválido (preço negativo, etc.).
         * 
         * <h3>Quando é acionado:</h3>
         * <p>
         * Quando a validação de negócio no Service detecta valores inválidos
         * que passaram pela validação do DTO (ex: edge cases).
         * </p>
         * 
         * @param ex      exceção com descrição do valor inválido
         * @param request requisição HTTP
         * @return resposta com status 400
         */
        @ExceptionHandler(InvalidValueException.class)
        public ResponseEntity<ErrorResponseDTO> handleInvalidValue(
                        InvalidValueException ex,
                        HttpServletRequest request) {

                log.warn("Valor inválido: {}", ex.getMessage());

                ErrorResponseDTO error = new ErrorResponseDTO(
                                HttpStatus.BAD_REQUEST.value(),
                                "Invalid Value",
                                ex.getMessage(),
                                request.getRequestURI());

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        /**
         * Trata exceções genéricas de negócio.
         * 
         * <h3>Quando é acionado:</h3>
         * <p>
         * Para qualquer {@link BusinessException} não tratada por handlers mais
         * específicos.
         * Exemplos:
         * </p>
         * <ul>
         * <li>Carrinho vazio no checkout</li>
         * <li>Pedido já cancelado</li>
         * </ul>
         * 
         * <h3>Hierarquia de handlers:</h3>
         * <p>
         * O Spring escolhe o handler mais específico. Como
         * {@code InsufficientStockException}
         * e {@code InvalidValueException} estendem {@code BusinessException}, eles têm
         * handlers próprios que são chamados primeiro.
         * </p>
         * 
         * @param ex      exceção de negócio genérica
         * @param request requisição HTTP
         * @return resposta com status 400
         */
        @ExceptionHandler(BusinessException.class)
        public ResponseEntity<ErrorResponseDTO> handleBusinessException(
                        BusinessException ex,
                        HttpServletRequest request) {

                log.warn("Erro de negócio: {}", ex.getMessage());

                ErrorResponseDTO error = new ErrorResponseDTO(
                                HttpStatus.BAD_REQUEST.value(),
                                "Bad Request",
                                ex.getMessage(),
                                request.getRequestURI());

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        /*
         * ========================================================================
         * HANDLER GENÉRICO (Fallback - Última linha de defesa)
         * ========================================================================
         */

        /**
         * Trata qualquer exceção não capturada pelos handlers específicos.
         * 
         * <h3>Propósito:</h3>
         * <ul>
         * <li><b>Segurança:</b> Nunca expõe stacktrace ao cliente</li>
         * <li><b>Logging:</b> Registra o erro completo para investigação</li>
         * <li><b>UX:</b> Retorna mensagem amigável ao usuário</li>
         * </ul>
         * 
         * <h3>Quando é acionado:</h3>
         * <p>
         * Erros inesperados como:
         * </p>
         * <ul>
         * <li>Falha de conexão com banco de dados</li>
         * <li>NullPointerException não tratada</li>
         * <li>Erros de serialização JSON</li>
         * </ul>
         * 
         * @param ex      qualquer exceção não tratada
         * @param request requisição HTTP
         * @return resposta com status 500 e mensagem genérica
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponseDTO> handleGenericException(
                        Exception ex,
                        HttpServletRequest request) {

                // Log completo com stacktrace para debug (não exposto ao cliente)
                log.error("Erro interno não tratado em {}: {}", request.getRequestURI(), ex.getMessage(), ex);

                // Mensagem genérica para o cliente (segurança)
                ErrorResponseDTO error = new ErrorResponseDTO(
                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                "Internal Server Error",
                                "Ocorreu um erro interno. Por favor, tente novamente mais tarde.",
                                request.getRequestURI());

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }

        /*
         * ========================================================================
         * MÉTODOS AUXILIARES
         * ========================================================================
         */

        /**
         * Formata um erro de campo de validação para mensagem legível.
         * 
         * @param fieldError erro do campo
         * @return mensagem formatada (ex: "Campo 'price': O preço deve ser maior que
         *         zero")
         */
        private String formatFieldError(FieldError fieldError) {
                return String.format("Campo '%s': %s", fieldError.getField(), fieldError.getDefaultMessage());
        }
}
