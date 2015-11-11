//充值
$(function(){
	
//1 function
	var doRecharge = function(){
		var amount = $("#amount").val();
		if(amount <= 0){
			$("#msgInfo").html("<b>提示：</b>充值金额应该大于0元！").show(300).delay(3000).hide(1000); 
			$("#amount").focus();
			return false;
		}
		jQuery.ajax({ 
			url: "recharge.action",
			async:false,
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:{amount:amount},
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				$("#msgInfo").html("<b>提示：</b>获取列表失败!原因："+exception).show(300).delay(3000).hide(1000); 
			}else{
				$("#msgInfo").html("<b>提示：</b>充值成功！").show(300).delay(3000).hide(1000); 
				var ba = c.responseJSON.balance;
				$("#balanceSpan").html(ba.toFixed(2));
			}},
			error:function(){
				$("#msgInfo").html("<b>提示：</b>获取列表失败!").show(300).delay(3000).hide(1000); 
			}
		});
	};
//2 running body
	//2.1 variables definition
	var projectList="";
	var sum=0;
	var start=0;
	//2.2 page effect
//	$("#accountMgm").addClass('list-group-item-info');
	$("#balanceSpan").html(balance);
	//2.3 click event
	$("input:radio[name='pay']").change(function (){
		if($("input[name=pay]:checked").attr('id') == 'zfb'){
			$("#bankList").hide();
		}else{
			$("#bankList").show();
		}
	});
	$("#confirmBtn").click(function(){
		doRecharge();
	});
})