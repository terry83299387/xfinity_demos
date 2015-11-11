$(function(){
	
//1 function
	var setData = function(){
		var data={
			status:1,
			start:0,
			size:1000
		}
		return data;
	};
	var setBankCardSelect = function(bankCardList){
				var select = $("#bankCardSelect").get(0);
				$.each( bankCardList, function(index, content){
					var text = content.bankName+" "+content.cardNumber;
					var value = content.bankCardCode;
					select.options.add(new Option(text,value));
				});
			};
	var getBankCardList = function(){
		jQuery.ajax({ 
			url: "bankCardList.action",
			async:false,
			type:'POST',
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:setData(),
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
				if(exception){
				}else{
					bankCardList = c.responseJSON.bankCardList;
					setBankCardSelect(bankCardList);
			}},
			error:function(){
//				$("#msgInfo").html("<b>提示：</b>获取列表失败!").show(300).delay(3000).hide(1000); 
			}
		});
	};
	var getData = function(){
		var bankCarCode = $("#bankCardSelect").val();
		var amount = $("#amount").val();
		if(amount <= 0){
			$("#msgInfo").html("<b>提示：</b>提现金额必须大于0!").show(300).delay(3000).hide(1000); 
			return false;
		}
		data = {
			bankCarCode:bankCarCode,
			amount:amount
		}
		return data;
	};
	var doWithdrawals = function(){
		var data = getData();
		jQuery.ajax({ 
			url: "withdrawals.action",
			async:false,
			contentType: "application/x-www-form-urlencoded;charset=utf-8",
			data:data,
			success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					$("#msgInfo").html("<b>提示：</b>提现失败!原因:"+exception).show(300).delay(3000).hide(1000); 
				}else{
					$("#msgInfo").html("<b>提示：</b>提现成功!").show(300).delay(3000).hide(1000); 
					var b = c.responseJSON.balance;
					$("#balance").html(b.toFixed(2));
				}},
			error:function(){
				$("#msgInfo").html("<b>提示：</b>获取列表失败!").show(300).delay(3000).hide(1000); 
			}
		});
	};
//2 running body
	//2.1 variables definition
	var bankCardList="";
	var sum=0;
	var start=0;
	//2.2 page effect
	$("#balance").html(balance);
//	$("#accountMgm").addClass('list-group-item-info');
	getBankCardList();
	//2.3 click event
	$("#allBalance").click(function(){
		$("#amount").val($("#balance").text());
	});
	$("#confirmBtn").click(function(){
		doWithdrawals();
	});
})