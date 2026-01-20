package com.desafio.loja.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "tb_users") // Nome da tabela no banco
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    
    @Column(unique = true) // Não deixa cadastrar 2 emails iguais
    private String email;
    
    private String password;
    
    private String role; // Aqui vamos escrever "ADMIN" ou "CLIENTE"
}