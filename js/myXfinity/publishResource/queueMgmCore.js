	var _queueCode = "";
	var _queueList="";
	var _queueSum=0;
	var _queueStart=0;
	var _modifyValidator;
	var _addValidator;
	
	var _modifyQueueSetValue = function(code,name,status,des) {
		_queueCode = code;
		_modifyValidator.resetForm();
		$("#_queueNameM").val(name);
		$("#_queueStatusM").val(status);
		$("#_queueDesM").val(des);
		$("#_queueModifyModal").modal('show');
	};
	var _queueStatusStr = {
		"1":"可用",
		"2":"不可用"
	};
	var _setQueueHead = function(){
		$('#_head').find('.active').removeClass('active');
		$('#_myXfinity').addClass("active");
	};
	var _setQueueData = function(start,size){
		var data={
			clusterCode:clusterCode,
			start:start,
			size:size
		}
		return data;
	};
	var _initQueueTable = function(start,size){
		var firstTr = $("#_queueRow").clone(true);
		$("#_queue-table-body").find("tr").remove();
		firstTr.appendTo("#_queue-table-body");
		
		jQuery.ajax({ 
			url: "listAllQueueByClusterCode.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:_setQueueData(start,size),
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				_queueList = c.responseJSON.queueList;
				_queueSum = c.responseJSON.sum;
				_addQueueRow(_queueList);
				_freshPageBar();
			}},
			error:function(){
			}
		});
	};
	var _addQueueRow = function(queueList){
		var firstTr = $("#_queueRow");
		$.each( queueList, function(index, content){
			var status = content.queueStatus;
			var name = content.name;
			var code = content.queueCode;
			var des = content.description;
			var newRow = firstTr.clone(true).attr("id",code);
			
			newRow.find("input[id='_queueCheckbox1']").attr("id",code).attr("name",'_queueCheckbox');
			newRow.find("a[id='_queue-modify-link']").attr("onclick", "javascript:_modifyQueueSetValue('"+code+"','"+name+"','"+status+"','"+des+"')");
			newRow.find("span[id='_queueName']").attr("id","_queueName"+index).html(name);
			newRow.find("span[id='_queueDes']").attr("id","_queueDes"+index).html(des);
			var statusCN = _queueStatusStr[status];
			var statusE = newRow.find("span[id='_queueStatus']");
			statusE.html(statusCN);
			newRow.appendTo("#_queue-table-body");
			newRow.show();
		});
		firstTr.hide();
	};
	var _getQueueCheckedCodeList = function(){
		var items = $('[name = "_queueCheckbox"]:checkbox:checked');
		var codeList = "";
 		$.each( items, function(index, content){
 			if(codeList){
 				codeList +=";"
 			}
 			codeList +=content.id;
 		});
 		return codeList;
	};
   var _changeQueueStatus = function(status,str){
   		var codeList = _getQueueCheckedCodeList();
   		if(!codeList){
   			Xfinity.message.popup("没有勾选任何记录!");
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
				_initQueueTable($.turnPageBar.param.start-1,$.turnPageBar.param.size);
			}},
			error:function(){
				Xfinity.message.alert(str+"失败!");
			}
		});
   };
   
   var _addQueueFormValidate = function(){
		_addValidator = $("#_addQueueForm").validate({
			rules: {
		   		_queueNameAdd:{
			   		required:true,
			   		stringNotNull:true,
			   		userNameCheck:true,
			   		remote: {
		                  type: "post",
		                  async:false,
		                  url: "checkQueueNameUnique.action",
		                  data: {
		                       queueName: function() {
		                           return $("#_queueNameAdd").val();
		                       },
		                       clusterCode:function(){
		                       		return clusterCode;
		                       }
		                   },
		                   dataType: "json",
		                   dataFilter: function(a,b) {
		                    	var res = JSON.parse(a);
		                    	return res.queueNameUnique;
		                    }
		             }
		   		}
			},
			messages:{
				_queueNameAdd:{
					remote:"队列已存在"
				}
			},
			errorPlacement : function(error, element) { 
				error.appendTo(element.parent());
			}
		})
	};
	var _modifyQueueFormValidate = function(){
		_modifyValidator = $("#_modifyQueueForm").validate({
			rules: {
		   		_queueNameM:{
			   		required:true,
			   		stringNotNull:true,
			   		userNameCheck:true,
			   		remote: {
		                  type: "post",
		                  url: "checkQueueNameUnique.action",
		                  async:false,
		                  data: {
		                       queueName: function() {
		                           return $("#_queueNameM").val();
		                       },
		                       clusterCode:function(){
		                       		return clusterCode;
		                       },
		                       queueCode:function(){
		                       		return _queueCode;
		                       }
		                   },
		                   dataType: "json",
		                   dataFilter: function(a,b) {
		                    	var res = JSON.parse(a);
		                    	return res.queueNameUnique;
		                    }
		             }
		   		}
			},
			messages:{
				_queueNameM:{
					remote:"队列已存在"
				}
			},
			errorPlacement : function(error, element) { 
				error.appendTo(element.parent());
			}
		})
	};
	var _getAddQueueValue = function(){
		if(!$("#_addQueueForm").valid()){
   			return false;
   		}
		var queueName = $("#_queueNameAdd").val();
   		var queueStatus = $("#_queueStatusAdd").val();
   		var description = $("#_queueDesAdd").val();
   		var data = {
   			clusterCode:clusterCode,
   			queueName:queueName,
   			queueStatus:queueStatus,
   			description:description
   		}
   		return data;
	}
   var _addQueue = function(){
   		var data = _getAddQueueValue();
   		if(!data){
   			return false;
   		}
   		if(!$("#_addQueueForm").valid()){
   			return false;
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
				$("#_queueAddModal").modal('hide');
				_initQueueTable($.turnPageBar.param.start-1,$.turnPageBar.param.size);
			}},
			error:function(){
				Xfinity.message.alert("添加失败!");
			}
		});
   	
   };
   var _syncQueue = function(){
   		jQuery.ajax({ 
			url: "syncQueuesFromCluster.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:{clusterCode:clusterCode},
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				Xfinity.message.alert("同步失败!原因："+exception);
			}else{
				Xfinity.message.popup("同步成功！");
				_initQueueTable($.turnPageBar.param.start-1,$.turnPageBar.param.size);
			}},
			error:function(){
				Xfinity.message.alert("同步失败!");
			}
		});
   };
   var _getModifyValue = function(){
   		if(!$("#_modifyQueueForm").valid()){
   			return false;
   		}
   		var queueName = $("#_queueNameM").val();
		var queueStatus = $("#_queueStatusM").val();
		var description = $("#_queueDesM").val();
		var modifyValue = {
			clusterCode:clusterCode,
			queueCode:_queueCode,
			queueName:queueName,
			description:description,
			queueStatus:queueStatus
		};
		return modifyValue;
   };
   var _modifyQueue = function(){
   		var data  = _getModifyValue();
   		jQuery.ajax({ 
			url: "modifyQueue.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:data,
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				Xfinity.message.alert("修改失败!原因："+exception);
			}else{
				$("#_queueModifyModal").modal('hide');
				Xfinity.message.popup("修改成功!");
				_initQueueTable($.turnPageBar.param.start-1,$.turnPageBar.param.size);
			}},
			error:function(){
				Xfinity.message.alert("修改失败!");
			}
		});
   };
   var _freshPageBar = function(){
   		$.turnPageBar.reSet({
			reload:_initQueueTable,
			sum:_queueSum,
			fresh:true,
			start:1,
			size:Xfinity.Util.pageSize
		});
   };
   var _initPage = function(){
   		_setQueueHead();
		$("#_queueRow").hide();
		_initQueueTable(_queueStart,Xfinity.Util.pageSize);
		_addQueueFormValidate();
		_modifyQueueFormValidate();
   }
   var resetAddModal = function(){
   		$("#_queueNameAdd").val("");
   		$("#_queueStatusAdd").val(1);
   		$("#_queueDesAdd").val("");
   }
