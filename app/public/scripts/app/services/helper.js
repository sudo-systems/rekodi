rekodiApp.factory('rkHelperService', ['$localStorage', '$rootScope',
  function($localStorage, $rootScope) {
    var getImageUrl = function(specialPath) {
      var usernameAndPassword = ($localStorage.settings.password && $localStorage.settings.password !== '')? $localStorage.settings.username+':'+$localStorage.settings.password+'@' : '';
      return 'http://'+usernameAndPassword+$localStorage.settings.serverAddress+':'+$localStorage.settings.httpPort+'/image/'+encodeURIComponent(specialPath);
    }
    
    var addCustomFields = function(data) {
      for(var key in data) {
        if(data[key].file) {
          var filenameParts = data[key].file.split('/');
        
          if(filenameParts.length === 0) {
            filenameParts = data[key].file.split('\\');
          }

          if(filenameParts.length > 0) {
            data[key].file_name = (filenameParts[filenameParts.length-1] === '')? filenameParts[filenameParts.length-2] : filenameParts[filenameParts.length-1];
          }
          else {
            data[key].file_name = data[key].label;
          }
        }
        
        if(data[key].thumbnail) {
          data[key].thumbnail_src = getImageUrl(data[key].thumbnail);
        }

        if(data[key].genre) {
          data[key].display_genre = data[key].genre.join(', ');
        }
        
        if(data[key].rating) {
          data[key].rating_rounded =  Math.round(data[key].rating * 10 ) / 10;
        }
        
        if(data[key].duration) {
          data[key].duration_readable =  secondsToDuration(data[key].duration);
        }
        
        if(data[key].runtime) {
          data[key].duration_readable =  secondsToDuration(data[key].runtime);
        }
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
      return date.toISOString().substr(11, 8);
      //return moment().startOf('day').seconds(seconds).format('HH:mm:ss');
    };
    
    return {
      getImageUrl: getImageUrl,
      addCustomFields: addCustomFields,
      handleError: handleError,
      secondsToDuration: secondsToDuration
    };
  }
]);