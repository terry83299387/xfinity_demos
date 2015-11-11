
var parser;
var clusters = {};
var currentAppCode;
var currentShortcutParam;
var $appCode;
var $proCode;

var SUBMITTING_ITEM_TPL = new Qmk.XTemplate(
	'<div id="{id}">'
		+ '<span>{jobName}</span><i id="{id}-closebtn" class="fa fa-fw fa-close text-danger" style="display:none;"></i>'
		+ '<div class="progress" role="progressbar" style="border:1px solid #ccc;">'
			+ '<div id="{id}-progress" class="progress-bar" style="width: 0%"></div>'
		+ '</div>'
		+ '<div id="{id}-info" style="margin: -20px 0 20px;"></div>'
	+ '</div>'
);
SUBMITTING_ITEM_TPL.compile();

var VERSION_ITEM_TPL = new Qmk.XTemplate(
	'<a id="{id}" href="javascript:void(0);" class="btn" '
			+ 'data-versioncode="{versionCode}" data-templatecode="{templateCode}">'
		+ '{versionName}'
	+ '</a>'
);
VERSION_ITEM_TPL.compile();

var QUEUE_ITEM_TPL = new Qmk.XTemplate(
	'<a id="{id}" href="javascript:void(0);" class="btn" data-queuecode="{queueCode}">'
		+ '{queueName}'
	+ '</a>'
);
QUEUE_ITEM_TPL.compile();

var PROJECT_ITEM_TPL = new Qmk.XTemplate(
	'<a id="{id}" href="javascript:void(0);" class="btn" data-projectcode="{projectCode}">'
		+ '{projectName}'
	+ '</a>'
);
PROJECT_ITEM_TPL.compile();

function fetchClusterInfo(clusterCode, callback, scope) {
	if (!callback) return;

	scope = scope || null;

	var clusterInfo = clusters[clusterCode];
	if (clusterInfo) {
		callback.call(scope, clusterInfo);
		return;
	}

	$.ajax({
		url : 'showClusterInfoForTransfer.action', // clusterInfoByCode
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		data: {
			clusterCode : clusterCode
		},
		success : function(data, status, jqXHR) {
			var clusterInfo = data.clusterInfo;
			clusters[clusterInfo.clusterCode] = clusterInfo;
			callback.call(scope, clusterInfo);
		}
	});
}

function showProjects() {
	if (!currentAppCode) {
		return;
	}

	$.ajax({
		url : 'showProjectList.action',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		data: {
			appCode : currentAppCode
		},
		success : function(data, status, jqXHR) {
			var projectList = data.projectList || [];

			var project, item, id;
			var projectListComp = $('#project-list');
			var templateUtil = Template.TemplateUtilities;
			var appDirectSelect;
			for (var i = 0; i < projectList.length; i++) {
				project = projectList[i];
				id = templateUtil.generateUniqueID();
				item = $(PROJECT_ITEM_TPL.applyTemplate({
					id : id,
					projectName : project.name,
					projectCode : project.proCode
				}));
				projectListComp.append(item);
				item.on('click', function() {
					var btn = $(this);
					if (btn.hasClass('active')) return;
					projectListComp.find('.active').removeClass('btn-success active');
					btn.addClass('btn-success active');
				});

				// 如果传入了proCode，则项目列表加载完毕后直接选中此项目
				if ($proCode && $proCode == project.proCode) {
					appDirectSelect = item;
					$proCode = null; // 只在初始加载后有效，此后刷新列表将不再直接加载
				} else if (i === 0) { // active first button
					appDirectSelect = item;
				}
			}

			if (currentShortcutParam) {
				project = currentShortcutParam.project;
				if (project) {
					projectListComp.find('a[data-projectcode="' + project + '"]').click();
				}
			} else if (appDirectSelect) {
				appDirectSelect.addClass('btn-success active');
			}
		}
	});
}

function showQueues() {
	if (!currentAppCode) {
		return;
	}

	$.ajax({
		url : 'showQueueList.action',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		data: {
			appCode : currentAppCode
		},
		success : function(data, status, jqXHR) {
			var queueList = data.queueList || [];

			var queue, item, id;
			var queueListComp = $('#queue-list');
			var templateUtil = Template.TemplateUtilities;
			for (var i = 0; i < queueList.length; i++) {
				queue = queueList[i];
				id = templateUtil.generateUniqueID();
				item = $(QUEUE_ITEM_TPL.applyTemplate({
					id : id,
					queueName : queue.name,
					queueCode : queue.queueCode
				}));
				queueListComp.append(item);
				item.on('click', function() {
					var btn = $(this);
					if (btn.hasClass('active')) return;
					queueListComp.find('.active').removeClass('btn-success active');
					btn.addClass('btn-success active');
				});
				// active first button
				if (i === 0) {
					item.addClass('btn-success active');
				}
			}

			if (currentShortcutParam) {
				queue = currentShortcutParam.queue;
				if (queue) {
					queueListComp.find('a[data-queuecode="' + queue + '"]').click();
				}
			}
		}
	});
}

