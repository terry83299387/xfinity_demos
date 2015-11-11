var CMD = 'RUN="abaqus -ver=6.9.1 job= input="';
var EVENT ="";
var VALIDATE = "";
var editType = "";
var ID="";//所选中组件输入框（或下拉列表）组件的ID
var selectedCompId = "";//选中的组件ID
var editCompId = "";//正在编辑的组件ID
var number = 0;
var selectedComp = "";
var editor = "";
var guiName = "guiName";//模板名称
var guiCode = "";
var workDir = "/home/linux/users/rdtest/jieliu";
var selectedRecord = "";//选中的Combobox值

var compList = {//组件列表对象
};
var guiObject = { //模板
	name:guiName,
	cmd:CMD,
	compList:compList
};
function compObj(id,event,validate){//组件的事件、校验属性
	this.id = id; 
	this.event = event;
	this.validate = validate;
};

var setLabelDblClick = function(){
	$("label").unbind("dblclick");
	$("label").dblclick(function(){
		var _this = $(this);
		_this.hide();
		var inputFileLabelInputID = _this.attr("id")+"Input";
		var inputFileLabelInput = $("#"+inputFileLabelInputID);
		var labelText = _this.text();
		inputFileLabelInput.val(labelText);
		inputFileLabelInput.removeClass('hide');
		inputFileLabelInput.focus();
	});
	$("input[name='label']").unbind("blur");
	$("input[name='label']").blur(function (){
		var _this = $(this);
		var inputFileLabel = $("#"+_this.attr("id").replace("Input",""));
		var labelText = _this.val();
		_this.addClass('hide');
		inputFileLabel.text(labelText);
		inputFileLabel.show();
		setPropertise(selectedComp);
	});
};
var setPropertise = function(_this){
	setCompPropHide(false);
	var compID = _this.find('label').attr("id");
	ID = compID.replace("Label","");
	var comIdStr = '$("#'+ID+'")';
	EVENT = "//chang事件\n"+comIdStr+'.change(function(){\n\n});\n'+"\n//blur事件\n"+comIdStr+'.blur(function(){\n\n});';
	VALIDATE = comIdStr+'.rules("add",{\nminlength: 10, \nmessages: {\n\tminlength:"不少于10个字符"}\n});';
	selectedCompId = _this.attr("id");
	var event = compList[selectedCompId].event;
	var validate = compList[selectedCompId].validate;
	$("#_event").text(event?event:""); 
	$("#_validate").text(validate?validate:""); 
	$("#x_id").html(ID);
	$("#x_label").html(_this.find('label').text());
	$("#x_compType").html(COMP_TYPE[_this.attr("compType")]);
	$("#x_placeholder").html($("#"+ID).attr("placeholder")?$("#"+ID).attr("placeholder"):"");
	if($("#"+ID).attr("readonly") == "readonly"){
		$("#x_readOnly").attr("checked",true);
	}else{
		$("#x_readOnly").attr("checked",false);
	}
	var help = _this.find("i[data-toggle='tooltip']");
	var title = help.attr("title");
	if(title && $.trim(title) != ""){
		$("#x_help").html(title);
	}else{
		$("#x_help").html("");
	}
};
var setSelected = function(){
	$("[class=form-group]").unbind("hover");
	$("[class=form-group]").hover(function() {
		if($(this).attr("tag") != 1){
	   		$(this).attr("style","border:1px dashed #7399CC");
	   		$(this).find("div[name='removeCom']").removeClass('hide');
		}
  	},function() {
  		if($(this).attr("tag") != 1){
	    	$(this).removeAttr("style");
	    	$(this).find("div[name='removeCom']").addClass('hide');
  		}
	});
	$("[class=form-group]").unbind("click");
	$("[class=form-group]").click(function() {
		$("[class=form-group]").removeAttr('style tag');
		$("[name='removeCom']").addClass("hide");
		selectedComp = $(this);
		selectedComp.unbind("hover");
		selectedComp.attr("style","border:1px solid #7399CC");
		selectedComp.attr("tag","1");
		selectedComp.removeClass('hide');
		$(this).find("div[name='removeCom']").removeClass('hide');
		setPropertise(selectedComp);
		setUpAndDownMoveDisable(selectedComp);
	});
};
var setAddRecordClick = function(){
	$("#x_addRecord").unbind("click");
	$("#x_addRecord").click(function(){
		while(document.getElementById("#x_row"+number)){
			number ++;
		};
		var newRow = $("#x_row").clone(true);
		newRow.attr("id","#x_row"+number).removeClass("hide");
		var spanID_1 = newRow.find("td[name='text'] span").attr("id")+number;
		var spanID_2 = newRow.find("td[name='value'] span").attr("id")+number;
		
		var span_1 = newRow.find("td[name=text] span").attr("id",spanID_1);
		var span_2 = newRow.find("td[name=value] span").attr("id",spanID_2);
		
		newRow.find("td[name=text] input").attr("id",spanID_1+"Input");
		newRow.find("td[name=value] input").attr("id",spanID_2+"Input");
		newRow.find("input").removeClass("hide");
		newRow.appendTo("#x_table-body");
		span_1.hide();
		span_2.hide();
		setPropertiesInputBlur();
		number++;
	});
};
var setSelectRecordSelected = function(){
	$("[name=selectRecord]").unbind("click");
	$("[name=selectRecord]").click(function() {
		$("[name=selectRecord]").removeClass('success danger');
		selectedRecord = $(this);
		selectedRecord.addClass("success");
	});
}
var setUpAndDownMoveDisable = function(comp){
	var preComp = comp.prev();
	var nextComp = comp.next();
	if(preComp.length > 0){
		$("#x_upMove").removeClass("disabled");
	}else{
		$("#x_upMove").addClass("disabled");
	}
	if(nextComp.length > 0){
		$("#x_downMove").removeClass("disabled");
	}else{
		$("#x_downMove").addClass("disabled");
	}
};
var setRemoveClick = function(){
	$("div[name=removeCom]").unbind("click");
	$("div[name=removeCom]").click(function(){
		$(this).parent().remove();
		if(selectedCompId == $(this).parent().attr("id")){
			setCompPropHide(true)
		}
	});
};
var setCompPropHide = function(bool){
	if(!selectedComp){
		return;
	}
	var compType = selectedComp.attr("compType");
	if(bool == true){
		$("#_compProperties").addClass("hide");
		$("#_compEvent").addClass("hide");
		$("#_validation").addClass("hide");
		if(compType == "x_comboBox"){
			$("#_compComboBoxValue").addClass("hide");
		}else{
			$("#_compComboBoxValue").removeClass("hide");
			setSelectRecordSelected();
			setAddRecordClick();
		};
	}else{
		$("#_compProperties").removeClass("hide");
		$("#_compEvent").removeClass("hide");
		$("#_validation").removeClass("hide");
		if(compType == "x_comboBox"){
			$("#_compComboBoxValue").removeClass("hide");
			setSelectRecordSelected();
			setAddRecordClick();
		}else{
			$("#_compComboBoxValue").addClass("hide");
		}
	}
	
}
var drag = function(){
	var move=false;//移动标记 
	var _x,_y;//鼠标离控件左上角的相对位置 
	$(".editorHead").mousedown(function(e){ 
		move=true; 
		_x=e.pageX-parseInt($(".drag").css("left")); 
		_y=e.pageY-parseInt($(".drag").css("top")); 
	}); 
	$(document).mousemove(function(e){ 
		if(move){ 
		var x=e.pageX-_x;//控件左上角到屏幕左上角的相对位置 
		var y=e.pageY-_y; 
		$(".drag").css({"top":y,"left":x}); 
		} 
	}).mouseup(function(){ 
		move=false; 
	}); 
};
var setPropertiesClick = function(){
	$("span[name='x_compProp']").unbind("dblclick");
	$("span[name='x_compProp']").dblclick(function(){
		var propId = $(this).attr("id"); 
		var inputId = propId+"Input";
		$(this).hide();
		var input = $("#"+inputId);
		input.val($(this).text());
		input.removeClass("hide");
		input.focus();
	});
	$("div[name='x_compPropLabel']").unbind("dblclick");
	$("div[name='x_compPropLabel']").dblclick(function(){
		var propId = $(this).attr("id").replace("Label",""); 
		var inputId = propId+"Input";
		$("#"+propId).hide();
		var input = $("#"+inputId);
		input.val($("#"+propId).text());
		input.removeClass("hide");
		input.focus();
	});
};
var comboboxAddOption = function(){
	var table = $("#x_table-body");
	var select = $("#"+ID).empty();
	$("tbody tr").each(function(){
		if($(this).attr("id") != "x_row") {
			var text = $(this).find("td[name='text'] span").text();
			var value = $(this).find("td[name='value'] span").html();
			var checked = $(this).find("td[name='radio'] input").attr("checked");
			if(checked == "checked"){
				selected = " selected='selected' ";
			}
			select.append("<option value='"+value+"'"+selected+">"+text+"</option>");
		}
	});
};
var fireCompSyncChange = function(propId,value){
	var inputId = selectedComp.find("[tag='input']").attr("id");
	var labelId = inputId+"Label";
	switch(propId){
		case "x_id":{
			$("#"+inputId).attr("id",value);
			break;
		}
		case "x_label":{
			$("#"+labelId).html(value);
			break;
		}
		case "x_placeholder":{
			$("#"+inputId).attr('placeholder',value);
			break;
		}
		case "x_help":{
			var helpOld = selectedComp.find("i[data-toggle='tooltip']");
			helpOld.tooltip('destroy');
			var help = selectedComp.find("i[data-toggle='tooltip']");
			help.attr('title',value);
			if($.trim(value) == ""){
				help.addClass("hide");
			}else{
				help.removeClass("hide");
				Xfinity.Util.showTooltip();
			}
			break;
		}
		default:{//combobox list
			comboboxAddOption();
		}
	}
};
var setPropertiesInputBlur = function(){
	$("input[name='x_compPropInput']").unbind("blur");
	$("input[name='x_compPropInput']").blur(function(){
		var inputId = $(this).attr("id");
		var propId = inputId.replace("Input","");
		$(this).addClass("hide");
		var prop = $("#"+propId);
		var value = $(this).val();
		prop.html(value);
		prop.show();
		fireCompSyncChange(propId,value);
	});
};
var newEditor = function(modeName){
	var newEditor = '';
	var editorTextID = document.getElementById("_editorText");
	newEditor = CodeMirror.fromTextArea(editorTextID, {
  				styleActiveLine: true,
			    lineNumbers: true,
			    autofocus:true,
			    mode:modeName,
			    width:'100%',
			    height:'95%',
			    autoCloseBrackets:true,
			    viewportMargin:1,
        		matchBrackets: true
			 });
    return newEditor;
};
var maxSizeEditor = function(){
	$("#_editor").attr("style","width:100%;height:95%;top:50px;left:0px;");
	editor.setSize("100%","90%");
	$("#maxSizeEditor").addClass("hide");
	$("#normalSizeEditor").removeClass("hide");
};
var normalSizeEditor = function(){
	$("#_editor").attr("style","width:80%;height:50%;");
	editor.setSize("100%","85%");
	$("#normalSizeEditor").addClass("hide");
	$("#maxSizeEditor").removeClass("hide");
};
var validate = function(){
	$("#template").validate({
			rules: {
			},
			messages: {
			}
		});
};
 
