var priceList = new Array();
var appDetail = function(appCode) {
//		Xfinity.Util.post('jsp/myXfinity/resourceMgm/appDetail.jsp', {appCode:appCode});
	};
var setAppPriceList = function(coreSelect,priceList) {
	var select = coreSelect.get(0);
	var coreList = [];
	$.each(priceList, function(index, content) {
				var coreNum = content.coreNum;
				var tag = 0;
				$.each(coreList, function(index, value) {
							if (coreNum == value) {
								tag = 1;
								return false;
							}
						});
				if (tag == 1) {
					return true;
				}
				select.options.add(new Option(content.coreNum + "核",
						content.coreNum));
				coreList.push(content.coreNum)
			});
};
var showPrice = function(ind) {
	var coreNum = $("#"+ind).val();
	var prelist = priceList[ind];
	var monthBtn = $("#monthBtn-"+ind);
	$.each(prelist, function(index, content) {
					var p = 0;
					if (coreNum == content.coreNum) {
						if ( monthBtn.hasClass("btn-success")) {
							p = content.monthPrice;
						} else {
							p = content.coreHourPrice;
						}
						$("#price-"+ind).html(p.toFixed(2));
						return false;
					}
					
				});
};
var addListRow = function(list){
		var row1 = $("#row1").clone(true);
		var row2 = $("#row2").clone(true);
		$("#list-table-body").find("tr").remove();
		row1.appendTo("#list-table-body");
		row2.appendTo("#list-table-body");
		$.each( list, function(index, content){
			var appInfo = content.appInfo;
			var appCode = appInfo.appCode;
			var clusterName = appInfo.clusterCode+","+appInfo.clusterInfo.personalStorage;
			var endDate = appInfo.endDate;
			var newRow1 = row1.clone(true).attr("id", "row1"+index).removeClass("hide");
			newRow1.find("input[id='listCheckbox']").attr("id",appCode+"-"+index).attr("name","listCheckbox");
			if(endDate){
				endDate = endDate.substring(0,10);
			}else{
				endDate = "不限";
			}
			newRow1.find("span[id='endDate']").attr("id","endDate-"+index).html(endDate);
			newRow1.find("span[id='publishGroupName']").attr("id","publishGroupName"+index).html(appInfo.publishGroupName);
			newRow1.find("span[id='clusterName']").attr("id","clusterName-"+index).attr("name",clusterName).html(appInfo.clusterName).attr("onclick", "javascript:clusterDetail('"+appInfo.clusterCode+"')");

			var statusE = newRow1.find("span[id='status']");
			var status = appInfo.status;
			var statsStr = '';
			if(status == 1){
				statsStr = '<font color="green">售卖中</font>';
			}else if(status == 2){
				statsStr = '<font color="red">已下架</font>';
			}else if(status == 3){
				statsStr = '<font color="black">待审批</font>';
			}else if(status == 4){
				statsStr = '<font color="yellow">待发布</font>';
			}
			statusE.html(statsStr);
			newRow1.appendTo("#list-table-body");
			
			var softwareCode = appInfo.softwareCode;
			var newRow2 = row2.clone(true).attr("id", "row2"+index).removeClass("hide");
			newRow2.find("img[id='softwareImg']").attr("id","softwareImg"+index).attr("src",'softwarePicByCode.do?softwareCode='+softwareCode)
				.attr("onclick", "javascript:appDetail('"+appCode+"')");
			newRow2.find("p[id='appName']").attr("id","appName-"+index).html(appInfo.appName).attr("onclick", "javascript:appDetail('"+appCode+"')").attr("name",content.listCode);
			newRow2.find("span[id='softwareOutline']").attr("id","softwareOutline-"+index).html(appInfo.outline);
			
           
			var payTypeM = newRow2.find("button[id='monthBtn']").attr("id","monthBtn-"+index).attr("name",index);
            var payTypeC = newRow2.find("button[id='coreHourBtn']").attr("id","coreHourBtn-"+index).attr("name",index);
            var payType = content.payType;
            payTypeM.removeClass("btn-success");
            payTypeC.removeClass("btn-success");
            if(payType == 1){
            	payTypeM.addClass("btn-success");
            }else if(payType == 2){
            	payTypeC.addClass("btn-success");
            }
			payTypeM.click(function(){
				payTypeM.removeClass("btn-success");
            	payTypeC.removeClass("btn-success");
            	payTypeM.addClass("btn-success");
            	var ind = $(this).attr("name");
            	showPrice(ind);
			});
			payTypeC.click(function(){
				payTypeM.removeClass("btn-success");
            	payTypeC.removeClass("btn-success");
            	payTypeC.addClass("btn-success");
            	var ind = $(this).attr("name");
            	showPrice(ind);
			});
			
			priceList[index] = content.priceList;
			var select = newRow2.find("select[id='coreSelect']").attr("id",index);
			newRow2.find("span[id='price']").attr("id","price-"+index);
			select.change(function() {
				var ind = $(this).attr('id');
				showPrice(ind);
			});
			setAppPriceList(select,priceList[index]);
			
			newRow2.find("span[id='fee']").attr("id","fee-"+index).html(content.fee.toFixed(2));
			newRow2.find("span[id='soldNum']").attr("id","soldNum-"+index).html(appInfo.soldNum);
			newRow2.find("span[id='sellNum']").attr("id","sellNum-"+index).html(appInfo.sellNum);
			
			newRow2.appendTo("#list-table-body");
			if(content.coreNum > -1){
				select.val(content.coreNum);
			}
			showPrice(index);
			
		});
};
var initListTable = function(){
	jQuery.ajax({
				url : "listUserAllListInfo.action",
				contentType : "application/x-www-form-urlencoded; charset=utf-8",
				async : false,
				success : function(a, b, c) {
					var exception = c.responseJSON.exception;
					if (exception) {
					} else {
						var listInfoList = c.responseJSON.listInfoList;
						addListRow(listInfoList);
					}
				},
				error : function() {
				}
			});
}

