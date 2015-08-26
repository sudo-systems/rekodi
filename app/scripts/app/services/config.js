rekodiApp.factory('rkConfigService', [
  function() {
    var homedir = require('homedir');
    var fs = require('fs');
    var mkpath = require('mkpath');
    
    var storageRootPath = homedir()+'/.rekodi/';
    var config = {
      application: {
        name: 'ReKodi',
        version: '0.1.0'
      },
      directories: {
        storageRoot: storageRootPath,
        logs: storageRootPath+'logs/',
        cache: storageRootPath+'cache/',
        temp: storageRootPath+'tmp/'
      }
    };
    
    config.files = {
      errorLog: config.directories.logs+'error.log',
      debugLog: config.directories.logs+'debug.log'
    };

    var get = function(category, key) {
      if(category && key) {
        return config[category][key];
      }
      else if(category) {
        return config[category]
      }
      
      return config;
    };
    
    function init() {
      for(var key in config.directories) {
        if(!fs.existsSync(config.directories[key])) {
          mkpath.sync(config.directories[key]);
        }
      }
    }
    
    init();

    return {
      get: get
    };
  }
]);