$(function(){
	//2.2 page effect
	_initPage();
	//2.3 click event
	$("#_queueAdd").click(function(){
		if(!clusterCode){//TODO
   			Xfinity.message.popup("没有获取到集群信息！");
   			return false;
   		}
		resetAddModal();
		_addValidator.resetForm();
	    $("#_queueAddModal").modal('show');
	});
	$("#_addQueue").click(function(){
		if(!clusterCode){//TODO
   			Xfinity.message.popup("没有获取到集群信息！");
   			return false;
   		}
		_addQueue();
	});
	$("#_modifyQueue").click(function(){
	    _modifyQueue();
	});
	$("#_queueSync").click(function(){
		if(!clusterCode){//TODO
   			Xfinity.message.popup("没有获取到集群信息！");
   			return false;
   		}
		_syncQueue();
	});
	$("#_queueForbid").click(function(){
		_changeQueueStatus(2,"禁用");
	});
	$("#_queueEnable").click(function(){
		_changeQueueStatus(1,"启用");
	});
	$("#_queueAllCheckbox").click(function() {
	 	var checkbox =$("[name='_queueCheckbox']");
		if($("#_queueAllCheckbox").is(':checked')){
			checkbox.prop("checked",true);
		}else{
			checkbox.prop("checked",false);
		}
	 });
	 

})