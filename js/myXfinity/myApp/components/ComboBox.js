/**
 * 
 * @param templateParser
 * @param config
 */
Template.ComboBox = function(templateParser, config) {
	var spc = Template.ComboBox.superclass;
	spc.constructor.call(this, templateParser, config);

	/* ------------------------- Fields ----------------------- */
	/**
	 * read-only
	 */
	this.type = 'ComboBox';

	/* --------------------- Private Fields -------------------- */
	var _this = this;
	var _compId = this.tplUtil.generateUniqueID();
	var _data;
	var _oldV = '';

	/* ------------------------ Methods ----------------------- */
	this.reload = function() {
		var dataCfg = config.data;
		if (!this.hasInit()) {
			var defer = dataCfg.defer;
			if (defer) {
				this._fireInitIfNeed();
				return;
			}
		}

		var from = dataCfg.from || 'static';
		if (from == 'static') {
			_setData(_data);
		} else {
			_data.addListener('loaded',
					_dataReload, this, {single: true});
			_data.reload();
		}
	};

	this.getValue = function() {
		return _getComboBoxField().val();
	};

	this.setValue = function(v) {
		var v = (v == null ? '' : v);
		var oldV = this.getValue();

		// wether value exists
		var valueExist = _getComboBoxField().find('option[value="' + v + '"]').length > 0;
		if (!valueExist) {
			return;
		}

		_getComboBoxField().val(v);

		if (v != oldV) {
			_fireChanged(v, oldV);
		}
	};

	this.clearValue = function() {
		this.setValue('');
	};

	this.getText = function() {
		return _getComboBoxField().find('option[value="' + this.getValue() + '"]').text();
	};

	this.setText = function(txt) {
		var options = _getComboBoxField().find('option');
		var option;
		for (var i = 0; i < options.length; i++) {
			option = $(options[i]);
			if (option.text() === txt) {
				this.setValue(option.attr('value'));
				break;
			}
		}
	};

	/**
	 * (override)
	 * return this component's description
	 */
	this.getPersistenceDesc = function() {
		return this.getText();
	};

	/**
	 * 
	 */
	this.setData = function(data) {
		var currentValue = this.getValue();
		var newValue = '';
		if (data != undefined) {
			var options = _genOptionsHTML(data);
			_getComboBoxField().html(options);

			// choose default
			newValue = currentValue;
			if (!_dataExistOldValue(data)) {
				newValue = _chooseDefaultValue(data);
			}
			_getComboBoxField().val(newValue);
		}

		// fire events
		_this._fireInitIfNeed();
		if (data != undefined) {
			_fireLoaded(data);
			_fireChanged(newValue, currentValue);
		}
	};

	this.isEnable = function() {
		var attr = _getComboBoxField().attr('disabled');
		return attr === undefined;
	};

	this.setEnable = function(b) {
		b ? _getComboBoxField().removeAttr('disabled')
			: _getComboBoxField().attr('disabled', 'disabled');
	};

	this.isEditable = function() {
		// always false
		return false;
	};

	this.setEditable = function(b) {
		// do nothing
	};

	/**
	 * @param JQuery Object form
	 */
	this.renderTo = function(form) {
		if (!this.component) {
			var tpl = Template.ComboBox.COMPONENT_TPL.applyTemplate({
				id : _compId,
				labelTxt : this.getLabel()
			});
			this.component = $(tpl);

			_getComboBoxField().on('change', function() {
				var newV = _this.getValue();
				var oldV = _oldV;
				_fireChanged(newV, oldV);
			});
		}

		this.component.appendTo(form);

		// init status
		this.setDisplay(config.display);
		this.setEnable(config.enable);
//		this.setEditable(config.editable);
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
		var textField = content.textField || 'text';
		var valueField = content.valueField || 'value';
		var dataField = content.dataField || 'data';
		var defaultIndex = content.defaultIndex;
		var defaultText = content.defaultText;
		var defaultValue = content.defaultValue;

		// restore configs to config.data
		dataCfg.textField = textField;
		dataCfg.valueField = valueField;
		dataCfg.dataField = dataField;
		dataCfg.defaultIndex = defaultIndex;
		dataCfg.defaultText = defaultText;
		dataCfg.defaultValue = defaultValue;

		var from = dataCfg.from || 'static';
		if (from == 'static') {
			_data = content[dataField] || [];
		} else {
			var cfg = {
				from : dataCfg.from,
				sourceName : dataCfg.sourceName,
				param : dataCfg.param
			};
			_data = new Template.Variable(this.tplParser, cfg, this);
			_data.init();
		}
	};

	/* --------------------- Private methods -------------------- */

	var _getComboBoxField = function() {
		return _this.component.find('#' + _compId + '-combobox');
	};

	var _dataReload = function() {
		var from = _data.from;
		var d = _data.getValue();
		if (from != 'static') {
			var dataField = config.data.dataField;
			d = d[dataField];
		}

		_setData(d);
	};

	var _setData = function(data) {
		var oldV = _this.getValue();
		var newV = oldV;
		if (data != undefined) {
			_loadData(data);
			newV = _chooseDefault(data);
		}

		_this._fireInitIfNeed();

		if (data != undefined) {
			_fireLoaded(data);
			_fireChanged(newV, oldV);
		}
	};

	var _loadData = function(data) {
		var dataCfg = config.data;

		var textField = dataCfg.textField;
		var valueField = dataCfg.valueField;
		var /*t=[], d, */len=data.length;
		var options = '';
		for (var i=0; i<len; i++) {
//			d = data[i];
//			t.push([d[textField], d[valueField]]);
			options += '<option value="' + data[i][valueField] + '">' + data[i][textField] + '</option>';
		}
//		_comboBox.store.loadData(t);
		_getComboBoxField().html(options);
	};

	var _chooseDefault = function(data) {
		var newV;
		var dataCfg = config.data;

		var defaultIndex = dataCfg.defaultIndex;
		var defaultValue = dataCfg.defaultValue;
		var defaultText = dataCfg.defaultText;
		var textField = dataCfg.textField;
		var valueField = dataCfg.valueField;

		if (defaultIndex != null && data.length > defaultIndex) {
			newV = data[defaultIndex][valueField];
		} else if (defaultValue != null) {
			newV = defaultValue;
		} else if (defaultText != null) {
			var t, len=data.length;
			for (var i=0; i<len; i++) {
				t = data[i][textField]
				if (t == defaultText) {
					newV = data[i][valueField];
					break;
				}
			}
		}

		if (newV == null && data.length > 0) {
			newV = data[0][valueField];
		}

		if (newV) {
//			_comboBox.setValue(newV);
			_getComboBoxField().val(newV);
		}

		return newV;
	};
	
	var _genOptionsHTML = function(data) {
		var dataCfg = config.data;
		var dataField = data.dataField || dataCfg.dataField;
		var textField = data.textField || dataCfg.textField;
		var valueField = data.valueField || dataCfg.valueField;
		var dataData = data[dataField] || [];
		var html = '';
		var len = dataData.length;

		for (var i = 0; i < len; i++) {
			html += '<option value="' + dataData[i][valueField] + '">' + dataData[i][textField] + '</option>';
		}

		return html;
	};

	// whether current value exists in new datas
	var _dataExistOldValue = function(data) {
		var currentValue = _this.getValue();
		if (currentValue == null || currentValue == '') {
			return false;
		}

		var dataCfg = config.data;
		var dataField = data.dataField || dataCfg.dataField;
		var textField = data.textField || dataCfg.textField;
		var valueField = data.valueField || dataCfg.valueField;
		var dataData = data[dataField] || [];
		var len = dataData.length;

		for (var i=0; i<len; i++) {
			if (currentValue == dataData[i][valueField]) {
				return true;
			}
		}

		return false;
	};

	var _chooseDefaultValue = function(data) {
		var dataCfg = config.data;
		var dataField = data.dataField || dataCfg.dataField;
		var defaultIndex = data.defaultIndex || dataCfg.defaultIndex;
		var defaultValue = data.defaultValue || dataCfg.defaultValue;
		var defaultText = data.defaultText || dataCfg.defaultText;
		var dataData = data[dataField] || [];
		var len = dataData.length;

		var dv = '';
		if (defaultIndex != null && defaultIndex < len) {
			dv = dataData[defaultIndex][valueField];
		} else if (defaultValue != null) {
			dv = defaultValue;
		} else if (defaultText != null) {
			var txt;
			for (var i=0; i<len; i++) {
				txt = dataData[i][textField];
				if (txt == defaultText) {
					dv = dataData[i][valueField];
					break;
				}
			}
		} else if (len > 0) {
			dv = dataData[0][valueField];
		}

		return dv;
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

	// qiaomingkui 20150901: no changing event any more
//	var _fireChanging = function(record, index) {
//		_clearInvalid();
//		_this.fireEvent('changing', _this, record, index);
//	};

	var _fireLoaded = function(d) {
		_this.fireEvent('loaded', _this, d);
	};
};

/**
 * All Components are extended from AbstractComponent.
 * @class Template.ComboBox
 * @extends Template.AbstractComponent
 */
Qmk.extend(Template.ComboBox, Template.AbstractComponent, {});

/**
 * component template.
 */
Template.ComboBox.COMPONENT_TPL = new Qmk.XTemplate(
	'<div id="{id}" class="form-group">'
		+ '<div class="col-sm-3">'
			+ '<label for="{id}-combobox" class="control-label">{labelTxt}</label>'
		+ '</div>'
		+ '<div class="col-sm-7">'
			+ '<select id="{id}-combobox" class="form-control">'
			+ '</select>'
			+ '<div id="{id}-err" class="alert alert-danger" role="alert" style="margin: 5px 0 0;display:none;"></div>'
		+ '</div>'
	+ '</div>'
);
Template.ComboBox.COMPONENT_TPL.compile();
