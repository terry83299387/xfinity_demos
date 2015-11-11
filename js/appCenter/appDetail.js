var NO_PRICE_CN = "未定价";
var SOLD_OUT_CN = "售罄";
var appDetail = "";
var appPriceList = "";
var clusterCode = "";
var fee = 0;
var setHead = function(){
		$('#_head').find('.active').removeClass('active');
		$('#_appCenter').addClass("active");
	};
var setAppPic = function() {
	$("img[id='img']").attr("src",
			'softwarePicByCode.do?softwareCode=' + softwareCode);
};
var setDetailInfo = function(appDetail) {
	clusterCode = appDetail.clusterCode;
	var outline = appDetail.appName+"【"+appDetail.clusterName+"】";
	if(appDetail.outline && $.trim(appDetail.outline)){
		outline += $.trim(appDetail.outline);
	}
	$("#outline").html(outline);
	$("#description").html(appDetail.description);
	$("#appName").html(appDetail.name);
	var left = parseInt(appDetail.sellNum) - parseInt(appDetail.soldNum);
	var buyBefore = appDetail.buyBefore;
	var leftStr = SOLD_OUT_CN;
	if ((left == 0 && buyBefore != 1)) {
		$("#addToList").hide();
	} else if (left == 0 && buyBefore == 1) {
		$("#addToList").show();
	} else {
		leftStr = left;
	}
	$("#left").html(leftStr);
	var feeStr = appDetail.fee.toFixed(2);
	if(UserUtil.isSubUser()){
		$("#discountInfo").html(Xfinity.Constant.SUB_USER_CAN_NOT_BUY);
		fee = feeStr;
	}else if(buyBefore == 1) {
		feeStr = "<span style='text-decoration:line-through;'>" + feeStr + "</span>" + " 0.00";
		$("#discountInfo").html(Xfinity.Constant.GROUP_USER_PURCHASED);
		fee = 0;
	}else {
		fee = feeStr;
	}
	$("#fee").html(feeStr);
	//parameters set
	var clusterInfo = appDetail.clusterInfo;
	$("#clusterDes").html(clusterInfo.description);
	$("#clusterName").html(clusterInfo.name);
	$("#location").html(clusterInfo.city);
	$("#calculationPeak").html(clusterInfo.calculationPeak);
	$("#jobScheduleSys").html(clusterInfo.jobScheduleSys);
	$("#processor").html(clusterInfo.processor);
	$("#os").html(clusterInfo.os);
	$("#contractDeadline").html(clusterInfo.contractDeadline.substring(0, 10));
	$("#applicationArea").html(clusterInfo.applicationArea);
	$("#memorySize").html(clusterInfo.memorySize);
	$("#computeNodeDes").html(clusterInfo.computeNodeDes);
	$("#accessNodeDes").html(clusterInfo.accessNodeDes);
	$("#diskSize").html(clusterInfo.diskSize);
};

