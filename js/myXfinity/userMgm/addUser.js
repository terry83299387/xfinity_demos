 var detailProject = function(projectCode,projectName,groupCode) {
		Xfinity.Util.post('jsp/myXfinity/myProject/projectDetail.jsp', {projectCode:projectCode,projectName:projectName,groupCode:groupCode});
	};	

//1 function
	var getTodayDate = function(){
		var mydate = new Date();
	    var str = "" + mydate.getFullYear() + "-";
	    str += (mydate.getMonth()+1) + "-";
	    str += mydate.getDate();
	    return str;
	};
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
	    "3": "项目未到开始时间",
	    "4": "项目已结束",
	    "5":"项目已注销"
	};
	var statusIcon = {
	    "1": "fa-fw -o-notch -upload fa fa-2x fa-cog fa-spin text-success",
	    "2": "fa-fw -o-notch -upload fa fa-2x fa-clock-o fa-spin text-success",
	    "3": "fa-fw -o-notch -upload fa fa-2x fa-spin text-success fa-spinner",
	    "4": "fa-fw -o-notch -upload fa fa-2x text-success fa-angle-up",
	    "5": "fa-fw -o-notch -upload fa fa-2x fa-angle-double-up text-success"
	};
	var getFormValue = function(){
		var name = $('#userName').val();
		var realName = $('#realName').val();
		var email = $('#email').val();
		var status = $('#status').val();
		var priority = $('#priority').val();
		var maxSlots = $('#maxSlots').val();
		var maxJobs = $('#maxJobs').val();
		var maxJobs = $('#maxJobs').val();
		var endDate = $('#userEndDate').val();
		var projectCodeList = getCheckedProject();
		var data = {
			groupCode:groupCode,
			name:$.trim(name),
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
	var addSubUser = function(){
		if(!$("#baseInfoForm").valid()){
			return false;
		}
		var data = getFormValue();
		if(!data){
			return false;
		}
		jQuery.ajax({ 
				url: "addSubUser.action",
				type: "POST",
				data:data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
						Xfinity.message.alert("<b>提示：</b>添加失败!原因："+exception); 
					}else{
						location.href='jsp/myXfinity/userMgm/userMgm.jsp';
					}},
				error:function(){
					Xfinity.message.alert("<b>提示：</b>修改失败!"); 
				}
			});
	};
	
	
	var initProjectList = function(){
		if($("#listProject").find("div").length < 3){
			data = {
				groupCode:groupCode
			};
			jQuery.ajax({ 
				url: "availableGroupProjectList.action",
				async:true,
				type: "POST",
				data: data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
					}else{
						var projectList = c.responseJSON.projectList;
						addProjectRow(projectList);
					}},
				error:function(){
				}
			});
		}
	}
	var getCheckedProject = function(){
		var items = $('[name = "checkbox"]:checkbox:checked');
		var projectCodeList = '';
 		$.each( items, function(index, content){
 			if(projectCodeList){
 				projectCodeList +=";"
 			}
 			projectCodeList +=content.id;
 		});
 		return projectCodeList;
	}
	
	var addProjectRow = function(projectList){
		var firstTr = $("#row");
		$.each( projectList, function(index, content){
			var code = content.proCode;
			var newRow = firstTr.clone(true).attr("id", code+index);
			newRow.find("input[id='checkbox']").attr("id",code).attr('name','checkbox');
			newRow.find("a[id='modify-link']").attr("onclick", "javascript:detailProject('"+code+"','"+content.name+"','"+content.groupCode+"')");
			newRow.find("span[id='name']").attr("id","name"+index).html(content.name);
			newRow.find("span[id='manager']").attr("id","managerName"+index).html(content.managerName);
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
			newRow.appendTo("#table-body");
			newRow.show();
		});
		firstTr.hide();
	};
	var formValidate = function(){
		$("#baseInfoForm").validate({
			rules: {
		   		userName:{
			   		required:true,
			   		stringNotNull:true,
			   		userNameCheck:true,
			   		remote: {
		                  type: "post",
		                  url: "checkUserNameUnique.action",
		                  data: {
		                       userName: function() {
		                           return $("#userName").val();
		                       }
		                   },
		                   dataType: "json",
		                   dataFilter: function(a,b) {
		                    	var res = JSON.parse(a);
		                    	return res.userNameUnique;
		                    }
		             }
		   		},
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
				userName:{
			   		remote:"用户名已存在"
				},
				email:{
					remote:"email已存在"
				}
			},
			errorPlacement : function(error, element) { 
				error.appendTo(element.parent().parent())
			}
		})
	};
	var initPage = function(){
		$("#customDiv").hide();
		$("#groupName").val(groupName);
		initProjectList();
		Xfinity.Util.showTooltip();
		formValidate();
		$('#userEndDate').datetimepicker({
		    yearOffset: 0,
		    lang: 'ch',
		    timepicker: false,
		    format: 'Y-m-d',
		    formatDate: 'Y-m-d',
		    allowBlank:true
		});
		$('.input-group-addon').attr("style","width:110px");
		$('.form-control').attr("style","width:200px");
	}
//2 running body
	//2.1 variables definition
 $(function(){
	//2.2 page effect
	initPage();
	//2.3 click event
	$("#projectConfirm").click(function(){
		getCheckedProject();
		$("#addProjectModal").modal('hide');
		$("#projectList").val(projectNameList);
	});
	  //datepicker
	
	$("#allCheckbox").click(function() {
	 	var checkbox =$("[name='checkbox']");
		if($("#allCheckbox").is(':checked')){
			checkbox.prop("checked",true);
		}else{
			checkbox.prop("checked",false);
		}
	 });
	$("#add").click(function(){
		addSubUser();
	});
})