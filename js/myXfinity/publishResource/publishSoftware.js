	var userList = "";	
	var softwareCode = "";
	var filePath = "";
	var softwareName = "";
	var softwareVersionCode = "";
	var modifyVersionFormValidator;
	var addVersionFormValidator;
	
	var setActive = function(step){
		$("#ul").find('.active').removeClass('active');
		$(".tab-pane").removeClass('active');
		switch(step){
			case 1:
				$("#baseInfo").addClass('active');
				$("#baseInfoPanel").addClass('active');
				break;
			case 2:
				$("#versionInfo").addClass('active');
				$("#versionInfoPanel").addClass('active');
				break;
			case 3:
				$("#picDesInfo").addClass('active');
				$("#picDesInfoPanel").addClass('active');
				break;
			case 4:
				$("#cooperationInfo").addClass('active');
				$("#cooperationInfoPanel").addClass('active');
				break;
		}
	};
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
			return false;
		}else if(size < 0){
			Xfinity.message.popup("图片文件大小为0B！请重新选择");
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
	var initSoftwareCategorySelect = function(){
		var select = $("#softwareCategory").get(0);
		$.each( Xfinity.Constant.SOFTWARE_CATEGORY, function(index, content){
			select.options.add(new Option(content[0],content[1]));
		});
	};
	var initSoftwareTypeSelect = function(){
		var select = $("#softwareType").get(0);
		$.each( Xfinity.Constant.SOFTWARE_TYPE, function(index, content){
			select.options.add(new Option(content[0],content[1]));
		});
	};
	var setSupportSelect = function(userList){
			var select = $("#supporter").get(0);
			$.each( userList, function(index, content){
				select.options.add(new Option(content.name,content.userCode));
			});
			$("#supporter").val(currentUserCode);
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
	var setGuiAddSelect = function(templateDesignList){
			var select = $("#submitGuiAdd").get(0);
			$.each( templateDesignList, function(index, content){
				select.options.add(new Option(content.name,content.templateDesignCode));
			});
		};
	var setGuiModifySelect = function(templateDesignList){
			var select = $("#submitGuiModify").get(0);
			$.each( templateDesignList, function(index, content){
				select.options.add(new Option(content.name,content.templateDesignCode));
			});
		};
	var initGuiSelect = function(){
			jQuery.ajax({ 
					url: "listAllTemplateDesign.action",
					async: false,
					type: "POST",
					contentType: "application/x-www-form-urlencoded; charset=utf-8",
					success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
					}else{
						var templateDesignList = c.responseJSON.templateDesignList;
						setGuiAddSelect(templateDesignList);
						setGuiModifySelect(templateDesignList);
					}},
					error:function(){
					}
				});
		};
	var setSubjectArea = function(subjectAreaList){
		
		$.each(subjectAreaList,function(index,content){
			var subjectAreaCode = content.subjectAreaCode;
			var newSubjectArea = $("#subjectArea").clone(true).removeClass("hide").attr("id","subjectArea"+index);
			newSubjectArea.find("input").attr("name","subjectAreaCheckBox").attr("id",subjectAreaCode);
			newSubjectArea.find("span").html(content.name);
			newSubjectArea.appendTo($("#subjectAreaFormGroup"))
			
		});
	};
	var getSubjectArea = function(){
		jQuery.ajax({ 
					url: "listAllSubjectArea.action",
					async: false,
					type: "POST",
					contentType: "application/x-www-form-urlencoded; charset=utf-8",
					success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
					}else{
						var subjectAreaList = c.responseJSON.subjectAreaList;
						setSubjectArea(subjectAreaList);
					}},
					error:function(){
					}
				});
	};
	var getSubjectAreaCheckedCodeList = function(){
		var items = $('[name = "subjectAreaCheckBox"]:checkbox:checked');
		var codeList = "";
 		$.each( items, function(index, content){
 			if(codeList){
 				codeList +=";"
 			}
 			codeList +=content.id;
 		});
 		return codeList;
	};
	var getbaseInfo = function(){
		if(!$("#baseInfoForm").valid()){
			return false;
		}
		softwareName = $("#softwareName").val();
		var supporterCode = $("#supporter").val();
		var type = $("#softwareType").val();
		var website = $("#website").val();
		var endDate = $("#endDate").val();
		var category = $("#softwareCategory").val();
		var monthPrice = $("#monthPrice").val();
		var coreHourPrice = $("#coreHourPrice").val();
		if(!softwareName){
			Xfinity.message.popup("软件名称不能为空!"); 
			$('#softwareName').focus();
			return false;
		}
		if(endDate){
			var endTime = new Date(endDate.replace(/-/gm,'/'));
			var now = new Date();
			if(endTime < now){
				Xfinity.message.popup("到期时间应大于当前时间!"); 
				$("#endDate").focus();
				return false;
			}
		}
		var subjectAreaCodeList = getSubjectAreaCheckedCodeList();
		if(!subjectAreaCodeList){
			Xfinity.message.popup("必须选择至少一个学科领域!"); 
			return false;
		}
		var baseInfo = {
			softwareCode:softwareCode,
			name:softwareName,
			supporterCode:supporterCode,
			website:website,
			category:category,
			type:type,
			monthPrice:monthPrice,
			coreHourPrice:coreHourPrice,
			subjectAreaCodeList:subjectAreaCodeList,
			endDate:endDate
		}
		return baseInfo;
	};
	var saveBaseInfo = function(){
		var data = getbaseInfo();
		if(!data){
			return false;
		}
		jQuery.ajax({ 
				url: "saveSoftwareBaseInfo.action",
				type: "POST",
				data:data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					Xfinity.message.popup("保存失败！原因："+exception); 
				}else{
					softwareCode = c.responseJSON.softwareCode;
					setActive(2);
//					var defaultOutline = data.name+"-";
//					$("#outline").html(defaultOutline);
				}},
				error:function(){
					Xfinity.message.popup("保存失败！"); 
				}
			});
	};
	var saveSoftwareOutLineAndDes = function(){
		if(!softwareCode){
			Xfinity.message.popup("请先保存基本信息！"); 
			return false;
		}
		var outline = $("#outline").val();
		var description = $("#description").val();
		jQuery.ajax({ 
				url: "saveSoftwareOutLineAndDes.action",
				type: "POST",
				data:{softwareCode:softwareCode,outline:outline,description:description},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					Xfinity.message.popup("保存失败！原因:"+exception); 
					return false;
				}else{
					Xfinity.message.popup("保存成功！"); 
					setActive(4);
				}},
				error:function(){
					Xfinity.message.popup("保存失败！"); 
					return false;
				}
			});
	};
	var saveSoftwarePic = function() { 
		if(!softwareCode){
			Xfinity.message.popup("请先保存基本信息！"); 
			return false;
		}
		if(!filePath){
			Xfinity.message.popup("请先选择图片！"); 
			return false;
		}
		if(!$("#desFormValidate").valid()){
			return false;
		}
	    jQuery.ajax({ 
				url: "saveSoftwarePic.action",
				type: "POST",
				data:{softwareCode:softwareCode,filePath:filePath},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
						Xfinity.message.popup("保存图片失败!原因:"+exception); 
					}else{
						saveSoftwareOutLineAndDes();
						setActive(4);
					}},
				error:function(){
					Xfinity.message.popup("保存图片失败!");  
				}
			});
	};
	var initDateCom = function(){
	    $('#endDate').datetimepicker({
		    yearOffset: 0,
		    lang: 'ch',
		    timepicker: false,
		    format: 'Y-m-d',
		    formatDate: 'Y-m-d',
		    allowBlank:true
		    
		});
	}
	var getCooperationValue = function(){
		var cooperation = 2; 
		var envDemand = "";
		var otherDemand = "";
		var ourPromise = "";
		if($('input:radio[name="cooperationRadio"]:checked').attr("id") == "cooperationYes"){
			cooperation = 1;
			envDemand = $("#envDemand").val();
			otherDemand = $("#otherDemand").val();
		    ourPromise = $("#ourPromise").val();
		}
		var data = {
			softwareCode:softwareCode,
			cooperation:cooperation,
			envDemand:envDemand,
			otherDemand:otherDemand,
			ourPromise:ourPromise
		}
		return data;
	};
	var saveSoftwareCooperation = function(){
		if(!softwareCode){
			Xfinity.message.popup("请先保存基本信息！"); 
			return false;
		}
		var data = getCooperationValue();
		if(!data){
			return false;
		}
		jQuery.ajax({ 
				url: "saveSoftwareCooperation.action",
				type: "POST",
				data:data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					Xfinity.message.popup("保存失败!原因:"+exception); 
				}else{
					Xfinity.Util.post('jsp/myXfinity/resourceMgm/resourceMgm.jsp');
				}},
				error:function(){
					Xfinity.message.popup("保存失败!"); 
				}
			});
	};
	/**
	 * @param {} type. type='Add' or 'Modify'
	 * @return {}
	 */
	var getSoftwareVersionValue = function(type){
		if(!$("#versionForm"+type).valid()){
			return false;
		}
		if(!softwareCode){
			Xfinity.message.popup("请先填写并保存基本信息");
			return false;
		}
		var versionName = $("#versionName"+type).val();
		var versionValue = $("#versionValue"+type).val();
		var licenseNum = $("#licenseNum"+type).val();
		var versionDes = $("#versionDes"+type).val();
		var templateDesignCode = $("#submitGui"+type).val();
		var data = {
			softwareVersionCode:softwareVersionCode,
			softwareCode:softwareCode,
			softwareName:$.trim(softwareName),
			versionName:$.trim(versionName),
			value:$.trim(versionValue),
			licenseNum:0,//def 0
			versionDes:versionDes,
			templateDesignCode:templateDesignCode
		};
		return data;
	}
	var addSoftwareVersion = function(){
		var data = getSoftwareVersionValue("Add");
		if(!data){
			return false;
		}
		jQuery.ajax({ 
				url: "addSoftwareVersion.action",
				type: "POST",
				data:data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					Xfinity.message.popup("保存失败!原因:"+exception); 
				}else{
					initVersionTable();
					$("#addVersionModal").modal("hide");
				}},
				error:function(){
					Xfinity.message.popup("保存失败"); 
				}
			});
	}
	var modifySoftwareVersion = function(){
		var data = getSoftwareVersionValue("Modify");
		if(!data){
			return false;
		}
		jQuery.ajax({ 
				url: "modifySoftwareVersion.action",
				type: "POST",
				data:data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					Xfinity.message.popup("修改版本失败!原因:"+exception); 
				}else{
					initVersionTable();
					$("#modifyVersionModal").modal("hide");
				}},
				error:function(){
					Xfinity.message.popup("修改版本失败！"); 

				}
			});
	}
	var initVersionTable = function(){
		var firstTr = $("#versionRow").clone(true);
		$("#version-table-body").find("tr").remove();
		firstTr.appendTo("#version-table-body");
		jQuery.ajax({ 
			url: "listSoftwareVersion.action",
			data:{softwareCode:softwareCode},
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				Xfinity.message.popup("获取版本失败!原因:"+exception); 

			}else{
				var versionList = c.responseJSON.versionList;
				addRow(versionList);
			}},
			error:function(){
				Xfinity.message.popup("获取版本失败!"); 
			}
		});
	};
	var setModifySoftwareVersion = function(softwareVersion){
		modifyVersionFormValidator.resetForm();
		$("#versionNameModify").val(softwareVersion.versionName);
		$("#versionValueModify").val(softwareVersion.value);
		$("#versionDesModify").val(softwareVersion.description);
		$("#submitGuiModify").val(softwareVersion.templateDesignCode);
	};
	var getSoftwareVersion = function(versionCode){
		jQuery.ajax({ 
			url: "softwareVersionByCode.action",
			data:{softwareVersionCode:versionCode},
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				Xfinity.message.popup("获取版本失败!原因:"+exception); 
			}else{
				var softwareVersion = c.responseJSON.softwareVersion;
				setModifySoftwareVersion(softwareVersion);
			}},
			error:function(){
				Xfinity.message.popup("获取版本失败!"); 
			}
		});
	};
	var addRow = function(list){
		var firstTr = $("#versionRow");
		$.each( list, function(index, content){
			var sfCode = content.softwareVersionCode;
			var newRow = firstTr.clone(true).attr("id",sfCode+index);
			newRow.removeClass('hide');
			newRow.find("input[id='versionCheckbox']").attr("id",sfCode).attr("name",'versionChecbox');
			newRow.find("span[id='versionName']").attr("id","versionName"+index).html(content.versionName);;
			newRow.find("span[id='versionValue']").attr("id","versionValue"+index).html(content.value);
			newRow.find("span[id='submitGui']").attr("id","submitGui"+index).html(content.templateName);
			newRow.find("span[id='versionDes']").attr("id","versionDes"+index).html(content.description);
			var modify = newRow.find("a[id='vsersionCode']").attr("id","vsersionCode"+index).attr("name",sfCode);
			newRow.appendTo("#version-table-body");
			modify.click(function(){
				$("#modifyVersionModal").modal("show");
				softwareVersionCode = $(this).attr("name");
				getSoftwareVersion(softwareVersionCode);
			});
		});
	};
	
	var getVersionCheckedCodeList = function(){
		var items = $('[name = "versionChecbox"]:checkbox:checked');
		var codeList = "";
 		$.each( items, function(index, content){
 			if(codeList){
 				codeList +=";"
 			}
 			codeList +=content.id;
 		});
 		return codeList;
	};
	
	var deleteVersionList = function(){
		var versionCodeList = getVersionCheckedCodeList();
		if(!versionCodeList){
			Xfinity.message.popup("没有选中行!"); 
			return false;
		}
		jQuery.ajax({ 
			url: "deleteSoftwareVersionByCodeList.action",
			data:{versionCodeList:versionCodeList},
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				Xfinity.message.popup("删除行失败!"); 
			}else{
				initVersionTable();
			}},
			error:function(){
				Xfinity.message.popup("删除行失败!"); 
			}
		});
	};
  var initPage = function(){
  	 	initSoftwareCategorySelect();
    	initSoftwareTypeSelect();
	    initSupportSelect();
	    getSubjectArea();
	    initDateCom();
	    baseInfoFormValidate();
	    addVersionFormValidate();
	    modifyVersionFormValidate();
	    desFormValidate();
	    $('.input-group-addon').attr("style","width:110px");
		$('.form-control').attr("style","width:200px");
		$('[name="outline"]').attr("style","width:820px");
		$('[name="description"]').attr("style","width:820px");
		$('[name="comperation"]').attr("style","width:735px");
  };
  var baseInfoFormValidate = function(){
  		$("#baseInfoForm").validate({
			rules: {
		   		softwareName:{
			   		required:true,
			   		stringNotNull:true,
			   		stringCheck2:true,
			   		remote: {
		                  type: "post",
		                  url: "checkSoftwareNameUnique.action",
		                  data: {
		                       softwareName: function() {
		                           return $("#softwareName").val();
		                       }
		                   },
		                   dataType: "json",
		                   dataFilter: function(a,b) {
		                    	var res = JSON.parse(a);
		                    	return res.softwareNameUnique;
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
		   		},
		   		website:{
		   			url:true
		   		},
		   		endDate:{
		   			dateAfterNow:true
		   		}		   	
			},
			messages:{
				softwareName:{
			   		remote:"软件已存在",
			   		stringNotNull:"只能包括中文字、英文字母、数字和下划线",
			   		stringCheck2:"只能包括中文字、英文字母、数字和下划线"
				}
			},
			errorPlacement : function(error, element) { 
				error.appendTo(element.parent().parent())
			}
		})
  };
  var addVersionFormValidate = function(){
  		addVersionFormValidator = $("#versionFormAdd").validate({
			rules: {
		   		versionNameAdd:{
			   		required:true,
			   		stringNotNull:true,
			   		remote: {
		                  type: "post",
		                  async:false,
		                  url: "checkVersionNameUnique.action",
		                  data: {
		                       versionName: function() {
		                           return $.trim($("#versionNameAdd").val());
		                       },
		                       softwareCode:function(){
		                       	 return softwareCode;
		                       }
		                       
		                   },
		                   dataType: "json",
		                   dataFilter: function(a,b) {
		                    	var res = JSON.parse(a);
		                    	return res.versionNameUnique;
		                    }
		             }
		   		},
		   		versionValueAdd:{
		   			required:true,
			   		stringNotNull:true
		   		}
			},
			messages:{
				versionNameAdd:{
			   		remote:"版本已存在"
				}
			},
			errorPlacement : function(error, element) { 
				error.appendTo(element.parent());
			}
		})
  };
  var modifyVersionFormValidate = function(){
  		modifyVersionFormValidator = $("#versionFormModify").validate({
			rules: {
		   		versionNameModify:{
			   		required:true,
			   		stringNotNull:true,
			   		remote: {
		                  type: "post",
		                  url: "checkVersionNameUnique.action",
		                  async:false,
		                  data: {
		                       versionName: function() {
		                           return $.trim($("#versionNameModify").val());
		                       },
		                       softwareCode:function(){
		                       	 return softwareCode;
		                       },
		                       versionCode:function(){
		                       	 return softwareVersionCode;
		                       }
		                       
		                   },
		                   dataType: "json",
		                   dataFilter: function(a,b) {
		                    	var res = JSON.parse(a);
		                    	return res.versionNameUnique;
		                    }
		             }
		   		},
		   		versionValueModify:{
		   			required:true,
			   		stringNotNull:true
		   		}
			},
			messages:{
				versionNameModify:{
			   		remote:"版本已存在"
				}
			},
			errorPlacement : function(error, element) { 
				error.appendTo(element.parent());
			}
		})
  };
  var desFormValidate = function(){
  		$("#desFormValidate").validate({
			rules: {
		   		outline:{
			   		required:true,
			   		stringNotNull:true,
			   		maxlength:50
		   		},
		   		description:{
		   			required:true,
			   		stringNotNull:true,
			   		minlength:50
		   		}
			},
			messages:{
				outline:"字数不超过50字",
				description:"字数不少于50字"
			},
			errorPlacement : function(error, element) { 
				error.appendTo(element.parent());
			}
		})
  };
  var resetAddPriceForm = function(){
	  	addVersionFormValidator.resetForm();
	  	$("#versionNameAdd").val("");
		$("#versionValueAdd").val("");
		$("#versionDesAdd").val("");
		$("#versionFormAdd").valid();
  }
$(function(){
	
   	initPage();
    $("#baseInfoNext").click(function(){
        saveBaseInfo();
    });
    $("#picDesLast").click(function(){
    	setActive(2);
    });
    $("#picDesNext").click(function(){
    	saveSoftwarePic();
    });
    $('#cooperationNext').click(function(){
    	saveSoftwareCooperation();
    });
    $("#cooperationLast").click(function(){
    	setActive(3);
    });
    
    
    $("#versionAllCheckbox").click(function() {
	 	var checkbox =$("[name='versionChecbox']");
		if($("#versionAllCheckbox").is(':checked')){
			checkbox.prop("checked",true);
		}else{
			checkbox.prop("checked",false);
		}
	 });
	 
	 $("#baseInfo").click(function(){
	 	setActive(1);
	 });
	 $("#versionInfo").click(function(){
	 	setActive(2);
	 });
	 $("#picDesInfo").click(function(){
	 	setActive(3);
	 });
	  $("#cooperationInfo").click(function(){
	 	setActive(4);
	 });
	 
	 $("#softwareVersionLast").click(function(){
	 	setActive(1);
	 });
	 $("#softwareVersionNext").click(function(){
	 	setActive(3);
	 });
	 
	 $("#addVersion").click(function(){
	 	if(!softwareCode){
			Xfinity.message.popup("请先填写并保存基本信息！"); 
			return false;
		}
	  	$("#addVersionModal").modal("show");
	  	resetAddPriceForm();
	  	initGuiSelect();
	 });
	  $("#deleteVersion").click(function(){
	  	deleteVersionList();
	 });
	 $("#addVersionBtn").click(function(){
	 	addSoftwareVersion();
	 });
	 $("#modifyVersionBtn").click(function(){
	 	modifySoftwareVersion();
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
})