# Guia de Instalação Android - PWA

## 📱 Como Instalar o Catálogo Interativo no Android

### Pré-requisitos
- Android 5.0+ (API 21+)
- Chrome ou navegador compatível com PWA
- Conexão com a rede local do servidor

### Passo a Passo

#### 1. Acessar o Sistema
1. Abra o **Chrome** no seu Android
2. Digite o endereço do servidor: `http://[IP_DO_SERVIDOR]:5173`
   - Exemplo: `http://192.168.1.100:5173`
3. Aguarde o carregamento completo

#### 2. Instalar como App
1. No Chrome, toque no **menu** (três pontos) no canto superior direito
2. Selecione **"Adicionar à tela inicial"** ou **"Instalar app"**
3. Confirme a instalação tocando em **"Adicionar"**

#### 3. Usar o App
1. O ícone do Catálogo aparecerá na tela inicial
2. Toque no ícone para abrir o app
3. O app abrirá em tela cheia, sem barra do navegador

### 🔧 Configuração do Servidor

#### Para Funcionar em Rede Local
1. **Backend**: Certifique-se que está rodando em `0.0.0.0:5000`
2. **Frontend**: Configure para aceitar conexões externas

#### Configurar Frontend para Rede Local
No arquivo `frontend/vite.config.js`, adicione:
```javascript
export default {
  server: {
    host: '0.0.0.0',
    port: 5173
  }
}
```

#### Descobrir IP do Servidor
- **Windows**: `ipconfig` no CMD
- **Linux/Mac**: `ifconfig` no terminal
- Procure pelo IP da rede local (ex: 192.168.1.100)

### 📋 Funcionalidades Mobile

#### ✅ Otimizações Implementadas
- Interface responsiva para mobile
- Botões com tamanho mínimo de 44px (touch-friendly)
- Cache offline para funcionar sem internet
- Instalação como app nativo
- Suporte a dispositivos com notch
- Prevenção de zoom em inputs

#### 📸 Funcionalidades
- Busca de produtos
- Visualização de detalhes
- Retirada com fotos obrigatórias
- Seleção de centro de custo
- Envio de emails com anexos

### 🚨 Limitações Atuais

#### HTTPS Necessário para Algumas Funcionalidades
- **Service Worker**: Funciona em HTTP local
- **Notificações Push**: Requer HTTPS
- **Algumas APIs**: Podem ter restrições

#### Soluções para HTTPS
1. **Certificado Self-Signed** (desenvolvimento)
2. **Proxy Reverso** com certificado
3. **Tunnel** (ngrok, localtunnel)

### 🔍 Testando a PWA

#### Verificar se é PWA
1. No Chrome, vá em **Configurações > Apps**
2. Procure por "Catálogo Interativo"
3. Se aparecer, a PWA foi instalada corretamente

#### Testar Offline
1. Instale a PWA
2. Desconecte a internet
3. Abra o app - deve funcionar com dados em cache

### 📞 Suporte

#### Problemas Comuns
- **Não instala**: Verifique se está usando Chrome
- **Não carrega**: Confirme IP e porta do servidor
- **Erro de conexão**: Verifique firewall e rede

#### Logs de Debug
- Abra **Ferramentas do Desenvolvedor** no Chrome
- Vá em **Console** para ver erros
- Vá em **Application > Service Workers** para ver status

### 🎯 Próximos Passos

Para produção, considere:
1. Configurar HTTPS com certificado válido
2. Implementar notificações push
3. Adicionar sincronização offline
4. Otimizar cache para dados dinâmicos

---

**Desenvolvido para Almoxarifado**  
*Sistema de Catálogo Interativo - PWA*

