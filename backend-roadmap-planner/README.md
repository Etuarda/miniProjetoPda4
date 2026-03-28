# Backend Roadmap Planner

Aplicação completa para diagnóstico e planejamento de roadmap de desenvolvimento backend Node.js.

## Funcionalidades

- **Diagnóstico Interativo**: Questionário para avaliar conhecimento em 5 eixos (HTTP, Node.js, API, Database, Architecture)
- **Roadmap Personalizado**: Geração automática de tarefas baseado nas lacunas identificadas
- **Acompanhamento de Progresso**: Interface para marcar tarefas como concluídas e adicionar anotações
- **Interface Acessível**: Design responsivo com suporte a tecnologias assistivas

## Stack Tecnológica

### Backend
- **Node.js** com **ESM** (ES Modules)
- **Express.js** para API REST
- **Zod** para validação de dados
- **Arquitetura em Camadas**: Routes → Controllers → Services → Repositories
- Persistência em arquivo JSON (desenvolvimento)

### Frontend
- **React 18** com **TypeScript**
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **React Hooks** para gerenciamento de estado
- **Axios** para chamadas HTTP

## Arquitetura

### Backend
```
src/
├── app.js              # Configuração Express (middlewares, rotas)
├── server.js           # Inicialização do servidor
├── config/env.js       # Configurações de ambiente
├── routes/             # Definição de endpoints
├── controllers/        # Adaptadores HTTP
├── services/           # Lógica de negócio
├── repositories/       # Acesso a dados
├── schemas/            # Validação com Zod
├── middlewares/        # Middlewares customizados
└── utils/              # Utilitários
```

### Frontend
```
src/
├── App.tsx            # Componente principal
├── main.tsx           # Ponto de entrada React
├── components/        # Componentes reutilizáveis
├── services/          # Chamadas para API
├── hooks/             # Hooks customizados
├── constants/         # Constantes da aplicação
├── types/             # Definições TypeScript
└── styles/            # Estilos globais
```

## Execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Backend
```bash
cd backend
npm install
npm run dev
```
Servidor disponível em: `http://localhost:3000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Aplicação disponível em: `http://localhost:5173`

## API Endpoints

### Diagnóstico
- `GET /api/v1/questions` - Lista questões do diagnóstico
- `POST /api/v1/diagnostic-results` - Cria resultado de diagnóstico

### Roadmap
- `POST /api/v1/roadmaps` - Cria roadmap baseado em diagnóstico
- `GET /api/v1/roadmaps/:id` - Busca roadmap específico
- `GET /api/v1/roadmaps/:id/tasks` - Lista tarefas do roadmap

### Tarefas
- `PATCH /api/v1/tasks/:id` - Atualiza tarefa
- `DELETE /api/v1/tasks/:id` - Remove tarefa

## Desenvolvimento

### Scripts Disponíveis

#### Backend
- `npm run dev` - Inicia servidor em modo desenvolvimento com hot reload
- `npm start` - Inicia servidor em modo produção

#### Frontend
- `npm run dev` - Inicia servidor de desenvolvimento Vite
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza build de produção

### Convenções de Código

- **Clean Code**: Comentários explicam intenção e regras de negócio
- **ESLint/Prettier**: Padrões de formatação automática
- **TypeScript**: Tipagem estática para maior segurança
- **Zod**: Validação rigorosa de entrada/saída

## Deploy

### Backend
```bash
cd backend
npm run build  # se aplicável
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Servir arquivos da pasta dist/
```
