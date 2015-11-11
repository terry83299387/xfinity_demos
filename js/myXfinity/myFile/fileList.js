
var markTr;
var uniqueId = Math.floor(Math.random() * 777);
var fileTransferWin;
var currentIndex = 0;
var __cwd__ = 'jsp/myXfinity/myFile/'; // page path
var fileItems = null;
var curSortField; // sort field
var sortMethod; // 1 asc, 0 desc
var INFO_MSG_DELAY_TIME = 3000;
var ERROR_MSG_DELAY_TIME = 6000;

var openFolder = function(destPath) {
	filePath = destPath || '';

	var breadcrumb = document.getElementById('breadcrumb');
	if (breadcrumb) {
		breadcrumb = $('#breadcrumb');
		breadcrumb.find('li[data-name="home"]').empty();
		breadcrumb.find('li[data-name="subpath"]').remove();
		showFileBreadcrumb();
	}

	$('#toolbar').show();
	$('#filelist-table').show();

	refreshFiles();
};

var refreshFiles = function(start, size) { // 20150723: no pagging
	if (!markTr) {
		markTr = $('#mark_tr').clone(true);
	}
	$('#filelist').find('tr').remove();
	$('#filelist-cb-all').prop('checked', false);
	$('#toolbar2').hide();
	$('#loading').show();
	fileItems = null;

	if (start === undefined) {
		start = currentIndex;
	} else {
		currentIndex = start;
	}
	if (size === undefined) {
		size = Xfinity.Util.pageSize;
	}

	var params = {
		clusterCode : clusterCode//,
//		start : start, // no pagging
//		limit : size // no pagging
	};
	if (filePath) {
		params.filePath = filePath;
	}
	$.ajax({
		url: 'showFileList.action',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		data: params,
		success: function(a, b, c) {
			var exception = c.responseJSON.fileInfo.exception;
			if (exception) {
				//$('#errInfo').html('<b>提示：</b>获取列表失败!原因：' + exception).show(300).delay(ERROR_MSG_DELAY_TIME).hide(1000);
				Xfinity.message.alert('<b>提示：</b>获取列表失败!原因：' + exception);
				$('#loading').hide();
				var newRow = $('<tr><td colspan="4" style="text-align:center;">没有权限或该目录不存在</td></tr>');
				newRow.appendTo('#filelist');
				return;
			}

//			$.turnPageBar.init({
//				reload:refreshFiles,
//				sum:c.responseJSON.results,
//				fresh:false,
//				start:start+1,
//				to:start + c.responseJSON.fileItems.length,
//				size:Xfinity.Util.pageSize
//			});

			$('#loading').hide();
			fileItems = c.responseJSON.fileItems;
			addFilesToList(fileItems);
		},
		error: function() {
//			$('#errInfo').html('<b>提示：</b>获取列表失败!').show(300).delay(ERROR_MSG_DELAY_TIME).hide(1000);
			Xfinity.message.alert('<b>提示：</b>获取列表失败!');
		}
	});
};

var addFilesToList = function(files) {
	if (filePath) {
		addParentLinkToList();
	}

	$.each(files, addFileToList);

	// sort by file name
	if (curSortField) {
		$('#filelist-title').find('th[data-sortfield="' + curSortField + '"]').find('span').hide();
		curSortField = '';
	}
	$('#filelist-title').find('th[data-sortfield="name"]').click();

	// no file
	if (files.length == 0) {
		var newRow = $('<tr><td colspan="4" style="text-align:center;">此文件夹为空</td></tr>');
		newRow.appendTo('#filelist');
	}
};

/**
 *
 */
var addParentLinkToList = function() {
	var newRow = markTr.clone(true).attr('id', 'file' + uniqueId++)/*.attr('data-index', -1)*/;
	newRow.data('index', -1);

	newRow.find('img[data-name="icon"]').attr('src', 'images/type/folder.png');
	newRow.find('input[name="filelist-cb"]').remove();

	var fileName = newRow.find('a[data-name="name"]');
	fileName.html('..');

	var parentPath = filePath.substring(0, filePath.lastIndexOf('/'));
	fileName.on('click', function() {
		openFolder(parentPath);
	});

	newRow.appendTo('#filelist');
	newRow.show();
};

/**
 *
 */
