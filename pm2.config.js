module.exports = {
  apps: [
    {
      name: 'payments-wallet',
      script: './dist/src/main.js',
      max_restarts: 5,
      min_uptime: '1m',
    },
  ],
};
