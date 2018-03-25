const {ETW_DECIMALS} = require('./constants');
/**
 * Convert 1 Bskt value to base unit, similar to converting ETH to Wei
 */
function toBU(amount) {
  return amount * (10 ** ETW_DECIMALS);
}

module.exports = {
  toBU
};
