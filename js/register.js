/* This is only of the check box in register.jsp*/

$(function () {			
    $('.button-checkbox').each(function () {

        // Settings
        var $widget = $(this),
            $button = $widget.find('button'),
            $checkbox = $widget.find('input:checkbox'),
            color = $button.data('color'),
            settings = {
                on: {
                    icon: 'glyphicon glyphicon-check'
                },
                off: {
                    icon: 'glyphicon glyphicon-unchecked'
                }
            };

        // Event Handlers
        $button.on('click', function () {
            $checkbox.prop('checked', !$checkbox.is(':checked'));
            $checkbox.triggerHandler('change');
            updateDisplay();
        });
        $checkbox.on('change', function () {
            updateDisplay();
        });

        // Actions
        function updateDisplay() {
            var isChecked = $checkbox.is(':checked');

            // Set the button's state
            $button.data('state', (isChecked) ? "on" : "off");

            // Set the button's icon
            $button.find('.state-icon')
                .removeClass()
                .addClass('state-icon ' + settings[$button.data('state')].icon);

            // Update the button's color
            if (isChecked) {
                $button
                    .removeClass('btn-default')
                    .addClass('btn-' + color + ' active');
            }
            else {
                $button
                    .removeClass('btn-' + color + ' active')
                    .addClass('btn-default');
            }
        }

        // Initialization
        function init() {

            updateDisplay();

            // Inject the icon if applicable
            if ($button.find('.state-icon').length == 0) {
                $button.prepend('<i class="state-icon ' + settings[$button.data('state')].icon + '"></i>');
            }
        }
        init();
    });
});
var hasUsername=0;
var goodUsername = 0;
var haspwd=0;
var goodPassword = 0;
var haspwdConfirm=0;
var matchPassword = 0;        	
var hasEmail = 0;
var goodEmail = 0;//check email is or not exist
var goodEmailRule=0;//check email rule            
var hasRealName = 0;
var hasPhone=0;
var hasCompany=0;
var hasAddress=0;
var hasCheck=0;
function checkEmail(){
    var email = document.getElementById("email").value;
    if(email === null || email.toString().trim() === ""){
    	$('#emailExist').addClass('hidden');
        $('#emailAvailable').addClass('hidden');
    	return;
    }else{
    	$('#emailCheck').addClass('hidden');
    }
    $.ajax({
        type:   "post",
        url:    "judgeEmailUnique.action",
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        data:{
            email : email
        },
        success:    function( a, b, c){
            var info = c.responseJSON.info;
            if(info === "false"){
                $('#emailCheck').addClass('hidden');
                $('#emailExist').removeClass('hidden');
                //$('#emailAvailable').addClass('hidden');
                goodEmail = 0;
            }else{
                $('#emailCheck').addClass('hidden');
                $('#emailExist').addClass('hidden');
                //$('#emailAvailable').removeClass('hidden');
                goodEmail = 1;
            }
        }
    });
}
//检查输入电子邮箱是否规范
function checkEmailRule(){
  var email=document.getElementById("email").value;
  var emailrule= /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if(emailrule.test(email))
  {
    $('#emailCheckRule').addClass('hidden');
    goodEmailRule=1;
  }
  else
  {
    $('#emailCheckRule').removeClass('hidden');
    goodEmailRule=0;
  }
}

function checkUsername(){
    var username = document.getElementById("userName").value;
    if(username === null || username.toString().trim() === ""){
    	$('#usernameExist').addClass('hidden');
        $('#usernameAvailable').addClass('hidden');
    	return;
    }
    $.ajax({
        type:   "post",
        url:    "judgeUserNameUnique.action",
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        data:{
            userName : username
        },
        success:    function( a, b, c){
            var info = c.responseJSON.info;
            if(info === "false"){
                $('#usernameCheck').addClass('hidden');
                $('#usernameExist').removeClass('hidden');
                //$('#usernameAvailable').addClass('hidden');
                goodUsername = 0;
            }else{
                $('#usernameCheck').addClass('hidden');
                $('#usernameExist').addClass('hidden');
                //$('#usernameAvailable').removeClass('hidden');
                goodUsername = 1;
            }
        }
    });
}

