# API ADM Gestão

API backend construída com **NestJS**, utilizando **TypeORM**, **Oracle** e **PostgreSQL**, com autenticação via **JWT**, validações globais e configuração por variáveis de ambiente.

---
# Repositorio Git

- ApiAdmGestao

---

## Atualizar projeto (forçar sincronização com o repositório)

Caso queira atualizar o projeto local exatamente igual ao repositório remoto (`main`), utilize os comandos abaixo:

```bash
git fetch origin
git reset --hard origin/main
```

---

### gerar chave   RESPONSE_ENC_KEY_BASE64
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

---

# Requisitos

- Node.js (recomendado 18+)
- npm
- Oracle Instant Client (para conexão com Oracle DB)

---

# Instalação Oracle Instant Client (macOS)

```bash
brew install --cask oracle-instantclient
npm i @nestjs/schedule
```

Se precisar finalizar processos Node travados:

```bash
killall node
```

---

# AppError – Padronização de Erros

O `AppError` é responsável por padronizar erros da aplicação e informar ao frontend como deve exibir a mensagem através da propriedade `messageType`.

## Estrutura esperada

```ts
{
  message: string;        // Mensagem principal
  error?: string;         // Título do erro (já possui padrão interno)
  messageType: MessageType; // "alerta" ou "aviso"
  code?: string;          // Status code opcional
  telegram?: boolean;     // Enviar alerta no Telegram (true | false)
}
```

---

## messageType

### 🔴 alerta

- Erro crítico
- Exibido como alerta fixo no sistema web
- Registrado automaticamente em `./logs/error`
- Pode enviar notificação para Telegram (se `telegram: true`)

### 🟡 aviso

- Notificação temporária (toast/snackbar)
- Não é erro crítico
- Não é salvo em log de erro

---

# Logs de Comunicação

## Telegram

Todos os envios (sucesso ou erro) são registrados em:

```
./logs/telegram
```

### Estrutura esperada:

```ts
{
  chatId: string;     // ID do chat
  text: string;       // Conteúdo da mensagem
  botType: BotType;   // Tipo do bot (adm | alerta)
  title: string;      // Título para registro em log
}
```

---

## Email

Todos os envios (sucesso ou erro) são registrados em:

```
./logs/email
```

### Estrutura esperada:

```ts
{
  to: string[];     // Destinatários
  subject: string;  // Assunto
  html: string;     // Conteúdo HTML do email
  text: string;     // Texto/título para log
}
```

---

# Objetivo da Padronização

- Separar erros críticos de avisos simples
- Permitir que o frontend saiba como exibir cada mensagem
- Registrar apenas erros realmente graves
- Centralizar notificações (Telegram / Email)
- Manter histórico estruturado de logs


https://myaccount.google.com/apppasswords


npm install @nestjs/axios axios