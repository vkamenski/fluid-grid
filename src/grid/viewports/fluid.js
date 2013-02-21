define([
	
    'backbone',
	'grid/mixins/data-options'
	
], function(Backbone, DataOptionsMixin) {
	
	var Viewport = Backbone.View
		.extend(DataOptionsMixin)
		.extend({
			
		className: 'grid-viewport',
		
		options: {
			aspectRatio: null,
			align: 'left',
			verticalAlign: 'top'
		},
		
		initialize: function() {
			
			_.bindAll(this);
			
			this
				.parseOptions();
			
			$(window).resize(this.resize);
		},

		getHeight: function() {
			var height = this.$el.height();
			return height;
		},
		
		getWidth: function() {
			var width = this.$el.width();
			return width;
		},
		
		resize: function() {

			this.$el
				.height(this.$el.width() / this.options.aspectRatio);
			
			var parent = this.$el.parent();
			
			var rate = Math.min(parent.width() / this.$el.width(), parent.height() /  this.$el.height());
			
			var width = this.$el.width() * rate;
		
			this.$el
				.width(width)
				.height(width / this.options.aspectRatio);
			
			this.align();
			
			this.trigger('resized');
		},
		

		align: function() {
		
			if(this.options.align == 'center') {
				
				var left = this.$el.parent().width() / 2 - this.getWidth() / 2;
			
				this.$el.css('left', left);
				
			} else if(this.options.align == 'right') {
				
				var left = this.$el.parent().width() - this.getWidth();
				
				this.$el.css('left', left);				
			}
			
			if(this.options.verticalAlign == 'center') {
				
				var top = this.$el.parent().height() / 2 - this.getHeight() / 2;
				
				this.$el.css('top', top);
				
			} else if(this.options.verticalAlign == 'bottom') {
				
				var top = this.$el.parent().height() - this.getHeight();
				
				this.$el.css('top', top);				
			}
		},
		
		render: function() {

			this.$el.css({
				'position': 'relative',
				'visibility': 'visible'
			});			
			
			this.resize();
			
			return this;
		}		
		
	});
	
	return Viewport;
});
