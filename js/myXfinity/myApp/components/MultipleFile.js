/**
 * 
 * @param templateParser
 * @param config
 */
Template.MultipleFile = function(templateParser, config) {
	var spc = Template.MultipleFile.superclass;
	spc.constructor.call(this, templateParser, config);

	/* ------------------------- Fields ----------------------- */
	/**
	 * read-only
	 */
	this.type = 'MultipleFile';
	/**
	 * read-only
	 */
	this.LOCAL = 'local';
	 /**
	  * read-only
	 */
	this.REMOTE = 'remote';

	/* --------------------- Private Fields -------------------- */
	var _FILE_PANEL_SHOW_HIDE_DELAY = 300;
	var _this = this;
	var _compId = this.tplUtil.generateUniqueID();
	var _data;

	/*
	 * current chosen files. each file has a key which value
	 * is its name; and has properties shown here:
	 * 
	 * file : full path of this file
	 * type : file's type, would be local or remote
	 * item : a browser component used to show this file
	 * tooltip : a tooltip used to show file details (as: full path)
	 * 
	 * so, each item in the _files would look like:
	 * 	"fileName" : {
	 * 		file : full path,
	 * 		type : the file type,
	 * 		item : a component,
	 * 		tooltip : a tooltip
	 * 	}
	 * 
	 * note that if a file has been removed/deleted from choosing list,
	 * its name still exists, though its entity is not an object in
	 * which holds properties, but a boolean value "false" instead.
	 * 
	 */
	var _files = {};

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
			this.fireEvent('loaded', this, _data);
		} else {
			_data.addListener('loaded',
					_dataReload, this, {single: true});
			_data.reload();
		}
	};

	this.getValue = function() {
		var workDirComp = this.tplParser
				.getComponentByType(this.tplUtil.jsdlKeys.WORK_DIR);
		var workDir = workDirComp.getValue();
		var clusterInfo = this.tplParser.getClusterInfo();
		var home = clusterInfo ? clusterInfo.rootDir + '/' : '';

		var tValue = '';
		var file;
		for (var fileName in _files) {
			file = _files[fileName];
			if (!file) continue; // which has been removed
			if (tValue) tValue += '#'; // seperate character
			if (file.type == this.LOCAL) {
				tValue += 'file:///' + workDir + '/' + fileName;
			} else {
				tValue += 'file:///' + home + file.file;
			}
		}

		return tValue;
	};

	this.setValue = function(v) {
		// TODO not supported yet
	};

	this.clearValue = function() {
		// TODO not supported yet
	};

	this.getLocalFiles = function() {
		var localFiles = [];
		var file;
		for (var fileName in _files) {
			file = _files[fileName];
			if (!file) continue; // which has been removed
			if (file.type == this.LOCAL)
				localFiles.push(file.file);
		}

		return localFiles;
	};

	this.getRemoteFiles = function() {
		var remoteFiles = [];
		var file;
		for (var fileName in _files) {
			file = _files[fileName];
			if (!file) continue; // which has been removed
			if (file.type == this.REMOTE)
				remoteFiles.push(file.file);
		}

		return remoteFiles;
	};

	this.getAllFiles = function() {
		var files = [];
		var file;
		for (var fileName in _files) {
			file = _files[fileName];
			if (!file) continue; // which has been removed
			files.push(file.file);
		}

		return files;
	};

	this.getFileName = function(fullPath) {
		return _getFileName(fullPath);
	};

	this.setData = function(data) {
		_addFiles(data, this.REMOTE);
	};

	/**
	 * (override)
	 * return this component's data for some persistent purpose
	 */
	this.getPersistenceData = function() {
		return ''; // TODO not supported yet
	};

	this.isEnable = function() {
		var localBtnDisabled = _getLocalBtn().attr('disabled');
		var remoteBtnDisabled = _getRemoteBtn().attr('disabled');
		return localBtnDisabled === undefined
			&& remoteBtnDisabled === undefined;
	};

	this.setEnable = function(b) {
		if (b) {
			_getLocalBtn().removeAttr('disabled');
			_getRemoteBtn().removeAttr('disabled');
			_getShowBtn().removeAttr('disabled');
		} else {
			_getLocalBtn().attr('disabled', 'disabled');
			_getRemoteBtn().attr('disabled', 'disabled');
			_getShowBtn().attr('disabled', 'disabled');
		}

		if (_getHideBtn().is(':visible')) {
			_getFilePanel().hide();
			_getHideBtn().hide();
			_getShowBtn().show();
		}
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
			var tpl = Template.MultipleFile.COMPONENT_TPL.applyTemplate({
				id : _compId,
				labelTxt : this.getLabel()
			});
			this.component = $(tpl);

			_getLocalBtn().on('click', _selectLocalFiles);
			_getRemoteBtn().on('click', _selectRemoteFiles);
			// showBtn, hideBtn
			_getShowBtn().on('click', _showBtnClick);
			_getHideBtn().on('click', _hideBtnClick);
		}

		this.component.appendTo(form);

		// init status
		this.setDisplay(config.display);
		this.setEnable(config.enable);
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
		var fileField = content.fileField || 'file';
		var typeField = content.typeField || 'type';
		var dataField = content.dataField || 'data';
		// restore configs to config.data
		dataCfg.fileField = fileField;
		dataCfg.typeField = typeField;
		dataCfg.dataField = dataField;

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

	var _getLocalBtn = function() {
		return _this.component.find('#' + _compId + '-localbtn');
	};

	var _getRemoteBtn = function() {
		return _this.component.find('#' + _compId + '-remotebtn');
	};

	var _getHideBtn = function() {
		return _this.component.find('#' + _compId + '-hidebtn');
	};

	var _getShowBtn = function() {
		return _this.component.find('#' + _compId + '-showbtn');
	};

	var _getFilePanel = function() {
		return _this.component.find('#' + _compId + '-file');
	};

	var _dataReload = function() {
		var from = _data.from;
		var d = _data.getValue();
		if (from != 'static') {
			var dataField = config.data.dataField;
			d = d[dataField];
		}

		_setData(d);
		_this.fireEvent('loaded', _this, d);
	};

	var _setData = function(data) {
		if (data != undefined) {
			_loadData(data);
		}

		_this._fireInitIfNeed();

		if (data != undefined) {
			_fireChanged();
		}
	};

	var _loadData = function(data) {
		var len = data.length;
		if (len == 0) return;

		var dataCfg = config.data;
		var fileField = dataCfg.fileField;
		var typeField = dataCfg.typeField;

		var localFiles=[], remoteFiles=[], item, file, type;
		for (var i=0; i<len; i++) {
			item = data[i];
			file = item[fileField];
			type = item[typeField];
			if (type == _this.REMOTE) remoteFiles.push(file);
			else localFiles.push(file);
		}

		_addFiles(localFiles, _this.LOCAL);
		_addFiles(remoteFiles, _this.REMOTE);
	};

	var _selectLocalFiles = function() {
		var fileBrowser = PluginManager.getFileBrowser();
		if (fileBrowser != null) {
			var lastDir = myGetCookie('uploaddir');
			if (lastDir) {
				fileBrowser.setCurrentDirectory(lastDir);
			}
			// multiple selection mode
			fileBrowser.setSelectionMode(true);

			var files = fileBrowser.getSelectFiles('');
			if (!files) return;

			var filesArr = files.split('|');
			_addFiles(filesArr, _this.LOCAL);
			mySetCookie('uploaddir', _getFilePath(filesArr[0]));
		}
	};

	var _selectRemoteFiles = function() {
		var clusterCode = _this.tplParser.getClusterCode();
		if (!clusterCode) {
			alert('clusterCode is null');
		}
		var browser = new Template.RemoteFileBrowser(clusterCode);
		var workDirEle = _this.tplParser.getComponentByType(_this.tplUtil.jsdlKeys.WORK_DIR);
		var currentDir = workDirEle.getRawValue();
		browser.setCurrentDirectory(currentDir);
		browser.setSelectionType(Template.RemoteFileBrowser.FILES_ONLY);
		browser.setSelectionMode(true); // multi-selection mode
		browser.getSelectFiles(function(files) {
			if (files) {
				files = files.split('|');
				_addFiles(files, _this.REMOTE);				
			}
		});
	};

	var _showBtnClick = function() {
		_getFilePanel().show(_FILE_PANEL_SHOW_HIDE_DELAY);
		_getShowBtn().hide();
		_getHideBtn().show();
	};

	var _hideBtnClick = function() {
		_getFilePanel().hide(_FILE_PANEL_SHOW_HIDE_DELAY);
		_getHideBtn().hide();
		_getShowBtn().show();
	};

	var _addFiles = function(files, type) {
		var fileFullPath, fileName, len=files.length;
		for (var i=0; i<len; i++) {
			fileFullPath = files[i];
			if (_checkFileDuplication(fileFullPath)) {
				// ignore
				continue;
			}
			fileName = _getFileName(fileFullPath);
			if (_checkFileNameDuplication(fileName)) {
				// show error
				;
				continue;
			}

			_addFileItem(fileFullPath, type);
		}

		if (len > 0 && !_getShowBtn().is(':visible')) {
			_getHideBtn().show();
		}
	};

	var _getFileName = function(fullPath) {
		var fileSeperator = _detectFileSeparator(fullPath);
		var idx = fullPath.lastIndexOf(fileSeperator);
		return idx === -1 ? fullPath : fullPath.substring(idx+1, fullPath.length);
	};

	var _getFilePath = function(fullPath) {
		var fileSeperator = _detectFileSeparator(fullPath);
		var idx = fullPath.lastIndexOf(fileSeperator);
		return idx === -1 ? fullPath : fullPath.substring(0, idx+1);
	};

	var _checkFileDuplication = function(fullPath) {
		var fileName = _getFileName(fullPath);

		return _files.hasOwnProperty(fileName)
				&& _files[fileName] !== false
				&& _files[fileName].file == fullPath;
	};

	var _checkFileNameDuplication = function(fileName) {
		return _files.hasOwnProperty(fileName)
				&& _files[fileName] !== false;
	};

	var _addFileItem = function(fullPath, type) {
		var fileName = _getFileName(fullPath);
		var fileQName = _getFileQName(fullPath);

		var item = $(Template.MultipleFile.FILE_ITEM_TPL.applyTemplate({
			fileName : fileQName,
			fullPath : fullPath
		}));
		// typeIcon. only show appropriate remote or local icon
		type === _this.LOCAL ? item.find('a[data-name="remote"]').hide() : item.find('a[data-name="local"]').hide();

		var filePanel = _getFilePanel();
		item.appendTo(filePanel);
		filePanel.show(_FILE_PANEL_SHOW_HIDE_DELAY);

		// delete button
		item.find('a[data-name="delete"]').on('click', _delFileItem);

		_files[fileName] = {
			file : fullPath,
			type : type,
			item : item
		};
	};

	var _delFileItem = function() {
		var fullPath = $(this).parent().attr('data-fullpath');
		var fileName = _getFileName(fullPath);
		var o = _files[fileName];
		var item = o.item;

		item.remove();

		// set this file to be false, which means the file has been deleted
		_files[fileName] = false;
		if (!_hasFile())
			_getHideBtn().hide();
	};

	// can display 30 lowercases, or 20 uppercases, or 15 Hanzi
	var _getFileQName = function(fullPath) {
		var qName = _getFileName(fullPath);
		var len = qName.length;
		if (len > 15) {
			var sumLen = 0;
			var maxLen = 30;
			var charA = 0x41;
			var charZ = 0x5A;
			var c;
			for (var i=0; i<len; i++) {
				c = qName.charCodeAt(i);
				if (c > 255) sumLen += 2;
				else if (c >= charA && c <= charZ)
					sumLen += 1.5;
				else sumLen++;

				if (sumLen > maxLen) {
					qName = qName.substring(0, i+1);
					break;
				}
			}
		}
		return qName;
	};

	var _detectFileSeparator = function(filePath) {
		var windows = /\\/;
		if (windows.test(filePath)) return '\\';
		// default to unix file-separator (/)
		return '/';
	};

	var _hasFile = function() {
		var o;
		for (var k in _files) {
			o = _files[k];
			if (o) return true;
		}
		return false;
	};

	var _clearInvalid = function() {
		// TODO
	};

	var _fireChanged = function() {
		_clearInvalid();
		_this.fireEvent('changed', _this);
	};
};