var addFileToList = function(index, file) {
	// create a new file item using clone, and assign an id to it
	var newRow = markTr.clone(true).attr('id', 'file' + uniqueId++)/*.attr('data-index', index)*/;
	newRow.data('index', index);

	// file name
	var fileName = newRow.find('a[data-name="name"]');
	fileName.html(file.name);

	var newPath = (filePath ? filePath + '/' : '') + file.name;
	// file type. 0: file, 1: folder, and other types
	// do not show size when type is folder.
	if (file.type === 1) { // folder
		newRow.find('img[data-name="icon"]').attr('src', 'images/type/folder.png');
		fileName.on('click', function() {
			openFolder(newPath);
		});
	} else { // other types
		var fileType = FileUtil.detectFileType(file.name);
		newRow.find('img[data-name="icon"]').attr('src', 'images/type/' + fileType.icon);
		var size = FileUtil.prettyFileSize(file.size);
		newRow.find('td[data-name="size"]').html(size);
		if (fileType.typeDesc === 'Text'
				|| fileType.typeDesc === 'LSF'
				|| fileType.typeDesc === 'Output'
				|| fileType.icon === 'txt.png') {
			if (file.size <= 2 * 1024 * 1024) {
				fileName.attr('href', __cwd__ + 'filePreview.jsp?filePath='
					+ encodeURI(encodeURI(newPath)) + '&clusterCode=' + clusterCode + '&clusterName=' + encodeURI(encodeURI(clusterName)));
				fileName.attr('target', '_blank');
			} else {
				// fileName.attr('href', 'javascript:alert();'); TODO large file preview not supported
			}
		}
	}

	// checkbox
	var cb = newRow.find('[name="filelist-cb"]');
	cb.data('fileName', file.name);
	cb.click(FileListFunctions.checkboxChanged);

	// modify date
	newRow.find('td[data-name="modifydate"]').html(file.lastModified);

	// show & hide toolbar when mouse enterring & leaving the row
	var toolbar = newRow.find('[data-name="toolbar"]');
	newRow.on('mouseenter', FileListFunctions.showToolbar(toolbar));
	newRow.on('mouseleave', FileListFunctions.hideToolbar(toolbar));
	// show & hide unzip button
	if (!fileType || (fileType.typeDesc !== 'RAR'
		&& fileType.typeDesc !== 'ZIP'
		&& fileType.typeDesc !== 'TAR'
		&& fileType.typeDesc !== 'GZIP')) {
		toolbar.find('[data-name="unzip_btn"]').hide();
	} else {
		toolbar.find('[data-name="unzip_btn"]').on('click', FileListFunctions.unzipFile(file.name));
	}
	// toolbar functions
	toolbar.find('a[data-name="copy_btn"]').on('click', FileListFunctions.copyFile(file.name));
	toolbar.find('a[data-name="cut_btn"]').on('click', FileListFunctions.cutFile(file.name));
	toolbar.find('a[data-name="del_btn"]').on('click', FileListFunctions.delFile(file.name));
	var downloadURL = encodeURI('fileTransfer.jsp?type=download&clusterCode='
			+ clusterCode + '&filePath=' + filePath + '&fileName=' + file.name);
	toolbar.find('a[data-name="download_btn"]').attr('href', downloadURL);
	toolbar.find('a[data-name="rename_btn"]').on('click', FileListFunctions.renameFile(file.name));
	toolbar.find('a[data-name="attr_btn"]').on('click', FileListFunctions.attrFile(file.permission, file.name, file.type));

	newRow.appendTo('#filelist');
	newRow.show();
};

/**
 * functions of file list operation.
 */
var FileListFunctions = function() {};

// hide toolbar of file list.
FileListFunctions.showToolbar = function(toolbar) {
	return function() {
		toolbar.show();
	};
};

// hide toolbar of file list.
FileListFunctions.hideToolbar = function(toolbar) {
	return function() {
		toolbar.hide();
	};
};

// cope file
FileListFunctions.copyFile = function(fileName) {
	return function() {
		_copyCutFiles(fileName, 'copy');
	};
};

// cut file
FileListFunctions.cutFile = function(fileName) {
	return function() {
		_copyCutFiles(fileName, 'cut');
	};
};

// unzip file
FileListFunctions.unzipFile = function(fileName) {
	return function() {
		var targetFolder = fileName.replace(/\.[^.]+$/, '');
		// TODO check if target folder exists
		var folderExists = false;
		if (folderExists) {
			$('#unzip_panel').modal('show');
		} else {
			_unzipFile(fileName);
		}
	};
};

