# API de Gerenciamento de Pedidos

Projeto prático avaliativo da disciplina **Tópicos Avançados em Sistemas de Informação II**. API REST em Node.js e Express para gerenciar pedidos de uma pequena loja.

## Requisitos

- Node.js 18 ou superior
- npm
- Postman (para capturar evidências)

## Instalação e execução

```bash
npm install
npm start
```

A API estará disponível em `http://localhost:3000`. Para desenvolver com reinício automático: `npm run dev`. Os dados ficam **em memória** e são apagados ao reiniciar o servidor; nenhum banco de dados é necessário.

## Endpoints

| Método | URL | Descrição | HTTP |
|---|---|---|---|
| POST | `/pedidos` | Cadastrar pedido | 201 ou 400 |
| GET | `/pedidos` | Listar todos os pedidos | 200 |
| GET | `/pedidos/:id` | Consultar por ID | 200 ou 404 |
| PATCH | `/pedidos/:id/status` | Atualizar status | 200, 400 ou 404 |

### Criar pedido

`POST http://localhost:3000/pedidos` com `Content-Type: application/json`:

```json
{
  "cliente": "Carlos Silva",
  "tipo": "entrega",
  "valor": 350,
  "prioridade": "normal"
}
```

Resposta `201`:

```json
{
  "id": 1,
  "cliente": "Carlos Silva",
  "tipo": "entrega",
  "valor": 350,
  "prioridade": "normal",
  "status": "recebido"
}
```

### Listar e consultar

`GET /pedidos` responde com um array JSON (`[]` quando não há pedidos). `GET /pedidos/1` retorna o objeto cadastrado ou `404` se não existir.

### Atualizar status

`PATCH http://localhost:3000/pedidos/1/status` com JSON:

```json
{ "status": "em_preparacao" }
```

Retorna `200` com o pedido atualizado. Para cancelar um pedido recém-criado, usar `{ "status": "cancelado" }`.

## Validações

- `cliente`: texto obrigatório; espaços nas extremidades são removidos.
- `tipo`: **entrega** ou **retirada**.
- `valor`: número finito maior que zero; texto numérico é rejeitado.
- `prioridade`: **baixa**, **normal** ou **alta**.
- `status`: **recebido**, **em_preparacao**, **enviado**, **entregue** ou **cancelado**.
- IDs inexistentes ou malformados resultam em `404`.
- Dados inválidos retornam `400` com `{ "erro": "mensagem explicativa" }`.
- Erros inesperados retornam `500` com mensagem genérica, sem revelar detalhes internos.

### Regra de transição de status

| Status atual | Próximos status permitidos |
|---|---|
| `recebido` | `em_preparacao`, `cancelado` |
| `em_preparacao` | `enviado`, `cancelado` |
| `enviado` | `entregue` |
| `entregue` | Nenhum (final) |
| `cancelado` | Nenhum (final) |

Não é permitido pular etapas, repetir o mesmo status ou alterar um pedido finalizado. Essas situações retornam `400`.

## Arquitetura em camadas

```text
src/
  server.js                    # Inicia o servidor
  app.js                       # Configura Express e middlewares
  routes/pedidosRoutes.js      # Define URLs e verbos HTTP
  controllers/pedidosController.js # Recebe requisições e responde HTTP
  services/pedidosService.js   # Regras de negócio e armazenamento em memória
  middlewares/errorHandler.js # Respostas padronizadas de erro
  utils/HttpError.js           # Erro HTTP conhecido
```

Fluxo de dados: **requisição → routes → controllers → services → controllers → resposta HTTP**. O middleware centralizado trata erros lançados pelas camadas.

## Testes automatizados

```bash
npm test
```

Os testes usam Jest e Supertest e cobrem criação válida/inválida, listagem, consulta, atualizações de status, transições proibidas e JSON malformado. Cada teste limpa o armazenamento em memória para preservar o isolamento.

## Evidências do Postman

Importe `postman/Pedidos.postman_collection.json` no Postman e execute os cenários nesta ordem:

1. `01-criacao.png`: POST válido e `201`.
2. `02-validacao.png`: POST com cliente vazio e `400`.
3. `03-listagem.png`: GET da lista e `200`.
4. `04-consulta-inexistente.png`: GET ID 999 e `404`.
5. `05-atualizacao.png`: PATCH ID 1 de `recebido` para `em_preparacao` e `200`.

**Tire capturas reais da sua execução e salve na pasta `evidencias/` antes de entregar.** Em cada print, mostre método, URL, body (quando houver), resposta e código HTTP. A coleção facilita os testes, mas não substitui os prints.

## GitHub e entrega

Publique o código, README, `package.json`, `package-lock.json` e os prints. Não envie `node_modules`, `.env`, senhas ou tokens. A atividade exige **pelo menos cinco commits significativos e reais** feitos durante o desenvolvimento. Veja `GUIA_ENTREGA.md` para orientação e entregue ao professor o link do repositório e seu RA.

## Uso de IA

Foi utilizada inteligência artificial como apoio à estruturação inicial da API, e na documentacao
