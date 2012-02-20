/*

	jQuery Tags Input Plugin 2.0
	
	Copyright (c) 2012 XOXCO, Inc
	
	Documentation for this plugin lives here:
	http://xoxco.com/clickable/jquery-tags-input
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php

	ben@xoxco.com

	GOALS FOR 2.0
	
	Fix identifier issue - should work with any valid jquery selector
	Make internationalization friendly
	add tag input validation
	make sure autocomplete works with newest jquery


*/

(function($) {

	var internal_counter = 0; // this is used to create unique ids for each tag input
	$.fn.doAutosize = function(o){
	    var minWidth = $(this).data('minwidth'),
	        maxWidth = $(this).data('maxwidth'),
	        val = '',
	        input = $(this),
	        testSubject = $('#'+$(this).data('tester_id'));
	
	    if (val === (val = input.val())) {return;}
	
	    // Enter new content into testSubject
	    var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	    testSubject.html(escaped);
	    // Calculate new width + whether to change
	    var testerWidth = testSubject.width(),
	        newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
	        currentWidth = input.width(),
	        isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
	                             || (newWidth > minWidth && newWidth < maxWidth);
	
	    // Animate width
	    if (isValidWidthChange) {
	        input.width(newWidth);
	    }


  };
  $.fn.resetAutosize = function(options){
    // alert(JSON.stringify(options));
    var minWidth =  $(this).data('minwidth') || options.minInputWidth || $(this).width(),
        maxWidth = $(this).data('maxwidth') || options.maxInputWidth || ($(this).closest('.tagsinput').width() - options.inputPadding),
        val = '',
        input = $(this),
        testSubject = $('<tester/>').css({
            position: 'absolute',
            top: -9999,
            left: -9999,
            width: 'auto',
            fontSize: input.css('fontSize'),
            fontFamily: input.css('fontFamily'),
            fontWeight: input.css('fontWeight'),
            letterSpacing: input.css('letterSpacing'),
            whiteSpace: 'nowrap'
        }),
        testerId = $(this).attr('id')+'_autosize_tester';
    if(! $('#'+testerId).length > 0){
      testSubject.attr('id', testerId);
      testSubject.appendTo('body');
    }

    input.data('minwidth', minWidth);
    input.data('maxwidth', maxWidth);
    input.data('tester_id', testerId);
    input.css('width', minWidth);
  };
  
	$.fn.addTag = function(value,options) {
			options = jQuery.extend({focus:false,callback:true},options);
			this.each(function() { 

				var settings = $(this).data('settings');

				var tagslist = $(this).val().split(settings.delimiter);
				if (tagslist[0] == '') { 
					tagslist = new Array();
				}

				value = jQuery.trim(value);
		
				if (options.unique) {
					var skipTag = $(tagslist).tagExist(value);
					if(skipTag == true) {
					    //Marks fake input as not_valid to let styling it
    				    $(settings.fake_input).addClass('not_valid');
    				    if (settings.onError) {
    				    	var f = settings.onError;
    				    	f.call(this,'duplicate');
    				    }
    				}
				} else {
					var skipTag = false; 
				}
				
				if (settings.validateTag) {
					var f = settings.validateTag;
					if (!f.call(this,value)) {
						skipTag = true;
    				    $(settings.fake_input).addClass('not_valid');
    				    if (settings.onError) {
    				    	var f = settings.onError;
    				    	f.call(this,'validation');
    				    }

					}
				}
				
				if (value !='' && skipTag != true) { 
                    $('<span>').addClass('tag').append(
                        $('<span>').text(value).append('&nbsp;&nbsp;'),
                        $('<a>', {
                            href  : '#',
                            title : settings.removeText,
                            text  : 'x'
                        }).click(function () {
                            return $(settings.real_input).removeTag(escape(value));
                        })
                    ).insertBefore(settings.fake_input);

					tagslist.push(value);
				
					$(settings.fake_input).val('');
					if (options.focus) {
						$(settings.fake_input).focus();
					} else {		
						$(settings.fake_input).blur();
					}
					
				
					$.fn.tagsInput.updateTagsField(this,tagslist);
					
					if (settings.onAddTag) {
						var f = settings.onAddTag;
						f.call(this, value);
					}
					if(settings.onChange)
					{
						var i = tagslist.length;
						var f = settings.onChange;
						f.call(this, $(this), tagslist[i-1]);
					}					
				}
		
			});		
			console.log('added tag');
			return false;
		};
		
	$.fn.removeTag = function(value) { 
			value = unescape(value);
			this.each(function() { 
				console.log("Remove tag " + value);
				var settings = $(this).data('settings');	
				var old = $(this).val().split(settings.delimiter);
					
				$(settings.holder + ' .tag').remove();
				str = '';
				for (i=0; i< old.length; i++) { 
					if (old[i]!=value) { 
						str = str + settings.delimiter +old[i];
					}
				}
				
				$.fn.tagsInput.importTags(this,str);

				if (settings.onRemoveTag) {
					var f = settings.onRemoveTag;
					f.call(this, value);
				}
			});
					
			return false;
		};
	
	$.fn.tagExist = function(val) {
		return (jQuery.inArray(val, $(this)) >= 0); //true when tag exists, false when not
	};
	
	// clear all existing tags and import new ones from a string
	$.fn.importTags = function(str) {
		var settings = $(this).data('settings');
		$(settings.holder + ' .tag').remove();
		$.fn.tagsInput.importTags(this,str);
	}
		
	$.fn.tagsInput = function(options) { 
	    var settings = jQuery.extend({
	      interactive:true,
	      defaultText:'add a tag',
	      removeText:'Remove Tag',
	      minChars:0,
	      width:'auto',
	      minHeight:'100px',
	      height: 'auto',
	      autocomplete: {selectFirst: false },
	      'hide':true,
	      'delimiter':',',
	      'unique':true,
	      removeWithBackspace:true,
	      placeholderColor:'#666666',
	      autosize: true,
	      comfortZone: 20,
	      inputPadding: 6*2,
	      onChange: null, // events and handlers
	      onAddTag: null,
	      onRemoveTag: null,
	      validateTag: null,
	      onError: null
	    },options);

		this.each(function() { 
			if (settings.hide) { 
				$(this).hide();				
			}
				
	
			var id = internal_counter++;
			
			var data = jQuery.extend({
				pid:id,
				real_input: this,
				holder: '#'+id+'_tagsinput',
				input_wrapper: '#'+id+'_addTag',
				fake_input: '#'+id+'_tag'
			},settings);

			$(this).addClass('tagsinput_processed');
		
			var markup = '<div id="'+id+'_tagsinput" class="tagsinput"><div id="'+id+'_addTag" class="tagsinput_inputwrapper">';
			
			if (settings.interactive) {
				markup = markup + '<input id="'+id+'_tag" value="" data-default="'+settings.defaultText+'" />';
			}
			
			markup = markup + '</div><div class="tags_clear"></div></div>';
			
			$(markup).insertAfter(this);

			$(data.holder).css('width',settings.width);
			$(data.holder).css('height',settings.height);
			$(data.holder).css('min-height',settings.minHeight);

			// store the settings with the DOM object so we can use them in other functions
			$(this).data('settings',data);

	
			if ($(this).val()!='') { 
				$.fn.tagsInput.importTags($(this),$(this).val());
			}



					
			if (settings.interactive) { 
				$(data.fake_input).val($(data.fake_input).attr('data-default'));
				$(data.fake_input).css('color',settings.placeholderColor);
		        $(data.fake_input).resetAutosize(settings);
		
		
				// if the user clicks anywhere in the tag box, focus the input field
				$(data.holder).bind('click',data,function(event) {
					$(event.data.fake_input).focus();
				});
			
				// if the user clicks in the input field…
				$(data.fake_input).bind('focus',data,function(event) {
					// empty the field
					if ($(event.data.fake_input).val()==$(event.data.fake_input).attr('data-default')) { 
						$(event.data.fake_input).val('');
					}
					// set the field to the active color
					$(event.data.fake_input).css('color','#000000');		
				});
			
				// if an autocomplete url has been specified, do some stuff...			
				if (settings.autocomplete_url != undefined) {
					autocomplete_options = {source: settings.autocomplete_url};
					for (attrname in settings.autocomplete) { 
						autocomplete_options[attrname] = settings.autocomplete[attrname]; 
					}
				
					if (jQuery.Autocompleter !== undefined) {
						$(data.fake_input).autocomplete(settings.autocomplete_url, settings.autocomplete);
						$(data.fake_input).bind('result',data,function(event,data,formatted) {
							if (data) {
								$('#'+id).addTag(data[0] + "",{focus:true,unique:(settings.unique)});
							}
					  	});
					} else if (jQuery.ui.autocomplete !== undefined) {
						$(data.fake_input).autocomplete(autocomplete_options);
						$(data.fake_input).bind('autocompleteselect',data,function(event,ui) {
							$(event.data.real_input).addTag(ui.item.value,{focus:true,unique:(settings.unique)});
							return false;
						});
					}
				
					
				} else {
						// if a user tabs out of the field, create a new tag
						// this is only available if autocomplete is not used.
						$(data.fake_input).bind('blur',data,function(event) { 
							var d = $(this).attr('data-default');
							if ($(event.data.fake_input).val()!='' && $(event.data.fake_input).val()!=d) { 
								if( (event.data.minChars <= $(event.data.fake_input).val().length) && (!event.data.maxChars || (event.data.maxChars >= $(event.data.fake_input).val().length)) )
									$(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true,unique:(settings.unique)});
							} else {
								$(event.data.fake_input).val($(event.data.fake_input).attr('data-default'));
								$(event.data.fake_input).css('color',settings.placeholderColor);
							}
							return false;
						});
				
				}

				// if user types a comma, create a new tag
				$(data.fake_input).bind('keypress',data,function(event) {
					if (event.which==event.data.delimiter.charCodeAt(0) || event.which==13 ) {
					    event.preventDefault();
						if( (event.data.minChars <= $(event.data.fake_input).val().length) && (!event.data.maxChars || (event.data.maxChars >= $(event.data.fake_input).val().length)) )
							$(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true,unique:(settings.unique)});
					  	$(event.data.fake_input).resetAutosize(settings);
						return false;
					} else if (event.data.autosize) {
			            $(event.data.fake_input).doAutosize(settings);
            
          			}
				});

				//Delete last tag on backspace
				data.removeWithBackspace && $(data.fake_input).bind('keydown',data, function(event)
				{
					if(event.keyCode == 8 && $(this).val() == '')
					{
						 event.preventDefault();
						 var last_tag = $(this).closest('.tagsinput').find('.tag:last').text();
						 last_tag = last_tag.replace(/[\s]+x$/, '');
						 $(data.real_input).removeTag(escape(last_tag));
						 $(this).trigger('focus');
					}
				});
				$(data.fake_input).blur();
				
				//Removes the not_valid class when user changes the value of the fake input
				if(data.unique || data.validateTag) {
				    $(data.fake_input).keydown(function(event){
				        if(event.keyCode == 8 || String.fromCharCode(event.which).match(/\w+|[áéíóúÁÉÍÓÚñÑ,/]+/)) {
				            $(this).removeClass('not_valid');
				        }
				    });
				}
			} // if settings.interactive
			//return false;
		});
			
		return this;
	
	};
	
	$.fn.tagsInput.updateTagsField = function(obj,tagslist) { 
		var settings = $(obj).data('settings');
		$(obj).val(tagslist.join(settings.delimiter));
	};
	
	$.fn.tagsInput.importTags = function(obj,val) {			
		var settings = $(obj).data('settings');
		$(obj).val('');
		var tags = val.split(settings.delimiter);
		for (i=0; i<tags.length; i++) { 
			$(obj).addTag(tags[i],{focus:false,callback:false});
		}
		if(settings.onChange)
		{
			var f = settings.onChange;
			f.call(obj, obj, tags[i]);
		}
	};

})(jQuery);
