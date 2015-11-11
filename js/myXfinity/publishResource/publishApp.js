	
	var selectedSoftwareCode = "";
	var selectedClusterCode = "";
	var softwareList = "";
	var clusterList = "";
	var softwareMonthPric = 0;
	var softwareCoreHourPrice = 0;
	var priceList;
	var setActive = function(step){
		$("#ul").find('.active').removeClass('active');
		$(".tab-pane").removeClass('active');
		switch(step){
			case 1:
				$("#matchAppInfo").addClass('active');
				$("#matchAppPanel").addClass('active');
				break;
			case 2:
				$("#selectQueueInfo").addClass('active');
				$("#selectQueueInfoPanel").addClass('active');
				break;
			case 3:
				$("#confirmInfo").addClass('active');
				$("#confirmInfoPanel").addClass('active');
				setAppBaseInfoConfirm();
				setSelectedQueueToConf();
				break;
		}
	};
	var addClusterRow = function(list){
		var firstTr = $("#clusterRow");
		$.each( list, function(index, content){
			var newRow = firstTr.clone(true).attr("id", content.clusterCode+index).removeClass("hide");
			newRow.find("input[id='clusterRadio']").attr("id",content.clusterCode).attr("name",'clusterRadio');
			newRow.find("span[id='clusterName']").attr("id","clusterName"+index).html(content.name);;
			newRow.find("span[id='clusterFee']").attr("id","clusterFee"+index).html(content.fee);
			newRow.find("span[id='clusterDiskSize']").attr("id","clusterDiskSize"+index).html(content.diskSize);
			newRow.find("span[id='clusterGroupName']").attr("name",content.clusterPublisherGroupCode).attr("id","clusterGroupName"+index).html(content.clusterPublisherGroupName);
			newRow.appendTo("#cluster-table-body");
		});
	};
	var initClusterTable = function(){
		var firstTr = $("#clusterRow").clone(true);
		$("#cluster-table-body").find("tr").remove();
		firstTr.appendTo("#cluster-table-body");
		jQuery.ajax({ 
				url: "avaCoopClusterList.action",
				type: "POST",
				data:{start:"0",size:"10000"},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
				}else{
					clusterList = c.responseJSON.clusterlist;
					addClusterRow(clusterList);
					clusterRadioCheck();
				}},
				error:function(){
				}
			});
	};
	var addQueueRow = function(list){
		var firstTr = $("#queueRow");
		$.each( list, function(index, content){
			var newRow = firstTr.clone(true).attr("id", content.queueCode+index).removeClass("hide");
			newRow.find("input[id='queueCheckbox']").attr("id",content.queueCode).attr("name",'queueCheckbox');
			newRow.find("span[id='queueName']").attr("id","queueName"+index).html(content.name);;
			newRow.find("span[id='queueDes']").attr("id","queueDes"+index).html(content.description);
			newRow.appendTo("#queue-table-body");
		});
	};
	var initQueueTable = function(){
		if(!selectedClusterCode){
			Xfinity.message.popup("请选择一个集群！"); 
			return false;
			
		}
		var firstTr = $("#queueRow").clone(true);
		$("#queue-table-body").find("tr").remove();
		firstTr.appendTo("#queue-table-body");
		jQuery.ajax({ 
				url: "listAvaQueueByClusterCode.action",
				type: "POST",
				data:{start:"0",size:"10000",clusterCode:selectedClusterCode},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
				}else{
					var queueList = c.responseJSON.queueList;
					addQueueRow(queueList);
				}},
				error:function(){
				}
			});
	};
	var syncQueue = function(){
   		jQuery.ajax({ 
			url: "syncQueuesFromCluster.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:{clusterCode:selectedClusterCode},
			success: function(a,b,c){
			var exception = c.responseJSON.exception;
			if(exception){
				Xfinity.message.popup("同步失败！原因："+exception); 
			}else{
				Xfinity.message.popup("同步成功！"); 
				initQueueTable();
			}},
			error:function(){
				Xfinity.message.popup("同步失败！"); 
			}
		});
   }
	var initSoftwareTable = function(){
		var firstTr = $("#softwareRow").clone(true);
		$("#software-table-body").find("tr").remove();
		firstTr.appendTo("#software-table-body");
		jQuery.ajax({ 
				url: "avaCoopSoftwareList.action",
				type: "POST",
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
				}else{
					softwareList = c.responseJSON.softwareList;
					addSoftwareRow(softwareList);
					softwareRadioCheck();
				}},
				error:function(){
				}
			});
	};
	
	var addSoftwareRow = function(list){
		var firstTr = $("#softwareRow");
		$.each( list, function(index, content){
			var newRow = firstTr.clone(true).attr("id", content.softwareCode+index).removeClass("hide");
			newRow.find("input[id='softwareRadio']").attr("id",content.softwareCode).attr("name",'softwareRadio');
			newRow.find("span[id='softwareName']").attr("id","softwareName"+index).html(content.name);;
			newRow.find("span[id='softwareOutline']").attr("id","outline"+index).html(content.outline);
			newRow.find("span[id='softwareGroupName']").attr("name",content.softwareCode).attr("id","softwareGroupName"+index).html(content.groupName);
			newRow.appendTo("#software-table-body");
		});
	};
	
	
	var softwareRadioCheck = function(){
		$("[name='softwareRadio']").unbind("change");
		$("[name='softwareRadio']").change(function() { 
			$("[name='softwareRadio']").parent().parent().attr("style","");
			selectedSoftwareCode = $(this).attr("id");
			var tr = $(this).parent().parent().attr("style","background:#DFEBF2;");
			var softwareName = tr.find("span[id^='softwareName']").text();
			var groupName = tr.find("span[id^='softwareGroupName']").text();
			$("#selectedSoftware").attr("style","").html("<a>"+softwareName+"</a>(<a>"+groupName+"</a>)");
			$("#softwareNameConf").val(softwareName);
		}); 
	};
	var clusterRadioCheck = function(){
		$("[name='clusterRadio']").unbind("change");
		$("[name='clusterRadio']").change(function() { 
			$("[name='clusterRadio']").parent().parent().attr("style","");
			selectedClusterCode = $(this).attr("id");
			var tr = $(this).parent().parent().attr("style","background:#DFEBF2;");
			var clusterName = tr.find("span[id^='clusterName']").text();
			var groupName = tr.find("span[id^='clusterGroupName']").text();
			$("#selectedCluster").attr("style","").html("<a>"+clusterName+"</a>(<a>"+groupName+"</a>)");
		}); 
	};
	var judageSofwareAndClusterSelect = function(){
		var softwarItem = $("[name='softwareRadio']:checked");
		if(softwarItem.length != 1){
			Xfinity.message.popup("请选择一个软件！"); 
			return false;
		}
		var clusterItem = $("[name='clusterRadio']:checked");
		if(clusterItem.length != 1){
			Xfinity.message.popup("请选择一个集群！"); 
			return false;
		}
		return true;
	};
	var setAppBaseInfoConfirm = function(){
		var softwareEndDate = "";
		var clusterEndDate = "";
		$.each(softwareList,function(index,content){
			if(content.softwareCode == selectedSoftwareCode ){
				$("#softwareSupporterConf").html(content.supporterRealName);
				softwareEndDate = content.endDate;
				softwareMonthPrice = content.monthPrice;
				softwareCoreHourPrice = content.coreHourPrice;
				return false;
			};
		});
		$.each(clusterList,function(index,content){
			if(content.clusterCode == selectedClusterCode){
				$("#clusterSupporterConf").html(content.userRealName);
				$("#feeConf").html(content.fee);
				$("#personalStorageConf").html(content.personalStorage);
				clusterEndDate = content.contractDeadline;
				return false;
			}
		});
		var sDate,cDate,endDate;
		if(softwareEndDate){
			sDate = new Date(softwareEndDate);
		};
		if(clusterEndDate){
			cDate = new Date(clusterEndDate);
			if(sDate && sDate < cDate){
				endDate = sDate;
			}else{
				endDate = cDate;
			}
		}else{
			endDate = sDate;
		}
		if(endDate)
			$("#endDateConf").html(endDate.getFullYear()+"-"+(endDate.getMonth()+1)+"-"+endDate.getDate());
	};
	var setSelectedQueueToConf = function(){
		var items = $("[name='queueCheckbox']:checkbox:checked");
		$("#queue-conf-table-body").empty();
		$.each(items,function(index,content){
			var tr = $(this).parent().parent().clone(true);
			$(tr.children()[0]).remove();
			tr.appendTo($("#queue-conf-table-body"));
		})
	};
	var addPriceRow = function(priceList){
		var firstTr = $("#priceRow").clone(true);
		$("#price-table-body").find("tr").remove();
		firstTr.appendTo("#price-table-body");
		$.each( priceList, function(index, content){
			var code = content.priceCode;
			var newRow = firstTr.clone(true).attr("id", selectedClusterCode+index).removeClass('hide');
			var maxCoreNum = content.coreNum;
			var coreHourPriceCluster = parseFloat(content.coreHourPrice);
			var monthPriceCluster = parseFloat(content.monthPrice);
			var coreHourPriceTotal = coreHourPriceCluster+parseFloat(softwareCoreHourPrice);
			var monthPriceTotal = monthPriceCluster + parseFloat(softwareMonthPrice);
			monthPriceCluster = monthPriceCluster;
			softwareCoreHourPrice = softwareCoreHourPrice;
			coreHourPriceCluster = coreHourPriceCluster;
			newRow.find("span[id='maxCoreNum']").attr("id","maxCoreNum"+index).html(maxCoreNum);
			newRow.find("span[id='monthPriceTotal']").attr("id","monthPriceTotal"+index).html(monthPriceTotal.toFixed(2));
			newRow.find("span[id='monthPriceSoftware']").attr("id","monthPriceSoftware"+index).html(softwareMonthPrice.toFixed(2));
			newRow.find("span[id='monthPriceCluster']").attr("id","monthPriceCluster"+index).html(monthPriceCluster.toFixed(2));
			
			newRow.find("span[id='coreHourPriceTotal']").attr("id","coreHourPriceTotal"+index).html(coreHourPriceTotal.toFixed(2));
			newRow.find("span[id='coreHourPriceSoftware']").attr("id","coreHourPriceSoftware"+index).html(softwareCoreHourPrice.toFixed(2));
			newRow.find("span[id='coreHourPriceCluster']").attr("id","coreHourPriceCluster"+index).html(coreHourPriceCluster.toFixed(2));
			newRow.appendTo("#price-table-body");
		});
	};
	var initPricTable = function(){
		jQuery.ajax({ 
				url: "listPrice.action",
				type: "POST",
				data:{clusterCode:selectedClusterCode},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
				}else{
					priceList = c.responseJSON.priceList;
					addPriceRow(priceList);
				}},
				error:function(){
				}
			});
	};
	var getSelectedQueueCodeList = function(){
		var items = $('[name = "queueCheckbox"]:checkbox:checked');
		var codeList = "";
 		$.each( items, function(index, content){
 			if(codeList){
 				codeList +=";"
 			}
 			codeList +=content.id;
 		});
 		return codeList;
	};
	var getAppDate = function(){
		if(!$("#confirmForm").valid()){
			return false;
		}
		var name = $("#softwareNameConf").val();
		var softwareCode = selectedSoftwareCode;
		var clusterCode = selectedClusterCode;
		var sellNum = $("#sellNumConf").val();
		var queueCodeList = getSelectedQueueCodeList();
		if(!softwareCode){
			Xfinity.message.popup("未选择软件，不能发布！");
			return false;
		}
		if(!clusterCode){
			Xfinity.message.popup("未选择集群，不能发布！");
			return false;
		}
		if(!queueCodeList){
			Xfinity.message.popup("没有选择队列，不能发布！");
			return false;
		}
		if(!priceList){
			Xfintiy.message.popup("没有价格，不能发布！");
			return false;
		}
		var data = {
			name:name,
			softwareCode:softwareCode,
			clusterCode:clusterCode,
			sellNum:sellNum,
			queueCodeList:queueCodeList
		};
		return data;
	};
	var publishApp = function(){
		
		var data = getAppDate();
		if(!data){
			return false;
		}
		jQuery.ajax({ 
				url: "addApp.action",
				type: "POST",
				data:data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
				}else{
					Xfinity.message.popup("应用发布成功！"); 
					Xfinity.Util.post('jsp/myXfinity/resourceMgm/resourceMgm.jsp');
				}},
				error:function(){
				}
			});
	};
	var confirmFormValidate = function(){
		$("#confirmForm").validate({
			rules: {
		   		softwareNameConf:{
			   		required:true,
			   		stringNotNull:true,
			   		maxlength:20,
			   		remote: {
		                  type: "post",
		                  url: "checkAppNameUnique.action",
		                  data: {
		                       appName: function() {
		                           return $.trim($("#softwareNameConf").val());
		                       },
		                       clusterCode:function(){
		                       		return selectedClusterCode;
		                       }
		                   },
		                   dataType: "json",
		                   dataFilter: function(a,b) {
		                    	var res = JSON.parse(a);
		                    	return res.appNameUnique;
		                    }
		             }
		   		},
		   		sellNumConf:{
		   			required:true,
			   		digits:true,
			   		min:0
		   		}
			},
			messages:{
				softwareNameConf:{
					remote:"应用名称已在集群上存在"
				},
				sellNumConf:"必须是大于等于0的整数"
			},
			errorPlacement : function(error, element) { 
				error.appendTo(element.parent());
			}
		})
	};
	var initPage = function(){
		 initSoftwareTable();
	 	 initClusterTable();
	 	 confirmFormValidate();
	}
	
