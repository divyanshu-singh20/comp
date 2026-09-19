const notFoundHandler = (request, response) => {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.originalUrl}` });
};

const errorHandler = (error, request, response, next) => {
  if (response.headersSent) return next(error);

  console.error(error);
  return response.status(error.status || 500).json({ message: 'Internal server error' });
};

module.exports = { errorHandler, notFoundHandler };