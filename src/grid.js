define([
	
    'backbone',
	'grid/mixins/data-options',
	
	'grid/viewports/fluid',
	'grid/layouts/fluid',
	'grid/items/base'
	
], function(Backbone, DataOptionsMixin) {
	
	var Grid = Backbone.View
		.extend(DataOptionsMixin)
		.extend({
			
		options: {
			itemSelector: '> .grid-item',
			layoutSelector: '> .grid-layout',
			viewport: 'fluid',
			item: 'base',
			layout: 'fluid'			
		},

		initialize: function() {
			
			_.bindAll(this);
			
			this
				.parseOptions();
		},
		
		setLayout: function(name) {
			
			var path = 'grid/layouts/' + name;
			
			var Layout = require(path);
			
			var element = this.$(this.options.layoutSelector);
		
			var options = {
				viewport: this.viewport	
			};
			
			if(element.length) {
				options.el = element;
			}
			
			if(this.options.columnWidth) {
				options.columnWidth = this.options.columnWidth;
			}
			
			this.layout = new Layout(options);
		
			if(!element.length) {
				this.$el
					.append(this.layout.el);
			}
			
			return this;
		},
			
		setViewport: function(name) {
			
			var path = 'grid/viewports/' + name;
			
			var Viewport = require(path);
			
			this.viewport = new Viewport({
				el: this.$el
			});
			
			return this;
		},
			
		addItem: function(element) {
			
			var path = 'grid/items/' + this.options.item;
			
			var Item = require(path);
			
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
	
	return Grid;
});
