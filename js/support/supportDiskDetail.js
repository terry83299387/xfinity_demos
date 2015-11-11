$(function(){
	$("#row").hide();
	
	$("#clustername").html(clusterName);
	$("#hostusername").html(hostUserName);
	
	$("#progressbar").html(useage+"GB/"+quota+"GB").css('width',diskper+'%');
	
	initDiskDetail();
})

var initDiskDetail=function(){
	$("#loading").show();
	jQuery.ajax({
		url:"listDiskDetailTable.action",
		contentType: "application/x-www-form-urlencoded; charset=utf-8",
		data:{
			hostUserName:hostUserName,
			clusterCode:clusterCode
		},
		success:function(a,b,c){
			hostDiskDetail=c.responseJSON.diskSize;
			if(hostDiskDetail.length==0){
				$("#loading").hide();
				$("#tmpAlert").removeClass('hidden');
			}else{
				$("#tmpAlert").addClass('hidden');
				addDiskTable(hostDiskDetail);
			}
			
		},
		error:function(){
			Xfinity.message.alert("<b>提示：</b>获取列表失败！原因："+exception);
		}
	});
}

var addDiskTable=function(diskDetail){
	$("#loading").hide();
	var firstTr=$("#row").clone(true);
	$("#table-body").find("tr").remove();
	firstTr.appendTo("#table-body");
	$.each(diskDetail,function(index,content){
		var temparr=new Array();
		temparr=content.split(' ');
		var newRow=firstTr.clone(true).attr("id",index+"row");
		if(temparr.length==4){
			newRow.addClass('info');
			newRow.find("span[id='username']").html(temparr[2]);
			newRow.find("span[id='email']").html(temparr[3]);
		}
		newRow.find("span[id='workdir']").html(homeDir+"/"+temparr[1]);		
		newRow.find("span[id='usage']").html(temparr[0]+"B");
		
		newRow.appendTo("#table-body");
		newRow.show();
	});
	firstTr.hide();
}