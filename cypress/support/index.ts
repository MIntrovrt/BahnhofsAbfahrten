import './commands';

Cypress.Server.defaults({
  force404: true,
});
beforeEach(() => {
  cy.server();
});
