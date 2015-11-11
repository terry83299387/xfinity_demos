 	var resourceDetail = function(configCode) {
		Xfinity.Util.post('jsp/myXfinity/resourceMgm/resourceDetail.jsp', {configCode:configCode});
	};
	//1 function
	var userDetail= function(userCode,realName,groupCode) {
		Xfinity.Util.post('jsp/myXfinity/userMgm/userDetail.jsp', {userCode:userCode,realName:realName,groupCode:groupCode});
	};	
	var clusterDetail = function(clusterCode) {
		Xfinity.Util.post('jsp/myXfinity/resourceMgm/clusterDetail.jsp', {clusterCode:clusterCode});
	};
	
	var setSubUserSelectOption = function(subUserList){
		var select = $("#manager").get(0);
		$.each( subUserList, function(index, content){
			select.options.add(new Option(content.realName+"("+content.name+")",content.userCode));
		});
		$("#manager").val(currentUserCode);
	};
	var getSubUserListByGroupCode = function(){
		jQuery.ajax({ 
				url: "avaSubUserListByGroupCode.action",
				async: false,
				type: "POST",
				data:{groupCode:groupCode},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
				}else{
					userList = c.responseJSON.userList;
					if(roleCode != Xfinity.Constant.ROLE_SUB_USER){
						setSubUserSelectOption(userList);
					}
					setUserList(userList);
				}},
				error:function(){
				}
			});
	};
	var getTodayDate = function(){
		var mydate = new Date();
	    var str = "" + mydate.getFullYear() + "-";
	    str += (mydate.getMonth()+1) + "-";
	    str += mydate.getDate();
	    return str;
	};
	
	var getCheckedApp = function(){
		var items = $('[name = "appCheckbox"]:checkbox:checked');
		var groupConfigCodeList = "";
 		$.each( items, function(index, content){
 			if(groupConfigCodeList){
 				groupConfigCodeList +=";"
 			}
 			groupConfigCodeList +=content.id;
 		});
 		return groupConfigCodeList;
	};
	var getCheckedUser = function(){
		var userCodeList = "";
		var items = $('[name = "userCheckbox"]:checkbox:checked');
 		$.each( items, function(index, content){
 			if(userCodeList){
 				userCodeList +=";"
 			}
 			userCodeList += content.id;
 		});
 		return userCodeList;
	};
	var getCheckedCmd = function(){
		var items = $('[name = "cmdCheckbox"]:checkbox:checked');
		var cmdCodeList = "";
 		$.each( items, function(index, content){
 			if(cmdCodeList){
 				cmdCodeList +=";"
 			}
 			cmdCodeList +=content.id;
 		});
 		return cmdCodeList;
	};
	var getFormValue = function(){
		var name = $('#name').val();
		var managerCode = currentUserCode;
		if(roleCode == Xfinity.Constant.ROLE_GROUP_ADMIN){
			managerCode = $('#manager').val();
		}
		var description = $('#description').val();
		var priority = $('#priority').val();
		var startDate = $('#startDate').val();
		var endDate = $('#endDate').val();
		var startTime = new Date(startDate.replace(/-/gm,'/'));
		var now = new Date();
		var status = 2;
		if(startTime > now){
				status = 3;
			}
		var appCodeList = getCheckedApp();
		var userCodeList = getCheckedUser();
		var cmdCodeList = getCheckedCmd();
		var data = {
			groupCode:groupCode,
			name:$.trim(name),
			description:$.trim(description),
			priority:priority,
			managerCode:managerCode,
			status:status,
			startDate:startDate,
			endDate:endDate,
			appCodeList:appCodeList,
			userCodeList:userCodeList,
			cmdCodeList:cmdCodeList
		}
		return data;
	};
	
	var addProject = function(){
		if(!$("#baseInfoForm").valid()){
			return false;
		}
		var data = getFormValue();
		if(!data){
			return false;
		}
		jQuery.ajax({ 
				url: "addProject.action",
				type: "POST",
				data: data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
						Xfinity.message.alert("添加失败！原因:"+exception);
					}else{
						Xfinity.message.popup("添加成功！");
						location.href = "jsp/myXfinity/myProject/myProject.jsp";
					}},
				error:function(){
					Xfinity.message.alert("添加失败！");
				}
			});
	};
	
	
	var initAppTable = function(){
			jQuery.ajax({ 
				url: "avaAppListByGroupCode.action",
				async:false,
				type: "POST",
				data: {groupCode:groupCode},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
					}else{
						setAppTable(c.responseJSON.groupAppList );
					}},
				error:function(){
				}
			});
	};
 	var setAppTable = function(groupAppList ){
 		var first = $("#appRow").clone(true);
		$("#app-table-body").find("tr").remove('tr');
		first.appendTo("#app-table-body");
		$.each( groupAppList , function(index, content){
			var newRow = first.clone(true).attr("id","newRow"+index);
			var groupAppCode = content.groupAppCode;
			var appCode = content.appCode;
			newRow.find("input[id='appCheckbox']").attr('id',groupAppCode).attr('name','appCheckbox');
			newRow.find("a[id='app-modify-link']").attr('id','app-modify-link'+index).attr("onclick", "javascript:resourceDetail('"+appCode+"')");
			newRow.find("span[id='appName']").attr('id','appName'+index).html(content.appName);
//			newRow.find("span[id='appVersion']").attr('id','appVersion'+index).html(content.appVersion);
			newRow.find("span[id='clusterName']").attr('id','clusterName'+index).html(content.clusterName);
			newRow.find("span[id='publisher']").attr('id','publisher'+index).html(content.publisher);
			if(content.endDate){
				newRow.find("span[id='endDate']").attr('id','endDate'+index).html(content.endDate.substring(0,10));
			}
			newRow.appendTo("#app-table-body");
			newRow.removeClass("hide");
		});
		first.hide();
 	};
	
 	var setUserList = function(userInfoList){
	 		var first = $("#userRow").clone(true);
			$("#user-table-body").find("tr").remove('tr');
			first.appendTo("#user-table-body");
			$.each( userInfoList, function(index, content){
				var userCode = content.userCode;
				var newRow = first.clone(true).attr("id", userCode+index);
				newRow.find("input[id='userCheckbox']").attr('id',userCode).attr('name','userCheckbox');;
				newRow.find("a[id='user-modify-link']").attr('id','user-modify-link'+index).attr("onclick", "javascript:userDetail('"+userCode+"','"
				+content.realName+"','"+groupCode+"')");
				newRow.find("span[id='userName']").attr('id','userName'+index).html(content.name);
				newRow.find("span[id='realName']").attr('id','realName'+index).html(content.realName);
				var endDate;
				if(content.endDate){
					endDate = content.endDate.substring(0,10);
				}
				newRow.find("span[id='userEndDate']").attr('id','userEndDate'+index).html(endDate);
				newRow.appendTo("#user-table-body");
			});
			first.hide();
 	};
	
	
	var initCmdList = function(){
			jQuery.ajax({ 
				url: "listGroupAvaCmdCluster.action",
				type: "POST",
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
					}else{
						setCmdList(c.responseJSON.clusterlist);
					}},
				error:function(){
				}
			});
	}
 	var setCmdList = function(cmdList){
 		var first = $("#cmdRow").clone(true);
		$("#cmd-table-body").find("tr").remove('tr');
		first.appendTo("#cmd-table-body");
		$.each( cmdList, function(index, content){
			var clusterCode = content.clusterCode;
				var newRow = first.clone(true).attr("id", clusterCode+index);
				newRow.find("input[id='cmdCheckbox']").attr('id',clusterCode).attr('name','cmdCheckbox');;
				newRow.find("a[id='cmd-modify-link']").attr('id','cmd-modify-link'+index).attr("onclick", "javascript:clusterDetail('"+clusterCode+"')");
				newRow.find("span[id='clusterName']").attr('id','clusterName'+index).html(content.name);
				newRow.find("span[id='clusterPublisher']").attr('id','clusterPublisher'+index).html(content.clusterPublisherGroupName);
				newRow.find("span[id='clusterEndDate']").attr('id','clusterEndDate'+index).html(content.endDate.substring(0,10));
				newRow.appendTo("#cmd-table-body");
				newRow.removeClass("hide");
		});
		first.hide();
 	};
	var initTimePicker = function(){
		$('#startDate').datetimepicker({
		    yearOffset: 0,
		    lang: 'ch',
		    timepicker: false,
		    format: 'Y-m-d',
		    formatDate: 'Y-m-d',
		    minDate: '-1999-01-01'
		});
		$('#endDate').datetimepicker({
		    yearOffset: 0,
		    lang: 'ch',
		    timepicker: false,
		    allowBlank:true,
		    format: 'Y-m-d',
		    formatDate: 'Y-m-d',
		    minDate: '-1999-01-01'
		    // yesterday is minimum date
		});
	};
	var formValidate = function(){
		$("#baseInfoForm").validate({
			rules: {
		   		name:{
			   		required:true,
			   		stringNotNull:true,
			   		stringCheck2:true,
			   		remote: {
		                  type: "post",
		                  url: "checkProjectNameUnique.action",
		                  data: {
		                       projectName: function() {
		                           return $("#name").val();
		                       }
		                   },
		                   dataType: "json",
		                   dataFilter: function(a,b) {
		                    	var res = JSON.parse(a);
		                    	return res.projectNameUnique;
		                    }
		             }
		   		},
		   		startDate:{
		   			required:true,
			   		dateAfterAndEqualNow:true,
			   		endDateAfterStartDate:function(){
			   			var startDate = $("#startDate").val();
			   			var endDate = $("#endDate").val();
			   			return [startDate,endDate]
			   		}
		   		},
		   		endDate:{
		   			dateAfterAndEqualNow:true,
			   		endDateAfterStartDate:function(){
			   			var startDate = $("#startDate").val();
			   			var endDate = $("#endDate").val();
			   			return [startDate,endDate]
			   		}
		   		}		   	
			},
			messages:{
				name:{
			   		remote:"项目已存在"
				}
			},
			errorPlacement : function(error, element) { 
				error.appendTo(element.parent().parent())
			}
		})
	};
	var initPage = function(){
		 $("#appDown").hide();
		 $("#userDown").hide();
		 $("#cmdDown").hide();
		 Xfinity.Util.showTooltip();
		 formValidate();
		$("#startDate").val(getTodayDate());
		initTimePicker();
		$('.input-group-addon').attr("style","width:110px");
		$('.form-control').attr("style","width:200px");
	}
