/**
 * 
 * @param templateParser
 * @param config
 * @param relatedComponent
 */
Template.Validator = function(templateParser, config, relatedComponent) {
	var spc = Template.Validator.superclass;
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
	this.content = config.content;
	/**
	 * read-only
	 */
	this.level = (config.level || 'error');
	/**
	 * read-only
	 * i18n label code
	 */
	this.label = config.label;
	/**
	 * when to validate. options could be:
	 * loaded, changing, changed(default), submitting.
	 * 
	 * read-only
	 */
	this.when = (config.when || 'changed');
	/**
	 * this validator depends other validators.
	 * 
	 * read-only
	 */
	this.depends = (config.depends || '');

	/**
	 * related component's id.
	 * used to represent this in expressions
	 */
	this.relatedComponent = relatedComponent;

	/* --------------------- Private Fields -------------------- */
	var _NOERR = 0;
	var _INTERR = 1;
	var _USRERR = 2;

	var _this = this;
	var _exprParser = Template.ValidationExprParser;
	var _init = false;
	var _exprSplits;
	var _exprCorrect = true;

	var _valid = true;
	/*
	 * 错误信息类型。包括内部错误信息和用户自定义信息
	 * 内部错误包括：未初始化、表达式语法错误等
	 * TODO 内部错误信息也需要国际化
	 */
	var _errType = _NOERR;
	var _errInfo = 'not initialized.';
	var _errInfoFetched = false;

	/* ------------------------ Methods ----------------------- */
	this.init = function() {
		if (_init) return;

		_initEvents();

		_exprSplits = _exprParser.splitExpr(this.content);

		_exprCorrect = _exprParser.validateExpr(_exprSplits);
		if (!_exprCorrect) {
			_setErr(false, _INTERR, 'incorrect expression');
			_init = true;
			return;
		}

		if (this.when == 'initialized'
				|| this.when == 'submitting'
				|| this.when == 'scripteidt') {
			this.tplParser.addListener(
					this.when, this.validate, this);
		} else {
			this.relatedComponent.addListener(
					this.when, this.validate, this);
		}

		/* 
		 * fetch error info if "when" is submitting, since the
		 * validating activity needs return immediately when
		 * doing submit. As contrast, it might do a little later
		 * in other situation (after fetching error info accomplished)
		 */
		if (this.when == 'submitting')
			_fetchErrInfo();

		_init = true;
		this.fireEvent('initialized', this);
	};

	/**
	 * 执行验证。整个过程是递归的：
	 * (1) 如果是起始符，将其压入堆栈
	 * push(BS)
	 * (2) 如果是子表达式（设该子表达式为Exp，子表达式的计算在后面详述）
	 *   1. 若栈顶为{not}，则丢弃{not}，对Exp求反，将求反后的结果入栈
	 *   2. 若栈顶为{or}，则丢弃{or}，取出前一个Exp，并将2个表达式取或
	 *   3. 若栈顶为{and}，则丢弃{and}，取出前一个Exp，并将2个表达式取与
	 *   4. 若栈顶为{，或栈为空，则将结果直接入栈
	 * (3) 终止符(})
	 *   此时栈顶为{}表达式块中的结果，而紧接其后的元素则为{。取出栈顶的结果，并丢弃{，然后执行与(2)相同的步骤
	 * (4) 表达式结束，此时栈中已是最终结果
	 */
	this.validate = function() {
		if (!_init || !_exprCorrect) return false;

		var stack = [];
		var split, curStackTop, exp;
		var startOp = /^{((not|and|or)})?$/;
		var endOp = /^}$/;
		var leftBrace = /^{$/;
		var len = _exprSplits.length;
		for (var i=0; i<len; i++) {
			split = _exprSplits[i];
			if (typeof split != 'string') {
				exp = _exprParser.calcSubExpr(split, this.tplParser, this.relatedComponent);
				if (typeof exp != 'boolean') {
					_setErr(false, _INTERR, 'calculate express error');
					this.fireEvent('interror', _this, _errInfo);
					return;
				}
				exp = _exprParser.relationCalc(stack, exp);
				stack.push(exp);
			} else if (startOp.test(split)) {
				stack.push(split);
			} else if (endOp.test(split)) {
				exp = stack.pop();
				stack.pop(); // discard top element ("{")
				exp = _exprParser.relationCalc(stack, exp);
				stack.push(exp);
			}
		}

		_setErr(stack.pop(), _USRERR);
		if (_valid || _errInfoFetched
				// return directly when submitting
				|| this.when == 'submitting')
			this.fireEvent('validated', this, _valid, this.level, _errInfo);
	};

	this.getErrInfo = function() {
		return _errInfo;
	};

	/* --------------------- Private methods -------------------- */
	var _initEvents = function() {
		_this.events = {
			'initialized' : true,
			'interror' : true,
			'validated' : true
		};
	};

	/*
	 * info is optional
	 */
	var _setErr = function(valid, type, info) {
		_valid = valid;
		_errType = valid ? _NOERR : type;
		if (valid) {
			_errInfo = '';
		} else if (type == _USRERR) { // user error
			if (!_errInfoFetched) {
				_fetchErrInfo();
			} else {
				_errInfo = _errInfoFetched;
			}
		} else // internal error
			_errInfo = info || '';
	};

	var _fetchErrInfo = function() {
		_this.tplUtil.delayFetchLabels.delayFetch(_this.label, _fetchErrInfoCallback);
	};

	var _fetchErrInfoCallback = function(success, label) {
		// judge the window has been closed
		if (templateParser.hasWinClosed()) {
			return;
		}

		if (success) {
			_errInfoFetched = _errInfo = label;
			_this.fireEvent('validated', _this, _valid, _this.level, _errInfo);
		} else {
			_setErr(false, _INTERR, 'fetch err info failed.');
			_this.fireEvent('interror', _this, _errInfo);
		}
	};
};

/**
 * @class Template.Validator
 * @extends Qmk.util.Observable
 */
Qmk.extend(Template.Validator, Qmk.util.Observable);
