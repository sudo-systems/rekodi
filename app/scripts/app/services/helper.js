rekodiApp.factory('rkHelperService', ['rkSettingsService', 'rkLogService', 'rkConfigService', 'rkCacheService',
  function(rkSettingsService, rkLogService, rkConfigService, rkCacheService) {
    var wallpaper = require('wallpaper');
    var mkpath = require('mkpath');
    var fs = require('fs');
    var http = require('http');
    var sanitize = require('sanitize-filename');
    var cache = new rkCacheService.create();
    var config = rkConfigService.get();
    var connectionSettings = rkSettingsService.get({category: 'connection'});

    var getImageUrl = function(specialPath) {
      var usernameAndPassword = (connectionSettings.password && connectionSettings.password !== '')? connectionSettings.username+':'+connectionSettings.password+'@' : '';
      var downloadPath = 'http://'+usernameAndPassword+connectionSettings.serverAddress+':'+connectionSettings.httpPort+'/image/';
      var urlEncodedImagePath = encodeURIComponent(specialPath);
      
      return (downloadPath+urlEncodedImagePath);
    };
    
    var getFilenameFromUrl = function(url) {
      var filename = (url)? $.trim(decodeURIComponent(url.split('/').pop().split('#').shift().split('?').shift())) : null;
      filename = (filename.substr(-1) === '/')? filename.substr(0, filename.length - 1) : filename;
      filename = decodeURIComponent(filename);

      return filename.split('/').pop(); 
    };
    
    function applyCustomFields(item, cacheImages) {
      cacheImages = (cacheImages === undefined)? false : cacheImages;
      
      if(item.file) {
        var filenameParts = item.file.split('/');

        if(filenameParts.length === 0) {
          filenameParts = item.file.split('\\');
        }

        if(filenameParts.length > 0) {
          item.file_name = (filenameParts[filenameParts.length-1] === '')? filenameParts[filenameParts.length-2] : filenameParts[filenameParts.length-1];
        }
        else {
          item.file_name = item.label;
        }
      }

      if(item.thumbnail) {
        item.thumbnail_src = getImageUrl(item.thumbnail);
      }
      
      if(item.thumbnail_src && cacheImages) {
        var thumbnailPath = cache.file({
          type: 'images',
          category: 'thumbnails',
          filename: sanitize(item.label)+'.jpg',
          url: item.thumbnail_src
        });
        
        if(thumbnailPath) {
          item.thumbnail_path = thumbnailPath;
        }
      }
      
      if(item.fanart) {
        item.fanart_src = getImageUrl(item.fanart);
      }
      
      if(item.fanart_src && cacheImages) {
        var fanartPath = cache.file({
          type: 'images',
          category: 'fanart',
          filename: sanitize(item.label)+'.jpg',
          url: item.fanart_src
        });
        
        if(fanartPath) {
          item.fanart_path = fanartPath;
        }
      }

      if(item.genre) {
        item.display_genre = item.genre.join(', ');
      }

      if(item.rating) {
        item.rating_rounded =  Math.round(item.rating * 10 ) / 10;
      }

      if(item.duration) {
        item.duration_readable =  secondsToDuration(item.duration);
      }

      if(item.runtime) {
        item.duration = item.runtime;
        item.duration_readable =  secondsToDuration(item.runtime);
      }

      if(item.resume && item.resume.position && item.resume.position !== 0) {
        item.is_resumable = true;
        item.resume.position_readable = secondsToDuration(item.resume.position);
      }
      
      if(!item.is_resumable && item.episode !== undefined && item.watchedepisodes !== undefined) {
        if(item.episode === 0 || item.episode === item.watchedepisodes) {
          item.is_watched = true;
        }
      }
      
      if(!item.is_resumable && item.lastplayed && item.lastplayed !== '') {
        item.is_watched = true;
      }

      return item;
    };
    
    var addCustomFields = function(data, cacheImages) {
      if(data.constructor === Object) {
        return applyCustomFields(data, cacheImages);
      }
      
      for(var key in data) {
        data[key] = applyCustomFields(data[key], cacheImages);
      }
  
      return data;
    };

    var secondsToDuration = function(seconds) {
      var date = new Date(null);
      date.setSeconds(seconds);
      var timeString = date.toISOString().substr(11, 8);

      if(timeString.substr(0, 3) === '00:') {
        timeString = timeString.substr(3, 7);
      }
      
      return timeString;
    };
    
    var secondsToTimeObject = function(seconds) {
      var date = new Date(1970, 0, 1);
      date.setSeconds(seconds);
      
      var timeObject = {
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
        milliseconds: date.getMilliseconds()
      };

      return timeObject;
    };
    
    var timeObjectToSeconds = function(timeObject) {
      return ((+timeObject.hours) * 60 * 60 + (+timeObject.minutes) * 60 + (+timeObject.seconds));
    };

    var downloadFile = function(url, targetDirectory, filename, overwrite, callback) {
      var downloadDirectory = config.storageDirectories.temp+targetDirectory;
      downloadDirectory = (downloadDirectory.substr(-1) !== '/')? downloadDirectory+'/' : downloadDirectory;
      
      if(!fs.existsSync(downloadDirectory)) {
        mkpath.sync(downloadDirectory);
      }

      if(filename && filename !== '') {
        filename = filename.toString();
        var filenameParts = filename.split('.');

        if(filenameParts.length < 2) {
          var downloadedFilename = getFilenameFromUrl(url);
          var donwloadedFilenameParts = downloadedFilename.split('.');
          var downloadedFileExtension = (donwloadedFilenameParts.length > 0)? donwloadedFilenameParts[donwloadedFilenameParts.length -1] : '';
          filename = filename+'.'+downloadedFileExtension;
        }
      }
      else {
        filename = getFilenameFromUrl(url);
      }

      var downloadedFilePath = downloadDirectory+filename;
      
      if(!overwrite && fs.existsSync(downloadedFilePath)) {
        callback(downloadedFilePath);
        return;
      }

      var file = fs.createWriteStream(downloadedFilePath);
      
      http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
          file.close(function(data) {
            callback(downloadedFilePath);
          });
        });
      }).on('error', function(error) {
        fs.unlink(file);
        
        if(error) {
          rkLogService.error(error.message);
        }

        if(callback) {
          callback(null);
        }
      });
    };

    return {
      getImageUrl: getImageUrl,
      addCustomFields: addCustomFields,
      secondsToDuration: secondsToDuration,
      getFilenameFromUrl: getFilenameFromUrl,
      downloadFile: downloadFile,
      secondsToTimeObject: secondsToTimeObject,
      timeObjectToSeconds: timeObjectToSeconds
    };
  }
]);