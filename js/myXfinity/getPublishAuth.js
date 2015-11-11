$(function(){
	var submit = function(){
		var userRealName = $("#realName").val();
		var phoneNum = $("#phone").val();
		var cellPhoneNum = $("#cellPhone").val();
		var companyName = $("#company").val();
		var deptmentName = $("#deptment").val();
		var title = $("#title").val();
		var idCardFront = null;
		var idCardBack = null;
		var buLicense = null;
		
		if(!userRealName || $.trim(userRealName)==""){
			$("#msgInfo").html("<b>提示：</b>姓名不能为空！").show(300).delay(3000).hide(1000); 
			return;
		}
		if(phoneNum && !Xfinity.Util.checkPhoneNumber(phoneNum)){
			$("#msgInfo").html("<b>提示：</b>固定电话输入有误！").show(300).delay(3000).hide(1000); 
			return;
		}
		if(!cellPhoneNum || $.trim(cellPhoneNum)==""){
			$("#msgInfo").html("<b>提示：</b>移动电话不能为空！").show(300).delay(3000).hide(1000); 
			return;
		}
		if(!Xfinity.Util.checkPhoneNumber(cellPhoneNum)){
			$("#msgInfo").html("<b>提示：</b>移动电话输入有误！").show(300).delay(3000).hide(1000); 
			return;
		}
		if(!companyName || $.trim(companyName)==""){
			$("#msgInfo").html("<b>提示：</b>单位名称不能为空！").show(300).delay(3000).hide(1000); 
			return;
		}
		if(!deptmentName || $.trim(deptmentName)==""){
			$("#msgInfo").html("<b>提示：</b>部门名称不能为空！").show(300).delay(3000).hide(1000); 
			return;
		}
		if(!title || $.trim(title)==""){
			$("#msgInfo").html("<b>提示：</b>职位不能为空！").show(300).delay(3000).hide(1000); 
			return;
		}
		var data = {
	        userRealName:encodeURI(userRealName),
	        phoneNum:phoneNum,
	        cellPhoneNum:cellPhoneNum,
	        companyName:encodeURI(companyName),
	        deptmentName:encodeURI(deptmentName),
	        title:encodeURI(title),
	        idCardFront:idCardFront,
	        idCardBack:idCardBack,
	        buLicense:buLicense
	     }
	     jQuery.ajax({ 
			url: "addUserInfoDetail.action",
			data:data, 
			success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					$("#msgInfo").html("<b>提示：</b>提交失败!原因："+exception).show(300).delay(3000).hide(1000); 
				}else{
					$("#msgInfo").html("<b>提示：</b>提交成功!").show(300).delay(3000).hide(1000); 
					Xfinity.Util.post('jsp/myXfinity.jsp');
				}
			},
			error:function(){
				$("#msgInfo").html("<b>提示：</b>提交失败!").show(300).delay(3000).hide(1000); 
			}
		});
	}
	
	$("#submit").click(function(){
		submit();
	})
	
})