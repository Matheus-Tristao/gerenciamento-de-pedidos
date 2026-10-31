const express = require('express');
const pedidosRoutes = require('./routes/pedidosRoutes');
const { rotaNaoEncontrada, tratarErros } = require('./middlewares/errorHandler');

const app = express();
app.use(express.json());
app.get('/', (req, res) => res.status(200).json({ mensagem: 'API de Gerenciamento de Pedidos ativa.' }));
app.use('/pedidos', pedidosRoutes);
app.use(rotaNaoEncontrada);
app.use(tratarErros);

module.exports = app;
