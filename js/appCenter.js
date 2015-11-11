    var appList = "";
	var typeList = "";
	var clusterList = "";
	var providerList = "";
	var start=0;
	var sum=0;
	var pageSize = 12;
    
    var appDetail = function(appCode,softwareCode) {
		var url='jsp/appCenter/appDetail.jsp?appCode='+appCode+'&softwareCode='+softwareCode;
		location.href = url;
	};
    var typeStr = {
		"1":"仿真计算",
		"2":"前处理",
		"3":"后处理",
		"4":"软件许可"
	};
	var setActiveAndSearch = function(id,_this){
		$("#"+id).find('.active').removeClass('active');
		$(_this).addClass('active');
		initTable(start,pageSize);
	};
	var initTypeSearch = function(typeList){
		var typeSearch = $("#typeSearch");
		var type = $("#typeSelect").clone(true);
		var typeClone = $("#allType").clone(true);
		typeClone.unbind("click");
		typeClone.click(function(){
			setActiveAndSearch('typeSearch',this);
		});
		typeSearch.find("li").remove();
		type.appendTo(typeSearch);
		typeClone.appendTo(typeSearch);
		typeClone.addClass('active');
		$.each( typeList, function(index, content){
			var typeSearchEle = typeClone.clone(true);
			var type = content;
			if(typeSearch.find("li[id='"+type+"']").length < 1){
				typeSearchEle.removeClass('active');
				typeSearchEle.attr('id',type);
				var typeEle = typeSearchEle.find("a[id='type']").attr("id","type_"+type);
				var typeCN = typeStr[type];
				typeEle.html(typeCN);
				typeSearchEle.appendTo(typeSearch);
			}
		});
	}
	
	var initProviderSearch = function(providerList){
		var providerSearch = $("#providerSearch");
		var provider = $("#providerSelect").clone(true);
		var providerClone = $("#allProvider").clone(true);
		providerClone.addClass('active');
		providerClone.unbind("click");
		providerClone.click(function(){
			setActiveAndSearch('providerSearch',this);
		});
		providerSearch.find("li").remove();
		provider.appendTo(providerSearch);
		providerClone.appendTo(providerSearch);
		
		$.each( providerList, function(index, content){
			var providerCode = content.providerCode;
			if(providerSearch.find("li[id='"+providerCode+"']").length < 1){
				var providerSearchEle = providerClone.clone(true);
				providerSearchEle.removeClass('active');
				providerSearchEle.attr('id',providerCode);
				providerSearchEle.find("a[id='provider']").attr("id","provider_"+providerCode).html(content.name)
				providerSearchEle.appendTo(providerSearch);
			}
		});
	}
	var initClusterSearch = function(clusterList){
		var clusterSearch = $("#clusterSearch");
		var cluster = $("#clusterSelect").clone(true);
		var clusterClone = $("#allCluster").clone(true);
		clusterClone.addClass('active');
		clusterClone.unbind("click");
		clusterClone.click(function(){
			setActiveAndSearch('clusterSearch',this);
		});
		clusterSearch.find("li").remove();
		cluster.appendTo(clusterSearch);
		clusterClone.appendTo(clusterSearch);
		$.each( clusterList, function(index, content){
			var clusterCode = content.clusterCode;
			if(clusterSearch.find("li[id='"+clusterCode+"']").length < 1){
				var clusterSearchEle = clusterClone.clone(true);
				clusterSearchEle.removeClass('active');
				clusterSearchEle.attr('id',clusterCode);
				clusterSearchEle.find("a[id='cluster']").attr("id","cluster_"+clusterCode).html(content.name)
				clusterSearchEle.appendTo(clusterSearch);
			}
		});
	}
	var setData = function(start,size){
		var type = $("#typeSearch").find('.active').attr('id');
		var provider = $("#providerSearch").find('.active').attr('id');
		var cluster = $("#clusterSearch").find('.active').attr('id');
		var keywords= $("#keywords").val();
		var data={
			start:start,
			size:size,
			type:type,
			provider:provider,
			keywords:encodeURI(keywords),
			cluster:cluster
		}
		return data;
	};
	
	var listSearchMenu = function(){
		var keywords= $("#keywords").val();
		jQuery.ajax({ 
			url: "listSearchMenu.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:{keywords:encodeURI(keywords)},
			async:true,
			success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
				}else{
						typeList = c.responseJSON.typeList;
						clusterList = c.responseJSON.clusterList;
						providerList = c.responseJSON.providerList;
						initTypeSearch(typeList);
						initClusterSearch(clusterList);
						initProviderSearch(providerList);
			}},
			error:function(){
			}
		});
	};
	var initTable = function(start,size){
		var firstRow = $("#row").clone(true);
		$("#table-body").find("div").remove();
		firstRow.appendTo("#table-body");
		jQuery.ajax({ 
			url: "searchApp.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			async:true,
			data:setData(start,size),
			success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
//					$("#msgInfo").html("<b>提示：</b>获取列表失败!原因："+exception).show(300).delay(3000).hide(1000); 
				}else{
					appList = c.responseJSON.appList;
					sum = c.responseJSON.sum;
					initPageBar(start,size);
					addRow(appList);
			}},
			error:function(){
//				$("#msgInfo").html("<b>提示：</b>获取列表失败!").show(300).delay(3000).hide(1000); 
			}
		});
	};
	var collectResource = function(appCode){
		var data = {
			appCode:appCode
		};
		jQuery.ajax({ 
			url: "collectResource.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			data:data,
			async:true,
			type:"POST",
			success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
					if(Xfinity.Constant.UNLOGIN == exception){
						Xfinity.Util.post('login.jsp');
						return false;
					}else{
						Xfinity.message.alert("收藏失败!原因:"+exception); 
					}
				}else{
					Xfinity.message.popup("收藏成功!"); 
			}},
			error:function(){
			}
		});
	};
	var addRow = function(list){
		var firstRow = $("#row");
		var firstEle = $("#element");
		var newRow;
		if(!list || list.length < 1){
			$("#noRecord").show();
			$("#pageBar").hide();
			$("#select").hide();
			$("#selectShow").show();
			$("#selectHide").hide();
			$("#order").hide();
			return false;
		}else{
			$("#noRecord").hide();
			$("#pageBar").show();
			$("#resSelect").show();
			$("#order").show();
		}
		$.each( list, function(index, content){
			if(index%4 == 0){
			  newRow = firstRow.clone(true).attr("id", "row"+index);
			  newRow.find("div").remove();
			}
			var appCode = content.appCode;
			var softwareCode = content.softwareCode;
			var outline = content.appName+"【"+content.clusterName+"】";
			if(content.outline && $.trim(content.outline)){
				outline += $.trim(content.outline);
			}
			var element = firstEle.clone(true).attr("id",appCode);
			element.find("img[id='img']").attr("id","img"+index).attr("src",'softwarePicByCode.do?softwareCode='+softwareCode).attr("onclick", "javascript:appDetail('"+appCode+"','"+softwareCode+"')");
			element.find("a[id='outline']").attr("id","outline"+index).html(outline).attr("onclick", "javascript:appDetail('"+appCode+"','"+softwareCode+"')");
			var collection = element.find("a[id='addToCollection']").attr("id","addToCollection"+index);
			collection.click(function(){
				collectResource(appCode);
			});
			element.find("span[id='sold']").attr("id","sold"+index).html(content.soldNum);
			element.find("span[id='left']").attr("id","left"+index).html(parseInt(content.sellNum)-parseInt(content.soldNum));
			var hourPriceMin = content.coreHourPriceMin.toFixed(2);
			var hourPriceMax = content.coreHourPriceMax.toFixed(2);
			var monthPriceMin = content.monthPriceMin.toFixed(2);
			var monthPriceMax = content.monthPriceMax.toFixed(2);
			var hourPrice = "￥";
			var monthPrice = "￥"; 
			if(hourPriceMax < 0){
				hourPrice = "未定价"
			}else if(hourPriceMax == hourPriceMin){
				hourPrice += hourPriceMax;
			}else {
				hourPrice += hourPriceMin+"~"+hourPriceMax;
			}
			
			if(monthPriceMax < 0){
				monthPrice = "未定价"
			}else if(monthPriceMax == monthPriceMin){
				monthPrice += monthPriceMax;
			}else{
				monthPrice += monthPriceMin+"~"+monthPriceMax;
			}
			element.find("span[id='hourPrice']").attr("id","hourPrice"+index).html(hourPrice);
			element.find("span[id='monthPrice']").attr("id","hourPrice"+index).html(monthPrice);
			var toList = element.find("a[id='addToList']").attr("id","addToList"+index).attr("name",appCode);
			var toCollection = element.find("a[id='addToCollection']").attr("id","addToCollection"+index).attr("name",appCode);
			element.appendTo(newRow);
			newRow.appendTo("#table-body");
			newRow.show();
			if(UserUtil.isSubUser()){
				toList.addClass("disabled");
			}
			toList.click(function(){
				var appCode = $(this).attr("name");
				var data = {
					appCode:appCode
				}
				addToList(data);
			})
		});
		firstRow.hide();
	};
	var initPageBar = function(start,size){
		$.turnPageBar.init({
			reload:initTable,
			sum:sum,
			fresh:true,
			start:start+1,
			size:size
		});
	};
	var searchKeywords = function(){
		listSearchMenu();
		initTable(start,pageSize);
	};
	var setHead = function(){
		$('#_head').find('.active').removeClass('active');
		$('#_appCenter').addClass("active");
	};
	var pageInit = function(){
		if(UserUtil.hasGroupAdminFunction()){
			Xfinity.Util.addRightBox();
		}
		if(UserUtil.isSubUser()){
			$("#info").html(Xfinity.Constant.SUB_USER_CAN_NOT_BUY).show(300).delay(3000).hide(1000); ;
		}
		setHead();
		$("#row").hide();
		$("#selectShow").show();
		$("#selectHide").hide();
		$("#select").hide();
		$("#noRecord").hide();
		searchKeywords();
		var menuYloc = $("#areaSelection").offset().top-70;
		$(window).scroll(function() {
			var offset = menuYloc + $(document).scrollTop() + "px"; 
			$("#areaSelection").animate({ top: offset }, { duration: 500, queue: false }); 
		});
	}
$(function(){
	pageInit();
	//2.2 page effect
	$("#searchKeywords").click(function(){
		searchKeywords();
	});
	$("#keywords").keydown(function() {
        if (event.keyCode == "13") {
            searchKeywords();
        }
	});
	$("#selectShow").click(function(){
		$("#selectShow").hide();
		$("#selectHide").show();
		$("#select").show();
	});
	$("#selectHide").click(function(){
		$("#selectHide").hide();
		$("#selectShow").show();
		$("#select").hide();
	});
});