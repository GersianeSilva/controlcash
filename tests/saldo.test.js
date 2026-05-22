const { calcularSaldo } = require('../frontend/utils');

describe('US03 - Teste Unitário: Lógica de Recálculo do Saldo', () => {

    it('Cenário 1: Deve recalcular o saldo corretamente após a exclusão de uma despesa', () => {
        let historicoTransacoes = [
            { id: 1, descricao: 'Salário', valor: 3000.00, tipo: 'Receita' },
            { id: 2, descricao: 'Conta de Luz', valor: 120.00, tipo: 'Despesa' },
            { id: 3, descricao: 'Mercado', valor: 200.00, tipo: 'Despesa' }
        ];

        const saldoInicial = calcularSaldo(historicoTransacoes);
        expect(saldoInicial).toBe(2680.00);

        historicoTransacoes = historicoTransacoes.filter(t => t.id !== 2);

        const novoSaldo = calcularSaldo(historicoTransacoes);

        expect(novoSaldo).toBe(2800.00);
        expect(novoSaldo).not.toBe(saldoInicial); // Garante que o valor mudou
    });
});