/**
 * All Components are extended from AbstractComponent.
 * @class Template.MultipleFile
 * @extends Template.AbstractComponent
 */
Qmk.extend(Template.MultipleFile, Template.AbstractComponent, {});


/**
 * component template.
 */
Template.MultipleFile.COMPONENT_TPL = new Qmk.XTemplate(
	'<div id="{id}" class="form-group">'
		+ '<div class="col-sm-3">'
			+ '<label class="control-label">{labelTxt}</label>'
		+ '</div>'
		+ '<div class="col-sm-9">'
			+ '<a href="javascript:void(0);" id="{id}-localbtn" class="btn btn-primary" style="width:37%;margin-right:2%;"><i class="fa fa-fw fa-upload"></i>从本地上传</a>'
			+ '<a href="javascript:void(0);" id="{id}-remotebtn" class="btn btn-primary" style="width:37%;"><i class="fa fa-fw fa-soundcloud"></i>从主机上传</a>'
			+ '<a href="javascript:void(0);" id="{id}-hidebtn" class="btn" title="隐藏" style="display:none;"><i class="fa fa-fw fa-minus"></i></a>'
			+ '<a href="javascript:void(0);" id="{id}-showbtn" class="btn" title="显示" style="display:none;"><i class="fa fa-fw fa-plus"></i></a>'
			+ '<div id="{id}-file" style="margin: 5px 0 0;display:none;"></div>'
			+ '<div id="{id}-err" class="alert alert-danger" role="alert" style="margin: 5px 0 0;display:none;"></div>'
		+ '</div>'
	+ '</div>'
);
Template.MultipleFile.COMPONENT_TPL.compile();

/**
 * file item template.
 */
Template.MultipleFile.FILE_ITEM_TPL = new Qmk.XTemplate(
	'<div data-fullpath="{fullPath}">'
		+ '<a href="javascript:void(0);" class="btn" data-name="local" title="本地文件" style="padding: 0 6px;"><i class="fa fa-fw fa-upload"></i></a>'
		+ '<a href="javascript:void(0);" class="btn" data-name="remote" title="主机文件" style="padding: 0 6px;"><i class="fa fa-fw fa-soundcloud"></i></a>'
		+ '<span data-toggle="tooltip" title="{fullPath}" data-original-title="{fullPath}">{fileName}</span> '
		+ '<a href="javascript:void(0);" class="btn" data-name="delete" title="删除" style="padding: 0 0 5px;"><i class="fa fa-fw fa-remove"></i></a>'
	+ '</div>'
);
Template.MultipleFile.FILE_ITEM_TPL.compile();
