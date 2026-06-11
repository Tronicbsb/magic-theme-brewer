# Magic JumpStart Dex — Guia do APK via Bubblewrap (TWA)

Este projeto está totalmente preparado como um PWA (Progressive Web App):
- O manifesto PWA e o service worker de cache offline são gerados de forma otimizada durante a compilação (`npm run build`) na pasta `dist/`.
- Os ícones oficiais do Android estão salvos na pasta `public/`.
- Barra de navegação inferior tátil e configurações de orientação do app travadas em retrato.

## Passos para gerar e empacotar o seu APK:

1. **Publique a build do projeto** em um domínio público HTTPS seguro (ex: Vercel, Netlify, Cloudflare Pages ou GitHub Pages).
   - Para gerar os arquivos compilados, execute:
     ```bash
     npm run build
     ```
   - Suba o conteúdo gerado dentro da pasta `dist/` para a sua hospedagem.

2. **Confirme se o PWA está respondendo no seu domínio**:
   - Acesse `https://SEU_DOMINIO/`
   - Acesse `https://SEU_DOMINIO/manifest.webmanifest` (deve retornar o JSON do manifesto)

3. **Instale o CLI do Bubblewrap globalmente** (caso não tenha instalado):
   ```bash
   npm i -g @bubblewrap/cli
   ```

4. **Inicie o assistente de criação do aplicativo Android**:
   ```bash
   bubblewrap init --manifest=https://SEU_DOMINIO/manifest.webmanifest
   ```
   *O Bubblewrap baixará os ícones e configurará o projeto Java/Android. Responda às perguntas iniciais (ex: Application ID como `com.magicjumpstart.dex` e nome do app).*

5. **Gere os arquivos APK assinados**:
   ```bash
   bubblewrap build
   ```
   *O Bubblewrap pedirá para criar uma chave de assinatura de APK (Keystore). Insira uma senha e guarde essa chave de assinatura com segurança. O comando gerará os arquivos `.apk` prontos para instalar no celular.*

6. **Gere o arquivo Digital Asset Links**:
   ```bash
   bubblewrap fingerprint generateAssetLinks --manifest=./twa-manifest.json --output=assetlinks.json
   ```
   E publique o arquivo `assetlinks.json` gerado no seguinte endereço do seu site:
   ```text
   https://SEU_DOMINIO/.well-known/assetlinks.json
   ```
   *Esse arquivo é essencial para associar o site ao aplicativo. Sem ele, o app rodará exibindo a barra de endereço do Chrome, em vez do modo tela cheia nativo (standalone).*
