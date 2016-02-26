// Copyright (c) 2013, Baidu Inc. All rights reserved.
//
// Licensed under the BSD License
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://gmu.baidu.com/license.html
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @file 声明gmu命名空间
 * @namespace gmu
 * @import zepto.js
 */

/**
 * GMU是基于zepto的轻量级mobile UI组件库，符合jquery ui使用规范，提供webapp、pad端简单易用的UI组件。为了减小代码量，提高性能，组件再插件化，兼容iOS3+ / android2.1+，支持国内主流移动端浏览器，如safari, chrome, UC, qq等。
 * GMU由百度GMU小组开发，基于开源BSD协议，支持商业和非商业用户的免费使用和任意修改，您可以通过[get started](http://gmu.baidu.com/getstarted)快速了解。
 *
 * ###Quick Start###
 * + **官网：**http://gmu.baidu.com/
 * + **API：**http://gmu.baidu.com/doc
 *
 * ###历史版本###
 *
 * ### 2.0.5 ###
 * + **DEMO: ** http://gmu.baidu.com/demo/2.0.5
 * + **API：** http://gmu.baidu.com/doc/2.0.5
 * + **下载：** http://gmu.baidu.com/download/2.0.5
 *
 * @module GMU
 * @title GMU API 文档
 */
var gmu = gmu || {
		version: '@version',
		$: window.Zepto,

		/**
		 * 调用此方法，可以减小重复实例化Zepto的开销。所有通过此方法调用的，都将公用一个Zepto实例，
		 * 如果想减少Zepto实例创建的开销，就用此方法。
		 * @method staticCall
		 * @grammar gmu.staticCall( dom, fnName, args... )
		 * @param  {DOM} elem Dom对象
		 * @param  {String} fn Zepto方法名。
		 * @param {*} * zepto中对应的方法参数。
		 * @example
		 * // 复制dom的className给dom2, 调用的是zepto的方法，但是只会实例化一次Zepto类。
		 * var dom = document.getElementById( '#test' );
		 *
		 * var className = gmu.staticCall( dom, 'attr', 'class' );
		 * console.log( className );
		 *
		 * var dom2 = document.getElementById( '#test2' );
		 * gmu.staticCall( dom, 'addClass', className );
		 */
		staticCall: (function ($) {
			var proto = $.fn,
				slice = [].slice,

			// 公用此zepto实例
				instance = $();

			instance.length = 1;

			return function (item, fn) {
				instance[0] = item;
				return proto[fn].apply(instance, slice.call(arguments, 2));
			};
		})(Zepto)
	};

/**
 * @file Event相关, 给widget提供事件行为。也可以给其他对象提供事件行为。
 * @import core/gmu.js
 * @module GMU
 */
