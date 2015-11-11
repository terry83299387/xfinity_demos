var withdrawals = function(balance) {
		Xfinity.Util.post('jsp/myXfinity/myAccount/withdrawals.jsp', {balance:balance});
	};	
var recharge = function(balance) {
		Xfinity.Util.post('jsp/myXfinity/myAccount/recharge.jsp',{balance:balance});
	};	
$(function(){
	
//1 function
	var setData = function(start,size){
		var data={
			start:start,
			size:size
		}
		return data;
	};
	var initTable = function(start,size){
		var firstTr = $("#row").clone(true);
		$("#table-body").find("tr").remove();
		firstTr.appendTo("#table-body");
		jQuery.ajax({ 
			url: "bankCardList.action",
			async:false,
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:setData(start,size),
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				$("#msgInfo").html("<b>提示：</b>获取列表失败!原因："+exception).show(300).delay(3000).hide(1000); 
			}else{
				var bankCardList = c.responseJSON.bankCardList;
				sum = c.responseJSON.sum;
				addRow(bankCardList);
			}},
			error:function(){
				$("#msgInfo").html("<b>提示：</b>获取列表失败!").show(300).delay(3000).hide(1000); 
			}
		});
	};
	var addRow = function(list){
		var firstTr = $("#row");
		$.each( list, function(index, content){
			var bankCardCode = content.bankCardCode;
			var newRow = firstTr.clone(true).attr("id", bankCardCode);
			newRow.find("input[id='checkbox1']").attr("id",bankCardCode).attr("name",'checkbox');
			newRow.find("span[id='bankName']").attr("id","name"+index).html(content.bankName);
			newRow.find("span[id='bankDeposit']").attr("id","bankDeposit"+index).html(content.bankDeposit);
			newRow.find("span[id='cardNumber']").attr("id","bankDeposit"+index).html(content.cardNumber);
			var status = content.status;
			var statusStr = "";
			if(status == 1){//可用
				statusStr = "<p style='color:green'>可用</p>";
			}else if(status == 2){//不可用
				statusStr = "<p style='color:red'>不可用</p>";
			}
			newRow.find("span[id='status']").attr("id","status"+index).html(statusStr);
			newRow.find("span[id='phoneNumber']").attr("id","phoneNumber"+index).html(content.phoneNumber);
			newRow.appendTo("#table-body");
			newRow.show();
		});
		firstTr.hide();
	};
	var getCheckedCodeList = function(){
		var items = $('[name = "checkbox"]:checkbox:checked');
		var codeList = "";
 		$.each( items, function(index, content){
 			if(codeList){
 				codeList +=";"
 			}
 			codeList +=content.id;
 		});
 		return codeList;
	};
	var changeStatus = function(status,str){
   		var codeList = getCheckedCodeList();
   		if(!codeList){
   			$("#msgInfo").html("<b>提示：</b>没有勾选银行卡！").show(300).delay(3000).hide(1000); 
   			return false;
   		}
		jQuery.ajax({ 
			url: "changeCardListStatus.action",
			async:false,
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:{codeList:codeList,status:status},
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				$("#msgInfo").html("<b>提示：</b>"+str+"失败!原因："+exception).show(300).delay(3000).hide(1000); 
			}else{
				$("#msgInfo").html("<b>提示：</b>"+str+"成功！").show(300).delay(3000).hide(1000); 
				initTable($.turnPageBar.param.start-1,$.turnPageBar.param.size);
			}},
			error:function(){
				$("#msgInfo").html("<b>提示：</b>"+str+"失败!").show(300).delay(3000).hide(1000); 
			}
		});
   };
   var setBankSelect = function(bankList){
				var select = $("#bankSelect").get(0);
				$.each( bankList, function(index, content){
					var text = content.name;
					var value = content.bankCode;
					select.options.add(new Option(text,value));
				});
			};
	var getBankList = function(){
		jQuery.ajax({ 
			url: "bankList.action",
			async:false,
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:setData(0,10000),
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
				if(exception){
				}else{
					bankList = c.responseJSON.bankList;
					setBankSelect(bankList);
			}},
			error:function(){
//				$("#msgInfo").html("<b>提示：</b>获取列表失败!").show(300).delay(3000).hide(1000); 
			}
		});
	};
	var getBankCardValue = function(){
		var bankCode = $("#bankSelect").val();
		var bankDeposit = $.trim($("#bankDepositM").val());
		var cardNumber = $.trim($("#cardNumberM").val());
		var phoneNumber = $.trim($("#phoneNumberM").val());
		if(!bankDeposit){
			$("#msgInfo").html("<b>提示：</b>开户支行不能为空!").show(300).delay(3000).hide(1000);
			$("#bankDepositM").focus();
			return false;
		}
		if(!cardNumber){
			$("#msgInfo").html("<b>提示：</b>银行卡号不能为空!").show(300).delay(3000).hide(1000); 
			$("#cardNumberM").focus();
			return false;
		}
		if(!phoneNumber){
			$("#msgInfo").html("<b>提示：</b>预留手机号不能为空!").show(300).delay(3000).hide(1000); 
			$("#phoneNumberM").focus();
			return false;
		}
		var data = {
			bankCode:bankCode,
			bankDeposit:bankDeposit,
			cardNumber:cardNumber,
			phoneNumber:phoneNumber
		}
		return data;
	}
    var addBankCard = function(){
    	var data = getBankCardValue();
    	if(data == false){
    		return false;
    	}
    	jQuery.ajax({ 
			url: "addBankCard.action",
			async:false,
			type: "POST",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:data,
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
				if(exception){
					$("#addBankCardMsgInfo").html("<b>提示：</b>添加银行卡失败!原因："+exception).show(300).delay(3000).hide(1000);
				}else{
					$("#addModal").modal('hide');
					$("#msgInfo").html("<b>提示：</b>添加银行卡成功!").show(300).delay(3000).hide(1000); 
					initTable($.turnPageBar.param.start-1,$.turnPageBar.param.size);
			}},
			error:function(){
				$("#addBankCardMsgInfo").html("<b>提示：</b>添加银行卡失败!").show(300).delay(3000).hide(1000); 
			}
    	})
    };
	var initPageBar = function(){
		$.turnPageBar.init({
			reload:initTable,
			sum:sum,
			fresh:true,
			cur:1,
			start:1,
			to:Xfinity.Util.pageSize,
		size:Xfinity.Util.pageSize
		});
	};
//2 running body
	//2.1 variables definition
	var accountInfo="";
	var accountDetailList = "";
	var sum = 0;
	var start = 0;
	//2.2 page effect
//	$("#accountMgm").addClass('list-group-item-info');
//	getAccountInfo();
	$("#row").hide();
	initTable(start,Xfinity.Util.pageSize);
	initPageBar();
	//2.3 click event
	$("#forbid").click(function(){
		changeStatus(2,"禁用");
	});
	$("#enable").click(function(){
		changeStatus(1,"启用");
	});
	$("#allCheckbox").click(function() {
	 	var checkbox =$("[name='checkbox']");
		if($("#allCheckbox").is(':checked')){
			checkbox.prop("checked",true);
		}else{
			checkbox.prop("checked",false);
		}
	 });
	 $("#add").click(function(){
	 	getBankList();
	 	$("#addModal").modal('show');
	 });
	 $("#addBankCard").click(function(){
	 	addBankCard();
	 });
})