var _unzipFile = function(fileName) {
	var params = {
		clusterCode : clusterCode,
		fileName : fileName,
		operator : '-c'
	};
	if (filePath) {
		params.filePath = filePath;
	}

	$.ajax({
		url: 'doUnzip.action',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		data: params,
		success: function(a, b, c) {
			var fileInfo = c.responseJSON.fileInfo || {};
			if (fileInfo.exception) {
//				$('#errInfo').html('<b>提示：</b>解压失败：' + fileInfo.exception).show(300).delay(ERROR_MSG_DELAY_TIME).hide(1000);
				Xfinity.message.alert('<b>提示：</b>解压失败：' + fileInfo.exception);
				return;
			}

//			$('#msgInfo').html('<b>提示：</b>解压成功').show(300).delay(INFO_MSG_DELAY_TIME).hide(1000);
			Xfinity.message.popup('<b>提示：</b>解压成功');
			// refresh list
			refreshFiles();
		},
		error: function() {
//			$('#errInfo').html('<b>提示：</b>解压失败!').show(300).delay(ERROR_MSG_DELAY_TIME).hide(1000);
			Xfinity.message.alert('<b>提示：</b>解压失败！');
		}
	});
};

// delete file
FileListFunctions.delFile = function(fileName) {
	return function() {
		$('#del_file_panel').modal('show');
		var yesBtn = $('#del_file_panel .modal-footer [data-name="yes-button"]');
		yesBtn.on('click', function(e) {
			$(this).off('click');
			$(this).addClass('m-progress');

			_deleteFiles(fileName);
		});
	};
};

var _deleteFiles = function(files) {
	var params = {
		clusterCode : clusterCode,
		files : files,
		checkRunningJob : true
	};
	if (filePath) {
		params.filePath = filePath;
	}

	$.ajax({
		url: 'doDel.action',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		data: params,
		success: function(a, b, c) {
			$('#del_file_panel').modal('hide');
			var fileInfo = c.responseJSON.fileInfo || {};
			if (fileInfo.exception) {
//				$('#errInfo').html('<b>提示：</b>删除文件失败：' + fileInfo.exception).show(300).delay(ERROR_MSG_DELAY_TIME).hide(1000);
				Xfinity.message.alert('<b>提示：</b>删除文件失败：' + fileInfo.exception);
				return;
			}

//			$('#msgInfo').html('<b>提示：</b>删除文件成功').show(300).delay(INFO_MSG_DELAY_TIME).hide(1000);
			Xfinity.message.popup('<b>提示：</b>删除文件成功');
			// refresh list
			refreshFiles();
		},
		error: function() {
			$('#del_file_panel').modal('hide');
//			$('#errInfo').html('<b>提示：</b>删除文件失败!').show(300).delay(ERROR_MSG_DELAY_TIME).hide(1000);
			Xfinity.message.alert('<b>提示：</b>删除文件失败！');
		}
	});
};

