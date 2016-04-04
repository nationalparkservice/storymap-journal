define([], function () {

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
      });
      //TODO: add appropriate aria-label
  }

  function panMap(direction, percent)
  {
    var oldCenter = app.map.extent.getCenter();
    var deltaX = app.map.extent.getWidth() * percent;
    var deltaY = app.map.extent.getHeight() * percent;
    if (direction == 'up') {
      app.map.centerAt(oldCenter.offset(0,+deltaY));
    }
    else if (direction == 'down') {
      app.map.centerAt(oldCenter.offset(0,-deltaY));
    }
    else if (direction == 'left') {
      app.map.centerAt(oldCenter.offset(-deltaX, 0));
    }
    else if (direction == 'right') {
      app.map.centerAt(oldCenter.offset(+deltaX, 0));
    }
  }

  function mapKeyboardHandler(e)
  {
    if (! app.map) {return}
    var panPercent = e.shiftKey ? 0.25 : 0.05;
    switch(e.keyCode) {
      case 36: //home = zoom original extents
        //$('div.mapCommandHomeBtn').parent().click();
        app.map.setExtent(app.map._params.extent);
        return false;
      case 37: //left arrow = pan left
        panMap('left', panPercent);
        return false;
      case 38: //up arrow = pan up
        panMap('up', panPercent);
        return false;
      case 39: //right arrow = pan right
        panMap('right', panPercent);
        return false;
      case 40: //down arrow = pan down
        panMap('down', panPercent);
        return false;
      case 187: //+/= = zoom in
        app.map.setZoom(app.map.getZoom() + 1);
        return false;
      case 189: //-/_ = zoom out
        app.map.setZoom(app.map.getZoom() - 1);
        return false;
    }
  }

  var _initializedMaps = {};

  function addKeyNavigationToMap(map) {
    //Only do this once per map.
    if (_initializedMaps.hasOwnProperty(map.id)) {return}
    _initializedMaps[map.id] = true;

    map.disableKeyboardNavigation();

    var $container = $(map.container);

    //IE focuses on the SVG layers in the map div if this is not set
    $container.find('svg').attr("focusable", "false");

    //Make map controls act like buttons
    var selectors =
      "span.esriAttribution," +
      "div.logo-med, " +
      "div.esriSimpleSliderIncrementButton, " +
      "div.esriSimpleSliderDecrementButton, " +
      "div.mapCommandLocation";
    addButtonFeaturesToButtonLikeElements($container.find(selectors));

    //Add Map navigation keyboard shortcuts
    $container.on('keydown.keyNav', mapKeyboardHandler);

    // TODO: .esriAttribution should only act like a button when it is expandable (more text than shown).
    // However, this changes with viewport size and layers shown at a given extents/zoom scale.
    // Esri maintains this internal to the map, and does not provide an API to monitor this.
    // As a hack, I could monitor the css cursor property: default => not expandable, pointer => expandable.
    // Consider using https://github.com/RickStrahl/jquery-watch or a just MutationObserver.
  }

  return {
    addKeyNavigationToMap:addKeyNavigationToMap
  };
});



