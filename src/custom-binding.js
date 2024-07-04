import ko from 'knockout';

ko.bindingHandlers.draggable = {
  init: function(element, valueAccessor) {
    element.draggable = true;
    element.addEventListener('dragstart', function(event) {
      const value = valueAccessor();
      const params = ko.unwrap(value);
      if (params && typeof params.dragstart === 'function') {
        params.dragstart.call(params.context, params.data, event);
      }
    });
  }
};

ko.bindingHandlers.droppable = {
  init: function(element, valueAccessor) {
    element.addEventListener('dragover', function(event) {
      event.preventDefault();
      const value = valueAccessor();
      const params = ko.unwrap(value);
      if (params && typeof params.dragover === 'function') {
        params.dragover.call(params.context, params.data, event);
      }
    });

    element.addEventListener('drop', function(event) {
      event.preventDefault();
      const value = valueAccessor();
      const params = ko.unwrap(value);
      if (params && typeof params.drop === 'function') {
        params.drop.call(params.context, params.data, event);
      }
    });
  }
};
