const HttpError = require('../utils/HttpError');

function rotaNaoEncontrada(req, res, next) {
  next(new HttpError(404, 'Rota não encontrada.'));
}

function tratarErros(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ erro: 'JSON inválido ou malformado.' });
  }
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ erro: err.message });
  }
  console.error('Erro interno:', err);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
}
module.exports = { rotaNaoEncontrada, tratarErros };
