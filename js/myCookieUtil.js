/*
 * 这里的cookie都写在根目录下，即路径均为"/"
 * 
 * */

//写cookies 
function mySetCookie(name,value) 
{ 
    var Days = 30; 
    var exp = new Date(); 
    exp.setTime(exp.getTime() + Days*24*60*60*1000); 
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString()+";path=/"; 
} 

function myAddCookie(name,value,days) 
{ 
    var exp = new Date(); 
    exp.setTime(exp.getTime() + days*24*60*60*1000); 
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString()+";path=/"; 
} 

//读取cookies 
function myGetCookie(name) 
{ 
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
 
    if(arr=document.cookie.match(reg))
 
        return unescape(arr[2]); 
    else 
        return null; 
} 

//删除cookies 
function myDelCookie(name) 
{ 
    var exp = new Date(); 
    exp.setTime(exp.getTime() - 10000); 
    var cval=myGetCookie(name); 
    if(cval!=null) 
        document.cookie= name + "="+"null"+";expires="+exp.toGMTString()+";path=/"; 
} 