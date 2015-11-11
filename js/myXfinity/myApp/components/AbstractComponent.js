/**
 * 
 * @param templateParser
 * @param config
 */
Template.AbstractComponent = function(templateParser, config) {

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
	this._userProperties = {};
	/**
	 * read-only
	 */
	this.component;

	/* --------------------- Private Fields -------------------- */
	var _this = this;
	var _init = false;
//	var _errInfoPnl;
	var _errInfo = {};

	/* ------------------------ Methods ----------------------- */
	this.hasInit = function() {
		return _init;
	};

	/**
	 * 
	 */
	this.getUserProperty = function(propertyName) {
		if (this._userProperties.hasOwnProperty(propertyName)) {
			return this._userProperties[propertyName];
		} else {
			return undefined;
		}
	};

	/**
	 * 
	 */
	this.setUserProperty = function(propertyName, value) {
		if (!propertyName || typeof propertyName != 'string')
			return;

		this._userProperties[propertyName] = value;
	};

	this.getTemplateParser = function() {
		return this.tplParser;
	};

	this.getID = function() {
		return config.id;
	};

	this.getClassification = function() {
		return config.classification;
	};

	/**
	 * return i18n label code.
	 */
	this.getLabelCode = function() {
		return config.label;
	};

	/**
	 * return component label text.
	 */
	this.getLabel = function() {
		return config.labelTxt;
	};

	this.getDescription = function() {
		return config.description;
	};

	this.getIndexOrder = function() {
		return config.indexOrder;
	};

	this.isAdvanced = function() {
		return config.advanced;
	};

	this.init = function() {
		if (_init) return;

		this.addEvents({
			'initialized' : true
		});
		this._initEvents(); // need implement in subclass

		_initVars();
		this._initData(); // need implement in subclass
		_initValidation();
		_initCombination();

		// subclass can do additional init through doMoreInit() method
		this._doMoreInit();
	};

	this.isDisplay = function() {
		return this.component.css('display') !== 'none';
	};

	this.setDisplay = function(b) {
		this.component.css('display', b ? 'block' : 'none');
	};

	this.isEmpty = function() {
		return (this.getValue() == '');
	};

	this.isNotEmpty = function() {
		return !this.isEmpty();
	};

	/* ------------------------ Protected Methods ----------------------- */
	/**
	 * (Protected)
	 */
	this._fireInitIfNeed = function() {
		if (!_init) {
			_init = true;
			this.fireEvent('initialized', this);
		}
	};

	/**
	 * (Protected)
	 * override this method in subclass if need
	 * (Deprecated comment) 注意事件名不能与Ext.Panel中的事件名重复，否则会出现非预期的行为
	 */
	this._initEvents = function() {};

	/**
	 * (Protected)
	 * override this method in subclass if you need
	 */
	this._initData = function() {};

	/**
	 * (Protected)
	 * validation handler
	 */
	this._validationHandler = function(validator, valid, level, errInfo) {
		if (!valid) {
			_errInfo[validator.id] = {
				'errInfo'   : errInfo,
				'level'     : level,
				'validator' : validator
			};
		} else {
			// delete (set to false) error info if valid
			_errInfo[validator.id] = false;
		}
		this._showErrInfo();
	};

	/**
	 * (Protected)
	 * for now, only support error-level info.
	 */
	this._showErrInfo = function() {
		if (!this.component) return;

		var errPanel = this.component.find('#' + this.component.attr('id') + '-err');

		var tpl = Template.AbstractComponent.ERR_INFO_TPL;
		var info = '', errObj;
		for (var id in _errInfo) {
			errObj = _errInfo[id];
			if (errObj) {
				if (info) {
					info += '<br>';
				}
				info += tpl.applyTemplate({
					errInfo : errObj.errInfo
				});
			}
		}
		errPanel.html(info);
		info == '' ? errPanel.hide() : errPanel.show();
	};

	/**
	 * return this component's data for some persistent purpose
	 * subclasses can override the default implementation
	 */
	this.getPersistenceData = function() {
		return this.getValue();
	};

	/**
	 * return this component's description, by default,
	 * it's the same as result of getPersistenceData()
	 * subclasses can override the default implementation
	 */
	this.getPersistenceDesc = function() {
		return this.getPersistenceData();
	};

	/**
	 * restore component's data from persistence
	 * subclasses can override the default implementation
	 */
	this.restorePersistenceData = function(data) {
		if (this.hasInit()) {
			this.setValue(data);
		} else {
			this.addListener(
				'initialized',
				function() {
					setTimeout(this.setValue.createDelegate(this, [data], false), 0);
				},
				this,
				{single : true}
			);
		}
	};

	/**
	 * (Protected)
	 * override this method in subclass if you need
	 */
	this._doMoreInit = function() {};

	/* --------------------- Private methods -------------------- */
	// init variables in this component
	var _initVars = function() {
		var cfgs = config['variable'] || [];
		var cfg, variable, len=cfgs.length;
		for (var i=0; i<len; i++) {
			cfg = cfgs[i];
			variable = new Template.Variable(_this.tplParser, cfg, _this);
			variable.init();
			_this.tplParser.addVariable(cfg.id, variable);
		}
	};

	// init validation
	var _initValidation = function() {
		var cfgs = config.validation || {};
		var len = cfgs.length;
		var validator, cfg, cfg2, when, whens;
		for (var i=0; i<len; i++) {
			cfg = cfgs[i];
			// apart by comma (,)
			whens = (cfg.when || 'changed').split(',');
			for (var j=0; j<whens.length; j++) {
				when = whens[j].trim();
				if (!when) continue;

				cfg2 = Qmk.apply({}, cfg); // clone current cfg
				cfg2.when = when;
				validator = new Template.Validator(_this.tplParser, cfg2, _this);
				validator.init();

				// add listener, handle after validator validates
				// note that listener will be added on TemplateParser
				// when the "when" is initialized or submitting
				if (when == 'initialized') {
					validator.addListener('validated',
							_this.tplParser.initValidated, _this.tplParser);
				} else if (when == 'submitting') {
					// both templateParser and current component need to
					// handle submitting validation
					validator.addListener('validated',
							_this.tplParser.submitValidated, _this.tplParser);
					validator.addListener('validated',
							_this._validationHandler, _this);
				} else {
					validator.addListener('validated',
							_this._validationHandler, _this);
				}
			}
		}
	};

	// init combination
	var _initCombination = function() {
		var cfgs = config.combination || [];
		var len = cfgs.length;
		var cfg, combinator;
		for (var i=0; i<len; i++) {
			cfg = cfgs[i];
			combinator = new Template.Combinator(_this.tplParser, cfg, config.id);
			_this.tplParser.addCombinator(cfg.id, combinator);
		}
	};
};

/**
 * AbstractComponent is extended from Qmk.util.Observable.
 * @class Template.AbstractComponent
 * @extends Qmk.util.Observable
 */
Qmk.extend(Template.AbstractComponent, Qmk.util.Observable, {});

/**
 * Error Info Template.
 */
Template.AbstractComponent.ERR_INFO_TPL = new Qmk.XTemplate(
	'<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>'
	+ '<span class="sr-only">Error:</span>{errInfo}'
);
Template.AbstractComponent.ERR_INFO_TPL.compile();
