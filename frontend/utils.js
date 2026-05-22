function calcularSaldo(transacoes) {
    return transacoes.reduce((saldoAtual, transacao) => {
        if (transacao.tipo === 'Receita') {
            return saldoAtual + transacao.valor;
        } else if (transacao.tipo === 'Despesa') {
            return saldoAtual - transacao.valor;
        }
        return saldoAtual;
    }, 0);
}

module.exports = { calcularSaldo };