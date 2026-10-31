const request = require('supertest');
const app = require('../src/app');
const service = require('../src/services/pedidosService');

const exemplo = { cliente: 'Carlos Silva', tipo: 'entrega', valor: 350, prioridade: 'normal' };
beforeEach(() => service.limparParaTestes());

describe('API de Gerenciamento de Pedidos', () => {
  test('POST /pedidos cadastra pedido válido (201)', async () => {
    const resposta = await request(app).post('/pedidos').send(exemplo);
    expect(resposta.status).toBe(201);
    expect(resposta.body).toEqual({ id: 1, ...exemplo, status: 'recebido' });
  });

  test.each([
    [{ ...exemplo, cliente: '   ' }, 'Cliente'],
    [{ ...exemplo, valor: 0 }, 'Valor'],
    [{ ...exemplo, valor: '350' }, 'Valor'],
    [{ ...exemplo, tipo: 'outro' }, 'Tipo'],
    [{ ...exemplo, prioridade: 'urgente' }, 'Prioridade'],
    [{ ...exemplo, cliente: null }, 'Cliente']
  ])('POST rejeita dados inválidos (400): %p', async (corpo, mensagem) => {
    const resposta = await request(app).post('/pedidos').send(corpo);
    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toContain(mensagem);
  });

  test('GET /pedidos lista pedidos (200)', async () => {
    await request(app).post('/pedidos').send(exemplo);
    const resposta = await request(app).get('/pedidos');
    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveLength(1);
    expect(resposta.body[0].cliente).toBe(exemplo.cliente);
  });

  test('GET /pedidos/:id consulta existente (200)', async () => {
    await request(app).post('/pedidos').send(exemplo);
    const resposta = await request(app).get('/pedidos/1');
    expect(resposta.status).toBe(200);
    expect(resposta.body.id).toBe(1);
  });

  test('GET /pedidos/:id inexistente retorna 404', async () => {
    const resposta = await request(app).get('/pedidos/999');
    expect(resposta.status).toBe(404);
    expect(resposta.body.erro).toMatch(/não encontrado/);
  });

  test.each(['abc', '0', '9007199254740992'])('GET retorna 404 para ID inválido (%s)', async id => {
    const resposta = await request(app).get(`/pedidos/${id}`);
    expect(resposta.status).toBe(404);
  });

  test('PATCH atualiza status com transição válida (200)', async () => {
    await request(app).post('/pedidos').send(exemplo);
    const resposta = await request(app).patch('/pedidos/1/status').send({ status: 'em_preparacao' });
    expect(resposta.status).toBe(200);
    expect(resposta.body.status).toBe('em_preparacao');
  });

  test('PATCH rejeita status inválido (400)', async () => {
    await request(app).post('/pedidos').send(exemplo);
    const resposta = await request(app).patch('/pedidos/1/status').send({ status: 'nao_existe' });
    expect(resposta.status).toBe(400);
  });

  test('PATCH rejeita pular de recebido para entregue (400)', async () => {
    await request(app).post('/pedidos').send(exemplo);
    const resposta = await request(app).patch('/pedidos/1/status').send({ status: 'entregue' });
    expect(resposta.status).toBe(400);
  });

  test('PATCH retorna 404 para pedido inexistente', async () => {
    const resposta = await request(app).patch('/pedidos/999/status').send({ status: 'cancelado' });
    expect(resposta.status).toBe(404);
  });

  test('PATCH permite cancelamento de pedido recebido', async () => {
    await request(app).post('/pedidos').send(exemplo);
    const resposta = await request(app).patch('/pedidos/1/status').send({ status: 'cancelado' });
    expect(resposta.status).toBe(200);
    expect(resposta.body.status).toBe('cancelado');
  });

  test('PATCH impede mudanças após cancelamento', async () => {
    await request(app).post('/pedidos').send(exemplo);
    await request(app).patch('/pedidos/1/status').send({ status: 'cancelado' });
    const resposta = await request(app).patch('/pedidos/1/status').send({ status: 'enviado' });
    expect(resposta.status).toBe(400);
  });

  test('PATCH percorre as transições válidas até a entrega e mantém o status final', async () => {
    await request(app).post('/pedidos').send(exemplo);

    for (const status of ['em_preparacao', 'enviado', 'entregue']) {
      const resposta = await request(app).patch('/pedidos/1/status').send({ status });
      expect(resposta.status).toBe(200);
      expect(resposta.body.status).toBe(status);
    }

    const tentativaDeAlteracao = await request(app)
      .patch('/pedidos/1/status')
      .send({ status: 'cancelado' });
    expect(tentativaDeAlteracao.status).toBe(400);

    const pedido = await request(app).get('/pedidos/1');
    expect(pedido.body.status).toBe('entregue');
  });

  test('JSON malformado retorna 400', async () => {
    const resposta = await request(app).post('/pedidos').set('Content-Type', 'application/json').send('{ "cliente": ');
    expect(resposta.status).toBe(400);
  });
});
