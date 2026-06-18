module.exports = {
  apps: [
    {
      name: 'irfx-backend',
      script: 'main.py',
      interpreter: 'python3',
      cwd: '/home/megamo/irfx-backend',
      restart_delay: 3000,
      max_restarts: 10,
    },
    {
      name: 'irfx-frontend2',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/home/megamo/irfx-frontend2',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
