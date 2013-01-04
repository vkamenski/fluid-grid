define([

], function() {
	
	return {
		
		$el: null,
		
		setElement: function(element) {
			
			this.$el = $(element);
			
			return this;
		},
		
		render: function() {
			return this;
		}
	};
	
});