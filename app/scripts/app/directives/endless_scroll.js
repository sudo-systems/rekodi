rekodiApp.directive('rkEndlessScroll', ['$timeout',
  function($timeout) {
  	return {
      restrict: 'A',
      scope: {
        rkEndlessScroll: '&',
        rkEndlessScrollOffset: '@'
      },
      link: function(scope, element, attrs) {
        var elementHeight = element.outerHeight();
        var angularElement = angular.element(element);
        scope.rkEndlessScrollOffset = (!scope.rkEndlessScrollOffset)? 20 : parseInt(scope.rkEndlessScrollOffset);
        
        if((angularElement.scrollHeight - angularElement.scrollTop) >= (elementHeight + scope.rkEndlessScrollOffset)) {
          scope.rkEndlessScroll();
        }

        angularElement.bind('scroll', function() {
          var scrollPosition = (this.scrollHeight - this.scrollTop);

          if(scrollPosition === elementHeight) {
            scope.rkEndlessScroll();
          }
          
       });
      }
  	};
  }
]);
