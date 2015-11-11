/**
 * 
 */
Template.RemoteFileBrowser = function(clusterCode) {
	if (!clusterCode) throw 'clusterCode can not be null';

	var _thisClazz = Template.RemoteFileBrowser;

	var _winId;
	var _selectionType = _thisClazz.FILES_ONLY;
	var _selectionMode = false;
	var _currentDir = '';
	var _filterDescription = '';
	var _filterExtensions = [];
	var _title = 'File Browser';
	var _folderExists = false;

	// 0 files only, 1 directories only, 2 files and directories
	this.setSelectionType = function(type) {
		_selectionType = type;
	};

	this.setSelectionMode = function(enableMultiSelection) {
		_selectionMode = enableMultiSelection;
	};

	this.setCurrentDirectory = function(dir) {
		_currentDir = dir || '';
		_currentDir = _currentDir.replace(/[\/|\\]$/, ''); // if last char is / or \, remove it
	};

	this.setFilterDescription = function(desc) {
		// TODO no use yet
		_filterDescription = desc || '';
	};

	this.setFilterExtensions = function(exts) {
		// TODO no use yet
		_filterExtensions = exts || [];
	};

	this.setTitle = function(title) {
		_title = title || 'File Browser';
	};

	/**
	 * callback usually has the following form:
	 *    function(files)
	 * where files has form of file1|file2|...
	 * if does not select any file, files will be null.
	 * 
	 * scope is callback's "this" object.
	 */
	this.getSelectFiles = function(callback, scope) {
		if (!callback || typeof callback !== 'function') return;

		_winId = Template.TemplateUtilities.generateUniqueID();
		var browser = $(Template.RemoteFileBrowser.MODAL_WINDOW_TPL.applyTemplate({
			id    : _winId,
			title : _title
		}));
		$(document.body).append(browser);

		browser.modal('show');
		browser.on('hide.bs.modal', function() {
			var chkboxes = _getFileListComp().find('tr').find('[name="cb"]:checked');
			if (chkboxes.length === 0) {
				callback.call(scope, null);
			}

			$(this).remove();
		});
		// 选择按钮
		browser.find('.modal-footer button[data-name="choose"]').on('click', function() {
			var chkboxes = _getFileListComp().find('tr').find('[name="cb"]:checked');
			if (chkboxes.length === 0) {
				if (_selectionType === _thisClazz.DIRECTORIES_ONLY) {
					var path = _currentDir ? _currentDir + '/' : '';
					callback.call(scope, path);
					browser.modal('hide');
				} else {
					alert('You have not selected any file yet');
				}
			} else {
				var files = '';
				var path = _currentDir ? _currentDir + '/' : '';
				$.each(chkboxes, function(index, cb) {
					files += (files && '|') + path + $(cb).attr('data-name')
						+ ($(cb).attr('data-type') == '1' ? '/' : '');
				});

				callback.call(scope, files);
				browser.modal('hide');
			}
		});
		// 新建按钮
		browser.find('.modal-footer button[data-name="new-folder"]').on('click', function() {
			if (!_folderExists && _currentDir) {
				Xfinity.message.confirm('当前文件夹还不存在，是否先创建？', function() {
					_createFolder();
				});
			} else if (_folderExists) {
				var panel = $(Template.RemoteFileBrowser.NEW_FOLDER_TPL.applyTemplate({
					id : _winId
				}));
				panel.appendTo(document.body);
				panel.modal('show');
				panel.find('.modal-footer .btn').on('click', function() {
					var name = panel.find('input[data-name="folder-name"]').val();
					if (!/^[-a-zA-Z0-9_.]+$/.test(name)) {
						panel.find('div[data-name="invalid-msg"]').show();
					} else {
						panel.find('div[data-name="invalid-msg"]').hide();
						_createFolder(name);
						panel.find('.modal-footer .btn').off('click');
						panel.modal('hide');
						panel.remove();
					}
				});
			} else {
				Xfinity.message.alert('无法在当前目录创建文件夹');
			}
		});

		if (!_selectionMode) {
			_getChkBoxAllComp().remove();
		} else {
			_getChkBoxAllComp().on('click', function() {
			 	var chkboxes = _getFileListComp().find('tr').find('[name="cb"]');
				chkboxes.prop('checked', $(this).is(':checked'));
			});
		}

		_loadFiles();
	};

	/* -------------------- Local Functions -------------------- */
	var _getFileListComp = function() {
		return $('#' + _winId + '-filelist');
	};
	var _getLoadingComp = function() {
		return $('#' + _winId + '-loading');
	};
	var _getChkBoxAllComp = function() {
		return $('#' + _winId + '-cb-all');
	};
	var _getCurDirComp = function() {
		return $('#' + _winId + ' .modal-header span[data-name="cur-dir"]');
	};

//	var _getMsgComp = function() {
//		return $('#' + _winId + ' .modal-footer span[data-name="msg"]');
//	};

	var _loadFiles = function() {
		_getFileListComp().find('tr').remove();
		_getLoadingComp().show();
//		_getMsgComp().hide();

		var param = {
			clusterCode : clusterCode
		};
		if (_currentDir) {
			param.filePath = _currentDir;
		}
		_getCurDirComp().html('~/' + _currentDir);

		$.ajax({
			url: 'showFileList.action',
			contentType: 'application/x-www-form-urlencoded; charset=utf-8',
			data: param,
			success: function(a, b, c) {
				_getLoadingComp().hide();

				var files = c.responseJSON.fileItems || [];	
				_showFiles(files);

				var exception = c.responseJSON.fileInfo.exception;
				if (exception) {
					_folderExists = false;
//					_getMsgComp().html('文件夹不存在或无权访问').show(300).delay(4000).hide(1000);
					var errMsg = $('<tr><td colspan="4" style="text-align:center;color:red;">文件夹不存在或无权访问</td></tr>');
					_getFileListComp().append(errMsg);
				} else {
					_folderExists = true;
					// no file
					if (files.length == 0) {
						var fileItem = $('<tr><td colspan="4" style="text-align:center;">此文件夹为空</td></tr>');
						_getFileListComp().append(fileItem);
					}
				}
			},
			error: function() {
//				_getMsgComp().html('获取数据失败，请稍后重试').show(300).delay(4000).hide(1000);
				var errMsg = $('<tr><td colspan="4" style="text-align:center;color:red;">获取数据失败，请稍后重试</td></tr>');
				_getFileListComp().append(errMsg);
				_getLoadingComp().hide();
			}
		});
	};

	var _showFiles = function(files) {
		// select files to be shown
		files = _pickUpFiles(files);

		// sort files
		files.sort(function(f1, f2) {
			if (f1.type === 1 && f2.type !== 1) return -1; // folder first: f1 is a folder, f2 not
			if (f1.type !== 1 && f2.type === 1) return 1; // folder first: f2 is a folder, f1 not

			if (f1.name === f2.name) return 0;
			if (f1.name < f2.name) return -1;
			return 1;
		});

		// add files to list
		var fileList = _getFileListComp();
		var fileItem;
		if (_currentDir) { // add .. link
			fileItem = $('<tr><td>&nbsp;</td><td colspan="3"><img src="images/type/folder.png" />'
					+ '<a href="javascript:void(0);" target="_self">..</a></td></tr>');
			fileList.append(fileItem);
			fileItem.find('a').on('click', function() {
				var idx = _currentDir.lastIndexOf('/');
				if (idx != -1)
					_currentDir = _currentDir.substring(0, idx);
				else
					_currentDir = '';

				_loadFiles();
			});
		}
		$.each(files, function(index, file) {
			if (file.type === 1) { // folder
				file.icon = 'folder.png';
				file.nameHTML = '<a data-name="name" href="javascript:void(0);">' + file.name + '</a>';
				file.size = '-';
				fileItem = $(Template.RemoteFileBrowser.FILE_ITEM_TPL.applyTemplate(file));
				if (_selectionType === _thisClazz.FILES_ONLY) {
					fileItem.find('input[name="cb"]').remove();
				}
				fileItem.find('a[data-name="name"]').on('click', function() {
					var folderName = $(this).text();
					_currentDir += (_currentDir && '/') + folderName;
					_loadFiles();
				});
			} else {
				file.icon = FileUtil.detectFileType(file.name).icon;
				file.nameHTML = '<span>' + file.name + '</span>';
				file.size = FileUtil.prettyFileSize(file.size);
				fileItem = $(Template.RemoteFileBrowser.FILE_ITEM_TPL.applyTemplate(file));
			}
			fileList.append(fileItem);
		});

		var chkboxes = fileList.find('tr').find('[name="cb"]');
		if (!_selectionMode) { // single mode
			chkboxes.on('click', function() {
				if ($(this).is(':checked')) {
					var checkedCheckboxes = fileList.find('tr').find('[name="cb"]:checked');
					checkedCheckboxes.prop('checked', false);
					$(this).prop('checked', true);
				}
			});
		} else {
			chkboxes.on('click', function() {
				if ($(this).is(':checked')) {
					var uncheckedCheckboxes = fileList
							.find('tr').find('[name="cb"]').not(':checked');
					if (uncheckedCheckboxes.length === 0) {
						_getChkBoxAllComp().prop('checked', true);
					}
				} else {
					_getChkBoxAllComp().prop('checked', false);
				}
			});
		}
	};

	var _pickUpFiles = function(files) {
		if (_selectionType === _thisClazz.FILES_ONLY
				|| _selectionType === _thisClazz.FILES_AND_DIRECTORIES) {
			return files;
		}

		// directories only
		var filesToShow = [];
		$.each(files, function(index, file) {
			if (file.type === 1) { // folder
				filesToShow.push(file);
			}
		});
		return filesToShow;
	};

	var _createFolder = function(name) {
		var path;
		if (name) {
			path = _currentDir;
		} else if (_currentDir) {
			var idx = _currentDir.lastIndexOf('/');
			if (idx === -1) {
				name = _currentDir;
				path = '';
			} else {
				name = _currentDir.substring(idx + 1, _currentDir.length);
				path = _currentDir.substring(0, idx);
			}
		} else {
			Xfinity.message.alert('无法在当前目录创建文件夹');
			return;
		}

		var params = {
			clusterCode : clusterCode,
			folderName : name
		};
		if (path) {
			params.filePath = path;
		}

		$.ajax({
			url: 'doNewFolder.action',
			contentType: 'application/x-www-form-urlencoded; charset=utf-8',
			data: params,
			success: function(a, b, c) {
				var fileInfo = c.responseJSON.fileInfo || {};
				if (fileInfo.exception) {
					Xfinity.message.alert('<b>提示：</b>新建文件夹失败：' + fileInfo.exception);
					return;
				}

				Xfinity.message.popup('<b>提示：</b>新建文件夹成功');
				_loadFiles();
			},
			error: function() {
				Xfinity.message.alert('<b>提示：</b>新建文件夹失败');
			}
		});
	};

};

