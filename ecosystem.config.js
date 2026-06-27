module.exports = {
  apps: [
    {
      name: 'mindlura-backend',
      script: 'main.py',
      interpreter: 'python3',
      cwd: '/home/megamo/mindlura-backend',
      restart_delay: 3000,
      max_restarts: 10,
    },
    {
      name: 'mindlura-frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/home/megamo/mindlura-frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
