# 🚢 Deployment Guide

## Ambientes

| Ambiente | URL | Branch |
|----------|-----|--------|
| Development | localhost | main |
| Staging | staging.alluremoda.com.br | staging |
| Production | alluremoda.com.br | production |

---

## Deploy Manual (VPS)

### 1. Requisitos do Servidor

- Ubuntu 22.04 LTS
- 2GB RAM mínimo
- 20GB SSD
- Docker 24+
- Docker Compose 2.20+

### 2. Preparação do Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Verificar instalação
docker --version
docker compose version
```

### 3. Configurar Firewall

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 4. Clonar e Configurar

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/AllureModa.git
cd AllureModa

# Configurar variáveis de produção
cp .env.example .env
nano .env
```

**Variáveis de Produção:**

```env
# IMPORTANTE: Altere todos os valores!
POSTGRES_USER=alluremoda_prod
POSTGRES_PASSWORD=SenhaMuitoForteAqui123!
POSTGRES_DB=alluremoda_production

JWT_SECRET=ChaveJWTMuitoSeguraComMaisDe64CaracteresParaProducao!

ASAAS_API_KEY=sua_api_key_producao
ASAAS_BASE_URL=https://api.asaas.com/api/v3
ASAAS_WEBHOOK_TOKEN=seu_token_webhook_seguro

NEXT_PUBLIC_API_URL=https://api.alluremoda.com.br/api
```

### 5. Configurar SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot -y

# Gerar certificados
sudo certbot certonly --standalone -d alluremoda.com.br -d api.alluremoda.com.br

# Copiar certificados
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/alluremoda.com.br/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/alluremoda.com.br/privkey.pem nginx/ssl/
```

### 6. Atualizar Nginx para HTTPS

Edite `nginx/nginx.conf`:

```nginx
server {
    listen 80;
    server_name alluremoda.com.br api.alluremoda.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name alluremoda.com.br;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    # ... resto da configuração
}
```

### 7. Deploy

```bash
# Build e iniciar em produção
docker compose --profile production up -d --build

# Verificar logs
docker compose logs -f

# Verificar status
docker compose ps
```

### 8. Configurar Renovação Automática do SSL

```bash
# Adicionar cron job
sudo crontab -e

# Adicionar linha:
0 0 1 * * certbot renew --quiet && docker compose restart nginx
```

---

## Deploy com CI/CD (GitHub Actions)

### Workflow: `.github/workflows/deploy.yml`

```yaml
name: Deploy AllureModa

on:
  push:
    branches: [production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /var/www/AllureModa
            git pull origin production
            docker compose --profile production up -d --build
            docker compose exec backend dotnet ef database update
```

### Secrets Necessários

| Secret | Descrição |
|--------|-----------|
| SERVER_HOST | IP ou domínio do servidor |
| SERVER_USER | Usuário SSH |
| SERVER_SSH_KEY | Chave privada SSH |

---

## Backup e Restore

### Backup do Banco

```bash
# Backup manual
docker compose exec postgres pg_dump -U alluremoda alluremoda > backup_$(date +%Y%m%d).sql

# Backup automático (cron)
0 2 * * * cd /var/www/AllureModa && docker compose exec -T postgres pg_dump -U alluremoda alluremoda > /backups/db_$(date +\%Y\%m\%d).sql
```

### Restore

```bash
# Restore do backup
cat backup_20241225.sql | docker compose exec -T postgres psql -U alluremoda alluremoda
```

---

## Monitoramento

### Health Checks

```bash
# Verificar saúde dos serviços
curl http://localhost:5000/health
curl http://localhost:3000

# Via Docker
docker compose ps
```

### Logs

```bash
# Todos os logs
docker compose logs -f

# Logs específicos
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
docker compose logs -f nginx
```

### Métricas

Recomendação: Configure [Grafana](https://grafana.com/) + [Prometheus](https://prometheus.io/) para monitoramento completo.

---

## Rollback

```bash
# Voltar para versão anterior
git log --oneline -5  # Ver commits
git revert HEAD       # Reverter último commit
# OU
git reset --hard <commit-hash>

# Rebuild
docker compose --profile production up -d --build
```

---

## Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker compose logs <service>

# Verificar recursos
docker stats
df -h

# Rebuild completo
docker compose down -v
docker compose --profile production up -d --build
```

### Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
docker compose exec postgres pg_isready

# Verificar connection string
docker compose exec backend printenv | grep Connection
```

### Erro 502 Bad Gateway

```bash
# Verificar se backend está respondendo
docker compose exec nginx curl http://backend:5000/health

# Reiniciar serviços
docker compose restart backend nginx
```

### Limpar espaço em disco

```bash
# Remover imagens não utilizadas
docker system prune -a

# Remover volumes órfãos
docker volume prune
```

---

## Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Certificados SSL instalados
- [ ] Firewall configurado
- [ ] Backup do banco configurado
- [ ] Health checks funcionando
- [ ] Logs sendo coletados
- [ ] Monitoramento ativo
- [ ] Domínio apontando para servidor
- [ ] Webhook do Asaas configurado
