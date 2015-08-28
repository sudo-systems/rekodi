rekodiApp.factory('rkTabsService', ['$rootScope', '$timeout',
  function($rootScope, $timeout) {
    var activeTab = '';
    
    var initController = function(controller) {
      $rootScope.$emit(controller+'Init');
    };
    
    var navigateTo = function(tab, subTab) {
      $timeout(function() {
        angular.element('nav li[data-rel='+tab+']').trigger('click');
        
        if(subTab) {
          angular.element('nav li[data-rel='+subTab+']').trigger('click');
        }
      });
    };
    
    var setActiveTab = function(tab) {
      activeTab = tab;
    };
    
    var getActiveTab = function() {
      return activeTab;
    };
    
    return {
      initController: initController,
      navigateTo: navigateTo,
      setActiveTab: setActiveTab,
      getActiveTab: getActiveTab
    };
  }
]);