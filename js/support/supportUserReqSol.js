var orderDetail;

var statusCN = {
    "1": "等待技术支持人员处理",
    "2": "技术支持人员正在处理",
    "3": "已取消",
    "4": "已完成",
	"5": "未付款"
};

var isFinish = function(status) {
	if (status == "3" || status == "4") {
		return true;
	}
	return false;
}

var loadUserAccoutInfo = function() {
	jQuery.ajax({
        url: "accountInfo.action",
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        data: {
            userCode: orderDetail.buyerCode
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
				$('#userAccountInfo').html(accountInfo.amount + "元");
            }
        },
        error: function(){
            Xfinity.message.alert("<b>提示：</b>获取订单详情失败!");
        }
    });
}

var loadOrderDetail = function(orderCode){
    jQuery.ajax({
        url: "showOrderDetail.action",
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        data: {
            orderCode: orderCode
        },
        type: 'post',
        success: function(a, b, c){
            var exception = c.responseJSON.exception;
            if (exception) {
                Xfinity.message.alert("<b>提示：</b>获取订单详情失败!原因：" + exception);
            }
            else {
                orderDetail = c.responseJSON.orderDetail;
                showOrderDetail(c.responseJSON.orderDetail);
            }
        },
        error: function(){
            Xfinity.message.alert("<b>提示：</b>获取订单详情失败!原因：" + exception);
        }
    });
}

var showOrderDetail = function(orderDetail){
    $('#orderCodeLi').html(orderDetail.orderNo);
    $('#orderCodeSpan').html(orderDetail.orderNo);
    
    $('#orderCodeInDiv').html(orderDetail.orderCode);
    $('#userName').html(orderDetail.buyer.name);
	$('#currentStatus').html("当前状态：" + statusCN[orderDetail.status]);
	
	loadUserAccoutInfo();
 
 	switch(orderDetail.status) {
	case 1: // 等待处理
		$('#handleBtns').removeClass('hidden');
		$('#isWorkingBtn').removeClass('hidden');
		break;
	case 2: // 正在处理
		$('#handleBtns').removeClass('hidden');
		$('#isWorkingBtn').addClass('hidden');
		break;
	case 3: // 已取消
		$('#handleBtns').addClass('hidden');
		$('#orderCancelBtn').removeClass('hidden');
		break;
	case 4: // 已完成
		$('#handleBtns').addClass('hidden');
		$('#orderFinishBtn').removeClass('hidden');
		break;
	}
	
	if (!isFinish(orderDetail.status)) {
		listAppsInOrder(orderDetail.userOrderCode, 'appWell');
	}

}

var addHostUser = function(){
	var clusterCode = orderDetail.clusterCode;
	var groupCode = orderDetail.buyerGroupCode 
    var hostUserName = $('#hostUserName').val();
    var hostUserPwd = $('#hostUserPwd').val();
    var hostUserHomeDir = $('#hostUserHomeDir').val();
    var hostUserGroup = $('#hostUserGroup').val();
    var hostUserMaxSlots = $('#hostUserMaxSlots').val();
	var hostUserMaxJobs = $('#hostUserMaxJobs').val();
	var groupString = $('#hostUserGroup').val();
    
	if (hostUserName == null || hostUserName.trim().length == 0) {
		Xfinity.message.alert('请填写主机账号');
		return ;
	}
	
	if (hostUserPwd == null || hostUserPwd.trim().length == 0) {
		Xfinity.message.alert('请填写主机账号密码');
		return ;
	}
	
    jQuery.ajax({
        url: "addHostUser.action",
        type: "POST",
        data: {
            name: hostUserName,
            pwd: hostUserPwd,
			groupString:groupString,
            homeDir: hostUserHomeDir,
            hostUserGroup: hostUserGroup,
			clusterCode : clusterCode,
            maxSlots: hostUserMaxSlots,
            maxJobs: hostUserMaxJobs,
            clusterCode: clusterCode,
			groupCode : groupCode
        },
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        success: function(a, b, c){
            var exception = c.responseJSON.exception;
            if (exception) {
                Xfinity.message.alert("<b>提示：</b>添加失败!原因：" + exception);
            } else {
				$('#hostUserNameExist').html(hostUserName);
            	$('#existHostUserForm').removeClass('hidden');
				$('#addHostUserForm').addClass('hidden');
			}
        },
        error: function(){
            Xfinity.message.alert("<b>提示：</b>添加失败!原因：" + exception);
        }
    });
}

var updateOrderStatus = function(status) {
	jQuery.ajax({
        url: "updateOrder.action",
        type: "POST",
        data: {
			orderCode : orderDetail.userOrderCode,
			status : status
        },
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        success: function(a, b, c){
            var exception = c.responseJSON.exception;
            if (exception) {
                Xfinity.message.alert("<b>提示：</b>更新失败!原因：" + exception);
            } else {
				location.reload();
			}
        },
        error: function(){
            Xfinity.message.alert("<b>提示：</b>更新失败!原因：" + exception);
        }
    });
}

var handleOrder = function() {
	updateOrderStatus(2);
}

var cancelOrder = function() {
	updateOrderStatus(3);
}

var finishOrder = function() {
	updateOrderStatus(4);
}

var addAmountForUser = function() {
	var userCode = orderDetail.buyerCode;
	var amount = $('#amount').val();
	
	if (amount == null || amount.trim().length == 0) {
		Xfinity.message.alert("请输入充值金额!");
		$('#amount').focus();
		return;
	}
	
	if (amount <= 0) {
		Xfinity.message.alert("请输入正确金额!");
		$('#amount').focus();
		return;
	}
	
	jQuery.ajax({
        url: "recharge.action",
        type: "POST",
        data: {
			userCode : userCode,
			amount : amount
        },
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        success: function(a, b, c){
            var exception = c.responseJSON.exception;
            if (exception) {
                Xfinity.message.alert("<b>提示：</b>为用户充值失败!原因：" + exception);
            } else {
				location.reload();
			}
        },
        error: function(){
            Xfinity.message.alert("<b>提示：</b>为用户充值失败!原因：" + exception);
        }
    });
}

$(function(){
    loadOrderDetail(orderCode);
    
    addAppsLoaderListener(function(){
		var length = groupAppList.length;
		if (length == 0) {
			$('#addHostUserForm').removeClass('hidden');
			return; 
		}
		
        var hostUserCode = groupAppList[0].hostUserCode;
        if (hostUserCode == null || hostUserCode == '') {
			$('#addHostUserForm').removeClass('hidden');
			$('#finishBtn').addClass('hidden');
        }
        else {
			$('#hostUserNameExist').html(groupAppList[0].hostUser.name);
            $('#existHostUserForm').removeClass('hidden');
			$('#finishBtn').removeClass('hidden');
        }
    });
	
});
