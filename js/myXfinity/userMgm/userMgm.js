	var start=0;
	var userList="";
	var pageNum=10000;
//1 function
	var detailUser = function(userCode,realName) {
		Xfinity.Util.post('jsp/myXfinity/userMgm/userDetail.jsp', {userCode:userCode,realName:realName});
	};	
	var statusTooltip = {
	    "1": "用户可以正常使用Xfinity",
	    "2": "用户已被冻结，不能正常使用Xfinity,管理员修改状态后可用",
	    "3": "用户已被注销，不能正常使用Xfinity,管理员重新启用后可用"
	};
	var statusText = {
	    "1": "可用",
	    "2": "冻结",
	    "3": "注销"
	};
	var statusIcon = {
	    "1": "fa-fw -o-notch -upload fa fa-2x fa-clock-o fa-spin text-success",
	    "2": "fa-fw -o-notch -upload fa fa-2x fa-minus-circle text-warning",
	    "3": "fa-fw -o-notch -upload fa fa-2x fa-warning text-danger"
	};
	var priorityLevel = {
		"H":"高",
		"M":"中",
		"L":"低"
	};
	var initUserTable = function(start,size){
		jQuery.ajax({ 
			url: "userInfoList.action",
			async:false,
			data:{start:start,size:size},
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				userList = c.responseJSON.userList;
//				sum = c.responseJSON.sum;
				addUserRow(userList);
			}},
			error:function(){
			}
		});
	};
	var addUserRow = function(userList){
		var firstTr = $("#row").clone(true);
		$("#table-body").find("tr").remove();
		firstTr.appendTo("#table-body");
		
		$.each( userList, function(index, content){
			var newRow = firstTr.clone(true).attr("id", content.userCode);
			newRow.find("a[id='modify-link']").attr("onclick", "javascript:detailUser('"+content.userCode+"','"+content.realName+"')");
			newRow.find("span[id='name']").attr("id","name"+index).html(content.name);
			newRow.find("span[id='realName']").attr("id","realName"+index).html(content.realName);
			newRow.find("span[id='email']").attr("id","email"+index).html(content.email);
			
			var statusE = newRow.find("i[id='status']");
			var statusT = newRow.find("span[id='statusText']");
			var status = content.status;
			var newClass = statusIcon[status];
      	    statusE.removeClass().addClass(newClass);
			var tooltipMessage = statusTooltip[status];
			var statusHtml = statusText[status];
			statusE.attr("title", tooltipMessage);
			statusT.html(statusHtml);
			
			var priority = content.priority
			priority = priorityLevel[priority]
			newRow.find("span[id='priority']").attr("id","priority"+index).html(priority);
			var maxJobs = $.trim(content.maxJobs);
			if(maxJobs == ''){
				maxJobs = '不限';
			}
			newRow.find("span[id='maxJobs']").attr("id","maxJobs"+index).html(maxJobs);
			var maxSlots = $.trim(content.maxSlots);
			if(maxSlots == ''){
				maxSlots = '不限';
			}
			newRow.find("span[id='maxSlots']").attr("id","maxSlots"+index).html(maxSlots);
			var endDate = content.endDate;
			if(endDate){
				endDate = endDate.substring(0,10);
			}else{
				endDate = "不限";
			}
			newRow.find("td[id='endDate']").attr("id","endDate"+index).html(endDate);
			newRow.appendTo("#table-body");
			newRow.show();
		});
		firstTr.hide();
	};
//2 running body
$(function(){
	
	$("#row").hide();
	Xfinity.Util.showTooltip();
	initUserTable(start,pageNum);
	
	$("#refreshTable").click(function(){
		initUserTable(start,pageNum);
	});
	$("#addUser").click(function(){
		Xfinity.Util.post('jsp/myXfinity/userMgm/addUser.jsp');
	});
})