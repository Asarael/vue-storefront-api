'use strict'

const _set = require('lodash/set');

const fs = require('fs');
const path = require('path');

const configDir = path.resolve('./config');

var files = fs.readdirSync(configDir).filter(function(file) {
  if (file === 'default.json') return false;

  if (file.startsWith('elastic.schema.')) return false;

  return path.extname(file) === '.json';
});

module.exports.up = next => {
  files.forEach(function(file) {
    var file = path.join(configDir, file);

    try {
      console.log("Searching for deprecated parameters in file '%s'...", file);
      let config = JSON.parse(fs.readFileSync(file));

      if ("esHost" in config) {
        console.log("Parameter 'esHost' found - rewriting...", file);
        let esHostPort = config.esHost.split(':');
        _set(config, 'elasticsearch.host', esHostPort[0]);
        _set(config, 'elasticsearch.port', esHostPort[1]);
        delete config.esHost;
      }

      if ("esIndexes" in config) {
        console.log("Parameter 'esIndexes' found - rewriting...");
        _set(config, 'elasticsearch.indices', config.esIndexes);
        delete config.esIndexes;
      }

      fs.writeFileSync(file, JSON.stringify(config, null, 2));
      console.log("File '%s' updated.", file);
    } catch (e) {
      throw e;
    }
  });

  next()
}

module.exports.down = next => {
  next()
}
