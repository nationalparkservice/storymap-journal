define(["dojo/topic"], function(topic) {
  /*
   * Custom Javascript to be executed while the application is initializing goes here
   */
  
  function addKeyNavigationToNavigationControls() {
    var swipperSelectors = $('.navDots').find('.navDotsNav, .dot, .navGroup');
    addButtonFeaturesToButtonLikeElements(swipperSelectors);
    //hide tooltips when clicking on navigation control
    //tooltips get shown when control gets focus - good for keyboard users, but not for mouse users
    swipperSelectors.on('click', function(e) {
      $(e.target).tooltip('hide');
      setTimeout(function() {$('.section.active .title').filter(':visible').focus()},10);
      //Swiper needs a 300+ms timeout to allow slide transition to complete
      setTimeout(function() {$('.section.swiper-slide-active .title').filter(':visible').focus()},400);
    });
    //Make the section title focusable, but only programatically
    // do not show the focus ring on this non-interactive elements
    $('.section .title').attr('tabindex', '-1').css('outline', 'none');
    
    addArrowKeysToNavControl();
  }
  
  function addArrowKeysToNavControl() {
    var $container = $('.navDotsInner');
    $container.on('keydown', function (e) {
      if (e.keyCode !== 38 && e.keyCode !== 40) {
        return;
      } //Up and down arrow keys
      var delta = (e.keyCode === 38) ? -1 : 1;
      var $focusableElements = $container.find('[tabindex]').not('.disabled');
      var currentIndex = $focusableElements.index(document.activeElement);
      if (currentIndex === -1) {
        return;
      }
      var newIndex = currentIndex + delta;
      if (newIndex < 0) {
        newIndex = 0;
      }
      if ($focusableElements.length <= newIndex) {
        newIndex = $focusableElements.length - 1;
      }
      $focusableElements.eq(newIndex).focus();
      return false;
    });
  }
  
  function escapeKeyDefaultsToNavigationControl() {
    $('body').on('keydown', function (e) {
      if (e.keyCode === 27) {  //escape
        $('div.dot.active').focus();
        //return false;  // The key handler for colorbox will need to see this as well.
      }
    });
  }
  
  function addButtonFeaturesToButtonLikeElements($selection)
  {
    $selection
      .attr("tabindex", "0")
      .attr("role", "button")
      .on('keydown', function (e) {
        if (e.keyCode === 32 || e.keyCode === 13) {
          $(e.target).click();
          return false;
        }
      })
      .each(function() {
        var title = $(this).attr('title');
        if (title) {$(this).attr('aria-label', title)}
      });
  }
  
  function addRefocusEventsToAvoidLostFocus() {
    //Scroll before first
    //var controlElement = $('div.navDotsUp')
    $('div.navDotsUp').on('blur', function (e) {
      if ($(e.target).hasClass('disabled')) {
        $('div.dots :first-child').focus();
      }
    });
    //Scroll after last
    //controlElement = $('div.navDotsDown')
    $('div.navDotsDown').on('blur', function (e) {
      if ($(e.target).hasClass('disabled')) {
        $('div.dots :last-child').focus();
      }
    });
  }
  
  function makeHeaderElementsFirstInTabOrder()
  {
    $('.header').find('a[href], button, [tabindex]').filter(':visible').attr('tabindex', '1');
  }
  
  function makeNavigationElementsSecondInTabOrder()
  {
    $('.navDots').find('.navDotsNav, .dot, .navGroup').attr('tabindex', '2');
  }
  
  function addJumpToMainStageAtBottomOfActiveSection(index) {
    $('#skipper').remove();
    var mediatype = app.data.getStoryByIndex(index).media.type;
    if (mediatype === 'image') return;
    var inSidePanel = $('#sidePanel').filter(':visible').length > 0;
    if (inSidePanel && app.data.getStoryLength()-1 <= index) return;
    var skippy = $('<a id="skipper" class="media-skipper sr-only sr-only-focusable" href="#"><span class="skiplink-text">Jump to ' + mediatype + '</span></a>');
    skippy.click(function() {
      $('#mainStagePanel').find('.mainMediaContainer.active')
        .find('a[href], [tabindex], button, input, textarea, select, object, iframe')
        .filter(':visible:first').focus();
    });
    $('.section.active').filter(':visible').find('.social').after(skippy);
    $('.section.swiper-slide-active').filter(':visible').find('.social').after(skippy);
  }
  
  function addKeyNavigationAlert() {
    var notice = $('<p id="keyNavNotice" class="sr-only sr-only-focusable" tabindex="1">Use the escape key at anytime to jump to the navigation controls.</p>');
    notice.css('padding', '3px').css('margin-left', '15px').css('outline', 'none');
    notice.blur(function() {
      //notice.removeAttr("tabindex");
      notice.remove();
    });
    $('body').prepend(notice)
  }
  
  // The application is ready
  topic.subscribe("tpl-ready", function(){
    /*
     * Custom Javascript to be executed when the application is ready goes here
     */
    
    addKeyNavigationToNavigationControls();
    topic.subscribe("story-navigation-control-update", addKeyNavigationToNavigationControls);
    escapeKeyDefaultsToNavigationControl();
    
    // The 'scroll to see more' control $('.scrollInner') does not need key focus, just go straight to Nav controls
    
    // Back Button appears over the map after a main stage action
    addButtonFeaturesToButtonLikeElements($('.backButton'));
    
    // Add key navigation to social links
    addButtonFeaturesToButtonLikeElements($('.share_facebook, .share_twitter'));  //.share_bitly already a button
    
    // Add key navigation to main stage actions (these anchor elements have no href)
    addButtonFeaturesToButtonLikeElements($('a[data-storymaps]'));
    
    // Add key control to image 'view-fullsize' control
    var viewImageFullsizeControl = $('.image-wrapper .btn-fullscreen');
    addButtonFeaturesToButtonLikeElements(viewImageFullsizeControl);
    
    // Add key control to all mobile controls (needed for embed mode)
    addButtonFeaturesToButtonLikeElements($('#mobileView').find('p.help-embed, div.embed-btn, span.embed-btn2'));
    
    addRefocusEventsToAvoidLostFocus();
    
    makeHeaderElementsFirstInTabOrder();
    
    makeNavigationElementsSecondInTabOrder(); // Required for floatingPanel
    topic.subscribe("story-navigation-control-update", makeNavigationElementsSecondInTabOrder);
    
    addJumpToMainStageAtBottomOfActiveSection(0);
    topic.subscribe('story-navigated-to-section', addJumpToMainStageAtBottomOfActiveSection);
    
    addKeyNavigationAlert();
  });
});