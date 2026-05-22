const express = require('express');
const cors = require('cors');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, 'database.db');
let db;

async function initDatabase() {
    db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (
            email TEXT PRIMARY KEY,
            nome TEXT NOT NULL,
            senha TEXT NOT NULL
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS transacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_email TEXT,
            descricao TEXT NOT NULL,
            valor REAL NOT NULL,
            tipo TEXT NOT NULL,
            FOREIGN KEY (usuario_email) REFERENCES usuarios (email) ON DELETE CASCADE
        );
    `);
    
    console.log('Banco de Dados SQLite conectado com sucesso.');
}

// Registro de Usuário
app.post('/api/auth/register', async (req, res) => {
    const { nome, email, senha } = req.body;
    try {
        const usuarioExiste = await db.get('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (usuarioExiste) {
            return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
        }
        await db.run('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', [nome, email, senha]);
        res.status(201).json({ message: 'Usuário registrado com sucesso.' });
    } catch (err) {
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const usuario = await db.get('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha]);
        if (usuario) {
            res.json({ message: 'Login bem-sucedido.', email: usuario.email });
        } else {
            res.status(401).json({ error: 'Usuário ou senha inválidos.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

// criação de transações
app.post('/api/transacoes', async (req, res) => {
    const { email, descricao, valor, tipo } = req.body;
    try {
        const result = await db.run(
            'INSERT INTO transacoes (usuario_email, descricao, valor, tipo) VALUES (?, ?, ?, ?)',
            [email, descricao, valor, tipo]
        );
        res.status(201).json({ id: result.lastID, usuario_email: email, descricao, valor, tipo });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao salvar transação.' });
    }
});

// Lista de Transações
app.get('/api/transacoes/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const rows = await db.all('SELECT * FROM transacoes WHERE usuario_email = ?', [email]);
        
        const formatado = rows.map(r => ({ id: r.id, usuario: r.usuario_email, descricao: r.descricao, valor: r.valor, tipo: r.tipo }));
        res.json(formatado);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar transações.' });
    }
});

// altera uma transação
app.put('/api/transacoes/:id', async (req, res) => {
    const { id } = req.params;
    const { descricao, valor, tipo } = req.body;
    try {
        await db.run(
            'UPDATE transacoes SET descricao = ?, valor = ?, tipo = ? WHERE id = ?',
            [descricao, valor, tipo, id]
        );
        res.json({ message: 'Transação atualizada com sucesso.' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar transação.' });
    }
});

// exclui um transação
app.delete('/api/transacoes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.run('DELETE FROM transacoes WHERE id = ?', [id]);
        res.json({ message: 'Transação excluída com sucesso.' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao excluir transação.' });
    }
});

const PORT = 3000;
initDatabase().then(() => {
    app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
});