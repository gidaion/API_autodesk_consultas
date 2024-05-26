```markdown
# Consulta de Pedidos

## Descrição

Este projeto tem como objetivo realizar consultas de pedidos em uma API, utilizando autenticação OAuth2 com credenciais de cliente e servidor. Ele é útil para obter informações sobre pedidos de clientes em um determinado intervalo de datas. As variáveis necessárias devem ser configuradas em um arquivo `.env`. Você pode solicitar acesso ao espaço developer à Autodesk para obter essas variáveis.

## Exemplo de Saída

A consulta pode resultar em um arquivo JSON com a seguinte estrutura:

```json
{
  "csn": "8109320546",
  "startDate": "2024-06-15",
  "endDate": "2024-07-15",
  "sales_order_number": "6093750235",
  "purchase_order_number": "890232",
  "order_date": "2024-06-01T00:00:00+0000",
  "customer_po_number": "S14-986532D",
  "document_type": "Standard Order",
  "customer_number": "4309587210",
  "customer_name": "ABC Company",
  "status": "Shipped",
  "tracking_number": "1234567890",
  "recurring_po": "",
  "multi_billing": true
}
```

## Instalação

1. Clone este repositório em sua máquina local:

```
git clone git@github.com:seu-usuario/API_autodesk_consultas.git
```

2. Navegue até o diretório do projeto:

```
cd consulta-de-pedidos
```

3. Instale as dependências do projeto:

Com npm:

```
npm install
```

ou com Yarn:

```
yarn install
```

4. Crie um arquivo `.env` na raiz do projeto e configure as variáveis de ambiente necessárias conforme descrito em `key.env.example`.

## Uso

Para executar o projeto, utilize o seguinte comando:

Com npm:

```
npm start
```

ou com Yarn:

```
yarn start
```

Isso iniciará a consulta de pedidos com base nas configurações fornecidas.

Você pode usar o `pkg` para compilar o seu código para um executável e utilizá-lo onde achar interessante.

## Contribuição

Contribuições são bem-vindas! Se você deseja contribuir com este projeto, sinta-se à vontade para abrir um pull request ou uma issue para discutir novas funcionalidades, melhorias ou correções de bugs.

## Referências adicionais

- [Electron Forge](https://www.electronforge.io/)
- [Vue CLI Plugin Electron Builder](https://github.com/nklayman/vue-cli-plugin-electron-builder)
- [React com Electron](https://www.electronjs.org/docs/tutorial/react)
- [NW.js (Node-Webkit)](https://nwjs.io/)
- [Autenticação JavaScript na Documentação da Autodesk](https://partner.developer.autodesk.com/sample-codes/authentication/java-script)
```

Agora a seção "Referências adicionais" foi adicionada ao README.
