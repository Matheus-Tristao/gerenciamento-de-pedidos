const service = require('../services/pedidosService');

function criar(req, res) {
  return res.status(201).json(service.criar(req.body));
}
function listar(req, res) {
  return res.status(200).json(service.listar());
}
function consultar(req, res) {
  return res.status(200).json(service.consultar(req.params.id));
}
function atualizarStatus(req, res) {
  return res.status(200).json(service.atualizarStatus(req.params.id, req.body));
}
module.exports = { criar, listar, consultar, atualizarStatus };
