
var apps = {};
var shortcuts = {};

var APP_ITEM_TPL = new Qmk.XTemplate(
	'<a id="{id}" href="javascript:void(0);" class="list-group-item software-item-default-bg" '
			+ 'style="padding:5px 15px;border:none;white-space:nowrap;" '
			+ 'data-softwarecode="{softwareCode}" data-appcode="{appCode}">'
		+ '<img src="images/softwares/{icon}.png" onerror="this.src=\'images/softwares/default.png\';" '
		+ 'width="38" height="32" style="padding:0 6px 0 0;border:none;" />{appName}'
	+ '</a>'
);
APP_ITEM_TPL.compile();

var SHORTCUT_ITEM_TPL = new Qmk.XTemplate(
	'<div id="{id}" style="padding: 5px 0;" data-shortcutcode="{shortcutCode}" data-appcode="{appCode}">'
		+ '<input type="checkbox" style="visibility:hidden;" /> '
		+ '<a href="javascript:void(0);">{shortcutName}</a>'
	+ '</div>'
);
SHORTCUT_ITEM_TPL.compile();

function showApp() {
	disableBtns();
	parser = null;
	$('#project-list a').remove();
	$('#queue-list a').remove();
	$('#version-list a').remove();
	$('#template-form').empty();

	var item = $(this);
	currentAppCode = item.attr('data-appcode');
	currentShortcutParam = null;

	showProjects();
	showQueues();
	showSoftwareVersions();

	$('#app').find('a.list-group-item-info').removeClass('list-group-item-info')
			.addClass('software-item-default-bg');
	item.removeClass('list-group-item-warning').addClass('list-group-item-info');
}

function showShortcut() {
	disableBtns();
	parser = null;
	$('#project-list a').remove();
	$('#queue-list a').remove();
	$('#version-list a').remove();
	$('#template-form').empty();

	var item = $(this).parent();
	currentAppCode = item.attr('data-appcode');
	var shortcutCode= item.attr('data-shortcutcode');
	var shortcut = shortcuts[shortcutCode];
	parseShortcutParam(shortcut);

	showProjects();
	showQueues();
	showSoftwareVersions();
}

function parseShortcutParam(shortcut) {
	if (!shortcut) {
		currentShortcutParam = null;
		return;
	}

	var params = shortcut.content.split('|');
	var param;
	var id, value;
	var project, queue, version;
	var t = [];
	for (var i = 0; i < params.length; i++) {
		param = params[i].split(',');
		id = param[0];
		value = param[1];
		value = _decodeParam(value);
		if (id == '__project__') project = value;
		else if (id == '__queue__') queue = value;
		else if (id == '__version__') version = value;
		else {
			param[1] = value;
			t.push(param);
		}
	}

	currentShortcutParam = {
		project : project,
		queue   : queue,
		version : version,
		params  : t
	};
}

function initShowHideBtns() {
	var expandBtns = $('a[data-name="expand-btn"]');
	expandBtns.on('click', function() {
		var btn = $(this);
		btn.hide();
		btn.prev().show();
		$('#' + btn.attr('for')).show();
	});

	var collapseBtns = $('a[data-name="collapse-btn"]');
	collapseBtns.on('click', function() {
		var btn = $(this);
		btn.hide();
		btn.next().show();
		$('#' + btn.attr('for')).hide();
	});
}

