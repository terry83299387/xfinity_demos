var dataSize;

var isFinishStatus = function(status) {
	if (status == '3' || status == '4') {
		return true;
	}
	return false;
}

var statusCN = {
    "1": "等待技术支持人员处理",
    "2": "技术支持人员正在处理",
    "3": "已取消",
    "4": "已完成",
	"5": "未付款"
};
var initOrderTable = function(start, size, tag){
	
    jQuery.ajax({
        url: "orderInfoList.action",
        async: false,
        data: {
            start: start,
            size: size,
			tag : tag
        },
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        success: function(a, b, c){
            var exception = c.responseJSON.exception;
            if (exception) {
                 Xfinity.message.alert("<b>提示：</b>获取列表失败!原因：" + exception).show(300).delay(3000).hide(1000);
            }
            else {
				var unfinishOrderSize = c.responseJSON.unfinishOrderSize;
				var finishOderSize = c.responseJSON.finishOderSize;
				$('#unfinishNum').text(unfinishOrderSize);
				$('#finishedNum').text(finishOderSize);
				
				if (tag == 'finish') {
					dataSize = finishOderSize
				} else {
					dataSize = unfinishOrderSize;
				}
				
				$.turnPageBar.init({
                    reload: initOrderTable,
                    sum: dataSize,
                    start: start + 1,
					tag : tag,
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
    $("#table-body").find("tr").remove();
    firstTr.appendTo("#table-body");
    $.each(orderList, function(index, content){
        var newRow = firstTr.clone(true).attr("id", content.orderCode);
        newRow.find("td[id='orderno']").html(content.orderNo);
        newRow.find("p[id='userinfo-link']").html(content.buyer.name);
		newRow.find("p[id='company']").html(content.buyer.groupInfoEntity.company);
        newRow.find("p[id='email']").html(content.buyer.email);
        newRow.find("p[id='reqtimevalue']").html(Xfinity.Util.formatTime(content.createDate));
        
        var statusN = content.status;
		if (isFinishStatus(statusN)) {
			newRow.find("a[id='solbutton']").addClass('hidden');
		} else {
			newRow.find("a[id='solbutton']").removeClass('hidden');
			newRow.find("a[id='solbutton']").attr('href', "support/supportUserReqSol.jsp?orderCode=" + content.orderCode);
		}
        var chineseStatus = statusCN[statusN];
        newRow.find("td[id='status']").html(chineseStatus);
        
        newRow.appendTo("#table-body");
        newRow.show();
    });
    
    firstTr.hide();
};

$(function(){
    $("#row").hide();
	
	var start = 0;
   initOrderTable(start,Xfinity.Util.pageSize, "unfinish");
	
	$("#unfinishOrderBtn").click(function(){
		$('#_orderByStatus').find('.active').removeClass('active');
		$("#unfinishOrderBtn").addClass('active');
		initOrderTable(start,Xfinity.Util.pageSize, "unfinish");
	});
	
	$("#finishedOrderBtn").click(function(){
		$('#_orderByStatus').find('.active').removeClass('active');
		$("#finishedOrderBtn").addClass('active');
		initOrderTable(start,Xfinity.Util.pageSize, 'finish');
	});
})
