	 //1 function
	var detailProject = function(projectCode,projectName,groupCode) {
			Xfinity.Util.post('jsp/myXfinity/myProject/projectDetail.jsp', {projectCode:projectCode,projectName:projectName,groupCode:groupCode});
		};
	var statusControl = function(status){
		if(status == 2 || status == 3){
				$("#restartUser").show();
				$("#modifyUserInfo").hide();
				$("select").attr("disabled","disabled");
				$("input").attr("disabled","disabled");
			}else{
				$("#restartUser").hide();
				$("#modifyUserInfo").show();
			}
	}
	var statusText = {
	    "1": "待审批",
	    "2": "进行中",
	    "3": "未开始",
	    "4": "结束",
	    "5": "注销"
	};
	var statusTooltip = {
		"1": "等待审批",
	    "2": "项目正在进行中",
	    "3": "项目未开始",
	    "4": "项目已结束",
	    "5": "项目已注销"
	};
	var statusIcon = {
	    "1": "fa-fw -o-notch -upload fa fa-2x fa-cog fa-spin text-success",
	    "2": "fa-fw -o-notch -upload fa fa-2x fa-clock-o fa-spin text-success",
	    "3": "fa-fw -o-notch -upload fa fa-2x fa-spin text-success fa-spinner",
	    "4": "fa-fw -o-notch -upload fa fa-2x text-success fa-angle-up",
	    "5": "fa-fw -o-notch -upload fa fa-2x fa-angle-double-up text-success"
	};
	var setUserInfo = function(userInfo){
		if(userInfo == null) return;
		$('#groupName').val(userInfo.groupName);
		$('#userName').val(userInfo.name);
		$('#realName').val(userInfo.realName);
		$('#email').val(userInfo.email);
		var status = userInfo.status;
		statusControl(status);
		$('#status').val(status);
		$('#priority').val(userInfo.priority);
		$('#maxSlots').val(userInfo.maxSlots);
		$('#maxJobs').val(userInfo.maxJobs);
		if(!endDate){
			$('#userEndDate').val(userInfo.endDate.substring(0,10));
		}
	}
	var getUserInfo = function(){
		$("#liRealName").text(realName);
			jQuery.ajax({ 
				url: "userInfoByUserCode.action",
				data:{userCode:detailUserCode},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					Xfinity.message.popup("修改失败!原因："+exception);
				}else{
					setUserInfo(c.responseJSON.userInfo);
				}},
				error:function(){
					$Xfinity.message.popup("修改失败!");
				}
			});
	};
	var getFormValue = function(){
		var groupName = $('#groupName').val();
		var name = $('#userName').val();
		realName = $('#realName').val();
		var email = $('#email').val();
		var status = $('#status').val();
		var priority = $('#priority').val();
		var maxSlots = $('#maxSlots').val();
		var maxJobs = $('#maxJobs').val();
		var endDate = $('#userEndDate').val();
		var projectCodeList = getCheckedProject();
		var data = {
			userCode:detailUserCode,
			groupName:groupName,
			name:name,
			realName:$.trim(realName),
			email:$.trim(email),
			status:status,
			priority:priority,
			maxSlots:maxSlots,
			maxJobs:maxJobs,
			endDate:endDate,
			projectCodeList:projectCodeList
		}
		return data;
	};
	var modifyUser = function(){
		if(!$("#baseInfoForm").valid()){
			return false;
		}
		var data = getFormValue();
		if(!data){
			return false;
		}
		jQuery.ajax({ 
				url: "modifyUserInfo.action",
				data:data,
				type: "POST",
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
						Xfinity.message.alert("修改失败!原因："+exception);
					}else{
						
						$("#liRealName").text(data.realName);
						Xfinity.message.popup("修改成功!");
						location.href='jsp/myXfinity/userMgm/userMgm.jsp';
					}},
				error:function(){
					Xfinity.message.alert("修改失败!");
				}
			});
	};
	var restartUser = function(status){
		jQuery.ajax({ 
				url: "modifyUserStatus.action",
				data:{userCode:detailUserCode,status:status},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
						Xfinity.message.alert("重新启用失败!原因："+exception);
					}else{
						Xfinity.message.popup("重新启用成功!");
						location.href='jsp/myXfinity/userMgm/userMgm.jsp';
					}},
				error:function(){
					Xfinity.message.alert("重新启用失败!");
				}
			});
	};
	var getCheckedProject = function(){
		var items = $('[name = "checkbox"]:checkbox:checked');
		var projectCodeList = "";
 		$.each( items, function(index, content){
 			if(projectCodeList){
 				projectCodeList +=";"
 			}
 			projectCodeList +=content.id;
 		});
 		return projectCodeList;
	};
	
	var initProjectList = function(){
		if($("#listProject").find("div").length < 3){
			data = {
				userCode:detailUserCode,
				groupCode:groupCode
			};
			jQuery.ajax({ 
				url: "userProjectList.action",
				async:false,
				type: "POST",
				data: data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
					}else{
						setProjectList(c.responseJSON.projectList);
					}},
				error:function(){
				}
			});
		}
	};
 	var setProjectList = function(projectList){
 		var firstTr = $("#row1");
		$.each( projectList, function(index, content){
			var code = content.proCode;
			var newRow = firstTr.clone(true).attr("id", code+index);
			newRow.find("a[id='modify-link']").attr("onclick", "javascript:detailProject('"+code+"','"+content.name+"','"+content.groupCode+"')");
			newRow.find("span[id='name']").attr("id","name"+index).html(content.name);
			newRow.find("span[id='manager']").attr("id","managerName"+index).html(content.managerName);
			var checkbox = newRow.find("input[id='checkbox']");
			checkbox.attr("id",code).attr('name','checkbox');
			if(content.userCode){
				checkbox.attr('checked','true');
			}
			var statusE = newRow.find("i[id='status']");
			var status = content.status;
			var newClass = '';
			var tooltipMessage = statusTooltip[status];
			statusE.attr("title", tooltipMessage);
			var newClass = statusIcon[status];
      	    statusE.removeClass().addClass(newClass);
      	    var text = statusText[status]
      	    newRow.find("span[id='statusText']").html(text);
			if(content.startDate)
			 	newRow.find("span[id='startDate']").attr("id","start"+index).html(content.startDate.substring(0,10));
			if(content.endDate)
				newRow.find("span[id='endDate']").attr("id","endDate"+index).html(content.endDate.substring(0,10));
			newRow.appendTo("#table-body1");
			newRow.show();
		});
		firstTr.hide();
 	};
 	
 	var initUserAppList = function(){
		var firstTr = $("#row2").clone(true);
		$("#table-body2").find("tr").remove();
		firstTr.appendTo("#table-body2");
			jQuery.ajax({ 
				url: "listUserApp.action",
				type: "POST",
				data: {userCode:detailUserCode},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
					}else{
						setUserAppList(c.responseJSON.userAppInfoList);
					}},
				error:function(){
				}
			});
	};
	
	var setUserAppList = function(userAppInfoList){
		var firstTr = $("#row2");
		$.each( userAppInfoList, function(index, content){
 			var newRow; 
			newRow = firstTr.clone(true).attr("id", content.userCode);
			newRow.find("td[id='num']").html(index+1);
			newRow.find("td[id='appName']").attr("id","name"+index).html(content.appName);
			newRow.find("td[id='clusterName']").attr("id","managerName"+index).html(content.clusterName);
			newRow.find("td[id='projectName']").attr("id","projectName"+index).html(content.projectName);
			newRow.appendTo("#table-body2");
			newRow.show();
		});
		firstTr.hide();
 	};
 	var formValidate = function(){
		$("#baseInfoForm").validate({
			rules: {
		   		realName:{
		   			required:true,
			   		stringNotNull:true
		   		},
		   		email:{
		   			required:true,
		   			email:true,
		   			remote: {
		                  type: "post",
		                  url: "checkEmailUnique.action",
		                  data: {
		                       email: function() {
		                           return $("#email").val();
		                       },
		                       userCode:function(){
		                       		return detailUserCode;
		                       }
		                   },
		                   dataType: "json",
		                   dataFilter: function(a,b) {
		                    	var res = JSON.parse(a);
		                    	return res.emailUnique;
		                    }
		             }
		   		},
		   		maxJobs:{
		   			min:0
		   		},
		   		maxSlots:{
		   			min:0
		   		},
		   		userEndDate:{
		   			dateAfterNow:true
		   		}
			},
			messages:{
				email:{
					remote:"email已存在"
				}
			},
			errorPlacement : function(error, element) { 
				error.appendTo(element.parent().parent())
			}
		})
	};
	var initPageInfo = function(){
		getUserInfo();
		initProjectList();
		initUserAppList();
		Xfinity.Util.showTooltip();
		formValidate();
		$("#projectDown").hide();
		$("#softwareDown").hide();
		$('#userEndDate').datetimepicker({
		    yearOffset: 0,
		    lang: 'ch',
		    timepicker: false,
		    format: 'Y-m-d',
		    allowBlank:true,
		    formatDate: 'Y-m-d'
		});
		$('.input-group-addon').attr("style","width:110px");
		$('.form-control').attr("style","width:200px");
		
	};
//2 running body
$(function(){
 	
 	initPageInfo();
	//click event
	$("#modifyUserInfo").click(function(){
		modifyUser();
	});
	
	$("#restartUser").click(function(){
		restartUser(1);
	});
	$("#projectUp").click(function(){
		$("#projectTable").hide();
		$("#projectDown").show();
		$("#projectUp").hide();
	});
	$("#projectDown").click(function(){
		$("#projectTable").show();
		$("#projectDown").hide();
		$("#projectUp").show();
	});
	$("#softwareUp").click(function(){
		$("#softwareTable").hide();
		$("#softwareDown").show();
		$("#softwareUp").hide();
	});
	$("#softwareDown").click(function(){
		$("#softwareTable").show();
		$("#softwareDown").hide();
		$("#softwareUp").show();
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