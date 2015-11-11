/**
 * TODO 目前只支持下列情况：
 *   (1) linkageType为other
 *   (2) 无条件表达式，只有普通语句
 *   （相当于一个语句块中的多个语句集合，首尾不含有语句块界定符{}）
 * @param templateParser
 * @param config
 * @param compId
 */
Template.Combinator = function(templateParser, config, compId) {
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
	 * source id
	 * read-only
	 */
	this.source = (config.source || compId);
	/**
	 * target id
	 * read-only
	 */
	this.target = (config.target || compId);
	/**
	 * when to combinate. options could be:
	 * TODO
	 * 
	 * read-only
	 */
	this.when = (config.when || 'changed');
	/**
	 * read-only
	 */
//	this.linkageType = config.linkageType;
	/**
	 * this combinator depends other combinators.
	 * 
	 * read-only
	 */
//	this.depends = (config.depends || '');
	/**
	 * read-only
	 */
	this.content = config.content;

	/* --------------------- Private Fields -------------------- */
	var _this = this;
	var _exprParser = Template.CombinationExprParser;
	var _init = false;
	var _validateFailed = false;
	var _exprSplits;

	/* ------------------------ Methods ----------------------- */
	this.init = function() {
		if (_init) return;

		_initEvents();

		_exprSplits = _exprParser.splitExpr(this.content);

		_validateFailed = !_exprParser.validateExpr(_exprSplits);
		if (_validateFailed) {
			_init = true;
			return;
		}

		// 添加监听（如果是initialized/submitted，将监听添加到TemplateParser上）
		var whens = this.when.split(',');
		for (var i=0; i<whens.length; i++) {
			_addListener(whens[i]);
		}

		_init = true;
		this.fireEvent('initialized', this);
	};

	this.combinate = function() {
		if (!_init || _validateFailed) return false;

		var thisComp = this.tplParser.getEntity(compId);
		var source = this.tplParser.getEntity(this.source);
		var target = this.tplParser.getEntity(this.target);
		_exprParser.execExpr(_exprSplits, this.tplParser, thisComp, source, target);
	};

	/* --------------------- Private methods -------------------- */
	var _initEvents = function() {
		_this.events = {
			'initialized' : true,
			'combinated' : true
		};
	};

	var _addListener = function(when) {
		if (when == 'initialized' // not implement yet
				|| when == 'submitting'
				|| when == 'submitted'
				|| when == 'scriptedit') {
			_this.tplParser.addListener(
					when, _this.combinate, _this);
		} else {
			var entity = _this.tplParser.getEntity(_this.source);
			if (entity)
				entity.addListener(when, _this.combinate, _this);
		}
	};
};

/**
 * @class Template.Combinator
 * @extends Qmk.util.Observable
 */
Qmk.extend(Template.Combinator, Qmk.util.Observable);
