const HttpError = require('../utils/HttpError');

// Armazenamento em memória: reiniciar o processo apaga todos os pedidos.
const pedidos = [];
let proximoId = 1;

const TIPOS = ['entrega', 'retirada'];
const PRIORIDADES = ['baixa', 'normal', 'alta'];
const STATUS = ['recebido', 'em_preparacao', 'enviado', 'entregue', 'cancelado'];

// Transições permitidas (um pedido cancelado ou entregue é finalizado).
const TRANSICOES = {
  recebido: ['em_preparacao', 'cancelado'],
  em_preparacao: ['enviado', 'cancelado'],
  enviado: ['entregue'],
  entregue: [],
  cancelado: []
};

function validarCriacao(dados) {
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
    throw new HttpError(400, 'Envie um objeto JSON com os dados do pedido.');
  }
  if (typeof dados.cliente !== 'string' || !dados.cliente.trim()) {
    throw new HttpError(400, 'Cliente é obrigatório e deve ser um texto não vazio.');
  }
  if (!TIPOS.includes(dados.tipo)) {
    throw new HttpError(400, `Tipo inválido. Valores permitidos: ${TIPOS.join(', ')}.`);
  }
  if (typeof dados.valor !== 'number' || !Number.isFinite(dados.valor) || dados.valor <= 0) {
    throw new HttpError(400, 'Valor deve ser um número finito maior que zero.');
  }
  if (!PRIORIDADES.includes(dados.prioridade)) {
    throw new HttpError(400, `Prioridade inválida. Valores permitidos: ${PRIORIDADES.join(', ')}.`);
  }
}

function idNumerico(id) {
  if (!/^[1-9]\d*$/.test(String(id)) || !Number.isSafeInteger(Number(id))) {
    throw new HttpError(404, 'Pedido não encontrado.');
  }
  return Number(id);
}

function obterPedido(id) {
  const pedido = pedidos.find(item => item.id === idNumerico(id));
  if (!pedido) throw new HttpError(404, 'Pedido não encontrado.');
  return pedido;
}

function criar(dados) {
  validarCriacao(dados);
  const pedido = {
    id: proximoId++,
    cliente: dados.cliente.trim(),
    tipo: dados.tipo,
    valor: dados.valor,
    prioridade: dados.prioridade,
    status: 'recebido'
  };
  pedidos.push(pedido);
  return { ...pedido };
}

function listar() {
  return pedidos.map(item => ({ ...item }));
}

function consultar(id) {
  return { ...obterPedido(id) };
}

function atualizarStatus(id, dados) {
  const pedido = obterPedido(id);
  if (!dados || typeof dados !== 'object' || Array.isArray(dados) || !STATUS.includes(dados.status)) {
    throw new HttpError(400, `Status inválido. Valores permitidos: ${STATUS.join(', ')}.`);
  }
  if (!TRANSICOES[pedido.status].includes(dados.status)) {
    throw new HttpError(400, `Transição não permitida: ${pedido.status} → ${dados.status}.`);
  }
  pedido.status = dados.status;
  return { ...pedido };
}

// Função usada somente para isolar os testes automatizados.
function limparParaTestes() {
  pedidos.length = 0;
  proximoId = 1;
}

module.exports = { criar, listar, consultar, atualizarStatus, limparParaTestes };
