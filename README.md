# QuickSlash Snippets

Extensão para Google Chrome (Manifest V3) que permite a substituição rápida de atalhos de texto via comandos de barra (`/`).

## Funcionalidades

* **Substituição de Comandos:** Detecta automaticamente comandos iniciados por `/` em campos de texto (`input`, `textarea`, `contenteditable`, `etc.`).
* **Categorização por URL:** Organiza snippets em categorias, permitindo definir em quais domínios cada conjunto de atalhos deve ser ativado através de padrões de URL (wildcards).
* **Gestão Local:** Todo o armazenamento é gerenciado localmente no navegador (`chrome.storage.local`).
* **Importação/Exportação:** Possibilidade de backup e restauração dos dados via JSON.

## Instalação

1. Clone ou baixe este repositório.
2. Acesse `chrome://extensions/` no seu navegador.
3. Ative o **Modo do desenvolvedor** no canto superior direito.
4. Clique em **Carregar sem compactação** e selecione a pasta do projeto.

## Uso

1. Pressione `Alt+Q` (ou clique no ícone da extensão) para abrir o painel de configurações.
2. Adicione uma **Categoria** e defina seus **Padrões de URL** (ex: `*://*.google.com/*`).
3. Adicione **Snippets** à categoria, definindo um comando (ex: `oi`) e o texto de saída.
4. No campo de texto do site alvo, digite `/` seguido do comando (ex: `/oi`) para realizar a substituição.

## Estrutura Técnica

* `manifest.json`: Configurações de permissões e scripts.
* `content_script.js`: Monitoramento de eventos de teclado e injeção de texto.
* `service_worker.js`: Gerenciamento de janelas e atalhos globais.
* `storage.js`: Interface de persistência de dados.
* `config/`: Dashboard de gerenciamento (HTML/CSS/JS).
