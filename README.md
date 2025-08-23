# FinanZas: Gerenciador Financeiro Pessoal

Uma aplicação web desenvolvida em React para ajudar a gerenciar suas finanças pessoais, rastrear entradas, controlar saídas e visualizar seu histórico financeiro através de relatórios detalhados.

## 🌟 Recursos Principais

- **Dashboard Intuitivo:** Uma visão geral do seu saldo, entradas e saídas, com um gráfico de pizza para uma análise rápida.
- **Gerenciamento de Entradas:** Adicione, edite e remova seus rendimentos, como salários e trabalhos freelancers.
- **Controle de Saídas:** Registre despesas fixas e variáveis e categorize-as para um controle mais eficiente.
- **Relatórios Detalhados:** Analise sua saúde financeira com gráficos de barras e relatórios de despesas que comparam gastos fixos e variáveis.
- **Configurações Personalizadas:** Ajuste informações do seu perfil e alterne entre o modo escuro e claro para uma melhor experiência visual.

## 🛠️ Tecnologias Utilizadas

O frontend desta aplicação foi construído com as seguintes tecnologias:

- **React**: Biblioteca JavaScript para construir interfaces de usuário.
- **Chakra UI**: Um framework de componentes React que simplifica o desenvolvimento e o design.
- **React Router Dom**: Para gerenciar a navegação entre as páginas.
- **Recharts**: Uma biblioteca para criar gráficos e visualizações de dados.
- **JavaScript (ES6+)**

## 🚀 Como Executar o Projeto Localmente

Siga estas instruções para configurar e rodar o projeto em sua máquina:

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/fpsmount/finanZas.git](https://github.com/fpsmount/finanZas.git)
    cd finanZas
    ```
    
2.  **Mova para o diretório do frontend:**
    ```bash
    cd finanzas-frontend
    ```
    
3.  **Instale as dependências:**
    ```bash
    npm install
    ```
    
4.  **Inicie a aplicação em modo de desenvolvimento:**
    ```bash
    npm start
    ```
    A aplicação estará disponível em `http://localhost:3000`.

## 📦 Scripts Disponíveis

No diretório do projeto, você pode executar:

- `npm start`: Inicia o servidor de desenvolvimento.
- `npm run build`: Cria uma versão otimizada da aplicação para produção.
- `npm test`: Executa os testes unitários.
- `npm run eject`: Remove a dependência única do React Scripts, oferecendo total controle sobre as configurações.

## 🤝 Estrutura do Projeto

O projeto está organizado em duas pastas principais: `finanzas-frontend` e `finanzas-backend`. Esta é a documentação do frontend.

O diretório `src/pages` contém os principais componentes de cada página da aplicação. Os componentes globais e a navegação estão configurados no arquivo `src/App.js`.