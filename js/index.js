 var appDetail = function(appCode,softwareCode) {
	 var url='jsp/appCenter/appDetail.jsp?appCode='+appCode+'&softwareCode='+softwareCode;
		location.href = url;
	};
      
      var setData = function(start,size){
		var data={
			start:start,
			size:size,
			type:"allType",
			provider:"allProvider",
			keywords:"",
			cluster:"allCluster"
		};
		return data;
	};
	
      var initNewAppTable = function(start,size){
		var firstRow = $("#newApp").clone(true);
		$("#newApp-table-body").find("div").remove();
		firstRow.appendTo("#newApp-table-body");
		jQuery.ajax({ 
			url: "searchApp.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			async:true,
			data:setData(start,size),
			success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
				}else{
					appList = c.responseJSON.appList;
					sum = c.responseJSON.sum;
					addNewAppRow(appList);
			}},
			error:function(){
				
			}
		});
	};
      
      var addNewAppRow = function(list){
		var firstRow = $("#newApp");
		var firstEle = $("#newApp-element");
		var newRow;
		$.each( list, function(index, content){
			if(index%6 == 0){
			  newRow = firstRow.clone(true).attr("id", "newApp"+index);
			  newRow.find("div").remove();
			}
			var appCode = content.appCode;
			var softwareCode = content.softwareCode;
			var element = firstEle.clone(true).attr("id","newAPP"+appCode);
			element.find("img[id='newApp-img']").attr("id","newApp-img"+index).attr("src",'softwarePicByCode.do?softwareCode='+softwareCode).attr("onclick", "javascript:appDetail('"+appCode+"','"+softwareCode+"')");
			element.find("a[id='newApp-outline']").attr("id","newApp-outline"+index).html(content.outline).attr("onclick", "javascript:appDetail('"+appCode+"','"+softwareCode+"')").attr("title",content.outline);
			element.find("span[id='newApp-category']").attr("id","newApp-category"+index).html(content.type);
			
			element.appendTo(newRow);
			newRow.appendTo("#newApp-table-body");
			newRow.show();
		});
		firstRow.hide();
	};
	
	
	  var initHotAppTable = function(start,size){
		var firstRow = $("#hotApp").clone(true);
		$("#hotApp-table-body").find("div").remove();
		firstRow.appendTo("#hotApp-table-body");
		jQuery.ajax({ 
			url: "searchApp.action",
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			async:true,
			data:setData(start,size),
			success: function(a,b,c){
				var exception = c.responseJSON.exception;
				if(exception){
				}else{
					appList = c.responseJSON.appList;
					sum = c.responseJSON.sum;
					addHotAppRow(appList);
			}},
			error:function(){
				
			}
		});
	};
      
      var addHotAppRow = function(list){
		var firstRow = $("#hotApp");
		var firstEle = $("#hotApp-element");
		var newRow;
		$.each( list, function(index, content){
			if(index%6 == 0){
			  newRow = firstRow.clone(true).attr("id", "hotApp"+index);
			  newRow.find("div").remove();
			}
			var appCode = content.appCode;
			var softwareCode = content.softwareCode;
			var element = firstEle.clone(true).attr("id","hotAPP"+appCode);
			element.find("img[id='hotApp-img']").attr("id","hotApp-img"+index).attr("src",'softwarePicByCode.do?softwareCode='+softwareCode).attr("onclick", "javascript:appDetail('"+appCode+"','"+softwareCode+"')");
			element.find("a[id='hotApp-outline']").attr("id","hotApp-outline"+index).html(content.outline).attr("onclick", "javascript:appDetail('"+appCode+"','"+softwareCode+"')").attr("title",content.outline);
			element.find("span[id='hotApp-category']").attr("id","hotApp-category"+index).html(content.type);
			element.find("span[id='hotApp-sales']").attr("id","hotApp-sales"+index).html(content.soldNum);
			
			element.appendTo(newRow);
			newRow.appendTo("#hotApp-table-body");
			newRow.show();
		});
		firstRow.hide();
	};
      
      initNewAppTable(0,18);
      initHotAppTable(0,18);
      
  
	 var logout = function() {
		jQuery.ajax({
			  url: "logout.action",
			  contentType: "application/x-www-form-urlencoded; charset=utf-8",
				  success: function(a, b, c){
			  window.location.href="index.jsp";
			//若是手动退出，则不记录session过期前的url和参数

		   	  myDelCookie("goBackPath");
			  myDelCookie("params");
           },
			 error: function(){
			 window.location.href="myXfinity.jsp";
			 }
			 });
		};
