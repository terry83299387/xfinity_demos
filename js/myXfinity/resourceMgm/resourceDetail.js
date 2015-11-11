var hostUserMgm = function(clusterCode,clusterName) {
		Xfinity.Util.post('jsp/myXfinity/publishResource/hostUserMgm.jsp', {clusterCode:clusterCode,clusterName:clusterName});
	};	
var queueMgm = function(clusterCode,clusterName) {
		Xfinity.Util.post('jsp/myXfinity/publishResource/queueMgm.jsp', {clusterCode:clusterCode,clusterName:clusterName});
	};
var addHostUser = function(clusterCode,clusterName) {
		Xfinity.Util.post('jsp/myXfinity/publishResource/addHostUser.jsp', {clusterCode:clusterCode,clusterName:clusterName});
	};
//http://www.tuicool.com/articles/RNNZFf
var filePath = "";
	var uploadAppPic = function() { 
		var f = $("#file").val();
		if(!f){
			$("#msgInfo").html("<b>提示：</b>请选择图片!").show(300).delay(3000).hide(1000); 
			return false;
		}
	    $.ajaxFileUpload({  
	        url : 'uploadAppPic.action',  
	        secureuri : false,  
	        fileElementId : 'file',  
	        dataType : 'json',         
		    success : function(data, status) {
		    	filePath = data.filePath;
		        $("#resPic").attr("src","admin/readImage.do?path=" + filePath);
		        $("#savePicBtn").show();
		    }
	    });  
	}  
