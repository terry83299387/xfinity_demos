$(function(){
	//1.function
	var setHead = function(){
		$('#_head').find('.active').removeClass('active');
		$('#_myXfinity').addClass("active");
	};
	var getValue = function(){
		var name = $("#name").val();
		var pwd = $("#pwd").val();
		var maxSlots = $("#maxSlots").val();
		var workDir = $("#workDir").val();
		var maxJobs = $("#maxJobs").val();
		if(name == null || $.trim(name)==""){
			$("#msgInfo").html("<b>提示：</b>用户名不能为空！").show(300).delay(3000).hide(1000); 
			$("#name").focus();
			return true;
		}
		if(pwd == null || $.trim(pwd)==""){
			$("#msgInfo").html("<b>提示：</b>密码不能为空！").show(300).delay(3000).hide(1000); 
			$("#pwd").focus();
			return true;
		}
		if(workDir == null || $.trim(workDir)==""){
			$("#msgInfo").html("<b>提示：</b>工作目录不能为空！").show(300).delay(3000).hide(1000); 
			$("#workDir").focus();
			return true;
		}
		var info = {
			clusterCode:clusterCode,
			hostUserCode:hostUserCode,
			name:name,
			pwd:pwd,
			maxSlots:maxSlots,
			workDir:workDir,
			maxJobs:maxJobs
		}
		return info;
	}
	var saveInfo = function(){
		var info = getValue();
		jQuery.ajax({ 
				url: "modifyHostUser.action",
				async: false,
				type: "POST",
				data:info,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					$("#msgInfo").html("<b>提示：</b>保存失败!原因："+exception).show(300).delay(3000).hide(1000); 
				}else{
					$("#msgInfo").html("<b>提示：</b>保存成功!").show(300).delay(3000).hide(1000); 
					cancelEdit();
				}},
				error:function(){
					$("#msgInfo").html("<b>提示：</b>保存失败!").show(300).delay(3000).hide(1000); 
				}
			});
	};
	var setHostUserInfo = function(hostUserInfo){
		clusterCode = hostUserInfo.clusterCode;
		$("#name").val(hostUserInfo.hostUserName);
		$("#pwd").val(hostUserInfo.pwd);
		$("#maxSlots").val(hostUserInfo.maxSlots);
		$("#workDir").val(hostUserInfo.homeDir);
		$("#maxJobs").val(hostUserInfo.maxJobs);
	};
	var getHostUserInfo = function(){
		jQuery.ajax({ 
				url: "hostUserByCode.action",
				async: false,
				type: "POST",
				data:{hostUserCode:hostUserCode},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					$("#msgInfo").html("<b>提示：</b>获取信息失败!原因："+exception).show(300).delay(3000).hide(1000); 
				}else{
					hostUserInfo = c.responseJSON.hostUserInfo;
					setHostUserInfo(hostUserInfo);
				}},
				error:function(){
					$("#msgInfo").html("<b>提示：</b>获取信息失败!").show(300).delay(3000).hide(1000); 
				}
			});
	};
	var saveSet = function(_this){
		$(_this).removeAttr("readOnly");
		$("#saveAndCancel").show();
	};
	var cancelEdit = function(){
		$("#infoForm").find($("input")).attr("readOnly",true);
		$("#infoForm").find($("select")).attr("readOnly",true);
		$("#saveAndCancel").hide();
		$("#getWorkDir").hide();
		$("#test").hide();
	}
	
	///-------------
	var hostUserInfo = "";
	var clusterCode = "";
	
	$("#saveAndCancel").hide();
	$("#getWorkDir").hide();
	$("#test").hide();
	setHead();
	getHostUserInfo();
	//
	$("#save").click(function(){
		saveInfo();
	});
	$("#name").dblclick(function(){
		saveSet(this);
	});
	$("#pwd").dblclick(function(){
		saveSet(this);
		$("#test").show();
	});
	$("#maxSlots").dblclick(function(){
		saveSet(this);
	});
	$("#workDir").dblclick(function(){
		saveSet(this);
		$("#getWorkDir").show();
	});
	$("#maxJobs").dblclick(function(){
		saveSet(this);
	});
	$("#cancelEdit").click(function(){
		setHostUserInfo(hostUserInfo);
		cancelEdit();
	});
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

})