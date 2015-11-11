
var clusterList;

var loadCmdClusterList = function() {
	jQuery.ajax({
        url: "listCmdClusterList.action",
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        type: 'post',
        success: function(a, b, c){
			clusterList = a.clusterList;
			showCmdCluster(clusterList);
        },
        error: function(){
        }
    });
}

var showCmdCluster = function(clusterList) {
	
	 var firstTr = $("#cmdClusterList");
	 
	 if(clusterList.length == 0) {
	 	$('#noCmdAlert').removeClass('hidden');
	 }
	 
	 $.each(clusterList, function(index, content){
        var newRow;
        newRow = firstTr.clone(true).attr("id", content.clusterCode);
        newRow.find("a[id='commandLink']").attr("onclick", "javascript:openCmd('" + content.clusterCode + "')");
        newRow.find("p[id='clusterName']").html(content.name);
        newRow.find("img[id='clusterImg']").attr("src",'clusterPicByCode.do?clusterCode='+content.clusterCode);
		
        newRow.appendTo("#cmdDiv");
		newRow.removeClass('hidden');
        newRow.show();
        
    });
} 

var openCmd = function(clusterCode) {
	for (i in clusterList) {
		var cluster = clusterList[i];
		if (cluster.clusterCode == clusterCode) {
			
			openCMD({
				clientKey:cluster.clientKey,
				username:cluster.hostUserName,
				password:cluster.pwd,
				initCd: cluster.workDir,
				port:cluster.cmdPort
			});
			
			break;
		}
	}
}

var openCMD = function(record) {
	var appStarter = PluginManager.getAppStarter();
		appStarter.setParameter("clientKey", record.clientKey);
		if (window.location.hostname == 'localhost') { // debug
			appStarter.setParameter("server", '192.168.120.220');
		} else {
			appStarter.setParameter("server", window.location.hostname);
		}
		appStarter.setParameter("username", record.username);
		appStarter.setParameter("password", record.password);
		appStarter.setParameter("initCd", record.initCd);
		appStarter.setParameter("port", record.port);
		appStarter.setParameter("call", "kitty.exe");
		var mess = appStarter.startLocalProgram();
		if (mess) {
			addCookie("localCMDAppPath", "",24*365);
			Xfinity.message.alert(mess);
		}
}

$(function(){
	loadCmdClusterList();
});