/**
 * Selection types
 */
Template.RemoteFileBrowser.FILES_ONLY = 0;
Template.RemoteFileBrowser.DIRECTORIES_ONLY = 1;
Template.RemoteFileBrowser.FILES_AND_DIRECTORIES = 2;

/**
 * @class Template.RemoteFileBrowser
 * @extends Qmk.util.Observable
 */
Qmk.extend(Template.RemoteFileBrowser, Qmk.util.Observable);

/**
 * modal window template.
 */
Template.RemoteFileBrowser.MODAL_WINDOW_TPL = new Qmk.XTemplate(
	'<div id="{id}" class="modal fade">'
		+ '<div class="modal-dialog" style="top:30px;">' // modal-dialog: default 600px, modal-sm 300px, modal-lg 900px
			+ '<div class="modal-content">'
				+ '<div class="modal-header" style="padding:10px 15px;">'
					+ '<button type="button" class="close" data-dismiss="modal">&times;</button>'
					+ '<h4>{title}</h4><span data-name="cur-dir" style="color:#808080;">&nbsp;</span>'
				+ '</div>'
				+ '<div class="modal-body" style="padding:0 15px;">'
					+ '<table class="table table-hover" style="margin-bottom:-1px;">'
						+ '<thead>'
							+ '<tr>'
								+ '<th>'
									+ '<input id="{id}-cb-all" name="{id}-cb-all" type="checkbox" />'
								+ '</th>'
								+ '<th class="col-md-6 dropup">文件名</th>'
								+ '<th class="col-md-2 dropup">大小</th>'
								+ '<th class="col-md-4 dropup">修改时间</th>'
							+ '</tr>'
						+ '</thead>'
					+ '</table>'
					+ '<div style="height:280px;overflow-y:auto;">'
						+ '<table class="table table-hover" style="margin-top:-37px;">'
							+ '<thead>'
								+ '<tr>'
									+ '<th>&nbsp;</th>'
									+ '<th class="col-md-6">&nbsp;</th>'
									+ '<th class="col-md-2">&nbsp;</th>'
									+ '<th class="col-md-4">&nbsp;</th>'
								+ '</tr>'
							+ '</thead>'
							+ '<tbody id="{id}-filelist"></tbody>'
						+ '</table>'
						+ '<div id="{id}-loading" style="width:120px;margin:0 auto;">'
							+ '<img src="images/loading.gif" width="32" height="34" /> loading...'
						+ '</div>'
					+ '</div>'
				+ '</div>'
				+ '<div class="modal-footer" style="padding:10px 15px;">'
//					+ '<span data-name="msg" style="margin-right:110px;color:red;">&nbsp;</span>'
//					+ '<button type="button" class="btn btn-primary">刷新</button>' // not implement yet
					+ '<button data-name="new-folder" type="button" class="btn btn-primary">新建</button>'
					+ '<button data-name="choose" type="button" class="btn btn-primary">选择</button>'
				+ '</div>'
			+ '</div>'
		+ '</div>'
	+ '</div>'
);
Template.RemoteFileBrowser.MODAL_WINDOW_TPL.compile();

