var _addHostUser = function(clusterCode,clusterName) {
		Xfinity.Util.post('jsp/myXfinity/publishResource/addHostUser.jsp', {clusterCode:clusterCode,clusterName:clusterName});
	};
var _hostUserDetail = function(hostUserCode) {
		Xfinity.Util.post('jsp/myXfinity/resourceMgm/hostUserDetail.jsp', {hostUserCode:hostUserCode});
	};	
$(function(){
	var _setData = function(start,size){
		var data={
			clusterCode:clusterCode,
			start:start,
			size:size
		}
		return data;
	};
	var _typeStr = {
		"1":"售卖",
		"2":"自用",
		"3":"试用"
	}
	var _initTable = function(start,size){
		var firstTr = $("#_row").clone(true);
		$("#_table-body").find("tr").remove();
		firstTr.appendTo("#_table-body");
		
		jQuery.ajax({ 
			url: "listHostUserByClusterCode.action",
			async:false,
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:_setData(start,size),
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				$("#_msgInfo").html("<b>提示：</b>获取列表失败!原因："+exception).show(300).delay(3000).hide(1000); 
			}else{
				_hostUserList = c.responseJSON.hostUserList;
				_sum = c.responseJSON.sum;
				_addRow(_hostUserList);
			}},
			error:function(){
				$("#_msgInfo").html("<b>提示：</b>获取列表失败!").show(300).delay(3000).hide(1000); 
			}
		});
	};
	var _addRow = function(hostUserList){
		var firstTr = $("#_row");
		$.each( hostUserList, function(index, content){
			var hostUserCode = content.hostUserCode;
			var newRow = firstTr.clone(true).attr("id", hostUserCode+index);
			newRow.find("input[id='_checkbox1']").attr("id",hostUserCode).attr("name",'_checkbox');
			newRow.find("a[id='_modify-link']").attr("id","_modify-link"+index).attr("onclick", "javascript:_hostUserDetail('"+hostUserCode+"')");
			newRow.find("span[id='_name']").attr("id","_name"+index).html(content.hostUserName);
			var type = _typeStr[content.type]
			newRow.find("span[id='_type']").attr("id","_type"+index).html(type);
			newRow.find("span[id='_workDir']").attr("id","_workDir"+index).html(content.homeDir);
			var statusE = newRow.find("span[id='_status']");
			var status = content.status;
			var statusStr = '';
			if(status == 0 || status == 2){//不可用
				statusE.attr("style","color:red");
				statusStr = "不可用";
			}else if(status == 1 || status == 3){//可用
				statusE.attr("style","color:green");
				statusStr = "可用";
			}
			statusE.html(statusStr);
			var buyer = newRow.find("span[id='_buyer']");
			var groupCode = content.groupCode;
			var buyerStr = content.groupName;
			var software = newRow.find("span[id='_software']");
			var configCode = content.configCode;
			var softwareName = content.softwareName;
			if(content.type == 2 || content.type == 3){
				buyerStr = "--";
				softwareName = "--";
			}else{
				if(groupCode){//已售出
					buyer.attr("style","color:red");
				}else{//未售出
					buyer.attr("style","color:green");
					buyerStr="未售出";
				}
				if(configCode){//已分配
					software.attr("style","color:red");
				}else{//未分配
					software.attr("style","color:green");
					softwareName = "未分配";
				}
			}
			buyer.html(buyerStr);
			software.html(softwareName);
			newRow.appendTo("#_table-body");
			newRow.show();
		});
		firstTr.hide();
	};
	var _getCheckedHostUserCodeList = function(){
		var items = $('[name = "_checkbox"]:checkbox:checked');
		var codeList = "";
 		$.each( items, function(index, content){
 			if(codeList){
 				codeList +=";"
 			}
 			codeList +=content.id;
 		});
 		return codeList;
	};
   var _changeHostUserListStatus = function(status,str){
   		var codeList = _getCheckedHostUserCodeList();
   		if(!codeList){
   			$("#_msgInfo").html("<b>提示：</b>没有勾选任何一个集群用户！").show(300).delay(3000).hide(1000); 
   			return false;
   		}
		jQuery.ajax({ 
			url: "changeHostUserListStatus.action",
			async:false,
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:{codeList:codeList,status:status},
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				$("#_msgInfo").html("<b>提示：</b>"+str+"失败!原因："+exception).show(300).delay(3000).hide(1000); 
			}else{
				$("#_msgInfo").html("<b>提示：</b>"+str+"成功！").show(300).delay(3000).hide(1000); 
				_initTable($.turnPageBar.param.start-1,$.turnPageBar.param.size);
			}},
			error:function(){
				$("#_msgInfo").html("<b>提示：</b>"+str+"失败!").show(300).delay(3000).hide(1000); 
			}
		});
   }
//2 running body
	//2.1 variables definition
	var _hostUserList="";
	var _sum=0;
	var _start=0;
	//2.2 page effect
	$("#_row").hide();
	_initTable(_start,Xfinity.Util.pageSize);
	$.turnPageBar.init({
		reload:_initTable,
		sum:_sum,
		fresh:true,
		cur:1,
		start:1,
		to:Xfinity.Util.pageSize,
		size:Xfinity.Util.pageSize
	});
	//2.3 click event
//	$("#refreshTable").click(function(){
//		initTable($.turnPageBar.param.start-1,$.turnPageBar.param.size);
//	});
	$("#_addHostUser").click(function(){
	    _addHostUser(clusterCode,clusterName);
	});
	$("#_forbid").click(function(){
		_changeHostUserListStatus(2,"禁用");
	});
	$("#_enable").click(function(){
		_changeHostUserListStatus(1,"启用");
	});
	$("#_allCheckbox").click(function() {
	 	var checkbox =$("[name='_checkbox']");
		if($("#_allCheckbox").is(':checked')){
			checkbox.prop("checked",true);
		}else{
			checkbox.prop("checked",false);
		}
	 });
	 
	 
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

})