// file attribute
FileListFunctions.attrFile = function(permission, fileName, fileType) {
	permission = permission || '----------';
	var userPerm = _transPermission(permission.substring(1, 4));
	var groupPerm = _transPermission(permission.substring(4, 7));
	var otherPerm = _transPermission(permission.substring(7, 10));
	return function() {
		var chkBoxes = $('#attr_panel .modal-body');
		chkBoxes.find('input[name="readable"]').prop('checked', userPerm[0]);
		chkBoxes.find('input[name="writable"]').prop('checked', userPerm[1]);
		chkBoxes.find('input[name="executable"]').prop('checked', userPerm[2]);
		if (fileType === 1) { // folder
			var sizeBtn = $('#attr_panel .modal-footer a[data-name="size-btn"]');
			sizeBtn.on('click', function() {
				var sizeBtn = $(this);
				sizeBtn.off('click');
				sizeBtn.addClass('m-progress');

				var params = {
					clusterCode : clusterCode,
					fileNames   : fileName // separate by space: file1 file2 file3...
				};
				if (filePath) {
					params.filePath = filePath;
				}

				$.ajax({
					url: 'doDuFile.action',
					contentType: 'application/x-www-form-urlencoded; charset=utf-8',
					data: params,
					success: function(a, b, c) {
						sizeBtn.removeClass('m-progress');

						var fileInfo = c.responseJSON.fileInfo || {};
						if (fileInfo.exception) {
							return;
						}

						sizeBtn.hide();
						var fileSize = Number(c.responseJSON.fileSize);
						fileSize = FileUtil.prettyFileSize(fileSize);
						$('#attr_panel .modal-footer span[data-name="size"]').text(fileSize).show();
					},
					error: function() {
						sizeBtn.removeClass('m-progress');
					}
				});
			});
			sizeBtn.show();
		}
		$('#attr_panel').modal('show');

		$('#attr_panel .modal-footer button[data-name="modify"]').on('click', function(e) {
			$(this).off('click');
			$(this).addClass('m-progress');

			var chkBoxes = $('#attr_panel .modal-body');
			var readable = chkBoxes.find('input[name="readable"]').is(':checked');
			var writable = chkBoxes.find('input[name="writable"]').is(':checked');
			var executable = chkBoxes.find('input[name="executable"]').is(':checked');
			var tUserPerm = [readable, writable, executable];
			var tPermission = _transPermission2(tUserPerm, groupPerm, otherPerm);

			var params = {
				clusterCode : clusterCode,
				fileName    : fileName,
				permission  : tPermission
			};
			if (filePath) {
				params.filePath = filePath;
			}

			$.ajax({
				url: 'doChmod.action',
				contentType: 'application/x-www-form-urlencoded; charset=utf-8',
				data: params,
				success: function(a, b, c) {
					$('#attr_panel').modal('hide');
					var fileInfo = c.responseJSON.fileInfo || {};
					if (fileInfo.exception) {
//						$('#errInfo').html('<b>提示：</b>修改属性失败：' + fileInfo.exception).show(300).delay(ERROR_MSG_DELAY_TIME).hide(1000);
						Xfinity.message.alert('<b>提示：</b>修改属性失败：' + fileInfo.exception);
						return;
					}

//					$('#msgInfo').html('<b>提示：</b>修改属性成功').show(300).delay(INFO_MSG_DELAY_TIME).hide(1000);
					Xfinity.message.popup('<b>提示：</b>修改属性成功');
					userPerm = tUserPerm;
				},
				error: function() {
					$('#attr_panel').modal('hide');
//					$('#errInfo').html('<b>提示：</b>修改属性失败!').show(300).delay(ERROR_MSG_DELAY_TIME).hide(1000);
					Xfinity.message.alert('<b>提示：</b>修改属性失败!');
				}
			});
		});
	};
};
var _transPermission = function(permStr) {
	return [
		permStr[0] === 'r', // readable
		permStr[1] === 'w', // writable
		permStr[2] === 'x'  // executable
	];
};
var _transPermission2 = function(userPerm, groupPerm, otherPerm) {
	var u = (userPerm[0] ? 4 : 0)  + (userPerm[1] ? 2 : 0)  + (userPerm[2] ? 1 : 0);
	var g = (groupPerm[0] ? 4 : 0) + (groupPerm[1] ? 2 : 0) + (groupPerm[2] ? 1 : 0);
	var o = (otherPerm[0] ? 4 : 0) + (otherPerm[1] ? 2 : 0) + (otherPerm[2] ? 1 : 0);
	return '' + u + g + o;
};

// rename file
FileListFunctions.renameFile = function(fileName) {
	return function() {
		$('#new_name')[0].value = fileName;
		$('#rename_panel').modal('show');
		$('#rename_panel button.btn').on('click', function(e) {
			var newName = $('#new_name')[0].value;
			if (!_checkFileName(newName)) {
				$('#rename_file_name_invalid').show();
				return;
			} else {
				$('#rename_file_name_invalid').hide();
			}

			$(this).off('click');
			$(this).addClass('m-progress');
			_renameFile(fileName, newName);
		});
	};
};

var _checkFileName = function(name) {
	return /^[-a-zA-Z0-9_.]+$/.test(name);
};

var _renameFile = function(oldName, newName) {
	var params = {
		clusterCode : clusterCode,
		oldName : oldName,
		newName : newName
	};
	if (filePath) {
		params.filePath = filePath;
	}

	$.ajax({
		url: 'doRename.action',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		data: params,
		success: function(a, b, c) {
			$('#rename_panel').modal('hide');
			var fileInfo = c.responseJSON.fileInfo || {};
			if (fileInfo.exception) {
//				$('#errInfo').html('<b>提示：</b>重命名文件失败：' + fileInfo.exception).show(300).delay(ERROR_MSG_DELAY_TIME).hide(1000);
				Xfinity.message.alert('<b>提示：</b>重命名文件失败：' + fileInfo.exception);
				return;
			}

//			$('#msgInfo').html('<b>提示：</b>重命名文件成功').show(300).delay(INFO_MSG_DELAY_TIME).hide(1000);
			Xfinity.message.popup('<b>提示：</b>重命名文件成功');
			// refresh list
			refreshFiles();
		},
		error: function() {
			$('#rename_panel').modal('hide');
//			$('#errInfo').html('<b>提示：</b>重命名文件失败!').show(300).delay(ERROR_MSG_DELAY_TIME).hide(1000);
			Xfinity.message.alert('<b>提示：</b>重命名文件失败!');
		}
	});
};

