/**
 * 
 * @param templateParser
 * @param config
 */
Template.RemoteFile = function(templateParser, config) {
	var spc = Template.RemoteFile.superclass;
	spc.constructor.call(this, templateParser, config);

	/* ------------------------- Fields ----------------------- */
	/**
	 * read-only
	 */
	this.type = "RemoteFile";

	/* --------------------- Private Fields -------------------- */
	var _this = this;
	var _file;
	var _selBtn;
	var _data;

	/* ------------------------ Methods ----------------------- */
	this.reload = function() {
		if (!this.hasInit()) {
			var defer = config.data.defer;
			if (defer) {
				this._fireInitIfNeed();
				return;
			}
		}

		_data.addListener("loaded",
				_dataReload, this, {single: true});
		_data.reload();
	};

	this.getValue = function() {
		return _file.getValue();
	};

	this.setValue = function(v) {
		var v = (v == null ? "" : v);
		var oldV = this.getValue();
		_file.setValue(v);
		if (v != oldV) {
			_fireChanged(v, oldV);
		}
		Ext.ux.Util.setCursorLast(_file.el.dom);
	};

	this.clearValue = function() {
		this.setValue("");
	};

	this.isEnable = function() {
		return (!_selBtn.disabled && !_file.disabled);
	};

	this.setEnable = function(b) {
		var disable = !b;
		_selBtn.setDisabled(disable);
		_file.setDisabled(disable);
	};

	this.isEditable = function() {
		return !_file.readOnly;
	};

	this.setEditable = function(b) {
		_file.readOnly = !b;
	};

	/**
	 * (Protected)
	 * @see AbstractComponent._initEvent()
	 */
	this._initEvents = function() {
		this.addEvents({
			"loaded"  : true,
			"changed" : true,
			"changing" : true
		});
	};

	/**
	 * (Protected)
	 */
	this._initData = function() {
		var dataCfg = config.data;
		var content = Qmk.util.JSON.decode(dataCfg.content) || {};
		dataCfg.content = content;
		var valueField = content.valueField || "value";
		// 以后可能还需要valueField的值来做一些判断
		dataCfg.valueField = valueField;

		var value;
		// 若content中定义了value的值，用content中的value值
		if (content.hasOwnProperty(valueField)) {
			value = content[valueField];
		} else {
			value = dataCfg.value || "";
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

	/**
	 * (Protected)
	 * init remote file component
	 */
	this._initComponents = function() {
		var formLabel = this._getFormLabel();

		_selBtn = new Ext.Button({
			width : 50,
			height :20,
			text : '<div style="font-size:1.1em;width:40px;">'
					+ i18n.btn_file_browser + '<div>',
			listeners : {
				click : _showFileBrowser
			}
		});

		var cfg = {
			width: 190,
			height: 20,
			listeners : {
				// change在失去焦点后触发，通过setValue改变值不会触发change事件
				change : function(source, newV, oldV) {
					_fireChanged(newV, oldV);
				},
				specialKey : function(source, e) {
					_fireChanging(e.getKey(), e);
				}
			}};
	    _file = new Ext.form.TextField(cfg);

		var panel = new Ext.Panel({
			border : false,
			frame : false,
			width : 600,
			bodyStyle : " background-color:transparent;border:none;",
			layout : "table",
			layoutConfig : {
				columns : 3
			},
			defaults : {
				bodyStyle : " background-color:transparent;border:none;"
			},
			items : [{
					width : this.labelWidth,
					items : formLabel
				}, {
					width : 192,
					items : _file
				}, {
					width : 80,
					items : _selBtn
				}, {
					width : this.labelWidth,
					hidden : true
				}, {
					items : this._getErrInfoPanel(),
					colspan : 2
				}, {
					height : 5,
					colspan : 3
				}]
		});

		this.add(panel);

		// init status
		this.setDisplay(config.display);
		this.setEnable(config.enable);
		this.setEditable(config.editable);
	};

	/* --------------------- Private methods -------------------- */
	var _dataReload = function() {
		var from = _data.from;
		var v = _data.getValue();
		if (from != "static") {
			var valueField = config.data.valueField;
			v = v[valueField];
		}

		_setValue(v);
		_this.fireEvent("loaded", _this, v);
	};

	var _setValue = function(v) {
		var oldV = _this.getValue();
		if (v != undefined)
			_file.setValue(v);

		_this._fireInitIfNeed();

		if (v != undefined && v != oldV) {
			_fireChanged(v, oldV);
		}
		Ext.ux.Util.setCursorLast(_file.el.dom);
	};

	var _showFileBrowser = function() {
		var id = _this.tplParser.id + config.id;

		var workDirComp = _this.tplParser
				.getComponentByType(_this.tplUtil.jsdlKeys.WORK_DIR);
		var currentDir = '';
		if (workDirComp)
			currentDir = workDirComp.getValue();

		var clusterComp = _this.tplParser
				.getComponentByType(_this.tplUtil.jsdlKeys.CLUSTER);
		var clusterCode = clusterComp.getValue();

		getCluster(clusterCode, function(cluster) {
			if (cluster)
				_browseRemoteFile(id, cluster, currentDir);
		});
	};

	var _dirSelected = function(dir) {
		_this.setValue(dir);
	};

	var _clearInvalid = function() {
		// TODO
	};

	var _fireChanged = function(newV, oldV) {
		_clearInvalid();
		_this.fireEvent("changed", _this, newV, oldV);
	};

	var _fireChanging = function(key, e) {
		_clearInvalid();
		_this.fireEvent("changing", _this, key, e);
	};

	var _browseRemoteFile = function(id, cluster, defaultDir) {
			var fileWinId = id + "template-remotewin";
			if (Ext.getCmp(fileWinId) != null) {
				Ext.getCmp(fileWinId).show();
				return;
			}
			var filePanelid = fileWinId + "file-panel";
			var filePanel = new Ext.Template.TemplateRemoteFilePanel({
				id                   : filePanelid,
				fileWinId            : fileWinId,
				labelMame            : _this.getLabel(),
				workDirSelectedFun   : _workDirSelected,
				fileSelectedFunc     : _remoteFileSelected,
				currentPath          : defaultDir,
				defaultdir           : defaultDir,
				role                 : cluster.role,
				clusterName          : cluster.clusterName,
				clusterIp            : cluster.host,
				clusterUserName      : cluster.hostUserName,
				clientKey            : cluster.clientKey,
				clusterUserPassword  : cluster.pwd,
				workdir              : cluster.workDir,
				clusterCode          : cluster.clusterCode,
				fileTransferProtocol : cluster.fileTransferProtocol,
				fileTransferPort     : cluster.fileTransferPort,
				rootdir              : cluster.rootDir,
				layout               : "fit",
				autoScroll           : true,
				selectionMode        : false // single mode
			});

			var fileGrid = Ext.ux.Util.getFileGrid(fileWinId);
			var winW = Ext.lib.Dom.getViewWidth();
			var winH = Ext.lib.Dom.getViewHeight();
			var desktop = app.getDesktop();
			var win = desktop.createWindow({
						id : fileWinId,
						title : i18n.title_filemanage,
						frame : true,
						layout : "fit",
						width : winW * 3 / 5,
						height : winH * 3 / 4,
						iconCls : "icon-grid",
						shim : false,
						animCollapse : false,
						constrainHeader : true,
						items : [fileGrid]
					})
			win.show();

//			JobTemplateGlobal.getJobTemplate(thistemplatewinid).addOtherWinId(fileWinId);
			FileMngGlobal.registeredToGlobalFileWindow(filePanel, win, null, null);

		    filePanel.firstLoad();
	};

	var _workDirSelected = function(dir) {
		if (!dir) return;
		var workDirComp = _this.tplParser
				.getComponentByType(_this.tplUtil.jsdlKeys.WORK_DIR);
		if (workDirComp) workDirComp.setValue(dir);
	};

	var _remoteFileSelected = function(file) {
		if (!file) return;
		_this.setValue(file);
	};
};

/**
 * All Components are extended from AbstractComponent.
 * @class Template.RemoteFile
 * @extends Template.AbstractComponent
 */
Qmk.extend(Template.RemoteFile, Template.AbstractComponent, {});
