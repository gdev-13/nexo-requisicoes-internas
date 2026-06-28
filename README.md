# 🔷 Nexo — Requisições Internas

O **Nexo — Requisições Internas** é uma aplicação fullstack desenvolvida para gerenciar solicitações internas dentro de uma organização, permitindo que usuários requisitantes criem demandas, analistas acompanhem e atualizem o andamento das requisições e administradores gerenciem permissões de acesso.

A plataforma organiza o fluxo de trabalho em diferentes perfis de usuário, com autenticação, rotas protegidas, dashboards, histórico de movimentações, gestão de tipos de requisição e controle administrativo de usuários.

---

## 📌 Sobre o Projeto

Em ambientes internos, é comum que solicitações sejam feitas por diferentes canais, como mensagens, emails ou conversas informais, dificultando o acompanhamento do status, da prioridade e do histórico de cada demanda. O **Nexo** foi criado com o objetivo de centralizar essas requisições em um sistema organizado, permitindo maior controle, rastreabilidade e clareza no processo.

O sistema possui autenticação com JWT, separação de acesso por perfil de usuário, criação e acompanhamento de requisições, gerenciamento de tipos de requisição, histórico geral de movimentações, área administrativa para controle de usuários e registro das alterações de permissões realizadas por administradores.

---

## ✨ Funcionalidades

* Cadastro de usuários como requisitantes
* Login de usuários
* Autenticação com token JWT
* Rotas protegidas no frontend
* Controle de acesso por perfil
* Perfil de requisitante
* Perfil de analista
* Perfil de administrador
* Dashboard para usuários autenticados
* Criação de requisições internas
* Listagem de requisições do usuário logado
* Listagem geral de requisições para analistas
* Visualização de detalhes da requisição
* Alteração de status da requisição por analistas
* Aprovação de requisições
* Recusa de requisições
* Conclusão de requisições
* Cancelamento de requisições pelo requisitante
* Histórico individual de cada requisição
* Histórico geral de movimentações
* Gerenciamento de tipos de requisição
* Cadastro de tipos de requisição por analistas
* Edição de tipos de requisição
* Ativação e desativação de tipos de requisição
* Visualização de tipos disponíveis por requisitantes
* Área administrativa para gerenciamento de usuários
* Promoção de requisitantes para analistas
* Rebaixamento de analistas para requisitantes
* Bloqueio de alteração do próprio perfil administrativo
* Bloqueio de alteração de outros administradores
* Modal de confirmação para alterações de perfil
* Histórico administrativo de alterações de permissões
* Filtros na gestão de usuários por nome, email e perfil
* Cards de resumo com totais de usuários por tipo
* Layout responsivo para telas menores
* Tratamento de erros com mensagens personalizadas

---

## 🧪 Principais Telas

* **Home**: página inicial pública com apresentação da aplicação.
* **Login**: autenticação de usuários.
* **Cadastro**: criação de nova conta com perfil de requisitante.
* **Dashboard**: visão geral para usuários autenticados.
* **Minhas requisições**: listagem das solicitações criadas pelo requisitante.
* **Nova requisição**: formulário para abertura de uma solicitação interna.
* **Detalhes da requisição**: visualização completa da requisição e de suas movimentações.
* **Todas as requisições**: listagem geral disponível para analistas.
* **Tipos de requisição**: visualização e gerenciamento dos tipos de solicitação.
* **Histórico**: acompanhamento das movimentações realizadas nas requisições.
* **Gerenciamento de usuários**: área administrativa para consultar usuários e alterar perfis.
* **Histórico administrativo**: registros das alterações de permissões feitas por administradores.

---

## 🔗 Links do Projeto

* **Frontend Web**: `em breve`
* **Backend/API**: `em breve`
* **Repositório**: `https://github.com/gdev-13/nexo-requisicoes-internas`

---

## 🛠️ Tecnologias Utilizadas

### Backend

* Python
* FastAPI
* SQLAlchemy
* PostgreSQL
* Pydantic
* JWT
* Uvicorn
* Python Dotenv

### Frontend

* Angular
* TypeScript
* HTML5
* CSS3
* Angular Router
* HttpClient
* Signals
* LocalStorage

### Ferramentas

* Git
* GitHub
* VS Code
* PostgreSQL
* pgAdmin
* Swagger UI

---

## 📂 Estrutura do Projeto

