//1 function
var sum = 0;
var start = 0;
var size = 5;
var FIRST_TIME = true;
var LAST_STATUS = -1;
var STATUS = 0;

var setActive = function(_this){
		$('#purchasedApp').find('.active').removeClass('active');
		$(_this).addClass('active');
		switch($(_this).attr("id")){
			case "all":STATUS=0;break;
			case "ava":STATUS=1;break;
			case "unava":STATUS=2;break;
			case "notEff":STATUS=3;break;
		}
	};
var setNumber = function(allNum,avaNum,unavaNum,notEffNum){
		$('#allNum').html(allNum);
		$('#avaNum').html(avaNum);
		$('#unavaNum').html(unavaNum);
		$('#notEffNum').html(notEffNum);
	};
var getNumber = function(){
		jQuery.ajax({ 
			url: "purchasedAppNum.action",
			async:false,
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				var allNum = c.responseJSON.allNum;
				var avaNum = c.responseJSON.avaNum;
				var unavaNum = c.responseJSON.unavaNum;
				var notEffNum = c.responseJSON.notEffNum;
				setNumber(allNum,avaNum,unavaNum,notEffNum);
			}},
			error:function(){
			}
		});
	};
var clusterDetail = function(clusterCode) {
		Xfinity.Util.post('jsp/myXfinity/resourceMgm/clusterDetail.jsp', {clusterCode:clusterCode});
	};
var appDetail = function(appCode) {
//		Xfinity.Util.post('jsp/myXfinity/resourceMgm/appDetail.jsp', {appCode:appCode});
	};

var payType = {
	"1":"包月",
	"2":"机时"
};
var addRow = function(groupAppInfoList){
		var row1 = $("#row1").clone(true);
		var row2 = $("#row2").clone(true);
		$("#table-body").find("tr").remove();
		row1.appendTo("#table-body");
		row2.appendTo("#table-body");
		$.each( groupAppInfoList, function(index, content){
			var appInfo = content.appInfo;
			var newRow1 = row1.clone(true).attr("id", "row1"+index).removeClass("hide");
			newRow1.find("span[id='createDate']").attr("id","createDate-"+index).html(content.createDate.replace("T"," "));
			newRow1.find("a[id='clusterName']").attr("id","clusterName"+index).html(content.clusterName).attr("onclick", "javascript:clusterDetail('"+content.clusterCode+"')");
			newRow1.find("span[id='groupName']").attr("id","groupName"+index).html(appInfo.publishGroupName);

			var statusE = newRow1.find("span[id='appStatus']").attr("id","appStatus-"+index);
			var status = content.status;
			var statsStr = '';
			if(status == 1){
				statsStr = '<font color="green">可用</font>';
			}else if(status == 2){
				statsStr = '<font color="grey">不可用</font>';
			}else if(status == 3){
				statsStr = '<font color="red">未生效</font>';
			}
			statusE.html(statsStr);
			newRow1.appendTo("#table-body");
			
			var softwareCode = appInfo.softwareCode;
			var appCode = appInfo.appCode;
			var newRow2 = row2.clone(true).attr("id", "row2"+index).removeClass("hide");
			newRow2.find("img[id='appImg']").attr("id","appImg-"+index).attr("src",'softwarePicByCode.do?softwareCode='+softwareCode).attr("onclick", "javascript:appDetail('"+appCode+"')");
			newRow2.find("p[id='appName']").attr("id","appName-"+index).html(content.appName).attr("onclick", "javascript:appDetail('"+appCode+"')");
			newRow2.find("span[id='outline']").attr("id","outline-"+index).html(appInfo.outline).attr("onclick", "javascript:appDetail('"+appCode+"')");;
			newRow2.find("span[id='payType']").attr("id","payType-"+index).html(payType[content.payType]);
			var endDate = content.endDate;
			if(endDate){
				endDate = endDate.substring(0,10);
			}
			newRow2.find("span[id='endDate']").attr("id","endDate-"+index).html(endDate);
			newRow2.find("span[id='coreNum']").attr("id","coreNum-"+index).html(content.coreNum);
			newRow2.find("span[id='fee']").attr("id","fee-"+index).html(content.fee.toFixed(2));
			newRow2.find("span[id='payTypePrice']").attr("id","payTypePrice-"+index).html(payType[content.payType]);
			newRow2.find("span[id='price']").attr("id","price-"+index).html(content.price.toFixed(2));
			newRow2.find("span[id='delay']").attr("id","delay-"+index);
			newRow2.find("span[id='modifyCoreNum']").attr("id","modifyCoreNum-"+index);
			newRow2.find("span[id='modifyStorageSize']").attr("id","modifyStorageSize-"+index);
			newRow2.appendTo("#table-body");
			$("#delay"+index).click(function(){
				//TODO
			});
			$("#modifyCoreNum"+index).click(function(){
				//TODO
			});
			$("#modifyStorageSize"+index).click(function(){
				//TODO
			});
			
		});
};
var initTable = function(start,size){
	jQuery.ajax({ 
		url: "listGroupAppByStatus.action",
		contentType: "application/x-www-form-urlencoded; charset=utf-8",
		data:{start:start,size:size,status:STATUS},
		success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				var groupAppInfoList = c.responseJSON.groupAppInfoList;
				sum = c.responseJSON.sum;
				addRow(groupAppInfoList);
				if(LAST_STATUS != STATUS){
					initTurnPageBar(start,size);
				}
				LAST_STATUS = STATUS;
		}},
		error:function(){
		}
	});
};
var initTurnPageBar = function(start,size){
		$.turnPageBar.init({
			reload:initTable,
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
	initTable(start,size);
	getNumber();
	$("li[name='purchasedApp']").click(function(){
		setActive(this);
		initTable(start,size);
		getNumber();
	});
	
})