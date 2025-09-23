# Guia de Instalação - Catálogo Interativo

## Requisitos do Sistema

### Hardware Mínimo
- **Tablet:** Android 8+ ou iPad (iOS 12+)
- **Servidor:** 2GB RAM, 10GB espaço em disco
- **Rede:** Conexão Wi-Fi estável

### Software Necessário
- **Python 3.11+**
- **Node.js 20+**
- **pnpm** (gerenciador de pacotes)
- **Git** (para versionamento)

## Instalação Passo a Passo

### 1. Preparação do Ambiente

```bash
# Clonar ou baixar o projeto
git clone <repositorio> catalogo_interativo
cd catalogo_interativo

# Verificar versões
python --version  # Deve ser 3.11+
node --version    # Deve ser 20+
```

### 2. Configuração do Backend

```bash
# Navegar para o diretório do backend
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Testar instalação
python src/main.py
```

O backend deve iniciar na porta 5000 ou 5001.

### 3. Configuração do Frontend

```bash
# Abrir novo terminal e navegar para frontend
cd frontend

# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm run dev
```

O frontend deve iniciar na porta 5173.

### 4. Configuração do Banco de Dados

O banco SQLite é criado automaticamente na primeira execução. Localização:
```
backend/instance/database.db
```

### 5. Configuração de Email (Opcional)

Edite o arquivo `backend/src/routes/catalog.py`:

```python
# Configurações de email
EMAIL_CONFIG = {
    'smtp_server': 'smtp.gmail.com',  # Servidor SMTP
    'smtp_port': 587,                 # Porta SMTP
    'email_user': 'sistema@empresa.com',     # Email remetente
    'email_password': 'senha_do_email',      # Senha do email
    'warehouse_emails': [                    # Destinatários
        'almoxarifado@empresa.com',
        'gerencia@empresa.com'
    ]
}
```

**Importante:** Descomente as linhas de envio de email na função `send_pickup_notification()`.

## Configuração para Produção

### 1. Servidor Web

Para produção, use um servidor WSGI como Gunicorn:

```bash
# Instalar Gunicorn
pip install gunicorn

# Executar em produção
gunicorn -w 4 -b 0.0.0.0:5000 src.main:app
```

### 2. Build do Frontend

```bash
cd frontend
pnpm run build
```

Os arquivos serão gerados em `frontend/dist/`.

### 3. Nginx (Recomendado)

Configuração do Nginx para servir o frontend e proxy do backend:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend
    location / {
        root /caminho/para/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Configuração do Tablet

### 1. Navegador Recomendado
- **Android:** Chrome ou Firefox
- **iPad:** Safari ou Chrome

### 2. Configurações do Navegador
- Habilitar JavaScript
- Permitir cookies
- Configurar para tela cheia (kiosk mode)

### 3. Atalho na Tela Inicial
1. Acesse o sistema no navegador
2. Toque no menu do navegador
3. Selecione "Adicionar à tela inicial"
4. Nomeie como "Catálogo Almoxarifado"

### 4. Modo Kiosk (Opcional)
Para tablets dedicados, configure o modo kiosk:
- **Android:** Use apps como "Kiosk Browser"
- **iPad:** Use "Acesso Guiado" nas configurações

## Teste da Instalação

### 1. Teste do Backend
```bash
curl http://localhost:5000/api/stats
```

Deve retornar estatísticas do sistema.

### 2. Teste do Frontend
Acesse `http://localhost:5173` no navegador.

### 3. Teste de Upload
1. Acesse a área Admin
2. Faça upload do arquivo `sample_catalog.xlsx`
3. Verifique se os produtos aparecem na busca

### 4. Teste Completo
1. Busque por um produto
2. Visualize os detalhes
3. Preencha o formulário de retirada
4. Envie a solicitação
5. Verifique se foi registrada no banco

## Solução de Problemas

### Backend não inicia
- Verifique se o Python 3.11+ está instalado
- Confirme se o ambiente virtual está ativado
- Instale as dependências novamente

### Frontend não carrega
- Verifique se o Node.js 20+ está instalado
- Execute `pnpm install` novamente
- Limpe o cache: `pnpm run dev --force`

### Erro de CORS
- Confirme se o Flask-CORS está instalado
- Verifique se o CORS está habilitado no backend

### Banco de dados não funciona
- Verifique permissões da pasta `backend/instance/`
- Delete o arquivo `database.db` para recriar

### Upload de Excel falha
- Confirme se o arquivo tem as colunas obrigatórias
- Verifique se o arquivo não está corrompido
- Teste com o arquivo `sample_catalog.xlsx`

## Manutenção

### Backup do Banco
```bash
cp backend/instance/database.db backup_$(date +%Y%m%d).db
```

### Logs do Sistema
Os logs são exibidos no console. Para produção, configure logging em arquivo:

```python
import logging
logging.basicConfig(
    filename='app.log',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s'
)
```

### Atualizações
1. Faça backup do banco de dados
2. Atualize o código
3. Reinstale dependências se necessário
4. Teste em ambiente de desenvolvimento
5. Aplique em produção

## Segurança

### Recomendações
- Use HTTPS em produção
- Configure firewall para portas específicas
- Mantenha o sistema atualizado
- Faça backups regulares
- Monitore logs de acesso

### Rede
- Configure rede isolada para o tablet
- Use VPN se necessário
- Restrinja acesso por IP se possível

---

**Para suporte técnico, consulte a documentação completa ou entre em contato com a equipe de TI.**

