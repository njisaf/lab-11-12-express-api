'use strict';

const Promise = require('bluebird');
const debug = require('debug')('cat:storage');
const createError = require('http-errors');
const fs = Promise.promisifyAll(require('fs'), {suffix: 'Prom'});
const mkdirp = Promise.promisifyAll(require('mkdirp'), {suffix: 'Prom'});

module.exports = exports = {};

exports.createItem = function(schemaName, item) {
  debug('Hit storage.createItem');
  if(!schemaName) return Promise.reject(createError(400, 'We expected a schemaName...'));
  if(!item) return Promise.reject(createError(400, 'We expected an item...'));

  let json = JSON.stringify(item);

  return fs.accessProm(`${__dirname}/../data/${schemaName}`)
  .catch(err => {
    if (err.code === 'ENOENT') {
      debug('Hit fs.accessProm, no directory detected');
      return mkdirp.sync(`${__dirname}/../data/cat`);
    }
    return Promise.reject(createError(500, err.message));
  })
  .then(() => fs.writeFileProm(`${__dirname}/../data/${schemaName}/${item.id}.json`, json))
  .then( () => item)
  .catch( err => Promise.reject(createError(500, err.message)));

};

exports.fetchItem = function(schemaName, id) {
  debug('Hit storage.fetchItem');
  if(!schemaName) return Promise.reject(createError(400, 'We expected a schemaName...'));
  if(!id) return Promise.reject(createError(400, 'We expected an id...'));

  return fs.readFileProm(`${__dirname}/../data/${schemaName}/${id}.json`)
  .then( data => {
    try {
      let item = JSON.parse(data.toString());
      return item;
    } catch (err) {
      return Promise.reject(createError(500, err.message));
    }
  })
  .catch( err => Promise.reject(createError(404, err.message)));
};

exports.deleteItem = function(schemaName, id) {
  debug('Hit storage.deleteItem');
  if(!schemaName) return Promise.reject(createError(400, 'We expected a schemaName...'));
  if(!id) return Promise.reject(createError(400, 'We expected an id...'));

  return fs.unlinkProm(`${__dirname}/../data/${schemaName}/${id}.json`)
  .catch(err => Promise.reject(createError(404, err.message)));
};

// exports.availIDs = function(schemaName) {
//   return fs.readdirProm(...)
//   .then(filsname => filenames.map(name => name.split('.json')[0]))
//   .catch(err => Promise.reject(createError(404, err.message)));
// };
