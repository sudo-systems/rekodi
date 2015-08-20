rekodiApp.directive('endlessScroll', ['$window',
  function($window) {
  	return {
      restrict: 'A',
      scope: {
        endlessScroll: '&',
        endlessScrollOffset: '@offset',
        endlessScrollCheck: '@autoCheck'
      },
      link: function(scope, element, attrs) {
        var elementHeight, currentScrollHeight, triggerPoint;
        var _element = angular.element(element);
        var _window = angular.element($window);
        var currentScrollHeight = _element.scrollHeight;
        var eventFired = false;
        var offset = (!scope.offset)? 20 : scope.offset;
        var autoCheckInterval = 1000;
        var autoCheck = (!scope.autoCheck)? true : scope.autoCheck;

        function setHeightRelatedVariables() {
          elementHeight = element.outerHeight();
          triggerPoint = (parseInt(elementHeight) + parseInt(offset));
          currentScrollHeight = _element.scrollHeight;
        }
        
        function testConditions(eventElement) {
          var scrollPosition = (eventElement.scrollHeight - eventElement.scrollTop);

          if(currentScrollHeight !== eventElement.scrollHeight) {
            currentScrollHeight = eventElement.scrollHeight;
            eventFired = false;
          }

          if(scrollPosition <= triggerPoint && !eventFired) {
            scope.endlessScroll();
            eventFired = true;
          }
        }
        
        function initAutoCheck() {
          if(autoCheck) {
            setInterval(function() {
              if(autoCheck) {
                testConditions(_element);
              }
            }, autoCheckInterval);
          }
        }
       
        function init() {
          setHeightRelatedVariables();
          initAutoCheck();

          _element.bind('scroll', function() {
            testConditions(this);
          });
          
          _window.bind('resize', function() {
            setHeightRelatedVariables();
            testConditions(_element);
          });
        }
        
        init();
      }
  	};
  }
]);