var initDefualtObj = function(){
	$("#template").find("div[compType]").each(function(){
		var id = $(this).attr("id");
		initObj(id);
	});
};
var initObj = function(id){
	var newCompObj = new compObj(id,"","");
	compList[id] = newCompObj;
	//delete person.age
};
var modifyProp = function(obj,prop,value){
	var str = obj+"."+prop+"="+value;
	eval(str);
};
var deleteProp = function(obj,prop){
	var str = "delete "+obj+"."+prop;
	eval(str);
};
var getAppSubmitGuiData = function(){
	$("[class=form-group]").removeAttr('style tag');
	$("[name='removeCom']").addClass("hide");
	var element = $("#x_guiForm").html();
	if(selectedComp) selectedComp.click();
	var name = guiName;
	var jsObject = JSON.stringify(guiObject);
	var eventJs = "";
	var validateJs = "";
	var cList = guiObject.compList;
	for (var i in cList){
		eventJs += cList[i].event+"\n";
		validateJs += cList[i].validate+"\n";
	}
	var js = "//event-------------\n"+eventJs+"\n//validate-------------\n"+validateJs;
	var data = {
		code:guiCode,
		element:element,
	    name:name,
	    jsObject:jsObject,
	    js:js
	}
	return data;
};
var saveAppSubmitGUI = function(){
	var data = getAppSubmitGuiData();
	var url = "addAppSubmitGui.action";
	if(guiCode){
		url = "updateAppSubmitGui.action";
	}
	jQuery.ajax({ 
				url: url,
				type: "POST",
				data:data,
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
						alert("保存失败");
					}else{
						if(!guiCode){
							guiCode = c.responseJSON.guiCode;
							addMyAppSubmitGUIToList(guiCode,guiName);
						}
						alert("保存成功");
				}},
				error:function(){
					alert("保存失败");
				}
			});
	
};
var addMyAppSubmitGUIToList = function(code,name){
	var newGui = $("#x_appGui").clone(true).attr("id",code);
	newGui.find("span").text(name);
	newGui.appendTo($("#x_app"));
	newGui.show();
	setMyAppSubmitGuiClick();
};
var initMyAppSubmitGUI = function(appSubmitGuiInfoList){
		$.each( appSubmitGuiInfoList, function(index, content){
			addMyAppSubmitGUIToList(content.appSubmitGuiCode,content.name);
		})
};
var getAppSubmitGUIList = function(){
	jQuery.ajax({ 
				url: "listAppSubmitGui.action",
				async: false,
				type: "POST",
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
					}else{
						var appSubmitGuiInfoList = c.responseJSON.appSubmitGuiInfoList;
						initMyAppSubmitGUI(appSubmitGuiInfoList);
				}},
				error:function(){
				}
			});
};
var loadAppSubmitGuiInfo = function(appSubmitGuiInfo){
	setCompPropHide(true);
	guiName = appSubmitGuiInfo.name;
	guiCode = appSubmitGuiInfo.appSubmitGuiCode;
	var element = appSubmitGuiInfo.element;
	guiObject = $.parseJSON(appSubmitGuiInfo.jsObject);
	compList = guiObject['compList'];
	$("#x_guiForm").find("form").remove();
	$(element).appendTo($("#x_guiForm"));
	commonSet();
	for (var i in compList){
		var eventJs = compList[i].event;
		var validateJs = compList[i].validate;
		eval(eventJs);
		eval(validateJs);
	}
};
var getAppSubmitGuiByCode = function(code){
	jQuery.ajax({ 
				url: "appSubmitGuiByCode.action",
				async: false,
				type: "POST",
				data:{code:code},
				contentType: "application/x-www-form-urlencoded; charset=utf-8",
				success: function(a,b,c){
					var exception = c.responseJSON.exception;
					if(exception){
					}else{
						var appSubmitGuiInfo = c.responseJSON.appSubmitGuiInfo;
						loadAppSubmitGuiInfo(appSubmitGuiInfo);
				}},
				error:function(){
				}
			});
};
var setMyAppSubmitGuiClick = function(){
	$("a[tag='myAppSubmitGui']").unbind('click');
	$("a[tag='myAppSubmitGui']").click(function(){
		var code = $(this).attr("id");
		getAppSubmitGuiByCode(code);
		$("a[tag='myAppSubmitGui']").removeClass("disabled");
		$(this).addClass("disabled");
	});
};
var defualtValue = function(){//默认值设置
	$("#x_workDir").val(workDir);
};
var commonSet = function(){
	defualtValue();
	validate();
	Xfinity.Util.showTooltip();
	setLabelDblClick();
	setSelected();
	setRemoveClick();
	setPropertiesClick();
	setPropertiesInputBlur();
};
$(function(){
	$("#_CMD").text(CMD);
	$("#x_appGui").hide();
	
	initDefualtObj();
	commonSet();
	drag();
	getAppSubmitGUIList();
	$(".fa-angle-up").parent().click(function(){
		var id = $(this).attr("name");
		$("#"+id).hide();
		$(this).addClass("hide");
		$(this).next().removeClass("hide");
	});
	$(".fa-angle-down").parent().click(function(){
		var id = $(this).attr("name");
		$("#"+id).show();
		$(this).addClass("hide");
		$(this).prev().removeClass("hide");
	});
	$("a[name='comp']").click(function(){
		var compId = $(this).attr('id');
		var newCompId = "x_"+compId;
		var id = newCompId+number+"_parent";
		var newComp = COMP[compId].clone(true);
		
		while(document.getElementById(newCompId+number)){//判断ID是否存在
			number ++;
		};
		newComp.attr("id",id);
		newComp.find("label[id='"+newCompId+"Label']").attr('id',newCompId+number+'Label');
		newComp.find("input[id='"+newCompId+"LabelInput']").attr('id',newCompId+number+"Label"+"Input");
		newComp.find("*[id='"+newCompId+"']").attr('id',newCompId + number).attr("name",newCompId + number);
		newComp.appendTo("#template");
		initObj(id);
		number++;
		setLabelDblClick();
		setSelected();
		setRemoveClick();
		
	});
	$("#editCmd").click(function(){
		editType = "CMD";
		$("#_editorText").val(CMD);
		$("#_editor").removeClass("hide");
		$("#_editor").removeAttr("style");
		$('.CodeMirror').remove();
		editor = newEditor('shell');
		
	});
	$("#editEvent").click(function(){
		editCompId = selectedCompId;
		editType = "EVENT";
		var event = compList[editCompId].event;
		$("#_editorText").val(event?event:EVENT);
		$("#_editor").removeClass("hide");
		$("#_editor").removeAttr("style");
		$('.CodeMirror').remove();
		editor = newEditor('javascript');
	});
	$("#editValidation").click(function(){
		editCompId = selectedCompId;
		editType = "VALIDATE";
		var validate = compList[editCompId].validate;
		$("#_editorText").val(validate?validate:VALIDATE);
		$("#_editor").removeAttr("style");
		$("#_editor").removeClass("hide");
		$('.CodeMirror').remove();
		editor = newEditor('javascript');
	});
	$("#closeEditor").click(function(){
		$("#_editor").addClass("hide");
	});
	$("#maxSizeEditor").click(function(){
		maxSizeEditor();
	});
	$("#normalSizeEditor").click(function(){
		normalSizeEditor();
	});
	$("#_saveEditorText").click(function(){
		switch(editType){
			case "CMD":{
				CMD = editor.getValue();
				$("#_CMD").text(CMD);
				break;
			}
			case "EVENT":{
				var event = editor.getValue();
				$("#_event").text(event); 
				$("#"+ID).unbind();
				compList[editCompId].event = event;
				if(event){
					eval(event);
				}
				break;
			}
			case "VALIDATE":{
				var validate = editor.getValue();
				$("#_validate").text(validate);
				compList[editCompId].validate = validate;
				if(validate){
					eval(validate);
				}else{
					
				}
				break;
			}
		}
	});
	$("#x_upMove").click(function(){
		var preComp = selectedComp.prev();
		if(preComp.length > 0){
			preComp.before(selectedComp);
			setUpAndDownMoveDisable(selectedComp);
		}
	});
	$("#x_downMove").click(function(){
		var nextComp = selectedComp.next();
		if(nextComp.length > 0){
			 nextComp.after(selectedComp);
			 setUpAndDownMoveDisable(selectedComp);
		}
	});
	$("#x_moveUpRecord").click(function(){
		var preComp = selectedRecord.prev();
		if(preComp.length > 0){
			preComp.before(selectedRecord);
//			setUpAndDownMoveDisable(selectedRecord);
		}
	});
	$("#x_moveDownRecord").click(function(){
		var nextComp = selectedRecord.next();
		if(nextComp.length > 0){
			 nextComp.after(selectedRecord);
//			 setUpAndDownMoveDisable(selectedComp);
		}
	});
	$("#x_readOnly").click(function() {
		var inputId = selectedComp.find('label').attr("id").replace("Label","");
		var input = $("#"+inputId); 
		if($(this).is(':checked')){
			input.attr("readonly", "readonly");  
		}else{
			input.removeAttr("readonly");
		}
	 });
	 $("#x_deleteRecord").click(function(){
	 	selectedRecord.remove();
	 	selectedRecord = "";
	 });
	 $("#x_saveGui").click(function(){
	 	saveAppSubmitGUI();
	 });
})

