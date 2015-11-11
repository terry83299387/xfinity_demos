//1 function	
	var projectList="";
	var sum=0;
	var start=0;
	var groupCode="";
	var DEL = 0;
	
	var detailProject = function(projectCode,projectName,groupCode) {
		Xfinity.Util.post('jsp/myXfinity/myProject/projectDetail.jsp', {projectCode:projectCode,projectName:projectName,groupCode:groupCode});
	};	
	var submitJob = function(appCode,proCode) {
		Xfinity.Util.post('jsp/myXfinity/myApp/myApp.jsp',{appCode:appCode,proCode:proCode});
	};

	var setData = function(start,size,status){
		var data={
			start:start,
//			userCode:userCode,
			size:size,
			status:status
		}
		return data;
	};
	var statusTooltip = {
	    "1": "待审批",
	    "2": "进行中",
	    "3": "未开始",
	    "4": "结束",
	    "5": "注销"
	};
	var selectedURL = {
		//group-admin
		"all-group-admin": "projectInfoList.action",
	    "approval-group-admin": "projectListByStatus.action",
	    "cancelled-group-admin": "projectListByStatus.action",
	    "ended-group-admin": "projectListByStatus.action",
	    "includeMe-group-admin": "userAllProjectList.action",
	    //pulisher
	    "all-publisher": "projectInfoList.action",
	    "approval-publisher": "projectListByStatus.action",
	    "cancelled-publisher": "projectListByStatus.action",
	    "ended-publisher": "projectListByStatus.action",
	    "includeMe-publisher": "userAllProjectList.action",
	    //subUser
//	    "all-sub-user": "",
	    "approval-sub-user": "projectListByStatus.action",
	    "cancelled-sub-user": "projectListByStatus.action",
	    "ended-sub-user": "projectListByStatus.action",
	    "includeMe-sub-user": "projectListByStatus.action"
	};
	var selectedStatus = {
		"approval": "1",
	    "cancelled": "5",
	    "ended": "4"
	};
	var statusIcon = {
	    "1": "fa-fw -o-notch -upload fa fa-2x fa-cog fa-spin text-success",
	    "2": "fa-fw -o-notch -upload fa fa-2x fa-clock-o fa-spin text-success",
	    "3": "fa-fw -o-notch -upload fa fa-2x fa-spin text-success fa-spinner",
	    "4": "fa-fw -o-notch -upload fa fa-2x fa-gavel text-warning",
	    "5": "fa-fw -o-notch -upload fa fa-2x fa-warning text-danger"
	};
	var initAppList = function(projectCode,groupCode,proApps,proStatus){
			var data = {
				groupCode:groupCode,
				projectCode:projectCode
			};
			jQuery.ajax({ 
				url: "projectPermissionAppList.action",
				async:false,
				type: "POST",
				data: data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
					}else{
						setAppList(c.responseJSON.groupAppList,proApps,proStatus,projectCode);
					}},
				error:function(){
				}
			});
	};
 	var setAppList = function(groupAppList,proApps,proStatus,projectCode){
 		var first = $("#app").clone(true);
		$("#"+proApps).find("div").remove("div");
		first.appendTo("#"+proApps);
		$.each( groupAppList, function(index, content){
			var groupAppCode = content.groupAppCode;
			var appCode = content.appCode;
			var softwareCode = content.softwareCode;
			var newRow = first.clone(true).attr("id", groupAppCode); 
			//ROLETODO
			if(proStatus == "2"){
				newRow.find("div[id='submitJob-sub']").addClass("hide");
				newRow.find("a[id='submitJob']").attr("onclick", "javascript:submitJob('"+appCode+"','"+projectCode+"')");
				newRow.find("img[id='img']").attr("id",groupAppCode+index).attr("src",'softwarePicByCode.do?softwareCode='+softwareCode);
				newRow.find("p[id='appNameVersion']").attr("id","appNameVersion"+index).html(content.appName);
			}else{
				newRow.find("a[id='submitJob']").addClass("hide");
				newRow.find("img[id='img-sub']").attr("id",groupAppCode+index).attr("src",'softwarePicByCode.do?softwareCode='+softwareCode);
				newRow.find("p[id='appNameVersion-sub']").attr("id","appNameVersion"+index).html(content.appName);
			}
			newRow.appendTo("#"+proApps);
			newRow.show();
		});
		first.hide();
 	};
	var appShowAndHideSet = function(appShow,appHide,proApps){
		$("#"+appShow).show();
		$("#"+appHide).hide();
		$("#"+proApps).hide();
		$("#"+appShow).click(function(){
		   var proCode = $("#"+proApps).attr("value");
		   var proStatus = $("#"+proApps).attr("status");
		   initAppList(proCode,groupCode,proApps,proStatus);
		   $("#"+appShow).hide();
		   $("#"+appHide).show();
		   $("#"+proApps).show();
		});
		$("#"+appHide).click(function(){
		   $("#"+appShow).show();
		   $("#"+appHide).hide();
		   $("#"+proApps).hide();
		});
	};
	var initProjectTable = function(start,size){
		getSelectionSum();
		var firstTr = $("#row").clone(true);
		$("#table-body").find("div").remove();
		firstTr.appendTo("#table-body");
		var selectedID = $('#proSelect').find('.active').attr('id');
		var status = selectedStatus[selectedID];
		var url = selectedURL[selectedID+"-"+roleCode];
		jQuery.ajax({ 
			url: url,
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:setData(start,size,status),
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				projectList = c.responseJSON.projectList;
				if(roleCode != Xfinity.Constant.ROLE_SUB_USER){
					sum = c.responseJSON.sum;
					initTurnPageBar(start,size);
				}
				addProjectRow(projectList);
			}},
			error:function(){
			}
		});
	};
	var modifyStatus = function(proCode,status){
		jQuery.ajax({ 
			url: "modifyProjectStatus.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:{projectCode:proCode,status:status},
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				Xfinity.message.alert("操作失败!原因:"+exception);
			}else{
				initProjectTable(start,Xfinity.Util.pageSize);
				Xfinity.message.popup("操作成功!");
			}},
			error:function(){
				Xfinity.message.alert("操作失败!");
			}
		});
	}
	var operation = function(newRow,status,proCode,index){
		if(status == Xfinity.Constant.PROJECT_STATUS["waitingForApprove"]){
					var approveYes = newRow.find("a[id='proApproveYes']").attr("id","proApproveYes"+index);
					approveYes.attr("value",proCode);
					approveYes.removeClass("hide");
					approveYes.click(function(){
						var newStatus = Xfinity.Constant.PROJECT_STATUS["started"];
						var projectCode = $(this).attr("value");
						modifyStatus(projectCode,newStatus);
					});
					var approveNo = newRow.find("a[id='proApproveNo']").attr("id","proApproveNo"+index);
					approveNo.attr("value",proCode);
					approveNo.removeClass("hide");
					approveNo.click(function(){
						var newStatus = DEL;
						var projectCode = $(this).attr("value");
						modifyStatus(projectCode,newStatus);
					});
		}else if(status == Xfinity.Constant.PROJECT_STATUS["started"]){
					var terminated = newRow.find("a[id='proTerminated']").attr("id","proTerminated"+index);
					terminated.attr("value",proCode);
					terminated.removeClass("hide");
					terminated.click(function(){
						var newStatus = Xfinity.Constant.PROJECT_STATUS["terminated"];
						var projectCode = $(this).attr("value");
						modifyStatus(projectCode,newStatus);
					});
					var ended = newRow.find("a[id='proEnded']").attr("id","proEnded"+index);
					ended.attr("value",proCode);
					ended.removeClass("hide");
					ended.click(function(){
						var newStatus = Xfinity.Constant.PROJECT_STATUS["ended"];
						var projectCode = $(this).attr("value");
						modifyStatus(projectCode,newStatus);
					});
		}else if(status == Xfinity.Constant.PROJECT_STATUS["notStarted"]){
					var terminated = newRow.find("a[id='proTerminated']").attr("id","proTerminated"+index);
					terminated.attr("value",proCode);
					terminated.removeClass("hide");
					terminated.click(function(){
						var newStatus = Xfinity.Constant.PROJECT_STATUS["terminated"];
						var projectCode = $(this).attr("value");
						modifyStatus(projectCode,newStatus);
					});
					var ended = newRow.find("a[id='proEnded']").attr("id","proEnded"+index);
					ended.attr("value",proCode);
					ended.removeClass("hide");
					ended.click(function(){
						var newStatus = Xfinity.Constant.PROJECT_STATUS["ended"];
						var projectCode = $(this).attr("value");
						modifyStatus(projectCode,newStatus);
					});
		}else if(status == Xfinity.Constant.PROJECT_STATUS["ended"]){
					var restart = newRow.find("a[id='proRestart']").attr("id","proRestart"+index);
					restart.attr("value",proCode);
					restart.removeClass("hide");
					restart.click(function(){
						var newStatus = Xfinity.Constant.PROJECT_STATUS["started"];
						var projectCode = $(this).attr("value");
						modifyStatus(projectCode,newStatus);
					});
				}else if(status == Xfinity.Constant.PROJECT_STATUS["terminated"]){
					var restart = newRow.find("a[id='proRestart']").attr("id","proRestart"+index);
					restart.attr("value",proCode);
					restart.removeClass("hide");
					restart.click(function(){
						var newStatus = Xfinity.Constant.PROJECT_STATUS["started"];
						var projectCode = $(this).attr("value");
						modifyStatus(projectCode,newStatus);
					});
			}
	}
	var addProjectRow = function(projectList){
		var firstTr = $("#row");
		$.each( projectList, function(index, content){
			var proCode = content.proCode;
			var proName = content.name;
			var status = content.status;
			
			groupCode = content.groupCode;
			var newRow = firstTr.clone(true).attr("id", content.proCode+index);
			newRow.find("a[id='modify-link']").attr("onclick", "javascript:detailProject('"+proCode+"','"+proName+"','"+groupCode+"')");
			newRow.find("span[id='name']").attr("id","name"+index).html(proName);
			newRow.find("span[id='managerName']").attr("id","managerName"+index).html(content.managerName);
			newRow.find("div[id='description']").attr("id","description"+index).html(content.description);
			newRow.find("a[id='appShow']").attr("id","appShow"+index);
			newRow.find("a[id='appHide']").attr("id","appHide"+index);
			newRow.find("div[id='proApps']").attr("id","proApps"+index).attr("value",proCode).attr("status",status);
			//ROLETODO
			if(roleCode == Xfinity.Constant.ROLE_GROUP_ADMIN){
				operation(newRow,status,proCode,index);
			}
			var statusE = newRow.find("i[id='statusIco']");
			var statusText = newRow.find("span[id='statusText']");
			
			var newClass = '';
			var tooltipMessage = statusTooltip[status];
			statusE.attr("title", tooltipMessage);
			var newClass = statusIcon[status];
      	    statusE.removeClass().addClass(newClass);
      	    statusText.html(tooltipMessage);
			if(content.startDate){
			 	newRow.find("span[id='startDate']").attr("id","start"+index).html(content.startDate.substring(0,10));
			}
			var endDate = "不限";
			if(content.endDate){
				endDate = content.endDate.substring(0,10);
			}
			newRow.find("span[id='endDate']").attr("id","endDate"+index).html(endDate);
			newRow.appendTo("#table-body");
			newRow.show();
			appShowAndHideSet("appShow"+index,"appHide"+index,"proApps"+index);
		});
		firstTr.hide();
	};
	
	
	var setSelectionSum = function(projectSelectionSum){
		$("#includeMeSum").html(projectSelectionSum.includeMeSum);
		$("#approvalSum").html(projectSelectionSum.approvalSum);
		$("#cancelledSum").html(projectSelectionSum.cancelledSum);
		$("#endedSum").html(projectSelectionSum.endedSum);
		$("#allSum").html(projectSelectionSum.allSum);
	};
	var getSelectionSum = function(){
		jQuery.ajax({ 
			url: "projectSelectionSum.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				var projectSelectionSumInfo = c.responseJSON.projectSelectionSumInfo;
				setSelectionSum(projectSelectionSumInfo);
			}},
			error:function(){
			}
		});
	};
	var initTurnPageBar = function(start,size){
			$.turnPageBar.init({
			reload:initProjectTable,
			sum:sum,
			fresh:true,
			start:start+1,
			size:size
		});
	};
