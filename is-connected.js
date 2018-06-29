const ping = require("ping");
const { logInfo, logError } = require("./logs");


// @hosts : array of strings
const isConnected = (hosts) =>
  new Promise(async resolve => {
    // shuffle hosts so it doesn't ping the same host all the time
    hosts = shuffle(hosts);
    for (let host of hosts) {
      const status = await pingHost(host);
      
      if (status) {
        resolve(true);
        return;
      } else {
        // logInfo("failed pinging", host);
      }
    }
    resolve(false);
  });

function pingHost(host) {
  const promise = new Promise((resolve, reject) => {
    ping.sys.probe(host, isAlive => {
      resolve(isAlive);
    });
  });
  return promise;
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
}


module.exports = isConnected;
