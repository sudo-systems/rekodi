rekodiApp.factory('rkCacheService', ['$rootScope', 'rkConfigService', 'rkLogService',
  function($rootScope, rkConfigService, rkLogService) {
    var create = function(identifier) {
      var fs = require('fs');
      var mkpath = require('mkpath');
      var http = require('http');
      var config = rkConfigService.get();
      var cacheFile = (identifier)? config.storageDirectories.cacheData+identifier+'.json' : null;
      var cacheData = {};

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
      
      this.file = function(properties) {
        /*
         * properties = {
         *  type: String, (required)
         *  category: String/Int, (required),
         *  url: String (required),
         *  filename: String (optional)
         * };
         */
        
        var filename = (properties.filename)? properties.filename : getFilenameFromUrl(properties.url);
        var subDirectory = $.trim(filename).charAt(0).toLowerCase();
        var targetDirectory = rkConfigService.get('storageDirectories', 'cache')+properties.type+'/'+properties.category+'/'+subDirectory+'/';
        var localFilePath = targetDirectory+filename;
        
        if(fs.existsSync(localFilePath)) {
          $rootScope.$emit('rkFileCacheCompleted', localFilePath);
        }
        else {
          download({
            targetDirectory: targetDirectory,
            localFilePath: localFilePath,
            url: properties.url
          });
        }

        return localFilePath;
      };

      var getFilenameFromUrl = function(url) {
        var filename = $.trim(decodeURIComponent(url.split('/').pop().split('#').shift().split('?').shift()));
        filename = (filename.substr(-1) === '/')? filename.substr(0, filename.length - 1) : filename;
        filename = decodeURIComponent(filename);

        return filename.split('/').pop(); 
      };
      
      function download(properties) {
        /*
         * properties = {
         *  targetDirectory: String/Int, (required)
         *  localFilePath: String (required)
         *  url: String (required)
         * };
         */

        if(!fs.existsSync(properties.targetDirectory)) {
          mkpath.sync(properties.targetDirectory);
        }

        var fileStream = fs.createWriteStream(properties.localFilePath);

        http.get(properties.url, function(response) {
          response.pipe(fileStream);
          fileStream.on('finish', function() {
            fileStream.close();
            $rootScope.$emit('rkFileCacheCompleted', properties.localFilePath);
          });
        }).on('error', function(error) {
          fs.unlink(fileStream);
          $rootScope.$emit('rkFileCacheCompleted', null);
          
          if(error) {
            rkLogService.error(error);
          }
        });
      };
    };
    

    return {
      create: create
    };
  }
]);