
var refreshFileContent = function() {
	if (!filePath) return;

	var params = {
		clusterCode : clusterCode,
		filePath    : filePath
	};
	jQuery.ajax({
		url: 'showFileContent.action',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		data: params,
		success: function(a, b, c) {
			var content = c.responseText || '';
			content = content.replace(/</g, '&lt;').replace(/>/g, '&gt;')/*.replace(/\r?\n/g, '<br/>')*/;
			$('#fileContent').html(content);
		},
		error: function() {
			$('#msgInfo').html('<b>提示：</b>获取文件内容失败!').show(300).delay(3000).hide(1000);
		}
	});
};

/**
 * show file breadcrumb
 */
var showFileBreadcrumb = function() {
	var breadcrumb = document.getElementById('breadcrumb');
	breadcrumb.innerHTML = '<li>' + clusterName + '</li>';
	// remove last / (if has), and split path into seperate files
	var files = filePath.replace(/\/$/, '').split('/');
	var file, li, path = '';

	// if path too long, only show ... (except last 3 files), rather than show all files one by one
	if (files.length > 3) {
		li = document.createElement('LI');
		path = files.splice(0, files.length - 3).join('/') + '/';
		li.innerHTML = '...';
		breadcrumb.appendChild(li);
	}

	// other files
	for (var i = 0; i < files.length; i++) {
		file = files[i];
		if (!file) continue;

		li = document.createElement('LI');
		li.innerHTML = file;
		breadcrumb.appendChild(li);
	}
};

;$(function() {
	showFileBreadcrumb();

    refreshFileContent();

    $('#refresh').click(function() {
        refreshFileContent();
    });
});
