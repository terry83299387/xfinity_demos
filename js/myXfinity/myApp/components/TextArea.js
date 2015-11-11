/**
 * 
 * @param templateParser
 * @param config
 */
Template.TextArea = function(templateParser, config) {
	var spc = Template.TextArea.superclass;
	spc.constructor.call(this, templateParser, config);

	/* ------------------------- Fields ----------------------- */
	/**
	 * read-only
	 */
	this.type = 'TextArea';

	/* --------------------- Private Fields -------------------- */
	var _this = this;
	var _compId = this.tplUtil.generateUniqueID();
	var _data;
	var _oldV = '';

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
		return _getTextArea().val();
	};

	this.setValue = function(v) {
		v = (v == null ? '' : v);
		var oldV = this.getValue();
		_getTextArea().val(v);
		if (v != oldV) {
			_fireChanged(v, oldV);
		}
	};

	this.clearValue = function() {
		this.setValue('');
	};

	this.isEnable = function() {
		var attr = _getTextArea().attr('disabled');
		return attr === undefined;
	};

	this.setEnable = function(b) {
		b ? _getTextArea().removeAttr('disabled')
			: _getTextArea().attr('disabled', 'disabled');
	};

	this.isEditable = function() {
		var attr = _getTextArea().attr('readonly');
		return attr === undefined;
	};

	this.setEditable = function(b) {
		b ? _getTextArea().removeAttr('readonly')
			: _getTextArea().attr('readonly', 'readonly');
	};

	/**
	 * @param JQuery Object form
	 */
	this.renderTo = function(form) {
		if (!this.component) {
			var tpl = Template.TextArea.COMPONENT_TPL.applyTemplate({
				id : _compId,
				labelTxt : this.getLabel()
			});
			this.component = $(tpl);

			_getTextArea().on('change', function() {
				var newV = _this.getValue();
				var oldV = _oldV;
				_fireChanged(newV, oldV);
			});
			// changing TODO 暂不启用
//			_getTextArea().on('keypress', function(event) {
//				_fireChanging(event.keyCode, event);
//			});
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

	var _getTextArea = function() {
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
		if (v != undefined) // can not use _this.setValue(), as we do not need to fire change event now
			_getTextArea().val(v);

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
 * @class Template.TextArea
 * @extends Template.AbstractComponent
 */
Qmk.extend(Template.TextArea, Template.AbstractComponent, {});

/**
 * component template.
 */
Template.TextArea.COMPONENT_TPL = new Qmk.XTemplate(
	'<div id="{id}" class="form-group">'
		+ '<div class="col-sm-3">'
			+ '<label for="{id}-text" class="control-label">{labelTxt}</label>'
		+ '</div>'
		+ '<div class="col-sm-7">'
			+ '<textarea class="form-control" id="{id}-text" placeholder="" style="resize:vertical;"></textarea>'
			+ '<div id="{id}-err" class="alert alert-danger" role="alert" style="margin: 5px 0 0;display:none;"></div>'
		+ '</div>'
	+ '</div>'
);
Template.TextArea.COMPONENT_TPL.compile();
