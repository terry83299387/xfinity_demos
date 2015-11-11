/**
 * 
 * @param templateParser
 * @param config
 */
Template.SingleFile = function(templateParser, config) {
	var spc = Template.SingleFile.superclass;
	spc.constructor.call(this, templateParser, config);

	/* ------------------------- Fields ----------------------- */
	/**
	 * read-only
	 */
	this.type = 'SingleFile';
	/**
	 * read-only
	 */
	this.LOCAL = 'local';
	 /**
	  * read-only
	 */
	this.REMOTE = 'remote';

	/* --------------------- Private Fields -------------------- */
	var _this = this;
	var _compId = this.tplUtil.generateUniqueID();
	var _data;
	var _oldV = '';
	var _lastSelectedFile = '';

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
		var file = this.getRawValue();
		if (!file) return '';

		if (this.getType() == this.LOCAL) {
			var workDir = this.tplParser
					.getComponentByType(this.tplUtil.jsdlKeys.WORK_DIR);
			var fileName = _getFileName(file);
			file = workDir.getValue() + '/' + fileName;
		} else {
			var clusterInfo = this.tplParser.getClusterInfo();
			if (clusterInfo)
				file = clusterInfo.rootDir + '/' + file;
		}

		return file;
	};

	this.getRawValue = function() {
		return _getTextField().val();
	};

	this.getFileName = function() {
		var file = this.getRawValue();
		if (!file) return '';

		return _getFileName(file);
	};

	this.setValue = function(v) {
		var v = (v == null ? '' : v);
		var oldV = this.getRawValue();
		_getTextField().val(v);
		if (v != oldV) {
			_fireChanged(v, oldV);
		}
//		Ext.ux.Util.setCursorLast(_file.el.dom); // TODO
	};

	this.clearValue = function() {
		this.setValue('');
		_lastSelectedFile = '';
	};

	this.getType = function() {
		return _getTypeField().val();
	};

	this.setType = function(type) {
		var t = (this.getType() == this.LOCAL
				? this.REMOTE : this.LOCAL);
		if (type != t) return;

		_getTypeField().val(type);

		t = this.getRawValue();
		this.setValue(_lastSelectedFile);
		_lastSelectedFile = t;
	};

	/**
	 * (override)
	 * return this component's data for some persistent purpose
	 */
	this.getPersistenceData = function() {
		var v = this.getRawValue();
		if (!v) return '';

		return this.getType() + v;
	};

	/**
	 * (override)
	 * return this component's description
	 */
	this.getPersistenceDesc = function() {
		var v = this.getRawValue();
		if (!v) return '';

		return this.getType() + ':' + v;
	};

	/**
	 * (override)
	 * restore component's data from persistence
	 */
	this.restorePersistenceData = function(data) {
		if (!data) return;

		var isLocal = /^local/;
		var isRemote = /^remote/;
		if (isLocal.test(data)) {
			this.setType(this.LOCAL);
			this.setValue(data.substring(5));
		} else if (isRemote.test(data)) {
			this.setType(this.REMOTE);
			this.setValue(data.substring(6));
		}
	};

	this.isEnable = function() {
		var typeSelDisabled = _getTypeField().attr('disabled');
		var textFieldDisabled = _getTextField().attr('disabled');
		var selBtnDisabled = _getSelButton().attr('disabled');
		return typeSelDisabled === undefined
			&& textFieldDisabled === undefined
			&& selBtnDisabled === undefined;
	};

	this.setEnable = function(b) {
		if (b) {
			_getTypeField().removeAttr('disabled');
			_getTextField().removeAttr('disabled');
			_getSelButton().removeAttr('disabled');
		} else {
			_getTypeField().attr('disabled', 'disabled');
			_getTextField().attr('disabled', 'disabled');
			_getSelButton().attr('disabled', 'disabled');
		}
	};

	this.isEditable = function() {
		var attr = _getTextField().attr('readonly');
		return attr === undefined;
	};

	this.setEditable = function(b) {
		b ? _getTextField().removeAttr('readonly')
			: _getTextField().attr('readonly', 'readonly');
	};

	/**
	 * @param JQuery Object form
	 */
	this.renderTo = function(form) {
		if (!this.component) {
			var tpl = Template.SingleFile.COMPONENT_TPL.applyTemplate({
				id : _compId,
				labelTxt : this.getLabel()
			});
			this.component = $(tpl);

			_getTypeField().on('change', _typeChanged);
			_getTextField().on('change', function() {
				var newV = _this.getRawValue();
				var oldV = _oldV;
				_fireChanged(newV, oldV);
			});
			_getSelButton().on('click', _showFileBrowser);
		}

		this.component.appendTo(form);

		var dataCfg = config.data;
		var content = dataCfg.content;
		this.setType(content[dataCfg.typeField] || this.LOCAL);

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
			'changed' : true
		});
	};

	/**
	 * (Protected)
	 */
	this._initData = function() {
		var dataCfg = config.data;
		var content = Qmk.util.JSON.decode(dataCfg.content) || {};
		dataCfg.content = content;
		var typeField = content.typeField || 'type';
		var valueField = content.valueField || 'value';
		// 以后可能还需要typeField/valueField的值来做一些判断
		dataCfg.typeField = typeField;
		dataCfg.valueField = valueField;

		// 若content中定义了value的值，用content中的value值
		var value;
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

	var _getTypeField = function() {
		return _this.component.find('#' + _compId + '-type');
	};

	var _getTextField = function() {
		return _this.component.find('#' + _compId + '-text');
	};

	var _getSelButton = function() {
		return _this.component.find('#' + _compId + '-btn');
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
		var oldV = _this.getRawValue();
		if (v != undefined) // can not use _this.setValue(), as we do not need to fire change event now
			_getTextField().val(v);

		_this._fireInitIfNeed();

		if (v != undefined && v != oldV) {
			_fireChanged(v, oldV);
		}
//		Ext.ux.Util.setCursorLast(_file.el.dom); // TODO
	};

	var _typeChanged = function(event) {
		var type = $(this).val();

		var t = _this.getRawValue();
		_this.setValue(_lastSelectedFile);
		_lastSelectedFile = t;
	};

	var _showFileBrowser = function() {
		if (_this.getType() == _this.REMOTE) { // remote
			var clusterCode = _this.tplParser.getClusterCode();
			if (!clusterCode) {
				alert('clusterCode is null');
			}
			var browser = new Template.RemoteFileBrowser(clusterCode);
			var workDirEle = _this.tplParser.getComponentByType(_this.tplUtil.jsdlKeys.WORK_DIR);
			var currentDir = workDirEle.getRawValue();
			browser.setCurrentDirectory(currentDir);
			browser.setSelectionType(Template.RemoteFileBrowser.FILES_ONLY);
			browser.getSelectFiles(function(file) {
				if (file)
					_this.setValue(file);
			});
		} else { // local
			var fileBrowser = PluginManager.getFileBrowser();
			if (fileBrowser != null) {
				var lastDir = myGetCookie('uploaddir') || _this.getValue();
				if (lastDir) {
					fileBrowser.setCurrentDirectory(lastDir);
				}
				// single selection mode
				fileBrowser.setSelectionMode(false);

				var file = fileBrowser.getSelectFiles('');
				if (file) {
					_this.setValue(file);
					mySetCookie('uploaddir', file);
				}
			}
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

	var _getFileName = function(fullPath) {
		var fileSeperator = _detectFileSeprator(fullPath);
		return fullPath.substring(
				fullPath.lastIndexOf(fileSeperator)+1, fullPath.length);
	};

	var _detectFileSeprator = function(filePath) {
		var windows = /\\/;
		if (windows.test(filePath)) return '\\';
		// default to unix file-seperator (/)
		return '/';
	};
};

/**
 * All Components are extended from AbstractComponent.
 * @class Template.SingleFile
 * @extends Template.AbstractComponent
 */
Qmk.extend(Template.SingleFile, Template.AbstractComponent, {});

/**
 * component template.
 */
Template.SingleFile.COMPONENT_TPL = new Qmk.XTemplate(
	'<div id="{id}" class="form-group">'
		+ '<div class="col-sm-3">'
			+ '<label for="{id}-text" class="control-label">{labelTxt}</label>'
		+ '</div>'
		+ '<div class="col-sm-7">'
			+ '<select id="{id}-type" class="form-control" style="display:inline-block;width:25%;margin-right:2%;">'
				+ '<option value="local">本地</option>'
				+ '<option value="remote">主机</option>'
			+ '</select>'
			+ '<input type="text" class="form-control" id="{id}-text" style="display:inline;width:73%;">'
			+ '<div id="{id}-err" class="alert alert-danger" role="alert" style="margin: 5px 0 0;display:none;"></div>'
		+ '</div>'
		+ '<div class="col-sm-2">'
			+ '<a href="javascript:void(0);" id="{id}-btn" class="btn btn-block btn-primary"><i class="fa fa-fw fa-folder-open-o"></i>选择</a>'
		+ '</div>'
	+ '</div>'
);
Template.SingleFile.COMPONENT_TPL.compile();
