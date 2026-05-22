describe('US02 - Cadastro de Usuários (Confirmação de Senha)', () => {

  beforeEach(() => {
    cy.visit('http://127.0.0.1:5500/frontend/cadaclsstro.html') 
  })

  it('Cenário 1: Deve impedir o cadastro se as senhas forem diferentes', () => {
    cy.get('#cad-nome').type('João da Silva')
    cy.get('#cad-email').type('joao@teste.com')

    cy.get('#cad-senha').type('senha123')
    cy.get('#cad-confirmar-senha').type('senhaErrada456')

    cy.get('[data-testid="btn-submit-register"]').click()

    cy.get('#cad-error').should('be.visible')
      .and('contain', 'As senhas não coincidem')

    cy.url().should('include', 'cadastro.html')
  })
})