//2 running body
$(function(){
	//2.1 variables definition
	
	//2.2 page effect
	$("#row").hide();
	$("#app").hide();
	if(roleCode == Xfinity.Constant.ROLE_SUB_USER){
		$("#turnPage").addClass("hide");
		$("#all").addClass("hide");
		$("#includeMeOrAll").html("全部")
	}
	Xfinity.Util.showTooltip();
	initProjectTable(0,Xfinity.Util.pageSize);
	//2.3 click event
	$("#refreshTable").click(function(){
		initProjectTable(0,$.turnPageBar.param.size);
	});
	$("#addProject").click(function(){
		Xfinity.Util.post('jsp/myXfinity/myProject/addProject.jsp');
		});
	$("#includeMe").click(function(){
		$('#proSelect').find('.active').removeClass('active');
		$("#includeMe").addClass('active');
		initProjectTable(0,Xfinity.Util.pageSize);
	});
	$("#approval").click(function(){
		$('#proSelect').find('.active').removeClass('active');
		$("#approval").addClass('active');
		initProjectTable(0,Xfinity.Util.pageSize);
	});
	$("#cancelled").click(function(){
		$('#proSelect').find('.active').removeClass('active');
		$("#cancelled").addClass('active');
		initProjectTable(0,Xfinity.Util.pageSize);
	});
	$("#ended").click(function(){
		$('#proSelect').find('.active').removeClass('active');
		$("#ended").addClass('active');
		initProjectTable(0,Xfinity.Util.pageSize);
	});
	$("#all").click(function(){
		$('#proSelect').find('.active').removeClass('active');
		$("#all").addClass('active');
		initProjectTable(0,Xfinity.Util.pageSize);
	});
	
})