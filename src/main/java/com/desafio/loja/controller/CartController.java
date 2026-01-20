package com.desafio.loja.controller;

import com.desafio.loja.dto.CheckoutRequestDTO;
import com.desafio.loja.dto.OrderResponseDTO;
import com.desafio.loja.model.Order;
import com.desafio.loja.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para operações de carrinho e checkout.
 * 
 * <p>
 * Responsável por expor os endpoints de:
 * </p>
 * <ul>
 * <li>Checkout (finalização de compra)</li>
 * <li>Consulta de pedidos</li>
 * <li>Cancelamento de pedidos</li>
 * </ul>
 * 
 * <p>
 * <b>Arquitetura:</b> Este controller não contém lógica de negócio.
 * Toda a complexidade do checkout (validação de estoque, transação,
 * cálculo de totais) é delegada para {@link OrderService}.
 * </p>
 * 
 * @author Desafio Técnico
 * @version 1.0
 * @see OrderService
 * @see CheckoutRequestDTO
 * @see OrderResponseDTO
 */
@RestController
@RequestMapping("/cart")
@Tag(name = "Carrinho", description = "Operações de carrinho e checkout")
public class CartController {

    private final OrderService orderService;

    /**
     * Construtor com injeção de dependência.
     * 
     * @param orderService serviço de pedidos
     */
    public CartController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Realiza o checkout do carrinho.
     * 
     * <p>
     * <b>Fluxo:</b>
     * </p>
     * <ol>
     * <li>Valida os dados de entrada via Bean Validation</li>
     * <li>Delega para o serviço que processa transacionalmente</li>
     * <li>Retorna o pedido criado com status 201</li>
     * </ol>
     * 
     * <p>
     * <b>Possíveis erros:</b>
     * </p>
     * <ul>
     * <li>400 - Carrinho vazio ou estoque insuficiente</li>
     * <li>404 - Produto não encontrado</li>
     * </ul>
     * 
     * @param request objeto contendo a lista de itens do carrinho
     * @return pedido criado com detalhes dos itens e total
     */
    @Operation(summary = "Finalizar compra", description = "Processa o checkout do carrinho. Valida estoque e decrementa automaticamente.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Pedido criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Estoque insuficiente ou carrinho vazio"),
            @ApiResponse(responseCode = "404", description = "Produto não encontrado")
    })
    @PostMapping("/checkout")
    public ResponseEntity<OrderResponseDTO> checkout(@Valid @RequestBody CheckoutRequestDTO request) {
        Order order = orderService.checkout(request.items());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(OrderResponseDTO.fromEntity(order));
    }

    /**
     * Lista todos os pedidos realizados.
     * 
     * @return lista de pedidos em formato DTO
     */
    @Operation(summary = "Listar pedidos", description = "Retorna todos os pedidos realizados")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponseDTO>> findAllOrders() {
        List<OrderResponseDTO> orders = orderService.findAll()
                .stream()
                .map(OrderResponseDTO::fromEntity)
                .toList();

        return ResponseEntity.ok(orders);
    }

    /**
     * Busca um pedido pelo ID.
     * 
     * @param id identificador único do pedido
     * @return pedido encontrado com detalhes dos itens
     */
    @Operation(summary = "Buscar pedido", description = "Retorna os detalhes de um pedido específico")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pedido encontrado"),
            @ApiResponse(responseCode = "404", description = "Pedido não encontrado")
    })
    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderResponseDTO> findOrderById(
            @Parameter(description = "ID do pedido") @PathVariable Long id) {

        Order order = orderService.findById(id);
        return ResponseEntity.ok(OrderResponseDTO.fromEntity(order));
    }

    /**
     * Cancela um pedido e restaura o estoque.
     * 
     * <p>
     * <b>Comportamento:</b> O estoque de cada produto do pedido
     * é restaurado com a quantidade que havia sido reservada.
     * </p>
     * 
     * @param id identificador do pedido a ser cancelado
     * @return pedido com status atualizado para CANCELLED
     */
    @Operation(summary = "Cancelar pedido", description = "Cancela um pedido e restaura o estoque dos produtos")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pedido cancelado"),
            @ApiResponse(responseCode = "404", description = "Pedido não encontrado"),
            @ApiResponse(responseCode = "400", description = "Pedido já está cancelado")
    })
    @PostMapping("/orders/{id}/cancel")
    public ResponseEntity<OrderResponseDTO> cancelOrder(
            @Parameter(description = "ID do pedido") @PathVariable Long id) {

        Order order = orderService.cancelOrder(id);
        return ResponseEntity.ok(OrderResponseDTO.fromEntity(order));
    }
}
