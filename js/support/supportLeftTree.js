$(function(){
	
	// set button active.
    if (typeof tag != 'undefined' &&
    tag != null) {
        $('#' + tag).addClass('active');
    }
    //user list
    var setOrderTip = function(){
        jQuery.ajax({
            url: "countUnfinishOrder.action",
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function(a, b, c){
                var exception = c.responseJSON.exception;
                if (exception) {
                }
                else {
                    var unfinishOrderSize = c.responseJSON.unfinishOrderSize;
                    if (unfinishOrderSize > 0) {
                        $("#_unfinishOrderNum").text(unfinishOrderSize);
                        $("#_unfinishOrderNum").removeClass('hidden');
                    }
                }
            },
            error: function(){
            }
        });
    };
    //cmd
    var setAvaCmdNumTip=function(){
    	jQuery.ajax({
    		url:"countAvaCmdNum.action",
    		contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function(a, b, c){
                var exception = c.responseJSON.exception;
                if (exception) {
                }
                else {
                    var avaCmdNum = c.responseJSON.aveCmdSize;
                    if (avaCmdNum > 0) {
                        $("#_avaCmdNum").text(avaCmdNum);
                        $("#_avaCmdNum").removeClass('hidden');
                    }
                }
            },
            error: function(){
            }
    	});
    };
    //disk 暂时先不实现该功能，
    var setDiskNumTip=function(){
    	jQuery.ajax({
    		url:"countDiskNum.action",
    		contentType: "application/x-www-form-urlencoded; charset=utf-8",
            success: function(a, b, c){
                var exception = c.responseJSON.exception;
                if (exception) {
                }
                else {
                    var hostNum = c.responseJSON.hostNumSize;
                    if (hostNum > 0) {
                        $("#_hsotNum").text(hsotNum);
                        $("#_hostNum").removeClass('hidden');
                    }
                }
            },
            error: function(){
            }
    	});
    };
    
    //check userrole
    switch(roleCode) {
    case "group-admin":
    	$("#supportLeftTreeManage").removeClass('hidden');
    	$("#supportLeftTreeSpec").removeClass('hidden');
    	setOrderTip();
        setAvaCmdNumTip();
//        setDiskNumTip();
    	break;
    case "sub-user":
    	$("#supportLeftTreeSpec").removeClass('hidden');
    	$("#diskSpace").addClass('hidden');
    	setOrderTip();
        setAvaCmdNumTip();
    	break;
    }
    

});
