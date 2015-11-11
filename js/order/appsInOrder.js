
var groupAppList;

var listeners = new Array();
var addAppsLoaderListener = function(fun){
    listeners.push(fun);
}

var payTypeArray = {
    "1": "包月",
    "2": "按机时"
}; 

var listAppsInOrder = function(orderCode, appWell){

    jQuery.ajax({
        url: "listAppsInOrder.action",
        async: false,
        data: {
            orderCode : orderCode
        },
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        success: function(a, b, c){
            var exception = c.responseJSON.exception;
            if (exception) {
                Xfinity.message.alert("<b>提示：</b>获取列表失败!原因：" + exception);
            }
            else {
                groupAppList = c.responseJSON.groupAppList;
                addAppToOrderRow(groupAppList, appWell);
				
				for (f in listeners) {
                    listeners[f]();
                }
            }
        },
        error: function(){
            Xfinity.message.alert("<b>提示：</b>获取列表失败!原因：" + exception);
        }
    });
};

var listQueueInApp = function(appCode, queueDiv) {
	jQuery.ajax({
        url: "showQueueList.action",
        async: false,
        data: {
            appCode : appCode
        },
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        success: function(a, b, c){
            var exception = c.responseJSON.exception;
            if (exception) {
            }
            else {
                queueList = c.responseJSON.queueList;
				var queueStr = "";
               	for (i in queueList) {
					queueStr += queueList[i].name;
				}
				queueDiv.html(queueStr);
            }
        },
        error: function(){
            Xfinity.message.alert("<b>提示：</b>获取列表失败!原因：" + exception);
        }
    });
}

var addAppToOrderRow = function(groupAppList, appWell){
    var firstTr = $("#app").clone(true);
    $.each(groupAppList, function(index, content){
		var newRow = firstTr.clone(true);
        newRow.find("img[id='softwareImg']").attr("src",'softwarePicByCode.do?softwareCode='+content.app.softwareCode);
		newRow.find("div[id='appName']").html(content.app.name);
		newRow.find("span[id='payType']").html(payTypeArray[content.payType]);
		newRow.find("span[id='slots']").html(content.maxSlots);
		newRow.find("span[id='storage']").html(content.storageSize + 'GB');
		newRow.find("span[id='cluster']").html(content.cluster.name);
		// TODO newRow.find("span[id='queue']").html(content.groupApp.name);
		newRow.find("span[id='clusterFee']").html(content.cluster.fee);
		
		var priceSpan = newRow.find("span[id='price']");
		if (content.payType == 1) {
			priceSpan.html("包月：" + content.price + "元");
		} else if (content.payType == 2) {
			priceSpan.html("机时单价：" + content.price + " 元/核小时");
		}
		
		// get queue list.
		listQueueInApp(content.appCode, newRow.find("span[id='queue']"));
		
        newRow.appendTo("#"+appWell);
        newRow.removeClass('hidden');
		
		$('#' + appWell).removeClass('hidden');
    });
    
};
