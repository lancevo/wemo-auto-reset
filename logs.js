
const logInfo = function() {
  console.log.apply(this, [new Date().toString() + ": ", ...arguments]);
};

const logError = function() {
  console.error.apply(this, [
    new Date().toString() + ": ",
    "* Error -",
    ...arguments
  ]);
};

module.exports = { logInfo, logError };
