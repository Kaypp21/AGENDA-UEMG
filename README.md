# 🎓 Agenda UEMG

A Agenda UEMG é uma aplicação web para organizar prazos acadêmicos da UEMG, permitindo que estudantes e representantes cadastrem e visualizem avisos relacionados às disciplinas do curso de Sistemas de Informação.

## 1. O que é o projeto

A aplicação funciona como uma agenda simples, com:
- cadastro e login de usuários;
- criação de prazos e atividades;
- upload de arquivos anexos;
- listagem de disciplinas por período;
- visualização de avisos públicos ou próprios.

A aplicação utiliza o Supabase para autenticação, armazenamento de dados e upload de arquivos.

## 2. Tecnologias utilizadas

- HTML, CSS e JavaScript puro
- Supabase
- Jest para testes
- Node.js

## 3. Estrutura do projeto

```text
src/
  css/style.css
  js/app.js
  js/supabase.js
  js/utils.js

tests/
  prazos.test.js
```

## 4. Pré-requisitos

Antes de começar, verifique se você tem instalado:
- Node.js
- npm
- Um projeto criado no Supabase

## 5. Configuração do ambiente

Crie um arquivo chamado .env na raiz do projeto com as seguintes variáveis:

```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

Exemplo:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-publica
```

> As credenciais devem ser as mesmas usadas no projeto do Supabase.

## 6. Instalação

No terminal, na pasta do projeto, execute:

```bash
npm install
```

## 7. Como rodar localmente

Há duas opções simples para abrir a aplicação:

### Opção 1: usando um servidor local

```bash
npx serve .
```

Depois abra no navegador o endereço mostrado no terminal, normalmente:

```text
http://localhost:3000
```

### Opção 2: abrir diretamente no navegador

Se estiver usando um ambiente como VS Code Live Server, basta abrir o arquivo index.html.

## 8. Como usar o sistema

1. Acesse a tela de login.
2. Crie uma conta ou faça login.
3. Se for representante, pode cadastrar prazos públicos.
4. Os prazos serão salvos no Supabase e exibidos na timeline.

## 9. Como rodar os testes

```bash
npm test
```

Os testes verificam regras de negócio como:
- validação de datas;
- validação de e-mail institucional;
- criação do objeto de prazo;
- comportamento da lógica de negócio.

## 10. Banco de dados no Supabase

O projeto espera que o banco tenha tabelas como:
- users
- disciplines
- events

Além disso, é necessário criar as políticas de acesso (RLS) e o trigger de criação de usuário conforme o SQL utilizado no projeto.

## 11. Observações importantes

- O arquivo .env não deve ser enviado para o repositório.
- Para uso em produção, mantenha as credenciais seguras.
- Se houver erro de conexão, verifique se a URL e a chave do Supabase estão corretas.

---

Projeto desenvolvido como atividade acadêmica de extensão e qualidade de software.