(function (gmu, $) {
	var slice = [].slice,
		separator = /\s+/,

		returnFalse = function () {
			return false;
		},

		returnTrue = function () {
			return true;
		};

	function eachEvent(events, callback, iterator) {

		// 不支持对象，只支持多个event用空格隔开
		(events || '').split(separator).forEach(function (type) {
			iterator(type, callback);
		});
	}

	// 生成匹配namespace正则
	function matcherFor(ns) {
		return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
	}

	// 分离event name和event namespace
	function parse(name) {
		var parts = ('' + name).split('.');

		return {
			e: parts[0],
			ns: parts.slice(1).sort().join(' ')
		};
	}

	function findHandlers(arr, name, callback, context) {
		var matcher,
			obj;

		obj = parse(name);
		obj.ns && (matcher = matcherFor(obj.ns));
		return arr.filter(function (handler) {
			return handler &&
				(!obj.e || handler.e === obj.e) &&
				(!obj.ns || matcher.test(handler.ns)) &&
				(!callback || handler.cb === callback ||
				handler.cb._cb === callback) &&
				(!context || handler.ctx === context);
		});
	}

	/**
	 * Event类，结合gmu.event一起使用, 可以使任何对象具有事件行为。包含基本`preventDefault()`, `stopPropagation()`方法。
	 * 考虑到此事件没有Dom冒泡概念，所以没有`stopImmediatePropagation()`方法。而`stopProgapation()`的作用就是
	 * 让之后的handler都不执行。
	 *
	 * @class Event
	 * @constructor
	 * ```javascript
	 * var obj = {};
	 *
	 * $.extend( obj, gmu.event );
	 *
	 * var etv = gmu.Event( 'beforeshow' );
	 * obj.trigger( etv );
	 *
	 * if ( etv.isDefaultPrevented() ) {
     *     console.log( 'before show has been prevented!' );
     * }
	 * ```
	 * @grammar new gmu.Event( name[, props]) => instance
	 * @param {String} type 事件名字
	 * @param {Object} [props] 属性对象，将被复制进event对象。
	 */
	function Event(type, props) {
		if (!(this instanceof Event)) {
			return new Event(type, props);
		}

		props && $.extend(this, props);
		this.type = type;

		return this;
	}

	Event.prototype = {

		/**
		 * @method isDefaultPrevented
		 * @grammar e.isDefaultPrevented() => Boolean
		 * @desc 判断此事件是否被阻止
		 */
		isDefaultPrevented: returnFalse,

		/**
		 * @method isPropagationStopped
		 * @grammar e.isPropagationStopped() => Boolean
		 * @desc 判断此事件是否被停止蔓延
		 */
		isPropagationStopped: returnFalse,

		/**
		 * @method preventDefault
		 * @grammar e.preventDefault() => undefined
		 * @desc 阻止事件默认行为
		 */
		preventDefault: function () {
			this.isDefaultPrevented = returnTrue;
		},

		/**
		 * @method stopPropagation
		 * @grammar e.stopPropagation() => undefined
		 * @desc 阻止事件蔓延
		 */
		stopPropagation: function () {
			this.isPropagationStopped = returnTrue;
		}
	};

	/**
	 * @class event
	 * @static
	 * @description event对象，包含一套event操作方法。可以将此对象扩张到任意对象，来增加事件行为。
	 *
	 * ```javascript
	 * var myobj = {};
	 *
	 * $.extend( myobj, gmu.event );
	 *
	 * myobj.on( 'eventname', function( e, var1, var2, var3 ) {
     *     console.log( 'event handler' );
     *     console.log( var1, var2, var3 );    // =>1 2 3
     * } );
	 *
	 * myobj.trigger( 'eventname', 1, 2, 3 );
	 * ```
	 */
	gmu.event = {

		/**
		 * 绑定事件。
		 * @method on
		 * @grammar on( name, fn[, context] ) => self
		 * @param  {String}   name     事件名
		 * @param  {Function} callback 事件处理器
		 * @param  {Object}   context  事件处理器的上下文。
		 * @return {self} 返回自身，方便链式
		 * @chainable
		 */
		on: function (name, callback, context) {
			var me = this,
				set;

			if (!callback) {
				return this;
			}

			set = this._events || (this._events = []);

			eachEvent(name, callback, function (name, callback) {
				var handler = parse(name);

				handler.cb = callback;
				handler.ctx = context;
				handler.ctx2 = context || me;
				handler.id = set.length;
				set.push(handler);
			});

			return this;
		},

		/**
		 * 绑定事件，且当handler执行完后，自动解除绑定。
		 * @method one
		 * @grammar one( name, fn[, context] ) => self
		 * @param  {String}   name     事件名
		 * @param  {Function} callback 事件处理器
		 * @param  {Object}   context  事件处理器的上下文。
		 * @return {self} 返回自身，方便链式
		 * @chainable
		 */
		one: function (name, callback, context) {
			var me = this;

			if (!callback) {
				return this;
			}

			eachEvent(name, callback, function (name, callback) {
				var once = function () {
					me.off(name, once);
					return callback.apply(context || me, arguments);
				};

				once._cb = callback;
				me.on(name, once, context);
			});

			return this;
		},

		/**
		 * 解除事件绑定
		 * @method off
		 * @grammar off( name[, fn[, context] ] ) => self
		 * @param  {String}   name     事件名
		 * @param  {Function} callback 事件处理器
		 * @param  {Object}   context  事件处理器的上下文。
		 * @return {self} 返回自身，方便链式
		 * @chainable
		 */
		off: function (name, callback, context) {
			var events = this._events;

			if (!events) {
				return this;
			}

			if (!name && !callback && !context) {
				this._events = [];
				return this;
			}

			eachEvent(name, callback, function (name, callback) {
				findHandlers(events, name, callback, context)
					.forEach(function (handler) {
						delete events[handler.id];
					});
			});

			return this;
		},

		/**
		 * 触发事件
		 * @method trigger
		 * @grammar trigger( name[, ...] ) => self
		 * @param  {String | Event }   evt     事件名或gmu.Event对象实例
		 * @param  {*} * 任意参数
		 * @return {self} 返回自身，方便链式
		 * @chainable
		 */
		trigger: function (evt) {
			var i = -1,
				args,
				events,
				stoped,
				len,
				ev;

			if (!this._events || !evt) {
				return this;
			}

			typeof evt === 'string' && (evt = new Event(evt));

			args = slice.call(arguments, 1);
			evt.args = args;    // handler中可以直接通过e.args获取trigger数据
			args.unshift(evt);

			events = findHandlers(this._events, evt.type);

			if (events) {
				len = events.length;

				while (++i < len) {
					if ((stoped = evt.isPropagationStopped()) || false ===
						(ev = events[i]).cb.apply(ev.ctx2, args)
					) {

						// 如果return false则相当于stopPropagation()和preventDefault();
						stoped || (evt.stopPropagation(), evt.preventDefault());
						break;
					}
				}
			}

			return this;
		}
	};

	// expose
	gmu.Event = Event;
})(gmu, gmu.$);

