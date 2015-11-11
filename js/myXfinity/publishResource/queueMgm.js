var queueCode = "";
var modifyQueue = function(code,name,status) {
		queueCode = code;
		$("#queueNameM").val(name);
		$("#queueStatusM").val(status);
		$("#modifyModal").modal('show');
	};
$(function(){
	
	var statusStr = {
		"1":"可用",
		"2":"不可用"
	};
	var setHead = function(){
		$('#_head').find('.active').removeClass('active');
		$('#_myXfinity').addClass("active");
	};
	var setData = function(start,size){
		var data={
			clusterCode:clusterCode,
			start:start,
			size:size
		}
		return data;
	};
	var initTable = function(start,size){
		var firstTr = $("#row").clone(true);
		$("#table-body").find("tr").remove();
		firstTr.appendTo("#table-body");
		
		jQuery.ajax({ 
			url: "listAllQueueByClusterCode.action",
			async:false,
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:setData(start,size),
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
//				$("#msgInfo").html("<b>提示：</b>获取列表失败!原因："+exception).show(300).delay(3000).hide(1000); 
			}else{
				queueList = c.responseJSON.queueList;
				sum = c.responseJSON.sum;
				addRow(queueList);
			}},
			error:function(){
//				$("#msgInfo").html("<b>提示：</b>获取列表失败!").show(300).delay(3000).hide(1000); 
			}
		});
	};
	var addRow = function(queueList){
		var firstTr = $("#row");
		$.each( queueList, function(index, content){
			var status = content.queueStatus;
			var name = content.name;
			var code = content.queueCode;
			var newRow = firstTr.clone(true).attr("id",code);
			
			newRow.find("input[id='checkbox1']").attr("id",code).attr("name",'checkbox');
			newRow.find("a[id='modify-link']").attr("onclick", "javascript:modifyQueue('"+code+"','"+name+"','"+status+"')");
			newRow.find("span[id='name']").attr("id","name"+index).html(name);
			
			var statusCN = statusStr[status];
			var statusE = newRow.find("span[id='status']");
			statusE.html(statusCN);
			newRow.appendTo("#table-body");
			newRow.show();
		});
		firstTr.hide();
	};
	var getCheckedCodeList = function(){
		var items = $('[name = "checkbox"]:checkbox:checked');
		var codeList = "";
 		$.each( items, function(index, content){
 			if(codeList){
 				codeList +=";"
 			}
 			codeList +=content.id;
 		});
 		return codeList;
	};
   var changeStatus = function(status,str){
   		var codeList = getCheckedCodeList();
   		if(!codeList){
   			Xfinity.message.popup("没有勾选任何记录！");
   			return false;
   		}
		jQuery.ajax({ 
			url: "changeQueueListStatus.action",
			async:false,
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:{codeList:codeList,status:status},
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				Xfinity.message.alert(str+"失败!原因："+exception);
			}else{
				Xfinity.message.popup(str+"成功!");
				str+"失败!原因："+exception
				initTable($.turnPageBar.param.start-1,$.turnPageBar.param.size);
			}},
			error:function(){
				Xfinity.message.alert(str+"失败!");
			}
		});
   }
   
   var addQueue = function(){
   		var queueName = $("#queueName").val();
   		var queueStatus = $("#queueStatus").val();
   		if(!queueName || $.trim(queueName) == ""){
   			Xfinity.message.popup("队列名称不能为空！");
   			return false;
   		}
   		var data = {
   			clusterCode:clusterCode,
   			queueName:queueName,
   			queueStatus:queueStatus
   		}
   		jQuery.ajax({ 
			url: "addQueue.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:data,
			type:"POST",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				Xfinity.message.alert("添加失败!原因："+exception);
			}else{
				Xfinity.message.popup("添加成功!");
				$("#addModal").modal('hide');
				initTable($.turnPageBar.param.start-1,$.turnPageBar.param.size);
			}},
			error:function(){
				Xfinity.message.alert("添加失败!");
			}
		});
   	
   }
   var syncQueue = function(){
   		jQuery.ajax({ 
			url: "syncQueuesFromCluster.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:{clusterCode:clusterCode},
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				Xfinity.message.alert("同步失败!原因："+exception);
			}else{
				Xfinity.message.popup("同步成功!");
				initTable($.turnPageBar.param.start-1,$.turnPageBar.param.size);
			}},
			error:function(){
				Xfinity.message.alert("同步失败!");
			}
		});
   }
   var modifyQueue = function(){
   		var queueName = $("#queueNameM").val();
		var queueStatus = $("#queueStatusM").val();
   		jQuery.ajax({ 
			url: "modifyQueue.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:{clusterCode:clusterCode,queueCode:queueCode,queueName:queueName,queueStatus:queueStatus},
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				Xfinity.message.alert("修改失败!原因："+exception);
			}else{
				$("#modifyModal").modal('hide');
				Xfinity.message.popup("修改成功!");
				initTable($.turnPageBar.param.start-1,$.turnPageBar.param.size);
			}},
			error:function(){
				Xfinity.message.alert("添加失败!");
			}
		});
   }
//2 running body
	//2.1 variables definition
	var queueList="";
	var sum=0;
	var start=0;
	
	//2.2 page effect
	setHead();
	$("#row").hide();
	initTable(start,Xfinity.Util.pageSize);
	$.turnPageBar.init({
		reload:initTable,
		sum:sum,
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
	$("#add").click(function(){
	    $("#addModal").modal('show');
	});
	$("#addQueue").click(function(){
		addQueue();
	});
	$("#modifyQueue").click(function(){
	    modifyQueue();
	});
	$("#sync").click(function(){
		syncQueue();
	});
	$("#forbid").click(function(){
		changeStatus(2,"禁用");
	});
	$("#enable").click(function(){
		changeStatus(1,"启用");
	});
	$("#allCheckbox").click(function() {
	 	var checkbox =$("[name='checkbox']");
		if($("#allCheckbox").is(':checked')){
			checkbox.prop("checked",true);
		}else{
			checkbox.prop("checked",false);
		}
	 });
	 

})