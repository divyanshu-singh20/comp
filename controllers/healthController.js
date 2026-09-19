const getHealth = (request, response) => {
  response.json({ status: 'ok', service: 'leadyfy-os-api' });
};

module.exports = { getHealth };
