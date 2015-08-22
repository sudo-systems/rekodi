rekodiApp.factory('rkCacheService', ['rkHelperService',
  function(rkHelperService) {
    var create = function(identifier) {
      var fs = require('fs');
      var mkpath = require('mkpath');
      var cacheDir = __dirname+'/cache/';
      var cacheFile = cacheDir+identifier+'.json';
      var cacheData = {};
      
      function init() {
        if(fs.existsSync(cacheFile)) {
          cacheData = require(cacheFile);
        }
        else if(!fs.existsSync(cacheDir)) {
          mkpath.sync(cacheDir);
          writeData(cacheData);
        }
      }
      
      init();
      
      function writeData(data) {
        var fileStream = fs.createWriteStream(cacheFile, {flags: 'w'});
        fileStream.write(JSON.stringify(data));
      }

      function formatKey(properties) {
        return (properties.index === undefined)? properties.key : properties.key+'_'+properties.index;
      }

      this.set = function(properties) {
        /*
         * properties = {
         *  data: Object/Array, (required)
         *  key: String/Int, (required)
         *  index: String/Int (optional)
         * };
         */

        var key = formatKey(properties);
        cacheData[key] = properties.data;
        writeData(cacheData);
      };

      this.get = function(properties) {
        /*
         * properties = {
         *  key: String/Int, (required)
         *  index: String/Int (optional)
         * };
         */

        var key = formatKey(properties);
        return (cacheData[key])? cacheData[key] : [];
      };

      this.update = function(properties) {
        /*
         * properties = {
         *  data: Object/Array, (required)
         *  key: String/Int, (required)
         *  index: String/Int (optional)
         * };
         */

        var key = formatKey(properties);

        if(!cacheData[key] || !angular.equals(cacheData[key], properties.data)) {
          this.set(properties);
          return true;
        }

        return false;
      };
    };
    

    return {
      create: create
    };
  }
]);