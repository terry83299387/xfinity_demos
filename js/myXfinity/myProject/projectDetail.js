 //1 function
 	var STATUS = 0;
  	var resourceDetail = function(configCode) {
		Xfinity.Util.post('jsp/myXfinity/resourceMgm/resourceDetail.jsp', {configCode:configCode});
	};
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
					Xfinity.message.alert("修改失败!原因："+exception);
				}else{
					setSubUserSelectOption(c.responseJSON.userList);
				}},
				error:function(){
					Xfinity.message.alert("修改失败!");
				}
			});
	};
	var setProjectInfo = function(projectInfo){
		if(projectInfo == null) return;
		$('#groupName').val(projectInfo.groupName);
		$('#name').val(projectInfo.name);
		$('#manager').val(projectInfo.managerCode);
		$('#description').val(projectInfo.description);
		var status = projectInfo.status;
		STATUS = status;
//		$('#status').val(status);
		$('#priority').val(projectInfo.priority);
		var startDate = "";
		var endDate = "";
		if(projectInfo.startDate)
			startDate = projectInfo.startDate.substring(0,10);
		if(projectInfo.endDate)
			endDate = projectInfo.endDate.substring(0,10);
		$('#startDate').val(startDate);
		$('#endDate').val(endDate);
	};
	var fetchProjectInfo = function(){
			jQuery.ajax({ 
				async:false,
				url: "projectInfoByCode.action",
				data:{projectCode:projectCode},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
						Xfinity.message.alert("修改失败!原因："+exception);
					}else{
						projectInfo = c.responseJSON.projectInfo
						setProjectInfo(projectInfo);
					}},
					error:function(){
						Xfinity.message.alert("修改失败!");
					}
				});
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
		var managerCode = $('#manager').val();
		var status = $('#status').val();
		var priority = $('#priority').val();
		var startDate = $('#startDate').val();
		var description = $("#description").val();
		var endDate = $('#endDate').val();
		var startDate = $('#startDate').val();
		var endDate = $('#endDate').val();
		var startTime = new Date(startDate.replace(/-/gm,'/'));
		
		var appCodeList = getCheckedApp();
		var userCodeList = getCheckedUser();
		var cmdCodeList = getCheckedCmd();
		var data = {
			projectCode:projectCode,
			name:$.trim(name),
			managerCode:managerCode,
			status:status,
			priority:priority,
			endDate:endDate,
			startDate:startDate,
			description:$.trim(description),
			appCodeList:appCodeList,
			userCodeList:userCodeList,
			cmdCodeList:cmdCodeList
		}
		return data;
	};
	var modifyProject = function(){
		if(!$("#baseInfoForm").valid()){
			return false;
		}
		var data = getFormValue();
		if(!data){
			return false;
		}
		jQuery.ajax({ 
				url: "modifyProjectInfo.action",
				data:data,
				type:'POST',
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					Xfinity.message.alert("修改失败!原因："+exception);
				}else{
					Xfinity.message.popup("修改成功!");
					location.href = "jsp/myXfinity/myProject/myProject.jsp";
				}},
				error:function(){
					Xfinity.message.alert("修改失败!");
				}
			});
	};
	
	
	var initAppList = function(){
			var data = {
				groupCode:groupCode,
				projectCode:projectCode
			};
			jQuery.ajax({ 
				url: "projectAvaAppList.action",
				type: "POST",
				data: data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
					}else{
						setAppList(c.responseJSON.groupAppList);
					}},
				error:function(){
				}
			});
	};
 	var setAppList = function(groupAppList){
 		var first = $("#appRow").clone(true);
		$("#app-table-body").find("tr").remove();
		first.appendTo("#app-table-body");
		
		$.each( groupAppList , function(index, content){
			var newRow = first.clone(true).attr("id","newRow"+index);
			var groupAppCode = content.groupAppCode;
			var appCode = content.appCode;
			var appCheckbox = newRow.find("input[id='appCheckbox']").attr('id',groupAppCode).attr('name','appCheckbox');
			newRow.find("a[id='app-modify-link']").attr('id','app-modify-link'+index).attr("onclick", "javascript:resourceDetail('"+appCode+"')");
			newRow.find("span[id='appName']").attr('id','appName'+index).html(content.appName);
			newRow.find("span[id='clusterName']").attr('id','clusterName'+index).html(content.clusterName);
			newRow.find("span[id='publisher']").attr('id','publisher'+index).html(content.publisher);
			var endDate = "";
			if(content.endDate){
			   endDate = endDate.substring(0,10);
			}
			newRow.find("span[id='endDate']").attr('id','endDate'+index).html(endDate);
			if(content.projectCode){
				appCheckbox.attr('checked',true);
			}else{
				appCheckbox.attr('checked',false);
			}
			newRow.appendTo("#app-table-body");
			newRow.removeClass("hide");
		});
		first.hide();
 	};
 	
	
	var initUserList = function(){
		var data = {
			groupCode:groupCode,
			projectCode:projectCode
		};
		jQuery.ajax({ 
			url: "projectAvaUserList.action",
			type: "POST",
			data: data,
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
			}else{
				setUserList(c.responseJSON.userInfoList);
			}},
				error:function(){
			}
		});
	};
 	var setUserList = function(userInfoList){
 		var first = $("#userRow").clone(true);
		$("#user-table-body").find("tr").remove('tr');
		first.appendTo("#user-table-body");
		$.each( userInfoList, function(index, content){
			var userCode = content.userCode;
			var newRow = first.clone(true).attr("id", userCode+index);
			var userCheckbox = newRow.find("input[id='userCheckbox']").attr('id',userCode).attr('name','userCheckbox');;
			newRow.find("a[id='user-modify-link']").attr('id','user-modify-link'+index).attr("onclick", "javascript:userDetail('"+userCode+"','"
			    +content.realName+"','"+groupCode+"')");
			newRow.find("span[id='userName']").attr('id','userName'+index).html(content.name);
			newRow.find("span[id='realName']").attr('id','realName'+index).html(content.realName);
			if(content.endDate){
				newRow.find("span[id='userEndDate']").attr('id','userEndDate'+index).html(content.endDate.substring(0,10));
			}
			if(content.projectCode){
				userCheckbox.attr('checked',true);
			}else{
				userCheckbox.attr('checked',false);
			}
				newRow.appendTo("#user-table-body");
			});
		first.hide();
 	};
 	var initCmdList = function(){
		var data = {
				projectCode:projectCode
			};
		jQuery.ajax({ 
			url: "projectCmdList.action",
			type: "POST",
			data: data,
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
		$("#cmd-table-body").find("tr").remove();
		first.appendTo("#cmd-table-body");
		$.each( cmdList, function(index, content){
			var clusterCode = content.clusterCode;
				var newRow = first.clone(true).attr("id", clusterCode+index);
				var cmdCheckbox = newRow.find("input[id='cmdCheckbox']").attr('id',clusterCode).attr('name','cmdCheckbox');;
				newRow.find("a[id='cmd-modify-link']").attr('id','cmd-modify-link'+index).attr("onclick", "javascript:clusterDetail('"+clusterCode+"')");
				newRow.find("span[id='clusterName']").attr('id','clusterName'+index).html(content.name);
				newRow.find("span[id='clusterPublisher']").attr('id','clusterPublisher'+index).html(content.clusterPublisherGroupName);
				var endDate = "";
				if(content.endDate){
					endDate = content.endDate.substring(0,10);
				}
				newRow.find("span[id='clusterEndDate']").attr('id','clusterEndDate'+index).html(endDate);
				if(content.projectCode){
					cmdCheckbox.attr('checked',true);
				}else{
				   	cmdCheckbox.attr('checked',false);
				}
				newRow.appendTo("#cmd-table-body");
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
		    // yesterday is minimum date
		});
		$('#endDate').datetimepicker({
		    yearOffset: 0,
		    lang: 'ch',
		    timepicker: false,
		    format: 'Y-m-d',
		    formatDate: 'Y-m-d',
		    allowBlank:true,
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
			   		stringCheck:true,
			   		remote: {
		                  type: "post",
		                  url: "checkProjectNameUnique.action",
		                  data: {
		                       projectName: function() {
		                           return $("#name").val();
		                       },
		                       projectCode:function(){
		                       	 return projectCode;
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
//			   		dateAfterAndEqualNow:true,
			   		endDateAfterStartDate:function(){
			   			var startDate = $("#startDate").val();
			   			var endDate = $("#endDate").val();
			   			return [startDate,endDate]
			   		}
		   		},
		   		endDate:{
		   			dateAfterNow:true,
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
		initTimePicker();
		Xfinity.Util.showTooltip();
		getSubUserListByGroupCode();
		fetchProjectInfo();
		initAppList();
		initUserList();
		initCmdList();
		if((roleCode == Xfinity.Constant.ROLE_SUB_USER) || (STATUS == Xfinity.Constant.PROJECT_STATUS["ended"]) || (STATUS == Xfinity.Constant.PROJECT_STATUS["terminated"])){
			$("#modifyDiv").addClass("hide");
			$("select").attr("disabled","disabled");
			$("input").attr("disabled","disabled");
		}
		$("#projectName").text(projectName);
		$('.input-group-addon').attr("style","width:110px");
		$('.form-control').attr("style","width:200px");
		formValidate();
	}
//2 running body
$(function(){
	
	initPage();
	
	$("#modify").click(function(){
		modifyProject();
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