```bash
nexo-requisicoes-internas/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   └── config.py
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   └── init_db.py
│   │   ├── dependencies/
│   │   │   └── auth.py
│   │   ├── models/
│   │   │   ├── internal_request.py
│   │   │   ├── request_history.py
│   │   │   ├── request_type.py
│   │   │   ├── user_role_history.py
│   │   │   └── user.py
│   │   ├── routes/
│   │   │   ├── admin.py
│   │   │   ├── auth.py
│   │   │   ├── internal_request.py
│   │   │   └── request_type.py
│   │   ├── schemas/
│   │   │   ├── internal_request.py
│   │   │   ├── request_history.py
│   │   │   ├── request_type.py
│   │   │   └── user.py
│   │   ├── scripts/
│   │   │   └── create_admin.py
│   │   ├── services/
│   │   │   └── security.py
│   │   └── main.py
│   ├── sql/
│   ├── requirements.txt
│   └── .gitignore
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── models/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   └── app.routes.ts
│   │   ├── environments/
│   │   ├── styles.css
│   │   └── main.ts
│   ├── angular.json
│   ├── package.json
│   └── .gitignore
│
└── README.md
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

Antes de começar, é necessário ter instalado:

* Python
* Node.js
* Angular CLI
* PostgreSQL
* Git

---

## ⚙️ Configuração do Backend

Acesse a pasta do backend:

```bash
cd backend
```

Crie e ative o ambiente virtual:

```bash
python -m venv venv
```

No Windows com Git Bash:

```bash
source venv/Scripts/activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Configure as variáveis de ambiente no arquivo `.env`:

```env
DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/nexo
SECRET_KEY=sua_chave_secreta
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:4200
```

Execute o backend:

```bash
uvicorn app.main:app --reload
```

Por padrão, a API será executada em:

```bash
http://localhost:8000
```

A documentação interativa da API fica disponível em:

```bash
http://localhost:8000/docs
```

---

## 👤 Criação do Administrador Inicial

O cadastro público cria usuários apenas com o perfil de requisitante. Para criar o primeiro administrador do sistema, utilize o script de criação de admin:

```bash
python -m app.scripts.create_admin
```

Após a criação do administrador inicial, novos usuários podem ser promovidos para analistas pela própria área administrativa da aplicação.

---

## 💻 Configuração do Frontend

Acesse a pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Configure a URL da API no arquivo de ambiente do Angular:

```ts
export const environment = {
  apiUrl: 'http://localhost:8000',
};
```

Execute o frontend:

```bash
ng serve
```

Ou:

```bash
npm start
```

Por padrão, a aplicação será executada em:

```bash
http://localhost:4200
```

---

## 🌐 Deploy

O projeto ainda não foi publicado em ambiente de produção.

Para uma futura publicação, recomenda-se hospedar:

* O **frontend Angular** em uma plataforma de hospedagem para aplicações web;
* O **backend FastAPI** em uma plataforma com suporte a Python;
* O **banco PostgreSQL** em um serviço de banco de dados em nuvem.

Como a experiência do sistema depende dos diferentes perfis de usuário, é recomendável disponibilizar contas de demonstração para:

* Requisitante;
* Analista;
* Administrador.

Exemplo de seção futura:

```txt
Requisitante demo:
Email: requisitante.demo@email.com
Senha: ********

Analista demo:
Email: analista.demo@email.com
Senha: ********

Admin demo:
Email: admin.demo@email.com
Senha: ********
```

---

## 🚧 Limitações e Melhorias Futuras

Apesar das principais funcionalidades já estarem implementadas, algumas melhorias podem ser adicionadas futuramente, como:

* Deploy do frontend e backend
* Criação de contas de demonstração para cada perfil
* Paginação nas listagens
* Filtros avançados por período
* Busca textual em requisições
* Comentários adicionais durante a análise
* Anexos em requisições
* Notificações para mudanças de status
* Recuperação de senha
* Confirmação de email
* Edição de perfil do usuário
* Testes automatizados
* Melhorias no dashboard
* Exportação de histórico e relatórios

---

## 📌 Status do Projeto

Projeto em desenvolvimento avançado, com as principais funcionalidades implementadas e integradas entre frontend, backend e banco de dados.

Atualmente, o sistema possui autenticação, controle de acesso por perfis, gerenciamento de requisições internas, histórico de movimentações, área administrativa para usuários e histórico de alterações de permissões.

---

## 🔐 Autenticação e Segurança

O sistema utiliza autenticação baseada em **JWT**. Após o login, o backend retorna um token, que é armazenado no `localStorage` e utilizado nas requisições autenticadas por meio de interceptor HTTP no frontend.

As rotas privadas do frontend são protegidas por guards do Angular, garantindo que apenas usuários autenticados acessem áreas restritas.

Além disso, o sistema possui controle de acesso por perfil:

* **Requisitante**: pode criar e acompanhar suas próprias requisições.
* **Analista**: pode visualizar requisições gerais e alterar o andamento das solicitações.
* **Administrador**: pode gerenciar usuários, alterar permissões e consultar o histórico administrativo.

