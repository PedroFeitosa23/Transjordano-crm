# Transjordano CRM

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

Aplicação Single Page (SPA) desenvolvida sob medida para a gestão comercial da Transjordano. O sistema moderniza o fluxo de vendas corporativo, substituindo planilhas legadas por uma interface reativa, banco de dados em tempo real e um funil de vendas interativo (Kanban).

## Principais Funcionalidades

- **Pipeline de Vendas (Kanban):** Motor de Drag-and-Drop (arrastar e soltar) para mover oportunidades de negócio através das etapas do funil (Qualificação, Proposta, Negociação, etc.).
- **Gestão de Leads:** Módulo CRUD completo para empresas parceiras e prospects, com cálculo de termômetro (score) e histórico de contatos.
- **Busca Global Reativa:** Search Engine integrado que pesquisa leads e negócios a cada keystroke (tecla digitada), renderizando fichas dinâmicas em modais flutuantes sobrepostos.
- **Importação/Exportação CSV:** Algoritmos de conversão integrados para exportar o status atual do funil para o Excel ou importar bases de dados legadas massivamente.
- **Dark Mode (Modo Escuro):** Alternância de temas integrada ao Tailwind CSS, com persistência de preferências de usuário localmente (localStorage).
- **Arquitetura Serverless:** Operações de banco de dados e autenticação descentralizadas utilizando infraestrutura Google Cloud (Firebase).

## Tech Stack

### Front-end
- **[React 18](https://react.dev/)** + **[Vite](https://vitejs.dev/)**: Core da aplicação e bundler de alta performance.
- **[Tailwind CSS](https://tailwindcss.com/)**: Estilização utilitária para UI escalável e Dark Mode nativo.
- **[Radix UI](https://www.radix-ui.com/)** & **[Lucide React](https://lucide.dev/)**: Componentes headless focados em acessibilidade (A11y) e iconografia vetorial.
- **[@dnd-kit](https://docs.dndkit.com/)**: Biblioteca de Drag-and-Drop modular para o quadro Kanban.

### Back-end & Infraestrutura
- **[Firebase Firestore](https://firebase.google.com/docs/firestore)**: Banco de dados NoSQL baseado em documentos, operando em tempo real.
- **[Firebase Authentication](https://firebase.google.com/docs/auth)**: Gestão de acesso e controle de sessão.
- **[Vercel](https://vercel.com/)**: CI/CD automatizado e hospedagem Edge, configurado com rotas dinâmicas (vercel.json) para prevenir erros 404 em SPA.

## Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js (v18.x ou superior)
- NPM ou Yarn
- Credenciais de um projeto configurado no Firebase Console

### 1. Clonar o repositório
```bash
git clone [https://github.com/PedroFeitosa23/Transjordano-crm.git](https://github.com/PedroFeitosa23/Transjordano-crm.git)
cd Transjordano-crm