/**
 * sort file list
 */
FileListFunctions.sortList = function() {
	if (!fileItems || fileItems.length === 0) {
		return;
	}

	var sortField = $(this).attr('data-sortfield');
	if (!sortField) return;

	if (sortField === curSortField) {
		sortMethod ^= 1; // switch sortMethod between 0 and 1
		if (sortMethod === 1) {
			$(this).addClass('dropup');
		} else {
			$(this).removeClass('dropup');
		}
	} else {
		if (curSortField)
			$('#filelist-title').find('th[data-sortfield="' + curSortField + '"]').find('span').hide();
		curSortField = sortField;
		sortMethod = 1;
		if (!$(this).hasClass('dropup')) {
			$(this).addClass('dropup'); // restore default
		}
		$(this).find('span').show();
	}

	var tbody = $('#filelist');
	var rows = tbody.find('tr').get();
	rows.sort(function(row1, row2) {
		var index1 = $(row1).data('index');
		if (index1 === -1) return -1; // parent link (..) is always on the top
		var index2 = $(row2).data('index');
		if (index2 === -1) return 1; // parent link (..) is always on the top

		var item1 = fileItems[index1];
		var item2 = fileItems[index2];
		if (item1.type === 1 && item2.type !== 1) return -1; // folder first: item1 is a folder, item2 not
		if (item1.type !== 1 && item2.type === 1) return 1; // folder first: item2 is a folder, item1 not

		var tempSortField = sortField;
		if (sortField === 'size' && item1.type === 1 && item2.type === 1) tempSortField = 'name';
		if (item1[tempSortField] === item2[tempSortField]) return 0; // equal
		if (item1[tempSortField] < item2[tempSortField] && sortMethod === 1
			|| item1[tempSortField] > item2[tempSortField] && sortMethod === 0) return -1; // item1 < item2, asc, or, item1 > item2, desc: <
		else return 1; // item1 < item2, desc, or, item1 > item2, asc: >
	});
	$.each(rows, function(index, row) {
		tbody.append(row);
	});
};

/**
 * 
 */
FileListFunctions.checkboxChanged = function() {
	var cb = $(this);
	if (cb.is(':checked')) {
		var uncheckedCheckbox = $('#filelist').find('tr').find('[name="filelist-cb"]').not(':checked');
		if (uncheckedCheckbox.length === 0) {
			$('#filelist-cb-all').prop('checked', true);
		}
		$('#toolbar2').show();
	} else {
		$('#filelist-cb-all').prop('checked', false);
		var checkedCheckbox = $('#filelist').find('tr').find('[name="filelist-cb"]:checked');
		if (checkedCheckbox.length === 0) {
			$('#toolbar2').hide();
		}
	}
};

/**
 * show file breadcrumb
 */
