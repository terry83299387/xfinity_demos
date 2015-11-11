$(function(){
	/**内置校验
	 *  required()	Boolean	必填验证元素。
		required(dependency-expression)	Boolean	必填元素依赖于表达式的结果。
		required(dependency-callback)	Boolean	必填元素依赖于回调函数的结果。
		remote(url)	Boolean	请求远程校验。url 通常是一个远程调用方法。
		minlength(length)	Boolean	设置最小长度。
		maxlength(length)	Boolean	设置最大长度。
		rangelength(range)	Boolean	设置一个长度范围 [min,max]。
		min(value)	Boolean	设置最小值。
		max(value)	Boolean	设置最大值。
		email()	Boolean	验证电子邮箱格式。
		range(range)	Boolean	设置值的范围。
		url()	Boolean	验证 URL 格式。
		date()	Boolean	验证日期格式（类似 30/30/2008 的格式，不验证日期准确性只验证格式）。
		dateISO()	Boolean	验证 ISO 类型的日期格式。
		dateDE()	Boolean	验证德式的日期格式（29.04.1994 或 1.1.2006）。
		number()	Boolean	验证十进制数字（包括小数的）。
		digits()	Boolean	验证整数。
		creditcard()	Boolean	验证信用卡号。
		accept(extension)	Boolean	验证相同后缀名的字符串。
		equalTo(other)	Boolean	验证两个输入框的内容是否相同。
		phoneUS()	Boolean	验证美式的电话号码。
		具体还可参看http://www.runoob.com/jquery/jquery-plugin-validate.html
	 */
// 手机号码验证
	jQuery.validator.addMethod("mobile", function(value, element) {
	    var length = value.length;
	    var mobile =  /^(((13[0-9]{1})|(15[0-9]{1}))+\d{8})$/
	    return this.optional(element) || (length == 11 && mobile.test(value));
	}, "手机号码格式错误");   
	
	
	// 电话号码验证   
	jQuery.validator.addMethod("phone", function(value, element) {
	    var tel = /^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/;
	    return this.optional(element) || (tel.test(value));
	}, "电话号码格式错误");
	
	
	// 邮政编码验证   
	jQuery.validator.addMethod("zipCode", function(value, element) {
	    var tel = /^[0-9]{6}$/;
	    return this.optional(element) || (tel.test(value));
	}, "邮政编码格式错误");
	
	
	// QQ号码验证   
	jQuery.validator.addMethod("qq", function(value, element) {
	    var tel = /^[1-9]\d{4,9}$/;
	    return this.optional(element) || (tel.test(value));
	}, "qq号码格式错误");
	
	
	// IP地址验证
	jQuery.validator.addMethod("ip", function(value, element) {
	    var ip = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
	    return this.optional(element) || (ip.test(value) && (RegExp.$1 < 256 && RegExp.$2 < 256 && RegExp.$3 < 256 && RegExp.$4 < 256));
	}, "Ip地址格式错误");
	
	
	// 字母和数字的验证
	jQuery.validator.addMethod("chrnum", function(value, element) {
	    var chrnum = /^([a-zA-Z0-9]+)$/;
	    return this.optional(element) || (chrnum.test(value));
	}, "只能输入数字和字母(字符A-Z, a-z, 0-9)");
	
	
	// 中文的验证
	jQuery.validator.addMethod("chinese", function(value, element) {
	    var chinese = /^[\u4e00-\u9fa5]+$/;
	    return this.optional(element) || (chinese.test(value));
	}, "只能输入中文");
	
	
	// 下拉框验证
	$.validator.addMethod("selectNone", function(value, element) {
	    return value == "请选择";
	}, "必须选择一项");
	
	
	// 字节长度验证
	jQuery.validator.addMethod("byteRangeLength", function(value, element, param) {
	    var length = value.length;
	    for (var i = 0; i < value.length; i++) {
	        if (value.charCodeAt(i) > 127) {
	            length++;
	        }
	    }
	    return this.optional(element) || (length >= param[0] && length <= param[1]);
	}, $.validator.format("请确保输入的值在{0}-{1}个字节之间(一个中文字算2个字节)"));
	
	// 字符验证   可以包括中文字符
	jQuery.validator.addMethod("stringCheck", function(value, element) {   
	  return this.optional(element) || /^[\u0391-\uFFE5\w\-]+$/.test(value);  
	}, "只能包括中文字、中文字符、英文字母、数字和下划线"); 
	//字符验证   不包括中文字符
	jQuery.validator.addMethod("stringCheck2", function(value, element) {   
	  return this.optional(element) || /^[\u4e00-\u9fa5\w\-]+$/.test(value);   
	}, "只能包括中文字、英文字母、数字和下划线"); 
	// 用户名验证
	jQuery.validator.addMethod("userNameCheck", function(value, element) {   
	  return this.optional(element) || /^[a-zA-Z0-9_-\u4e00-\u9fa5]+$/.test(value);   
	}, "只能包括英文字母、数字和下划线");
	   
	// 中文字两个字节   
	jQuery.validator.addMethod("byteRangeLength", function(value, element, param) {   
	  var length = value.length;   
	  for(var i = 0; i < value.length; i++){   
	  if(value.charCodeAt(i) > 127){   
	  length++;   
	  }   
	  }   
	  return this.optional(element) || ( length >= param[0] && length <= param[1] );   
	}, "请确保输入的值在3-15个字节之间(一个中文字算2个字节)");   
	   
	// 身份证号码验证   
	jQuery.validator.addMethod("isIdCardNo", function(value, element) {   
	  return this.optional(element) || isIdCardNo(value);   
	}, "请正确输入您的身份证号码");   
	    
	// 手机号码验证   
	jQuery.validator.addMethod("isMobile", function(value, element) {   
	  var length = value.length;   
	  var mobile = /^(((13[0-9]{1})|(15[0-9]{1}))+\d{8})$/;   
	  return this.optional(element) || (length == 11 && mobile.test(value));   
	}, "请正确填写您的手机号码");   
	    
	// 电话号码验证   
	jQuery.validator.addMethod("isTel", function(value, element) {   
	  var tel = /^\d{3,4}-?\d{7,9}$/; //电话号码格式010-12345678   
	  return this.optional(element) || (tel.test(value));   
	}, "请正确填写您的电话号码");   
	   
	// 联系电话(手机/电话皆可)验证   
	jQuery.validator.addMethod("isPhone", function(value,element) {   
	  var length = value.length;   
	  var mobile = /^(((13[0-9]{1})|(15[0-9]{1}))+\d{8})$/;   
	  var tel = /^\d{3,4}-?\d{7,9}$/;   
	  return this.optional(element) || (tel.test(value) || mobile.test(value));   
	}, "请正确填写您的联系电话");   
	    
	// 邮政编码验证   
	jQuery.validator.addMethod("isZipCode", function(value, element) {   
	  var tel = /^[0-9]{6}$/;   
	  return this.optional(element) || (tel.test(value));   
	}, "请正确填写您的邮政编码");  
	
	// 判断是否为空
	jQuery.validator.addMethod("stringNotNull", function(value, element) {   
	  if(!value || $.trim(value) == ""){
	  	return false;
	  }else{
	  	return true;
	  }
	}, "不能为空");   
	
	//验证日期大于当前日期,允许为空
	 jQuery.validator.addMethod("dateAfterNow", function(value, element) { 
	 		if(!value){
	 			return true;
	 		}
            var now = new Date();
            var date = new Date(Date.parse(value.replace("-", "/")));
            return date > now;
        },"必须大于当前日期");
        
      //验证日期大于等于当前日期,允许为空
	 jQuery.validator.addMethod("dateAfterAndEqualNow", function(value, element) { 
	 		if(!value){
	 			return true;
	 		}
            var now = new Date();
            if(value.length<11){
            	value += " 23:59:59"
            }
            var date = new Date(Date.parse(value.replace("-", "/")));
            return date >= now;
        },"必须大于等于当前日期");
        
      //验证结束日期大于开始日期
	 jQuery.validator.addMethod("endDateAfterStartDate", function(value, element,param) { 
	 		var startDate = param[0],endDate = param[1];
	 		if(!endDate){
	 			return true;
	 		}
	 		if(!startDate){
	 			return false;
	 		}
            var now = new Date();
            startDate = new Date(Date.parse(startDate.replace("-", "/")));
            endDate = new Date(Date.parse(endDate.replace("-", "/")));
            return endDate > startDate;
        },"结束日期必须大于开始日期");
});