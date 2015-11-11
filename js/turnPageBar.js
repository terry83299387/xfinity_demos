jQuery.turnPageBar = {
	param:{
		sum:0,      // the sum of record number
		sumPage:1,  // the sum of page number 
		fresh:true, // show fresh button, true:show, false:hide
		cur:1,      // current page number
		start:1,    // records show start number
		to:20,      // records show end number
		size:20     // the size of record show
	},
	init:function(param){
		param=$.extend({  
	        reload:function(){
	        	alert("no reload funtion parameter!")
	        },
	        fresh:true,
	        sum:0,
	        size:20
		},param||{}),
		this.reload = eval(param.reload);
		this.param.sum = param.sum;
		this.param.size = param.size;
		if(param.cur){
			this.param.cur = param.cur;
		}else{
			this.param.cur = Math.ceil(param.start/param.size);
		}
		if(param.start){
			this.param.start = param.start;
		}else{
			this.param.start = 1;
		}
		this.param.sumPage = Math.ceil(param.sum/param.size);
		this.param.to = param.start + param.size - 1;
		if(this.param.to > param.sum){
			this.param.to = param.sum;
		}
		this.param.fresh = param.fresh;
		if(!param.fresh){
			$("#_fresh").hide();
		};
		if(this.param.sumPage < 2){
			$("#_first").attr("disabled","disabled");
			$("#_pre").attr("disabled","disabled");
			$("#_last").attr("disabled","disabled");
			$("#_next").attr("disabled","disabled");
		}else if(this.param.cur == this.param.sumPage){
			$("#_first").removeAttr("disabled");
			$("#_pre").removeAttr("disabled");
			$("#_last").attr("disabled","disabled");
			$("#_next").attr("disabled","disabled");
		}else if(this.param.cur < this.param.sumPage && this.param.cur == 1){
			$("#_first").attr("disabled");
			$("#_pre").attr("disabled");
			$("#_last").removeAttr("disabled","disabled");
			$("#_next").removeAttr("disabled","disabled");
		}else{
			$("#_first").removeAttr("disabled");
			$("#_pre").removeAttr("disabled");
			$("#_last").removeAttr("disabled");
			$("#_next").removeAttr("disabled");
		}
		this.listen();
	},
	reSet:function(param){
		this.init(param);
	},
	setValue:function() {
		 $("#_sumPage").text(this.param.sumPage);
		 $("#_cur").val(this.param.cur);
		 $("#_sum").text(this.param.sum);
		 $("#_from").text(this.param.start);
		 $("#_to").text(this.param.to);
	},
	reload:function(start,size){
	},
	refresh:function(){
		$.turnPageBar.reload($.turnPageBar.param.start-1,$.turnPageBar.param.size);
			if($.turnPageBar.param.sumPage == $.turnPageBar.param.cur ){
				$("#_last").attr("disabled","disabled");
				$("#_next").attr("disabled","disabled");
			}else if($.turnPageBar.param.sumPage > $.turnPageBar.param.cur ){
				$("#_last").removeAttr("disabled");
				$("#_next").removeAttr("disabled");
			}
			if($.turnPageBar.param.cur == 1){
				$("#_first").attr("disabled","disabled");
				$("#_pre").attr("disabled","disabled");
			}else{
				$("#_first").removeAttr("disabled");
				$("#_pre").removeAttr("disabled");
			}
	},
	curValueSet: function(){
		var curValue = $('#_cur').val();
		if(isNaN(curValue)||curValue > $.turnPageBar.param.sumPage || curValue<1){
			$('#_cur').val($.turnPageBar.param.cur);
		}
	},
	listen:function(){
		this.setValue();
		$('#_cur').unbind("change");
		$('#_cur').unbind("keypress");
		$('#_cur').change(function(){
			$.turnPageBar.curValueSet();
		});
		$('#_cur').bind('keypress',function(event){
	            if(event.keyCode == "13")    
	            {
	            	$.turnPageBar.curValueSet();
	            	var curValue = $('#_cur').val();
	            	$.turnPageBar.param.cur = curValue;
	            	$.turnPageBar.param.start = (curValue-1)*$.turnPageBar.param.size+1;
	            	$.turnPageBar.setValue();
					$.turnPageBar.reload($.turnPageBar.param.start-1,$.turnPageBar.param.size);
					$("#_pre").removeAttr("disabled");
					$("#_first").removeAttr("disabled");
					$("#_next").removeAttr("disabled");
					$("#_last").removeAttr("disabled");
	            	if(curValue >= $.turnPageBar.param.sumPage){
						$("#_next").attr("disabled","disabled");
						$("#_last").attr("disabled","disabled");
					}
					if(curValue <= 1){
						$("#_pre").attr("disabled","disabled");
						$("#_first").attr("disabled","disabled");
					}

	            }
	        });
	    $("#_next").unbind("click");
		$("#_next").click(function(){
			$.turnPageBar.param.cur += 1;
			$.turnPageBar.param.start += $.turnPageBar.param.size;
			if($.turnPageBar.param.cur == $.turnPageBar.param.sumPage){
				$.turnPageBar.param.to += ($.turnPageBar.param.sum - ($.turnPageBar.param.cur-1)*$.turnPageBar.param.size);
			}else{
				$.turnPageBar.param.to += $.turnPageBar.param.size;
			}
			$.turnPageBar.setValue();
			$.turnPageBar.reload($.turnPageBar.param.start-1,$.turnPageBar.param.size);
			if($.turnPageBar.param.cur >= $.turnPageBar.param.sumPage){
				$("#_next").attr("disabled","disabled");
				$("#_last").attr("disabled","disabled");
			}
			$("#_pre").removeAttr("disabled");
			$("#_first").removeAttr("disabled");
		});
		$("#_pre").unbind("click");
		$("#_pre").click(function(){
			$.turnPageBar.param.cur -= 1;
			$.turnPageBar.param.start -= $.turnPageBar.param.size;
			if($.turnPageBar.param.cur + 1 == $.turnPageBar.param.sumPage){
				$.turnPageBar.param.to -= ($.turnPageBar.param.sum - $.turnPageBar.param.cur*$.turnPageBar.param.size);
			}else{
				$.turnPageBar.param.to -= $.turnPageBar.param.size;
			}
			$.turnPageBar.setValue();
			$.turnPageBar.reload($.turnPageBar.param.start-1,$.turnPageBar.param.size);
			if($.turnPageBar.param.cur <= 1){
				$("#_pre").attr("disabled","disabled");
				$("#_first").attr("disabled","disabled");
			}
			$("#_next").removeAttr("disabled");
			$("#_last").removeAttr("disabled");
		});
		$("#_first").unbind("click");
		$("#_first").click(function(){
			$.turnPageBar.param.cur = 1;
			$.turnPageBar.param.start = 1;
			$.turnPageBar.param.to = $.turnPageBar.param.size;
			$.turnPageBar.setValue();
			$.turnPageBar.reload($.turnPageBar.param.start-1,$.turnPageBar.param.size);
			$("#_pre").attr("disabled","disabled");
			$("#_first").attr("disabled","disabled");
			if($.turnPageBar.param.sumPage > 1){
				$("#_next").removeAttr("disabled");
				$("#_last").removeAttr("disabled");
			}else{
				$("#_next").attr("disabled","disabled");
				$("#_last").attr("disabled","disabled");
			}
		});
		$("#_last").unbind("click");
		$("#_last").click(function(){
			$.turnPageBar.param.cur = $.turnPageBar.param.sumPage;
			$.turnPageBar.param.start = $.turnPageBar.param.size*($.turnPageBar.param.sumPage-1)+1;
			$.turnPageBar.param.to = $.turnPageBar.param.sum;
			$.turnPageBar.setValue();
			$.turnPageBar.reload($.turnPageBar.param.start-1,$.turnPageBar.param.size);
			$("#_next").attr("disabled","disabled");
			$("#_last").attr("disabled","disabled");
			if($("#_sumPage").text() > 1){
				$("#_pre").removeAttr("disabled");
				$("#_first").removeAttr("disabled");
			}else{
				$("#_pre").attr("disabled","disabled");
				$("#_first").attr("disabled","disabled");
			}
		});
		$("#_fresh").unbind("click");
		$("#_fresh").click(function(){
			$.turnPageBar.refresh();
		});
	}
};