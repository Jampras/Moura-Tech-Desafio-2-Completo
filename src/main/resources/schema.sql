-- =============================================
-- SCHEMA DEFINITIVO - RODAR NO BANCO DE DADOS
-- =============================================

-- 1. TABELA DE PRODUTOS (Adicionada a coluna 'category')
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category VARCHAR(255) DEFAULT 'Automotiva', -- ADICIONADO PARA O JAVA NÃO DAR ERRO 500
    image TEXT
);

-- 2. TABELA DE USUÁRIOS (Para o Login funcionar)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CLIENT' -- 'ADMIN' ou 'CLIENT'
);

-- 3. TABELA DE PEDIDOS (Conectada ao Usuário)
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id), -- CONEXÃO COM O CLIENTE
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
);

-- 4. ITENS DO PEDIDO
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL
);

-- INSERIR USUÁRIO ADMIN PARA VOCÊ TESTAR (Login: admin / Senha: 123)
INSERT INTO users (username, password, role) 
VALUES ('admin', '123', 'ADMIN') 
ON CONFLICT (username) DO NOTHING;
