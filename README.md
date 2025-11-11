# Allure by Lu Mota - E-commerce

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Este é o repositório oficial do projeto de e-commerce "Allure by Lu Mota", uma plataforma de moda online moderna, segura e de alta performance.

O projeto utiliza uma arquitetura **headless (desacoplada)**, com um frontend focado na experiência do usuário (React.js) e um backend robusto (Node.js) servindo uma API REST, garantindo segurança e escalabilidade.

---

## 🏛️ Arquitetura do Projeto

A arquitetura é baseada em uma separação clara de responsabilidades:

* **Frontend (Cliente):** Um aplicativo React (SPA) hospedado na **Vercel**. Ele é responsável por toda a interface do usuário e experiência de navegação.
* **Backend (API):** Uma API RESTful construída com Node.js e Express, seguindo o padrão **MVC (Model-View-Controller)**. É hospedada na **AWS (Elastic Beanstalk)**.
* **Banco de Dados:** Uma instância **PostgreSQL** hospedada na **AWS (RDS)**, acessada exclusivamente pelo backend através do ORM **Prisma**.
* **Autenticação:** A autenticação é *state-less* (sem sessão) e baseada em **JWT (JSON Web Token)**. O token é armazenado em **Cookies `HttpOnly`, `Secure` e `SameSite`** para mitigar ataques XSS e CSRF.
* **Domínios:**
    * **Frontend:** `https://allure.com.br` (exemplo)
    * **Backend:** `https://api.allure.com.br` (exemplo)

*(Aqui você pode inserir o diagrama de arquitetura gerado pelo Gemini/Canva)*
``

---

## 🚀 Stack de Tecnologia

A stack foi escolhida para otimizar a performance, segurança e a experiência de desenvolvimento.

### Frontend
* **Framework:** **React.js**
* **Estilização:** **Tailwind CSS**
* **Comunicação API:** `fetch` (com `credentials: 'include'`) ou `Axios`
* **Hospedagem:** **Vercel**

### Backend
* **Ambiente:** **Node.js**
* **Framework:** **Express.js**
* **Arquitetura:** **MVC (Model-View-Controller)**
* **Autenticação:** **JWT** (Json Web Token) + **`bcryptjs`** (para hash de senhas)
* **Hospedagem:** **AWS (Elastic Beanstalk)**

### Banco de Dados
* **Banco:** **PostgreSQL**
* **ORM:** **Prisma**
* **Hospedagem:** **AWS (RDS)**

### Pagamentos
* **Integração:** **Stripe** ou **Mercado Pago** (via Webhooks e API)

---

## ✨ Funcionalidades

* **Vitrine de Produtos:** Listagem, busca e filtragem de produtos.
* **Carrinho de Compras:** Adição, remoção e atualização de itens no carrinho.
* **Autenticação Segura:** Cadastro e Login de usuários (JWT + Cookies `HttpOnly`).
* **Checkout:** Integração segura com gateway de pagamento (Stripe/Mercado Pago).
* **Painel do Usuário:** Visualização de histórico de pedidos.
* **(Admin) Gerenciamento de Produtos:** CRUD de produtos (requer autenticação de admin).

---

## ⚙️ Rodando o Projeto Localmente

Para rodar o projeto em sua máquina local, você precisará clonar este repositório e rodar o Frontend e o Backend separadamente.

**Pré-requisitos:**
* **Node.js** (v18+)
* **PostgreSQL** (instância local ou em nuvem)
* **npm** ou **yarn**

---

### 1. Backend (API)

1.  Navegue até a pasta do backend:
    ```bash
    cd backend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Crie um arquivo `.env` na raiz da pasta `backend` e adicione as seguintes variáveis:
    ```.env
    # Configuração do Banco de Dados (PostgreSQL)
    DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/allure_db"

    # Chave secreta para assinar o JWT
    JWT_SECRET="sua-chave-secreta-muito-forte"

    # URL do seu frontend (para o CORS)
    FRONTEND_URL="http://localhost:3000"
    ```
4.  Execute as migrações do Prisma para criar as tabelas no banco:
    ```bash
    npx prisma migrate dev
    ```
5.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
6.  O backend estará rodando em `http://localhost:3001` (ou a porta que você definir).

---

### 2. Frontend (React)

1.  Abra um **novo terminal** e navegue até a pasta do frontend:
    ```bash
    cd frontend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Crie um arquivo `.env.local` na raiz da pasta `frontend` para apontar para a sua API local:
    ```.env.local
    REACT_APP_API_URL="http://localhost:3001/api"
    ```
4.  Inicie o servidor de desenvolvimento React:
    ```bash
    npm start
    ```
5.  Abra `http://localhost:3000` no seu navegador.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
