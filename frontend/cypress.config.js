const { defineConfig } = require("cypress");
const { verifyDownloadTasks } = require('cy-verify-downloads');

module.exports = defineConfig({
    projectId: "64mkuc",
    e2e: {
        setupNodeEvents(on, config) {
          on('task', verifyDownloadTasks);
        },
    },
});