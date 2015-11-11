/**
 * 
 * @param templateParser
 * @param config
 */
Template.NumberField = function(templateParser, config) {
	var spc = Template.NumberField.superclass;
	spc.constructor.call(this, templateParser, config);

	/* ------------------------- Fields ----------------------- */
	/**
	 * read-only
	 */
	this.type = 'NumberField';

	/* --------------------- Private Fields -------------------- */
	var _this = this;
	var _compId = this.tplUtil.generateUniqueID();
	var _data;
	var _oldV = 0;

	/* ------------------------ Methods ----------------------- */
	this.reload = function() {
		if (!this.hasInit()) {
			var defer = config.data.defer;
			if (defer) {
				this._fireInitIfNeed();
				return;
			}
		}

		_data.addListener('loaded',
				_dataReload, this, {single: true});
		_data.reload();
	};

	this.getValue = function() {
		var v = _getNumberField().val();
		return v === '' ? '' : +v;
	};

	this.setValue = function(v) {
		v = (v == null || v === '' ? '' : +v);
		if (isNaN(v)) {
			v = '';
		}
		var oldV = this.getValue();
		_getNumberField().val(v);
		if (v != oldV) {
			_fireChanged(v, oldV);
		}
	};

	this.clearValue = function() {
		this.setValue('');
	};

	this.isEnable = function() {
		var attr = _getNumberField().attr('disabled');
		return attr === undefined;
	};

	this.setEnable = function(b) {
		b ? _getNumberField().removeAttr('disabled')
			: _getNumberField().attr('disabled', 'disabled');
	};

	this.isEditable = function() {
		var attr = _getNumberField().attr('readonly');
		return attr === undefined;
	};

	this.setEditable = function(b) {
		b ? _getNumberField().removeAttr('readonly')
			: _getNumberField().attr('readonly', 'readonly');
	};

	/**
	 * In NumberField, function getValue() returns 0 (not a string "0"),
	 * which causes expression "this.getValue() == "" returns true.
	 * (in Javascript, 0 == "" is true), so we use === instead of ==
	 */
	this.isEmpty = function() {
		return (this.getValue() === '');
	};

	/**
	 * @param JQuery Object form
	 */
	this.renderTo = function(form) {
		if (!this.component) {
			var tpl = Template.NumberField.COMPONENT_TPL.applyTemplate({
				id : _compId,
				labelTxt : this.getLabel()
			});
			this.component = $(tpl);

			_getNumberField().on('change', function() {
				var newV = _this.getValue();
				var oldV = _oldV;
				_fireChanged(newV, oldV);
			});
			// changing
			_getNumberField().on('keypress', function(event) {
				var keyCode = event.keyCode;
				var needStop = false;

				if (keyCode == 0x2E) { // dot
					var v = _getNumberField().val();
					if (/\./.test(v)) {
						needStop = true;
					}
				} else if (keyCode == 0x2B || keyCode == 0x2D) { // +/-
					if (!_this.isEmpty()) {
						needStop = true;
					}
				} else if (keyCode >= 0x30 && keyCode <= 0x39) {
					needStop = false;
				} else {
					needStop = true;
				}

				if (needStop) {
					event.preventDefault();
					event.stopPropagation();
				} else {
					 // changing TODO 暂不启用
//					_fireChanging(event.keyCode, event);
				}
			});
		}

		this.component.appendTo(form);

		// init status
		this.setDisplay(config.display);
		this.setEnable(config.enable);
		this.setEditable(config.editable);
	};

	/**
	 * (Protected)
	 * @see AbstractComponent._initEvent()
	 */
	this._initEvents = function() {
		this.addEvents({
			'loaded'  : true,
			'changed' : true,
			'changing' : true
		});
	};

	/**
	 * (Protected)
	 */
	this._initData = function() {
		var dataCfg = config.data;
		var content = Qmk.util.JSON.decode(dataCfg.content) || {};
		dataCfg.content = content;
		var valueField = content.valueField || 'value';
		// 以后可能还需要valueField的值来做一些判断
		dataCfg.valueField = valueField;

		var value;
		// 若content中定义了value的值，用content中的value值
		if (content.hasOwnProperty(valueField)) {
			value = content[valueField];
		} else {
			value = dataCfg.value || '';
		}

		var cfg = {
			from : dataCfg.from,
			sourceName : dataCfg.sourceName,
			param : dataCfg.param,
			value : value
		};
		_data = new Template.Variable(this.tplParser, cfg, this);
		_data.init();
	};

	/* --------------------- Private methods -------------------- */

	var _getNumberField = function() {
		return _this.component.find('#' + _compId + '-text');
	};

	var _dataReload = function() {
		var from = _data.from;
		var v = _data.getValue();
		if (from != 'static') {
			var valueField = config.data.valueField;
			v = v[valueField];
		}

		_setValue(v);
		_this.fireEvent('loaded', _this, v);
	};

	var _setValue = function(v) {
		var oldV = _this.getValue();
		if (v != undefined) { // can not use _this.setValue(), as we do not need to fire change event now
			v = (v === '' ? '' : +v);
			if (isNaN(v)) {
				v = '';
			}
			_getNumberField().val(v);
		}

		_this._fireInitIfNeed();

		if (v != undefined && v != oldV) {
			_fireChanged(v, oldV);
		}
	};

	var _clearInvalid = function() {
		// TODO
	};

	var _fireChanged = function(newV, oldV) {
		_clearInvalid();
		_this.fireEvent('changed', _this, newV, oldV);

		// update old value
		_oldV = newV;
	};

	var _fireChanging = function(key, e) {
		_clearInvalid();
		_this.fireEvent('changing', _this, key, e);
	};
};

/**
 * All Components are extended from AbstractComponent.
 * @class Template.NumberField
 * @extends Template.AbstractComponent
 */
Qmk.extend(Template.NumberField, Template.AbstractComponent, {});

/**
 * component template.
 */
Template.NumberField.COMPONENT_TPL = new Qmk.XTemplate(
	'<div id="{id}" class="form-group">'
		+ '<div class="col-sm-3">'
			+ '<label for="{id}-text" class="control-label">{labelTxt}</label>'
		+ '</div>'
		+ '<div class="col-sm-7">'
			+ '<input type="text" class="form-control" id="{id}-text" placeholder="" />'
			+ '<div id="{id}-err" class="alert alert-danger" role="alert" style="margin: 5px 0 0;display:none;"></div>'
		+ '</div>'
	+ '</div>'
);
Template.NumberField.COMPONENT_TPL.compile();
