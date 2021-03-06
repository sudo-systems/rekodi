rekodiApp.directive('rkTabs', ['rkTabsService',
  function(rkTabsService) {
  	return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var magicLine = $(element).find('nav .magic-line:first');
        magicLine.css('left', $(element).find('nav li.active:first').position().left).data('origLeft', magicLine.position().left).data('origWidth', magicLine.width());
        var tabsContainer = $(element).find('.tabs:first').attr('data-tab', 0);

        $(element).find('nav:first li').on('click', function(e) {
          e.preventDefault();

          rkTabsService.setActiveTab($(this).attr('data-rel'));

          $(element).find('nav li.active:first').removeClass('active');
          $(this).addClass('active');
          tabsContainer.attr('data-tab', $(this).index());

          var leftPos = $(this).position().left;
          var newWidth = $(this).width();

          magicLine.stop().animate({
            left: leftPos,
            width: newWidth
          }, 400);
        });
      }
  	};
  }
]);
