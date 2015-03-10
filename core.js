;(function(root, factory) {
   if (typeof exports === 'object') {
      // CommonJS
      module.exports = factory(require('jquery'));
   }
   else if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module
      define(['jquery'], factory);
   } else {
      // Browser globals
      factory(root.jQuery);
   }
}(this, function($) {
   'use strict';

   var $element;
   var elementData = {};
   var delimiter = [];
   var delimiterRegex = '/[\s,]+/';
   var tagsCallbacks = [];

   // Default options
   var options = {};
   var defaults = {
      // Config
      interactive: true,
      defaultText: 'add a tag',
      minChars: 0,
      delimiter: [',', ';'],
      joinDelimiter: ',',
      unique: true,
      removeWithBackspace: true,

      // UI
      width: '300px',
      height: '100px',
      hide: true,
      placeholderColor: '#666666',
      autosize: true,
      comfortZone: 20,
      inputPadding: 6 * 2,

      // Autocomplete
      autocomplete: {
         selectFirst: true
      }

      // Hooks
   };

   // Constructor, initialize everything you need here
   var Plugin = function(element, options) {
      this.element = element;
      this.options = options;
   };

   // Private functions
   var _hide = function() {
      $element.hide();
   }

   var _generateId = function() {
      var id = $element.attr('id');
      if (!id || delimiter[id]) {
         id = 'tags' + new Date().getTime();
         $element.attr('id', id);
      }

      return id;
   }

   var _updateDelimiterRegex = function() {
      var matchString = '';
      $.each(options.delimiter, function(index, val) {
         matchString = matchString + val;
      });
      var regexString = '[\\s' + matchString + ']+';
      delimiterRegex = new RegExp(regexString, 'i');
   }

   var _displayMarkup = function() {
      var id = $element.attr('id');
      var markup = '<div id="' + id + '_tagsinput" class="tagsinput"><div id="' + id +'_addTag">';

      if (options.interactive) {
         markup = markup + '<input id="' + id + '_tag" value="" data-default="' + options.defaultText + '" />';
      }

      markup = markup + '</div><div class="tags_clear"></div></div>';
      $(markup).insertAfter($element);

      // Apply CSS options to the markup
      $(elementData.holder).css('width', options.width);
      $(elementData.holder).css('min-height', options.height);
      $(elementData.holder).css('height', '100%');
   }

   var _importTags = function(str) {
      var id = $element.attr('id');
      $('#' + id + '_tagsinput .tag').remove();
      methods['importTags']($element, str);
   }

   var _updateTagsField = function(tags) {
      var id = $element.attr('id');
      $element.val(tags.join(options.joinDelimiter));
   }

   var _checkDelimiter = function(e) {
      if (e.which === 13) {
         return true;
      }

      $.each(e.data.delimiter, function(index, value) {
         console.log(value);
      });
   }

   var methods = {
      init: function(opts) {
         // Do a deep copy of the options
         options = $.extend(true, {}, defaults, opts);

         this.each(function() {
            $element = $(this);

            // Hide the element if the option is set
            if (options.hide) {
               _hide();
            }

            // Generate an ID for the element if it does not have one
            var id = _generateId();

            // Create the delimiter data object
            elementData = jQuery.extend({
               pid            : id,
               realInput      : '#' + id,
               holder         : '#' + id + '_tagsinput',
               inputWrapper   : '#' + id + '_addTag',
               fakeInput      : '#' + id + '_tag'
            }, options);
            delimiter[id] = elementData.delimiter;

            // Modify the delimiter regex if need be
            _updateDelimiterRegex();

            // Setup and show the markup
            _displayMarkup();

            if (options.interactive) {
               $(elementData.fakeInput).bind('keypress', elementData, function(e) {
                  if (_checkDelimiter(e)) {
                     console.log(1);
                  } else {
                     console.log(2);
                  }
               });
            }
         });
      },

      importTags: function(obj, val) {
         var $obj = $(obj);
         var id = $obj.attr('id');
         var tags = val.split(delimiterRegex);

         for (var i = 0; i < tags.length; i++) {
            methods['addTag'](obj, tags[i], {focus: false, callback: false});
         }

         if(tagsCallbacks[id] && tagsCallbacks[id]['onChange']) {
            var func = tagsCallbacks[id]['onChange'];
            func.call(obj, obj, tags[i]);
         }
      },

      tagExists: function(elem, value) {
         var $elem = $(elem);
         var id = $elem.attr('id');
         var tags = $elem.val().split(delimiterRegex);
         return (jQuery.inArray(value, tags) >= 0);
      },

      addTag: function(elem, value, opts) {
         var $elem = $(elem);
         var defaultOpts = {
            focus: false,
            callback: false
         };
         opts = jQuery.extend(defaultOpts, opts);

         $elem.each(function() {
            var $self = $(this);
            var id = $self.attr('id');
            var tags = $self.val().split(delimiterRegex);

            if (tags[0] === '') {
               tags = [];
            }

            // Trim the new tag before continuing
            value = jQuery.trim(value);

            // Check for uniqueness if this option is enabled
            var skipTag = false;
            if (options.unique) {
               skipTag = methods['tagExists'](elem, value);
               if (skipTag) {
                  // @TODO: Move these into an elements holder
                  $('#' + id + '_tag').addClass('not_valid');
               }
            }

            // Add the tag
            if (value !== '' && skipTag === false) {
               // Create the remove tag element
               var anchorTagAttrs = {
                  href: '#',
                  title: 'Remove tag',
                  text: 'x'
               };
               var anchorTag = $('<a>', anchorTagAttrs).click(function(e) {
                  return methods['removeTag', id, escape(value)];
               });

               // Create the inner span element
               var innerSpan = $('<span>')
                  .text(value)
                  .append('&nbsp;&nbsp;');

               // Create the outer span element
               var outerSpan = $('<span>')
                  .addClass('tag')
                  .append(innerSpan, anchorTag)
                  .insertBefore('#' + id + '_addTag');

               // Add the tag to the tag list
               tags.push(value);

               // Clear the input box and set the focus based on the options
               $('#' + id + '_tag').val('');
               if (options.focus) {
                  $('#' + id + '_tag').focus();
               } else {
                  $('#' + id + '_tag').blur();
               }

               // Update the hidden tags field
               _updateTagsField(tags);

               // @TODO: Callbacks
               // if (options.callback && tags_callbacks[id] && tags_callbacks[id]['onAddTag']) {
               //    var f = tags_callbacks[id]['onAddTag'];
               //    f.call(this, value);
               // }
               // if(tags_callbacks[id] && tags_callbacks[id]['onChange'])
               // {
               //    var i = tagslist.length;
               //    var f = tags_callbacks[id]['onChange'];
               //    f.call(this, $(this), tagslist[i-1]);
               // }
            }
         });

         return false;
      }
   };

   // Create the jQuery plugin
   $.fn.tagsInput = function(methodOrOptions) {
      // Call method if it exists
      if (methods[methodOrOptions]) {
         var args = Array.prototype.slice.call(arguments, 1);
         var id = $(this).attr('id');
         args.splice(0, 0, '#' + id);
         return methods[methodOrOptions].apply(this, args);
      }
      else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
         // Default to init
         return methods.init.apply(this, arguments);
      }
      else {
         $.error( 'jQueryTagsInput method "' +  methodOrOptions + '" does not exist' );
      }
      console.log(methods);
      return false;

      // Do a deep copy of the options
      options = $.extend(true, {}, defaults, options);

      console.log(options);

      return this.each(function() {
         var $this = $(this);
         // Create a new instance for each element in the matched jQuery set
         // Also save the instance so it can be accessed later to use methods/properties etc
         // e.g.
         //    var instance = $('.element').data('plugin');
         //    instance.someMethod();
         $this.data('tagsinput', new Plugin($this, options));
      });
   };

   // Expose defaults and Constructor (allowing overriding of prototype methods for example)
   $.fn.tagsInput.defaults = defaults;
   $.fn.tagsInput.Plugin = Plugin;
}));
