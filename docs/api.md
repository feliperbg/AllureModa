# 📡 AllureModa API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production:  https://api.alluremoda.com.br/api
```

## Authentication

A API usa **JWT Bearer Token** para autenticação.

```http
Authorization: Bearer <token>
```

---

## Endpoints

### 🔐 Auth

#### POST /auth/register

Registra um novo usuário.

**Request Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123",
  "firstName": "João",
  "lastName": "Silva",
  "phone": "11999999999",
  "cpf": "12345678900",
  "address": {
    "postalCode": "01310100",
    "street": "Av. Paulista",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brazil",
    "addressLine2": "Apto 100"
  }
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "usuario@email.com",
  "firstName": "João",
  "lastName": "Silva",
  "role": "USER"
}
```

**Errors:**
- `400` - Dados inválidos
- `409` - Email já cadastrado

---

#### POST /auth/login

Autentica um usuário.

**Request Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "usuario@email.com",
    "firstName": "João",
    "role": "USER"
  }
}
```

**Errors:**
- `401` - Credenciais inválidas

---

#### GET /auth/me

Retorna dados do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "email": "usuario@email.com",
  "firstName": "João",
  "lastName": "Silva",
  "role": "USER",
  "addresses": [...]
}
```

---

### 📦 Products

#### GET /products

Lista produtos com filtros opcionais.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Busca por nome |
| `categorySlug` | string | Filtro por categoria |
| `brandId` | string | Filtro por marca |
| `promo` | boolean | Apenas promoções |
| `page` | int | Página (default: 1) |
| `limit` | int | Itens por página (default: 20) |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Vestido Elegante",
    "slug": "vestido-elegante",
    "description": "...",
    "basePrice": 299.90,
    "promotionalPrice": 249.90,
    "category": { "id": "uuid", "name": "Vestidos", "slug": "vestidos" },
    "brand": { "id": "uuid", "name": "Marca X" },
    "images": [{ "id": "uuid", "url": "https://..." }],
    "variants": [...]
  }
]
```

---

#### GET /products/slug/:slug

Retorna um produto pelo slug.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Vestido Elegante",
  "slug": "vestido-elegante",
  "description": "Descrição completa...",
  "basePrice": 299.90,
  "promotionalPrice": 249.90,
  "category": {...},
  "brand": {...},
  "images": [...],
  "variants": [
    {
      "id": "uuid",
      "sku": "VE-P-VM",
      "stock": 10,
      "price": 299.90,
      "attributes": [
        {
          "attributeValue": {
            "value": "Vermelho",
            "meta": "#FF0000",
            "attribute": { "name": "Cor" }
          }
        },
        {
          "attributeValue": {
            "value": "P",
            "attribute": { "name": "Tamanho" }
          }
        }
      ]
    }
  ],
  "reviews": [...]
}
```

**Errors:**
- `404` - Produto não encontrado

---

### 📂 Categories

#### GET /categories

Lista todas as categorias.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Vestidos",
    "slug": "vestidos",
    "description": "...",
    "imageUrl": "https://..."
  }
]
```

---

### 🏷️ Brands

#### GET /brands

Lista todas as marcas.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Marca Premium",
    "slug": "marca-premium",
    "logoUrl": "https://..."
  }
]
```

---

### 🛒 Cart

> ⚠️ Requer autenticação

#### GET /cart

Retorna o carrinho do usuário.

**Response (200):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "items": [
    {
      "id": "uuid",
      "quantity": 2,
      "productVariantId": "uuid",
      "productVariant": {
        "sku": "VE-P-VM",
        "price": 299.90,
        "product": {
          "id": "uuid",
          "name": "Vestido Elegante",
          "basePrice": 299.90
        }
      }
    }
  ]
}
```

---

#### PUT /cart

Adiciona ou atualiza item no carrinho.

**Request Body:**
```json
{
  "productVariantId": "uuid",
  "quantity": 1
}
```

> `quantity` positivo adiciona, negativo remove.

**Response (200):** Carrinho atualizado

---

#### DELETE /cart/items/:variantId

Remove item do carrinho.

**Response (200):** Carrinho atualizado

---

### 📋 Orders

> ⚠️ Requer autenticação

#### GET /orders

Lista pedidos do usuário.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "status": "PENDING",
    "totalPrice": 599.80,
    "createdAt": "2024-12-25T10:00:00Z",
    "items": [...]
  }
]
```

