# Auditoria do GuideStock

## Correções realizadas

- Corrigido o filtro da categoria **Serviços**, que agora também inclui serviços de piscina e jardim.
- A opção **Somente disponíveis** passa a ter um rótulo válido tanto para produtos quanto para serviços.
- Corrigido o filtro **Serviço relacionado**: ele deixa de incluir produtos que não oferecem um serviço associado.
- A ordenação por relevância prioriza correspondências no nome do produto, loja, serviço e tags.
- A seleção de um resultado atualiza também o link do Google Maps; o fluxo de localização foi alterado para evitar pop-ups que podem ser bloqueados pelo navegador.
- Resultados e sugestões são escapados antes de serem inseridos no HTML.
- Resultados fictícios são identificados como demonstração para evitar confusão com estoque, preços e distâncias reais.

## Verificações executadas

- Sintaxe de `script.js` e `config.js` validada com Node.js.
- HTML analisado: nenhum ID duplicado, link interno quebrado ou recurso local ausente encontrado.
- CSS analisado: sem erro de parsing e com chaves balanceadas.
- Testes de navegador para pesquisa, ordenação de relevância, categoria Serviços, filtro de serviço relacionado, links do mapa e abertura/fechamento do menu responsivo.
- Verificado que não há rolagem horizontal em larguras de 320, 360, 390, 480, 760, 980, 1024 e 1280 pixels.
- Testado o fluxo de cadastro, saída, senha incorreta e login novamente em um ambiente automatizado de navegador.

## Limitações que continuam explícitas

- Os produtos, lojas, preços e distâncias são dados fictícios para demonstração; não são uma base comercial real.
- As contas ficam no `localStorage` do navegador e não sincronizam entre dispositivos. Não usar dados sensíveis nem senhas reutilizadas.
- Os links do Google Maps abrem buscas/rotas, mas o mapa incorporado oficialmente pela Maps Embed API precisa de uma chave válida e da configuração correspondente no Google Cloud. A navegação externa do Maps não pôde ser validada visualmente nesta execução, pois depende de serviço de terceiros e rede.
- Não existe backend para autenticação pública, validação de comerciantes nem atualização de estoque em tempo real.
