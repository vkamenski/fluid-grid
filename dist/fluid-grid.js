(function(global, define) {
  var globalDefine = global.define;

/**
 * almond 0.2.3 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../vendor/almond", function(){});

define('mixins/options',[

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
define('mixins/element',[

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
define('item',[
	
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
			
			this.$el.css('position', 'absolute');
			
			return this;
		}
	});
	
	return Item;	
});
define('fluid-grid',[
	
    'item',
	'mixins/options',
    'mixins/element'
	
], function(Item, OptionsMixin, ElementMixin) {
	
	var Grid = function(options) {
		
		var self = this;
		
		this
			.setOptions(options)
			.setElement(this.options.el)
			.parseOptions(this.$el, 'fluidGrid');
		
		this.$el
			.find(this.options.itemSelector)
			.each(function(i, element) {
				self.addItem(element);
			});
		
		$(window).resize(function() {
			self.render();
		});
	};
	
	$.extend(Grid.prototype, OptionsMixin, ElementMixin, {
		
		options: {
			itemSelector: '> .item',
			columnMaxWidth: 300,
			columnMinWidth: 200,
			keepAspectRetio: true
		},
		
		columns: {},
		
		items: [],
			
		addItem: function(element) {
			
			var item = new Item({
				el: $(element)
			});
			
			this.items.push(item);
			
			this.$el.append(item.el);
			
			this.$el.trigger('item-added.fluid-grid', [item]);
			
			return this;
		},
				
		getColumnsCount: function() {
			return Math.ceil(this.width / (this.options.columnMaxWidth + this.getItemsOffset()));
		},
		
		getColumnWidth: function() {
			return this.width / this.getColumnsCount();
		},
		
		getItemsOffset: function() {
			
			var offset = 0;
			
			if(this.items[0]) {
				offset = this.items[0].getOffset();
			}
			
			return offset;
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
		
		createColumns: function() {
			
			this.columns = {};
			
			for(var i = 1; i <= this.getColumnsCount(); i++) {
				
				this.columns[i] = {
					sort: i,
					height: 0
				};
			};
		},
		
		render: function() {
			
			var self = this;
			
			this.width = this.$el.width();
			
			this.$el.css({
				'position': 'relative',
				'visibility': 'visible'
			});
			
			this.createColumns();
			
			$.each(this.items, function(i, item) {
				
				var column = self.findSmallestColumn();
				
				item
					.render()
					.resize({
						width: self.getColumnWidth() 
					}, self.options.keepAspectRetio);
				
				item
					.position({
						top: column.height,
						left: (column.sort - 1) * self.getColumnWidth()
					});

				column.height += item.$el.outerHeight(true);
			});
			
			var highestColumn = this.findHighestColumn();
			
			if(highestColumn) {
				this.$el
					.height(highestColumn.height);
			}

			return this;
		}		
		
	});
	
	return Grid;
});
  var library = require('fluid-grid');
  if(typeof module !== 'undefined' && module.exports) {
    module.exports = library;
  } else if(globalDefine) {
    (function (define) {
      define(function () { return library; });
    }(globalDefine));
  } else {
    global['fluid-grid'] = library;
  }
}(this));
