module.exports = {
  apps: [
    {
      name: 'irfx-frontend2',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/root/irfx-frontend2',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
