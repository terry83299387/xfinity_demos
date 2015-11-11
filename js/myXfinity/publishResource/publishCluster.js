
	var clusterCode = "";
	var selfHostUserCode = "";
	var testHostUserCode = "";
	var priceCode = "";
	var saveFeeAndStorage = false; // a flag about saving success yes or not
	var modifyPriceValidator;
	var addPriceValidator;
//1.function
	var hostUserMgm = function(clusterCode,clusterName) {
		Xfinity.Util.post('jsp/myXfinity/publishResource/hostUserMgm.jsp', {clusterCode:clusterCode,clusterName:clusterName});
	};	
	var queueMgm = function(clusterCode,clusterName) {
		Xfinity.Util.post('jsp/myXfinity/publishResource/queueMgm.jsp', {clusterCode:clusterCode,clusterName:clusterName});
	};	
	var hostUserType = {
		"self":2,
		"test":3
	};
	var setHead = function(){
		$('#_head').find('.active').removeClass('active');
		$('#_myXfinity').addClass("active");
	};
	var filePath = "";
	var uploadPic = function(target) { 
		var f = $("#file").val();
		if(!f){
			Xfinity.message.popup("请选择图片！");
			return false;
		}
		var extension =/\.[^\.]+/.exec(f);
		if(extension[0].toLowerCase() != ".jpg" && extension[0].toLowerCase() != ".png" && extension[0].toLowerCase() != ".jpg" && extension[0].toLowerCase() != ".bmp"){
			Xfinity.message.alert("图片格式不正确！仅支持jpg、png、bmp格式图片！");
			return false;
		}
		var isIE = /msie/i.test(navigator.userAgent) && !window.opera; 
		var fileSize = 0;
		if (isIE && !target.files) {      
              var fileSystem = new ActiveXObject("Scripting.FileSystemObject");  
              var file = fileSystem.GetFile (f);  
              fileSize = file.Size;     
        } else {     
              fileSize = target.files[0].size;   
        }    
        var size = fileSize / (1024*1024); 
		if(size > 2){
			Xfinity.message.popup("图片大小不能超过2M！");
			$("#file").val("");
			return false;
		}else if(size < 0){
			Xfinity.message.popup("图片文件大小为0B！请重新选择");
			$("#file").val("");
			return false;
		}
	    $.ajaxFileUpload({  
	        url : 'uploadPic.action',  
	        secureuri : false,  
	        fileElementId : 'file',  
	        dataType : 'json',         
		    success : function(data, status) {
		    	filePath = data.filePath;
		        $("#pic").attr("src","admin/readImage.do?path=" + filePath);
		        
		    }
	    });  
	} ;
	var saveClusterPic = function() { 
		if(!clusterCode){
			Xfinity.message.popup("请先填写，并保存基本信息!");
			return false;
		}
		if(!filePath){
			Xfinity.message.popup("请先选择图片!");
			return false;
		}
	    jQuery.ajax({ 
				url: "saveClusterPic.action",
				type: "POST",
				data:{clusterCode:clusterCode,filePath:filePath},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
						Xfinity.message.alert("保存图片失败!原因:"+exception);
					}else{
						$("#savePicSuccess").removeClass("hide");
					}},
				error:function(){
					Xfinity.message.alert("保存失败！");
				}
			});
	};
	var setSupportSelect = function(userList){
			var select = $("#tecSupporter").get(0);
			$.each( userList, function(index, content){
				select.options.add(new Option(content.name,content.userCode));
			});
			$("#tecSupporter").val(currentUserCode);
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
					}else{
						userList = c.responseJSON.userList;
						setSupportSelect(userList);
					}},
					error:function(){
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
		var networkType = $("#networkType").val();
		var openCmd = $("#openCmd").val();
		var tecSupporterCode = $("#tecSupporter").val();
		var connectionInfo = {
			name:name,
			webServiceProtocol:webServiceProtocol,
			clusterIP:clusterIP,
			clusterPort:clusterPort,
			cmdProtocol:cmdProtocol,
			cmdIP:cmdIP,
			networkType:networkType,
			cmdPort:cmdPort,
			fileTransferProtocol:fileTransferProtocol,
			fileTransferPort:fileTransferPort,
			fileManageProtocol:fileManageProtocol,
			fileManagePort:fileManagePort,
			endDate:endDate,
			clusterType:clusterType,
			openCmd:openCmd,
			tecSupporterCode:tecSupporterCode
		}
		return connectionInfo;
	}
	var saveConnectionInfo = function(){
		if(!$("#connectionForm").valid()){
			return false;
		}
		var connectionInfo = getConnectionInfoValue();
		jQuery.ajax({ 
				url: "addClusterConnectInfo.action",
				async: false,
				type: "POST",
				data:connectionInfo,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					Xfinity.message.alert("保存失败!原因："+exception);
				}else{
					clusterCode = c.responseJSON.clusterCode;
					setActive(2);
				}},
				error:function(){
					Xfinity.message.alert("保存失败!");
				}
			});
	}
	var connectionFormValidate = function(){
		$("#connectionForm").validate({
			rules: {
		   		name:{
			   		required:true,
			   		stringNotNull:true,
			   		stringCheck2:true,
			   		remote: {
		                  type: "post",
		                  url: "checkClusterNameUnique.action",
		                  data: {
		                       clusterName: function() {
		                           return $("#name").val();
		                       }
		                   },
		                   dataType: "json",
		                   dataFilter: function(a,b) {
		                    	var res = JSON.parse(a);
		                    	return res.clusterNameUnique;
		                    }
		             }
		   		},
		   		clusterIP:{
		   			required:true,
			   		ip:true
		   		},
		   		cmdIP:{
		   			required:true,
			   		ip:true
		   		},
		   		clusterPort:{
		   			required:true,
		   			digits:true,
		   			range:[0,65536]
		   		},
		   		cmdPort:{
		   			required:true,
		   			digits:true,
		   			range:[0,65536]
		   		},
		   		fileTransferPort:{
		   			required:true,
		   			digits:true,
		   			range:[0,65536]
		   		},
		   		fileManagePort:{
		   			required:true,
		   			digits:true,
		   			range:[0,65536]
		   		},
		   		endDate:{
		   			dateAfterNow:true
		   		}		   	
			},
			messages:{
				name:{
			   		remote:"集群已存在",
			   		required:"只能包括中文字、英文字母、数字和下划线",
			   		stringNotNull:"只能包括中文字、英文字母、数字和下划线",
			   		stringCheck2:"只能包括中文字、英文字母、数字和下划线"
				},
				clusterIP:"IP地址格式错误",
				cmdIP:"IP地址格式错误",
				clusterPort:"只能输入范围在0~65535之间的数字",
				cmdPort:"只能输入范围在0~65535之间的数字",
				fileTransferPort:"只能输入范围在0~65535之间的数字",
				fileManagePort:"只能输入范围在0~65535之间的数字"
			},
			errorPlacement : function(error, element) { 
				error.appendTo(element.parent().parent())
			}
		})
	};
	var descriptionFormValidate = function(){
		$("#descriptionForm").validate({
			rules: {
		   		calculationPeak:{
			   		number:true,
			   		min:0
		   		},
		   		linpack:{
			   		number:true,
			   		min:0
		   		},
		   		memorySize:{
			   		number:true,
			   		min:0
		   		},
		   		diskSize:{
		   			number:true,
			   		min:0
		   		}
			},
			errorPlacement : function(error, element) { 
				error.appendTo(element.parent().parent())
			}
		})
	};
	var getDescriptionInfoValue = function(){
		var city = $("#city").val();
		var applicationArea = $("#applicationArea").val();
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
		var data = {
			city:city,
			calculationPeak:calculationPeak,
			applicationArea:applicationArea,
			openCmd:openCmd,
			clusterCode:clusterCode,
			description:description,
			memorySize:memorySize,
			linpack:linpack,
			diskSize:diskSize,
			interconnect:interconnect,
			os:os,
			jobScheduleSys:jobScheduleSys,
			computeNodeDes:computeNodeDes,
			accessNodeDes:accessNodeDes,
			processor:processor,
			applicationArea:applicationArea
		}
		return data;
	}
	var saveDescriptionInfo = function(){
		if(!$("#descriptionForm").valid()){
			return false;
		}
		var data = getDescriptionInfoValue();
		jQuery.ajax({ 
				url: "saveClusterDescriptionInfo.action",
//				async: false,
				type: "POST",
				data:data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					Xfinity.message.alert("保存失败!原因："+exception);
				}else{
					setActive(3);
				}},
				error:function(){
					Xfinity.message.alert("保存失败!");
				}
			});
	};
	var setActive = function(step){
		$("#ul").find('.active').removeClass('active');
		$("#li").find('.active').removeClass('active');
		$("#connectInfoPanel").removeClass('active');
		$("#descriptionInfoPanel").removeClass('active');
		$("#hostUserInfoPanel").removeClass('active');
		$("#queueInfoPanel").removeClass('active');
		$("#sellInfoPanel").removeClass('active');
		$("#cooperationInfoPanel").removeClass('active');
		
		switch(step){
			case 1:
				$("#connectInfo").addClass('active');
				$("#connectInfoPanel").addClass('active');
				break;
			case 2:
				$("#descriptionInfo").addClass('active');
				$("#descriptionInfoPanel").addClass('active');
				break;
			case 3:
				$("#hostUserInfo").addClass('active');
				$("#hostUserInfoPanel").addClass('active');
				break;
			case 4:
				$("#queueInfo").addClass('active');
				$("#queueInfoPanel").addClass('active');
				break;
			case 5:
				$("#sellInfo").addClass('active');
				$("#sellInfoPanel").addClass('active');
				break;
			case 6:
				$("#cooperationInfo").addClass('active');
				$("#cooperationInfoPanel").addClass('active');
				break;
		}
	};
	
	var initEndDateTimePicker = function(){
		$('#endDate').datetimepicker({
		    yearOffset: 0,
		    lang: 'ch',
		    timepicker: false,
		    format: 'Y-m-d',
		    formatDate: 'Y-m-d',
		    allowBlank:true
		});
	};
	var initPage = function(){
		setHead();
		$("#queueSet").hide();
		$("#storageSet").hide();
		$("#queueUp").hide();
		$("#storageUp").hide();
		$("#connectionInfoNext").hide();
		initSupportSelect();
		initEndDateTimePicker();
		$('.input-group-addon').attr("style","width:150px");
		$('.form-control').attr("style","width:180px");
		$('[name="comperation"]').attr("style","width:680px");
		
		$('#description').attr("style","width:680px");
//		$('#descriptionLabel').attr("style","width:250px");
		connectionFormValidate();
		descriptionFormValidate();
		selfHostFormValidate();
		testHostFormValidate();
		sellFormValidate();
		addPriceFormValidate();
		modifyPriceFormValidate();
	};
	var getCooperationValue = function(){
		var cooperation = 2; 
		var softwareDemand = "";
		var otherDemand = "";
		var ourPromise = "";
		if($('input:radio[name="cooperationRadio"]:checked').attr("id") == "cooperationYes"){
			cooperation = 1;
			softwareDemand = $("#softwareDemand").val();
			otherDemand = $("#otherDemand").val();
		    ourPromise = $("#ourPromise").val();
		}
		var data = {
			clusterCode:clusterCode,
			cooperation:cooperation,
			softwareDemand:softwareDemand,
			otherDemand:otherDemand,
			ourPromise:ourPromise
		}
		return data;
	};
	var saveClusterCooperation = function(){
		var data = getCooperationValue();
		jQuery.ajax({ 
				url: "saveClusterCooperation.action",
				type: "POST",
				data:data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					Xfinity.message.alert("保存失败!原因："+exception); 
				}else{
					Xfinity.Util.post('jsp/myXfinity/resourceMgm/resourceMgm.jsp');
				}},
				error:function(){
					Xfinity.message.alert("保存失败!");
				}
			});
	};
	
	var getHostUserValue = function(type){
		var hostUserCode = "";
		var typeInt = hostUserType[type];
		if(type == "self"){
			if(!$("#selfHostForm").valid()){
				return false;
			}
			hostUserCode = selfHostUserCode;
		}else if(type = "test"){
			if(!$("#testHostForm").valid()){
				return false;
			}
			hostUserCode = testHostUserCode;
		}
		type ="#"+type+"HostUser";
		var name = $(type+"Name").val();
		var pwd = $(type+"Pwd").val();
		var workDir = $(type+"WorkDir").val();
		var maxSlots = $(type+"MaxSlots").val();
		var data = {
			hostUserCode:hostUserCode,
			name:name,
			pwd:pwd,
			workDir:workDir,
			maxSlots:maxSlots,
			clusterCode:clusterCode,
			type:typeInt
		};
		return data;
	};
	var selfHostFormValidate = function(){
		$("#selfHostForm").validate({
			rules: {
		   		selfHostUserName:{
			   		required:true,
			   		stringNotNull:true,
			   		userNameCheck:true,
			   		remote: {
		                  type: "post",
		                  url: "checkHostUserNameUnique.action",
		                  data: {
		                       hostUserName: function() {
		                           return $("#selfHostUserName").val();
		                       },
		                       clusterCode:function(){
		                       		return clusterCode;
		                       }
		                   },
		                   dataType: "json",
		                   dataFilter: function(a,b) {
		                    	var res = JSON.parse(a);
		                    	return res.hostUserNameUnique;
		                    }
		             }
		   		},
		   		selfHostUserPwd:{
			   		required:true,
			   		stringNotNull:true
		   		},
		   		selfHostUserWorkDir:{
			   		required:true,
			   		stringNotNull:true
		   		},
		   		selfHostUserMaxSlots:{
		   			digits:true,
		   			min:0
		   		}
			},
			messages:{
				selfHostUserName:{
					remote:"账号已存在"
				},
				selfHostUserMaxSlots:"只能输入不小于0的整数"
			},
			errorPlacement : function(error, element) { 
				error.appendTo(element.parent().parent())
			}
		})
	};
	var testHostFormValidate = function(){
		$("#testHostForm").validate({
			rules: {
		   		testHostUserName:{
			   		required:true,
			   		stringNotNull:true,
			   		userNameCheck:true,
			   		remote: {
		                  type: "post",
		                  url: "checkHostUserNameUnique.action",
		                  data: {
		                       hostUserName: function() {
		                           return $("#testHostUserName").val();
		                       },
		                       clusterCode:function(){
		                       		return clusterCode;
		                       }
		                   },
		                   dataType: "json",
		                   dataFilter: function(a,b) {
		                    	var res = JSON.parse(a);
		                    	return res.hostUserNameUnique;
		                    }
		             }
		   		},
		   		testHostUserPwd:{
			   		required:true,
			   		stringNotNull:true
		   		},
		   		testHostUserWorkDir:{
			   		required:true,
			   		stringNotNull:true
		   		},
		   		testHostUserMaxSlots:{
		   			digits:true,
		   			min:0
		   		}
			},
			messages:{
				testHostUserName:{
					remote:"账号已存在"
				},
				testHostUserMaxSlots:"只能输入不小于0的整数"
			},
			errorPlacement : function(error, element) { 
				error.appendTo(element.parent().parent());
			}
		})
	};
	var sellFormValidate = function(){
		$("#sellForm").validate({
			rules: {
		   		fee:{
		   			required:true,
			   		number:true,
			   		min:0
		   		},
		   		personalStorage:{
		   			required:true,
			   		number:true,
			   		min:0
		   		}
			},
			messages:{
			},
			errorPlacement : function(error, element) { 
				error.appendTo(element.parent().parent());
			}
		})
	};
	var addPriceFormValidate = function(){
		addPriceValidator = $("#addPriceForm").validate({
			rules: {
		   		maxCoreNum:{
		   			required:true,
			   		digits:true,
			   		min:0,
			   		remote: {
		                  type: "post",
		                  url: "checkMaxCoreUnique.action",
		                  async:false,
		                  data: {
		                       maxCoreNum: function() {
		                           return $("#maxCoreNum").val();
		                       },
		                       clusterCode:function(){
		                       		return clusterCode;
		                       }
		                   },
		                   dataType: "json",
		                   dataFilter: function(a,b) {
		                    	var res = JSON.parse(a);
		                    	return res.maxCoreUnique;
		                    }
		             }
		   		},
		   		monthPrice:{
		   			required:true,
			   		number:true,
			   		min:0
		   		},
		   		coreHourPrice:{
		   			required:true,
		   			number:true,
			   		min:0
		   		}
			},
			messages:{
				maxCoreNum:{
					remote:"该核数已添加"
				}
			},
			errorPlacement : function(error, element) { 
				error.appendTo(element.parent().parent());
			}
		})
	};
	var modifyPriceFormValidate = function(){
		modifyPriceValidator = $("#modifyPriceForm").validate({
			rules: {
		   		maxCoreNumM:{
		   			required:true,
			   		digits:true,
			   		min:0,
			   		remote: {
		                  type: "post",
		                  url: "checkMaxCoreUnique.action",
		                  async:false,
		                  data: {
		                       maxCoreNum: function() {
		                           return $("#maxCoreNumM").val();
		                       },
		                       clusterCode:function(){
		                       		return clusterCode;
		                       },
		                       priceCode:function(){
		                       		return priceCode;
		                       }
		                   },
		                   dataType: "json",
		                   dataFilter: function(a,b) {
		                    	var res = JSON.parse(a);
		                    	return res.maxCoreUnique;
		                    }
		             }
		   		},
		   		monthPriceM:{
		   			required:true,
			   		number:true,
			   		min:0
		   		},
		   		coreHourPriceM:{
		   			required:true,
		   			number:true,
			   		min:0
		   		}
			},
			messages:{
				maxCoreNumM:{
					remote:"该核数已添加"
				}
			},
			errorPlacement : function(error, element) { 
				error.appendTo(element.parent().parent());
			}
		})
	};
	var saveHostUser = function(type){
		if(!clusterCode){
			Xfinity.message.popup("请先填写并保存接入信息!");
			return false;
		}
		var data = getHostUserValue(type);
		if(!data){
			return false;
		}
		jQuery.ajax({ 
				url: "saveHostUser.action",
				type: "POST",
				data:data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					Xfinity.message.alert("保存失败!原因："+exception);
				}else{
					Xfinity.message.popup("保存成功!");
					if(type == "self"){
						selfHostUserCode = c.responseJSON.hostUserCode;
						$("#saveSelfHostUserSuccess").removeClass("hide");
					}else if(type = "test"){
						testHostUserCode = c.responseJSON.hostUserCode;
						$("#saveTestHostUserSuccess").removeClass("hide");
					}
				}},
				error:function(){
					Xfinity.message.alert("保存失败!");
				}
			});
	};
	var getFeeAndPersonalStorage = function(){
		if(!clusterCode){
			Xfinity.message.popup("请先填写接入信息并保存!")
			return false;
		}
		if(!$("#sellForm").valid()){
			return false;
		}
		var fee = $("#fee").val();
		var personalStorage = $("#personalStorage").val();
		var data = {
			clusterCode:clusterCode,
			fee:fee,
			personalStorage:personalStorage
		}
		return data;
	};
	var saveFeeAndPersonalStorage = function(){
		var data = getFeeAndPersonalStorage();
		if(!data){
			return false;
		}
		jQuery.ajax({ 
				url: "saveFeeAndPersonalStorage.action",
				type: "POST",
				data:data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					Xfinity.message.alert("保存失败!原因："+exception);
				}else{
					$("#saveFeeAndPersonalStorageSuccess").removeClass("hide");
					saveFeeAndStorage = true;
				}},
				error:function(){
					Xfinity.message.alert("保存失败!");
				}
			});
	};
	var getCorePriceValue = function(addOrModify){
		if(!clusterCode){
			Xfinity.message.popup("请先填写接入信息并保存!")
			return false;
		}
		
		var maxCoreNum = "";
		var monthPrice = "";
		var coreHourPrice = "";
		var type = 2;
		if(addOrModify == "add"){
			if(!$("#addPriceForm").valid()){
				return false;
			}
			maxCoreNum = $("#maxCoreNum").val();
			monthPrice = $("#monthPrice").val();
			coreHourPrice = $("#coreHourPrice").val();
		}else if(addOrModify == "modify"){
			if(!$("#modifyPriceForm").valid()){
				return false;
			}
			maxCoreNum = $("#maxCoreNumM").val();
			monthPrice = $("#monthPriceM").val();
			coreHourPrice = $("#coreHourPriceM").val();
		}
		var data = {
			priceCode:priceCode,
			clusterCode:clusterCode,
			maxCoreNum:maxCoreNum,
			monthPrice:monthPrice,
			coreHourPrice:coreHourPrice,
			type:type
			
		};
		return data;
	};
	var saveCorePrice = function(addOrModify){
		var data = getCorePriceValue(addOrModify);
		if(!data){
			return false;
		}
		jQuery.ajax({ 
				url: "savePrice.action",
				type: "POST",
				data:data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					Xfinity.message.alert("操作失败!原因："+exception);
				}else{
					$("#modifyPriceModal").modal("hide");
					$("#addCorePriceModal").modal("hide");
					Xfinity.message.popup("操作成功!");
					initPricTable();
					
				}},
				error:function(){
					Xfinity.message.alert("操作失败!");
				}
			});
	};
	var setPriceModifyValue = function(maxCoreNum,monthPrice,coreHourPrice){
		$("#maxCoreNumM").val(maxCoreNum);
		$("#monthPriceM").val(monthPrice);
		$("#coreHourPriceM").val(coreHourPrice);2
		
	};
	var addPriceRow = function(priceList){
		var firstTr = $("#priceRow").clone(true);
		$("#price-table-body").find("tr").remove();
		firstTr.appendTo("#price-table-body");
		$.each( priceList, function(index, content){
			var code = content.priceCode;
			var newRow = firstTr.clone(true).attr("id", clusterCode);
			var maxCoreNum = content.coreNum;
			var coreHourPrice = content.coreHourPrice.toFixed(2);
			var monthPrice = content.monthPrice.toFixed(2);
			newRow.find("input[id='checkbox1']").attr("id",code).attr("name",'priceCheckbox');
			newRow.find("span[id='t_maxCoreNum']").attr("id","t_maxCoreNum"+index).html(maxCoreNum);
			newRow.find("span[id='t_monthPrice']").attr("id","t_monthPrice"+index).html(monthPrice);
			newRow.find("span[id='t_coreHourPrice']").attr("id","t_coreHourPrice"+index).html(coreHourPrice);
			var modifyBtn = newRow.find("a[id='t_modifyPrice']").attr("id",code).attr("name",index);
			newRow.appendTo("#price-table-body");
			newRow.removeClass("hide");
			modifyBtn.click(function(){
				modifyPriceValidator.resetForm();
				$("#modifyPriceModal").modal("show");
				priceCode = $(this).attr("id");
				var index = $(this).attr("name");
				setPriceModifyValue($("#"+"t_maxCoreNum"+index).text(),$("#"+"t_monthPrice"+index).text(),$("#"+"t_coreHourPrice"+index).text());
			});
		});
	};
	var initPricTable = function(){
		jQuery.ajax({ 
				url: "listPrice.action",
				type: "POST",
				data:{clusterCode:clusterCode},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
				}else{
					var priceList = c.responseJSON.priceList;
					addPriceRow(priceList);
				}},
				error:function(){
				}
			});
	};
	var getCheckedCodeList = function(){
		var items = $('[name = "priceCheckbox"]:checkbox:checked');
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
			Xfinity.message.popup("没有勾选任何记录！!");
			return false;
		}
		jQuery.ajax({ 
			url: "deletePriceList.action",
			data:{codeList:codeList},
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				Xfinity.message.alert("删除列表失败！原因:"+exception);
			}else{
				initPricTable();
				Xfinity.message.popup("删除列表成功！");
			}},
			error:function(){
				Xfinity.message.alert("删除列表失败！");
			}
		});
	};
	var resetAddPriceModal = function(){
		addPriceValidator.resetForm();
		$("#maxCoreNum").val("");
		$("#monthPrice").val("");
		$("#coreHourPrice").val("");
	}
