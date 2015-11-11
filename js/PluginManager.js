/**
 * plugin manager.
 * 
 * To use this PluginManager, following additional libs/variables are needed:
 * 
 * deployJava.js: a library used to detect installed jres and their versions
 * currentUserName : file transfer needs this global variable
 * language : file transfer needs this global variable
 * 
 * @type PluginManager
 * @author qiaomingkui
 */
var PluginManager = {
	isInit    : false,
	curPlugin : '', // current plugin type
	ACTIVEX   : 'activex', // plugin type is activex
	APPLET    : 'applet', // plugin type is applet
	NO_PLUGIN : 'none', // no available plugin
	ACTIVEX_OBJ_NAME      : 'xfinity_extension',
	FILE_BROWSER_OBJ_NAME : 'filebrowser',
	APP_STARTER_OBJ_NAME  : 'appstarter',

	latestActiveXInfo : {
		ver : '1.0.0.0',
		compatibility : '1.0.0.0' // include version 1.0
	},

	init : function() {
		var getExplorer = function() {
			var explorerType;
			if ((navigator.userAgent.indexOf('MSIE') >= 0)) {
				explorerType = "IE";
			} else if (navigator.userAgent.indexOf('Firefox') >= 0) {
				explorerType = "Firefox";
			} else if (navigator.userAgent.indexOf('Opera') >= 0) {
				explorerType = "Opera";
			} else if (navigator.userAgent.indexOf('Chrome') >= 0) {
				explorerType = "Chrome";
			} else if (!!window.ActiveXObject || "ActiveXObject" in window) { // IE 11 or other strange IEs
				explorerType = 'IE';
			} else {
				explorerType = "Other";
			}
			return explorerType
		};
		var browser = getExplorer();
		var o = this.getActiveXObj();
		if (browser === 'IE' && o && o.getVersion
				&& o.getVersion() >= this.latestActiveXInfo.compatibility) {
			this.curPlugin = this.ACTIVEX;
		} else if (deployJava.versionCheck("1.6+")) {
			this.curPlugin = this.APPLET;
		} else {
			this.curPlugin = this.NO_PLUGIN;
//			Ext.example.msg(i18n.misc_btnttl_reminder,
//					i18n.plugin_manager_noplugin, Ext.example.WARNING);
			alert('no plugin'); // TODO
			return;
		}

		this.isInit = true;
	},

	destroy : function() {
		if (!this.isInit) {
			return;
		}
		if (this.curPlugin === this.ACTIVEX) {
			var o = this.getActiveXObj();
			if (o && o.getVersion)
				o.destroy();
		}
		// use applet.destroyjs() to destroy an applet (no need now)
	},

	/**
	 * return plugin type, which may be one of the following types:
	 * 
	 * PluginManager.ACTIVEX : plugin is ActiveX
	 * PluginManager.APPLET  : plugin is Java Applet
	 * PluginManager.NO_PLUGIN : no available plugin can be used
	 * 
	 * @return {}
	 */
	getPluginType : function() {
		if (!this.isInit) {
			this.init();
		}

		return this.curPlugin;
	},

	/**
	 * return an ActiveX plugin instance.
	 * do not call this method directly in your code.
	 * instead, you should call getFileTransfer/getFileBrowser/getAppStarter
	 * to get instances you really want and can be used straightforward.
	 * 
	 * @return {} an ActiveX plugin instance. 
	 */
	getActiveXObj : function() {
		var o = document.getElementById(this.ACTIVEX_OBJ_NAME);
		if (!o) {
			o = document.createElement('object');
			o.setAttribute('id', this.ACTIVEX_OBJ_NAME);
			o.setAttribute('classid', 'clsid:0b6ed426-9e67-4cf3-99da-8a346a98e5c6');
			o.setAttribute('width', 0);
			o.setAttribute('height', 0);
			o.style.display = 'none';
			document.body.appendChild(o);
		}

		return o;
	},

	/**
	 * create and return a file transfer based on corresponding plugin type.
	 * if there is no plugin can be used, return null.
	 * 
	 * @param {} params
	 * @return {} a file transfer.
	 */
	getFileTransfer : function(params) {
		if (!this.isInit) {
			this.init();
		}

		var obj = null;
		if (this.curPlugin === this.ACTIVEX) {
			obj = new PluginManager.plugin.ActiveXFileTransfer(params);
		} else if (this.curPlugin === this.APPLET) {
			obj = new PluginManager.plugin.AppletFileTransfer(params);
		}

		return obj;
	},

	/**
	 * create and return a file browser based on corresponding plugin type.
	 * if there is no plugin can be used, return null.
	 * 
	 * file browser has the following methods:
	 * 
	 * setCurrentDirectory(path : string)
	 * 	used to indicate this file browser's initial directory.
	 * 
	 * setSelectionMode(mode : boolean)
	 * 	used to switch current selection mode. true to allow multiple selection.
	 * 
	 * getSelectFiles(filter : string)
	 * 	return files that user has selected. if there are multiple files,
	 *  each file is splited with "|"; and if no file has been selected
	 *  (user cancelled or shutdown the browser), return null.
	 * 
	 * @return {} a file browser.
	 */
	getFileBrowser : function() {
		if (!this.isInit) {
			this.init();
		}

		var obj = null;
		if (this.curPlugin === this.ACTIVEX) {
			obj = this.getActiveXObj();
		} else if (this.curPlugin === this.APPLET) {
			obj = document.getElementById(this.FILE_BROWSER_OBJ_NAME);
			if (!obj) {
				var content = '<applet id="' + this.FILE_BROWSER_OBJ_NAME + '" name="' + this.FILE_BROWSER_OBJ_NAME + '" '
						+ 'code="cn.net.xfinity.applet.client.FileBrowserApplet" codebase="/archive" '
						+ 'archive="file-browser-applet.jar" jnlp_href="filebrowser.jnlp" width="0" height="0">'
						+ '<param name="cache_archive" value="file-browser-applet.jar" />'
						+ '<param name="java_arguments" value="-Djnlp.packEnabled=true" /></applet>';
//				Ext.DomHelper.append(document.body, content);
				$(content).appendTo($(document.body));
				obj = document.getElementById(this.FILE_BROWSER_OBJ_NAME);
			}
		}

		return obj;
	},

	/**
	 * create and return an app starter based on corresponding plugin type.
	 * if there is no plugin can be used, return null.
	 * 
	 * @return {} an app starter.
	 */
	getAppStarter : function() {
		if (!this.isInit) {
			this.init();
		}

		var obj = null;
		if (this.curPlugin === this.ACTIVEX) {
			obj = new PluginManager.plugin.ActiveXAppStarter();
		} else if (this.curPlugin === this.APPLET) {
			obj = document.getElementById(this.APP_STARTER_OBJ_NAME);
			if (!obj) {
				var content = '<applet id="' + this.APP_STARTER_OBJ_NAME + '" name="' + this.APP_STARTER_OBJ_NAME + '" '
						+ 'code="cn.net.xfinity.localprogram.LocalProgramApplet" codebase="/archive" '
						+ 'jnlp_href="local-program-applet.jnlp"'
						+ 'archive="local-program-applet.jar" width="0" height="0">'
						+ '<param name="cache_archive" value="local-program-applet.jar" />'
						+ '<param name="java_arguments" value="-Djnlp.packEnabled=true" /></applet>';
//				Ext.DomHelper.append(document.body, content);
				$(content).appendTo($(document.body));
				obj = document.getElementById(this.APP_STARTER_OBJ_NAME);
			}
		}

		return obj;
	}
};

