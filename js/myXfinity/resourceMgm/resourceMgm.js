	var sum=0;
	var start=0;
	var status = 0;
	var charaLen = 30;
//1 function
	var clusterDetail = function(clusterCode) {
		Xfinity.Util.post('jsp/myXfinity/resourceMgm/clusterDetail.jsp', {clusterCode:clusterCode});
	};
	var softwareDetail = function(softwareCode) {
		Xfinity.Util.post('jsp/myXfinity/resourceMgm/softwareDetail.jsp', {softwareCode:softwareCode});
	};
	var appDetail = function(appCode) {
//		Xfinity.Util.post('jsp/myXfinity/resourceMgm/appDetail.jsp', {appCode:appCode});
	};

	
	var setActive = function(_this){
		$('#_status').find('.active').removeClass('active');
		$(_this).addClass('active');
		$(".table").removeClass("hide");
		$(".table").addClass("hide");
		var id = $(_this).attr("id");
		switch(id){
			case 'appLi':
				$("#appTable").removeClass('hide');
				initAppTable(0,Xfinity.Util.pageSize);
				break;
			case 'softwareLi':
				$("#softwareTable").removeClass('hide');
				initSoftwareTable(0,Xfinity.Util.pageSize);
				break;
			case 'clusterLi':
				$("#clusterTable").removeClass('hide');
				initClusterTable(0,Xfinity.Util.pageSize);
				break;
		}
		getNumber();
	};
	var setNumber = function(appNum,softwareNum,clusterNum){
		$('#appNum').html(appNum);
		$('#softwareNum').html(softwareNum);
		$('#clusterNum').html(clusterNum);
	};
	var getNumber = function(){
		jQuery.ajax({ 
			url: "publisherResourceNum.action",
			async:false,
			data:{status:0},
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				var appNum = c.responseJSON.appNum;
				var clusterNum = c.responseJSON.clusterNum;
				var softwareNum = c.responseJSON.softwareNum;
				setNumber(appNum,softwareNum,clusterNum);
			}},
			error:function(){
			}
		});
	};
	var addAppRow = function(appList){
		var row1 = $("#appRow1").clone(true);
		var row2 = $("#appRow2").clone(true);
		$("#app-table-body").find("tr").remove();
		row1.appendTo("#app-table-body");
		row2.appendTo("#app-table-body");
		$.each( appList, function(index, content){
			var newRow1 = row1.clone(true).attr("id", "appRow1"+index).removeClass("hide");
			newRow1.find("span[id='appCreateDate']").attr("id","appCreateDate-"+index).html(content.createDate.replace("T"," "));
			newRow1.find("a[id='appSoftwareName']").attr("id","appSoftwareName"+index).html(content.softwareName).attr("onclick", "javascript:softwareDetail('"+content.softwareCode+"')");
			newRow1.find("a[id='appclusterName']").attr("id","appClusterName"+index).html(content.clusterName).attr("onclick", "javascript:clusterDetail('"+content.clusterCode+"')");

			var statusE = newRow1.find("span[id='appStatus']");
			var status = content.status;
			var statsStr = '';
			var btnTextA = '修改';
			var btnTextB = '下架';
			if(status == 1){
				statsStr = '<font color="green">售卖中</font>';
			}else if(status == 2){
				statsStr = '<font color="red">已下架</font>';
				btnTextB = '上架';
			}else if(status == 3){
				statsStr = '<font color="black">待审批</font>';
				btnTextB = '取消';
			}else if(status == 4){
				statsStr = '<font color="yellow">待发布</font>';
				btnTextA = '发布';
				btnTextB = '取消';
			}
			statusE.html(statsStr);
			newRow1.appendTo("#app-table-body");
			
			var softwareCode = content.softwareCode;
			var appCode = content.appCode;
			var newRow2 = row2.clone(true).attr("id", "appRow2"+index).removeClass("hide");
			newRow2.find("img[id='appImg']").attr("id","appImg"+index).attr("src",'softwarePicByCode.do?softwareCode='+softwareCode).attr("onclick", "javascript:appDetail('"+appCode+"')");
			newRow2.find("span[id='appName']").attr("id","appName-"+index).html(content.appName).attr("onclick", "javascript:appDetail('"+appCode+"')");
			newRow2.find("span[id='appSoldNum']").attr("id","appSoldNum-"+index).html(content.soldNum);
			newRow2.find("span[id='appRemainNum']").attr("id","appRemainNum-"+index).html(content.sellNum - content.soldNum);
			
			var hourPriceMin = content.coreHourPriceMin.toFixed(2);
			var hourPriceMax = content.coreHourPriceMax.toFixed(2);
			var monthPriceMin = content.monthPriceMin.toFixed(2);
			var monthPriceMax = content.monthPriceMax.toFixed(2);
			var hourPrice = "";
			var monthPrice = ""; 
			if(hourPriceMax < 0){
				hourPrice = "未定价"
			}else if(hourPriceMax == hourPriceMin){
				hourPrice += hourPriceMax;
			}else {
				hourPrice += hourPriceMin+"~"+hourPriceMax;
			}
			if(monthPriceMax < 0){
				monthPrice = "未定价"
			}else if(monthPriceMax == monthPriceMin){
				monthPrice += monthPriceMax;
			}else{
				monthPrice += monthPriceMin+"~"+monthPriceMax;
			}
			newRow2.find("span[id='appCoreHourPrice']").attr("id","appCorehourPrice"+index).html(hourPrice);
			newRow2.find("span[id='appMonthPrice']").attr("id","hourPrice"+index).html(monthPrice);
			newRow2.find("a[id='modify']").attr("id","modify"+index).attr("value",appCode).attr("status",status);
			newRow2.find("a[id='off']").attr("id","off"+index).attr("value",appCode).attr("status",status);
			newRow2.find("span[id='modifySpan']").attr("id","modifySpan"+index).html(btnTextA);
			newRow2.find("span[id='offSpan']").attr("id","offSpan"+index).html(btnTextB);
			
			newRow2.appendTo("#app-table-body");
			$("#modify"+index).click(function(){
				appDetail(appCode);
			});
			$("#off"+index).click(function(){
				var status = $(this).attr('status');
				var appCode = $(this).attr("value");
				btnBclickSelect(status,appCode);
			});
			
		});
	};
	var initAppTable = function(start,size){
		jQuery.ajax({ 
			url: "listPublisherApp.action",
			data:{start:start,size:size},
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
				}else{
					var appList = c.responseJSON.appList;
					sum = c.responseJSON.sum;
					addAppRow(appList);
					initAppTurnPageBar(start,size);
				}},
			error:function(){
			}
		});
	};
	var initAppTurnPageBar = function(start,size){
		$.turnPageBar.init({
			reload:initAppTable,
			sum:sum,
			fresh:true,
			size:size,
			start:start+1 
		});
	};
	var initSoftwareTurnPageBar = function(start,size){
		$.turnPageBar.init({
			reload:initSoftwareTable,
			sum:sum,
			fresh:true,
			size:size,
			start:start+1 
		});
	};
	var addSoftwareRow = function(appList){
		var row1 = $("#softwareRow1").clone(true);
		var row2 = $("#softwareRow2").clone(true);
		$("#software-table-body").find("tr").remove();
		row1.appendTo("#software-table-body");
		row2.appendTo("#software-table-body");
		$.each( appList, function(index, content){
			var newRow1 = row1.clone(true).attr("id", "softwareRow1"+index).removeClass("hide");
			newRow1.find("span[id='softwareCreateDate']").attr("id","softwareCreateDate-"+index).html(content.createDate.replace("T"," "));
			var statusE = newRow1.find("span[id='softwareStatus']");
			var status = content.status;
			var statsStr = '';
			var btnTextA = '修改';
			var btnTextB = '';
			if(status == 1){
				statsStr = '<font color="red">待审核</font>';
				btnTextB = '取消';
			}else if(status == 2){
				statsStr = '<font color="green">可用</font>';
				btnTextB = '不可用';
			}else if(status == 3){
				statsStr = '<font color="black">不可用</font>';
				btnTextB = '可用';
			}
			statusE.html(statsStr);
			newRow1.appendTo("#software-table-body");
			
			var softwareCode = content.softwareCode;
			var outline = content.outline;
			if(outline && outline.length > charaLen){
				outline = outline.substring(0,charaLen/2)+"<br>" + outline.substring(charaLen/2,charaLen)+"……";
			}
			var newRow2 = row2.clone(true).attr("id", "appRow2"+index).removeClass("hide");
			newRow2.find("img[id='softwareImg']").attr("id","softwareImg"+index).attr("src",'softwarePicByCode.do?softwareCode='+softwareCode).attr("onclick", "javascript:softwareDetail('"+softwareCode+"')");
			newRow2.find("span[id='softwareName']").attr("id","softwareName-"+index).html(content.name).attr("onclick", "javascript:softwareDetail('"+softwareCode+"')");
			newRow2.find("span[id='softwareOutline']").attr("id","softwareOutline-"+index).html(outline);
			
		
			newRow2.find("span[id='softwareCoreHourPrice']").attr("id","softwareCorehourPrice"+index).html(content.coreHourPrice.toFixed(2));
			newRow2.find("span[id='softwareMonthPrice']").attr("id","softwareMonthPrice"+index).html(content.monthPrice.toFixed(2));
			newRow2.find("a[id='softwareModify']").attr("id","softwareModify"+index).attr("value",softwareCode).attr("status",status);
			newRow2.find("a[id='softwareOff']").attr("id","softwareOff"+index).attr("value",softwareCode).attr("status",status);
			newRow2.find("span[id='softwareModifySpan']").attr("id","softwareModifySpan"+index).html(btnTextA);
			newRow2.find("span[id='softwareOffSpan']").attr("id","softwareOffSpan"+index).html(btnTextB);
			
			newRow2.appendTo("#software-table-body");
			$("#softwareModify"+index).click(function(){
				softwareDetail(softwareCode);
			});
			$("#softwareOff"+index).click(function(){
				var status = $(this).attr('status');
				var softwareCode = $(this).attr("value");
//				btnBclickSelect(status,appCode);
			});
			
		});
	};
	var initSoftwareTable = function(start,size){
		jQuery.ajax({ 
			url: "listPublisherSoftware.action",
			data:{start:start,size:size},
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
				}else{
					var softwareList = c.responseJSON.softwareList;
					sum = c.responseJSON.sum;
					addSoftwareRow(softwareList);
					initSoftwareTurnPageBar(start,size);
				}},
			error:function(){
			}
		});
	};
	
	var initClusterTurnPageBar = function(start,size){
		$.turnPageBar.init({
			reload:initClusterTable,
			sum:sum,
			fresh:true,
			size:size,
			start:start+1 
		});
	};
	var addClusterRow = function(clusterList){
		var row1 = $("#clusterRow1").clone(true);
		var row2 = $("#clusterRow2").clone(true);
		$("#cluster-table-body").find("tr").remove();
		row1.appendTo("#cluster-table-body");
		row2.appendTo("#cluster-table-body");
		$.each( clusterList, function(index, content){
			var newRow1 = row1.clone(true).attr("id", "clusterRow1"+index).removeClass("hide");
			newRow1.find("span[id='clusterCreateDate']").attr("id","clusterCreateDate-"+index).html(content.createDate.replace("T"," "));
			var statusE = newRow1.find("span[id='clusterStatus']");
			var status = content.status;
			var statsStr = '';
			var btnTextA = '修改';
			var btnTextB = '';
			if(status == 1){
				statsStr = '<font color="green">可用</font>';
				btnTextB = '不可用';
			}else if(status == 2){
				statsStr = '<font color="red">不可用</font>';
				btnTextB = '可用';
			}else if(status == 3){
				statsStr = '<font color="black">待审核</font>';
				btnTextB = '取消';
			}else if(status == 4){
				statsStr = '<font color="">下架</font>';
				btnTextB = '上架';
			}
			statusE.html(statsStr);
			newRow1.appendTo("#cluster-table-body");
			
			var clusterCode = content.clusterCode;
			var des = content.description;
			if(des && des.length > charaLen){
				des = des.substring(0,charaLen/2)+"<br>" + des.substring(charaLen/2,charaLen)+"……";
			}
			var monthPrice = "";
			if(content.monthPriceMin == -1 && content.monthPriceMax == -1){
				monthPrice = "未定价";
			}else if(content.monthPriceMin == -1 || content.monthPriceMax == -1){
				monthPrice = (content.monthPriceMin + content.monthPriceMax + 1).toFixed(2);
			}else if(content.monthPriceMin == content.monthPriceMax){
				monthPrice = content.monthPriceMin.toFixed(2);
			}else{
				monthPrice = (content.monthPriceMin.toFixed(2) +"~" + content.monthPriceMax.toFixed(2));
			}
			var corHourPrice = "";
			if(content.coreHourPriceMin == -1 && content.coreHourPriceMax == -1){
				corHourPrice = "未定价";
			}else if(content.coreHourPriceMin == -1 || content.coreHourPriceMax == -1){
				corHourPrice = (content.coreHourPriceMin + content.coreHourPriceMax + 1).toFixed(2);
			}else if(content.coreHourPriceMin == content.coreHourPriceMax){
				corHourPrice = content.coreHourPriceMin.toFixed(2);
			}else{
				corHourPrice = (content.coreHourPriceMin.toFixed(2) +"~" + content.coreHourPriceMax.toFixed(2));
			}
			var newRow2 = row2.clone(true).attr("id", "appRow2"+index).removeClass("hide");
			newRow2.find("img[id='clusterImg']").attr("id","clusterImg"+index).attr("src",'clusterPicByCode.do?clusterCode='+clusterCode).attr("onclick", "javascript:clusterDetail('"+clusterCode+"')");
			newRow2.find("span[id='clusterName']").attr("id","clusterName-"+index).html(content.name).attr("onclick", "javascript:clusterDetail('"+clusterCode+"')");
			newRow2.find("span[id='clusterDescription']").attr("id","clusterOutline-"+index).html(des);
		
			newRow2.find("span[id='clusterCoreHourPrice']").attr("id","clusterCorehourPrice"+index).html(corHourPrice);
			newRow2.find("span[id='clusterMonthPrice']").attr("id","clusterMonthPrice"+index).html(monthPrice);
			newRow2.find("a[id='clusterModify']").attr("id","clusterModify"+index).attr("value",clusterCode).attr("status",status);
			newRow2.find("a[id='clusterOff']").attr("id","clusterOff"+index).attr("value",clusterCode).attr("status",status);
			newRow2.find("span[id='clusterModifySpan']").attr("id","clusterModifySpan"+index).html(btnTextA);
			newRow2.find("span[id='clusterOffSpan']").attr("id","clusterOffSpan"+index).html(btnTextB);
			
			newRow2.appendTo("#cluster-table-body");
			$("#clusterModify"+index).click(function(){
				clusterDetail(clusterCode);
			});
			$("#clusterOff"+index).click(function(){
				var status = $(this).attr('status');
				var clusterCode = $(this).attr("value");
			});
			
		});
	};
	var initClusterTable = function(start,size){
		jQuery.ajax({ 
			url: "listPublisherCluster.action",
			data:{start:start,size:size},
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
				}else{
					var clusterList = c.responseJSON.clusterlist;
					sum = c.responseJSON.sum;
					addClusterRow(clusterList);
					initClusterTurnPageBar(start,size);
				}},
			error:function(){
			}
		});
	};
$(function(){
//2 running body
	initAppTable(0,Xfinity.Util.pageSize);
	getNumber();
	$("#appLi").click(function(){
		setActive(this);
	});
	$("#softwareLi").click(function(){
		setActive(this);
	});
	$("#clusterLi").click(function(){
		setActive(this);
	});
})