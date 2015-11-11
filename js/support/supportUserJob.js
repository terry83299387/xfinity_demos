$(function(){
	$("a[name='appShow']").click(function(){
		var id=$(this).attr("id");
		$(this).addClass("hide");
		$(this).prev().removeClass("hide");
		$("table[id="+id+"Table]").removeClass("hide");
		//$("div[id="+id+"Table]").show();
	});
	$("a[name='appHide']").click(function(){
		var id=$(this).attr("id");
		$(this).addClass("hide");
		$(this).next().removeClass("hide");
		$("table[id="+id+"Table]").addClass("hide");
		//$("div[id="+id+"Table]").hide();
	});
	
});