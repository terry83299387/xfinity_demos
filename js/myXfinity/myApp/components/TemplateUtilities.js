/**
 * 
 */
Template.TemplateUtilities = new function() {
	var TEMPLATE_SERVICE = 'showTemplate.action';
	var DB_RPC_PROXY_SERVICE = 'templateDBRPCProxy.action';
	var ID_PREFIX = 'qmk-gen';
	var _idSeqNum = Math.floor((Math.random()*(3<<(new Date().getDay()+5))));
	var _intFunc = Template.InternalFunctions;

	/**
	 * read-only
	 */
	this.RPC_TYPE_STATIC = 'static';
	/**
	 * read-only
	 */
	this.RPC_TYPE_DB = 'db';
	/**
	 * read-only
	 */
	this.RPC_TYPE_URL = 'url';
	/**
	 * read-only (not used yet)
	 */
	this.RPC_TYPE_FILE = 'file';

	/**
	 * 这些常量同时定义在JobMapConstants.java中。
	 */
	this.jsdlKeys = {
		JOB_NAME       : 'urn:scc:jobname',
		DESCRIPTION    : 'urn:scc:description',
		CLUSTER        : 'urn:scc:clusterCode',
		CLUSTER_NAME   : 'clusterName',
		QUEUE          : 'urn:scc:queueCode',
		QUEUE_NAME     : 'queueName',
		SOFTWARE_CODE  : 'urn:scc:softwareCode', // TODO JobMapConstants.java中相关的值有修改
		SOFTWARE_NAME  : 'urn:scc:applicationName',
		WORK_DIR       : 'urn:scc:workdir',
		PROJECT        : 'urn:scc:project',
		SCRIPT         : 'urn:scc:script',
		PROJECT_NAME   : 'projectName',
		JOB_NODES      : 'urn:scc:nodes',
		JOB_CPUS       : 'urn:scc:cpus'
	};

	this.generateUniqueID = function() {
		return ID_PREFIX + (++_idSeqNum);
	};

	/**
	 * fetch the template defined data use the specified software code.
	 * if the data is correct, parse and show it.
	 * @param softwareInfo selected software's detail information,
	 *        includes softwareCode, softwareName, description, etc.
	 */
	this.createTemplate = function(softwareInfo) {
		if (!softwareInfo) return;

		var classify;
		if (softwareInfo.type == 'para') { // shortcut
			classify = softwareInfo.refSoftware.classify;
		} else {
			classify = softwareInfo.classify;
		}

		var templateParser;
		if (classify == 1) { // science software
			templateParser = new Template.TemplateParserWithCmdEdit(softwareInfo);
		} else {
			templateParser = new Template.TemplateParser(softwareInfo);
		}

		templateParser.init();

		return templateParser;
	};

	/**
	 * this factory method is used to build the component.
	 * @param componentCfg component configuration
	 * @param parser TemplateParser
	 */
	this.getTemplateComponent = function(componentCfg, parser) {
		if (!componentCfg || !componentCfg.id) return null;

		var component = null;
		var type = componentCfg.compType;

		// ------------- debug ------------
		switch (type) {
			case 'TextField':
				component = new Template.TextField(parser, componentCfg);
				break;
			case 'TextArea':
				component = new Template.TextArea(parser, componentCfg);
				break;
			case 'NumberField':
				component = new Template.NumberField(parser, componentCfg);
				break;
			case 'ComboBox':
				component = new Template.ComboBox(parser, componentCfg);
				break;
			case 'RemoteDirectory':
				component = new Template.RemoteDirectory(parser, componentCfg);
				break;
			case 'SingleFile':
				component = new Template.SingleFile(parser, componentCfg);
				break;
			case 'MultipleFile':
				component = new Template.MultipleFile(parser, componentCfg);
				break;
			default:
				component = new Template.TextField(parser, componentCfg);
		}
		return component;
		// ------------- debug ------------

		switch (type) {
			case 'TextField':
				component = new Template.TextField(parser, componentCfg);
				break;
			case 'TextArea':
				component = new Template.TextArea(parser, componentCfg);
				break;
			case 'NumberField':
				component = new Template.NumberField(parser, componentCfg);
				break;
			case 'ComboBox':
				component = new Template.ComboBox(parser, componentCfg);
				break;
			case 'RemoteDirectory':
				component = new Template.RemoteDirectory(parser, componentCfg);
				break;
			case 'RemoteFile':
				component = new Template.RemoteFile(parser, componentCfg);
				break;
			case 'SingleFile':
				component = new Template.SingleFile(parser, componentCfg);
				break;
			case 'MultipleFile':
				component = new Template.MultipleFile(parser, componentCfg);
				break;
			case 'CheckBox':
				component = new Template.CheckBox(parser, componentCfg);
				break;
			case 'FTPServerPath':
				component = new Template.FTPServerPath(parser, componentCfg);
				break;
			case 'Button':
				component = new Template.Button(parser, componentCfg);
				break;
			default: // type not defined
				return null;
		}
		return component;
	};

	/**
	 * this method is used to proxy rpc.
	 * the ajax call is asynchronous.
	 * @param type request source type. static, db, url ...
	 * @param rmtProcName the name of rpc
	 * @param options rpc request parameters
	 * @param callback callback function.
	 * the callback function usually has the following form:
	 * 
	 *    function(success, response, options)
	 * 
	 * the arguments represent that:
	 *     success: (boolean) the rpc request has accomplished successfully.
	 *        note that it does not mean the rpc itself has no error if the succeeded is true.
	 *        oppositely, it only represents the REQUEST succeeds in which response might taken along exceptions/errors.
	 *     response: (json object) the response data of rpc request.
	 *     options: the options passed into this method.
	 * 
	 * @param scope the scope in which to execute the callback function.
	 * that is: the "this" object for the callback function (defaults to the browser window).
	 * 
	 * @return (jqXHR object) the transaction object of the request
	 */
	this.rpcProxy = function(type, rmtProcName, options, callback, scope) {
		if (!callback || typeof callback != 'function') {
			callback = Qmk.emptyFn;
		}
		/*
		 * for now, only db and url are supported.
		 * this method would ignore the static rpc type and calls the callback function with arguments true and empty object:
		 * callback(true, {}, options);
		 */
		if (!type || !rmtProcName) {
			callback.call(scope, false, {}, options);
			return;
		}
		if (type == this.RPC_TYPE_STATIC) {
			callback.call(scope, true, {}, options);
			return;
		}

		// 
		var rpcTarget = (type==this.RPC_TYPE_URL ? rmtProcName : DB_RPC_PROXY_SERVICE);
		var params = Qmk.applyIf({
			_rqstType_ : type,
			_rqstSourceName_ : rmtProcName
		}, options);

		var transObj = $.ajax({
			url : rpcTarget,
			contentType: 'application/x-www-form-urlencoded; charset=utf-8',
			data: params,
			complete : function(response, status) {
				var success = (status === 'success' || status === 'notmodified');
				callback.call(scope, success, response.responseJSON, options);
			}
		});

		return transObj;
	};

	/**
	 * Aborts any outstanding request.
	 * @param transObj a jqXHR object
	 */
	this.cancelRPCProxy = function(transObj) {
		if (transObj && typeof transObj.abort == 'function')
			transObj.abort();
	};

	/**
	 * 调用一个“内置函数”。调用的过程与Java中的反射类似：
	 * 传入方法名称与参数，系统会执行该方法并返回结果。
	 * 
	 * @param method name of the method.
	 * @param owner the object on which the method will be invoked.
	 * @param params parameters passed into the method.
	 * 
	 * @return the result of the method executing.
	 * 
	 * @exception method not found
	 * @exception illegal argument
	 * @exception runtime exception
	 * (for example, parameter owner is null where it is not allowed)
	 */
	this.invokeMethod = function(method, owner, params) {
		if (method == null) return null;

		if (params == null) params = [];

		if (_intFunc.hasOwnProperty(method)
				&& typeof _intFunc[method] == 'function')
			return _intFunc[method].call(_intFunc, owner, params);

		return owner;
	};

	this.READ_ONLY = 'read-only';
	this.WRITE_ONLY = 'write-only';
	this.READABLE = 'readable';
	this.WRITABLE = 'writable';
	this.READ_WRITE = 'read-write';
	this.READ_OR_WRITE = 'read-or-write';

	this.GETTER = 'getter';
	this.SETTER = 'setter';
	/**
	 * return whether the obj has the public property.
	 * 
	 * the obj has a property, if and only if it has
	 * the getter and/or setter methods of the property.
	 * 
	 * if the obj is null, or property name is null or
	 * empty, return false.
	 * 
	 * @param obj the object which would have the property
	 * @param prop property name
	 * @param flag (optional) it might be one of the
	 * following value (default to readable):
	 * "read-only": a read-only property has a getter
	 * method, but no setter method
	 * "write-only": just has a setter method (no getter)
	 * "readable": whether has a getter method (no matter
	 * if it has a setter method)
	 * "writable": whether has a setter method (no matter
	 * if it has a getter method)
	 * "read-write": has getter and setter methods
	 * "read-or-write": has getter or setter methods
	 * 
	 * @return true if the obj has the property with
	 * specified flag
	 */
	this.objHasProperty = function(obj, prop, flag) {
		if (obj == null
				|| !prop
				|| typeof prop != 'string')
			return false;

		var n = prop.charAt(0).toUpperCase() + prop.substring(1);
		var hasGetter,
			hasSetter;

		if (obj.hasOwnProperty) {
			hasGetter = obj.hasOwnProperty('get' + n)
						|| obj.hasOwnProperty('is' + n);
			hasSetter = obj.hasOwnProperty('set' + n);
		} else {
			hasGetter = (obj['get' + n] !== undefined) || (obj['is' + n] !== undefined);
			hasSetter = (obj['set' + n] !== undefined);
		}

		if (flag === undefined)
			flag = this.READABLE;

		switch (flag) {
		case this.READABLE:
			return hasGetter;
		case this.WRITABLE:
			return hasSetter;
		case this.READ_WRITE:
			return (hasGetter && hasSetter);
		case this.READ_ONLY:
			return (hasGetter && !hasSetter);
		case this.WRITE_ONLY:
			return (hasSetter && !hasGetter);
		case this.READ_OR_WRITE:
			return (hasGetter || hasSetter);
		default:
			// illegal flag
		}

		return false;
	};

	/**
	 * get object's getter or setter method of property.
	 * @param obj the object
	 * @param prop property name
	 * @param flag "getter" or "setter". default to "getter"
	 * 
	 * @return the method reference, if no method, return null.
	 */
	this.getPropMethod = function(obj, prop, flag) {
		if (obj == null
				|| !prop
				|| typeof prop != 'string')
			return null;

		if (flag === undefined)
			flag = this.GETTER;

		var isGetter = (flag==this.GETTER);
		if (!this.objHasProperty(obj, prop,
				(isGetter?this.READABLE:this.WRITABLE)))
			return null;

		var n = prop.charAt(0).toUpperCase() + prop.substring(1);
		var m = (isGetter ? (obj['get'+n] || obj['is'+n])
				: obj['set'+n]);
		return (typeof m == 'function' ? m : null);
	};

	/**
	 * get value of specified object field.
	 * @param obj the object
	 * @param fieldName field name
	 * @param defaultVal default value if obj is null
	 * or doesn't contain the field
	 * 
	 * @return the field's value
	 */
	this.getObjField = function(obj, fieldName, defaultVal) {
		if (obj == null) return defaultVal;

		if ((obj.hasOwnProperty && obj.hasOwnProperty(fieldName))
				|| obj[fieldName] !== undefined)
			return obj[fieldName];

		var t = obj.prototype;
		if (t && ((t.hasOwnProperty && t.hasOwnProperty(fieldName))
				|| t[fieldName] !== undefined))
			return t[fieldName];
		t = obj.constructor.prototype;
		if (t && ((t.hasOwnProperty && t.hasOwnProperty(fieldName))
				|| t[fieldName] !== undefined))
			return t[fieldName];

		return defaultVal;
	};

	/**
	 * 将字符串按给定的字符（例如{和}）进行拆分。
	 * 
	 * 注意这里不适合使用String.split()或String.match()。
	 * 因为最重要的一点：它们都无法准确地判断找到的匹配字符是否需要
	 * 转义（见本函数中的注释）
	 * 另外，split()会丢失匹配到的字符串，例如它会将xxxx{yyyy拆分为
	 * xxxx和yyyy，而丢掉匹配到的{。
	 * 而match()则只会返回匹配到的字符串数组，还是以上面的为例，match()
	 * 返回包含一个元素即“{”的数组，但没有索引信息（如果正则不带g标识，
	 * 那么返回的数组会有index属性，但这种情况却仅会对参数字符串匹配一次
	 * ，而不是全局匹配）
	 * 
	 * 这里使用的是RegExp对象的exec()方法。下面是对此方法的说明：
	 * 
	 * [定义和用法]
	 * exec() 方法用于检索字符串中的正则表达式的匹配。
	 * [语法]
	 * RegExpObject.exec(string)
	 * 参数string：必需。要检索的字符串。
	 * 返回值：返回一个数组，其中存放匹配的结果。未找到匹配则返回null。
	 * 
	 * 说明：
	 * exec()方法的功能非常强大，它是一个通用的方法，而且使用起来也比
	 * test()方法以及支持正则表达式的String对象的方法更为复杂。
	 * 如果 exec()找到了匹配的文本，则返回一个结果数组。否则，返回 null。
	 * 此数组的第0个元素是与正则表达式相匹配的文本，第1个元素是与
	 * RegExpObject的第1个子表达式相匹配的文本（如果有的话），第2个元素
	 * 是与RegExpObject的第2个子表达式相匹配的文本（如果有的话），以此
	 * 类推。除了数组元素和length属性之外，返回的数组还有两个属性：
	 * index属性声明的是匹配文本的第一个字符的位置；
	 * input属性则存放的是被检索的字符串string。我们可以看得出，在调用
	 * 非全局的RegExp对象的exec()方法时，返回的数组与调用方法
	 * String.match()返回的数组是相同的。
	 * 但是，当RegExpObject是一个全局正则表达式时，exec()的行为就要复杂
	 * 一些了。它会在RegExpObject的lastIndex属性指定的字符处开始检索字
	 * 符串string。当exec()找到了与表达式相匹配的文本时，在匹配后，它
	 * 将把RegExpObject的lastIndex属性设置为匹配文本的最后一个字符的
	 * 下一个位置。
	 * 这就是说，您可以通过反复调用exec()方法来遍历字符串中的所有匹配文
	 * 本。
	 * 当exec()再也找不到匹配的文本时，它将返回null，并把lastIndex属性
	 * 重置为0。
	 * （编者注：也就是说，当RegExpObject为全局表达式时，可以用类似于遍
	 * 历迭代器的方式来调用exec()方法——正如下面的函数中所做的那样）
	 *
	 * 重要事项：如果在一个字符串中完成了一次模式匹配之后要开始检索新的
	 * 字符串，就必须手动地把lastIndex属性重置为0。
	 *
	 * 提示：请注意，无论RegExpObject是否是全局模式，exec()都会把完整的
	 * 细节添加到它返回的数组中。这就是exec()与String.match()的不同之处，
	 * 后者在全局模式下返回的信息要少得多。因此我们可以这么说，在循环中反
	 * 复地调用exec()方法是唯一一种获得全局模式的完整模式匹配信息的方法。
	 * 
	 * @param str 要拆分的字符串
	 * @param sep 按哪些字符进行拆分。例如"{}"表示按"{"和"}"对字符串进
	 * 行拆分；"."则按"."对字符串进行拆分。
	 * 拆分时，会排除掉转义字符，即“$+字符”形式的子串。
	 * @param keepSep 结果数组中是否保留拆分字符，默认为false
	 * @return 数组，其中依次保存着原字符串拆分后的各个部分。
	 * 注意：若参数str为空字符串，则返回一个空数组
	 */
	this.takeApart = function(str, sep, keepSep) {
		keepSep = (keepSep === true);

		/* 
		 * 之前使用的正则表达式为：
		 *   /^[{}]|[^\$][{}]/g;
		 * 该表达式是有问题的。它的意思是“查找{和}，但前面不能是$”
		 * 也就是说，排除转义的字符串${和$}
		 * 问题在于，可能会出现$${，这表示前面是一个转义的$
		 * 后面的{并非转义。因此使用这个表达式会导致错误。当
		 * {和}前面出现$时，必须根据$的数量来确定{和}是否应该被转义
		 * 而上面的表达式无法对其进行判断。
		 *
		 * 解决办法是查找“0或多个$ + {或}”，然后根据$的数量
		 * 来判断{或}是否应该被转义：
		 * 当$为奇数个时，$应该被转义；偶数则不转义。
		 * 例如：
		 * ${、$$${等{应该转义；而{、$${、$$$${等则不转义
		 */
		// 改为通用的拆分方法，按传入的拆分字符参数（sep）来拆分字符串
//		var sep = /\$*[{}]/g;
		// 首先要对sep中的]、/和\字符进行转义，变为\]、\/和\\
		sep = sep.replace(/([\]\/\\])/g, '\\$1');
		var sepReg = new RegExp('\\$*[' + sep + ']', 'g');

		// 拆分的结果保存到result变量中
		var result = [];
		var mat;
		var preIdx=0, curIdx=0;
		// “遍历”字符串的匹配
		while ((mat=sepReg.exec(str)) != null) {
			if (mat[0].length % 2 == 0) continue;
			curIdx = sepReg.lastIndex - 1;
			// 不是开头，并且与前一个匹配不相邻（相邻表示两个匹配之间无内容，即字符串为空）
			if (curIdx != 0 && curIdx != preIdx) {
				var t = str.substring(preIdx, curIdx).trim();
				if (t != '') result.push(t);
			}
			if (keepSep)
				result.push(str.charAt(curIdx));
			preIdx = curIdx + 1;
		}
		if (curIdx > 0)
			curIdx++;
		if (curIdx < str.length) {
			var t = str.substring(curIdx, str.length).trim();
			if (t != '') result.push(t);
		}
		return result;
	};

	/**
	 * delete all the \\n, \\r characters in the string
	 */
	this.filterCRs = function(str) {
		return str.replace(/[\n\r]/g, '');
	};

	/**
	 * 转义字符的转义。
	 * 首先对javascript转义字符进行转义，然后将$后接任何非空字符替换为后面的非空字符
	 * 
	 * $2表示与正则表达式中第2个子表达式匹配的文本（也就是这里的$后面的非空字符）
	 * \$匹配$符号；\S匹配非空字符（除空格、回车、换行、制表、垂直换行、换页之外的字符）
	 * ()用来划分子表达式
	 * g表示全局替换（没有全局标识只会替换第一个匹配）
	 */
	this.unescapeChars = function(str) {
		var t = str;
		// javascript escape characters
		// unicodes TODO
//		t = t.replace(/(\\[uU])([0-9a-fA-F]{4})/g, '\u$2'); // does not work
		// other
		t = t.replace(/\\n/g, '\n')
			 .replace(/\\r/g, '\r')
			 .replace(/\\t/g, '\t')
			 .replace(/\\b/g, '\b')
			 .replace(/\\f/g, '\f')
			 .replace(/\\'/g, '\'')
			 .replace(/\\"/g, '\"')
			 .replace(/(\\)(\S)/g, '$2'); // other
		// $ and a char followed
		return t.replace(/(\$)(\S)/g, '$2');
	};

	/**
	 * 
	 */
	this.delayFetchLabels = {
		DELAY_TIME		: 200,
		i18nCache		: {},

		timer			: null,
		callbackMap		: {},
		groupCallbackMap	: {},

		// syncronize flag, only allow one request once
		syncFlag : false,

		/**
		 * @param label a string, i18n label code (label id);
		 *              or an array, a group of labels' id
		 * @param callback callback function while remote call returns
		 * @param scope function scope
		 */
		delayFetch		: function(label, callback, scope) {
			// check syncronize flag, if true, wait a short time to execute again
			if (this.syncFlag === true) {
				this.delayFetch.defer(100, this, [label, callback, scope], false);
				return;
			}

			if (label == null) {
				if (callback) {
					callback.call(scope, false);
				}
				return;
			}

			if (typeof label != 'string') { // array, a group of labels
				var allCacheHit = true;
				var labelTxts = {};
				var len = label.length;
				var ele;
				for (var i=0; i<len; i++) {
					ele = label[i];
					if (ele == null || ele == '') continue;

					if (this.i18nCache[ele] != null) {
						labelTxts[ele] = this.i18nCache[ele];
					} else {
						// call delayFetch recursively
						this.delayFetch(ele);
						allCacheHit = false;
					}
				}

				if (allCacheHit) {
					if (callback) {
						callback.call(scope, true, labelTxts);
					}
				} else if (callback) {
					var labelStr = label.join(':');
					var oldCallbackObj = this.groupCallbackMap[labelStr];
					if (oldCallbackObj) {
						var oldCallback = oldCallbackObj.fun;
						// multi-request for the same labels
						if (oldCallback) {
							callback = oldCallback.createSequence(callback, scope);
						}
					}
					this.groupCallbackMap[labelStr] = {
						fun   : callback,
						scope : scope
					}
				}
			} else { // string, single label
				// if label cached, return immediately
				if (this.i18nCache[label] != null) {
					if (callback) {
						callback.call(scope, true, this.i18nCache[label], label);
					}
					return;
				}

				if (this.timer != null) {
					clearTimeout(this.timer);
				}

				var oldCallbackObj = this.callbackMap[label];
				if (callback) {
					if (oldCallbackObj) {
						var oldCallback = oldCallbackObj.fun;
						// multi-request for the same label, store callbacks
						if (oldCallback) {
							callback = oldCallback.createSequence(callback, scope);
						}
					}
					this.callbackMap[label] = {
						fun   : callback,
						scope : scope
					};
				} else if (oldCallbackObj == null) {
					this.callbackMap[label] = false;
				}

				var _delayFetch = this._delayFetch;
				var _this = this;
				this.timer = setTimeout(function() {
					_delayFetch.apply(_this);
				}, this.DELAY_TIME);
			}
		},

		/*
		 * private
		 */
		_delayFetch		: function() {
			// set syncronize flag, only allow one request once
			this.syncFlag = true;

			var i18nLabels = '';
			for (var label in this.callbackMap) {
				i18nLabels += (i18nLabels && ';') + label;
			}
			if (i18nLabels.length == 0) {
				return;
			}

			Template.TemplateUtilities.rpcProxy(
				'url',
				'getI18N.action',
				{id:i18nLabels},
				this._fetchCallback,
				this
			);
		},

		/*
		 * private
		 */
		_fetchCallback	: function(success, resp, options) {
			if (success !== true) {
				this._sendErrCallback();
				this._clean();
				return;
			}
//			var content = Ext.util.JSON.decode(resp.responseText);
			var ex = resp.exception;
			if (ex) {
				this._sendErrCallback();
				this._clean();
				return;
			}

			var i18ns = (resp.i18ns || []);

			var i18n, len=i18ns.length, label, labelTxt, callbackObj, callback;
			for (var i=0; i<len; i++) {
				i18n = i18ns[i];
				label = i18n.i18nId;
				labelTxt = i18n.content;
				// fill label cache
				this.i18nCache[label] = labelTxt;
				// callback
				callbackObj = this.callbackMap[label];
				if (callbackObj) {
					callback = callbackObj.fun;
					if (callback) {
						callback.call(callbackObj.scope, true, labelTxt, label);
					}
				}
			}

			// group
			var labelStr, labels, labelTxts;
			for (labelStr in this.groupCallbackMap) {
				labels = labelStr.split(':');
				labelTxts = {};
				len = labels.length;
				for (var i=0; i<len; i++) {
					label = labels[i];
					if (label != null && label != '')
						labelTxts[label] = this.i18nCache[label];
				}
				callbackObj = this.groupCallbackMap[labelStr];
				if (callbackObj) {
					callback = callbackObj.fun;
					if (callback) {
						callback.call(callbackObj.scope, true, labelTxts);
					}
				}
			}

			this._clean();
		},

		/*
		 * private
		 */
		_sendErrCallback	: function() {
			var callbackObj, callback;
			for (var id in this.callbackMap) {
				callbackObj = this.callbackMap[id];
				if (callbackObj) {
					callback = callbackObj.fun;
					if (callback) {
						callback.call(callbackObj.scope, false, null, label);
					}
				}
			}
		},

		/*
		 * private
		 */
		_clean		: function() {
			if (this.timer != null) {
				clearTimeout(this.timer);
			}

			this.timer = null;
			this.callbackMap = {};
			this.groupCallbackMap = {};

			// turn off the syncronize flag, allow to start another request
			this.syncFlag = false;
		}
	};

	/*-------------------------------- Initialize -------------------------------*/
	/*
	 * add method trim to String prototype.
	 * trim:
	 * Trims whitespace from either end of a string,
	 * leaving spaces within the string intact.
	 */
	if (!String.prototype.trim) {
		String.prototype.trim = function() {
		    var re = /^\s+|\s+$/g;
		    return function(){ return this.replace(re, ''); };
		}();
	}
}();
