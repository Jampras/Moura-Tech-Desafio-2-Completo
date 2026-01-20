package com.desafio.loja.config;

import com.desafio.loja.model.User;
import com.desafio.loja.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Configuração de Dados Iniciais (Seed).
 * 
 * Cria usuários padrão ao iniciar a aplicação.
 * Os usuários só são criados se não existirem.
 * 
 * @author Desafio Técnico Moura Tech
 */
@Configuration
public class DataSeederConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSeederConfig.class);

    /**
     * Popula o banco com usuários iniciais.
     * 
     * USUÁRIOS CRIADOS:
     * - admin / admin123 (ADMIN)
     * - cliente / cliente123 (CLIENT)
     */
    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository) {
        return args -> {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

            // Cria usuário ADMIN se não existir
            if (userRepository.findByName("admin").isEmpty()) {
                User admin = new User();
                admin.setName("admin");
                admin.setEmail("admin@moura.com.br");
                admin.setPassword(encoder.encode("admin123"));
                admin.setRole("ADMIN");
                userRepository.save(admin);
                log.info("✅ Usuário ADMIN criado: admin / admin123");
            }

            // Cria usuário CLIENTE se não existir
            if (userRepository.findByName("cliente").isEmpty()) {
                User cliente = new User();
                cliente.setName("cliente");
                cliente.setEmail("cliente@email.com");
                cliente.setPassword(encoder.encode("cliente123"));
                cliente.setRole("CLIENT");
                userRepository.save(cliente);
                log.info("✅ Usuário CLIENTE criado: cliente / cliente123");
            }

            log.info("📋 Usuários disponíveis para login:");
            log.info("   → admin / admin123 (Administrador)");
            log.info("   → cliente / cliente123 (Cliente)");
        };
    }
}
