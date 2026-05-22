describe('US01 - Autenticação e Controle de Acesso', () => {

    beforeEach(() => {
        cy.visit('http://127.0.0.1:5500/frontend/login.html'); 
    });

    it('Cenário 1: Deve realizar login com sucesso', () => {
        cy.get('#login-email').type('usuario@teste.com');
        cy.get('#login-senha').type('senha123');
        cy.get('form button[type="submit"]').click();
        cy.url().should('include', 'dashboard.html');
    });

    it('Cenário 2: Deve exibir erro com dados inválidos', () => {
        cy.get('#login-email').type('errado@email.com');
        cy.get('#login-senha').type('senhaIncorreta');
        cy.get('form button[type="submit"]').click();
        cy.get('#login-error').should('be.visible');
    });
});