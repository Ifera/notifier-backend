const _ = require('lodash');

function trim(items) {
  return _.mapValues(items, (value) => {
    if (typeof value === 'string') {
      return value.trim();
    }

    return value;
  });
}

module.exports = {
  trim,
};