var showFileBreadcrumb = function() {
	var breadcrumb = document.getElementById('breadcrumb');
	if (!breadcrumb) return;

	breadcrumb = $('#breadcrumb');
	var home = breadcrumb.find('li[data-name="home"]');
	if (filePath) {
		var homeLink = $('<a href="javascript:void(0);">' + clusterName + '</a>');
		homeLink.on('click', function() {
			openFolder();
		});
		homeLink.appendTo(home);
	} else { // root of home directory
		home.html(clusterName);
	}

	// remove first & last / (if have), and split path into seperate files
	var files = filePath.replace(/^\//, '').replace(/\/$/, '').split('/');
	var file, a, li, path = '';

	var genListener = function(path) {
		return function() {
			openFolder(path);
		};
	};

	// if path too long, only show ... (except last 3 files), rather than show all files one by one
	if (files.length > 3) {
		path = files.splice(0, files.length - 3).join('/') + '/';
		a = $('<a href="javascript:void(0);">...</a>');
		a.on('click', genListener(path));
		li = $('<li data-name="subpath"></li>');
		a.appendTo(li);
		li.appendTo(breadcrumb);
	}

	// other files
	for (var i = 0; i < files.length; i++) {
		file = files[i];
		if (!file) continue;

		li = $('<li data-name="subpath"></li>');
		if (i < files.length - 1) {
			path += file + '/';
			a = $('<a href="javascript:void(0);">' + file + '</a>');
			a.on('click', genListener(path));
			a.appendTo(li);
		} else {
			li.html(file);
		}

		li.appendTo(breadcrumb);
	}
};

var newFile = function(fileName) {
	var params = {
		clusterCode : clusterCode,
		fileName : fileName
	};
	if (filePath) {
		params.filePath = filePath;
	}

	$.ajax({
		url: 'doNewFile.action',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		data: params,
		success: function(a, b, c) {
			$('#new_file_panel').modal('hide');
			var fileInfo = c.responseJSON.fileInfo || {};
			if (fileInfo.exception) {
//				$('#errInfo').html('<b>提示：</b>新建文件失败：' + fileInfo.exception).show(300).delay(ERROR_MSG_DELAY_TIME).hide(1000);
				Xfinity.message.alert('<b>提示：</b>新建文件失败：' + fileInfo.exception);
				return;
			}

//			$('#msgInfo').html('<b>提示：</b>新建文件成功').show(300).delay(INFO_MSG_DELAY_TIME).hide(1000);
			Xfinity.message.popup('<b>提示：</b>新建文件成功');
			// refresh list
			refreshFiles();
		},
		error: function() {
			$('#new_file_panel').modal('hide');
//			$('#errInfo').html('<b>提示：</b>新建文件失败!').show(300).delay(ERROR_MSG_DELAY_TIME).hide(1000);
			Xfinity.message.alert('<b>提示：</b>新建文件失败!');
		}
	});
};

var newFolder = function(folderName) {
	var params = {
		clusterCode : clusterCode,
		folderName : folderName
	};
	if (filePath) {
		params.filePath = filePath;
	}

	$.ajax({
		url: 'doNewFolder.action',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		data: params,
		success: function(a, b, c) {
			$('#new_folder_panel').modal('hide');
			var fileInfo = c.responseJSON.fileInfo || {};
			if (fileInfo.exception) {
//				$('#errInfo').html('<b>提示：</b>新建文件夹失败：' + fileInfo.exception).show(300).delay(ERROR_MSG_DELAY_TIME).hide(1000);
				Xfinity.message.alert('<b>提示：</b>新建文件夹失败：' + fileInfo.exception);
				return;
			}

//			$('#msgInfo').html('<b>提示：</b>新建文件夹成功').show(300).delay(INFO_MSG_DELAY_TIME).hide(1000);
			Xfinity.message.popup('<b>提示：</b>新建文件夹成功');
			// refresh list
			refreshFiles();
		},
		error: function() {
			$('#new_folder_panel').modal('hide');
//			$('#errInfo').html('<b>提示：</b>新建文件夹失败!').show(300).delay(ERROR_MSG_DELAY_TIME).hide(1000);
			Xfinity.message.alert('<b>提示：</b>新建文件夹失败!');
		}
	});
};

var pasteFiles = function() {
	if (!clipboard) {
		return;
	}

	var params = {
		originalClusterCode : clipboard.cluster,
		destClusterCode     : clusterCode,
		originalPath        : clipboard.path,
		files               : clipboard.files,
		type                : clipboard.type,
		operator            : '-c'
	};
	if (filePath) {
		params.destPath = filePath;
	}

	$.ajax({
		url: 'doPaste.action',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		data: params,
		success: function(a, b, c) {
			var fileInfo = c.responseJSON.fileInfo || {};
			if (fileInfo.exception) {
//				$('#errInfo').html('<b>提示：</b>粘贴失败：' + fileInfo.exception).show(300).delay(ERROR_MSG_DELAY_TIME).hide(1000);
				Xfinity.message.alert('<b>提示：</b>粘贴失败：' + fileInfo.exception);
				return;
			}

//			$('#msgInfo').html('<b>提示：</b>粘贴成功').show(300).delay(INFO_MSG_DELAY_TIME).hide(1000);
			Xfinity.message.popup('<b>提示：</b>粘贴成功');
			if (clipboard.type === 'cut') {
				clipboard = null;
				$('#paste').hide();
			}
			// refresh list
			refreshFiles();
		},
		error: function() {
//			$('#errInfo').html('<b>提示：</b>粘贴失败!').show(300).delay(ERROR_MSG_DELAY_TIME).hide(1000);
			Xfinity.message.alert('<b>提示：</b>粘贴失败!');
		}
	});
};

var _getSelectFiles = function() {
	var files = '';
	var checkedCheckbox = $('#filelist').find('tr').find('[name="filelist-cb"]:checked');
	$.each(checkedCheckbox, function(idx, cb) {
		files += (files ? ',' : '') + $(cb).data('fileName');
	});
	return files;
};

var zipFiles = function() {
	var files = _getSelectFiles();
	if (!files) return;

	var zipPanelBody = $('#zip_panel .modal-body');
	var zipFileName = zipPanelBody.find('input[name="zip-name"]')[0].value;
	// check if name exists
	if (!_checkFileName(zipFileName)) {
		$('#zip_file_name_invalid').show();
		return;
	} else {
		$('#zip_file_name_invalid').hide();
	}
	var zipType = zipPanelBody.find('input[name="zip-type"]:checked')[0].value;

	$(this).off('click');
	$(this).addClass('m-progress');

	var params = {
		clusterCode : clusterCode,
		files : files,
		zipType : zipType,
		zipFileName : zipFileName,
		operator : '-c'
	};
	if (filePath) {
		params.filePath = filePath;
	}

	$.ajax({
		url: 'doZip.action',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		data: params,
		success: function(a, b, c) {
			$('#zip_panel').modal('hide');
			var fileInfo = c.responseJSON.fileInfo || {};
			if (fileInfo.exception) {
//				$('#errInfo').html('<b>提示：</b>压缩失败：' + fileInfo.exception).show(300).delay(ERROR_MSG_DELAY_TIME).hide(1000);
				Xfinity.message.alert('<b>提示：</b>压缩失败：' + fileInfo.exception);
				return;
			}

//			$('#msgInfo').html('<b>提示：</b>压缩文件成功创建').show(300).delay(INFO_MSG_DELAY_TIME).hide(1000);
			Xfinity.message.popup('<b>提示：</b>压缩文件成功创建');
			// refresh list
			refreshFiles();
		},
		error: function() {
			$('#zip_panel').modal('hide');
//			$('#errInfo').html('<b>提示：</b>压缩失败!').show(300).delay(ERROR_MSG_DELAY_TIME).hide(1000);
			Xfinity.message.alert('<b>提示：</b>压缩失败!');
		}
	});
};

var deleteSelFiles = function() {
	$(this).off('click');
	$(this).addClass('m-progress');

	var files = _getSelectFiles();

	if (files)
		_deleteFiles(files);
};

// cope select files
var copySelFiles = function() {
	var files = _getSelectFiles();
	_copyCutFiles(files, 'copy');
};

// cut select files
var cutSelFiles = function() {
	var files = _getSelectFiles();
	_copyCutFiles(files, 'cut');
};

var _copyCutFiles = function(files, copy) {
	if (!files) return;
	copy = copy || 'copy';

	clipboard = {
		type : copy,
		cluster : clusterCode,
		path : filePath,
		files : files
	};
	$('#paste').show();
//	$('#msgInfo').html('<b>提示：</b>文件已复制到剪切板').show(300).delay(INFO_MSG_DELAY_TIME).hide(1000);
	Xfinity.message.popup('<b>提示：</b>文件已' + (copy == 'copy' ? '复制' : '剪切') + '到剪切板');
};

;$(function() {
	$('#refresh').click(function() {
		refreshFiles();
	});

	// new file
	$('#new_file').click(function() {
		// wire up the actual modal functionality and show the dialog
//		$('#new_file_panel').modal({
//			'backdrop' : 'static',
//			'keyboard' : true,
//			'show' : true // ensure the modal is shown immediately
//		});
		$('#new_file_panel').modal('show');
		$('#new_file_panel button.btn').on('click', function(e) {
			var fileName = $('#new_file_name')[0].value;
			if (!_checkFileName(fileName)) {
				$('#new_file_name_invalid').show();
				return;
			} else {
				$('#new_file_name_invalid').hide();
			}
			$(this).off('click');
			$(this).addClass('m-progress');
			newFile(fileName);
		});
	});
	$('#new_file_panel').on('shown.bs.modal', function() {
		$('#new_file_name').focus();
	});
	$('#new_file_panel').on('hide.bs.modal', function() {
		var okBtn = $('#new_file_panel button.btn');
		okBtn.off('click');
		okBtn.removeClass('m-progress');
		okBtn.text('OK');
		// make file name empty
		$('#new_file_name')[0].value = '';
		$('#new_file_name_invalid').hide();
	});

	// new folder
	$('#new_folder').click(function() {
		$('#new_folder_panel').modal('show');
		$('#new_folder_panel button.btn').on('click', function(e) {
			var folderName = $('#new_folder_name')[0].value;
			if (!_checkFileName(folderName)) {
				$('#new_folder_name_invalid').show();
				return;
			} else {
				$('#new_folder_name_invalid').hide();
			}
			$(this).off('click');
			$(this).addClass('m-progress');
			newFolder(folderName);
		});
	});
	$('#new_folder_panel').on('shown.bs.modal', function() {
		$('#new_folder_name').focus();
	});
	$('#new_folder_panel').on('hide.bs.modal', function() {
		var okBtn = $('#new_folder_panel button.btn');
		okBtn.off('click');
		okBtn.removeClass('m-progress');
		okBtn.text('OK');
		// make folder name empty
		$('#new_folder_name')[0].value = '';
		$('#new_folder_name_invalid').hide();
	});

	// rename file
    $('#rename_panel').on('shown.bs.modal', function() {
		$('#new_name').focus();
    });
	$('#rename_panel').on('hide.bs.modal', function() {
		var okBtn = $('#rename_panel button.btn');
		okBtn.off('click');
		okBtn.removeClass('m-progress');
		okBtn.text('OK');
		// make file name empty
		$('#new_name')[0].value = '';
		$('#rename_file_name_invalid').hide();
	});

	// delete file
	$('#del_file_panel .modal-footer [data-name="no-button"]').on('click', function(e) {
		$('#del_file_panel').modal('hide');
	});
	$('#del_file_panel').on('hide.bs.modal', function() {
		var yesBtn = $('#del_file_panel .modal-footer [data-name="yes-button"]');
		yesBtn.off('click');
		yesBtn.removeClass('m-progress');
		yesBtn.text('Yes');
	});

	// delete multi-files
	$('#deletefiles').on('click', function() {
		$('#del_file_panel').modal('show');
		var yesBtn = $('#del_file_panel .modal-footer [data-name="yes-button"]');
		yesBtn.on('click', deleteSelFiles);
	});

	// zip files
	$('#zipfiles').on('click', function() {
		$('#zip_panel').modal('show');

		// default zip file name
		var files = _getSelectFiles();
		if (files) {
			var firstSelFile = files.replace(/,.+$/, '');
			$('#zip_panel .modal-body input[name="zip-name"]')[0].value = firstSelFile.replace(/\.[^.]+$/, '');
		}

		$('#zip_panel .modal-footer button.btn').on('click', zipFiles);
	});
    $('#zip_panel').on('shown.bs.modal', function() {
		$(this).find('.modal-body input[name="zip-name"]').focus();
    });
	$('#zip_panel').on('hide.bs.modal', function() {
		var okBtn = $('#zip_panel .modal-footer button.btn');
		okBtn.off('click');
		okBtn.removeClass('m-progress');
		okBtn.text('OK');
		// make file name empty
		$(this).find('.modal-body input[name="zip-name"]')[0].value = '';
		$('#zip_file_name_invalid').hide();
	});

	// copy files
	$('#copyfiles').on('click', copySelFiles);

	// cut files
	$('#cutfiles').on('click', cutSelFiles);

	 // paste button
	 $('#paste').click(pasteFiles);
	 if (clipboard) {
	 	$('#paste').show();
	 }

	// attr file
	$('#attr_panel .modal-footer [data-name="close"]').on('click', function(e) {
		$('#attr_panel').modal('hide');
	});
	$('#attr_panel').on('hide.bs.modal', function() {
		var modifyBtn = $('#attr_panel .modal-footer [data-name="modify"]');
		modifyBtn.off('click');
		modifyBtn.removeClass('m-progress');
		modifyBtn.text('修改');

		var sizeBtn = $('#attr_panel .modal-footer a[data-name="size-btn"]');
		sizeBtn.off('click');
		sizeBtn.removeClass('m-progress');
		sizeBtn.text('计算大小');
		sizeBtn.hide();

		$('#attr_panel .modal-footer span[data-name="size"]').hide();
	});

	// sort
	$('#filelist-title').find('th').click(FileListFunctions.sortList);

	// checkbox
	$('#filelist-cb-all').click(function() {
	 	var checkbox = $('#filelist').find('tr').find('[name="filelist-cb"]');
		if (checkbox.length > 0) {
			checkbox.prop('checked', $(this).is(':checked'));
			if ($(this).is(':checked')) {
				$('#toolbar2').show();
			} else {
				$('#toolbar2').hide();
			}
		}
	});

	// show file list if clustercode is not null
	if (clusterCode) {
		openFolder(filePath);
	}
});
