const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
    },
    baseUrl: 'https://gabrielbernarde.github.io/Sorteador-De-Baus-Game/',
    viewportWidth: 1280,
    viewportHeight: 800
  },
});