function showSoftwareVersions() {
	var softwareCode = apps[currentAppCode].softwareCode;
	if (!softwareCode) {
		return;
	}

	$.ajax({
		url : 'listSoftwareVersion.action',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		data: {
			softwareCode : softwareCode
		},
		success : function(data, status, jqXHR) {
			var versionList = data.versionList || [];

			var version, item, id;
			var versionListComp = $('#version-list');
			var templateUtil = Template.TemplateUtilities;
			for (var i = 0; i < versionList.length; i++) {
				version = versionList[i];
				id = templateUtil.generateUniqueID();
				item = $(VERSION_ITEM_TPL.applyTemplate({
					id           : id,
					versionCode  : version.softwareVersionCode,
					versionName  : version.versionName,
					templateCode : version.templateCode
				}));
				versionListComp.append(item);
				item.on('click', function() {
					var btn = $(this);
					if (btn.hasClass('active')) return;
					versionListComp.find('.active').removeClass('btn-success active');
					btn.addClass('btn-success active');
					showTemplate(btn.attr('data-templatecode'));
				});
			}

			if (currentShortcutParam) {
				version = currentShortcutParam.version;
				if (version) {
					versionListComp.find('a[data-versioncode="' + version + '"]').click();
				}
			}
		}
	});
}

function showTemplate(templateCode) {
	if (!currentAppCode || !templateCode) {
		return;
	}

	disableBtns();
	parser = null;
	$('#template-form').empty();

	return $.ajax({
		url : 'showTemplate.action',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		data: {
			templateCode : templateCode
		},
		success : function(data, status, jqXHR) {
			var template = data.template;

			parser = new Template.TemplateParser(template, 'template-form', {
				clusterCode  : apps[currentAppCode].clusterCode,
				appCode      : currentAppCode,
				templateCode : templateCode
			});
			parser.init();
			if (currentShortcutParam) {
				var params = currentShortcutParam.params;
				parser.restorePersistenceParam(params);
				currentShortcutParam = null;
			}

			enableBtns();
		}
	});
}

function enableBtns() {
	$('#preview-btn').removeAttr('disabled');
	$('#saveparam-btn').removeAttr('disabled');
	$('#submit-btn').removeAttr('disabled');
}

function disableBtns() {
	$('#preview-btn').attr('disabled', 'disabled');
	$('#saveparam-btn').attr('disabled', 'disabled');
	$('#submit-btn').attr('disabled', 'disabled');
}

function preview() {
	if (!parser) return;

	$('#preview-btn').addClass('m-progress');

	var param = getTemplateParam();

	Template.TemplateUtilities.rpcProxy('url',
			'getPreview.action', param, _showPreview);
}

function saveParamAsShortcut() {
	if (!parser) return;

	var persistenceParam = parser.getPersistenceParam();
	
	// queue, version, project
	var queueCode = $('#queue-list .active').attr('data-queuecode');
	persistenceParam['__queue__'] = {value : queueCode};
	var versionCode = $('#version-list .active').attr('data-versioncode');
	persistenceParam['__version__'] = {value : versionCode};
	var projectCode = $('#project-list .active').attr('data-projectcode');
	persistenceParam['__project__'] = {value : projectCode};

	var content = '';
	var p;
	var shortcutName = apps[currentAppCode].appName;
	for (var id in persistenceParam) {
		p = persistenceParam[id];
		content += (content && '|') + id + ','
				+ _encodeParam(p.value)    + ','
				+ _encodeParam(p.desc)/*     + ',' // is labelCode still useful?
				+ _encodeParam(p.labelCode)*/;
		if (id == 'jobName') {
			shortcutName = p.value;
		}
	}

	var param = {
		appCode      : currentAppCode,
//		tag          : softwareName,
		content      : content,
		shortcutName : shortcutName//,
//		desktopName  : desktopName,
//		objectCode   : softwareCode,
//		type         : 'para'
	};
	// save param
	$.ajax({
		url : 'addShortcut.action',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		data: param,
		success : function(data, status, jqXHR) {
			// refresh shortcut list
			refreshShortcuts();
		},
		error : function() {
			alert('保存失败：未知错误'); // TODO
		}
	});
}