$(function(){
	var setHead = function(){
		$('#_head').find('.active').removeClass('active');
		$('#_myXfinity').addClass("active");
	};
	var setClusterSelectOption = function(clusterList){
		var select = $("#cluster").get(0);
		$.each( clusterList, function(index, content){
			select.options.add(new Option(content.name,content.clusterCode));
		});
	};
	var initClusterSelect = function(){
		jQuery.ajax({ 
				url: "listAvaClusterByPublisher.action",
				async: false,
				type: "POST",
				data:{start:"0",size:"10000"},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
//					$("#msgInfo").html("<b>提示：</b>获取列表失败!原因："+exception).show(300).delay(3000).hide(1000); 
					return false;
				}else{
					clusterList = c.responseJSON.clusterlist;
					setClusterSelectOption(clusterList);
				}},
				error:function(){
//					$("#msgInfo").html("<b>提示：</b>获取列表失败!").show(300).delay(3000).hide(1000); 
					return false;
				}
			});
	};
	
	var setQueueSelectOption = function(queueList){
		$("#queue").empty();
		var select = $("#queue").get(0);
		$.each( queueList, function(index, content){
			select.options.add(new Option(content.name,content.queueCode));
		});
	};
	var initQueueSelect = function(){
		var clusterCode = $("#cluster").val();
		jQuery.ajax({ 
				url: "listAvaQueueByClusterCode.action",
				async: false,
				type: "POST",
				data:{start:"0",size:"10000",clusterCode:clusterCode},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
//					$("#msgInfo").html("<b>提示：</b>获取列表失败!原因："+exception).show(300).delay(3000).hide(1000); 
					return false;
				}else{
					queueList = c.responseJSON.queueList;
					setQueueSelectOption(queueList);
				}},
				error:function(){
//					$("#msgInfo").html("<b>提示：</b>获取列表失败!").show(300).delay(3000).hide(1000); 
					return false;
				}
			});
	};
	
	var setSoftwareSelectOption = function(softwareList){
		var select = $("#software").get(0);
		$.each( softwareList, function(index, content){
			select.options.add(new Option(content.name,content.softwareCode));
		});
	};
	var initSoftwareSelect = function(){
		jQuery.ajax({ 
				url: "listAvaSoftware.action",
				async: false,
				type: "POST",
				data:{start:"0",size:"10000"},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
//					$("#msgInfo").html("<b>提示：</b>获取列表失败!原因："+exception).show(300).delay(3000).hide(1000); 
					return false;
				}else{
					softwareList = c.responseJSON.softwareList;
					setSoftwareSelectOption(softwareList);
				}},
				error:function(){
//					$("#msgInfo").html("<b>提示：</b>获取列表失败!").show(300).delay(3000).hide(1000); 
					return false;
				}
			});
	};
	
	var setSupportSelectOption = function(userList){
		var select = $("#support").get(0);
		$.each( userList, function(index, content){
			select.options.add(new Option(content.name,content.userCode));
		});
	};
	var initSupportSelect = function(){
		jQuery.ajax({ 
				url: "avaUserInfoListByGroupCode.action",
				async: false,
				type: "POST",
				data:{start:"0",size:"10000"},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
//					$("#msgInfo").html("<b>提示：</b>获取列表失败!原因："+exception).show(300).delay(3000).hide(1000); 
					return false;
				}else{
					userList = c.responseJSON.userList;
					setSupportSelectOption(userList);
				}},
				error:function(){
//					$("#msgInfo").html("<b>提示：</b>获取列表失败!").show(300).delay(3000).hide(1000); 
					return false;
				}
			});
	};
	
	var getBaseInfo = function(){
		var name = $("#name").val();
		var clusterCode = $("#cluster").val();
		var queueCode = $("#queue").val();
		var softwareCode = $("#software").val();
		var supportCode = $("#support").val();
		var number = $("#hostUserNum").val();
		var storageSize = $("#space").val();
		var fee = $("#fee").val();
		var type = $("#type").val();
		var endDate = $("#endDate").val();
		if(!name || !$.trim(name)){
			$("#msgInfo").html("<b>提示：</b>软件名不能为空!").show(300).delay(3000).hide(1000); 
			$('#name').focus();
			return false;
		}
		if(!number || number<0){
			$("#msgInfo").html("<b>提示：</b>数量必须大于0!").show(300).delay(3000).hide(1000); 
			$('#number').focus();
			return false;
		}
		if(!storageSize || storageSize<0){
			$("#msgInfo").html("<b>提示：</b>存储必须大于0!").show(300).delay(3000).hide(1000); 
			$('#storageSize').focus();
			return false;
		}
		if(!fee || fee<0){
			$("#msgInfo").html("<b>提示：</b>基本费用必须大于0!").show(300).delay(3000).hide(1000); 
			$('#fee').focus();
			return false;
		}
		if(!endDate){
			$("#msgInfo").html("<b>提示：</b>到期时间不能为空!").show(300).delay(3000).hide(1000); 
			$('#endDate').focus();
			return false;
		}
		var endTime = new Date(endDate.replace(/-/gm,'/'));
		var now = new Date();
		if(endTime < now){
			$("#msgInfo").html("<b>提示：</b>到期时间应大于当前日期!").show(300).delay(3000).hide(1000); 
			$("#endDate").focus();
			return false;
		}
		var baseInfo = {
			configCode:configCode,
			name:name,
			clusterCode:clusterCode,
			queueCode:queueCode,
			softwareCode:softwareCode,
			supportCode:supportCode,
			number:number,
			storageSize:storageSize,
			type:type,
			fee:fee,
			endDate:endDate
		}
		return baseInfo;
	};
	
	var savebaseInfo = function(){
		var data = getBaseInfo();
		jQuery.ajax({ 
				url: "saveAppBaseInfo.action",
				type: "POST",
				data:data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					$("#msgInfo").html("<b>提示：</b>保存失败!原因："+exception).show(300).delay(3000).hide(1000); 
					return false;
				}else{
					$("#msgInfo").html("<b>提示：</b>保存成功!").show(300).delay(3000).hide(1000); 
					undistrHostUserNumber();
					baseFormReadOnly();
					btnHide();
				}},
				error:function(){
					$("#msgInfo").html("<b>提示：</b>保存失败!").show(300).delay(3000).hide(1000); 
					return false;
				}
			});
	};
	var saveOutLineAndDes = function(){
		var outline = $("#outline").val();
		var description = $("#description").val();
		jQuery.ajax({ 
				url: "saveOutLineAndDes.action",
				type: "POST",
				data:{configCode:configCode,outline:outline,description:description},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					$("#msgInfo").html("<b>提示：</b>保存失败!原因："+exception).show(300).delay(3000).hide(1000); 
					return false;
				}else{
					$("#msgInfo").html("<b>提示：</b>保存成功!").show(300).delay(3000).hide(1000); 
					 $('#desSaveAndCancelBtn').hide();
					 desFormReadOnly();
				}},
				error:function(){
					$("#msgInfo").html("<b>提示：</b>保存失败!").show(300).delay(3000).hide(1000); 
					return false;
				}
			});
	}
	
	var saveAppPic = function() { 
		if(!filePath){
			$("#msgInfo").html("<b>提示：</b>请上传图片!").show(300).delay(3000).hide(1000); 
			return false;
		}
	    jQuery.ajax({ 
				url: "saveAppPic.action",
				type: "POST",
				data:{configCode:configCode,filePath:filePath},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
						$("#msgInfo").html("<b>提示：</b>保存失败!原因："+exception).show(300).delay(3000).hide(1000); 
						return false;
					}else{
						$("#msgInfo").html("<b>提示：</b>保存成功!").show(300).delay(3000).hide(1000); 
						$("#savePicBtn").hide();
					}},
				error:function(){
					$("#msgInfo").html("<b>提示：</b>保存失败!").show(300).delay(3000).hide(1000); 
					return false;
				}
			});
	};
	var savePrice = function(){
		var coreNum = $("#coreNum").val();
		var priceType = $("#priceType").val();
		var price = $("#price").val();
		var sumSale = $("#sumSale").val();
		var data = {
			configCode:configCode,
			coreNum:coreNum,
			priceType:priceType,
			price:price,
			sumSale:sumSale
		}
		jQuery.ajax({ 
				url: "savePrice.action",
				type: "POST",
				data:data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
						$("#addPriceMsgInfo").html("<b>提示：</b>保存失败!原因："+exception).show(300).delay(3000).hide(1000); 
						return false;
					}else{
						$("#msgInfo").html("<b>提示：</b>保存成功!").show(300).delay(3000).hide(1000); 
						$('#addPriceModal').modal('hide');
						initTable();
					}},
				error:function(){
					$("#addPriceMsgInfo").html("<b>提示：</b>保存失败!").show(300).delay(3000).hide(1000); 
					return false;
				}
			});
	}
	
	var initTable = function(){
		var firstTr = $("#row").clone(true);
		$("#table-body").find("tr").remove();
		firstTr.appendTo("#table-body");
		jQuery.ajax({ 
			url: "listPrice.action",
			data:{configCode:configCode},
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				$("#msgInfo").html("<b>提示：</b>获取价格列表失败!原因："+exception).show(300).delay(3000).hide(1000); 
				return false;
			}else{
				priceList = c.responseJSON.priceList;
				addRow(priceList);
			}},
			error:function(){
				$("#msgInfo").html("<b>提示：</b>获取价格列表失败!").show(300).delay(3000).hide(1000); 
				return false;
			}
		});
	};
	var addRow = function(list){
		var firstTr = $("#row");
		$.each( list, function(index, content){
			var newRow = firstTr.clone(true).attr("id", content.priceCode);
			newRow.find("input[id='checkbox1']").attr("id",content.priceCode).attr("name",'checkbox');
			newRow.find("span[id='t_coreNum']").attr("id","coreNum"+index).html(content.coreNum);;
			newRow.find("span[id='t_price']").attr("id","price"+index).html(content.price);
			newRow.find("span[id='t_sumSale']").attr("id","sumSale"+index).html(content.sumSale);
			
			var typeE = newRow.find("span[id='t_type']");
			var type = content.type;
			var newStr = '';
			if(type == 1){
				newStr = "包月";
			}else if(type == 2){
				newStr = "核小时"
			}
			typeE.attr("id","type"+index).html(newStr);
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
	var deletePriceList = function(){
		var codeList = getCheckedCodeList();
		if(!codeList || $.trim(codeList) == ""){
			$("#msgInfo").html("<b>提示：</b>没有勾选任何记录！").show(300).delay(3000).hide(1000); 
			return false;
		}
		jQuery.ajax({ 
			url: "deletePriceList.action",
			data:{codeList:codeList},
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				$("#msgInfo").html("<b>提示：</b>删除列表失败!原因："+exception).show(300).delay(3000).hide(1000); 
				return false;
			}else{
				initTable();
				$("#msgInfo").html("<b>提示：</b>删除成功!").show(300).delay(3000).hide(1000); 
			}},
			error:function(){
				$("#msgInfo").html("<b>提示：</b>删除列表失败!").show(300).delay(3000).hide(1000); 
				return false;
			}
		});
	};
	var setResourceInfo = function(computeResourceConfig){
		$("#name").val(computeResourceConfig.name);
		$("#cluster").val(computeResourceConfig.clusterCode);
		$("#queue").val(computeResourceConfig.queueCode);
		$("#software").val(computeResourceConfig.softwareCode);
		$("#support").val(computeResourceConfig.supportCode);
		number = computeResourceConfig.number;
		$("#hostUserNum").val(number);
		$("#space").val(computeResourceConfig.storageSize);
		$("#type").val(computeResourceConfig.type);
		$("#endDate").val(computeResourceConfig.endDate.replace("T"," "));
		$("#outline").val(computeResourceConfig.outline);
		$("#description").val(computeResourceConfig.description);
		$("#fee").val(computeResourceConfig.fee);
		$("#resPic").attr("src",'resourcePicByCode.do?configCode='+configCode);
	};
	var setBaseFormInfo = function(computeResourceConfig){
		$("#name").val(computeResourceConfig.name);
		$("#cluster").val(computeResourceConfig.clusterCode);
		$("#queue").val(computeResourceConfig.queueCode);
		$("#software").val(computeResourceConfig.softwareCode);
		$("#support").val(computeResourceConfig.supportCode);
		$("#hostUserNum").val(computeResourceConfig.number);
		$("#space").val(computeResourceConfig.storageSize);
		$("#type").val(computeResourceConfig.type);
		$("#endDate").val(computeResourceConfig.endDate.replace("T"," "));
	};
	var setDesFormInfo = function(computeResourceConfig){
		$("#outline").val(computeResourceConfig.outline);
		$("#description").val(computeResourceConfig.description);
	};
	var getResourceInfo = function(){
		jQuery.ajax({ 
			url: "resourceInfoByCode.action",
			data:{configCode:configCode},
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				$("#msgInfo").html("<b>提示：</b>获取信息失败!原因："+exception).show(300).delay(3000).hide(1000); 
				return false;
			}else{
				computeResourceConfig = c.responseJSON.computeResourceConfig;
				setResourceInfo(computeResourceConfig);
			}},
			error:function(){
				$("#msgInfo").html("<b>提示：</b>获取信息失败!").show(300).delay(3000).hide(1000); 
				return false;
			}
		});
	};
	var setEdit = function(_this,btnID1,btnID2){
		$(_this).removeAttr("readOnly");
		if(btnID1){
			$("#"+btnID1).show();
		}
		if(btnID2){
			$("#"+btnID2).show();
		}
	};
	var btnHide = function(){
		$("#nameBtn").hide();
	    $("#clusterBtn").hide();
	    $("#queueBtn").hide();
	    $("#supportBtn").hide();
	    $("#softwareBtn").hide();
	    $("#hostUserNumBtn").hide();
	    $("#baseSaveAndCancelBtn").hide();
	};
	var baseFormReadOnly = function(){
		$("#baseForm").find($("input")).attr("readOnly",true);
		$("#baseForm").find($("select")).attr("readOnly",true);
	};
	var desFormReadOnly = function(){
		$("#desForm").find($("textarea")).attr("readOnly",true);
	}
	var setUndistrHostUserNumber = function(undistrHostUserNumber){
		$("#undistrHostUserNumber").html(undistrHostUserNumber);
//		$("#hostUserNum").val(undistrHostUserNumber);
	};
	var undistrHostUserNumber = function(){
		var clusterCode = $("#cluster").val();
		jQuery.ajax({ 
			url: "undistrHostUserNumber.action",
			data:{clusterCode:clusterCode},
			type:"POST",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
			}else{
				var undistrHostUserNumber = c.responseJSON.undistrHostUserNumber;
				setUndistrHostUserNumber(undistrHostUserNumber);
			}},
			error:function(){
			}
		});
	};
    //------------------------------
    var clusterList = "";
    var queueList = "";
    var softwareList= "";
    var userList = "";
    
    var priceList = "";
    var count = 0;
    var computeResourceConfig = "";
    var number = 0;
    setHead();
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
    initClusterSelect();
    initQueueSelect();
    initSupportSelect();
    initSoftwareSelect();
    initTable();
    getResourceInfo();
    btnHide();
    undistrHostUserNumber();
    $('#desSaveAndCancelBtn').hide();
    $('#savePicBtn').hide();
    
    $("#name").dblclick(function(){
    	setEdit(this,null,"baseSaveAndCancelBtn");
    });
	$("#cluster").dblclick(function(){
		var id = $(this).attr("id");
    	setEdit(this,id+"Btn","baseSaveAndCancelBtn");
    });
	$("#queue").dblclick(function(){
		var id = $(this).attr("id");
    	setEdit(this,id+"Btn","baseSaveAndCancelBtn");
    });
	$("#software").dblclick(function(){
		var id = $(this).attr("id");
    	setEdit(this,id+"Btn","baseSaveAndCancelBtn");
    });
	$("#support").dblclick(function(){
		var id = $(this).attr("id");
    	setEdit(this,id+"Btn","baseSaveAndCancelBtn");
    });
	$("#hostUserNum").dblclick(function(){
		var id = $(this).attr("id");
    	setEdit(this,id+"Btn","baseSaveAndCancelBtn");
    });
	$("#space").dblclick(function(){
    	setEdit(this,null,"baseSaveAndCancelBtn");
    });
	$("#type").dblclick(function(){
    	setEdit(this,null,"baseSaveAndCancelBtn");
    });
	$("#endDate").dblclick(function(){
    	$("#baseSaveAndCancelBtn").show();
    });
	$("#outline").dblclick(function(){
    	setEdit(this,null,"desSaveAndCancelBtn");
    });
	$("#description").dblclick(function(){
    	setEdit(this,null,"desSaveAndCancelBtn");
    });
    
    
    
    $('#cluster').change(function(){
    	initQueueSelect();
    	undisHostUserNumber();
    });
    $("#queueMgm").click(function(){
    	var clusterCode = $("#cluster").val();
    	var clusterName = $("#cluster").find("option:selected").text();
    	queueMgm(clusterCode,clusterName);
    });
    $("#hostUserMgm").click(function(){
    	var clusterCode = $("#cluster").val();
    	var clusterName = $("#cluster").find("option:selected").text();
		hostUserMgm(clusterCode,clusterName);
	});
    $('#saveBaseInfo').click(function(){
    	savebaseInfo();
    });
    $('#cancelBaseInfoEdit').click(function(){
    	setBaseFormInfo(computeResourceConfig);
    	btnHide();
    	baseFormReadOnly();
    	
    });
    $('#saveOutLineAndDes').click(function(){
    	saveOutLineAndDes();
    });
    $('#cancelDesInfoEdit').click(function(){
    	setDesFormInfo(computeResourceConfig);
    	$('#desSaveAndCancelBtn').hide();
    	desFormReadOnly();
    });
   
    $('#saveAppPic').click(function(){
    	saveAppPic();
    });
    $('#addPrice').click(function(){
    	$('#addPriceModal').modal('show');
    });
    $("#savePrice").click(function(){
        savePrice();
    });
     $("#deletePriceList").click(function(){
        deletePriceList();
    });
    $("#allCheckbox").click(function() {
	 	var checkbox =$("[name='checkbox']");
		if($("#allCheckbox").is(':checked')){
			checkbox.prop("checked",true);
		}else{
			checkbox.prop("checked",false);
		}
	 });
	 
	 
	 $("#baseInfo").click(function(){
	 	$("#ul").find('.active').removeClass('active');
		$(this).addClass('active');
		$("#descriptionInfoPanel").removeClass('active');
		$("#baseInfoPanel").addClass('active');
		$("#priceInfoPanel").removeClass('active');
		$("#picInfoPanel").removeClass('active');
	 });
	 $("#picInfo").click(function(){
	 	$("#ul").find('.active').removeClass('active');
		$(this).addClass('active');
		$("#picInfoPanel").addClass('active');
		$("#descriptionInfoPanel").removeClass('active');
		$("#baseInfoPanel").removeClass('active');
		$("#priceInfoPanel").removeClass('active');
	 });
	  $("#descriptionInfo").click(function(){
	 	$("#ul").find('.active').removeClass('active');
		$(this).addClass('active');
		$("#descriptionInfoPanel").addClass('active');
		$("#baseInfoPanel").removeClass('active');
		$("#priceInfoPanel").removeClass('active');
		$("#picInfoPanel").removeClass('active');
	 });
	  $("#priceInfo").click(function(){
	 	$("#ul").find('.active').removeClass('active');
		$(this).addClass('active');
		$("#descriptionInfoPanel").removeClass('active');
		$("#baseInfoPanel").removeClass('active');
		$("#priceInfoPanel").addClass('active');
		$("#picInfoPanel").removeClass('active');
	 });
	 $("#hostUserNum").blur(function(){
		  var maxNum = parseInt($("#undistrHostUserNumber").text()) + number;
		  var hostUserNum = $("#hostUserNum").val();
		  if(hostUserNum > maxNum  || hostUserNum < 1){
		  	 $("#hostUserNum").val(maxNum);
		  	 $("#msgInfo").html("<b>提示：</b>数量填写有误!").show(300).delay(3000).hide(1000); 
		  }
	 });
	 $("#addHostUser").click(function(){
	 	var clusterCode = $("#cluster").val();
    	var clusterName = $("#cluster").find("option:selected").text();
	 	addHostUser(clusterCode,clusterName);
	 });
})