/**
 * @file gmu底层，定义了创建gmu组件的方法
 * @import core/gmu.js, core/event.js, extend/parseTpl.js
 * @module GMU
 */

(function( gmu, $, undefined ) {
	var slice = [].slice,
		toString = Object.prototype.toString,
		blankFn = function() {},

	// 挂到组件类上的属性、方法
		staticlist = [ 'options', 'template', 'tpl2html' ],

	// 存储和读取数据到指定对象，任何对象包括dom对象
	// 注意：数据不直接存储在object上，而是存在内部闭包中，通过_gid关联
	// record( object, key ) 获取object对应的key值
	// record( object, key, value ) 设置object对应的key值
	// record( object, key, null ) 删除数据
		record = (function() {
			var data = {},
				id = 0,
				ikey = '_gid';    // internal key.

			return function( obj, key, val ) {
				var dkey = obj[ ikey ] || (obj[ ikey ] = ++id),
					store = data[ dkey ] || (data[ dkey ] = {});

				val !== undefined && (store[ key ] = val);
				val === null && delete store[ key ];

				return store[ key ];
			};
		})(),

		event = gmu.event;

	function isPlainObject( obj ) {
		return toString.call( obj ) === '[object Object]';
	}

	// 遍历对象
	function eachObject( obj, iterator ) {
		obj && Object.keys( obj ).forEach(function( key ) {
			iterator( key, obj[ key ] );
		});
	}

	// 从某个元素上读取某个属性。
	function parseData( data ) {
		try {    // JSON.parse可能报错

			// 当data===null表示，没有此属性
			data = data === 'true' ? true :
				data === 'false' ? false : data === 'null' ? null :

					// 如果是数字类型，则将字符串类型转成数字类型
					+data + '' === data ? +data :
						/(?:\{[\s\S]*\}|\[[\s\S]*\])$/.test( data ) ?
							JSON.parse( data ) : data;
		} catch ( ex ) {
			data = undefined;
		}

		return data;
	}

	// 从DOM节点上获取配置项
	function getDomOptions( el ) {
		var ret = {},
			attrs = el && el.attributes,
			len = attrs && attrs.length,
			key,
			data;

		while ( len-- ) {
			data = attrs[ len ];
			key = data.name;

			if ( key.substring(0, 5) !== 'data-' ) {
				continue;
			}

			key = key.substring( 5 );
			data = parseData( data.value );

			data === undefined || (ret[ key ] = data);
		}

		return ret;
	}

	// 在$.fn上挂对应的组件方法呢
	// $('#btn').button( options );实例化组件
	// $('#btn').button( 'select' ); 调用实例方法
	// $('#btn').button( 'this' ); 取组件实例
	// 此方法遵循get first set all原则
	function zeptolize( name ) {
		var key = name.substring( 0, 1 ).toLowerCase() + name.substring( 1 ),
			old = $.fn[ key ];

		$.fn[ key ] = function( opts ) {
			var args = slice.call( arguments, 1 ),
				method = typeof opts === 'string' && opts,
				ret,
				obj;

			$.each( this, function( i, el ) {

				// 从缓存中取，没有则创建一个
				obj = record( el, name ) || new gmu[ name ]( el,
						isPlainObject( opts ) ? opts : undefined );

				// 取实例
				if ( method === 'this' ) {
					ret = obj;
					return false;    // 断开each循环
				} else if ( method ) {

					// 当取的方法不存在时，抛出错误信息
					if ( !$.isFunction( obj[ method ] ) ) {
						throw new Error( '组件没有此方法：' + method );
					}

					ret = obj[ method ].apply( obj, args );

					// 断定它是getter性质的方法，所以需要断开each循环，把结果返回
					if ( ret !== undefined && ret !== obj ) {
						return false;
					}

					// ret为obj时为无效值，为了不影响后面的返回
					ret = undefined;
				}
			} );

			return ret !== undefined ? ret : this;
		};

		/*
		 * NO CONFLICT
		 * var gmuPanel = $.fn.panel.noConflict();
		 * gmuPanel.call(test, 'fnname');
		 */
		$.fn[ key ].noConflict = function() {
			$.fn[ key ] = old;
			return this;
		};
	}

	// 加载注册的option
	function loadOption( klass, opts ) {
		var me = this;

		// 先加载父级的
		if ( klass.superClass ) {
			loadOption.call( me, klass.superClass, opts );
		}

		eachObject( record( klass, 'options' ), function( key, option ) {
			option.forEach(function( item ) {
				var condition = item[ 0 ],
					fn = item[ 1 ];

				if ( condition === '*' ||
					($.isFunction( condition ) &&
					condition.call( me, opts[ key ] )) ||
					condition === opts[ key ] ) {

					fn.call( me );
				}
			});
		} );
	}

	// 加载注册的插件
	function loadPlugins( klass, opts ) {
		var me = this;

		// 先加载父级的
		if ( klass.superClass ) {
			loadPlugins.call( me, klass.superClass, opts );
		}

		eachObject( record( klass, 'plugins' ), function( opt, plugin ) {

			// 如果配置项关闭了，则不启用此插件
			if ( opts[ opt ] === false ) {
				return;
			}

			eachObject( plugin, function( key, val ) {
				var oringFn;

				if ( $.isFunction( val ) && (oringFn = me[ key ]) ) {
					me[ key ] = function() {
						var origin = me.origin,
							ret;

						me.origin = oringFn;
						ret = val.apply( me, arguments );
						origin === undefined ? delete me.origin :
							(me.origin = origin);

						return ret;
					};
				} else {
					me[ key ] = val;
				}
			} );

			plugin._init.call( me );
		} );
	}

	// 合并对象
	function mergeObj() {
		var args = slice.call( arguments ),
			i = args.length,
			last;

		while ( i-- ) {
			last = last || args[ i ];
			isPlainObject( args[ i ] ) || args.splice( i, 1 );
		}

		return args.length ?
			$.extend.apply( null, [ true, {} ].concat( args ) ) : last; // 深拷贝，options中某项为object时，用例中不能用==判断
	}

	// 初始化widget. 隐藏具体细节，因为如果放在构造器中的话，是可以看到方法体内容的
	// 同时此方法可以公用。
	function bootstrap( name, klass, uid, el, options ) {
		var me = this,
			opts;

		if ( isPlainObject( el ) ) {
			options = el;
			el = undefined;
		}

		// options中存在el时，覆盖el
		options && options.el && (el = $( options.el ));
		el && (me.$el = $( el ), el = me.$el[ 0 ]);

		opts = me._options = mergeObj( klass.options,
			getDomOptions( el ), options );

		me.template = mergeObj( klass.template, opts.template );

		me.tpl2html = mergeObj( klass.tpl2html, opts.tpl2html );

		// 生成eventNs widgetName
		me.widgetName = name.toLowerCase();
		me.eventNs = '.' + me.widgetName + uid;

		// 进行创建DOM等操作
		me._create();

		me._init( opts );

		// 设置setup参数，只有传入的$el在DOM中，才认为是setup模式
		me._options.setup = (me.$el && me.$el.parent()[ 0 ]) ? true: false;

		loadOption.call( me, klass, opts );
		loadPlugins.call( me, klass, opts );

		me.trigger( 'ready' );

		el && record( el, name, me ) && me.on( 'destroy', function() {
			record( el, name, null );
		} );

		return me;
	}

	/**
	 * @desc 创建一个类，构造函数默认为init方法, superClass默认为Base
	 * @name createClass
	 * @grammar createClass(object[, superClass]) => fn
	 */
	function createClass( name, object, superClass ) {
		if ( typeof superClass !== 'function' ) {
			superClass = gmu.Base;
		}

		var uuid = 1,
			suid = 1;

		function klass( el, options ) {
			if ( name === 'Base' ) {
				throw new Error( 'Base类不能直接实例化' );
			}

			if ( !(this instanceof klass) ) {
				return new klass( el, options );
			}

			return bootstrap.call( this, name, klass, uuid++, el, options );
		}

		$.extend( klass, {

			/**
			 * @name register
			 * @grammar klass.register({})
			 * @desc 注册插件
			 */
			register: function( name, obj ) {
				var plugins = record( klass, 'plugins' ) ||
					record( klass, 'plugins', {} );

				obj._init = obj._init || blankFn;

				plugins[ name ] = obj;
				return klass;
			},

			/**
			 * @name option
			 * @grammar klass.option(option, value, method)
			 * @desc 扩充组件的配置项
			 */
			option: function( option, value, method ) {
				var options = record( klass, 'options' ) ||
					record( klass, 'options', {} );

				options[ option ] || (options[ option ] = []);
				options[ option ].push([ value, method ]);

				return klass;
			},

			/**
			 * @name inherits
			 * @grammar klass.inherits({})
			 * @desc 从该类继承出一个子类，不会被挂到gmu命名空间
			 */
			inherits: function( obj ) {

				// 生成 Sub class
				return createClass( name + 'Sub' + suid++, obj, klass );
			},

			/**
			 * @name extend
			 * @grammar klass.extend({})
			 * @desc 扩充现有组件
			 */
			extend: function( obj ) {
				var proto = klass.prototype,
					superProto = superClass.prototype;

				staticlist.forEach(function( item ) {
					obj[ item ] = mergeObj( superClass[ item ], obj[ item ] );
					obj[ item ] && (klass[ item ] = obj[ item ]);
					delete obj[ item ];
				});

				// todo 跟plugin的origin逻辑，公用一下
				eachObject( obj, function( key, val ) {
					if ( typeof val === 'function' && superProto[ key ] ) {
						proto[ key ] = function() {
							var $super = this.$super,
								ret;

							// todo 直接让this.$super = superProto[ key ];
							this.$super = function() {
								var args = slice.call( arguments, 1 );
								return superProto[ key ].apply( this, args );
							};

							ret = val.apply( this, arguments );

							$super === undefined ? (delete this.$super) :
								(this.$super = $super);
							return ret;
						};
					} else {
						proto[ key ] = val;
					}
				} );
			}
		} );

		klass.superClass = superClass;
		klass.prototype = Object.create( superClass.prototype );


		/*// 可以在方法中通过this.$super(name)方法调用父级方法。如：this.$super('enable');
		 object.$super = function( name ) {
		 var fn = superClass.prototype[ name ];
		 return $.isFunction( fn ) && fn.apply( this,
		 slice.call( arguments, 1 ) );
		 };*/

		klass.extend( object );

		return klass;
	}

	/**
	 * @method define
	 * @grammar gmu.define( name, object[, superClass] )
	 * @class
	 * @param {String} name 组件名字标识符。
	 * @param {Object} object
	 * @desc 定义一个gmu组件
	 * @example
	 * ####组件定义
	 * ```javascript
	 * gmu.define( 'Button', {
     *     _create: function() {
     *         var $el = this.getEl();
     *
     *         $el.addClass( 'ui-btn' );
     *     },
     *
     *     show: function() {
     *         console.log( 'show' );
     *     }
     * } );
	 * ```
	 *
	 * ####组件使用
	 * html部分
	 * ```html
	 * <a id='btn'>按钮</a>
	 * ```
	 *
	 * javascript部分
	 * ```javascript
	 * var btn = $('#btn').button();
	 *
	 * btn.show();    // => show
	 * ```
	 *
	 */
	gmu.define = function( name, object, superClass ) {
		gmu[ name ] = createClass( name, object, superClass );
		zeptolize( name );
	};

	/**
	 * @desc 判断object是不是 widget实例, klass不传时，默认为Base基类
	 * @method isWidget
	 * @grammar gmu.isWidget( anything[, klass] ) => Boolean
	 * @param {*} anything 需要判断的对象
	 * @param {String|Class} klass 字符串或者类。
	 * @example
	 * var a = new gmu.Button();
	 *
	 * console.log( gmu.isWidget( a ) );    // => true
	 * console.log( gmu.isWidget( a, 'Dropmenu' ) );    // => false
	 */
	gmu.isWidget = function( obj, klass ) {

		// 处理字符串的case
		klass = typeof klass === 'string' ? gmu[ klass ] || blankFn : klass;
		klass = klass || gmu.Base;
		return obj instanceof klass;
	};

	/**
	 * @class Base
	 * @description widget基类。不能直接使用。
	 */
	gmu.Base = createClass( 'Base', {

		/**
		 * @method _init
		 * @grammar instance._init() => instance
		 * @desc 组件的初始化方法，子类需要重写该方法
		 */
		_init: blankFn,

		/**
		 * @override
		 * @method _create
		 * @grammar instance._create() => instance
		 * @desc 组件创建DOM的方法，子类需要重写该方法
		 */
		_create: blankFn,


		/**
		 * @method getEl
		 * @grammar instance.getEl() => $el
		 * @desc 返回组件的$el
		 */
		getEl: function() {
			return this.$el;
		},

		/**
		 * @method on
		 * @grammar instance.on(name, callback, context) => self
		 * @desc 订阅事件
		 */
		on: event.on,

		/**
		 * @method one
		 * @grammar instance.one(name, callback, context) => self
		 * @desc 订阅事件（只执行一次）
		 */
		one: event.one,

		/**
		 * @method off
		 * @grammar instance.off(name, callback, context) => self
		 * @desc 解除订阅事件
		 */
		off: event.off,

		/**
		 * @method trigger
		 * @grammar instance.trigger( name ) => self
		 * @desc 派发事件, 此trigger会优先把options上的事件回调函数先执行
		 * options上回调函数可以通过调用event.stopPropagation()来阻止事件系统继续派发,
		 * 或者调用event.preventDefault()阻止后续事件执行
		 */
		trigger: function( name ) {
			var evt = typeof name === 'string' ? new gmu.Event( name ) : name,
				args = [ evt ].concat( slice.call( arguments, 1 ) ),
				opEvent = this._options[ evt.type ],

			// 先存起来，否则在下面使用的时候，可能已经被destory给删除了。
				$el = this.getEl();

			if ( opEvent && $.isFunction( opEvent ) ) {

				// 如果返回值是false,相当于执行stopPropagation()和preventDefault();
				false === opEvent.apply( this, args ) &&
				(evt.stopPropagation(), evt.preventDefault());
			}

			event.trigger.apply( this, args );

			// triggerHandler不冒泡
			$el && $el.triggerHandler( evt, (args.shift(), args) );

			return this;
		},

		/**
		 * @method tpl2html
		 * @grammar instance.tpl2html() => String
		 * @grammar instance.tpl2html( data ) => String
		 * @grammar instance.tpl2html( subpart, data ) => String
		 * @desc 将template输出成html字符串，当传入 data 时，html将通过$.parseTpl渲染。
		 * template支持指定subpart, 当无subpart时，template本身将为模板，当有subpart时，
		 * template[subpart]将作为模板输出。
		 */
		tpl2html: function( subpart, data ) {
			var tpl = this.template;

			tpl =  typeof subpart === 'string' ? tpl[ subpart ] :
				((data = subpart), tpl);

			return data || ~tpl.indexOf( '<%' ) ? $.parseTpl( tpl, data ) : tpl;
		},

		/**
		 * @method destroy
		 * @grammar instance.destroy()
		 * @desc 注销组件
		 */
		destroy: function() {

			// 解绑element上的事件
			this.$el && this.$el.off( this.eventNs );

			this.trigger( 'destroy' );
			// 解绑所有自定义事件
			this.off();


			this.destroyed = true;
		}

	}, Object );

	// 向下兼容
	$.ui = gmu;
})( gmu, gmu.$ );

window.gmu = gmu;