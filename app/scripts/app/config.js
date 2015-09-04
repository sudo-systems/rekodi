rekodiApp.config(['uiSelectConfig', '$translateProvider',
  function(uiSelectConfig, $translateProvider) {
    uiSelectConfig.theme = 'select2';
    
    $translateProvider.translations('en', {
      TITLE: 'Hello',
      FOO: 'This is a paragraph.',
      BUTTON_LANG_EN: 'english',
      BUTTON_LANG_DE: 'german'
    });
    
    $translateProvider.translations('de', {
      TITLE: 'Hallo',
      FOO: 'Dies ist ein Paragraph.',
      BUTTON_LANG_EN: 'englisch',
      BUTTON_LANG_DE: 'deutsch'
    });
    
    $translateProvider.translations('nl', {
      TITLE: 'Hallo',
      FOO: 'Dit is een parragraaf.',
      BUTTON_LANG_EN: 'engels',
      BUTTON_LANG_DE: 'duits'
    });
    
    $translateProvider.preferredLanguage('en');
  }
]);