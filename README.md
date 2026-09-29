# Simone Decoração e Artesanato

Landing page estática em HTML, CSS e JavaScript vanilla. Abra `index.html` ou sirva a pasta em qualquer hospedagem estática. Não requer instalação, build ou fetch de componentes.

## Organização

- `index.html`: conteúdo, header, footer, diálogos e dados estruturados.
- `assets/css/style.css`: identidade visual e componentes.
- `assets/css/responsive.css`: layouts mobile/tablet e redução de movimento.
- `assets/js/main.js`: menu, navegação, FAQ e galeria.
- `assets/js/animations.js`: entradas progressivas, movimento suave e parallax.
- `assets/js/floating-actions.js`: WhatsApp e retorno ao início.
- `assets/img/`: imagens originais preservadas na pasta fornecida.

## Publicação

Enviar `index.html` e `assets/` para a hospedagem. No GitHub Pages, publicar a pasta raiz. Todos os caminhos internos são relativos, compatíveis com subdiretórios.

O domínio não foi informado. Antes da publicação definitiva:

1. Inserir `<link rel="canonical" href="URL_ABSOLUTA_DA_PAGINA">` e `<meta property="og:url" content="URL_ABSOLUTA_DA_PAGINA">` no local indicado no head.
2. Tornar `og:image` e `twitter:image` URLs absolutas com o domínio real.
3. Criar `sitemap.xml` com essa URL e `robots.txt` apontando para o sitemap.

Não há analytics, formulários ou cookies próprios. Google Fonts exige conexão; fontes locais de sistema servem como fallback. WhatsApp e Instagram abrem em nova aba. Valores e prazos são tratados diretamente com a artesã.

## Validação local

`node tools/preview.cjs` abre um servidor em `http://127.0.0.1:4173`.

`tools/validate.cjs` usa uma instalação de Playwright disponível no ambiente (ou o caminho indicado por `PLAYWRIGHT_MODULE`). A página publicada não depende dessa ferramenta. O teste cobre 1440, 768, 390 e 320 px, overflow, imagens, âncoras, mensagens WhatsApp, menu, FAQ, lightbox, teclado, JSON-LD e balão temporizado. Resultados e capturas ficam em `validation/`.
