package com.desafio.loja.repository;

import com.desafio.loja.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Método mágico que o Spring cria sozinho para buscar por email
    Optional<User> findByEmail(String email);

    // Busca por nome de usuário (para login)
    Optional<User> findByName(String name);
}