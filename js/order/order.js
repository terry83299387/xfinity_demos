var dataSize;

var isUnFinishStatus = function(status){
    if (status == '1' || status == "2") {
        return true;
    }
    return false;
}

var statusCN = {
    "1": "等待处理",
    "2": "正在处理",
    "3": "已取消",
    "4": "已完成",
    "5": "未付款"
};

var loadUserAccoutInfo = function() {
	jQuery.ajax({
        url: "accountInfo.action",
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        data: {
            userCode: currentUserCode
        },
        type: 'post',
        success: function(a, b, c){
            var exception = c.responseJSON.exception;
			var error = "<b>提示：</b>获取用户账号失败!原因：" + exception;
            if (exception) {
				$('#userAccountInfo').html(error);
            }
            else {
                accountInfo = c.responseJSON.accountInfo;
				$('#userAccountInfo').html("余额：" + accountInfo.amount + "元");
            }
        },
        error: function(){
            Xfinity.message.alert("<b>提示：</b>获取订单详情失败!");
        }
    });
}

var initOrderTable = function(start, size){

    jQuery.ajax({
        url: "listMyOrder.action",
        async: false,
        data: {
            start: start,
            size: size
        },
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        success: function(a, b, c){
            var exception = c.responseJSON.exception;
            if (exception) {
                Xfinity.message.alert("<b>提示：</b>获取列表失败!原因：" + exception).show(300).delay(3000).hide(1000);
            }
            else {
                var dataSize = c.responseJSON.sum
                
                $.turnPageBar.init({
                    reload: initOrderTable,
                    sum: dataSize,
                    start: start + 1,
                    size: Xfinity.Util.pageSize
                });
                
                orderList = c.responseJSON.orderList;
                addOrderRow(orderList);
            }
        },
        error: function(){
            Xfinity.message.alert("<b>提示：</b>获取列表失败!原因：" + exception).show(300).delay(3000).hide(1000);
        }
    });
};
var addOrderRow = function(orderList){
    var firstTr = $("#row").clone(true);
    firstTr.appendTo("#table-body");
    $.each(orderList, function(index, content){
		var newRow = firstTr.clone(true);
        newRow.attr("id", content.orderCode);
        newRow.find("div[id='orderno']").html(content.orderNo);
        
        var statusN = content.status;
        var chineseStatus = statusCN[statusN];
        newRow.find("div[id='status']").html(chineseStatus);
		newRow.find("div[id='createDate']").html(Xfinity.Util.formatTime(content.createDate));
        newRow.find("div[id='publisherCompany']").html(content.publisher.groupInfoEntity.company);
		newRow.find("div[id='appWell']").attr('id', 'appWell' + index);
		
		if (isUnFinishStatus(statusN)) {
			newRow.find("a[id='appBtnDown']").removeClass('hidden');
		}
		
		var appWellId = "appWell" + index;
        newRow.find("a[id='appBtnDown']").click(function(){
			newRow.find("a[id='appBtnDown']").addClass('hidden');
			newRow.find("a[id='appBtnUp']").removeClass('hidden');
			listAppsInOrder(content.orderCode, appWellId);
        });
		
		newRow.find("a[id='appBtnUp']").click(function(){
			newRow.find("a[id='appBtnDown']").removeClass('hidden');
			newRow.find("a[id='appBtnUp']").addClass('hidden');
			
			newRow.find("div[id='"+appWellId+"']").addClass('hidden');
			$("#"+appWellId).find("div").remove("div");
		});
        
        newRow.appendTo("#table-body");
        newRow.removeClass('hidden');
    });
    
};

$(function(){
    initOrderTable(0, Xfinity.Util.pageSize);
	loadUserAccoutInfo();
});
