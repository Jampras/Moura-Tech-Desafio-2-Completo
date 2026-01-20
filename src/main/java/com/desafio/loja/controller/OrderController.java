package com.desafio.loja.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

// Importe suas entidades e repositórios (ajuste se o nome do pacote for diferente)
import com.desafio.loja.model.Order;
import com.desafio.loja.repository.OrderRepository;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin("*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> payload) {
        // Lógica para salvar o pedido
        return ResponseEntity.ok("Pedido salvo com sucesso!");
    }

    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUser(@PathVariable Long userId) {
        return orderRepository.findByUser_Id(userId);
    }
}