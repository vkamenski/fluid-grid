define([
	
	'mixins/options',
	'mixins/element'
	

], function(OptionsMixin, ElementMixin) {
	
	var Item = function(options) {
		
		this
			.setOptions(options)
			.setElement(this.options.el)
			.parseOptions(this.$el, 'fluidGrid');
	};
	
	$.extend(Item.prototype, OptionsMixin, ElementMixin, {
	
		resize: function(size, keepAspectRatio) {
			
			this.$el.width(size.width);
			
			if(keepAspectRatio) {
				this.$el.height(size.width * this.getAspectRation());
			}
			
			return this;
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
			
			this.$el.css('position', 'absolute');
			
			return this;
		}
	});
	
	return Item;	
});