define([

], function() {
	
	return {
		
		options: {},
		
		setOptions: function(options) {
		
			if (this.options) 
				options = $.extend({}, this.options, options);
			
			this.options = options;
			
			return this;
		},
		
		parseOptions: function(element, prefix) {
			
			var self = this;
			
			var data = $(element).data() || {};
			
			var reg = new RegExp("^" + prefix + "([a-zA-Z]+)");
			
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