---

#### POST /orders

Cria um novo pedido.

**Request Body:**
```json
{
  "shippingAddressId": "uuid",
  "items": [
    {
      "productVariantId": "uuid",
      "quantity": 2,
      "unitPrice": 299.90
    }
  ],
  "totalPrice": 599.80
}
```

**Response (201):** Pedido criado

---

#### GET /orders/:id

Retorna detalhes de um pedido.

**Response (200):**
```json
{
  "id": "uuid",
  "status": "PAID",
  "totalPrice": 599.80,
  "createdAt": "2024-12-25T10:00:00Z",
  "shippingAddress": {...},
  "items": [...],
  "payment": {...}
}
```

**Errors:**
- `404` - Pedido não encontrado
- `403` - Acesso negado (não é dono do pedido)

---

### 💳 Payments

> ⚠️ Requer autenticação

#### POST /payments

Cria um pagamento via Asaas.

**Request Body:**
```json
{
  "orderId": "uuid",
  "method": "PIX",
  "value": 599.80
}
```

**Methods:** `PIX`, `BOLETO`, `CREDIT_CARD`

**Response (201):**
```json
{
  "id": "uuid",
  "asaasPaymentId": "pay_abc123",
  "status": "PENDING",
  "method": "PIX",
  "value": 599.80,
  "dueDate": "2024-12-26"
}
```

---

#### GET /payments/:id/pix

Retorna QR Code PIX para pagamento.

**Response (200):**
```json
{
  "encodedImage": "base64...",
  "payload": "00020126580014br.gov.bcb...",
  "expirationDate": "2024-12-25T11:00:00Z"
}
```

---

### 🔔 Webhook

#### POST /webhook/asaas

Recebe notificações de pagamento do Asaas.

**Headers:**
```
asaas-access-token: <webhook_token>
```

**Request Body (exemplo):**
```json
{
  "event": "PAYMENT_CONFIRMED",
  "payment": {
    "id": "pay_abc123",
    "status": "CONFIRMED",
    "value": 599.80
  }
}
```

**Events:**
- `PAYMENT_CREATED`
- `PAYMENT_CONFIRMED`
- `PAYMENT_RECEIVED`
- `PAYMENT_OVERDUE`
- `PAYMENT_REFUNDED`

---

### 👤 User

> ⚠️ Requer autenticação

#### GET /user/profile

Retorna perfil do usuário.

---

#### PUT /user/profile

Atualiza perfil do usuário.

---

### 📍 Addresses

> ⚠️ Requer autenticação

#### GET /addresses

Lista endereços do usuário.

#### POST /addresses

Adiciona novo endereço.

#### PUT /addresses/:id

Atualiza endereço.

#### DELETE /addresses/:id

Remove endereço.

---

### ❤️ Wishlist

> ⚠️ Requer autenticação

#### GET /wishlist

Lista favoritos.

#### POST /wishlist

Adiciona produto aos favoritos.

#### DELETE /wishlist/:productId

Remove dos favoritos.

---

### 🛠️ Admin

> ⚠️ Requer role ADMIN

#### GET /admin/stats

Dashboard com estatísticas.

**Response (200):**
```json
{
  "users": 1250,
  "products": 340,
  "orders": 890,
  "revenue": 125890.50,
  "topProducts": [...],
  "charts": {
    "users": { "2024-12-20": 5, "2024-12-21": 8, ... },
    "orders": { ... },
    "revenue": { ... }
  }
}
```

---

#### GET /admin/users

Lista todos os usuários (paginado).

**Query:** `page`, `limit`

---

#### GET /admin/orders

Lista todos os pedidos (paginado).

**Query:** `page`, `limit`

---

## Error Responses

Todos os erros seguem o formato:

```json
{
  "message": "Descrição do erro",
  "errors": ["Erro 1", "Erro 2"]
}
```

### Códigos HTTP

| Code | Description |
|------|-------------|
| 200 | Sucesso |
| 201 | Criado |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Acesso negado |
| 404 | Não encontrado |
| 409 | Conflito |
| 429 | Rate limit excedido |
| 500 | Erro interno |

---

## Rate Limiting

| Endpoint | Limite |
|----------|--------|
| Global | 100/min |
| Auth | 10/min |
| Payments | 20/min |

Quando excedido, retorna `429 Too Many Requests`.
