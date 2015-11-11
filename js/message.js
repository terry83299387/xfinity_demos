if (typeof Xfinity == "undefined") {
	var Xfinity = {};
}

Xfinity.message = {
	popup : function(msg, title) {
		if (title) {
			$.messager.popup(title, msg);
		} else {
			$.messager.popup(msg);
		}
	},

	alert : function(msg, title) {
		if (title) {
			$.messager.alert(title, msg);
		} else {
			$.messager.alert(msg);
		}
	},

	confirm : function(msg, title, callback) {
		if (typeof title === 'function') {
			callback = title;
			title = 'confirm';
		} else {
			title = title || 'confirm';
		}

		$.messager.confirm(title, msg, callback);
	}
}
