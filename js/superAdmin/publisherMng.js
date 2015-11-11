var start=0;
var userList="";
var publisherList="";
var applicantList="";
var pageNum=1;
var newApplicantSum;
var newPublisherSum;
var applicantSum;
var publisherSum;

var setData = function(start,size){
	var data={
		start:start,
		size:size
	};
	return data;
};

var initApplicantPageBar = function(start,size){
	$.turnPageBar.init({
		reload:initApplicantTable,
		sum:applicantSum,
		fresh:true,
		start:start+1,
		size:size
	});
};

var initPublisherPageBar = function(start,size){
	$.turnPageBar.init({
		reload:initPublisherTable,
		sum:publisherSum,
		fresh:true,
		start:start+1,
		size:size
	});
};

var initApplicantTable = function(start,size){
	var firstRow = $("#applicant-row");
	$("#applicat-table-body").find("tr").remove();
	firstRow.appendTo("#applicat-table-body");
	jQuery.ajax({ 
		url: "listApplicantInfo.action",
		contentType: "application/x-www-form-urlencoded; charset=utf-8",
		async:true,
		data:setData(start,size),
		success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				applicantList = c.responseJSON.publisherMngList;
				applicantSum = c.responseJSON.totalSize;
				if (applicantSum == 0) {
					$("#pageBarTool").hide();
					$("#applicant").html("未有用户申请成为资源提供商").css("text-align","center");
				}else {
					initApplicantPageBar(start,size);
					addApplicantInfoRow(applicantList);
					$("#pageBarTool").show();
				}
		}},
		error:function(){
			
		}
	});
};

var initPublisherTable = function(start,size) {
	var firstRow = $("#publisher-row");
	$("#publisher-table-body").find("tr").remove();
	firstRow.appendTo("#publisher-table-body");
	jQuery.ajax({ 
		url: "listPublisherInfo.action",
		contentType: "application/x-www-form-urlencoded; charset=utf-8",
		async:true,
		data:setData(start,size),
		success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				publisherList = c.responseJSON.publisherMngList;
				publisherSum = c.responseJSON.totalSize;
				if (publisherSum == 0) {
					$("#pageBarTool").hide();
					$("#publisher").html("还未有资源提供商").css("text-align","center");
				}
				initPublisherPageBar(start,size);
				addPublisherInfoRow(publisherList);
				$("#pageBarTool").show();
		}},
		error:function(){
			
		}
	});
};

var addApplicantInfoRow = function(list) {
	var firstRow = $("#applicant-row");
	$.each( list, function(index, content){
		var newRow = firstRow.clone(true).attr("id", content.userInfo.userCode);
		var userName = content.userInfo.name;
		var realName = content.userInfo.realName;
		var group = content.userInfo.groupName;
		var email = content.userInfo.email;
		newRow.find("span[id='name']").attr("id","name"+index).html(userName);
		newRow.find("span[id='realName']").attr("id","realName"+index).html(realName);
		newRow.find("span[id='group']").attr("id","group"+index).html(group);
		newRow.find("span[id='email']").attr("id","email"+index).html(email);
		
		var message = content.publisherInfo.resource;
		var date = content.publisherInfo.createDate;
		var publisherCode = content.publisherInfo.publisherCode;
		newRow.find("td[id='message']").attr("id","message"+index).html(message);
		newRow.find("td[id='date']").attr("id","date"+index).html(date.replace("T"," "));
		newRow.find("button[id='approve']").attr("id","approve"+index).attr("onclick", "javascript:approve('"+publisherCode+"')");
		newRow.find("button[id='reject']").attr("id","reject"+index).attr("onclick", "javascript:reject('"+publisherCode+"')");
		newRow.appendTo("#applicat-table-body");
		newRow.show();
	});
	firstRow.hide();
};

var addPublisherInfoRow = function(list) {
	var firstRow = $("#publisher-row");
	$.each( list, function(index, content){
		var newRow = firstRow.clone(true).attr("id", content.userInfo.userCode);
		var userName = content.userInfo.name;
		var realName = content.userInfo.realName;
		var group = content.userInfo.groupName;
		var email = content.userInfo.email;
		newRow.find("span[id='publisher-name']").attr("id","publisher-name"+index).html(userName);
		newRow.find("span[id='publisher-realName']").attr("id","publisher-realName"+index).html(realName);
		newRow.find("span[id='publisher-group']").attr("id","publisher-group"+index).html(group);
		newRow.find("span[id='publisher-email']").attr("id","publisher-email"+index).html(email);
		
		var resource = content.publisherInfo.resource;
		var applydate = content.publisherInfo.createDate;
		var authdate = content.publisherInfo.authDate;
		newRow.find("td[id='resourceInfo']").attr("id","resourceInfo"+index).html(resource);
		newRow.find("td[id='applyDate']").attr("id","applyDate"+index).html(applydate.replace("T"," "));
		if(authdate){
			authdate = authdate.replace("T"," ");
		}else{
			authdate = "不限";
		}
		newRow.find("td[id='authDate']").attr("id","authDate"+index).html(authdate);
		newRow.appendTo("#publisher-table-body");
		newRow.show();
	});
	firstRow.hide();
};

var approve = function(publisherCode) {
	jQuery.ajax({ 
		url: "approveBeingPublisher.action",
		contentType: "application/x-www-form-urlencoded; charset=utf-8",
		async:true,
		data:{publisherCode:publisherCode},
		success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				location.reload(true);
		}},
		error:function(){
			
		}
	});
};

var reject = function(publisherCode) {
	jQuery.ajax({ 
		url: "rejectBeingPublisher.action",
		contentType: "application/x-www-form-urlencoded; charset=utf-8",
		async:true,
		data:{publisherCode:publisherCode},
		success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				location.reload(true);
		}},
		error:function(){
			
		}
	});
};

var newApplicant = function() {
	jQuery.ajax({ 
		url: "countNewApplicant.action",
		contentType: "application/x-www-form-urlencoded; charset=utf-8",
		async:true,
		success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				newApplicantSum = c.responseJSON.newApplicantSum;
				if(newApplicantSum > 0) {
					$("#newApplicant").html(newApplicantSum);
				}
		}},
		error:function(){
			
		}
	});
};

var newPublisher = function() {
	jQuery.ajax({ 
		url: "countNewPublisher.action",
		contentType: "application/x-www-form-urlencoded; charset=utf-8",
		async:true,
		success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				newPublisherSum = c.responseJSON.newPublisherSum;
				if(newPublisherSum > 0) {
					$("#newPublisher").html(newPublisherSum);
				}
		}},
		error:function(){
			
		}
	});
};

$(function(){
	$("#applicant").show();
	$("#publisher").hide();
//	$("#applicant").hide();
//	$("#publisher").show();
	$("#applicant-row,#publisher-row").hide();
	Xfinity.Util.showTooltip();
	$("#applyTool").click(function(){
		$(this).addClass('active');
		$("#publisherTool").removeClass('active');
		$("#applicant").show();
		$("#publisher").hide();
		initApplicantTable(start,pageNum);
	});
	$("#publisherTool").click(function(){
		$(this).addClass('active');
		$("#applyTool").removeClass('active');
		$("#applicant").hide();
		$("#publisher").show();
		initPublisherTable(start,pageNum);
	});
	newApplicant();
	newPublisher();
	initApplicantTable(start,pageNum);
//	initPublisherTable(start,pageNum);
});