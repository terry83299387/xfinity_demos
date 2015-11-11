var hostUserMgm = function(clusterCode,clusterName) {
		Xfinity.Util.post('jsp/myXfinity/publishResource/hostUserMgm.jsp', {clusterCode:clusterCode,clusterName:clusterName});
	};	
var queueMgm = function(clusterCode,clusterName) {
		Xfinity.Util.post('jsp/myXfinity/publishResource/queueMgm.jsp', {clusterCode:clusterCode,clusterName:clusterName});
	};	
$(function(){
	//1.function
	var setHead = function(){
		$('#_head').find('.active').removeClass('active');
		$('#_myXfinity').addClass("active");
	};
	var setConnectInfo = function(clusterInfo){
		$("#name").val(clusterInfo.name);
		$("#webServiceProtocol").val(clusterInfo.webServiceProtocol);
		$("#clusterIP").val(clusterInfo.clusterIp);
		$("#clusterPort").val(clusterInfo.clusterPort);
		$("#cmdProtocol").val(clusterInfo.cmdProtocol);
		$("#cmdIP").val(clusterInfo.cmdIP);
		$("#cmdPort").val(clusterInfo.cmdPort);
		$("#fileTransferProtocol").val(clusterInfo.fileTransferProtocol);
		$("#fileTransferPort").val(clusterInfo.fileTransferPort);
		$("#fileManageProtocol").val(clusterInfo.fileManageProtocol);
		$("#fileManagePort").val(clusterInfo.filePort);
		$("#clusterType").val(clusterInfo.clusterType);
	};
	var setBaseInfo = function(clusterInfo){
		$("#city").val(clusterInfo.city);
		$("#applicationArea").val(clusterInfo.applicationArea);
		$("#openCmd").val(clusterInfo.openCmd);
		$("#description").val(clusterInfo.description);
		$("#calculationPeak").val(clusterInfo.calculationPeak);
		$("#linpack").val(clusterInfo.linpack);
		$("#memorySize").val(clusterInfo.memorySize);
		$("#diskSize").val(clusterInfo.diskSize);
		$("#interconnect").val(clusterInfo.interconnect);
		$("#os").val(clusterInfo.os);
		$("#jobScheduleSys").val(clusterInfo.jobScheduleSys);
		$("#computeNodeDes").val(clusterInfo.computeNodeDes);
		$("#accessNodeDes").val(clusterInfo.accessNodeDes);
		$("#processor").val(clusterInfo.processor);
	};
	var setClusterInfo = function(clusterInfo){
		setConnectInfo(clusterInfo);
		setBaseInfo(clusterInfo);
	};
	
	var getClusterInfo = function(){
		jQuery.ajax({ 
				url: "clusterInfoByCode.action",
				async: false,
				type: "POST",
				data:{clusterCode:clusterCode},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
						$("#msgInfo").html("<b>提示：</b>保存失败!原因："+exception).show(300).delay(3000).hide(1000); 
					}else{
						clusterInfoDetail = c.responseJSON.clusterInfoDetail;
						setClusterInfo(clusterInfoDetail);
				}},
				error:function(){
					$("#msgInfo").html("<b>提示：</b>保存失败!").show(300).delay(3000).hide(1000); 
				}
			});
	};
	var getConnectionInfoValue = function(){
		var name = $("#name").val();
		var webServiceProtocol = $("#webServiceProtocol").val();
		var clusterIP = $("#clusterIP").val();
		var clusterPort = $("#clusterPort").val();
		var cmdProtocol = $("#cmdProtocol").val();
		var cmdIP = $("#cmdIP").val();
		var cmdPort = $("#cmdPort").val();
		var fileTransferProtocol = $("#fileTransferProtocol").val();
		var fileTransferPort = $("#fileTransferPort").val();
		var fileManageProtocol = $("#fileManageProtocol").val();
		var fileManagePort = $("#fileManagePort").val();
		var clusterType = $("#clusterType").val();
		var endDate = $("#endDate").val();
		var connectionInfo = {
			clusterCode:clusterCode,
			name:name,
			webServiceProtocol:webServiceProtocol,
			clusterIP:clusterIP,
			clusterPort:clusterPort,
			cmdProtocol:cmdProtocol,
			cmdIP:cmdIP,
			cmdPort:cmdPort,
			fileTransferProtocol:fileTransferProtocol,
			fileTransferPort:fileTransferPort,
			fileManageProtocol:fileManageProtocol,
			fileManagePort:fileManagePort,
			endDate:endDate,
			clusterType:clusterType
		}
		return connectionInfo;
	}
	var saveConnectionInfo = function(){
		var connectionInfo = getConnectionInfoValue();
		jQuery.ajax({ 
				url: "saveConnectionInfo.action",
				async: false,
				type: "POST",
				data:connectionInfo,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					$("#msgInfo").html("<b>提示：</b>保存失败!原因："+exception).show(300).delay(3000).hide(1000); 
				}else{
					$("#msgInfo").html("<b>提示：</b>保存成功!").show(300).delay(3000).hide(1000);
					$("#connectForm").find($("input")).attr("readOnly",true);
					$("#connectForm").find($("select")).attr("readOnly",true);
					$("#saveConnect").hide();
				}},
				error:function(){
					$("#msgInfo").html("<b>提示：</b>保存失败!").show(300).delay(3000).hide(1000); 
				}
			});
	}
	
	var getBaseInfoValue = function(){
		var city = $("#city").val();
		var calculationPeak = $("#calculationPeak").val();
		var description = $("#description").val();
		var memorySize = $("#memorySize").val();
		var linpack = $("#linpack").val();
		var diskSize = $("#diskSize").val();
		var interconnect = $("#interconnect").val();
		var os = $("#os").val();
		var jobScheduleSys = $("#jobScheduleSys").val();
		var computeNodeDes = $("#computeNodeDes").val();
		var accessNodeDes = $("#accessNodeDes").val();
		var processor = $("#processor").val();
		var applicationArea = $("#applicationArea").val();
		var openCmd = $("#openCmd").val();
		var baseInfo = {
			city:city,
			calculationPeak:calculationPeak,
			clusterCode:clusterCode,
			description:description,
			applicationArea:applicationArea,
			openCmd:openCmd,
			memorySize:memorySize,
			linpack:linpack,
			diskSize:diskSize,
			interconnect:interconnect,
			os:os,
			jobScheduleSys:jobScheduleSys,
			computeNodeDes:computeNodeDes,
			accessNodeDes:accessNodeDes,
			processor:processor
		}
		return baseInfo;
	}
	var saveBaseInfo = function(){
		var baseInfo = getBaseInfoValue();
		jQuery.ajax({ 
				url: "addClusterBaseInfo.action",
				async: false,
				type: "POST",
				data:baseInfo,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					$("#msgInfo").html("<b>提示：</b>保存失败!原因："+exception).show(300).delay(3000).hide(1000); 
				}else{
					$("#msgInfo").html("<b>提示：</b>保存成功!").show(300).delay(3000).hide(1000); 
					$("#baseForm").find($("input")).attr("readOnly",true);
					$("#baseForm").find($("select")).attr("readOnly",true);
					$("#saveBase").hide();
				}},
				error:function(){
					$("#msgInfo").html("<b>提示：</b>保存失败!").show(300).delay(3000).hide(1000); 
				}
			});
	};
	var saveSet = function(_this,id){
		$(_this).removeAttr("readOnly");
		$("#"+id).show();
	}
	
	//----
	var clusterInfoDetail = "";
	setHead();
	getClusterInfo();
	$("#saveConnect").hide();
	$("#saveBase").hide();
	$("#connectPanel").show();
	$("#basePanel").hide();
	$("#hostUserAndQueuePanel").hide();
	$('.form_date').datetimepicker({
        language:  'zh-CN',
        weekStart: 1,
        todayBtn:  1,
		autoclose: 1,
		todayHighlight: 1,
		startView: 2,
		minView: 2,
		forceParse: 0
    });
	
	
	
	$("#saveConnectInfo").click(function(){
		saveConnectionInfo();
	});
	
	$("#saveBaseInfo").click(function(){
		saveBaseInfo();
	});
	
	$("#hostUserMgm").click(function(){
		hostUserMgm(clusterCode,'蜂鸟LinuxHPC');
	});
	$("#queueMgm").click(function(){
		queueMgm(clusterCode,'蜂鸟LinuxHPC');
	});
	$("#cancelConnect").click(function(){
		setConnectInfo(clusterInfoDetail);
		$("#connectForm").find($("input")).attr("readOnly",true);
		$("#connectForm").find($("select")).attr("readOnly",true);
		$("#saveConnect").hide();
	});
	$("#cancelBase").click(function(){
		setBaseInfo(clusterInfoDetail);
		$("#baseForm").find($("input")).attr("readOnly",true);
		$("#baseForm").find($("select")).attr("readOnly",true);
		$("#saveBase").hide();
	});
	
	$("#connect").click(function(){
		$("#ul").find('.active').removeClass('active');
		$(this).addClass('active');
		$("#connectPanel").show();
		$("#basePanel").hide();
		$("#hostUserAndQueuePanel").hide();
	});
	$("#base").click(function(){
		$("#ul").find('.active').removeClass('active');
		$(this).addClass('active');
		$("#connectPanel").hide();
		$("#basePanel").show();
		$("#hostUserAndQueuePanel").hide();
	});
	$("#hostUserAndQueue").click(function(){
		$("#ul").find('.active').removeClass('active');
		$(this).addClass('active');
		$("#connectPanel").hide();
		$("#basePanel").hide();
		$("#hostUserAndQueuePanel").show();
	});
	
	$("#name").dblclick(function(){
		saveSet(this,"saveConnect");
	});
	$("#webServiceProtocol").dblclick(function(){
		saveSet(this,"saveConnect");
	});
	$("#clusterIP").dblclick(function(){
		saveSet(this,"saveConnect");
	});
	$("#clusterPort").dblclick(function(){
		saveSet(this,"saveConnect");
	});
	$("#cmdProtocol").dblclick(function(){
		saveSet(this,"saveConnect");
	});
	$("#cmdIP").dblclick(function(){
		saveSet(this,"saveConnect");
	});
	$("#cmdPort").dblclick(function(){
		saveSet(this,"saveConnect");
	});
	$("#fileTransferProtocol").dblclick(function(){
		saveSet(this,"saveConnect");
	});
	$("fileTransferPort").dblclick(function(){
		saveSet(this,"saveConnect");
	});
	$("#fileManageProtocol").dblclick(function(){
		saveSet(this,"saveConnect");
	});
	$("#fileManagePort").dblclick(function(){
		saveSet(this,"saveConnect");
	});
	$("#clusterType").dblclick(function(){
		saveSet(this,"saveConnect");
	});
	
	
	$("#city").dblclick(function(){
		saveSet(this,"saveBase");
	});
	$("#applicationArea").dblclick(function(){
		saveSet(this,"saveBase");
	});
	$("#openCmd").dblclick(function(){
		saveSet(this,"saveBase");
	});
	$("#description").dblclick(function(){
		saveSet(this,"saveBase");
	});
	$("#calculationPeak").dblclick(function(){
		saveSet(this,"saveBase");
	});
	$("#linpack").dblclick(function(){
		saveSet(this,"saveBase");
	});
	$("#memorySize").dblclick(function(){
		saveSet(this,"saveBase");
	});
	$("#diskSize").dblclick(function(){
		saveSet(this,"saveBase");
	});
	$("#interconnect").dblclick(function(){
		saveSet(this,"saveBase");
	});
	$("#os").dblclick(function(){
		saveSet(this,"saveBase");
	});
	$("#jobScheduleSys").dblclick(function(){
		saveSet(this,"saveBase");
	});
	$("#computeNodeDes").dblclick(function(){
		saveSet(this,"saveBase");
	});
	$("#accessNodeDes").dblclick(function(){
		saveSet(this,"saveBase");
	});
	$("#processor").dblclick(function(){
		saveSet(this,"saveBase");
	});

})