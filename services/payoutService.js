const calculatePayoutTotal = ({ videoCount, contractedRate }) => (
  Number(videoCount) * Number(contractedRate)
);

module.exports = { calculatePayoutTotal };
