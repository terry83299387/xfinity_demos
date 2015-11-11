
var Template;
if (!Template) {
	Template = {};
}

/**
 * @param {} template the template.
 * @param String/DOM Element/JQuery Object form the form where template render into.
 * @param {} config should include following data:
 *        clusterCode, templateCode, appCode
 */
Template.TemplateParser = function(template, form, config) {
	// call super class constructor
	Template.TemplateParser.superclass.constructor.call(this);

	/* ------------------------- Fields ----------------------- */
	/**
	 * read-only
	 */
	this.tplUtil = Template.TemplateUtilities;
	/**
	 * read-only
	 */
	this.id = this.tplUtil.generateUniqueID();
	/**
	 * read-only
	 */
	this.version;

	/* --------------------- Protected Fields -------------------- */

	/* --------------------- Local Variables -------------------- */
	var _components = {};
	var _variables = {};
	var _combinators = {};
	var _form;

	var _winClosed = false;
	// used to indicate validate results before submit
	var _validError;
	var _clusterInfo;
	var _hasInit = false;

	/* ------------------------ Methods ----------------------- */
	this.getComponentByType = function(type) {
		var components = template.element || [];
		var id, cfg, comp;
		var len = components.length;
		for (var i=0; i<len; i++) {
			cfg = components[i];
			if (cfg.type == type) {
				id = cfg.id;
				comp = this.getComponent(id);
				return comp;
			}
		}
	};

	this.getComponentsByCompType = function(type) {
		var comps=[], comp;
		for (var id in _components) {
			comp = _components[id];
			if (comp.type == type) {
				comps.push(comp);
			}
		}
		return comps;
	};

	this.addComponent = function(id, component) {
		_components[id] = component;
	};

	this.getComponent = function(id) {
		if (_components.hasOwnProperty(id))
			return _components[id];
		return null;
	};

	this.getAllComponents = function() {
		return _components;
	};

	this.addVariable = function(id, variable) {
		_variables[id] = variable;
	};

	this.getVariable = function(id) {
		if (_variables.hasOwnProperty(id))
			return _variables[id];
		return null;
	};

	this.getAllVariables = function() {
		return _variables;
	};

	this.addCombinator = function(id, combinator) {
		_combinators[id] = combinator;
	};

	/**
	 * an entity is an component or a variable,
	 * but not a combinator
	 */
	this.getEntity = function(id) {
		return this.getComponent(id)
			|| this.getVariable(id);
	};

	this.hasWinClosed = function() {
		return _winClosed;
	};

	this.getSoftwareCode = function() {
		return config.appCode;
	};

	this.getSoftwareName = function() {
		return apps[config.appCode].name;
	};

	this.getClusterCode = function() {
		return config.clusterCode;
	};

	this.getClusterInfo = function() {
		return _clusterInfo;
	};

	this.getVersion = function() {
		return this.version;
	};

	this.initValidated = function() {
		// not implement yet
//		alert('initValidated');
	};

	this.submitValidated = function(validator, valid, level, errInfo) {
		if (!valid) {
			_validError.push({
				'validator' : validator,
				'level'     : level,
				'errInfo'   : errInfo
			});
		}
	};

	this.init = function() {
		fetchClusterInfo(this.getClusterCode(), function(clusterInfo) {
			_clusterInfo = clusterInfo;
		});
		this._initEvents();
		this._parseTemplate();

		_sortComponents();
		this._initRootVars();
		this._getLblText(); // goto _init()
	};

	/**
	 * return jquery object of form
	 */
	this.getForm = function() {
		if (!_form) {
			if (!form) return null;

			if (typeof form === 'string') { // id
				_form = $('#' + form);
			} else if (typeof form === 'object') {
				if (form.find && typeof form.find === 'function') { // jquery object
					_form = form;
				} else { // DOM Element
					_form = $(form);
				}
			}
		}

		return _form;
	};

	this.getParam = function() {
		var param = {};
		var comp;
		for (var id in _components) {
			comp = _components[id];
			param[id] = comp.getValue();
			/*
			 * 有些项，例如集群、队列、项目等，会用到名称，也就是
			 * ComboBox的text。所以将ComboBox的text也放到参数中提交
			 * 
			 * 很奇怪为什么要这样做，但为了保持兼容，暂时只能这样处理了
			 */
			if (comp.type == 'ComboBox') {
				param[id+'Text'] = comp.getText();
			}
		}
		var jsdlCst = this.tplUtil.jsdlKeys;
		param['urn:xfinity:applicationCode'] = config.appCode;
		param['urn:xfinity:templateCode'] = config.templateCode;
		param[jsdlCst.CLUSTER] = this.getClusterCode();
		param[jsdlCst.CLUSTER_NAME] = '蜂鸟LinuxHPC';
		param[jsdlCst.JOB_NAME] = this.getComponentByType(jsdlCst.JOB_NAME).getValue();
		param[jsdlCst.DESCRIPTION] = this.getComponentByType(jsdlCst.DESCRIPTION).getValue();
		param[jsdlCst.WORK_DIR] = this.getComponentByType(jsdlCst.WORK_DIR).getValue();
		param[jsdlCst.JOB_NODES] = this.getComponentByType(jsdlCst.JOB_NODES).getValue();
		var npPerNode = this.getComponentByType(jsdlCst.JOB_CPUS).getValue();
		param[jsdlCst.JOB_CPUS] = npPerNode == 0 ? '' : npPerNode;

		return param;
	};

	this.getPersistenceParam = function() {
		var param = {};
		var comp, desc, value/*, labelCode*/;
		for (var id in _components) {
			comp = _components[id];
			value = comp.getPersistenceData();
			desc = comp.getPersistenceDesc();
			if (!value && !desc) continue;
//			labelCode = comp.getLabelCode();

			param[id] = {
				value : value,
				desc  : desc/*,
				labelCode : labelCode*/ // is labeCode still useful?
			};
		}

		return param;
	};

	this.restorePersistenceParam = function(params) {
		if (!_hasInit) {
			this.addListener('initialized', function() {
					this.restorePersistenceParam(params);
				},
				this,
				{single : true}
			);
			return;
		}

		params = params || [];

		var param;
		var comp;
		for (var i=0; i<params.length; i++) {
			param = params[i];
			comp = this.getComponent(param[0]);
			if (comp) {
				comp.restorePersistenceData(param[1]);
			}
		}
	};

	this.prepareSubmit = function(initial) {
		var deferred = $.Deferred(initial);

		// cleare validated results and do validation
		_validError = [];
		this.fireEvent('submitting');
		if (_validError.length > 0) {
			var submit = this._handleValidError();
			if (!submit) {
				deferred.reject();
				return;
			}
		}

		var dupFiles = this._checkFileDup();
		if (dupFiles.length > 0) {
			deferred.reject();
			alert(i18n.error, i18n.sww_duplicatedFile);
			return;
		}

		// has any local files need to upload?
		var jsdlCst = this.tplUtil.jsdlKeys;
		var jobName = this.getComponentByType(jsdlCst.JOB_NAME).getValue();
		var localFiles = this._getLocalFiles();
		if (localFiles.length > 0) {
			deferred.notify(0, jobName);
			this._uploadFiles(deferred, localFiles);
		} else {
			deferred.notify(100, jobName);
			deferred.resolve();
		}
	};

	/* -------------------- Private/Protected Methods -------------------- */
	this._initEvents = function() {
		this.events = {
			'initialized'  : true,
			'submitting'   : true,
			/* 
			 * 2014.11.18 qiaomingkui
			 * 以前，当作业提交成功并且用户点击了“继续提交新作业”按钮时会触发该事件。
			 * 由于需求变动，现在需要在作业提交成功后立即派发表示作业已成功提交的事件，
			 * 但模板中都用到了这个事件，所以不便修改。
			 * 所以我新添加一个jobsubmitted事件，而原有submitted事件的意义则等同于“继续提交新作业”（所以更恰当的名称应该是continuesubmit）
			 * jobsubmitted和submitted看起来是一回事，有点让人迷惑，但没办法，这就是历史的包袱
			 */
			'submitted'    : true,
			'jobsubmitted' : true //,
//			'paramsaved'   : true, // after parameters (shortcut) saved
//			'shortcutexopsubmit' : true, // after shortcut brief desc / show on desktop saved
		};
	};

	this._parseTemplate = function() {
		// judge the window has been closed
		if (_winClosed) {
			return;
		}

		var showErrMsg = function(msg) {
//			Ext.Msg.show({
//				title : i18n.shortcut_error,
//				msg : msg,
//				buttons : Ext.MessageBox.OK,
//				icon : Ext.MessageBox.ERROR,
//				minWidth : 120,
//				width : 200
//			});
			// TODO
			alert(msg);
		}

//		var exception = resp.exception;
//		if (exception == 'noAuthority') {
//			showErrMsg(i18n.shortcut_noAuthority);
//			return;
//		} else if (exception) {
//			showErrMsg(exception);
//			return;
//		}

		var version = template.version;
		if (!version || version != '1.0') {
			showErrMsg(i18n.shortcut_unknowVersion + version);
			return;
		}
		this.version = version;
	};

	/*
	 * init root variables
	 */
	this._initRootVars = function() {
		var cfgs = template['variable'] || [];
		var cfg, variable, len=cfgs.length;
		for (var i=0; i<len; i++) {
			cfg = cfgs[i];
			variable = new Template.Variable(this, cfg);
			variable.init();
			this.addVariable(cfg.id, variable);
		}
	};

	/*
	 * 根据所有component的label code和description code查询国际化文本
	 * 并设置到相应的component配置中
	 */
	this._getLblText = function() {
		var cfgs = template.element || [];
		var labels = [];
		var cfg, label/*, desc*/, len=cfgs.length;
		for (var i=0; i<len; i++) {
			cfg = cfgs[i];
			label = cfg.label;
//			desc = cfg.description;
			// allow to ignore label
			if (label) labels.push(label);
//			if (desc) {
//				labels.push(desc); // ignore descriptions temporarily
//			}
		}
		this.tplUtil.delayFetchLabels.delayFetch(labels, this._init, this);
	};

	/*
	 * continue to initialize after getting label and description
	 */
	this._init = function(success, labelTxts) {
		// judge the window has been closed
		if (_winClosed) {
			return;
		}

		_storeI18NTxt(labelTxts);

		var items = this._initComponents();
		this._showTemplateForm(items);
		this._onShow();

		_hasInit = true;
		this.fireEvent('initialized');
	};

	/*
	 * do other things after components added
	 */
	this._onShow = function() {
		var obj;

		/*
		 * 由于联动可以定义在任何地方（通过source和targe来指定源与目标）
		 * 因此，其初始化需要在最后进行，否则可能获取不到关联的实体
		 */
		for (var id in _combinators) {
			obj = _combinators[id];
			obj.init();
		}
		for (var id in _variables) {
			obj = _variables[id];
			obj.reload();
		}
		for (var id in _components) {
			obj = _components[id];
			obj.reload();
		}

		// map the Accelerator Key (Ctrl+Enter) to handle
		// submit action
//		new Ext.KeyMap(_win.getEl(), {
//			ctrl : true,
//			key : Ext.EventObject.ENTER,
//			fn : this._submit,
//			scope : this
//		});

//		this._innerPanel.getEl().unmask();
	};

	/*
	 * init components.
	 * just init, do not loads data
	 */
	this._initComponents = function() {
		var items = [];
		var advItems = [];
		var cfgs = template.element || [];
		// create components
		var cfg, item;
		for (var i=0; i<cfgs.length; i++) {
			cfg = cfgs[i];
			var item = this.tplUtil.getTemplateComponent(cfg, this);
			if (item == null) continue;

			item.init();
			this.addComponent(cfg.id, item);

			if (cfg.advanced)
				advItems.push(item);
			else
				items.push(item);
		}

		return [items, advItems];
	};

	this._hidePlaceholderPanel = function() {
//		this._innerPanel.remove(this._innerPanel.getComponent(0));
	};

	/*
	 * add, layout and show template form.
	 */
	this._showTemplateForm = function(items) {
		var comps = items[0];
		var advComps = items[1];
		this._hidePlaceholderPanel();

		var form = this.getForm();

		var comp;
		for (var i = 0; i < comps.length; i++) {
			comp = comps[i];
			comp.renderTo(form);
		}

		if (advComps.length > 0) {
			for (var i = 0; i < advComps.length; i++) {
				comp = advComps[i];
				comp.renderTo(form);
				comp.setDisplay(false);
			}
		}
	};

	// (private)
	this._handleValidError = function() {
		// 如果只有warn级别的错误，则询问用户是否一定要提交（暂未实现）

		// 如果高级选项中有错误，展开高级选项
		// 20150908: 打算去掉高级选项，因此这里暂不处理
//		if (this._hasAdvValidError()) {
//			this._advFormPanel.setVisible(true);
//		}

		return false;
	};

	// (private)
	// 注意：如果两文件的名称和路径都相同，则属于同一个文件而不算重复文件，但为了避免重复上传需要对其进行过滤
	// 只有名称相同但路径不同的文件，才认为是重复文件。
	// 因为有时同一个文件确实需要在不同的地方使用（例如命令中的不同参数）
	// 而名称相同路径不同的文件是无法同时上传到工作目录下的
	this._checkFileDup = function() {
		var fileComp, len;
		var singleFiles = this.getComponentsByCompType('SingleFile');
		len = singleFiles.length;

		var o={}, v, n, dupFiles=[];
		outer1:
		for (var i=0; i<len; i++) {
			fileComp = singleFiles[i];
			v = fileComp.getRawValue();
			if (!v) continue;

			n = fileComp.getFileName();
			if (o[n]) {
				for (var j=0; j<o[n].length; j++) {
					if (o[n][j] == v) {
						continue outer1;
					}
				}

				o[n].push(v);
				dupFiles.push(v);
			} else {
				o[n] = [];
				o[n].push(v);
			}
		}

		var multiFiles = this.getComponentsByCompType('MultipleFile');
		len = multiFiles.length;
		var files;
		outer2:
		for (var i=0; i<len; i++) {
			fileComp = multiFiles[i];
			files = fileComp.getAllFiles();
			if (files.length == 0) continue;

			for (var j=0; j<files.length; j++) {
				v = files[j];
				n = fileComp.getFileName(v);
				if (o[n]) {
					for (var k=0; k<o[n].length; k++) {
						if (o[n][k] == v) {
							continue outer2;
						}
					}

					o[n].push(v);
					dupFiles.push(v);
				} else {
					o[n] = [];
					o[n].push(v);
				}
			}
		}

		return dupFiles;
	};

	// (private)
	this._uploadFiles = function(deferred, localFiles) {
		var clusterCode = this.getClusterCode();
		fetchClusterInfo(clusterCode, function(clusterInfo) {
			if (!clusterInfo) {
				deferred.reject('no cluster info, can not submit');
				return;
			}

			var jsdlCst = this.tplUtil.jsdlKeys;
			var workDirComp = this.getComponentByType(jsdlCst.WORK_DIR);
			var workDir = workDirComp.getValue();

			// upload
			var uploadApplet = PluginManager.getFileTransfer({
				host                 : clusterInfo.host,
				user                 : clusterInfo.hostUserName,
				passwd               : clusterInfo.pwd,
				port                 : clusterInfo.fileTransferPort,
				clientkey            : clusterInfo.clientKey,
				fileTransferProtocol : clusterInfo.fileTransferProtocol,
				serverName           : clusterInfo.clusterName,
				home                 : workDir,
				files                : localFiles.join('|'),
				module               : 'job',
				dlgtype              : 'Upload'
			});

			// listen to file upload progress
			if (uploadApplet != null) {
				var uploadListener = new Qmk.util.TaskRunner();
				var thread = this._getUploadListenerThread(deferred, uploadApplet);
				uploadListener.start(thread);
			}
		}, this);
	};

	// (private)
	this._getLocalFiles = function() {
		var files = [];
		var o = {};

		var fileComp, len;
		var singleFiles = this.getComponentsByCompType('SingleFile');
		len = singleFiles.length;
		var v;
		for (var i=0; i<len; i++) {
			fileComp = singleFiles[i];
			if (fileComp.getType() == fileComp.LOCAL
					&& (v=fileComp.getRawValue())) {
				if (o[v]) continue; // duplicate file
				files.push(v);
				o[v] = true;
			}
		}

		var multiFiles = this.getComponentsByCompType('MultipleFile');
		len = multiFiles.length;
		var t;
		for (var i=0; i<len; i++) {
			fileComp = multiFiles[i];
			if ((v=fileComp.getLocalFiles()).length > 0) {
				for (var j=0; j<v.length; j++) {
					t = v[j];
					if (o[t]) continue; // duplicate file
					files.push(t);
					o[t] = true;
				}
			}
		}

		return files;
	};

	// (private)
	this._getUploadListenerThread = function(deferred, uploadApplet) {
		var timeoverCount = 0;

		return {
			run : function() {
				var status = uploadApplet.getStatus();
				var keepRunning = false;
				var msg;
				switch (status) {
					case '100':
						break;
					case 'exception_terminate':
						msg = i18n.error_submitjobforapplet;
						break;
					case 'mk_workingdir_failed':
						msg = i18n.error_submitjobformkdir;
						break;
					case 'transfer_file_failed':
						msg = i18n.error_submitjobforupload;
						break;
					case 'response_timeover':
						timeoverCount++;
						if (timeoverCount < 3) {
							keepRunning = true;
						} else {
							msg = 'File transfer might be closed!';
						}
						break;
					default: // file transferring
						timeoverCount = 0; // reset timeoverCount
						keepRunning = true;
						break;
				}

				if (msg) {
					deferred.reject(msg);
				} else {
					var progress = parseInt(status);
					deferred.notify(progress);
					if (progress == 100) {
						deferred.resolve();
					}
				}

				return keepRunning;
			},
			scope : this,
			interval : 2000
		}
	};

	/* -------------------- Local Functions -------------------- */
	
	/*
	 * 
	 */
	var _storeI18NTxt = function(i18ns) {
		var cfgs = template.element || [];
		var len = cfgs.length;
		var cfg;
		for (var i=0; i<len; i++) {
			cfg = cfgs[i];
			cfg.labelTxt = i18ns[cfg.label] || '(NoName)';
//			if (cfg.description)
//				cfg.description = i18ns[cfg.description] || '';
		}
	};

	/*
	 * components should be sorted with index
	 * the smaller index the component has, the more top it will be.
	 * if the component index is undefined, it will be placed behind all the others.
	 */
	var _sortComponents = function() {
		var cfg = template.element || [];
		cfg.sort(function(o1, o2) {
			// o1 ahead of o2 -, o1==o2 0, else +
			return o1.index - o2.index;
		});
	};
};

/**
 * @class Template.TemplateParser
 * @extends Qmk.util.Observable
 */
Qmk.extend(Template.TemplateParser, Qmk.util.Observable);
