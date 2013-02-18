define([
	
	
	'backbone',
	'grid/mixins/data-options'
	
], function(Backbone, DataOptionsMixin) {
	
	var Item = Backbone.View.extend({
		
		className: 'grid-item',
		
		options: {
			preserveAspectRatio: true
		},
		
		initialize: function() {
			this.parseOptions();
		},
		
		resize: function(size) {
			
			var width = size.width - this.getOffset();
			
			this.$el.width(Math.floor(width));
			
			if(this.options.preserveAspectRatio) {
			
				var height = width * this.getAspectRatio();
				
				this.$el.height(Math.floor(height));
			}
			
			return this;
		},
		
		getOffset: function() {
			
			var offset = this.$el.outerWidth(true) - this.$el.width();
			
			return offset;
		},
		
		getAspectRatio: function() {
			return this.options.height / this.options.width;
		},
		
		position: function(position) {
			
			this.$el.css({
				'top': position.top || 0,
				'left': position.left || 0
			});
			
			return this;
		},
		
		render: function() {
			
			var self = this;
			
			this.$el.css('position', 'absolute');
			
			return this;
		}
	});
	
	_.extend(Item.prototype, DataOptionsMixin);
	
	return Item;	
});
