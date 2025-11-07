module.exports = {
  apps: [
    {
      name: 'larnaca-coffee-guide',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=larnaca-coffee-db --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
