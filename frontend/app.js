const API_URL = 'http://localhost:3000/api';

// Armazenamento local apenas do estado de sessão e e-mail lembrado
let usuarioLogado = localStorage.getItem('usuarioLogado') || null;

async function handleCadastro(event) {
    event.preventDefault();
    const nome = document.getElementById('cad-nome').value;
    const email = document.getElementById('cad-email').value;
    const senha = document.getElementById('cad-senha').value;
    
    const confirmarSenha = document.getElementById('cad-confirmar-senha').value; 
    
    const msgSucesso = document.getElementById('cad-success');
    const msgErro = document.getElementById('cad-error');

   
    if (senha !== confirmarSenha) {
        msgSucesso.classList.add('hidden'); 
        msgErro.innerText = "As senhas não coincidem."; 
        msgErro.classList.remove('hidden');
        return; 
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha }) 
        });

        if (response.ok) {
            msgErro.classList.add('hidden');
            msgSucesso.innerText = "Cadastro realizado com sucesso! Redirecionando..."; 
            msgSucesso.classList.remove('hidden');
            document.getElementById('form-cadastro').reset();

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            msgSucesso.classList.add('hidden');
            msgErro.innerText = "Este e-mail já está cadastrado."; 
            msgErro.classList.remove('hidden');
        }
    } catch (err) {
        alert('Erro ao conectar ao servidor de backend.');
    }
}

// Função de Login
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    const lembrar = document.getElementById('login-lembrar').checked;
    const erroEl = document.getElementById('login-error');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        if (response.ok) {
            const data = await response.json();
            erroEl.classList.add('hidden');
            
            localStorage.setItem('usuarioLogado', data.email);

            if (lembrar) {
                localStorage.setItem('emailLembrado', data.email);
            } else {
                localStorage.removeItem('emailLembrado');
            }

            window.location.href = 'dashboard.html';
        } else {
            erroEl.classList.remove('hidden');
        }
    } catch (err) {
        alert('Erro ao conectar ao servidor de backend.');
    }
}


function handleLogout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'login.html';
}

function verificarAutenticacao() {
    if (!usuarioLogado) {
        window.location.href = 'login.html';
    } else {
        const userDisplay = document.getElementById('user-display');
        if (userDisplay) userDisplay.innerText = usuarioLogado;
    }
}

function checarEmailLembrado() {
    const emailSalvo = localStorage.getItem('emailLembrado');
    const inputEmail = document.getElementById('login-email');
    const checkboxLembrar = document.getElementById('login-lembrar');
    
    if (emailSalvo && inputEmail && checkboxLembrar) {
        inputEmail.value = emailSalvo;
        checkboxLembrar.checked = true;
    }
}


async function renderizarPainel() {
    const lista = document.getElementById('lista-transacoes');
    if (!lista) return;

    lista.innerHTML = '';
    let saldo = 0;
    let despesas = 0;

    try {
        const response = await fetch(`${API_URL}/transacoes/${usuarioLogado}`);
        const transacoesDoUsuario = await response.json();

        if (transacoesDoUsuario.length === 0) {
            lista.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-sm text-gray-400" data-testid="empty-list-message">Nenhuma transação cadastrada.</td></tr>`;
        }

        transacoesDoUsuario.forEach(t => {
            const valorNum = parseFloat(t.valor);
            if (t.tipo === 'Receita') saldo += valorNum;
            if (t.tipo === 'Despesa') {
                saldo -= valorNum;
                despesas += valorNum;
            }

            const tr = document.createElement('tr');
            tr.className = "border-b border-gray-100 hover:bg-gray-50 text-sm text-gray-700";
            tr.setAttribute('data-testid', `item-transacao-${t.id}`);
            tr.innerHTML = `
                <td class="p-4 font-medium">${t.descricao}</td>
                <td class="p-4 ${t.tipo === 'Receita' ? 'text-green-600' : 'text-red-600'} font-bold">R$ ${valorNum.toFixed(2)}</td>
                <td class="p-4"><span class="px-2 py-0.5 rounded text-xs font-bold ${t.tipo === 'Receita' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${t.tipo}</span></td>
                <td class="p-4 text-center flex justify-center gap-2">
                    <!-- Passamos os dados direto no elemento para facilitar a leitura da edição -->
                    <button onclick="carregarParaEditar(${t.id}, '${t.descricao}', ${t.valor}, '${t.tipo}')" data-testid="btn-editar-${t.id}" class="text-indigo-600 hover:text-indigo-900 font-medium text-xs bg-indigo-50 px-2 py-1 rounded">Editar</button>
                    <button onclick="deletarTransacao(${t.id})" data-testid="btn-deletar-${t.id}" class="text-red-600 hover:text-red-900 font-medium text-xs bg-red-50 px-2 py-1 rounded">Excluir</button>
                </td>
            `;
            lista.appendChild(tr);
        });

        document.getElementById('saldo-total').innerText = `R$ ${saldo.toFixed(2)}`;
        document.getElementById('despesa-total').innerText = `R$ ${despesas.toFixed(2)}`;
    } catch (err) {
        console.error('Erro ao buscar dados na API', err);
    }
}

async function handleSalvarTransacao(event) {
    event.preventDefault();
    const id = document.getElementById('transacao-id').value;
    const descricao = document.getElementById('t-descricao').value;
    const valor = document.getElementById('t-valor').value;
    const tipo = document.getElementById('t-tipo').value;

    try {
        if (id) {
            // Chamada PUT - UPDATE
            await fetch(`${API_URL}/transacoes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ descricao, valor, tipo })
            });
        } else {
            // Chamada POST - CREATE
            await fetch(`${API_URL}/transacoes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: usuarioLogado, descricao, valor, tipo })
            });
        }

        limparFormulario();
        renderizarPainel();
    } catch (err) {
        console.error('Erro ao salvar transação', err);
    }
}

function carregarParaEditar(id, descricao, valor, tipo) {
    document.getElementById('transacao-id').value = id;
    document.getElementById('t-descricao').value = descricao;
    document.getElementById('t-valor').value = valor;
    document.getElementById('t-tipo').value = tipo;

    document.getElementById('form-title').innerText = "Editar Transação";
    document.getElementById('btn-cancelar').classList.remove('hidden');
}

async function deletarTransacao(id) {
    try {
        await fetch(`${API_URL}/transacoes/${id}`, { method: 'DELETE' });
        renderizarPainel();
    } catch (err) {
        console.error('Erro ao deletar transação', err);
    }
}

function limparFormulario() {
    const form = document.getElementById('form-transacao');
    if (form) form.reset();
    document.getElementById('transacao-id').value = '';
    document.getElementById('form-title').innerText = "Nova Transação";
    document.getElementById('btn-cancelar').classList.add('hidden');
} 
