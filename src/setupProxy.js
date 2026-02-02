const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const target = process.env.REACT_APP_API_BASE_URL;

  if (!target) {
    console.warn(
      '[setupProxy] REACT_APP_API_BASE_URL is not set. API requests will not be proxied.'
    );
    return;
  }


  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/api': '', // Remove /api prefix
      },
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('origin', target);
      },
      onError: (err, req, res) => {
        console.error('[Proxy Error]', err.message);
      },
    })
  );
};

