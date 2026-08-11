# GloryPad iOS Build Guide

Este guia descreve o fluxo para gerar a versão iOS do GloryPad em um Mac moderno com Xcode instalado.

## PASSO 1

Copiar ou clonar o projeto GloryPad no Mac.

## PASSO 2

Abrir o Terminal na pasta do projeto.

## PASSO 3

Executar:

```bash
npm install
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

## PASSO 4

No Xcode, configurar:

App Name:
GloryPad

Bundle ID:
com.sergiocollicelli.glorypad

Marketing Version:
1.0

Build:
1

Automatically manage signing:
ativado

Team:
minha conta Apple Developer

## PASSO 5

Configurar App Icon 1024x1024 sem transparencia.

## PASSO 6

Testar em iPhone fisico.

Testar obrigatoriamente:

- abrir o app
- todos os 12 pads
- todas as colecoes
- troca de tonalidade
- volume
- loop continuo
- crossfade
- bloquear a tela
- segundo plano
- voltar ao app
- rotacao/orientacao
- notch/safe areas

## PASSO 7

Se tudo funcionar:

Product > Archive

Depois:

Distribute App
App Store Connect
Upload
