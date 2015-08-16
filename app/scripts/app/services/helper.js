rekodiApp.factory('rkHelperService', ['$localStorage', '$rootScope',
  function($localStorage, $rootScope) {
    var getImageUrl = function(specialPath) {
      var usernameAndPassword = ($localStorage.settings.password && $localStorage.settings.password !== '')? $localStorage.settings.username+':'+$localStorage.settings.password+'@' : '';
      return 'http://'+usernameAndPassword+$localStorage.settings.serverAddress+':'+$localStorage.settings.httpPort+'/image/'+encodeURIComponent(specialPath);
    };
    
    var applyCustomFielsToItem = function(item) {
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
        item.duration_readable =  secondsToDuration(item.runtime);
      }

      if(item.resume && item.resume.position) {
        item.resume.position_readable = secondsToDuration(item.resume.position);
      }
      
      return item;
    };
    
    var addCustomFields = function(data) {
      if(data.constructor === Object) {
        data = applyCustomFielsToItem(data);
      }
      
      for(var key in data) {
        data[key] = applyCustomFielsToItem(data[key]);
      }
  
      return data;
    };
    
    var handleError = function(error) {
      var errorDetails = (error.response.data)? ' ('+error.response.data.stack.message+': '+error.response.data.stack.name+')' : '';
      $rootScope.$emit('rkServerError', {
        message: error.response.message+errorDetails
      });
      
      console.dir(error.response);
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

    return {
      getImageUrl: getImageUrl,
      addCustomFields: addCustomFields,
      handleError: handleError,
      secondsToDuration: secondsToDuration
    };
  }
]);