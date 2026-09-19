const calculateOrderAmounts = ({ pricing, gst = 0, amountReceived = 0 }) => {
  const totalAmount = Number(pricing) + Number(gst);
  const balance = Math.max(totalAmount - Number(amountReceived), 0);

  return { totalAmount, balance };
};

module.exports = { calculateOrderAmounts };
