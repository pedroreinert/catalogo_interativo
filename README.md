# Catálogo Interativo - Sistema de Retirada do Almoxarifado

## Descrição do Projeto

O Catálogo Interativo é um sistema desenvolvido para resolver o problema de retirada de itens do almoxarifado fora do horário comercial. O sistema permite que operadores de produção consultem o catálogo de produtos, solicitem retiradas e enviem notificações automáticas para a equipe do almoxarifado e gerência.

## Funcionalidades Principais

### 🔍 **Busca de Produtos**
- Busca em tempo real por nome ou código do produto
- Interface responsiva otimizada para tablet
- Resultados visuais com informações de estoque

### 📋 **Detalhes do Produto**
- Visualização completa das informações do item
- Código, nome, descrição e quantidade em estoque
- Validação de disponibilidade antes da retirada

### 📝 **Formulário de Retirada**
- Campos obrigatórios: quantidade, centro de custo, nome do operador
- Validação de quantidade máxima disponível
- Área opcional para fotos do produto

### 📧 **Notificação Automática**
- Envio automático de email para almoxarifado e gerência
- Detalhes completos da solicitação
- Informações do produto e operador

### 🔧 **Administração**
- Upload de catálogo via arquivo Excel
- Atualização automática do banco de dados
- Interface administrativa separada

## Tecnologias Utilizadas

### Frontend
- **React 19** - Framework JavaScript
- **Tailwind CSS** - Framework de estilos
- **Shadcn/UI** - Componentes de interface
- **Lucide Icons** - Ícones
- **Vite** - Build tool

### Backend
- **Python 3.11** - Linguagem de programação
- **Flask** - Framework web
- **SQLite** - Banco de dados
- **Pandas** - Processamento de dados Excel
- **Flask-CORS** - Suporte a CORS

## Estrutura do Projeto

```
catalogo_interativo/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes UI
│   │   ├── App.jsx         # Componente principal
│   │   └── main.jsx        # Ponto de entrada
│   ├── index.html          # HTML principal
│   └── package.json        # Dependências do frontend
├── backend/                 # API Flask
│   ├── src/
│   │   ├── models/         # Modelos do banco de dados
│   │   ├── routes/         # Rotas da API
│   │   └── main.py         # Aplicação principal
│   ├── venv/               # Ambiente virtual Python
│   └── requirements.txt    # Dependências do backend
├── sample_catalog.xlsx     # Arquivo Excel de exemplo
└── README.md              # Esta documentação
```

## APIs Disponíveis

### Catálogo
- `POST /api/upload-catalog` - Upload do arquivo Excel
- `GET /api/products/search?q={termo}` - Busca de produtos
- `GET /api/products/{id}` - Detalhes de um produto

### Retiradas
- `POST /api/pickups` - Criar solicitação de retirada
- `GET /api/pickups` - Listar todas as retiradas

### Estatísticas
- `GET /api/stats` - Estatísticas do sistema

## Instalação e Configuração

### Pré-requisitos
- Python 3.11+
- Node.js 20+
- pnpm

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows
pip install -r requirements.txt
python src/main.py
```

### Frontend
```bash
cd frontend
pnpm install
pnpm run dev
```

## Formato do Arquivo Excel

O arquivo Excel deve conter as seguintes colunas obrigatórias:
- **Nome** - Nome do produto
- **Descrição** - Descrição detalhada
- **Código do Item** - Código único do produto
- **Quantidade em Estoque** - Quantidade disponível
- **Foto** (opcional) - URL da foto do produto

### Exemplo de Estrutura:
| Nome | Descrição | Código do Item | Quantidade em Estoque | Foto |
|------|-----------|----------------|----------------------|------|
| Parafuso Phillips M6x20 | Parafuso Phillips cabeça panela aço inox M6 x 20mm | ABC123 | 150 | |
| Arruela Lisa M6 | Arruela lisa em aço galvanizado diâmetro interno 6mm | DEF456 | 500 | |

## Configuração de Email

Para habilitar o envio de emails, edite o arquivo `backend/src/routes/catalog.py`:

```python
EMAIL_CONFIG = {
    'smtp_server': 'smtp.gmail.com',
    'smtp_port': 587,
    'email_user': 'seu_email@empresa.com',
    'email_password': 'sua_senha',
    'warehouse_emails': ['almoxarifado@empresa.com', 'gerencia@empresa.com']
}
```

**Importante:** Descomente o código de envio de email na função `send_pickup_notification()`.

## Banco de Dados

O sistema utiliza SQLite com as seguintes tabelas:

### Products
- id (Primary Key)
- code (Unique)
- name
- description
- stock
- photo_url
- created_at
- updated_at

### Pickups
- id (Primary Key)
- product_id (Foreign Key)
- quantity
- cost_center
- operator_name
- photos (JSON)
- status
- created_at

## Uso do Sistema

### Para Operadores
1. Acesse o sistema no tablet
2. Digite o nome ou código do produto na busca
3. Selecione o produto desejado
4. Clique em "Retirar Item"
5. Preencha o formulário com:
   - Quantidade desejada
   - Centro de custo
   - Seu nome completo
6. Adicione fotos se necessário
7. Clique em "Enviar Solicitação"

### Para Administradores
1. Clique no botão "Admin"
2. Selecione o arquivo Excel atualizado
3. Aguarde o processamento
4. O catálogo será atualizado automaticamente

## Recursos de Segurança

- Validação de dados no frontend e backend
- Sanitização de uploads de arquivo
- Tratamento de erros robusto
- Logs de auditoria para todas as operações

## Melhorias Futuras

- [ ] Autenticação de usuários
- [ ] Dashboard de relatórios
- [ ] Integração com sistemas ERP
- [ ] Notificações push
- [ ] Histórico de retiradas por operador
- [ ] Aprovação de retiradas por supervisores
- [ ] Controle de estoque em tempo real

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs do backend
2. Confirme se todas as dependências estão instaladas
3. Valide o formato do arquivo Excel
4. Teste as APIs diretamente com curl

## Licença

Este projeto foi desenvolvido especificamente para uso interno da empresa.

---

**Desenvolvido por:** Manus AI  
**Data:** Agosto 2025  
**Versão:** 1.0.0