O cadastro público cria apenas usuários requisitantes. Perfis de analista são atribuídos por administradores, enquanto o perfil administrativo é protegido contra alterações pela interface.

---

## 📡 Principais Endpoints

### Autenticação

```http
POST /auth/register
POST /auth/login
GET  /auth/me
```

### Tipos de Requisição

```http
GET   /request-types
GET   /request-types/all
POST  /request-types
PUT   /request-types/{request_type_id}
PATCH /request-types/{request_type_id}/enable
PATCH /request-types/{request_type_id}/disable
```

### Requisições Internas

```http
POST  /requests
GET   /requests/my
GET   /requests
GET   /requests/history
GET   /requests/{request_id}
GET   /requests/{request_id}/history
PATCH /requests/{request_id}/start-analysis
PATCH /requests/{request_id}/approve
PATCH /requests/{request_id}/reject
PATCH /requests/{request_id}/conclude
PATCH /requests/{request_id}/cancel
```

### Administração

```http
GET   /admin/users
PATCH /admin/users/{user_id}/role
GET   /admin/users/role-history
```

### Saúde da API

```http
GET /health/db
```

---

## 🗃️ Entidades Principais

### Usuário

Representa uma conta cadastrada no sistema.

Principais dados:

* Nome
* Email
* Senha criptografada
* Perfil
* Data de criação
* Data de atualização

### Tipo de Requisição

Representa uma categoria de solicitação interna disponível no sistema.

Principais dados:

* Nome
* Descrição
* Status ativo/inativo
* Data de criação
* Data de atualização

### Requisição Interna

Representa uma solicitação criada por um requisitante.

Principais dados:

* Título
* Descrição
* Prioridade
* Status
* Tipo de requisição
* Requisitante
* Data de criação
* Data de atualização
* Data de encerramento

### Histórico de Requisição

Representa uma movimentação feita em uma requisição.

Principais dados:

* Requisição associada
* Usuário responsável pela movimentação
* Status anterior
* Novo status
* Comentário
* Data da movimentação

### Histórico de Permissões

Representa uma alteração de perfil realizada por um administrador.

Principais dados:

* Usuário alterado
* Administrador responsável
* Perfil anterior
* Novo perfil
* Data da alteração

---

## 🔄 Fluxo de Requisições

O fluxo principal da aplicação é baseado na abertura e acompanhamento de requisições internas.

Um usuário requisitante pode criar uma solicitação informando título, descrição, tipo e prioridade. A partir disso, a requisição passa a fazer parte da listagem do próprio usuário e também pode ser acompanhada pelos analistas.

O analista pode iniciar a análise da requisição e, posteriormente, aprovar, recusar ou concluir a solicitação. Cada alteração de status gera um registro no histórico da requisição.

O requisitante também pode cancelar uma requisição enquanto ela ainda estiver em estágio inicial.

### 🧑‍💼 Perfis de Usuário

#### Requisitante

O requisitante representa o usuário que abre solicitações internas.

Pode:

* Criar requisições;
* Visualizar suas próprias requisições;
* Consultar detalhes de suas solicitações;
* Cancelar requisições em estágio inicial;
* Visualizar tipos de requisição ativos.

#### Analista

O analista representa o usuário responsável por acompanhar e tratar as solicitações.

Pode:

* Visualizar todas as requisições;
* Consultar detalhes de qualquer requisição;
* Iniciar análise;
* Aprovar requisições;
* Recusar requisições;
* Concluir requisições;
* Gerenciar tipos de requisição;
* Consultar histórico geral de movimentações.

#### Administrador

O administrador representa o usuário responsável pelo gerenciamento de permissões.

Pode:

* Visualizar usuários cadastrados;
* Filtrar usuários por nome, email e perfil;
* Promover requisitantes para analistas;
* Rebaixar analistas para requisitantes;
* Consultar resumo de usuários por perfil;
* Consultar histórico administrativo de alterações de permissão.

### 🕒 Históricos

A aplicação possui dois tipos principais de histórico.

#### Histórico de Requisições

Registra as movimentações feitas nas solicitações internas, incluindo mudanças de status, usuário responsável, comentário e data da alteração.

Esse histórico permite acompanhar a evolução de cada requisição e também visualizar movimentações gerais no sistema.

#### Histórico Administrativo

Registra as alterações de perfil realizadas por administradores, incluindo o usuário alterado, o administrador responsável, o perfil anterior, o novo perfil e a data da alteração.

Esse recurso aumenta a rastreabilidade das ações administrativas e permite acompanhar mudanças sensíveis nas permissões dos usuários.

---

## 👩‍💻 Desenvolvido por

Projeto desenvolvido por gdev-13 como aplicação fullstack para estudo, portfólio e prática de desenvolvimento web com Angular, FastAPI e PostgreSQL.