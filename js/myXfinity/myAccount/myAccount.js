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
			isIncome:isIncome,
			start:start,
			size:size
		}
		return data;
	};
	var setAccountInfo = function(accountInfo){
		if(accountInfo){
			balance = accountInfo.amount.toFixed(2);
			$("#balance").text(balance);
		}
	};
	var getAccountInfo = function(){
		jQuery.ajax({ 
			url: "accountInfo.action",
			async:false,
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
//			data:setData(start,size),
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				$("#msgInfo").html("<b>提示：</b>获取账户信息失败!原因："+exception).show(300).delay(3000).hide(1000); 
			}else{
				accountInfo = c.responseJSON.accountInfo;
				setAccountInfo(accountInfo);
			}},
			error:function(){
				$("#msgInfo").html("<b>提示：</b>获取账户信息失败!").show(300).delay(3000).hide(1000); 
			}
		});
	};
	var initTable = function(start,size){
		var firstTr = $("#row").clone(true);
		$("#table-body").find("tr").remove();
		firstTr.appendTo("#table-body");
		
		jQuery.ajax({ 
			url: "accountDetailList.action",
			async:false,
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:setData(start,size),
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				$("#msgInfo").html("<b>提示：</b>获取列表失败!原因："+exception).show(300).delay(3000).hide(1000); 
			}else{
				accountDetailList = c.responseJSON.accountDetailList;
				sum = c.responseJSON.sum;
				addRow(accountDetailList);
			}},
			error:function(){
				$("#msgInfo").html("<b>提示：</b>获取列表失败!").show(300).delay(3000).hide(1000); 
			}
		});
	};
	var addRow = function(accountDetailList){
		var firstTr = $("#row");
		$.each( accountDetailList, function(index, content){
			var newRow = firstTr.clone(true).attr("id", content.accountDetailCode);
			
//			attr("onclick", "javascript:detailProject('"+content.proCode+"','"+content.name+"','"+content.groupCode+"')");
			
			var balance = content.balance.toFixed(2);
			newRow.find("span[id='balance']").attr("id","balance"+index).html(balance);
			
			var amountSpan = newRow.find("span[id='amount']").attr("id","amount"+index);
			var amount = content.amount.toFixed(2);
			var type = content.type;
			var outline = "";
			var contentOutline = content.outline; 
			var length = contentOutline.length;
			
			if(length > 24){
						contentOutline = contentOutline.substring(0,24)+"<br>"+contentOutline.substring(24,length);
					};
			var outlineLink = newRow.find("a[id='modify-link']");
			switch(type){
				case 1:
					outline = "<span style='font-weight: bold'>购买-</span>"+contentOutline;
					amount = "-"+amount;
					break;
				case 2:
					outline = "<span style='font-weight: bold'>提现</span>";
					amount = "-"+amount;
					outlineLink.removeAttr("href");
					break;
				case 3:
					outline = "<span style='font-weight: bold'>售出-</span>"+contentOutline;
					amountSpan.attr("style","color:green;font-weight: bold");
					amount = "+"+amount;
					break;
				case 4:
					outline = "<span style='font-weight: bold'>充值</span>";
					amountSpan.attr("style","color:green;font-weight: bold");
					amount = "+"+amount;
					outlineLink.removeAttr("href");
					break;
				default:
					outline='';
			}
			amountSpan.html(amount);
			outlineLink.attr("id","modify-link"+index).html(outline);
			if(content.createDate)
			 	newRow.find("span[id='dateTime']").attr("id","dateTime"+index).html(content.createDate.replace("T"," "));
			newRow.appendTo("#table-body");
			newRow.show();
		});
		firstTr.hide();
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
	var isIncome = 0;
	var balance = 0.00;
	//2.2 page effect
//	$("#accountMgm").addClass('list-group-item-info');
	$("#row").hide();
	getAccountInfo();
	initTable(start,Xfinity.Util.pageSize);
	initPageBar();
	//2.3 click event
	$("#recharge").click(function(){
	  	recharge(balance);
	});
	$("#withdrawals").click(function(){
	  	withdrawals(balance);
	});
	$("#income").click(function(){
		$("#ul").find('.active').removeClass('active');
		$(this).addClass('active');
		isIncome = 1;
		initTable(start,Xfinity.Util.pageSize);
		initPageBar();
	});
	$("#all").click(function(){
		$("#ul").find('.active').removeClass('active');
		$(this).addClass('active');
		isIncome = 0;
		initTable(start,Xfinity.Util.pageSize);
		initPageBar();
	});
	$("#outcome").click(function(){
		$("#ul").find('.active').removeClass('active');
		$(this).addClass('active');
		isIncome = 2;
		initTable(start,Xfinity.Util.pageSize);
		initPageBar();
	});
})