$(function(){
	
	 initPage();
	 
	 $("#matchAppInfo").click(function(){
	 	setActive(1);
	 });
	 $("#matchAppInfoNext").click(function(){
	 	if(judageSofwareAndClusterSelect()){
	 		setActive(2);
	 		initQueueTable();
	 	}
	 });
	 $("#selectQueueInfo").click(function(){
	 	setActive(2);
	 });
	 $("#selectQueueInfoLast").click(function(){
	 	setActive(1);
	 });
	  $("#selectQueueInfoNext").click(function(){
	 	setActive(3);
	 	initPricTable();
	 });
	 $("#confirmInfo").click(function(){
	 	setActive(3);
	 });
	 $("#confirmInfoLast").click(function(){
	 	setActive(2);
	 });
	 $("#confirmInfoNext").click(function(){
	 	publishApp();
	 });
	 $("#syncQueue").click(function(){
	 	syncQueue();
	 });
	 $("#refreshQueue").click(function(){
	 	initQueueTable();
	 });
	 $("#queueAllCheckbox").click(function() {
	 	var checkbox =$("[name='queueCheckbox']");
		if($("#queueAllCheckbox").is(':checked')){
			checkbox.prop("checked",true);
		}else{
			checkbox.prop("checked",false);
		}
	 });
	 $("#refreshSoftware").click(function(){
	 	initSoftwareTable();
	 });
	 $("#refreshCluster").click(function(){
	 	initClusterTable();
	 })
})