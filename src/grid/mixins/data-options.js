define([
	
], function() {
	
	return {
		
		optionsPrefix: 'grid',
		
		parseOptions: function() {
			
			var self = this;
			
			var data = this.$el.data() || {};
			
			var reg = new RegExp("^" + this.optionsPrefix + "([a-zA-Z]+)");
			
			$.each(data, function(name, value) {
				
				if (data.hasOwnProperty(name) && reg.test(name)) {
					
					shortName = name.match(reg)[1]
						.replace(/[A-Z]/, function(x) {
							return (x || '').toLowerCase();
						});
					
					self.options[shortName] = value;
				}
			});
			
			return this;
		}
	};
});