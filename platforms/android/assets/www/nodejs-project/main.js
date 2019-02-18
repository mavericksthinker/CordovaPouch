const cordova = require('cordova-bridge');
var cors = require('./cors');
var port;
cordova.channel.on('message', function (msg) {
  console.log('[node] received:', msg);
  cordova.channel.send('Replying to this message: ' + msg);
});

var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var PouchDB = require('pouchdb-core');
var replicationStream = require('pouchdb-replication-stream');
let log = path.join(cordova.app.datadir(),"log.txt");
let backup = path.join(cordova.app.datadir(),"backup.txt");
let prefixdb = path.join(cordova.app.datadir(),"db");
let pouchDB = PouchDB.plugin(require('pouchdb-adapter-node-websql')).plugin(require('pouchdb-adapter-http')).plugin(require('pouchdb-mapreduce')).plugin(require('pouchdb-replication')).plugin(replicationStream.plugin);
pouchDB = pouchDB.defaults({prefix:prefixdb});
let pouchHandle = require('express-pouchdb')(pouchDB,{logPath:log});
PouchDB.adapter('writableStream',replicationStream.adapters.writableStream);

/*let pouchHandle = require('express-pouchdb')(pouchDB, {mode:'minimumForPouchDB',logPath:logLocation, inMemoryConfig:true, overrideMode: {include: ['config-infrastructure',
                                                                                                               'disk-size',
                                                                                                               'replicator',
                                                                                                               'routes/active-tasks',
                                                                                                               'routes/cluster',
                                                                                                               'routes/cluster-rewrite',
                                                                                                               'routes/config',
                                                                                                               'routes/db-updates',
                                                                                                               'routes/ddoc-info',
                                                                                                               'routes/find',
                                                                                                               'routes/list',
                                                                                                               'routes/replicate',
                                                                                                               'routes/show',
                                                                                                               'routes/stats',
                                                                                                               'routes/update',
                                                                                                               'routes/uuids',
                                                                                                               'validation']}});*/

//let pouchdbHandle = require('express-pouchdb')(pouchDB,{mode:'fullCouchDB',logPath:logLocation, inMemoryConfig:true})
//      function runTest() {
//              log('starting...');
//              var BATCH_SIZE = 100000;
//              var ITERATIONS = 1000;
//              var pouch = new PouchDB('stressTest', {adapter: 'websql'});
//              var promise = PouchDB.utils.Promise.resolve();
//              function addDocs(i) {
//                  promise = promise.then(function () {
//                      var docs = [];
//                      for (var j = 0; j < BATCH_SIZE; j++) {
//                          docs.push({});
//                      }
//                      return pouch.bulkDocs({docs: docs}).then(function () {
//                          var numDone = (i + 1) * BATCH_SIZE;
//                          var total = BATCH_SIZE * ITERATIONS;
//                          var percent = (Math.round((numDone / total) * 10000) / 100).toFixed(2);
//                          log('Added ' + numDone + '/' + total + ' (' + percent + '%) docs so far...');
//                      });
//                  });
//              }
//              for (var i = 0; i < ITERATIONS; i++) {
//                  addDocs(i);
//              }
//              promise.then(function () {
//                  log('Success!');
//              }, function (err) {
//                  log('Failure!');
//                  log(err);
//              });
//              return false;
//          }
var server;
var config = pouchHandle.couchConfig;
app.use(cors(config));
console.log("Config file set");
app.use('/',pouchHandle);
console.log("Opening port");
cordova.channel.on('change', function(ports){
console.log(ports);
port = ports;
if(server!=null)
server.close();
server = app.listen(port).on('error',console.log);
console.log("Port open at : "+port);
});



var db = new pouchDB('posdemo',{adapter:'websql'});
db.changes({live: true, since:0}).on('change', console.log);
var imgdb = new pouchDB('img',{adapter:'websql'});
imgdb.changes({live: true, since:0}).on('change',console.log)
imgdb.put({
    _id: 'meowth',
    _attachments: {
      'meowth.png': {
        content_type: 'image/png',
        data: 'iVBORw0KGgoAAAANSUhEUgAAACgAAAAkCAIAAAB0Xu9BAAAABGdBTUEAALGPC/xhBQAAAuNJREFUWEetmD1WHDEQhDdxRMYlnBFyBIccgdQhKVcgJeQMpE5JSTd2uqnvIGpVUqmm9TPrffD0eLMzUn+qVnXPwiFd/PP6eLh47v7EaazbmxsOxjhTT88z9hV7GoNF1cUCvN7TTPv/gf/+uQPm862MWTL6fff4HfDx4S79/oVAlAUwqOmYR0rnazuFnhfOy/ErMKkcBFOr1vOjUi2MFn4nuMil6OPh5eGANLhW3y6u3aH7ijEDCxgCvzFmimvc95TekZLyMSeJC68Bkw0kqUy1K87FlpGZqsGFCyqEtQNDdFUtFctTiuhnPKNysid/WFEFLE2O102XJdEE+8IgeuGsjeJyGHm/xHvQ3JtKVsGGp85g9rK6xMHtvHO9+WACYjk5vkVM6XQ6OZubCJvTfPicYPeHO2AKFl5NuF5UK1VDUbeLxh2BcRGKTQE3irHm3+vPj6cfCod50Eqv5QxtwBQUGhZhbrGVuRia1B4MNp6edwBxld2sl1splfHCwfsvCZfrCQyWmX10djjOlWJSSy3VQlS6LmfrgNvaieRWx1LZ6s9co+P0DLsy3OdLU3lWRclQsVcHJBcUQ0k9/WVVrmpRzYQzpgAdQcAXxZzUnFX3proannrYH+Vq6KkLi+UkarH09mC8YPr2RMWOlEqFkQClsykGEv7CqCUbXcG8+SaGvJ4a8d4y6epND+pEhxoN0vWUu5ntXlFb5/JT7JfJJqoTdy9u9qc7ax3xJRHqJLADWEl23cFWl4K9fvoaCJ2BHpmJ3s3z+O0U/DmzdMjB9alWZtg4e3yxzPa7lUR7nkvxLHO9+tvJX3mtSDpwX8GajB283I8R8a7D2MhUZr1iNWdny256yYLd52DwRYBtRMvE7rsmtxIUE+zLKQCDO4jlxB6CZ8M17GhuY+XTE8vNhQiIiSE82ZsGwk1pht4ZSpT0YVpon6EvevOXXH8JxVR78QzNuamupW/7UB7wO/+7sG5V4ekXb4cL5Lyv+4IAAAAASUVORK5CYII='
      }
    }
  }).then(function () {
    console.log("Image was successfully stored");
  }).catch(function(err){
  console.log(err);
  })

cordova.channel.on('backup',function(msg){
 var ws = fs.createWriteStream(backup);
 db.dump(ws,{batch_size:2000,since:0}).then(function(res){
 console.log(res);
 }).catch(function(err){
 console.log(err)
 });
})

cordova.channel.on('download',function(msg){
console.log(backup);
var writableStreams = fs.createWriteStream(backup);
db.dump(writableStreams,{batch_size:2000,since:0}).then(function(res){
console.log(res);
}).then(function(){
cordova.channel.post('init',backup);
}).catch(function(err){
console.log(err);
});
});