function pwdComplx()
{
    var pwd = document.getElementById("password").value;
    var userName = document.getElementById("userName").value;
    //minimum 8 characters
	var bad = /(?=.{8,}).*/;
	//Alpha Numeric plus minimum 8
	var good = /^(?=\S*?[a-z])(?=\S*?[0-9])\S{8,}$/;
	//Must contain at least one upper case letter, one lower case letter and (one number OR one special char).
	var better = /^(?=\S*?[A-Z])(?=\S*?[a-z])((?=\S*?[0-9])|(?=\S*?[^\w\*]))\S{8,}$/;
	//Must contain at least one upper case letter, one lower case letter and (one number AND one special char).
	var best = /^(?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9])(?=\S*?[^\w\*])\S{8,}$/;
	if(pwd != null || pwd.toString().trim() != "")
	{
	$('#pwdCheck').addClass('hidden');
    if (userName === pwd){
    	$('#pwdSimple').addClass('hidden');
        $('#pwdWeak').addClass('hidden');
        $('#pwdMedium').addClass('hidden');
        $('#pwdStrong').addClass('hidden');
        $('#pwdUsernameSame').removeClass('hidden');
        goodPassword = 0;
    }
    else if (false == good.test(pwd))
    {
        $('#pwdSimple').removeClass('hidden');
        $('#pwdWeak').addClass('hidden');
        $('#pwdMedium').addClass('hidden');
        $('#pwdStrong').addClass('hidden');
        $('#pwdUsernameSame').addClass('hidden');
        goodPassword = 0;
    }
    else if (best.test(pwd))
    {
        $('#pwdSimple').addClass('hidden');
        $('#pwdWeak').addClass('hidden');
        $('#pwdMedium').addClass('hidden');
        $('#pwdStrong').removeClass('hidden');
        $('#pwdUsernameSame').addClass('hidden');
        goodPassword = 1;
    }
    else if (better.test(pwd))
    {
        $('#pwdSimple').addClass('hidden');
        $('#pwdWeak').addClass('hidden');
        $('#pwdMedium').removeClass('hidden');
        $('#pwdStrong').addClass('hidden');
        $('#pwdUsernameSame').addClass('hidden');
        goodPassword = 1;
    }
    else
    {
        $('#pwdSimple').addClass('hidden');
        $('#pwdWeak').removeClass('hidden');
        $('#pwdMedium').addClass('hidden');
        $('#pwdStrong').addClass('hidden');
        $('#pwdUsernameSame').addClass('hidden');
        goodPassword = 1;
    }}
    else{
      $('#pwdStrong').removeClass('hidden');
    }
}

function pwdMatchChk(){
    var pwd = document.getElementById('password').value;
    var pwd_con = document.getElementById('password_confirmation').value;
    if(pwd === pwd_con && pwd.toString().trim() != "" && pwd_con.toString().trim() != ""){
        $('#pwdconfirmCheck').addClass('hidden');
        $('#pwdMatch').removeClass('hidden');
        $('#pwdNotMatch').addClass('hidden');
        matchPassword = 1;
    }else if(pwd_con.toString().trim() != ""){
        $('#pwdconfirmCheck').addClass('hidden');
        $('#pwdMatch').addClass('hidden');
        $('#pwdNotMatch').removeClass('hidden');
        matchPassword = 0;
    }else{
        $('#pwdconfirmCheck').removeClass('hidden');
        $('#pwdMatch').addClass('hidden');
        $('#pwdNotMatch').addClass('hidden');
        matchPassword = 0;
    }
}

