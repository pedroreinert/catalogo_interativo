O sistema de catálogo interativo foi projetado para facilitar a retirada de itens do almoxarifado fora do horário comercial. Ele permite que os operadores busquem produtos, registrem retiradas e notifiquem a equipe do almoxarifado e a gerência por e-mail. O sistema é responsivo para tablets e inclui uma interface de administração para upload de catálogos.

## Funcionalidades

1. **Busca de Produtos:**
   - Pesquisa por nome ou código do item.
   - Exibição de detalhes do produto (nome, descrição, código, estoque).

2. **Retirada de Itens:**
   - Formulário para registro de quantidade, centro de custo e nome do operador.
   - Validação de estoque disponível.
   - Opção de anexar fotos do produto.
   - Envio automático de e-mail para a equipe do almoxarifado e gerência.

3. **Administração do Catálogo:**
   - Upload de arquivos Excel para atualização do catálogo.
   - Campos obrigatórios: Nome, Descrição, Código do Item, Quantidade em Estoque.

## Tecnologias Utilizadas

- **Frontend:** React, Tailwind CSS
- **Backend:** Flask, SQLite

## Próximos Passos

- **Integração Frontend-Backend:** Conectar a interface do usuário com as APIs do backend.
- **Testes:** Realizar testes completos para garantir o funcionamento correto.
- **Documentação:** Finalizar o manual do usuário e o guia de instalação.

## Melhorias Futuras

- **Notificações em Tempo Real:** Implementar notificações em tempo real para a equipe do almoxarifado.
- **Relatórios Personalizados:** Gerar relatórios detalhados sobre as retiradas.
- **Integração com Sistemas Existentes:** Conectar o sistema a outros sistemas da empresa (ERP, WMS).
- **Aplicativo Móvel:** Desenvolver um aplicativo móvel nativo para iOS e Android.
- **Interface de Usuário Aprimorada:** Melhorar a interface do usuário com recursos avançados.
- **Segurança:** Implementar autenticação de dois fatores e criptografia de dados.
- **Otimização de Performance:** Otimizar o desempenho do sistema para grandes volumes de dados.
- **Gerenciamento de Usuários:** Adicionar funcionalidades de gerenciamento de usuários e permissões.
- **Personalização:** Permitir que os usuários personalizem a interface e os relatórios.
- **Integração com Dispositivos:** Conectar o sistema a dispositivos de hardware (leitores de código de barras, impressoras).

## Problemas Conhecidos

- **Problema de Foco:** O foco do cursor é perdido ao digitar em campos de texto, necessitando de um clique adicional para continuar a digitação. (Resolvido na iteração atual)

## Histórico de Revisões

- **Versão 1.0:** Lançamento inicial com funcionalidades básicas de busca e retirada.
- **Versão 1.1:** Adição da funcionalidade de upload de catálogo Excel.
- **Versão 1.2:** Melhorias na interface do usuário e correção de bugs.
- **Versão 1.3:** Implementação de notificações por e-mail.
- **Versão 1.4:** Otimização de performance e segurança.
- **Versão 1.5:** Correção de bugs e melhorias na interface do usuário.
- **Versão 1.6:** Adição de novas funcionalidades e melhorias de desempenho.
- **Versão 1.7:** Melhorias na interface do usuário e correção de bugs. (Versão atual)


