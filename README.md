# 🛒 Moura Tech - Sistema E-commerce

Sistema completo de e-commerce com **autenticação de usuários**, **gestão de produtos**, **carrinho de compras** e **checkout transacional**. 

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Tecnologias](#-tecnologias)
3. [Arquitetura do Projeto](#-arquitetura-do-projeto)
4. [Estrutura de Pastas](#-estrutura-de-pastas)
5. [Pré-requisitos](#-pré-requisitos)
6. [Guia de Instalação e Execução](#-guia-de-instalação-e-execução)
7. [Autenticação](#-autenticação)
8. [Endpoints da API](#-endpoints-da-api)
9. [Documentação Swagger](#-documentação-swagger)
10. [Diferenciais Implementados](#-diferenciais-implementados)
11. [Variáveis de Ambiente](#-variáveis-de-ambiente)
12. [Troubleshooting](#-troubleshooting)

---

## 📖 Visão Geral

Este projeto implementa uma loja virtual com as seguintes funcionalidades:

- ✅ **Autenticação** com login/registro usando BCrypt
- ✅ Cadastro e gestão de produtos (CRUD completo)
- ✅ Carrinho de compras com cálculo automático de total
- ✅ Checkout transacional com validação de estoque
- ✅ Cancelamento de pedidos com rollback de estoque
- ✅ Interface moderna e responsiva com rotas protegidas
- ✅ Sistema de recibos/comprovantes

---

## 🛠 Tecnologias

### Backend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Java | 17 | Linguagem principal |
| Spring Boot | 3.2.1 | Framework web |
| Spring Data JPA | - | Persistência de dados |
| Spring Security Crypto | - | Criptografia BCrypt para senhas |
| PostgreSQL | 16+ | Banco de dados relacional |
| Lombok | - | Redução de boilerplate |
| SpringDoc OpenAPI | 2.3.0 | Documentação Swagger |
| Maven | 3.9+ | Gerenciador de dependências |

### Frontend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| React | 18.2 | Biblioteca UI |
| Vite | 5.0 | Build tool |
| React Router | 6.21 | Navegação SPA |
| Axios | 1.6 | Cliente HTTP |
| Tailwind CSS | 4.1 | Framework CSS utilitário |
| Lucide React | 0.562 | Ícones |

### Infraestrutura

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Docker | 24+ | Containerização |
| Docker Compose | 2.x | Orquestração de containers |

---

## 🏗 Arquitetura do Projeto

O projeto segue a **Arquitetura em Camadas** com separação clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)                   │
│                    http://localhost:3000                    │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/JSON (Proxy via Vite)
┌─────────────────────────▼───────────────────────────────────┐
│                  Controller (REST API)                      │
│     AuthController, ProductController, CartController       │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│               Service (Regras de Negócio)                   │
│             ProductService, OrderService                    │
│       • Validações • Transações • Lógica de estoque         │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              Repository (JPA/Hibernate)                     │
│    ProductRepository, OrderRepository, UserRepository       │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                      PostgreSQL                             │
│                  http://localhost:5432                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Pastas

### Visão Geral

```
moura tech/
├── 📄 pom.xml                    # Configuração Maven (dependências)
├── 📄 README.md                  # Documentação do projeto
├── 📄 docker-compose.yml         # Configuração Docker (PostgreSQL)
│
├── 📂 src/main/                  # Código-fonte Backend
│   ├── 📂 java/com/desafio/loja/
│   │   ├── 📄 LojaApplication.java      # Classe principal
│   │   ├── 📂 config/                   # Configurações
│   │   ├── 📂 controller/               # Endpoints REST
│   │   ├── 📂 service/                  # Regras de negócio
│   │   ├── 📂 repository/               # Acesso a dados
│   │   ├── 📂 model/                    # Entidades JPA
│   │   ├── 📂 dto/                      # Data Transfer Objects
│   │   └── 📂 exception/                # Exceções customizadas
│   │
│   └── 📂 resources/
│       ├── 📄 application.properties    # Configurações da aplicação
│       ├── 📄 schema.sql                # DDL do banco de dados
│       └── 📄 seed_users.sql            # Dados de seed (usuários)
│
└── 📂 frontend/                  # Código-fonte Frontend
    ├── 📄 package.json           # Dependências Node.js
    ├── 📄 vite.config.js         # Configuração Vite
    ├── 📄 index.html             # HTML principal
    └── 📂 src/
        ├── 📄 App.jsx            # Componente raiz
        ├── 📄 main.jsx           # Entry point
        ├── 📄 index.css          # Estilos globais (Tailwind)
        ├── 📂 components/        # Componentes React
        ├── 📂 pages/             # Páginas (rotas)
        ├── 📂 context/           # Context API (estado global)
        ├── 📂 services/          # Serviços de API
        └── 📂 utils/             # Funções utilitárias
```

### Detalhamento Backend (`src/main/java/com/desafio/loja/`)

| Pasta | Arquivos | Responsabilidade |
|-------|----------|------------------|
| `config/` | `OpenApiConfig.java`, `DataSeederConfig.java`, `ProductSeederConfig.java` | Configurações do Swagger e seed de dados |
| `controller/` | `AuthController.java`, `ProductController.java`, `CartController.java`, `OrderController.java` | Endpoints REST (sem lógica de negócio) |
| `service/` | `ProductService.java`, `OrderService.java` | Regras de negócio, validações, transações |
| `repository/` | `ProductRepository.java`, `OrderRepository.java`, `UserRepository.java` | Queries JPA |
| `model/` | `Product.java`, `Order.java`, `OrderItem.java`, `OrderStatus.java`, `User.java` | Entidades JPA |
| `dto/` | `ProductDTO.java`, `CartItemDTO.java`, `OrderResponseDTO.java`, etc. | Objetos de transferência |
| `exception/` | `BusinessException.java`, `GlobalExceptionHandler.java`, etc. | Exceções e tratamento de erros |

### Detalhamento Frontend (`frontend/src/`)

| Pasta | Arquivos | Responsabilidade |
|-------|----------|------------------|
| `components/` | `ProductCard.jsx`, `ProductList.jsx`, `ProductModal.jsx`, `ProductForm.jsx`, `CartDrawer.jsx`, `Header.jsx`, `Toast.jsx`, `ToastNotification.jsx`, `ConfirmationModal.jsx`, `PrivateRoute.jsx` | Componentes reutilizáveis |
| `pages/` | `HomePage.jsx`, `AdminPage.jsx`, `LoginPage.jsx`, `CheckoutPage.jsx`, `ReceiptPage.jsx` | Páginas principais |
| `context/` | `CartContext.jsx`, `CartDrawerContext.jsx`, `CartNotificationContext.jsx`, `AuthContext.jsx` | Gerenciamento de estado global |
| `services/` | `api.js`, `ProductService.js`, `CartService.js` | Comunicação com a API |
| `utils/` | `formatters.js`, `imageUtils.js` | Funções auxiliares |

---

## ⚙ Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado:

| Requisito | Versão Mínima | Verificar Instalação |
|-----------|---------------|----------------------|
| **Java JDK** | 17 | `java -version` |
| **Maven** | 3.9 | `mvn -version` |
| **Node.js** | 18 | `node --version` |
| **npm** | 9 | `npm --version` |
| **Docker** | 24 | `docker --version` |
| **Docker Compose** | 2.x | `docker compose version` |

---

## 🚀 Guia de Instalação e Execução

### Passo 1: Clonar o Repositório

```bash
git clone git@github.com:Jampras/Moura-Tech-Desafio-2-Completo.git
cd Moura-Tech-Desafio-2-Completo
```

---

### Passo 2: Iniciar o Banco de Dados (PostgreSQL)

**Opção A: Usando Docker Compose (Recomendado)**

```bash
# Iniciar o PostgreSQL
docker compose up -d

# Verificar se está rodando
docker compose ps
```

**Opção B: Usando Docker diretamente**

```bash
docker run -d \
  --name loja-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=loja_db \
  -p 5432:5432 \
  postgres:16-alpine
```

**Opção C: PostgreSQL instalado localmente**

```sql
-- Conectar ao PostgreSQL e criar o banco
CREATE DATABASE loja_db;
```

> **✅ Verificação:** O banco deve estar acessível em `localhost:5432`

---

### Passo 3: Executar o Backend (Spring Boot)

```bash
# Na raiz do projeto
cd "moura tech"

# Compilar e executar
mvn spring-boot:run
```

> **📌 Primeira execução:** O Maven irá baixar todas as dependências automaticamente.  
> Isso pode levar alguns minutos na primeira vez.

> **✅ Verificação:** Acesse http://localhost:8080/swagger-ui.html

---

### Passo 4: Instalar Dependências do Frontend

```bash
# Entrar na pasta do frontend
cd frontend

# Instalar dependências
npm install
```

---

### Passo 5: Executar o Frontend (React)

```bash
# Ainda na pasta frontend
npm run dev
```

> **✅ Verificação:** Acesse http://localhost:3000

---

### Resumo dos Comandos (Copiar e Colar)

Execute estes comandos em sequência em **3 terminais diferentes**:

**Terminal 1 - Banco de Dados:**
```bash
cd "moura tech"
docker compose up -d
```

**Terminal 2 - Backend:**
```bash
cd "moura tech"
mvn spring-boot:run
```

**Terminal 3 - Frontend:**
```bash
cd "moura tech/frontend"
npm install
npm run dev
```

---

### URLs da Aplicação

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:3000 | Interface do usuário |
| Backend API | http://localhost:8080 | API REST |
| Swagger UI | http://localhost:8080/swagger-ui.html | Documentação interativa |
| API Docs (JSON) | http://localhost:8080/api-docs | OpenAPI spec |

---

## 🔐 Autenticação

O sistema possui autenticação com roles (ADMIN/CLIENTE) usando BCrypt para hash de senhas.

### Credenciais de Teste

| Usuário | Senha | Role | Descrição |
|---------|-------|------|-----------|
| `admin` | `123` | ADMIN | Acesso total ao sistema |

### Fluxo de Autenticação

1. Usuário acessa `/login`
2. Frontend envia credenciais para `/auth/login`
3. Backend valida senha com BCrypt
4. Retorna dados do usuário (id, name, role)
5. Frontend armazena no `localStorage` e `AuthContext`
6. Rotas protegidas verificam autenticação via `ProtectedRoute`

### Endpoints de Autenticação (`/auth`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/auth/login` | Realiza login do usuário |
| `POST` | `/auth/register` | Registra novo usuário |

**Exemplo - Login:**
```json
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123"
}
```

**Resposta de Sucesso:**
```json
{
  "id": 1,
  "name": "admin",
  "role": "ADMIN"
}
```

**Exemplo - Registro:**
```json
POST /auth/register
Content-Type: application/json

{
  "name": "novo_usuario",
  "email": "email@exemplo.com",
  "password": "senha123",
  "role": "CLIENTE"
}
```

---

## 📡 Endpoints da API

### Produtos (`/products`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/products` | Listar todos os produtos |
| `GET` | `/products/{id}` | Buscar produto por ID |
| `GET` | `/products/search?name=` | Buscar por nome |
| `POST` | `/products` | Criar novo produto |
| `PUT` | `/products/{id}` | Atualizar produto |
| `DELETE` | `/products/{id}` | Excluir produto |

**Exemplo - Criar Produto:**
```json
POST /products
Content-Type: application/json

{
  "name": "Teclado Mecânico RGB",
  "price": 299.90,
  "stock": 50,
  "category": "Periféricos",
  "image": "data:image/jpeg;base64,..."
}
```

### Carrinho (`/cart`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/cart/checkout` | Finalizar compra |
| `GET` | `/cart/orders` | Listar pedidos |
| `GET` | `/cart/orders/{id}` | Buscar pedido por ID |
| `POST` | `/cart/orders/{id}/cancel` | Cancelar pedido |

**Exemplo - Checkout:**
```json
POST /cart/checkout
Content-Type: application/json

{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

**Resposta de Sucesso:**
```json
{
  "id": 1,
  "total": 749.70,
  "status": "CONFIRMED",
  "createdAt": "2026-01-16T20:24:00",
  "items": [
    {
      "productId": 1,
      "productName": "Teclado Mecânico RGB",
      "quantity": 2,
      "unitPrice": 299.90,
      "subtotal": 599.80
    }
  ]
}
```

---

## 📖 Documentação Swagger

Acesse a documentação interativa da API:

🔗 **http://localhost:8080/swagger-ui.html**

A documentação inclui:
- Todos os endpoints disponíveis
- Schemas de request/response
- Opção de testar diretamente no navegador

---

## ⭐ Diferenciais Implementados

### ✅ Sistema de Autenticação Completo

- Login/Registro com BCrypt para hash de senhas
- Roles de usuário (ADMIN/CLIENTE)
- Rotas protegidas no frontend
- Persistência de sessão com localStorage

### ✅ Arquitetura em Camadas (SOLID)

- **Single Responsibility**: Cada classe tem uma única responsabilidade
- **Controller**: Apenas recebe requisições e delega para Service
- **Service**: Toda lógica de negócio centralizada
- **Repository**: Apenas acesso a dados

### ✅ Tratamento de Exceções Global

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponseDTO> handleBusiness(BusinessException ex) {
        // Retorna JSON estruturado com mensagem amigável
    }
}
```

**Exceções customizadas:**
- `BusinessException` - Erros de regra de negócio
- `ResourceNotFoundException` - Recurso não encontrado (404)
- `InsufficientStockException` - Estoque insuficiente
- `InvalidValueException` - Valor inválido (preço negativo)

### ✅ Validações de Negócio

| Validação | Camada | Descrição |
|-----------|--------|-----------|
| Preço > 0 | Service | Bloqueia cadastro com preço negativo/zero |
| Estoque ≥ 0 | Service | Não permite estoque negativo |
| Estoque no Checkout | Service | Verifica disponibilidade antes de vender |
| Decremento Automático | Service | Atualiza estoque após venda |

### ✅ Transações com Rollback Automático

```java
@Transactional
public Order checkout(List<CartItemDTO> items) {
    // Se qualquer item falhar, toda operação é revertida
}
```

### ✅ Frontend Moderno

- **AuthContext** para gerenciamento de autenticação
- **Context API** para gerenciamento do carrinho
- **Sistema de Toast** para feedback visual
- **Tailwind CSS** para estilização
- **Design responsivo** e tema escuro
- **Rotas protegidas** com redirecionamento

---

## 🔐 Variáveis de Ambiente

O projeto suporta variáveis de ambiente para configuração:

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `DB_USERNAME` | `postgres` | Usuário do banco |
| `DB_PASSWORD` | `postgres` | Senha do banco |

**Exemplo de uso:**
```bash
DB_USERNAME=meuuser DB_PASSWORD=minhasenha mvn spring-boot:run
```

---

## 🐳 Docker Compose

O arquivo `docker-compose.yml` configura o PostgreSQL com:

- Persistência de dados via volume
- Script de inicialização automático (`schema.sql`)
- Health check para verificar disponibilidade
- Limites de memória (512MB)

```bash
# Subir containers
docker compose up -d

# Ver logs
docker compose logs -f postgres

# Parar containers
docker compose down

# Limpar volumes (APAGA DADOS)
docker compose down -v
```

---

## ❓ Troubleshooting

### Erro: "Connection refused" ao conectar no banco

```bash
# Verificar se o container está rodando
docker ps

# Se não estiver, iniciar
docker start loja-postgres
```

### Erro: "Port 8080 already in use"

```bash
# Linux/Mac - Encontrar processo na porta
lsof -i :8080

# Matar o processo
kill -9 <PID>
```

### Erro: "npm install" demora muito

```bash
# Limpar cache do npm
npm cache clean --force

# Tentar novamente
npm install
```

### Erro: Maven não encontrado

```bash
# Instalar Maven (Ubuntu/Debian)
sudo apt install maven

# Ou usar o wrapper do Maven (se existir)
./mvnw spring-boot:run
```

### Erro: Login não funciona

1. Verifique se o banco está rodando
2. Verifique se existe o usuário na tabela `tb_users`
3. A senha deve estar em hash BCrypt (o `seed_users.sql` cria usuário admin)

---

## 📝 Checklist de Requisitos

- [x] Cadastro de produto bloqueia valores negativos
- [x] O checkout diminui a quantidade no estoque
- [x] O checkout impede a venda se estoque insuficiente
- [x] O carrinho calcula o total automaticamente
- [x] O Swagger está abrindo e listando as rotas
- [x] Código organizado em camadas (Controller/Service/Repository)
- [x] Tratamento de exceções com JSON amigável
- [x] Frontend com React e Context API
- [x] Feedback visual (Toast) para erros
- [x] Sistema de autenticação com BCrypt
- [x] Rotas protegidas redirecionam para login
- [x] Página de recibo/comprovante

---

## 👨‍💻 Autor

Desenvolvido como **Desafio Técnico - Moura Tech**

---

## 📄 Licença

Este projeto é de uso educacional/demonstrativo.