PluginManager.plugin = {};

/**
 * File transfer using ActiveX.
 * @param {} parameter file transfer parameters
 */
PluginManager.plugin.ActiveXFileTransfer = function(parameter) {
	this.parameter = parameter;

	this.start();
}

PluginManager.plugin.ActiveXFileTransfer.prototype = {
	start : function() {
		var adapter = PluginManager.plugin.ActiveXAppletAdapter;
		var params = this.parameter;

		if (window.location.hostname == 'localhost') {
			params.host = '192.168.120.219';
		} else {
			params.host = window.location.hostname;
		}
		var module = params.module || 'file';
		params.serverclass = (params.fileTransferProtocol || 'Ftp') + 'Tool';

		try {
			// public void initialJavaApplet(string portaluser,string language, bool enableextend)
			var obj = PluginManager.getActiveXObj();
			try {
				obj.initialJavaApplet(currentUserName, language, true);
			} catch (e) {
				if (e.Message == 'initialize over time')
					obj.initialJavaApplet(currentUserName, language, true);
				else throw e;
			}

			adapter.clearParameters();
			for (var name in params) {
				adapter.setParameter(name, params[name]);
			}
			adapter.finishSetParameter();
			if (module == 'job') {
				adapter.directTransfer('upload', params.files,
						params.home);
			} else {
				adapter.startTransfer();
			}
		} catch (e) {
//			Ext.Msg.alert(i18n.error, "some exceptions occurred: " + (e.message || e.Message));
			alert(i18n.error, "some exceptions occurred: " + (e.message || e.Message));
		}
	},

	getStatus : function(files) {
		var adapter = PluginManager.plugin.ActiveXAppletAdapter;

		var percent;
		var serverName = this.parameter.serverName;
		var home = this.parameter.home;
		if (!files)
			files = this.parameter.files;

		try {
			percent = adapter.getTaskPercentage(serverName, 'upload',
					files, home);
		} catch (e) {
			if (e.Message == 'over time') {
				return 'response_timeover'
			}

			return 'transfer_file_failed';
		}

		return percent;
	}
};