/**
 * file item template.
 */
Template.RemoteFileBrowser.FILE_ITEM_TPL = new Qmk.XTemplate(
	'<tr>'
		+ '<td><input name="cb" type="checkbox" data-name="{name}" data-type="{type}" /></td>'
		+ '<td>'
			+ '<img src="images/type/{icon}" error="images/type/txt.png" />&nbsp;&nbsp;{nameHTML}'
		+ '</td>'
		+ '<td>{size}</td>'
		+ '<td>{lastModified}</td>'
	+ '</tr>'
);
Template.RemoteFileBrowser.FILE_ITEM_TPL.compile();

Template.RemoteFileBrowser.NEW_FOLDER_TPL = new Qmk.XTemplate(
	'<div id="{id}" class="modal fade">'
		+ '<div class="modal-dialog modal-sm" style="top: 60px;">'
			+ '<div class="modal-content">'
				+ '<div class="modal-header">'
					+ '<button type="button" class="close" data-dismiss="modal">&times;</button>'
					+ '<h4>新建文件夹</h4>'
				+ '</div>'
				+ '<div class="modal-body">'
					+ '<input type="text" class="form-control" data-name="folder-name" placeholder="new folder name">'
					+ '<div data-name="invalid-msg" class="alert alert-danger" role="alert" style="display:none;">'
						+ '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>'
						+ '<span class="sr-only">Error:</span>'
						+ '文件夹名称不能为空，且只能包含字母、数字、中划线和下划线'
					+ '</div>'
				+ '</div>'
				+ '<div class="modal-footer">'
					+ '<button type="button" class="btn btn-primary">OK</button>'
				+ '</div>'
			+ '</div>'
		+ '</div>'
	+ '</div>'
);
Template.RemoteFileBrowser.NEW_FOLDER_TPL.compile();
