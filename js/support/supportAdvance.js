

var initCmdSec=function(start,size){
	jQuery.ajax({
		//url:"listCurrentUserAvailableCluster.action", 
		url:"listAvaClusterByPublisherSup.action",
		//url:"listAvaClusterByPublisher.action",
		asyns:false,
		data:{
			start:start,
			size:size	

		},
		contentType: "application/x-www-form-urlencoded; charset=utf-8",
		success: function(a,b,c){
			var exception=c.responseJSON.exception;
			if(exception){
				Xfinity.message.alert("<b>提示：</b>获取列表失败！原因："+exception).show(300).delay(3000).hide(1000);
			}
			else{
				var sum=c.responseJSON.sum;
				if(sum==0)
					{
					  $("#noCmdAlert").removeClass('hidden');
					  $("#cmdDiv").addClass('hidden');
					}
				else{
					  $("#noCmdAlert").addClass('hidden');
					  $("#cmdDiv").removeClass('hidden');
				      clusterList=c.responseJSON.clusterlist;
				      addClusterList(clusterList);
				}
			}
		},
		error: function(){
			Xfinity.message.alert("<b>提示：</b>获取列表失败！原因："+exception).show(300).delay(3000).hide(1000);
		}
	});
}

var addClusterList=function(clusterList){
	var firstDiv=$("#cmdSec").clone(true);
	$("#cmdDiv").find("div").remove();
	firstDiv.appendTo("#cmdDiv");
	$.each(clusterList,function(index,content){
		var newDiv=firstDiv.clone(true).attr("id",content.clusterCode);
		newDiv.find("p[id='clusterName']").html(content.name);
		newDiv.find("p[id='clusterCodeHide']").html(content.clusterCode);
		newDiv.appendTo("#cmdDiv");
		newDiv.show();
	});
	firstDiv.hide();
}

var openCMD=function(record,initCd){
		var appStarter = PluginManager.getAppStarter();
		
			appStarter.setParameter("clientKey", record.clientKey);
			if (window.location.hostname == 'localhost') { 
				appStarter.setParameter("server", '192.168.120.220');
			} else {
				appStarter.setParameter("server", window.location.hostname);
			}
			appStarter.setParameter("username", record.hostUserName);
			appStarter.setParameter("password", record.pwd);
			appStarter.setParameter("initCd", initCd);
			appStarter.setParameter("port", record.cmdPort);
			appStarter.setParameter("call", "kitty.exe");
			var mess = appStarter.startLocalProgram();
			if (mess) {
				addCookie("localCMDAppPath", "",24*365);
				Xfinity.message.alert(mess);
			}
	
}

$(function(){
	//Xfinity.Util.showTooltip();
	//$("[data-toggle='tooltip']").tooltip();
	$("#cmdSec").hide();
	var start=0;
	var size=100;
	//initCmdSec(start,Xfinity.Util.pageSize);
	initCmdSec(start,size);
	
	$("a[id='commandLink']").click(function(){
		//alert($(this).find("p[id='clusterCodeHide']").html());
		var clustercode=$(this).find("p[id='clusterCodeHide']").html();
	
		jQuery.ajax({
			url:"openCmdClusterInfoSup.action",
			contentType:"application/x-www-form-urlencoded;charset-utf-8",
			data:{
				//clusterCode:$(this).parent('col-md-4').id
				clusterCode:clustercode		
			},
			type:'post',
			success:function(a,b,c){
				var exception = c.responseJSON.exception;
	            if (exception) {
	                Xfinity.message.alert(exception);
	            }
	            else {
	            	var cluster = c.responseJSON.cluster;
	            	var initCd = c.responseJSON.initCd;
	            	openCMD(cluster,initCd);
	            }
			},
			error:function(){
				Xfinity.message.alert("<b>提示：</b>获取列表失败！原因："+exception).show(300).delay(3000).hide(1000);
			}
		});
	});
	
	
})