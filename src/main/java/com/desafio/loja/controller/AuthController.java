package com.desafio.loja.controller;

import com.desafio.loja.model.User;
import com.desafio.loja.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller de Autenticação.
 * 
 * Responsável por:
 * - Login de usuários (ADMIN ou CLIENTE)
 * - Registro de novos usuários (com hash de senha)
 * 
 * @author Desafio Técnico Moura Tech
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository repository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UserRepository repository) {
        this.repository = repository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * Realiza o login do usuário.
     * 
     * @param dados Map contendo "username" e "password"
     * @return Dados do usuário (id, name, role) ou erro 401
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> dados) {
        String username = dados.get("username");
        String password = dados.get("password");

        // Busca o usuário pelo nome
        User usuario = repository.findByName(username).orElse(null);

        // Verifica se existe e se a senha bate (usando BCrypt)
        if (usuario != null && passwordEncoder.matches(password, usuario.getPassword())) {
            return ResponseEntity.ok(Map.of(
                    "id", usuario.getId(),
                    "name", usuario.getName(),
                    "role", usuario.getRole()));
        }

        return ResponseEntity.status(401).body(Map.of(
                "error", "Usuário ou senha inválidos!"));
    }

    /**
     * Registra um novo usuário com senha criptografada.
     * 
     * @param novoUsuario Dados do usuário a ser criado
     * @return Usuário criado (sem expor a senha)
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User novoUsuario) {
        // Verifica se o nome já existe
        if (repository.findByName(novoUsuario.getName()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Usuário já existe!"));
        }

        // Criptografa a senha antes de salvar
        String senhaHash = passwordEncoder.encode(novoUsuario.getPassword());
        novoUsuario.setPassword(senhaHash);

        User salvo = repository.save(novoUsuario);

        return ResponseEntity.ok(Map.of(
                "id", salvo.getId(),
                "name", salvo.getName(),
                "role", salvo.getRole(),
                "message", "Usuário criado com sucesso!"));
    }
}