if (typeof Xfinity == "undefined") {
	var Xfinity = function() {};
}


Xfinity.Util = {
	formatTime : function(value) {
		if (value == null || value == '' || typeof (value) == 'undefined') {
			return '';
		}

		var d = new Date();
		d.setTime(value);

		function ChangeTimeToString(DateIn) {
			var Year = 0;
			var Month = 0;
			var Day = 0;
			var Hour = 0;
			var Minute = 0;
			var CurrentDate = "";

			// 初始化时间
			Year = DateIn.getFullYear();
			Month = DateIn.getMonth() + 1;
			Day = DateIn.getDate();
			Hour = DateIn.getHours();
			Minute = DateIn.getMinutes();
			Second = DateIn.getSeconds();

			CurrentDate = Year + "-";
			if (Month >= 10) {
				CurrentDate = CurrentDate + Month + "-";
			} else {
				CurrentDate = CurrentDate + "0" + Month + "-";
			}
			if (Day >= 10) {
				CurrentDate = CurrentDate + Day;
			} else {
				CurrentDate = CurrentDate + "0" + Day;
			}

			if (Hour >= 10) {
				CurrentDate = CurrentDate + " " + Hour;
			} else {
				CurrentDate = CurrentDate + " 0" + Hour;
			}
			if (Minute >= 10) {
				CurrentDate = CurrentDate + ":" + Minute;
			} else {
				CurrentDate = CurrentDate + ":0" + Minute;
			}
			if (Second >= 10) {
				CurrentDate = CurrentDate + ":" + Second;
			} else {
				CurrentDate = CurrentDate + ":0" + Second;
			}

			return CurrentDate;
		}

		return ChangeTimeToString(d);
	},
	
	post : function(URL, PARAMS) {      
	    var temp = document.createElement("form");      
	    temp.action = URL;      
	    temp.method = "post";      
	    temp.style.display = "none";      
	    for (var x in PARAMS) {      
	        var opt = document.createElement("textarea");      
	        opt.name = x;      
	        opt.value = PARAMS[x];      
	        temp.appendChild(opt);      
	    }      
	    document.body.appendChild(temp);      
	    temp.submit();      
	    return temp;      
	},
	emailFormatV:function(emailStr){
		patrn=/^\s*\w+(?:\.{0,1}[\w-]+)*@[a-zA-Z0-9]+(?:[-.][a-zA-Z0-9]+)*\.[a-zA-Z]+\s*$/;
		if(!patrn.exec(emailStr)){
			return false;
		}else{
			return true;
		}
	},
	
	showTooltip: function(){
		$("[data-toggle='tooltip']").mouseover(function(){
			$(this).tooltip('show');
		});
		
	},
	pageSize:20,
	checkPhoneNumber:function(phoneNumber) {  
        var isMobile = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(14[0-9]{1}))+\d{8})$/;  
        var isPhone = /^(?:(?:0\d{2,3})-)?(?:\d{7,8})(-(?:\d{3,}))?$/;;    
        if (phoneNumber.substring(0, 1) == 1) {  
            if (!isMobile.exec(phoneNumber) && phoneNumber.length != 11) {  
                return false;  
            }  
        }  
        else if (phoneNumber.substring(0, 1) == 0) {  
            if (!isPhone.test(phoneNumber)) {  
                return false;  
            }  
        }  
        else {  
            return false;  
        }  
        return true;  
    },

    addRightBox:function(){
    	$('<div id="_rightBox" style="position: fixed;right: 0px;top: 30%;width:130px;heigth:105px;background: #337AB7;">'+
			'<div style="width:40px;float:left;text-align:center">'+
				'<br><br><a id="_right" class="btn-primary"><i class="fa fa-lg -ol fa-angle-double-right"></i></a>'+
				'<a id="_left" class="btn-primary hide"><i class="fa fa-lg -ol fa-angle-double-left"></i></a>'+
			'</div>'+
			'<div id="_menu" style="width:90px;float:left">'+
				'<a class="btn btn-primary disabled" href="jsp/collection/collection.jsp"> <i class="fa fa-fw fa-check-square-o"></i>我的收藏</a>'+
				'<br><a class="btn btn-primary" href="jsp/list/list.jsp"> <i class="fa fa-fw t-plus fa-shopping-cart"></i>待购清单</a>'+
				'<br><a class="btn btn-primary" href="jsp/order/order.jsp"> <i class="fa fa-fw fa-list-ol"></i>我的订单</a>'+
			'</div>'+
		'</div>').appendTo("body");
		$("#_right").click(function(){
			$('#_rightBox').animate({width:'40',height:'105px'});
			$(this).addClass("hide");
			$("#_left").removeClass("hide");	
			$('#_menu').hide();
		});
		$("#_left").click(function(){
			$(this).addClass("hide");
			$("#_right").removeClass("hide");
			$('#_menu').show();
			$('#_rightBox').animate({width:'130',height:'105px'});
		});
    }
    

};

