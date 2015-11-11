/**
 * 
 * @param templateParser
 * @param config
 * @param thisComp
 */
Template.Variable = function(templateParser, config, thisComp) {
	var spc = Template.Variable.superclass;
	spc.constructor.call(this);
	/* ------------------------- Fields ----------------------- */
	/**
	 * read-only
	 */
	this.tplUtil = Template.TemplateUtilities;
	/**
	 * read-only
	 */
	this.tplParser = templateParser;

	/**
	 * read-only
	 */
	this.id = config.id;
	/**
	 * read-only
	 */
	this.name = config.name;
	/**
	 * where the data is from. options could be:
	 * static (default), db, url, and file (this is not supported yet).
	 * 
	 * this field is read-only
	 */
	this.from = (config.from || "static");
	/**
	 * the source to fetch data. it has different meaning
	 * with different value of "from":
	 * 
	 * static: (ignored)
	 * db: database table's name (or hibernate config file name)
	 * url: the url address
	 * 
	 * read-only
	 */
	this.sourceName = config.sourceName;
	/**
	 * the parameters to be sent while fetching data.
	 * each parameter is a simple object which has name/value pair:
	 * 
	 * {name: "xxx", value: "xxxx"}
	 * 
	 * read-only
	 */
	this.params = (config.param || []);

	/**
	 * this variable's value.
	 * read-only.
	 */
	this.value = "";

	/**
	 * related component's id.
	 * used to represent "this" in expressions
	 * if this is a root variable, thisComp will be false.
	 */
	this.thisComp = (thisComp || false);

	/* --------------------- Private Fields -------------------- */
	var _this = this;
	var _exprParser = Template.ValueExprParser;
	var _exprValid = true;
	var _dependEntity = [];
	var _parts = {};
	var _init = false;

	/* ------------------------ Methods ----------------------- */
	this.hasInit = function() {
		return _init;
	};

	this.init = function() {
		if (_init) return;

		_initEvents();

		var parts;
		if (this.from == this.tplUtil.RPC_TYPE_STATIC) {
			parts = _exprParser.splitExpr(config.value);
			_exprValid = _exprParser.validateExpr(parts);
			if (_exprValid !== true) {
				_fireInitIfNeed();
				return;
			}

			_parts.value = parts;
			_exprParser.getDependEntity(parts, _dependEntity);
		} else {
			var params = this.params;
			var len = params.length;
			var param;
			for (var i=0; i<len; i++) {
				param = params[i];

				parts = _exprParser.splitExpr(param.value);
				_exprValid = _exprParser.validateExpr(parts);
				if (_exprValid !== true) {
					_fireInitIfNeed();
					return;
				}

				_parts[param.name] = parts;
				_exprParser.getDependEntity(parts, _dependEntity);
			}
		}
	};

	this.reload = function() {
		/*
		 * check whether expression is valid or need to wait
		 * until other entities finish their initializing
		 */
		if (!_exprValid || _isDependOthers()) return;

		if (this.from == this.tplUtil.RPC_TYPE_STATIC) {
			var v = _exprParser.calcExpr(_parts.value, this.tplParser, this.thisComp);
			_setValue(v);
			this.fireEvent("loaded", this, this.getValue());
		} else {
			this.tplUtil.rpcProxy(
				this.from,
				this.sourceName,
				_getParams(),
				_remoteCalled
			);
		}
	};

	this.getValue = function() {
		return this.value;
	};

	/* --------------------- Private methods -------------------- */
	var _initEvents = function() {
		_this.events = {
			"initialized" : true,
			"changed" : true,
			"loaded" : true
		};
	};

	var _remoteCalled = function(success, resp, options) {
		// judge the window has been closed
		if (templateParser.hasWinClosed()) {
			return;
		}

		if (success !== true) {
			_fireInitIfNeed();
			return;
		}

//		var content = Ext.util.JSON.decode(resp.responseText);
		_setValue(resp);
		_this.fireEvent("loaded", _this, _this.getValue());
	};

	var _setValue = function(v) {
		var oldV = _this.getValue();
		/*
		 * 与Component不同，没取到值也一样更新value的值
		 * Component需要过滤无效值，避免将其呈现给用户
		 * 而Variable则只需要忠实地遵照load()方法返回的
		 * 值来设置自己的值即可，即使load过程出现错误
		 */
		_this.value = v;

		_fireInitIfNeed();

		/*
		 * getValue()可能会返回与设置的原始值不同的值
		 * 因此设置完之后这里再重新获取一次
		 */
		v = _this.getValue();
		if (v != oldV)
			_this.fireEvent("changed", _this, v, oldV);
	};

	var _fireInitIfNeed = function() {
		if (!_init) {
			_init = true;
			_this.fireEvent("initialized", _this);
		}
	};

	// 
	var _isDependOthers = function() {
		// 只有在初始化的时候才有必要执行检查
		if (_init) return false;

		for (var i=0; i<_dependEntity.length; i++) {
			var cfg = _dependEntity[i];
			var type = cfg.type;
			var entity;
			if (type == "var") {
				entity = _this.tplParser.getVariable(cfg.id);
			} else if (type == "id") {
				entity = _this.tplParser.getComponent(cfg.id);
			} else if (type == "this") {
				entity = _this.thisComp;
			}

			if (!entity.hasInit()) {
				entity.addListener("initialized",
						_this.reload, _this, {single: true});
				return true;
			}
		}

		return false;
	};

	//
	var _getParams = function() {
		var params = _this.params;
		var len = params.length;
		var obj = {};
		var pName;
		for (var i=0; i<len; i++) {
			pName = params[i].name;
			obj[pName] = _exprParser.calcExpr(
					_parts[pName], _this.tplParser, _this.thisComp);
		}

		return obj;
	};
};

/**
 * @class Template.Variable
 * @extends Qmk.util.Observable
 */
Qmk.extend(Template.Variable, Qmk.util.Observable);