/**
 * File transfer using Applet.
 * @param {} parameter file transfer parameters
 */
PluginManager.plugin.AppletFileTransfer = function(parameter) {
	this.parameter = null;
	this.applet = null;
//	this.openerWin = null;
//	this.width = Ext.ux.Util.getDefaultWidth() - 10; // orignal width
//	this.height = Ext.ux.Util.getDefaultHeight() - 35; // orignal height
	this.parameter = parameter;
	this.parameter.enableextend = true;
	this.parameter.portaluser = currentUserName;
	if (window.location.hostname == 'localhost'
			|| window.location.hostname == '192.168.50.17') {
		this.parameter.host = '192.168.120.219';
		this.debug = true;
	} else {
		this.parameter.host = window.location.hostname; // portal server is NAT
	}

	this.parameter.enableextend = true;
	this.start();
}

PluginManager.plugin.AppletFileTransfer.prototype = {
	start : function() {
		var scope = this;
		var params = this.parameter;
		var serverclass = (params['fileTransferProtocol'] || 'Ftp') + 'Tool';
		params["serverclass"] = serverclass;
		params["language"] = language;

		var module = params['module'];
		if (typeof module == 'undefined') {
			module = 'file';
		}

		var id = 'ftpApplet';
		this.applet = document.getElementById(id);
		// if file transfer window has been closed, remove the applet (and then rebuild it)
		if (this.applet) {
			try {
				this.applet.getVersion();
			} catch (e) {
				document.body.removeChild(this.applet);
				this.applet = null;
			}
		}

		if (!this.applet) {
			var htmlContent = [
					'<applet id="' + id + '" name="FtpTransferWindow" style="height:0;width:0;padding:0;margin:0;border:0;"'
							+ 'codebase="/archive" code="cn.net.xfinity.applet.ftp.client.FtpClientApplet" '
							+ 'archive="file-transfer-applet.jar,commons-net-ftp-3.0.jar,jsch-0.1.48.jar,swing-layout-1.0.jar,jzlib-1.1.3.jar" '
							+ 'jnlp_href="filetransfer.jnlp">',
					'<param name="showbrowser" value="false"/>',
					'<param name="jnlp_href" value="filetransfer.jnlp"/>',
					'<param name="separate_jvm" value="true"/>',
					'<param name="codebase_lookup" value="false"/>',
					'<param name="context" value="browser"/>',
					'<param name="cache_archive" value="file-transfer-applet.jar,commons-net-ftp-3.0.jar,jsch-0.1.48.jar,swing-layout-1.0.jar,jzlib-1.1.3.jar" />',
					'<param name="java_arguments" value="-Djnlp.packEnabled=true"/>'];

			if (params) {
				for (var name in params) {
					htmlContent.push('<param name="' + name + '" value="'
							+ params[name] + '" id="' + name + '" />');
				}
				htmlContent.push('<param name="serverclass" value="' + serverclass
						+ '" id="fileTransferProtocol" />');
			}
			htmlContent.push('</applet>');
//			Ext.DomHelper.append(document.body, htmlContent.join(''));
			$(htmlContent.join('')).appendTo($(document.body));
			this.applet = document.getElementById(id);

			// it will start file transfer automatically at the first time applet has been created
			return;
		}

		// next time, we need invoke methods directly to start file transfer
		try {
			this.applet.clearParameters();
		} catch (e) {
//			Ext.Msg.alert(i18n.error, "File transfer start error. " + e);
			alert("File transfer start error. " + e); // TODO
			return;
		}

		if (params) {
			for (var name in params) {
				try {
					this.applet.setParameter(name, params[name]);
				} catch (e) {
					// if(this.debug)
					// alert("set parameter failed. " + e);
				}
			}
		}

		try {
			this.applet.finishSetParameter();
			if (module == 'job') {
				this.applet.directTransfer("upload", params['files'],
						params['home']);
			} else {
				this.applet.startTransfer();
			}
		} catch (e) {
			alert("start transfer failed. " + e);
			return;
		}
	},

	getStatus : function(files) {
		if (typeof this.applet == 'undefined') {
			return 'exception_terminate';
		}

		var percent;
		var serverName = this.parameter.serverName;
		var type = this.parameter.dlgtype.toLowerCase(); // upload or download
		if (!files) files = this.parameter.files;
		var targetPath;
		if (type === 'upload') {
			targetPath = this.parameter.home;
		} else {
			targetPath = ''; // TODO
		}
		try {
			percent = this.applet.getTaskPercentage(serverName, type,
					files, targetPath);
		} catch (e) {
			return 'transfer_file_failed'
		}

		return percent;
	},

	closeApplet : function() {
	}
}