function checkAll(){
    //var checked=document.getElementById('t_and_c').checked;
    if(document.getElementById('t_and_c').checked==false)
    {
      $('#agreeCheck').removeClass('hidden');
      hasCheck=0;
    }else
    {
      $('#agreeCheck').addClass('hidden');
      hasCheck=1;
    }
    var userName = document.getElementById('userName').value;
    if(userName == null || userName.toString().trim() == ""){
        $('#usernameCheck').removeClass('hidden');
        hasUsername = 0;
    }else{
        $('#usernameCheck').addClass('hidden');
        hasUsername = 1;
        checkUsername();
    }
    var password = document.getElementById('password').value;
if(password == null || password.toString().trim() == ""){
$('#pwdCheck').removeClass('hidden');
haspwd = 0;
}else{
$('#pwdCheck').addClass('hidden');
haspwd = 1;
}
var passwordconfirm = document.getElementById('password_confirmation').value;
if(passwordconfirm== null || passwordconfirm.toString().trim() == ""){
$('#pwdconfirmCheck').removeClass('hidden');
haspwdConfirm = 0;
}else{
$('#pwdconfirmCheck').addClass('hidden');
haspwdConfirm = 1;
}
var phone = document.getElementById('phone').value;
if(phone == null || phone.toString().trim() == ""){
$('#phoneCheck').removeClass('hidden');
hasPhone = 0;
}else{
$('#phoneCheck').addClass('hidden');
hasPhone = 1;
}
var company = document.getElementById('company').value;
if(company == null || company.toString().trim() == ""){
$('#companyCheck').removeClass('hidden');
hasCompany = 0;
}else{
$('#companyCheck').addClass('hidden');
hasCompany = 1;
}
var address = document.getElementById('address').value;
if(address == null || address.toString().trim() == ""){
$('#addressCheck').removeClass('hidden');
hasAddress = 0;
}else{
$('#addressCheck').addClass('hidden');
hasAddress = 1;
}
    var realName = document.getElementById('realName').value;
    if(realName == null || realName.toString().trim() == ""){
        $('#realNameCheck').removeClass('hidden');
        hasRealName = 0;
    }else{
        $('#realNameCheck').addClass('hidden');
        hasRealName = 1;
    }
    var email = document.getElementById('email').value;
    if(email == null || email.toString().trim() == ""){
        $('#emailCheck').removeClass('hidden');
        hasEmail = 0;
        //goodEmail = 0;
    }else{
        $('#emailCheck').addClass('hidden');
        hasEmail = 1;
        checkEmail();
        checkEmailRule();
    }
    
    if( ( hasUsername & goodUsername & haspwd  & goodPassword & haspwdConfirm 
    & matchPassword & hasEmail & goodEmail & goodEmailRule & hasRealName & hasPhone & hasCompany & hasAddress & hasCheck) === 1 ){
        return true;
    }else{
    	if(goodUsername === 0 || hasUsername===0){
    		
            document.getElementById('userName').focus();
    	}else if( goodPassword === 0 || haspwd===0){
            document.getElementById('password').focus();
        }else if(matchPassword === 0 || haspwdConfirm===0){
            document.getElementById('password_confirmation').focus();
        }else if(hasRealName === 0){
            document.getElementById('realName').focus();
        }else if(goodEmail === 0||hasEmail===0||goodEmailRule===0){
    		document.getElementById('email').focus();
        }else if(hasPhone === 0){
            document.getElementById('phone').focus();
        }else if(hasCompany===0){
            document.getElementById('company').focus();
        }else if(hasAddress===0){
            document.getElementById('address').focus();
        }else if(hasCheck===0){
            document.getElementById('agreebtn').focus();
        } 
		$('#submit_btn').removeClass('btn btn-primary m-progress');
        $('#submit_btn').addClass('btn btn-primary');		
        return false;
    }
}

function loadingDisplay(){
	$('#submit_btn').removeClass('btn btn-primary');				
	$('#submit_btn').addClass('btn btn-primary m-progress');
}

$(function(){
	$('#submit_btn').removeClass('btn btn-primary m-progress');	
	$('#submit_btn').addClass('btn btn-primary');							
});

function checkRealName(){
    var realName = document.getElementById('realName').value;
	if(realName != null && realName.toString().trim() != ""){
        $('#realNameCheck').addClass('hidden');
    }
}
function checkphone(){
    var phone = document.getElementById('phone').value;
	if(realName != null && realName.toString().trim() != ""){
        $('#phoneCheck').addClass('hidden');
    }
}
function checkcompany(){
    var company = document.getElementById('company').value;
	if(company != null && company.toString().trim() != ""){
        $('#companyCheck').addClass('hidden');
    }
}
function checkaddress(){
    var address = document.getElementById('address').value;
	if(address != null && address.toString().trim() != ""){
        $('#addressCheck').addClass('hidden');
    }
}
function checkCheck(){
    if(document.getElementById('t_and_c').checked==true)
    {
      //$('#agreeCheck').removeClass('hidden');
    }
    else{
      $('#agreeCheck').addClass('hidden');
    }
}