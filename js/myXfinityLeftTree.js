$(function(){
	$('#_myXfinity').addClass("active");
	
	var setAccountAmount = function(){
		jQuery.ajax({ 
			url: "accountInfo.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				var accountInfo = c.responseJSON.accountInfo;
				var amount = accountInfo.amount;
				$("#_amount").text(amount.toFixed(2)+"元");
			}},
			error:function(){
			}
		});
	};
	
	var setJobTip = function(){
		jQuery.ajax({ 
			url: "runningJobNum.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				var runningJobNum = c.responseJSON.runningJobNum;
				if (runningJobNum > 0) {
					$("#_runningJobNum").text(runningJobNum);
					$("#_runningJobNum").removeClass('hidden');
				}
			}},
			error:function(){
			}
		});
	};
	
	var setProjectTip = function(){
		jQuery.ajax({ 
			url: "newProjectNum.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				var newProjectNum = c.responseJSON.newProjectNum;
				if (newProjectNum > 0) {
					$("#_newProjectNum").text(newProjectNum);
					$("#_newProjectNum").removeClass('hidden');;
				}
				
			}},
			error:function(){
			}
		});
	};
	
	var setOrderTip = function(){
		jQuery.ajax({ 
			url: "countUnfinishOrderByUser.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				var sum = c.responseJSON.sum;
				if (sum > 0) {
					$("#unfinshOrderNum").text(sum);
					$("#unfinshOrderNum").removeClass('hidden');
				}
				
			}},
			error:function(){
			}
		});
	};
	 var setListTip = function(){
		jQuery.ajax({ 
			url: "listNumByUserCode.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				var num = c.responseJSON.sum;
				if (num > 1) {
					$("#_listNum").text(num);
					$("#_listNum").removeClass('hidden');
				}
			}},
			error:function(){
			}
		});
	};
	var setDataTip = function(){
		// TODO 
	};
	
	var showCMD = function() {
		jQuery.ajax({ 
			url: "hasCmdAuth.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				var hasCmdAuth = c.responseJSON.hasCmdAuth;
				if (hasCmdAuth) {
					$('#subUserFunAdvance').removeClass('hidden');
				}
				
			}},
			error:function(){
			}
		});
		
	};
	
	// set button active.
    if (typeof tag != 'undefined' &&
    tag != null) {
        $('#' + tag).addClass('active');
    }
	// end
	
	// check user role
	if (UserUtil.hasGroupAdminFunction()) {
		$('#groupFun').removeClass('hidden');
		setProjectTip();
		setAccountAmount();
		setOrderTip();
		setListTip();
	}
	
	if (UserUtil.hasPublisherFunction() || UserUtil.hasSupporterFunction()) {
		$('#pubFun').removeClass('hidden');
		$('#publishFun').removeClass('hidden');
	}
	
	if (UserUtil.hasSuperadminFunction()) {
		
	}
	
	if (UserUtil.hasPlatformSupporterFunction()) {
		
	}
	
	// all users has this right.
	$('#subUserFun').removeClass('hidden');
	setJobTip();
	showCMD();
   
});
