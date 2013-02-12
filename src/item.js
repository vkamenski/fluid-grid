define([
	
	
	'backbone',
	'image-loader',
	'mixins/data-options'
	
], function(Backbone, imageLoader, DataOptionsMixin) {
	
	var Item = Backbone.View.extend({
		
		optionsPrefix: 'fluidGrid',
		
		initialize: function() {
			this.parseOptions();
		},
		
		resize: function(size, keepAspectRatio) {
			
			var width = size.width - this.getOffset();
			
			this.$el.width(Math.floor(width));
			
			if(keepAspectRatio) {
				
				var height = width * this.getAspectRation();
				
				this.$el.height(Math.floor(height));
			}
			
			return this;
		},
		
		getOffset: function() {
			
			var offset = this.$el.outerWidth(true) - this.$el.width();
			
			return offset;
		},
		
		getAspectRation: function() {
			return this.options.height / this.options.width;
		},
		
		position: function(position) {
			
			this.$el.css({
				top: position.top || 0,
				left: position.left || 0
			});
			
			return this;
		},
		
		render: function() {
			
			var self = this;
			
			this.$el.css('position', 'absolute');
			
			this.$el.find('img').each(function(i, image) {
				
				imageLoader.load(image).then(function(img) {
					
					self.$el.removeClass('loading');
				});
			});
			
			return this;
		}
	});
	
	_.extend(Item.prototype, DataOptionsMixin);
	
	return Item;	
});