function refreshApps() {
	var appComp = $('#app');
	appComp.empty();

	$.ajax({
		url : 'listCurUserAvailableApp.action',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		success : function(data, status, jqXHR) {
			var appList = data.appList || [];

			var app;
			var item;
			var id;
			var templateUtil = Template.TemplateUtilities;
			apps = {};
			var appDirectShow;
			for (var i = 0; i < appList.length; i++) {
				app = appList[i];
				apps[app.appCode] = app;

				id = templateUtil.generateUniqueID();
				item = $(APP_ITEM_TPL.applyTemplate({
					id      : id,
					appCode : app.appCode,
					appName : app.appName,
					icon    : app.appName
				}));
				appComp.append(item);
				item.on('click', showApp).on('mouseover', function() {
					var a = $(this);
					if (a.hasClass('list-group-item-info')) return;

					a.removeClass('software-item-default-bg');
					a.addClass('list-group-item-warning');
				}).on('mouseout', function() {
					var a = $(this);
					if (!a.hasClass('list-group-item-warning')) return;

					a.removeClass('list-group-item-warning');
					a.addClass('software-item-default-bg');
				});

				// 如果传入了appCode，则应用列表加载完毕后直接显示此应用
				if ($appCode && $appCode == app.appCode) {
					appDirectShow = item;
					$appCode = null; // 只在初始加载后有效，此后刷新列表将不再直接加载
				}
			}
			if (appDirectShow) {
				appDirectShow.click();
				// QiaoMingkui 20151015:
				// 修正用代码触发的click事件无法让此app元素显示为选中样式的问题。问题说明：
				// 正常通过鼠标点击来选中一个app时，会为其添加list-group-item-info类，
				// 实际的选中样式由该类的:focus和:hover两个伪类样式实现的。然而通过代码触发的
				// click事件却无法触发这两个伪类样式，所以该元素并没有显示出选中时的样式。
				// 这里使用的是一种变通的解决办法：将下面这个类从元素中删除后，list-group-item-info类的
				// 样式就会生效，虽然此时仍然和实际选中的样式不太一样（实际上这时候是鼠标移上去时显示出的样式），
				// 但比什么样式都没有要好
				// 相关讨论见：http://segmentfault.com/q/1010000000160009
				appDirectShow.removeClass('software-item-default-bg'); 
			}
		}
	});
}

function refreshShortcuts() {
	var shortcutComp = $('#shortcut');
	shortcutComp.empty();
	$('#delete-shortcuts').hide();

	$.ajax({
		url : 'listShortcut.action',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		success : function(data, status, jqXHR) {
			var shortcuts = data.shortcuts || [];

			var shortcut;
			var item;
			var id;
			var templateUtil = Template.TemplateUtilities;
			window.shortcuts = {};
			for (var i = 0; i < shortcuts.length; i++) {
				shortcut = shortcuts[i];
				window.shortcuts[shortcut.shortcutCode] = shortcut;
				id = templateUtil.generateUniqueID();
				item = $(SHORTCUT_ITEM_TPL.applyTemplate({
					id           : id,
					shortcutName : shortcut.name,
					shortcutCode : shortcut.shortcutCode,
					appCode      : shortcut.objectCode
				}));
				shortcutComp.append(item);
				item.find('a').on('click', showShortcut);
				item.find('input[type="checkbox"]').on('click', chooseShortcut);
			}
		}
	});
}

function enterShortcutList() {
	var shortcut = $('#shortcut');
	shortcut.off('mouseover', enterShortcutList);
	shortcut.find('input[type="checkbox"]').css('visibility', 'visible');
}

function leaveShortcutList() {
	var shortcut = $('#shortcut');
	var checkedCbs = shortcut.find('input[type="checkbox"]:checked');
	if (checkedCbs.length == 0) {
		shortcut.find('input[type="checkbox"]').css('visibility', 'hidden');
		shortcut.on('mouseover', enterShortcutList);
	}
}

function chooseShortcut() {
	var checkedCbs = $('#shortcut').find('input[type="checkbox"]:checked');
	if (checkedCbs.length == 0) {
		$('#delete-shortcuts').hide();
	} else {
		$('#delete-shortcuts').show();
	}
}

function deleteShortcuts() {
	var checkedCbs = $('#shortcut').find('input[type="checkbox"]:checked');
	if (checkedCbs.length > 0) {
		Xfinity.message.confirm('真的要删除所选标签吗？', function() {
			$('#delete-shortcuts').attr('disabled', 'disabled');
			var items = $('#shortcut').find(':has(input[type="checkbox"]:checked)');
			var ids=[];
			for (var i = 0; i < items.length; i++){
				ids.push($(items[i]).attr('data-shortcutcode'));
			}

			$.ajax({
				url : 'delShortcuts.action',
				contentType: 'application/x-www-form-urlencoded; charset=utf-8',
				data : {
					ids : ids.join(',')
				},
				success : function(data, status, jqXHR) {
					refreshShortcuts();
					$('#delete-shortcuts').removeAttr('disabled');
				},
				error : function() {
					alert('删除失败');
					$('#delete-shortcuts').removeAttr('disabled');
				}
			});
		});
	}
}

;$(function() {
	initShowHideBtns();

	// disable buttons temporarily, as template has not shown yet
	disableBtns();

	$('#shortcut').on('mouseover', enterShortcutList).on('mouseout', leaveShortcutList);
	$('#delete-shortcuts').on('click', deleteShortcuts);

	refreshApps();
	refreshShortcuts();
});
