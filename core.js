/*
 * Licensed under the MIT license
 */

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
}('tagsInput', function(undefined) {
   'use strict';
   var pluginName = 'tagsInput';

   // Create our namespace
   var PluginBase = {};

   // =========================== Plugin Core
   PluginBase.Core = {
      isInit : true,
      opts : null,
      $ : null,
      delimiter : [],
      elementData : {},
      itemsArray: [],
      config: {
         tags: '.tag',
         events: {
            click: 'click.tagsInput',
            keypress: 'keypress.tagsInput',
            keydown: 'keydown.tagsInput',
            keyup: 'keyup.tagsInput',
            focusin: 'focusin.tagsInput',
            focusout: 'focusout.tagsInput',
            blur: 'blur.tagsInput',
            focus: 'focus.tagsInput',
            change: 'change.tagsInput'
         }
      },
      tagSource: 'user', // Where did the tag come from? [user, import, add, autocomplete]
      defaultOpts : {
         // Config
         defaultText: 'add a tag',
         minChars: 0,
         // delimiter: [',', ';'],
         delimiter: [','],
         delimiterRegex: '/[\s,]+/',
         alphaNumRegex: /\w+|[áéíóúÁÉÍÓÚñÑ,/]+/,
         joinDelimiter: ',',
         unique: true,
         removeWithBackspace: true,
         readOnly: false,
         maxTags: null,
         maxChars: null,   // @TODO
         caseSensitive: true,   // @TODO

         // UI
         width: '100%',
         height: '100px',
         hide: true,
         placeholderColor: '#666666',
         autosize: true,
         comfortZone: 20,
         inputPadding: 6 * 2,

         // Autocomplete
         autocomplete: {
            selectFirst: true
         },

         plugins: {},

         // @TODO: Hooks

         // General Hooks
         afterInit: function() {},

         // Add Tag Hooks
         beforeAddTag: function() {},
         afterAddTag: function() {},

         // Import Tag Hooks
         beforeImportTag: function() {},
         afterImportTag: function() {},

         // Remove Tag Hooks
         beforeRemoveTag: function() {},
         afterRemoveTag: function() {}
      }
   };

   // Sub-PLugins
   PluginBase.plugins = {
      JQueryUIAutocomplete: null,
      Autocomplete: null,
      TagSorter: null
   };
   // PluginBase.JQueryUIAutocomplete = null;
   // PluginBase.Autocomplete = null;
   // PluginBase.tagSorter = null;

   // =========================== Plugin Setup
   PluginBase.Setup = function() {
      var Plugin = this;

      // Define our abstract functions
      Plugin.addTag = function() {};
      Plugin.removeTag = function() {};
      Plugin.removeAll = function() {};
      Plugin.importTags = function() {};
      Plugin.updateTagsField = function() {};
      Plugin.tagExists = function() {};
      Plugin.destroy = function() {};
      Plugin.items = function() {};

      Plugin.run = function(options) {
         // If we've already instanciated the element, return
         if (Plugin.core.$.data('tagsinput-init-complete')) {
            return;
         }
         Plugin.core.$.data('tagsinput-init-complete', true);

         // Configure the options
         Plugin.opts = $.extend(true, {}, Plugin.core.defaultOpts, options);

         // Plugin.listen();
         Plugin.init();

         // We're done init so set the flag
         Plugin.core.isInit = false;

         // Call the afterInit callback if it's a function
         // We pass in the tags that were imported, if any, as the only parameter
         if (typeof Plugin.opts.afterInit === 'function') {
            Plugin.opts.afterInit.call(this, Plugin.core.itemsArray);
         }
      };
   };

   // =========================== Plugin Main
   PluginBase.Main = function() {
      PluginBase.Setup.call(this);
      var Plugin = this;
      this.core = PluginBase.Core;

      // ====================================================
      // PRIVATE METHODS
      // ====================================================

      var _importTags = function(tags, options) {
         var id = Plugin.core.$.attr('id');
         Plugin.core.$.val('');
         var tags = tags.split(Plugin.opts.delimiterRegex);
         if (tags.length) {
            $.each(tags, function(index, tagValue) {
               _addTag(tagValue, {});
            });
         }
      };

      var _setTagSource = function(source) {
         Plugin.core.tagSource = source;
      };

      var _addTag = function(tagValue, options) {
         var tagAdded = false;

         options = $.extend({
            skipBeforeCallback: false,
            skipAfterCallback: false
         }, Plugin.opts, options);

         // Call the "beforeAddTags" callback
         if (options.skipBeforeCallback === false && Plugin.core.isInit === false) {
            _beforeAddTagsCallback(tagValue);
         }

         // Make sure we can add the new tag
         if (_maxTagsReached()) {
            // Only show an error state if we are adding a tag, not on import.
            // On import, we'll just drop the other tags silently
            if (Plugin.core.isInit === false) {
               _displayError();
            }
            return tagAdded;
         }

         // Trim the new tag before continuing
         tagValue = jQuery.trim(tagValue);

         options = jQuery.extend({
            focus: false,
            callback: false,
            unique: false
         }, Plugin.opts, options);

         Plugin.core.$.each(function() {
            var id = Plugin.core.$.attr('id');
            // Determine if we're trying to import a string of tags or an array
            // if (typeof tags === 'string') {
            //    // tags = Plugin.core.$.val().split(Plugin.opts.delimiterRegex);
            //    tags = tags.split(Plugin.opts.delimiterRegex);
            //    if (tags[0] === '') {
            //       tags = [];
            //    }
            // }

            // Check for uniqueness if this option is enabled
            var skipTag = false;
            if (options.unique) {
               skipTag = _tagExists(tagValue);

               // Only show the error if we are not importing tags
               if (skipTag && Plugin.core.tagSource !== 'import') {
                  _displayError();
                  return;
               }
            }

            // Add the tag
            if (tagValue !== '' && skipTag === false) {
               // Create the remove tag element
               var anchorTagAttrs = {};
               if (Plugin.opts.readOnly !== true) {
                  anchorTagAttrs = {
                     href: '#',
                     title: 'Remove tag',
                     text: 'x'
                  };
               }

               // @TODO: Fix this
               var anchorTag = $('<a>', anchorTagAttrs).click(function(e) {
                  return methods['removeTag', id, escape(tagValue)];
               });

               // Create the inner span element
               var innerSpan = $('<span>')
                  .text(tagValue)
                  .attr('data-tag-value', tagValue)
                  .append('&nbsp;&nbsp;');

               // Create the outer span element
               var outerSpan = $('<span>')
                  .addClass('tag')
                  .append(innerSpan, anchorTag)
                  .insertBefore('#' + id + '_addTag');

               // Add the tag to the tag list
               Plugin.core.itemsArray.push(tagValue);

               // Clear the input box and set the focus based on the options
               $(Plugin.elementData.fakeInput).val('');
               if (options.focus) {
                  $(Plugin.elementData.fakeInput).focus();
               } else {
                  $(Plugin.elementData.fakeInput).blur();
               }
               // @TODO: Temp
               $(Plugin.elementData.fakeInput).focus();
               $(Plugin.elementData.fakeInput).val('');

               // Update the hidden tags field
               _updateTagsField(Plugin.core.itemsArray);

               tagAdded = true;

               // @TODO: Callbacks
               // if (options.callback && tags_callbacks[id] && tags_callbacks[id]['onAddTag']) {
               //    var f = tags_callbacks[id]['onAddTag'];
               //    f.call(this, tagValue);
               // }
               // if(tags_callbacks[id] && tags_callbacks[id]['onChange'])
               // {
               //    var i = tagslist.length;
               //    var f = tags_callbacks[id]['onChange'];
               //    f.call(this, $(this), tagslist[i-1]);
               // }
            }
         });

         // Call the "afterAddTags" callback
         if (options.skipBeforeCallback === false && Plugin.core.isInit === false) {
            _afterAddTagsCallback(tagValue);
         }

         return tagAdded;
      };

      var _removeTag = function(tag, options) {
         options = $.extend({
            skipBeforeCallback: false,
            skipAfterCallback: false
         }, Plugin.opts, options);

         // Call the "beforeRemoveTags" callback
         if (options.skipBeforeCallback === false) {
            _beforeRemoveTagsCallback(tag);
         }

         var str;
         tag = unescape(tag);

         Plugin.core.$.each(function() {
            var tagsString = '';
            var $self = $(this);
            var id = $self.attr('id');
            var items = Plugin.core.itemsArray;

            for (var i = 0; i < items.length; i++) {
               if (items[i] !== tag) {
                  tagsString = tagsString + items[i] + Plugin.core.delimiter[id];
               }
            }

            // Remove the last delimiter
            tagsString = tagsString.substring(0, tagsString.length - 1);

            // Remove the tag from the itemsArray and DOM
            var index;
            if (Plugin.opts.unique) {
               index = Plugin.core.itemsArray.indexOf(tag);
               if (index > -1) {
                  Plugin.core.itemsArray.splice(index, 1);
                  $(Plugin.core.$container.find('span[data-tag-value="' + tag + '"]')).parent().remove();
               }
            } else {
               $.each(itemsArray, function(index, existingTag) {
                  if (tag === existingTag) {
                     index = Plugin.core.itemsArray.indexOf(existingTag);
                     if (index > -1) {
                        Plugin.core.itemsArray.splice(index, 1);
                        $(Plugin.core.$container.find('span[data-tag-value="' + existingTag + '"]')).parent().remove();
                     }
                  }
               });
            }
         });

         // Call the "afterRemoveTags" callback
         if (options.skipAfterCallback === false) {
            _afterRemoveTagsCallback(tag);
         }
      };

      var _removeAll = function() {
         // Reset the items array
         Plugin.core.itemsArray = [];

         // Empty the hidden input
         $(Plugin.elementData.realInput).val('');

         // Remove the actual tag from the DOM
         $(Plugin.core.config.tags).remove();
      };

      var _tagExists = function(tag) {
         var id = Plugin.core.$.attr('id');
         var tagFound = false;

         // Compare the new tag against the existing tags
         if (Plugin.opts.caseSensitive) {
            tagFound = ($.inArray(tag, Plugin.core.itemsArray) >= 0);
         } else {
            // Compare the lowercase new tag against the existing tags, all in lowercase
            $.each(Plugin.core.itemsArray, function(index, existingTag) {
               if (tag.toLowerCase() === existingTag.toLowerCase()) {
                  tagFound = true;
               }
            });
         }

         return tagFound;
      };

      var _generateId = function() {
         var id = Plugin.core.$.attr('id');

         // If the element does not have an ID, generate a new one
         if (!id || Plugin.core.delimiter[id]) {
            id = 'tags' + new Date().getTime();
            Plugin.core.$.attr('id', id);
         }

         return id;
      };

      var _maxTagsReached = function() {
         // No need to check for max tags
         if (Plugin.opts.maxTags === null) { return false; }
         return (Plugin.core.itemsArray.length >= Plugin.opts.maxTags);
      };

      var _hide = function() {
         Plugin.core.$.hide();
      };

      var _displayMarkup = function() {
         var id = Plugin.core.$.attr('id');
         var markup = '<div id="' + id + '_tagsinput" class="tagsinput"><div id="' + id +'_addTag">';

         if (Plugin.opts.readOnly !== true) {
            markup = markup + '<input id="' + id + '_tag" value="" data-default="' + Plugin.opts.defaultText + '" />';
         }

         markup = markup + '</div><div class="tags_clear"></div></div>';
         $(markup).insertAfter(Plugin.core.$);

         // Apply CSS options to the markup
         $(Plugin.core.elementData.holder).css('width', Plugin.opts.width);
         $(Plugin.core.elementData.holder).css('min-height', Plugin.opts.height);
         $(Plugin.core.elementData.holder).css('height', Plugin.opts.height);
      };

      var _updateDelimiterRegex = function() {
         var matchString = '';
         $.each(Plugin.opts.delimiter, function(index, val) {
            matchString = matchString + val;
         });
         var regexString = '[\\s' + matchString + ']+';
         Plugin.opts.delimiterRegex = new RegExp(regexString, 'i');
      };

      var _validateTagLength = function(tag) {
         var valid = true;
         var tagLength = tag.length;

         // Tag is too short
         if (Plugin.opts.minChars > tagLength) {
            valid = false;
         }

         // Tag is too long
         if (Plugin.opts.maxChars && (Plugin.opts.maxChars < tagLength)) {
            valid = false;
         }

         return valid;
      };

      var _checkDelimiter = function(e) {
         var found = false;
         if (event.which == 13) {
            return true;
         }

         if (typeof Plugin.core.delimiter === 'string') {
            if (event.which == Plugin.core.delimiter.charCodeAt(0)) {
               found = true;
            }
         } else {
            $.each(Plugin.core.delimiter, function(index, delimiter) {
               if (event.which == delimiter.charCodeAt(0)) {
                  found = true;
               }
            });
         }

         return found;
      };

      var _updateTagsField = function(tagsArray) {
         var id = Plugin.core.$.attr('id');
         $(Plugin.elementData.realInput).val(tagsArray.join(Plugin.opts.joinDelimiter));
      };

      var _displayError = function() {
         Plugin.core.$fakeInput.addClass('not_valid');
      };

      var _hideError = function() {
         Plugin.core.$fakeInput.removeClass('not_valid');
      };

      var _beforeImportTagsCallback = function(tags) {
         if (typeof Plugin.opts.beforeImportTag === 'function') {
            Plugin.opts.beforeImportTag.call(this, tags, Plugin.core.itemsArray, Plugin.core.tagSource);
         }
      };

      var _afterImportTagsCallback = function(tag) {
         if (typeof Plugin.opts.afterImportTag === 'function') {
            Plugin.opts.afterImportTag.call(this, tag, Plugin.core.itemsArray, Plugin.core.tagSource);
         }
      };

      var _beforeAddTagsCallback = function(tag) {
         if (typeof Plugin.opts.beforeAddTag === 'function') {
            Plugin.opts.beforeAddTag.call(this, tag, Plugin.core.itemsArray, Plugin.core.tagSource);
         }
      };

      var _afterAddTagsCallback = function(tag) {
         if (typeof Plugin.opts.afterAddTag === 'function') {
            Plugin.opts.afterAddTag.call(this, tag, Plugin.core.itemsArray, Plugin.core.tagSource);
         }
      };

      var _beforeRemoveTagsCallback = function(tag) {
         if (typeof Plugin.opts.beforeRemoveTag === 'function') {
            Plugin.opts.beforeRemoveTag.call(this, tag, Plugin.core.itemsArray, Plugin.core.tagSource);
         }
      };

      var _afterRemoveTagsCallback = function(tag) {
         if (typeof Plugin.opts.afterRemoveTag === 'function') {
            Plugin.opts.afterRemoveTag.call(this, tag, Plugin.core.itemsArray, Plugin.core.tagSource);
         }
      };

      var _doAutosize = function() {
         var $fakeInput = $(Plugin.elementData.fakeInput);
         var minWidth = $fakeInput.data('minwidth');
         var maxWidth = $fakeInput.data('maxwidth');
         var val = '';
         var input = $fakeInput;
         var testSubject = $('#' + $fakeInput.data('tester_id'));


         if (val === (val = input.val())) {return;}

         // Enter new content into testSubject
         var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
         testSubject.html(escaped);

         // Calculate new width + whether to change
         var testerWidth = testSubject.width();
         var newWidth = (testerWidth + Plugin.opts.comfortZone) >= minWidth ? testerWidth + Plugin.opts.comfortZone : minWidth;
         var currentWidth = input.width();
         var isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth) || (newWidth > minWidth && newWidth < maxWidth);

         // Animate width
         if (isValidWidthChange) {
            input.width(newWidth);
         }
      };

      var _resetAutosize = function() {
         var $fakeInput = $(Plugin.elementData.fakeInput);
         var minWidth =  $fakeInput.data('minwidth')
            || Plugin.opts.minInputWidth
            || $fakeInput.width();

         var maxWidth = $fakeInput.data('maxwidth')
            || Plugin.opts.maxInputWidth
            || ($fakeInput.closest('.tagsinput').width() - Plugin.opts.inputPadding);

         var val = '';
         var input = $fakeInput;
         var testSubject = $('<tester/>').css({
            position: 'absolute',
            top: -9999,
            left: -9999,
            width: 'auto',
            fontSize: input.css('fontSize'),
            fontFamily: input.css('fontFamily'),
            fontWeight: input.css('fontWeight'),
            letterSpacing: input.css('letterSpacing'),
            whiteSpace: 'nowrap'
         });
         var testerId = $fakeInput.attr('id')+'_autosize_tester';

         if(! $('#'+testerId).length > 0){
            testSubject.attr('id', testerId);
            testSubject.appendTo('body');
         }

         input.data('minwidth', minWidth);
         input.data('maxwidth', maxWidth);
         input.data('tester_id', testerId);
         input.css('width', minWidth);
      };

      // ====================================================
      // PUBLIC METHODS
      // ====================================================

      Plugin.init = function() {
         // Hide the element if the option is set
         if (Plugin.opts.hide) {
            _hide();
         }

         // Generate an ID for the element if it does not have one
         var id = _generateId();

         // Create the delimiter data object
         Plugin.elementData = jQuery.extend({
            pid            : id,
            realInput      : '#' + id,
            container      : '#' + id + '_tagsinput',
            inputWrapper   : '#' + id + '_addTag',
            fakeInput      : '#' + id + '_tag'
         }, Plugin.opts);

         Plugin.core.delimiter[id] = Plugin.elementData.delimiter;

         // Modify the delimiter regex if need be
         _updateDelimiterRegex();

         // Setup and show the markup
         _displayMarkup();

         // Get the jquery objects for our elements
         Plugin.core.$realInput = $(Plugin.elementData.realInput);
         Plugin.core.$fakeInput = $(Plugin.elementData.fakeInput);
         Plugin.core.$container = $(Plugin.elementData.container);

         // Import initial tags if we have any
         var realInputValue = Plugin.core.$realInput.val()
         if (realInputValue !== '') {
            _importTags(realInputValue);
         }

         // Initialize plugin extensions
         $.each(Plugin.opts.plugins, function(pluginName) {
            if (typeof PluginBase.plugins[pluginName] !== undefined) {
               PluginBase.plugins[pluginName].init(Plugin);
            }
         });

         if (Plugin.opts.readOnly !== true) {
            // Set the default text and color
            Plugin.resetInput();

            // Setup the autosize listener
            _resetAutosize();

            // Set the focus on the field when clicking on the container
            $(Plugin.elementData.holder).bind('click', function(e) {
               Plugin.core.$fakeInput.focus();
            });

            // When the field is focused, empty it if it contains the prompt text
            Plugin.core.$fakeInput.bind('focus',function(e) {
               if (Plugin.core.$fakeInput.val() === Plugin.core.$fakeInput.attr('data-default')) {
                  $(Plugin.elementData.fakeInput).val('');
               }
               Plugin.core.$fakeInput.css('color','#000000');
            });

            Plugin.core.$fakeInput.bind(Plugin.core.config.events.keypress, function(e) {
               var $self = $(this);
               var tag = $self.val();
               // Check if the character typed is a delimiter
               if (_checkDelimiter(e)) {
                  e.preventDefault();

                  // Validate the length of the tag and add if valid
                  if (_validateTagLength(tag)) {
                     // Set the tag source
                     _setTagSource('add');

                     // Add the tag
                     _addTag(tag, {focus: true, unique: (Plugin.opts.unique)});
                     // $self.trigger('resetAutosize');
                     _resetAutosize();
                     // @TODO: Need to add this as a trigger in "listen"
                  } else {
                     // Tag is too short or too long
                     _displayError();
                  }
                  return false;
               } else if (Plugin.opts.autosize) {
                  // Plugin.core.$fakeInput.trigger('resetAutosize');
                  _doAutosize();
                     // @TODO: Need to add this as a trigger in "listen"
               }
            });

            // Autocomplete
            if (Plugin.autocomplete) {
               // @TODO: autocomplete

               // Set the tag source
               _setTagSource('autocomplete');
            } else {
               // if a user tabs out of the field, create a new tag
               // this is only available if autocomplete is not used.
               Plugin.core.$container.on(Plugin.core.config.events.blur, Plugin.core.$fakeInput, function(e) {
                  var $self = $(this);
                  var defaultText = $self.attr('data-default');

                  // If the field is not empty and does not equal the default text
                  var currentValue = Plugin.core.$fakeInput.val();
                  if (currentValue !== '' && currentValue !== defaultText) {
                     // If the text passes length validation, add it
                     if (_validateTagLength(currentValue)) {
                        var tag = $self.val();

                        // Set the tag source
                        _setTagSource('add');

                        // Add the tag
                        _addTag(tag, {focus: true, unique: (Plugin.opts.unique)});
                     }
                  } else {
                     // Reset the default text and color
                     Plugin.resetInput();
                  }
                  return false;
               });
            }

            // Delete last tag on backspace
            if (Plugin.opts.removeWithBackspace) {
               $(Plugin.elementData.fakeInput).bind(Plugin.core.config.events.keydown, function(e) {
                  // Remove the error class
                  // @TODO: Need to make sure that hitting keys such as shift, alt, control, etc...
                  // does not reset the error. Or is this overkill?
                  _hideError();

                  var $self = $(this);
                  if (e.keyCode == 8 && $self.val() == '') {
                     e.preventDefault();
                     var last_tag = $self.closest('.tagsinput').find('.tag:last').text();
                     var id = $self.attr('id').replace(/_tag$/, '');
                     last_tag = last_tag.replace(/[\s]+x$/, '');

                     // Remove the tag
                     _removeTag(escape(last_tag));
                     $self.trigger('focus');
                  }
               });
            }

            // Remove the focus from the field
            Plugin.core.$fakeInput.blur();

            // Remove the not_valid class when user changes the value of the fake input
            if (Plugin.opts.unique) {
               Plugin.core.$fakeInput.keydown(function(e) {
                  if(e.keyCode == 8 || String.fromCharCode(e.which).match(Plugin.opts.alphaNumRegex)) {
                     Plugin.core.$fakeInput.removeClass('not_valid');
                  }
               });
            }
         } // End settings.readOnly
      };

      Plugin.resetInput = function() {
         var $fakeInput = $(Plugin.elementData.fakeInput);
         $fakeInput.val( $fakeInput.attr('data-default') );
         $fakeInput.css('color', Plugin.opts.placeholderColor);
      };

      Plugin.addTag = function(tag, source) {
         source = source || 'add';
         // Set the tag source
         _setTagSource(source);
         return _addTag(tag);
      };

      Plugin.removeTag = function(tag, options) {
         _removeTag(tag, options);
      };

      Plugin.items = function() {
         return Plugin.core.itemsArray;
      };

      Plugin.removeAll = function() {
         _removeAll();
      };

      Plugin.destroy = function() {
         Plugin.core.$container.remove();
         Plugin.core.$realInput.show();
         Plugin.core.$realInput.removeData('tagsInput');
      };

      Plugin.importTags = function(tags, options) {
         options = $.extend({
            unique: false,
            skipBeforeCallback: false,
            skipBeforeAddCallback: false,
            skipAfterCallback: false,
            skipAfterAddCallback: false,
            removeAll: false
         }, Plugin.opts, options);

         // Set the tag source
         _setTagSource('import');

         // Call the "beforeImportTags" callback
         if (options.skipBeforeCallback === false) {
            _beforeImportTagsCallback(tags);
         }

         // Remove the existing tags if need be
         if (options.removeAll) {
            _removeAll();
         }

         // Create options for add function
         var addOptions = {
            unique: options.unique,
            skipBeforeCallback: options.skipBeforeAddCallback,
            skipAfterCallback: options.skipAfterAddCallback
         };

         // Import the tags one by one
         $.each(tags, function(index, tag) {
            _addTag(tag, addOptions);
         });

         // Call the "afterImportTags" callback
         if (options.skipAfterCallback === false) {
            _afterImportTagsCallback(tags);
         }
      };
   };

   $.fn.tagsInput = $.fn.tagsinput = function(methodOrOptions, methodArgs, methodOpts) {
      var results = [];

      if (methodOrOptions === 'register') {
         PluginBase.plugins[methodArgs] = new methodOpts();
      }

      this.each(function() {
         // Use an existing plugin instance from the element if we have one. If not, create a new instance
         var elementDataInstance = $(this).data('tagsInput');
         var instance = (elementDataInstance === undefined) ? new PluginBase.Main() : elementDataInstance;
         methodOpts = methodOpts || {};

         // Calling an existing method
         if (typeof methodOrOptions === 'string' && instance[methodOrOptions]) {
            var args = Array.prototype.slice.call(arguments, 1);
            var id = $(this).attr('id');
            args.splice(0, 0, methodArgs);
            args.splice(1, 0, methodOpts);
            var retVal = instance[methodOrOptions].apply(instance, args);

            if (retVal !== undefined) {
               results.push(retVal);
            }
            // return instance[methodOrOptions].apply(instance, args);
         } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            // Default to init
            instance.core.$ = $(this);
            instance.run(methodOrOptions);

            // Set the element's plugin data
            instance.core.$.data('tagsInput', instance);
         } else {
            $.error( 'jQueryTagsInput method "' +  methodOrOptions + '" does not exist' );
         }
      }).data(pluginName);

      // If we made a function call, return the results
      if (typeof methodOrOptions === 'string') {
         return results.length > 1 ? results : results[0];
      } else {
         return results;
      }
   };
}));