var setAppPriceList = function(priceList) {
	var select = $("#coresSelect").get(0);
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
var getDetailInfo = function() {
	jQuery.ajax({
				url : "appDetailByCode.action",
				contentType : "application/x-www-form-urlencoded; charset=utf-8",
				async : false,
				data : {
					appCode : appCode
				},
				success : function(a, b, c) {
					var exception = c.responseJSON.exception;
					if (exception) {
					} else {
						appDetail = c.responseJSON.appDetail;
						appPriceList = c.responseJSON.appPriceList;
						setDetailInfo(appDetail);
						setAppPriceList(appPriceList);
						showPrice();
					}
				},
				error : function() {
				}
			});
};
var showPrice = function() {
	var val = $('#coresSelect').val();
	$.each(appPriceList, function(index, content) {
				if (val == content.coreNum) {
					if ($("input[name=price]:checked").attr("id") == "month") {
						$("#monSpan").attr('value', content.coreNum)
								.text(content.monthPrice.toFixed(2));
					} else if ($("input[name=price]:checked").attr("id") == "hour") {
						$("#hourSpan").attr('value', content.coreNum)
								.text(content.coreHourPrice.toFixed(2));
					}
				}
			});
};
var getAppInfo = function() {
	//				var fee = $("#fee").text();
	var payType = $("input[name=price]:checked").attr("value");
	var price = 0;
	var startDate = new Date();
	var y = startDate.getFullYear();
	var m = startDate.getMonth() + 1;
	var d = startDate.getDate();
	var endDate = "2020-12-30";
	var coreNum = $("#coresSelect").val();
	var pay = fee;
	if ($("input[name=price]:checked").attr("id") == "month") {
		price = $("#monSpan").text();
		if ($("input[name=active]:checked").attr("id") == "nextMonth") {
			y = (m == 12) ? (y + 1) : y;
			m = (m == 12) ? 1 : m + 1;
			d = 1;
		}
	} else {
		price = $("#hourSpan").text();
	}
	startDate = y + "-" + m + "-" + d;
	var appInfo = {
		configCode : configCode,
		fee : fee,
		payType : payType,
		price : price,
		startDate : startDate,
		endDate : endDate,
		pay : pay,
		clusterCode : clusterCode,
		coreNum : coreNum
	}
	return appInfo;
};
var getAppDate = function(){
	var coreNum = $("#coresSelect").val();
	var payType = $("input[name='price']:checked").val();
	var data = {
		appCode:appCode,
		coreNum:coreNum,
		payType:payType
	};
	return data;
};
var collectResource = function(appCode){
		var data = {
			appCode:appCode
		};
		jQuery.ajax({ 
			url: "collectResource.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:data,
			async:true,
			type:"POST",
			success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					Xfinity.message.alert("收藏失败!原因:"+exception); 
				}else{
					Xfinity.message.popup("收藏成功!"); 
			}},
			error:function(){
			}
		});
	};
$(function() {
			$("#month_price").show();
			$("#hour_price").hide();
			$("#defineCore").hide();
			setHead();
			if(UserUtil.hasGroupAdminFunction()){
				Xfinity.Util.addRightBox();
			}
			if(UserUtil.isSubUser()){
				$("#addToList").addClass("disabled");
			}
			setAppPic();
			getDetailInfo();
			Xfinity.Util.showTooltip();
			$("input[name=price]").click(function() {
						switch ($("input[name=price]:checked").attr("id")) {
							case "month" :
								$("#price-month").show();
								$("#month_price").show();
								$("#hour_price").hide();
								break;
							case "hour" :
								$("#price-month").hide();
								$("#month_price").hide();
								$("#hour_price").show();
								break;
							default :
								break;
						}
						showPrice();
					});
			$('#coresSelect').change(function() {
						showPrice();
					});
			$("#description").show();
			$("#parameters").hide();
			$("#comments").hide();
			$("#desBtn").click(function() {
						$("#ul").find('.active').removeClass('active');
						$(this).addClass('active');
						$("#description").show();
						$("#parameters").hide();
						$("#comments").hide();
					});
			$("#paraBtn").click(function() {
						$("#ul").find('.active').removeClass('active');
						$(this).addClass('active');
						$("#description").hide();
						$("#parameters").show();
						$("#comments").hide();
					});
//			$("#commBtn").click(function() {
//						$("#ul").find('.active').removeClass('active');
//						$(this).addClass('active');
//						$("#description").hide();
//						$("#parameters").hide();
//						$("#comments").show();
//					});
			$("#buyApp").click(function() {
						if (!userInfo || userInfo == "null") {
							Xfinity.Util.post('login.jsp');
						}
						buyApp();
					});
			$("#addToList").click(function() {
					if (!userInfo || userInfo == "null") {
							Xfinity.Util.post('login.jsp');
							return false;
						}
					var data = getAppDate();
					addToList(data);	
			});
			$("#addToCollection").click(function() {
					if (!userInfo || userInfo == "null") {
							Xfinity.Util.post('login.jsp');
							return false;
						}
					collectResource(appCode);	
			});
		});