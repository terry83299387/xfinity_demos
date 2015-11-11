var labelCol = 'col-sm-3';
var inputCol = 'col-sm-6';
var btnCol = 'col-sm-2';
var wBtnCol = 'col-sm-3';
var COMP = {
	singleFile : $(' <div class="form-group" compType="x_singleFile"><div class="'+labelCol+'"><label id="x_singleFileLabel" class="control-label" style="cursor: text;">单文件输入</label>'
				+'<input type="text" class="form-control hide" name="label" id="x_singleFileLabelInput" placeholder="">'
				+'<i class="fa fa-fw fa-question-circle hide" style="cursor:pointer;" data-placement="right" data-toggle="tooltip" title=""></i>'
				+'</div><div class="col-md-2"><select class="form-control"><option value="">本地</option><option value="">主机</option>'
				+'</select></div><div class="col-md-4"><input type="text" class="form-control" id="x_singleFile" tag="input"></div><div class="'+btnCol+'">'
				+'<a class="btn btn-block btn-primary"><i class="fa fa-fw fa-folder-open-o"></i>浏览</a></div>' 
				+'<div name="removeCom" class="pull-right hide"><a class="btn"><i class="fa fa-fw -open-o fa-close  text-danger"></i></a></div></div>'),
   textField: $('<div class="form-group" compType="x_textField"><div class="'+labelCol+'"><label id="x_textFieldLabel" class="control-label" style="cursor: text;">字符输入</label>'
				+'<input type="text" class="form-control hide" name="label" id="x_textFieldLabelInput" placeholder="">'
				+'<i class="fa fa-fw fa-question-circle hide" style="cursor:pointer;" data-placement="right" data-toggle="tooltip" title=""></i>'
				+'</div><div class="'+inputCol+'"><input type="text" class="form-control" id="x_textField" tag="input"></div>' 
				+'<div name="removeCom" class="pull-right hide"><a class="btn"><i class="fa fa-fw -open-o fa-close  text-danger"></i></a></div></div>'),
   numField: $('<div class="form-group" compType="x_numField"><div class="'+labelCol+'"><label id="x_numFieldLabel" class="control-label" style="cursor: text;">数字输入</label>'
				+'<input type="text" class="form-control hide" name="label" id="x_numFieldLabelInput" placeholder="">'
				+'<i class="fa fa-fw fa-question-circle hide" style="cursor:pointer;" data-placement="right" data-toggle="tooltip" title=""></i>'
				+'</div><div class="'+inputCol+'"><input type="number" class="form-control" id="x_numField" placeholder="0" tag="input"></div>' 
				+'<div name="removeCom" class="pull-right hide"><a class="btn"><i class="fa fa-fw -open-o fa-close  text-danger"></i></a></div></div>'),
   textArea: $('<div class="form-group" compType="x_textArea"><div class="'+labelCol+'"><label id="x_textAreaLabel" class="control-label" style="cursor: text;">文本输入</label>'
				+'<input type="text" class="form-control hide" name="label" id="x_textAreaLabelInput" placeholder="">'
				+'<i class="fa fa-fw fa-question-circle hide" style="cursor:pointer;" data-placement="right" data-toggle="tooltip" title=""></i>'
				+'</div><div class="'+inputCol+'"><textarea type="text" class="form-control" id="x_textArea" tag="input"></textArea></div>' 
				+'<div name="removeCom" class="pull-right hide"><a class="btn"><i class="fa fa-fw -open-o fa-close  text-danger"></i></a></div></div>'),
   comboBox: $('<div class="form-group" compType="x_comboBox"><div class="'+labelCol+'"><label id="x_comboBoxLabel" class="control-label" style="cursor: text;">下拉列表</label>'
				+'<input type="text" class="form-control hide" name="label" id="x_comboBoxLabelInput" placeholder="">'
				+'<i class="fa fa-fw fa-question-circle hide" style="cursor:pointer;" data-placement="right" data-toggle="tooltip" title=""></i>'
				+'</div><div class="'+inputCol+'"><select id="x_comboBox" class="form-control" tag="input"></select></div>'
				+'<div name="removeCom" class="pull-right hide"><a class="btn"><i class="fa fa-fw -open-o fa-close  text-danger"></i></a></div></div>'),
   remoteFile: $(' <div class="form-group" compType="x_remoteFile"><div class="'+labelCol+'"><label id="x_remoteFileLabel" class="control-label" style="cursor: text;">主机执行</label>'
				+'<input type="text" class="form-control hide" name="label" id="x_remoteFileLabelInput" placeholder="">'
				+'<i class="fa fa-fw fa-question-circle hide" style="cursor:pointer;" data-placement="right" data-toggle="tooltip" title=""></i>'
				+'</div><div class="'+inputCol+'"><input type="text" class="form-control" id="x_remoteFile" tag="input"></div><div class="'+btnCol+'">'
				+'<a class="btn btn-block btn-primary"><i class="fa fa-fw fa-folder-open-o"></i>浏览</a></div>' 
				+'<div name="removeCom" class="pull-right hide"><a class="btn"><i class="fa fa-fw -open-o fa-close  text-danger"></i></a></div></div>'),
   multipleFile: $('<div class="form-group" compType="x_multiple"><div class="'+labelCol+'"><label id="x_multipleFileLabel" class="control-label" style="cursor: text;">多文件输入</label>'
				+'<input type="text" class="form-control hide" name="label" id="x_multipleFileLabelInput" placeholder="">'
				+'<i class="fa fa-fw fa-question-circle hide" style="cursor:pointer;" data-placement="right" data-toggle="tooltip" title=""></i>'
				+'</div><div class="'+wBtnCol+'">'
                +'<a class="btn btn-block btn-primary"><i class="fa fa-fw fa-upload"></i>本地</a></div>'
                +'<div class="'+wBtnCol+'"><a class="btn btn-block btn-primary"><i class="fa fa-fw fa-soundcloud"></i>主机</a></div>' 
				+'<div name="removeCom" class="pull-right hide"><a class="btn"><i class="fa fa-fw -open-o fa-close  text-danger"></i></a></div></div>')
};
var COMP_TYPE = {
	x_jobName:"作业名",
	x_description:"作业描述",
	x_workDir:"工作目录",
	x_coreNumber:"核数",
	x_singleFile:"单文件输入",
	x_textField:"字符输入",
	x_numField:"数字输入",
	x_textArea:"文本输入",
	x_comboBox:"下拉列表",
	x_remoteFile:"主机执行",
	x_multipleFile:"多文件输入"
}
