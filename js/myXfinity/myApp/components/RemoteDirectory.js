/**
 * 
 * @param templateParser
 * @param config
 */
Template.RemoteDirectory = function(templateParser, config) {
	var spc = Template.RemoteDirectory.superclass;
	spc.constructor.call(this, templateParser, config);

	/* ------------------------- Fields ----------------------- */
	/**
	 * read-only
	 */
	this.type = 'RemoteDirectory';

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
		var value = this.getRawValue();
		var clusterInfo = this.tplParser.getClusterInfo();
		if (clusterInfo) {
			value = (roleCode == 'group-admin' ? clusterInfo.rootDir : clusterInfo.workDir) + '/' + value;
		}

		return value;
	};

	this.getRawValue = function() {
		var value = _getTextField().val();
		value = value.replace(/^~[\/\\]/, '');
		if (/[\/\\]$/.test(value)) {
			value = value.substring(0, value.length - 1);
		}
		return value;
	};

	/**
	 * @param path path or full path
	 * @param dirName (optional) directory name (if path is not a full path)
	 */
	this.setValue = function(path, dirName) {
		var oldV = this.getRawValue();
		var v = path || '';
		if (!/^~?[\/\\]/.test(v)) v = '~/' + v;

		if (dirName) {
			if (!/[\/\\]$/.test(v)) v += '/';
			v += dirName;
		}

		_getTextField().val(v);

		if (v != oldV) {
			_fireChanged(v, oldV);
		}
//		Ext.ux.Util.setCursorLast(_workDir.el.dom); // TODO
	};

	this.clearValue = function() {
		this.setValue('');
	};

	this.getDirectory = function() {
		var v = this.getRawValue();
		if (!v) return '';

		var fileSeparator = _detectFileSeparator(v);
		var i = v.lastIndexOf(fileSeparator);
		if (i < 0) return v;

		return v.substring(i+1, v.length);
	};

	this.setDirectory = function(d) {
		d = d || '';

		this.setValue(this.getPath(), d);
	};

	this.getPath = function() {
		var v = this.getRawValue();
		if (!v) return '';

		var fileSeparator = _detectFileSeparator(v);
		var i = v.lastIndexOf(fileSeparator);
		if (i < 0) return '';

		var path = v.substring(0, i+1);
		path = path.replace(/^~[\/\\]/, '');
		return path;
	};

	this.setPath = function(p) {
		p = p || '';
		if (!/^~?[\/\\]/.test(p)) p = '~/' + p;
		if (!/[\/\\]$/.test(p)) p += '/';
		this.setValue(p, this.getDirectory());
	};

	/**
	 * (override)
	 * return this component's data for some persistent purpose
	 */
	this.getPersistenceData = function() {
		return this.getRawValue();
	};

	this.isEnable = function() {
		var textFieldDisabled = _getTextField().attr('disabled');
		var selBtnDisabled = _getSelButton().attr('disabled');
		return textFieldDisabled === undefined && selBtnDisabled === undefined;
	};

	this.setEnable = function(b) {
		if (b) {
			_getTextField().removeAttr('disabled');
			_getSelButton().removeAttr('disabled');
		} else {
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
			var tpl = Template.RemoteDirectory.COMPONENT_TPL.applyTemplate({
				id : _compId,
				labelTxt : this.getLabel()
			});
			this.component = $(tpl);

			_getTextField().on('change', function() {
				var newV = _this.getRawValue();
				var oldV = _oldV;
				_fireChanged(newV, oldV);
			});
			_getSelButton().on('click', _showDirBrowser);
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
			'dirselected' : true
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

		v = v || '';
		// 第一次加载时，如果目录值为空，并且是组管理员，则自动将工作目录定位到与组管理员用户同名目录下
		if (!_this.hasInit() && !v && roleCode == 'group-admin') {
			v = currentUserName + '/';
		}
		if (!/^~?[\/\\]/.test(v)) v = '~/' + v;
		_getTextField().val(v); // can not use _this.setValue(), as we do not need to fire change event now

		_this._fireInitIfNeed();

		if (v != undefined && v != oldV) {
			_fireChanged(v, oldV);
		}
//		Ext.ux.Util.setCursorLast(_workDir.el.dom); // TODO
	};

	var _showDirBrowser = function() {
		var clusterCode = _this.tplParser.getClusterCode();
		if (!clusterCode) {
			alert('clusterCode is null');
		}
		var browser = new Template.RemoteFileBrowser(clusterCode);
		var currentDir = _this.getRawValue();
		browser.setCurrentDirectory(currentDir);
		browser.setSelectionType(Template.RemoteFileBrowser.DIRECTORIES_ONLY);
		browser.getSelectFiles(function(path) {
			if (path != null) {
				if (/[\/\\]$/.test(path)) {
					path = path.substring(0, path.length - 1);
				}
				_this.setValue(path);
			}
		});
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

	var _detectFileSeparator = function(filePath) {
		var windows = /\\/;
		if (windows.test(filePath)) return '\\';
		// default to unix file-separator (/)
		return '/';
	};
};

/**
 * All Components are extended from AbstractComponent.
 * @class Template.RemoteDirectory
 * @extends Template.AbstractComponent
 */
Qmk.extend(Template.RemoteDirectory, Template.AbstractComponent, {});

/**
 * component template.
 */
Template.RemoteDirectory.COMPONENT_TPL = new Qmk.XTemplate(
	'<div id="{id}" class="form-group">'
		+ '<div class="col-sm-3">'
			+ '<label for="{id}-text" class="control-label">{labelTxt}</label>'
		+ '</div>'
		+ '<div class="col-sm-7">'
			+ '<input type="text" class="form-control" id="{id}-text" placeholder="" />'
			+ '<div id="{id}-err" class="alert alert-danger" role="alert" style="margin: 5px 0 0;display:none;"></div>'
		+ '</div>'
		+ '<div class="col-sm-2">'
			+ '<a href="javascript:void(0);" id="{id}-btn" class="btn btn-block btn-primary"><i class="fa fa-fw fa-search"></i>浏览</a>'
		+ '</div>'
	+ '</div>'
);
Template.RemoteDirectory.COMPONENT_TPL.compile();
