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

### Opção Mais Fácil: Comando Unificado (Recomendado)

Você também pode rodar **Backend e Frontend** com um único comando no terminal da raiz:

*   **Modo Local Unificado** (Tudo local):
    ```bash
    npm run dev:full:local
    ```
    *Abre servidor e site simultaneamente.*

*   **Modo Prod Unificado**:
    ```bash
    npm run dev:full:prod
    ```

---

### Opção Manual (Terminais Separados)

Se preferir rodar separadamente para ver os logs melhor:

### Backend (Pasta Raiz)
*   **Modo Local**: `npm run dev:local`
*   **Modo Prod**: `npm run dev:prod`

### Frontend (Pasta `view`)
*   **Modo Local**: `npm run start:local`
*   **Modo Prod**: `npm run start:prod`


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
