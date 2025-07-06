describe('Jogo dos Baús - Teste Automatizado Completo', () => {
  const username = 'TesteCypress';
  let generatedId = '';

  beforeEach(() => {
    cy.visit('https://gabrielbernarde.github.io/Sorteador-De-Baus-Game/');
    cy.wait(1500); // Aguarda transição da tela inicial
  });

  const playOneGame = () => {
    for (let i = 1; i <= 9; i++) {
      cy.get(`[data-bau-id="${i}"] button`).click();
      cy.wait(900); // Espera animação
    }

    cy.get('#loading-results-screen').should('have.class', 'active');
    cy.wait(2000);
    cy.get('#results-screen h2').should('contain', username.toUpperCase());
    cy.get('#play-again-btn').should('be.visible');
  };

  it('Realiza cadastro, joga 2 partidas, verifica histórico e troca usuário', () => {
    cy.get('#username').type(username);
    cy.get('#generate-id-btn').click();

    cy.get('#id').invoke('val').then((id) => {
      generatedId = id;

      // Stub do prompt e alert
      cy.window().then((win) => {
        cy.stub(win, 'prompt').returns(generatedId);
        cy.stub(win, 'alert').callsFake((msg) => {
          Cypress.log({ name: 'Alert interceptado', message: msg });
        });
      });

      cy.get('#register-btn').should('not.be.disabled').click();

      // Jogar primeira partida
      playOneGame();

      // Jogar novamente
      cy.get('#play-again-btn').click();
      cy.wait(1000);
      cy.get('#game-screen').should('be.visible');
      playOneGame();

      // Histórico de jogos
      cy.get('#show-my-games-btn').click();
      cy.get('#my-games-modal').should('have.class', 'active');
      cy.get('#historical-games-modal-container .game-card', { timeout: 10000 }).should('have.length', 2);
      cy.get('#my-games-modal .modal-close-btn').click();
      cy.get('#my-games-modal').should('have.class', 'hidden');

      // Trocar de usuário
      cy.get('#change-user-btn').click();
      cy.wait(1000);
      cy.get('#register-screen').should('be.visible');
      cy.get('#username').should('have.value', '');
      cy.get('#id').should('have.value', '');

      cy.log('✔️ Teste completo finalizado com sucesso!');
    });
  });
});
