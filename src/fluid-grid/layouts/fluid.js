define([
	
    'backbone',
	'fluid-grid/mixins/data-options'
	
], function(Backbone, DataOptionsMixin) {
	
	var Layout = Backbone.View.extend({
		
		className: 'grid-layout',
		
		options: {
			columnMaxWidth: 400,
			columnsCount: null,
			align: 'left',
			verticalAlign: 'top'
		},
		
		viewport: null,
		
		columns: {},
		
		items: [],
		
		initialize: function() {
			
			_.bindAll(this);
			
			this
				.parseOptions();
			
			this.viewport = this.options.viewport;
			
			this.viewport
				.on('resized', this.position);
		},
		
		getColumnWidth: function() {
			
			var width = this.viewport.getWidth() / this.getColumnsCount();
			
			if(this.options.columnMaxWidth && width > this.options.columnMaxWidth) {
				width = this.options.columnMaxWidth;
			}
			
			return width;
		},
		
		getColumnsCount: function() {
			
			var count = 0;

			if(this.options.columnsCount) {
				count = this.options.columnsCount;
			} else {
				count = Math.ceil(this.viewport.getWidth() / this.options.columnMaxWidth);
			}
			
			if(count > this.items.length) {
				count = this.items.length;
			}
			
			return count;
		},
		
		createColumns: function() {
			
			this.columns = {};
			
			for(var i = 1; i <= this.getColumnsCount(); i++) {
				
				this.columns[i] = {
					sort: i,
					height: 0
				};
			}
		},
		
		findSmallestColumn: function() {
			
			var smallest = null;
			
			$.each(this.columns, function(i, column) {
				
				if(!smallest || smallest.height > column.height) {
					smallest = column;
				}
			
			});
			
			return smallest;
		},
		
		findHighestColumn: function() {
			
			var highest = null;
			
			$.each(this.columns, function(i, column) {
				
				if(!highest || highest.height < column.height) {
					highest = column;
				}
			
			});
			
			return highest;
		},
		
		getWidth: function() {
			
			var width = this.getColumnsCount() * this.getColumnWidth();
			
			return width;
		},
		
		getHeight: function() {
			
			var height = 0;
			
			var column = this.findHighestColumn();
			
			if(column) {
				height = column.height;				
			}
			
			return height;
		},
		
		position: function() {
		
			var self = this;
			
			this.createColumns();
			
			$.each(this.items, function(i, item) {
				
				var column = self.findSmallestColumn();
				
				item
					.resize({
						width: self.getColumnWidth() 
					}, true);
				
				item
					.position({
						top: column.height,
						left: (column.sort - 1) * self.getColumnWidth()
					});

				column.height += item.$el.outerHeight(true);
			});
			
			this.$el
				.width(this.getWidth())	
				.height(this.getHeight());	
			
			this.align();
		},
		
		align: function() {
			
			if(this.options.align == 'center') {
				
				var left = this.viewport.getWidth() / 2 - this.getWidth() / 2;
				
				this.$el.css('left', left);
				
			} else if(this.options.align == 'right') {
				
				var left = this.viewport.getWidth() - this.getWidth();
				
				this.$el.css('left', left);				
			}
			
			if(this.options.verticalAlign == 'center') {
				
				var top = this.viewport.getHeight() / 2 - this.getHeight() / 2;
				
				this.$el.css('top', top);
				
			} else if(this.options.verticalAlign == 'bottom') {
				
				var top = this.viewport.getHeight() - this.getHeight();
				
				this.$el.css('top', top);				
			}
		},
		
		add: function(item) {
			
			this.$el.append(item.el);
			
			this.items.push(item);
			
			return item;
		},
		
		render: function() {

			this.$el.css({
				'position': 'absolute',
				'visibility': 'visible'
			});			
			
			return this;
		}		
		
	});
	
	_.extend(Layout.prototype, DataOptionsMixin);
	
	return Layout;
});