//2 running body
 $(function(){
	//2.1 variables definition
	//2.2 page effect
 	
	initPage();
	//ROLETODO
	if(roleCode == Xfinity.Constant.ROLE_SUB_USER){
		$("#managerDiv").addClass("hide");
	}
	getSubUserListByGroupCode();
	
	initAppTable();
	initCmdList();
	//2.3 click event
	$("#add").click(function(){
		addProject();
	});
	$("#appAllCheckbox").click(function() {
	 	var checkbox =$("[name='appCheckbox']");
		if($("#appAllCheckbox").is(':checked')){
			checkbox.prop("checked",true);
		}else{
			checkbox.prop("checked",false);
		}
	 });
	 $("#userAllCheckbox").click(function() {
	 	var checkbox =$("[name='userCheckbox']");
		if($("#userAllCheckbox").is(':checked')){
			checkbox.prop("checked",true);
		}else{
			checkbox.prop("checked",false);
		}
	 });
	 $("#cmdAllCheckbox").click(function() {
	 	var checkbox =$("[name='cmdCheckbox']");
		if($("#cmdAllCheckbox").is(':checked')){
			checkbox.prop("checked",true);
		}else{
			checkbox.prop("checked",false);
		}
	 });
	
	 $("#appUp").click(function(){
		$("#appTable").hide();
		$("#appDown").show();
		$("#appUp").hide();
	});
	$("#appDown").click(function(){
		$("#appTable").show();
		$("#appDown").hide();
		$("#appUp").show();
	});
	$("#userUp").click(function(){
		$("#userTable").hide();
		$("#userDown").show();
		$("#userUp").hide();
	});
	$("#userDown").click(function(){
		$("#userTable").show();
		$("#userDown").hide();
		$("#userUp").show();
	});
	$("#cmdUp").click(function(){
		$("#cmdTable").hide();
		$("#cmdDown").show();
		$("#cmdUp").hide();
	});
	$("#cmdDown").click(function(){
		$("#cmdTable").show();
		$("#cmdDown").hide();
		$("#cmdUp").show();
	});
	
	
	
})