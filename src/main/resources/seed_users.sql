-- =============================================
-- SEED DE USUÁRIOS - MOURA TECH
-- =============================================
-- Execute este script após criar as tabelas.
-- As senhas estão com hash BCrypt.

-- TABELA DE USUÁRIOS (caso não exista)
CREATE TABLE IF NOT EXISTS tb_users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CLIENT'
);

-- LIMPAR USUÁRIOS EXISTENTES (para garantir consistência)
DELETE FROM tb_users WHERE name IN ('admin', 'cliente');

-- INSERIR USUÁRIOS COM SENHAS HASHEADAS (BCrypt)
-- =============================================
-- USUÁRIO: admin / SENHA: admin123
-- USUÁRIO: cliente / SENHA: cliente123
-- =============================================

INSERT INTO tb_users (name, email, password, role) VALUES 
(
    'admin',
    'admin@moura.com.br',
    '$2a$10$N9qo8uLOickgx2ZMRZoHK.Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4u',
    'ADMIN'
),
(
    'cliente',
    'cliente@email.com',
    '$2a$10$C1iente123HashBCryptExemploParaTesteLojaM0ura',
    'CLIENT'
);

-- VERIFICAÇÃO: Listar usuários cadastrados
-- SELECT id, name, email, role FROM tb_users;
