rekodiApp.service('rkCacheService', ['$localStorage',
  function($localStorage) {
    var _identifier = null;
    
    this.setCategory = function(identifier) {
      _identifier = identifier;
      
      if(!$localStorage.cache[_identifier]) {
        $localStorage.cache[_identifier] = {};
      }
    };
    
    this.set = function(properties) {
      /*
       * properties = {
       *  data: Object/Array, (required)
       *  key: String/Int, (required)
       *  index: String/Int (optional)
       * };
       */
      
      if(properties.index) {
        if($localStorage.cache[_identifier][properties.key]) {
          var cachedDataObject = JSON.parse($localStorage.cache[_identifier][properties.key]);
          cachedDataObject[properties.index] = properties.data;
          $localStorage.cache[_identifier][properties.key] = JSON.stringify(cachedDataObject);
        }
        else {
          var dataObject = {};
          dataObject[properties.index] = properties.data;
          $localStorage.cache[_identifier][properties.key] = JSON.stringify(dataObject);
        }
      }
      else {
        $localStorage.cache[_identifier][properties.key] = JSON.stringify(properties.data);
      }
    };
    
    this.get = function(properties) {
      /*
       * properties = {
       *  key: String/Int, (required)
       *  index: String/Int (optional)
       * };
       */
      
      if($localStorage.cache[_identifier][properties.key]) {
        if(properties.index) {
          var cachedDataObject = JSON.parse($localStorage.cache[_identifier][properties.key]);
          return (cachedDataObject[properties.index])? cachedDataObject[properties.index] : [];
        }
        else {
          return JSON.parse($localStorage.cache[_identifier][properties.key]);
        }
      }
      
      return [];
    };
    
    this.update = function(properties) {
      /*
       * properties = {
       *  data: Object/Array, (required)
       *  key: String/Int, (required)
       *  index: String/Int (optional)
       * };
       */
      
      if(properties.index) {
        if(!$localStorage.cache[_identifier][properties.key]) {
          this.set(properties);
          return true;
        }
        else {
          var cachedDataObject = JSON.parse($localStorage.cache[_identifier][properties.key]);
          
          if(!cachedDataObject[properties.index] || JSON.stringify(cachedDataObject[properties.index]) !== JSON.stringify(properties.data)) {
            this.set(properties);
            return true;
          }
        }
      }
      else {
        if(!$localStorage.cache[_identifier][properties.key] || $localStorage.cache[_identifier][properties.key] !== JSON.stringify(properties.data)) {
          this.set(properties);
          return true;
        }
      }
      
      return false;
    };

    function init() {
      if(!$localStorage.cache) {
        $localStorage.cache = {};
      }
    }
    
    init();
  }
]);