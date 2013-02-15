define([
	
    'fluid-grid/item',
    'backbone',
	'fluid-grid/mixins/data-options',
	'fluid-grid/viewports/fluid',
	'fluid-grid/layouts/fluid',
	
], function(Item, Backbone, DataOptionsMixin) {
	
	var Grid = Backbone.View.extend({
		
		options: {
			itemSelector: '> .grid-item',
			layoutSelector: '> .grid-layout',
			viewport: 'fluid',
			layout: 'fluid'			
		},

		initialize: function() {
			
			_.bindAll(this);
			
			this
				.parseOptions();
		},
		
		setLayout: function(name) {
			
			var path = 'fluid-grid/layouts/' + name;
			
			var Layout = require(path);
			
			var element = this.$el
				.find(this.options.layoutSelector);
		
			var options = {
				viewport: this.viewport	
			};
			
			if(element.length) {
				options.el = element;
			}
			
			this.layout = new Layout(options);
			
			if(!element.length) {
				this.$el
					.append(this.layout.el);
			}
			
			return this;
		},
			
		setViewport: function(name) {
			
			var path = 'fluid-grid/viewports/' + name;
			
			var Viewport = require(path);
			
			this.viewport = new Viewport({
				el: this.$el
			});
			
			return this;
		},
			
		addItem: function(element) {
		
			return this.layout.add(new Item({
				el: $(element)
			}))
			.render();
		},
			
		render: function() {
			var self = this;
			
			this
				.setViewport(this.options.viewport)
				.setLayout(this.options.layout);
			
			this.$(this.options.itemSelector)
				.each(function(i, element) {
					self.addItem(element);
				});
			
			this.viewport.render();
			this.layout.render();
			
			return this;
		}		
		
	});
	
	_.extend(Grid.prototype, DataOptionsMixin);
	
	return Grid;
});
