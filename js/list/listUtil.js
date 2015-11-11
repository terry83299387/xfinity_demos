
var addToList = function(data){
	jQuery.ajax({
				url : "addList.action",
				contentType : "application/x-www-form-urlencoded; charset=utf-8",
				async : false,
				data : data,
				success : function(a, b, c) {
					var exception = c.responseJSON.exception;
					if (exception) {
						if(Xfinity.Constant.UNLOGIN == exception){
						Xfinity.Util.post('login.jsp');
						return false;
					}else{
						Xfinity.message.alert("加入清单失败!原因:"+exception); 
					}
					} else {
						Xfinity.message.popup("加入清单成功!");
					}
				},
				error : function() {
					Xfinity.message.alert("加入清单失败！");
				}
			});
};