var getListInfo = function(){
	var items = $('[name = "listCheckbox"]:checkbox:checked');
		var infoList = "";
 		$.each( items, function(index, content){
 			var id = content.id;
 			var len = id.indexOf("-");
 			var appCode = id.substring(0,len);
 			var index = id.substring(len+1);
 			
 			var payType = $("#monthBtn-"+index).hasClass("btn-success")?1:2;
 			var coreNum = $("#"+index).val();
 			var price = $("#price-"+index).text();
 			var clusterCodeAndStorage = $("#clusterName-"+index).attr("name");
 			var endDate = $("#endDate-"+index).text();
 			var listCode = $("#appName-"+index).attr("name");
 			var fee = $("#fee-"+index).text();
 			var info = appCode+","+payType+","+coreNum+","+price+","+clusterCodeAndStorage+","+endDate+","+listCode+","+fee;
 			if(infoList){
 				infoList +=";"
 			}
 			infoList += info
 		});
 		return infoList;
};
var submitList = function(){
	var infoList = getListInfo();
	if(!infoList){
		Xfinity.message.popup("未选择任何应用，不能提交订单！");
		return false;
	}
	jQuery.ajax({
				url : "submitList.action",
				data:{infoList:infoList},
				contentType : "application/x-www-form-urlencoded; charset=utf-8",
				type:"POST",
				success : function(a, b, c) {
					var exception = c.responseJSON.exception;
					if (exception) {
					} else {
						var listInfoList = c.responseJSON.listInfoList;
						initListTable();
						Xfinity.message.popup("订单提交成功！");
					}
				},
				error : function() {
				}
			});
}
var getListCodes = function(){
	var items = $('[name = "listCheckbox"]:checkbox:checked');
		var listCodes = "";
 		$.each( items, function(index, content){
 			var id = content.id;
 			var len = id.indexOf("-");
 			var index = id.substring(len+1);
 			var listCode = $("#appName-"+index).attr("name");
 			if(listCodes){
 				listCodes +=";"
 			}
 			listCodes += listCode;
 		});
 		return listCodes;
};
var deleteList = function(){
	var listCodes = getListCodes();
	if(!listCodes){
		Xfinity.message.popup("未选择任何应用！");
		return false;
	}
	jQuery.ajax({
				url : "deleteList.action",
				data:{listCodes:listCodes},
				contentType : "application/x-www-form-urlencoded; charset=utf-8",
				async : false,
				success : function(a, b, c) {
					var exception = c.responseJSON.exception;
					if (exception) {
					} else {
						initListTable();
						Xfinity.message.popup("订单成功取消！");
						
					}
				},
				error : function() {
				}
			});
}
$(function() {
	initListTable();
	$("#allSelectCheckbox").click(function() {
	 	var checkbox =$("[name='listCheckbox']");
		if($("#allSelectCheckbox").is(':checked')){
			checkbox.prop("checked",true);
		}else{
			checkbox.prop("checked",false);
		}
	 });
	 $("#submitList").click(function(){
	 	submitList();
	 });
	 $("#cancelList").click(function(){
	    deleteList();
	 });
});