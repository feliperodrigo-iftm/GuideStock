# GuideStock — protótipo do site

Protótipo visual e funcional para o projeto GuideStock, com foco em Uberaba-MG.

## O que foi incluído

- Interface redesenhada com estética verde/branca e hierarquia visual mais consistente.
- Logo sem o retângulo preto no navegador: o JavaScript remove o fundo preto da PNG no carregamento.
- Pesquisa de produtos e serviços com filtros por categoria, raio, estoque e serviço relacionado.
- Abas de pesquisa: Tudo, Produtos e Serviços.
- Ordenação por relevância, menor preço e distância.
- Resultados demonstrativos com preço, disponibilidade, endereço e botões para Google Maps.
- Cadastro de consumidor e comerciante em modal.
- Campos do comerciante: nome, CNPJ, loja, endereço e categoria.
- Campos comuns: nome, celular, e-mail, senha e confirmação.
- Cadastro funcional para consumidor e comerciante, com validação de e-mail duplicado e confirmação de senha.
- Login com o e-mail e a senha cadastrados, botão para sair e sessão que permanece após recarregar a página.
- Após o cadastro, a conta já inicia conectada; o cabeçalho mostra o primeiro nome e o botão “Sair”.
- As contas ficam salvas no localStorage deste navegador. A senha não é guardada em texto puro: o protótipo usa PBKDF2/SHA-256 com salt por meio da Web Crypto API.
- Contas criadas por uma versão antiga do protótipo são migradas para o formato com hash quando a pessoa entra novamente.
- Google Maps por links de pesquisa/rota, sem necessidade de chave para esses links.
- Área preparada para mapa interativo incorporado pela Maps Embed API.

## Revisão de consistência e correções

- O filtro de categoria **Serviços** agora inclui todos os anúncios do tipo serviço, incluindo limpeza de piscina, categorizada como piscina e jardim.
- A opção **Somente disponíveis** considera produtos em estoque e serviços disponíveis para atendimento.
- A caixa **Serviço relacionado** agora remove produtos sem serviço associado, em vez de não alterar os resultados.
- A pesquisa por relevância prioriza produtos, serviços ou lojas com maior correspondência ao termo digitado.
- Os anúncios de demonstração estão identificados na lista; preços, estoque e distâncias não representam dados comerciais reais.
- O mapa passa a atualizar o link do Google Maps ao selecionar um resultado ou a localização atual. O fluxo de geolocalização não depende de uma janela pop-up aberta depois da resposta do navegador.
- Texto dinâmico de resultados e sugestões é escapado antes de ser inserido no HTML, reduzindo riscos de injeção caso os dados sejam conectados a uma fonte externa no futuro.

## Adaptação para celular, tablet e computador

A interface tem regras responsivas para telas largas, tablets e celulares pequenos. Em telas menores, o menu abre um painel com links, login e cadastro; formulários e filtros passam para uma coluna; cartões de resultados e ações do mapa ficam dimensionados para toque; e o formulário de conta se adapta à altura da tela e às áreas seguras dos celulares. Também foram adicionados estados de foco acessíveis e respeito à preferência por movimento reduzido.

Teste reduzindo a largura da janela do navegador ou abrindo a página em um celular. Para que os links locais, o armazenamento e os recursos do navegador se comportem de modo consistente, use um servidor local conforme as instruções abaixo.

## Google Maps incorporado

Os links "Explorar Uberaba", "Ver no mapa" e "Como chegar" usam Google Maps URLs e funcionam sem chave de API.

O projeto tenta exibir um mapa incorporado por iframe mesmo sem chave, como alternativa de demonstração. Esse fallback não substitui a integração oficial e pode variar conforme as políticas do Google. Para uma incorporação confiável pela Maps Embed API, edite `config.js`:

```js
window.GUIDESTOCK_CONFIG = {
  googleMapsApiKey: 'SUA_CHAVE_AQUI'
};
```

Use uma chave da Google Maps Platform restrita ao domínio do site e habilite a Maps Embed API em um projeto Google Cloud com faturamento ativado. A documentação oficial informa que a Maps Embed API não cobra pelas solicitações, mas exige chave válida e configuração de faturamento: https://developers.google.com/maps/documentation/embed/quickstart

## Como testar cadastro e login

1. Extraia o ZIP.
2. Abra um terminal dentro da pasta `guidestock-site`.
3. Inicie um servidor local com `python -m http.server 8000` (ou `python3 -m http.server 8000`).
4. Abra `http://localhost:8000` no navegador.
5. Clique em **Criar conta**, cadastre-se e observe que o cabeçalho passa a mostrar seu nome. Recarregue a página: a sessão deve continuar. Clique em **Sair** e depois em **Entrar**. Na tela de login, informe tanto o e-mail quanto a senha cadastrada (o campo de senha fica logo abaixo do e-mail).

As contas permanecem apenas no perfil do navegador em que foram criadas; limpar os dados do navegador remove essas contas. Não use senhas reutilizadas ou dados sensíveis.

Consulte `AUDITORIA.md` para ver as verificações e correções desta versão.

## Importante para uma versão real

Este pacote ainda é um front-end/protótipo. Mesmo com o hash de senha no navegador, não há servidor para validar a identidade nem proteger dados ou permissões. Para publicação real, o projeto deve ganhar:

- backend e banco de dados;
- autenticação segura e recuperação de senha;
- criptografia/gestão segura de credenciais;
- cadastro real de lojas, produtos, estoque, preços e serviços;
- validação de comerciantes e CNPJ;
- geocodificação de endereços;
- regras de atualização e auditoria de estoque/preço;
- políticas de privacidade e termos de uso.

Os dados de produtos e lojas presentes na página são apenas exemplos para demonstração do projeto.