/*
 * replace '|' and ',' of param with $vb (vertical bar) and &cm (comma)
 * at the same time, $ is replaced with $dl (dollar)
 */
function _encodeParam(param) {
	// parameters are usually a string
	// though they may be other types, such as number
	// only string would be encoded.
	if (!param || typeof param != 'string') return param;
	return param.replace(/\$/g,'$dl').replace(/\,/g,'$cm').replace(/\|/g,'$vb');
}

/*
 * decode parameter which has been encoded.
 * @see: _encodeParam()
 */
function _decodeParam(param) {
	if (!param) return param;
	return param.replace(/\$cm/g,',').replace(/\$vb/g,'|').replace(/\$dl/g,'$');
}

function submit() {
	if (!parser) return;

	parser.prepareSubmit(function(deferred) {
		// generate id
		var id = Template.TemplateUtilities.generateUniqueID();
		var progressBarId = id + '-progress';
		var infoPanelId = id + '-info';
		var closeBtnId = id + '-closebtn';
		var param = getTemplateParam();

		// upload files
		deferred.progress(function(progress, jobName) {
			if (jobName) {
				var html = SUBMITTING_ITEM_TPL.applyTemplate({
					id : id,
					jobName : jobName
				});
				$('#submitting-jobs').append(html);
			}
			progress = progress < 0 ? 0 : progress;
			$('#' + progressBarId).css('width', progress + '%');
			$('#' + infoPanelId).html('uploading...' + progress + '%');
		}).done(function(/*jobCode*/) { // done to upload
			$('#' + infoPanelId).html('submitting...');

			// submit
			$.ajax({
				url : 'doSubmit.action',
				contentType: 'application/x-www-form-urlencoded; charset=utf-8',
				data: param,
				success : function(data, status, jqXHR) {
					$('#' + closeBtnId).show();
					if (data.exception) {
						$('#' + infoPanelId).html('提交失败：' + data.exception);
					} else {
						$('#' + infoPanelId).html('提交成功。<a href="jsp/myXfinity/myJob/jobDetail.jsp?jobCode='
							+ data.jobCode + '" target="_blank">查看</a>');
					}
					parser.fireEvent('jobsubmitted', {
						exception : data.exception,
						jobCode   : data.jobCode
					});
				},
				error : function() {
					$('#' + infoPanelId).html('提交失败：未知错误');
					$('#' + closeBtnId).show();
					parser.fireEvent('jobsubmitted', {
						exception : '提交失败：未知错误'
					});
				}
			});
		}).fail(function(exception) { // upload failed
			$('#' + infoPanelId).html('上传文件失败：' + exception);
			$('#' + closeBtnId).show();
		});
	});
}

function getTemplateParam() {
	var param = parser.getParam();

	var jsdlCst = Template.TemplateUtilities.jsdlKeys;
	var queueComp = $('#queue-list .active');
	param[jsdlCst.QUEUE] = queueComp.attr('data-queuecode');
	param[jsdlCst.QUEUE_NAME] = queueComp.text();

	var projectComp = $('#project-list .active');
	param[jsdlCst.PROJECT] = projectComp.attr('data-projectcode');

	return param;
}

function _showPreview(success, resp, options) {
	$('#preview-btn').removeClass('m-progress');

	resp = resp || {};
	if (!resp.runPreview || resp.exception) {
		alert(resp.exception);
		return;
	}

	$('#preview_panel .modal-body').html('<pre>' + resp.runPreview + '</pre>');
	$('#preview_panel').modal('show');
}

;$(function() {
	// attach event handlers
	$('#preview-btn').on('click', preview);
	$('#saveparam-btn').on('click', saveParamAsShortcut);
	$('#submit-btn').on('click', function() {
		$('#confirm_submit_panel').modal('show');
	});

	// preview panel OK button
	$('#preview_panel .modal-footer .btn').on('click', function() {
		$('#preview_panel').modal('hide');
	});

	// confirm submit panel Yes & No buttons
	$('#confirm_submit_panel .modal-footer button').on('click', function() {
		$('#confirm_submit_panel').modal('hide');
		if ($(this).attr('data-name') == 'yes') {
			submit();
		}
	});
});