$(function(){
	
	initPage();
	$("#connectInfo").click(function(){
		setActive(1);
	});
	$("#connectTest").click(function(){
		if(!$("#connectionForm").valid()){
			return false;
		}else{
			Xfinity.message.popup("连接测试通过！");
			$("#connectTest").hide();
			$("#connectionInfoNext").show();
		}
	});
	$("#connectionInfoNext").click(function(){
		saveConnectionInfo();
	});
	
	$("#descriptionInfoLast").click(function(){
		setActive(1);
	});
	$("#descriptionInfoNext").click(function(){
		saveDescriptionInfo();
	});
	
	$("#descriptionInfo").click(function(){
		setActive(2);
	});
	$("#hostUserInfo").click(function(){
		setActive(3);
	});
	$("#queueInfo").click(function(){
		setActive(4);
	});
	$("#sellInfo").click(function(){
		setActive(5);
	});
	$("#cooperationInfo").click(function(){
		setActive(6);
	});
	$("#saveCooperation").click(function(){
		saveClusterCooperation();
	});
	$("#queueLast").click(function(){
		setActive(3);
	});
	$("#queueNext").click(function(){
		setActive(5);
	});
	$("#hostUserLast").click(function(){
		setActive(2);
	});
	$("#hostUserNext").click(function(){
		setActive(4);
	});
	$("#sellInfoLast").click(function(){
		setActive(4);
	});
	$("#sellInfoNext").click(function(){
		if(!saveFeeAndStorage){
			Xfinity.message.popup("请保存价格")
			return false;
		}
		setActive(6);
	});
	$("#complationLast").click(function(){
		setActive(5);
	});
	$("input[name='cooperationRadio']").change(function() { 
		switch($("input[name='cooperationRadio']:checked").attr("id")){
		  case "cooperationNo":
		   		$("#purpose").hide();
		   		break;
		  case "cooperationYes":
		   		$("#purpose").show();
		  		break;
		  default:
		  		break;
		}
	});
	
	$("#saveClusterPic").click(function(){
		saveClusterPic();
	});
	$("#saveSelfHostUser").click(function(){
		saveHostUser("self");
	});
	$("#saveTestHostUser").click(function(){
		saveHostUser("test");
	});
	$("#saveFeeAndPersonalStorage").click(function(){
		saveFeeAndPersonalStorage();
	});
	$("#addCorePrice").click(function(){
		priceCode = "";
		resetAddPriceModal();
		$("#addCorePriceModal").modal('show');
	});
	$("#addPriceModieBtn").click(function(){
		saveCorePrice("add");
	});
	$("#modifyPriceBtn").click(function(){
		saveCorePrice("modify");
	});
	$("#deletePriceList").click(function(){
		deletePriceList();
	});
	$("#queueUp").click(function(){
		$("#queueUp").hide();
		$("#queueDown").show();
		$("#queueSet").hide();
	});
	$("#queueDown").click(function(){
		$("#queueUp").show();
		$("#queueDown").hide();
		$("#queueSet").show();
	});
	$("#storageDown").click(function(){
		$("#storageUp").show();
		$("#storageDown").hide();
		$("#storageSet").show();
	});
	$("#storageUp").click(function(){
		$("#storageUp").hide();
		$("#storageDown").show();
		$("#storageSet").hide();
	});
	$("#allPriceCheckbox").click(function() {
	 	var checkbox =$("[name='priceCheckbox']");
		if($("#allPriceCheckbox").is(':checked')){
			checkbox.prop("checked",true);
		}else{
			checkbox.prop("checked",false);
		}
	 });

})