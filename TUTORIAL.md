# Guia de Instalação e Execução - AllureModa

Este guia explica como configurar e rodar o projeto AllureModa tanto em ambiente de Desenvolvimento quanto em Produção.

## Pré-requisitos

*   **Node.js**: Versão 18 ou superior.
*   **PostgreSQL**: Banco de dados relacional.
*   **Git**: Para versionamento de código.

## 1. Instalação e Configuração

### Passo 1: Instalar Dependências
Abra o terminal na pasta do projeto e execute:
```bash
npm install
```
*Isso instalará as bibliotecas necessárias e, graças ao script `postinstall` que adicionamos, irá gerar automaticamente o cliente do Prisma.*

### Passo 2: Configurar Variáveis de Ambiente
O projeto agora suporta múltiplos ambientes. **Não commite** seus arquivos `.env` reais no Git (já estão no `.gitignore`).

1.  **Backend** (Raiz):
    *   Crie `.env.development` (para `npm run dev:local`) copiando o exemplo abaixo.
    *   Crie `.env.production` (para `npm run dev:prod`) com as URLs de produção.
2.  **Frontend** (Pasta `view`):
    *   Crie `.env.development` (para `npm run start:local`).
    *   Crie `.env.production` (para `npm run start:prod`).

**Exemplo de `.env.development` (Backend):**
```ini
# Banco de Dados
DATABASE_URL="postgresql://..."

# Autenticação
JWT_SECRET="sua_chave_secreta"

# Servidor e Frontend
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### Passo 3: Configurar o Banco de Dados
Certifique-se de que seu PostgreSQL está rodando e a URL de conexão no `.env` está correta. Em seguida, sincronize o esquema do banco:
```bash
npx prisma db push
```
*(Ou `npx prisma migrate dev` se estiver usando migrações)*

---

## 2. Rodando o Projeto (Backend + Frontend)

Agora você tem comandos facilitados para alternar entre "Modo Local" e "Modo Produção".

### Backend (Pasta Raiz)

*   **Modo Local** (Usa `.env.development`):
    ```bash
    npm run dev:local
    ```
    *Roda servidor na porta 3001 e aceita conexões do localhost:3000.*

*   **Modo Produção/Teste** (Usa `.env.production`):
    ```bash
    npm run dev:prod
    ```
    *Roda servidor na porta 3001, mas configurado como se estivesse em produção (CORS aceita Vercel).*

### Frontend (Pasta `view`)

*   **Modo Local** (Conecta ao Backend Local):
    ```bash
    npm run start:local
    ```
    *Abre o site em localhost:3000 e tenta conectar na API em localhost:3001.*

*   **Modo Produção** (Conecta ao Backend na Nuvem):
    ```bash
    npm run start:prod
    ```
    *Abre o site em localhost:3000, mas faz requisições direto para `https://alluremoda.onrender.com`.*


---

## Solução de Erros Comuns

### Erro: `@prisma/client did not initialize yet`
Se você ver este erro, significa que os arquivos internos do Prisma não foram gerados.
**Solução**: Rode o comando:
```bash
npx prisma generate
```
ou
```bash
npm run build
```

### Comando `prisma` não encontrado
Se tentar rodar `prisma generate` e falhar, é porque o prisma não está instalado globalmente.
**Solução**: Use sempre `npx` antes do comando: `npx prisma generate`.
