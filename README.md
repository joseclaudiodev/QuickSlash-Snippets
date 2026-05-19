# QuickSlash Snippets

[English](#english) | [Português](#português)

<a name="english"></a>
## English

**QuickSlash Snippets** is a Google Chrome extension (Manifest V3) that enables rapid text substitution using slash (`/`) commands.

### Demonstration
<img width="600" alt="demo" src="https://github.com/user-attachments/assets/81c631e1-e3d5-44b7-bf3a-b452f02c3a12" />

### Features
* **Command Substitution:** Automatically detects commands starting with `/` in text fields (`input`, `textarea`, `contenteditable`, etc.).
* **URL Categorization:** Organizes snippets into categories, allowing you to define which domains each set of shortcuts should be active on using URL patterns (wildcards).
* **Local Management:** All data is managed locally in the browser (`chrome.storage.local`).
* **Import/Export:** Ability to backup and restore data via JSON.

### Installation
1. Clone or download this repository.
2. Go to `chrome://extensions/` in your browser.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the project folder.

### Usage
1. Press `Alt+Q` (or click the extension icon) to open the configuration panel.
2. Add a **Category** and define its **URL Patterns** (e.g., `*://*.google.com/*`).
3. Add **Snippets** to the category, defining a command (e.g., `hi`) and the output text.
4. In the text field of the target site, type `/` followed by the command (e.g., `/hi`) to perform the substitution.

---

<a name="português"></a>
## Português

O **QuickSlash Snippets** é uma extensão para Google Chrome (Manifest V3) que permite a substituição rápida de atalhos de texto via comandos de barra (`/`).

### Demonstração
<img width="600" alt="demo" src="https://github.com/user-attachments/assets/81c631e1-e3d5-44b7-bf3a-b452f02c3a12" />

### Funcionalidades
* **Substituição de Comandos:** Detecta automaticamente comandos iniciados por `/` em campos de texto (`input`, `textarea`, `contenteditable`, etc.).
* **Categorização por URL:** Organiza snippets em categorias, permitindo definir em quais domínios cada conjunto de atalhos deve ser ativado através de padrões de URL (wildcards).
* **Gestão Local:** Todo o armazenamento é gerenciado localmente no navegador (`chrome.storage.local`).
* **Importação/Exportação:** Possibilidade de backup e restauração dos dados via JSON.

### Instalação
1. Clone ou baixe este repositório.
2. Acesse `chrome://extensions/` no seu navegador.
3. Ative o **Modo do desenvolvedor** no canto superior direito.
4. Clique em **Carregar sem compactação** e selecione a pasta do projeto.

### Uso
1. Pressione `Alt+Q` (or clique no ícone da extensão) para abrir o painel de configurações.
2. Adicione uma **Categoria** e defina seus **Padrões de URL** (ex: `*://*.google.com/*`).
3. Adicione **Snippets** à categoria, definindo um comando (ex: `oi`) e o texto de saída.
4. No campo de texto do site alvo, digite `/` seguido do comando (ex: `/oi`) para realizar a substituição.

---

## Technical Structure / Estrutura Técnica

* `manifest.json`: Configuration and permissions. / Configurações de permissões e scripts.
* `content_script.js`: Keyboard event monitoring and text injection. / Monitoramento de eventos de teclado e injeção de texto.
* `service_worker.js`: Background event management and global shortcuts. / Gerenciamento de janelas e atalhos globais.
* `storage.js`: Data persistence interface. / Interface de persistência de dados.
* `config/`: Management dashboard (HTML/CSS/JS). / Dashboard de gerenciamento (HTML/CSS/JS).
