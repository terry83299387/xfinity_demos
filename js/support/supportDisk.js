var userName;

$(function(){
	$("#row").hide();
	
	var start=0;
	//var size=100;
	initDiskTable(start,Xfinity.Util.pageSize);
})

var initDiskTable=function(start,size){
	jQuery.ajax({ 
		url:"listHostUserByClusterCodeSup.action",
		asyns:false,
		dataType:"json",
		data:{
			start:start,
			size:size	
		},
		contentType: "application/x-www-form-urlencoded; charset=utf-8",
		success: function(a,b,c){
            var exception=c.responseJSON.exception;
            if(exception){
            	Xfinity.message.alert("<b>提示：</b>获取列表失败！原因："+exception);
            }
            else {
            	hostGroupAdminList=c.responseJSON.hostGroupAdminList;
            	userName=c.responseJSON.currentUserName;
            	$.turnPageBar.init({
            		reload:initDiskTable,
            		sum:hostGroupAdminList.length,
            		start:start+1,
            		size:Xfinity.Util.pageSize
            	});
            	           	
            	if(hostGroupAdminList.length!=0){
            	    addDiskTable(hostGroupAdminList);
            	}
            }
		},
		error: function(){
			Xfinity.message.alert("<b>提示：</b>获取列表失败！原因："+exception);
		}
	});
	
}

var addDiskTable=function(hostGroupAdminList){
	var firstTr=$("#row").clone(true);
	$("#table-body").find("tr").remove();
	firstTr.appendTo("#table-body");
	$.each(hostGroupAdminList,function(index,content){
		var newRow=firstTr.clone(true).attr("id",content.hostUserInfo.hostUserCode);
		if(content.groupAdmin.name==userName){
		   newRow.addClass('info');
		}
		newRow.find("span[id='username']").html(content.groupAdmin.name);
		newRow.find("span[id='email']").html(content.groupAdmin.email);
		newRow.find("span[id='phone']").html("15034006375");
		newRow.find("span[id='company']").html(content.hostUserInfo.company);
		newRow.find("span[id='clustername']").html(content.hostUserInfo.clusterName);
		newRow.find("span[id='hostusername']").html(content.hostUserInfo.hostUserName);
		newRow.find("span[id='workdir']").html(content.hostUserInfo.homeDir);
		var diskper;
		if(content.hostUserInfo.spaceQuota<=0){
        newRow.find("span[id='diskper']").html("未配置quota!");
        newRow.find("span[id='slash']").addClass('hidden');
        diskper=0;
		}else{
		diskper=(content.hostUserInfo.spaceUsage/content.hostUserInfo.spaceQuota*100).toFixed(1);
		if(diskper>=80){
			newRow.find("td[id='tduseagealert']").addClass('danger');
		}
		newRow.find("span[id='diskper']").html(diskper+"%");
		var spaceuseage=(content.hostUserInfo.spaceUsage/1024/1024/1024).toFixed(1);
		newRow.find("span[id='spaceuseage']").html(spaceuseage+"GB");
		var spacequota=(content.hostUserInfo.spaceQuota/1024/1024/1024).toFixed(1);
		newRow.find("span[id='spacequota']").html(spacequota+"GB");}
		newRow.find("a[id='detailbtn']").attr("onclick","javascript:detailDisk('"+content.hostUserInfo.clusterName+"','"+content.hostUserInfo.clusterCode+"','"+content.hostUserInfo.hostUserName+"','"+content.hostUserInfo.homeDir+"','"+diskper+"','"+spaceuseage+"','"+spacequota+"')");
		newRow.find("a[id='detailbtn']").removeClass('hidden');
		
		newRow.appendTo("#table-body");
		newRow.show();
	});
	firstTr.hide();
}

var detailDisk=function(clusterName,clusterCode,hostUserName,homeDir,diskper,useage,quota){
	Xfinity.Util.post('support/supportDiskDetail.jsp',{clusterName:clusterName,clusterCode:clusterCode,hostUserName:hostUserName,homeDir:homeDir,diskper:diskper,useage:useage,quota:quota});
}