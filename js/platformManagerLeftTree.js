
var newPublisherMngInfo;

var newReminderNum = function() {
	jQuery.ajax({ 
		url: "newReminderNum.action",
		contentType: "application/x-www-form-urlencoded; charset=utf-8",
		async:true,
		success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				newPublisherMngInfo = c.responseJSON.totalSize;
				if (newPublisherMngInfo &&  (newPublisherMngInfo > 0)) {
					$("#newPublisherMngInfo").html(newPublisherMngInfo).removeClass('hidden');
				}
		}},
		error:function(){
			
		}
	});
};


$(function(){
	newReminderNum();
});