/**
 * Run local command using ActiveX.
 */
PluginManager.plugin.ActiveXAppStarter = function() {
	this.parameter = {};
}

PluginManager.plugin.ActiveXAppStarter.prototype = {
	setParameter : function(name, value) {
		this.parameter[name] = value;
	},

	startLocalProgram : function() {
		var params = this.parameter;
		if (!params) return 'invalid parameters';

		var program;
		var paramStr = '';
		for (var name in params) {
			if (name == 'call') program = params[name];
			else paramStr += (paramStr && '||') + name + '=' + params[name];
		}

		var obj = PluginManager.getActiveXObj();
		return obj.startLocalProgram(program, paramStr);
	}
}

/**
 * The adapter between ActiveX and Applet.
 * @type Object
 */
PluginManager.plugin.ActiveXAppletAdapter = {
	setParameter : function(name, value) {
		this.runActiveXMethod('file', 'setParameter', [name, value]);
	},

	clearParameters : function() {
		this.runActiveXMethod('file', 'clearParameters');
	},

	finishSetParameter : function() {
		this.runActiveXMethod('file', 'finishSetParameter');
	},

	directTransfer : function(type, localFilePath, remoteFilePath) {
		this.runActiveXMethod('file', 'directTransfer', [type, localFilePath, remoteFilePath]);
	},

	startTransfer : function() {
		this.runActiveXMethod('file', 'startTransfer');
	},

	getTaskPercentage : function(serverName, type, files, targetPath) {
		return this.runActiveXMethod(
				'file', 'getTaskPercentage', [serverName, type, files, targetPath]);
	},

	getVersion : function() {
		this.runActiveXMethod('file', 'getVersion');
	},

	/**
	 * (private) invoke activex method.
	 * @param String type 
	 * @param String name
	 * @param Array params
	 * @return Object return value of applet's method
	 */
	runActiveXMethod : function(type, name, params) {
		var obj = PluginManager.getActiveXObj();
		params = params || [];
		var paramStr = '';
		for (var i=0; i<params.length; ++i) {
			paramStr += (paramStr && '||') + params[i];
		}

		return obj.runMethod(type, name, paramStr);
	}
};
