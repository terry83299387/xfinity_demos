/**
 * @param softwareInfo the detail information of choosen software,
 *        includes softwareCode, softwareName, description, etc.
 * @param (optional) the object of other options
 */

var Template;
if (!Template) {
	Template = {};
}

// setup SyntaxHighlighter config
SyntaxHighlighter.config.space = '&nbsp;';
SyntaxHighlighter.config.useScriptTags = false;
SyntaxHighlighter.defaults['light'] = true;
SyntaxHighlighter.defaults['quick-code'] = false;
SyntaxHighlighter.defaults['auto-links'] = false;

Template.TemplateParserWithCmdEdit = function(softwareInfo, options) {
	// call super class constructor
	Template.TemplateParserWithCmdEdit
			.superclass.constructor.call(this, softwareInfo, options);

	/* --------------------- Constant Variables -------------------- */
	/**
	 * The id of script component
	 */
	this.SCRIPT_COMP_ID = '__script__';

	/* --------------------- Protected Fields -------------------- */
	this._reviewScriptPanel;
	this._advPanelVisible;

	/* --------------------- Local Variables -------------------- */

	/* ------------------------ override super class methods ----------------------- */
	// (override)
	this._superInitEvent = this._initEvents;
	this._initEvents = function() {
		this._superInitEvent();
		// addEvents() can take 1 or more arguments (event names) 
		this.addEvents(
			'scriptedit' // when click script edit button
		);
	};

	// (override)
	this._createInnerPanel = function() {
		var bbar = this._getBBar();
		this._reviewScriptPanel = this._createScriptEditPanel();

		this._innerPanel =  new Ext.Panel({
			id : this.id + 'submitPanel',
			title : this.getSoftwareName(),
			autoScroll : true,
			items : [this._reviewScriptPanel],
			bbar : bbar
		});

		return this._innerPanel;
	};

	// (override)
	this._getBBar = function() {
		var submitBtn = this._getSubmitButton();
		var saveBtn = this._getSaveButton();
		var nextBtn = this._getNextButton();
		var prevBtn = this._getPreviousButton();
		var editBtn = this._getEditButton();
		var finishBtn = this._getFinishEditButton();

		return new Ext.Toolbar({
			style : 'padding-left: 255px;',
			items : [nextBtn, prevBtn, saveBtn, submitBtn, '->', editBtn, finishBtn]
		});
	};

	// (override)
	this._superGetSubmitParam = this._getSubmitParam;
	this._getSubmitParam = function() {
		var param = this._superGetSubmitParam();

		// if script component is defined, update its value, or else ignore
		var scriptComp = this.getComponentByType(this.tplUtil.jsdlKeys.SCRIPT);
		if (scriptComp)
			param[this.SCRIPT_COMP_ID] = this._preprocessScript();

		return param;
	};

	// (override)
	this._superHandleValidError = this._handleValidError;
	this._handleValidError = function() {
		var submit = this._superHandleValidError();

		// switch to parameter page to show errors
		this._switchToParamPage();

		return false;
	};

	// (override)
	this._hidePlaceholderPanel = function() {
		this._reviewScriptPanel.hide();
	};

	/* ------------------------ protected methods ----------------------- */
	this._createScriptEditPanel = function() {
		return new Ext.Panel({
			id    : this.id + '_reviewScriptPanel',
			hidden : true,
			border : false,
			// Double-click the script or click "edit" button to edit it
			html  : '<div style="margin:5px 15px;">'
					+ '<div style="color:#008200;font-weight:bold;">'
					+ '<img src="images/template/08.gif"> ' + i18n.sww_edit_hotkey_tip + ' ('
					+ '<span id="' + this.id + '_scriptedit_expandbtn" style="cursor:pointer;text-decoration:underline;">'
					+ i18n.sww_script_param_expand_btn + '</span>)</div>'
					+ '<div class="syntaxhighlighter">'
						+ '<div id="' + this.id + '_scriptedit_params" style="display:none;"></div>'
						+ '<div id="' + this.id + '_scriptedit_container" class="syntaxhighlighter">&nbsp;</div>'
					+ '</div></div>'
		});
	};

	this._getNextButton = function() {
		return new Ext.Button({
			id   : this.id + '_nextBtn',
			text : i18n.sww_check_script,
			handler : this._switchToScriptPage,
			iconCls : 'hd-magnifier',
			tooltip : i18n.sww_check_script_tip,
			style   : 'margin-left: 5px;',
			scope   : this
		});
	};

	this._getPreviousButton = function() {
		return new Ext.Button({
			id   : this.id + '_prevBtn',
			text : i18n.sww_goback_param,
			handler : this._switchToParamPage,
			iconCls : 'hd_014',
			tooltip : i18n.sww_goback_param_tip,
			style   : 'margin-left: 5px;',
			hidden  : true,
			scope   : this
		});
	};

	this._getEditButton = function() {
		return new Ext.Button({
			id   : this.id + '_editBtn',
			text : i18n.sww_edit_script,
			handler : this._editScript,
			iconCls : 'jB_03',
			tooltip : i18n.sww_edit_script_tip,
			style   : 'margin-left: 5px;',
			hidden  : true,
			scope   : this
		});
	};

	this._getFinishEditButton = function() {
		return new Ext.Button({
			id   : this.id + '_finishBtn',
			text : i18n.sww_finish_edit,
			handler : this._editFinished,
			iconCls : 'hd_022',
			tooltip : i18n.sww_finish_edit_tip,
			style   : 'margin-left: 5px;',
			hidden  : true,
			scope   : this
		});
	};

	/* ------------------------ local & private methods ----------------------- */
	this._switchToScriptPage = function(btn, e) {
		var scriptComp = this.getComponentByType(this.tplUtil.jsdlKeys.SCRIPT);
		// if script component is not defined, show common preview
		if (!scriptComp) {
			this._preview();
			return;
		}

		this.fireEvent('scriptedit');

		// switch title
		this._innerPanel.setTitle(this.getSoftwareName() + ' - ' + i18n.sww_script_title);

		// btn == nextBtn
		var nextBtn = Ext.getCmp(this.id + '_nextBtn');
		nextBtn.hide();
		var prevBtn = Ext.getCmp(this.id + '_prevBtn');
		prevBtn.show();
		var editBtn = Ext.getCmp(this.id + '_editBtn');
		editBtn.show();

		this._formPanel.hide();
		this._advBtn.hide();
		// store advanced panel's visibility
		this._advPanelVisible = this._advFormPanel.isVisible();
		this._advFormPanel.hide();
		this._reviewScriptPanel.show();

		// init available parameters
		this._initParamContent();
		// default & restore to hide
		var paramsComp = Ext.get(this.id + '_scriptedit_params');
		paramsComp.hide();
		// update param content after submit and user chooses "new job" option
		var jobNameComp = this.getComponentByType(this.tplUtil.jsdlKeys.JOB_NAME);
		jobNameComp.addListener('loaded', this._initParamContent, this);

		// show & highlight the script
		var script = scriptComp.getValue();
		this._initScriptContent(script);
	};

	this._switchToParamPage = function(btn, e) {
		// switch title
		this._innerPanel.setTitle(this.getSoftwareName());

		// btn == prevBtn
		var prevBtn = Ext.getCmp(this.id + '_prevBtn');
		prevBtn.hide();
		var nextBtn = Ext.getCmp(this.id + '_nextBtn');
		nextBtn.show();
		var finishBtn = Ext.getCmp(this.id + '_finishBtn');
		finishBtn.hide();
		var editBtn = Ext.getCmp(this.id + '_editBtn');
		editBtn.hide();

		this._reviewScriptPanel.hide();
		this._formPanel.show();
		this._advBtn.show();
		// restore advanced panel's visibility
		this._advFormPanel.setVisible(this._advPanelVisible);

		// remove listener
		var jobNameComp = this.getComponentByType(this.tplUtil.jsdlKeys.JOB_NAME);
		jobNameComp.removeListener('loaded', this._initParamContent, this);
	};

	this._editScript = function(btn, e) {
		var scriptComp = Ext.get(this.id + '_scriptedit_content');
		var codeContainer = scriptComp.query('.container');
		codeContainer = codeContainer[0];

		codeContainer.setAttribute('contentEditable', true);
		codeContainer.style.border = '1px solid #aaccf6';
		codeContainer.style.cursor = 'text';
		// let only paste text format content, this is used to
		// handle that user copys & pasts rich format text,
		// such as MS Word/Excel/... content.
		if (window.clipboardData) {
			codeContainer.onpaste = function() {
				// transform clipboard data into text format and set it back
				var txt = clipboardData.getData('Text');
				if (txt) {
					clipboardData.setData('Text', txt);
				}

				return true;
			}
		}
		codeContainer.focus();

		var editBtn = Ext.getCmp(this.id + '_editBtn');
		editBtn.hide();
		var finishBtn = Ext.getCmp(this.id + '_finishBtn');
		finishBtn.show();

		var prevBtn = Ext.getCmp(this.id + '_prevBtn');
		prevBtn.disable();
		var submitBtn = Ext.getCmp(this.id + '_submitBtn');
		submitBtn.disable();
		var saveBtn = Ext.getCmp(this.id + '_saveBtn');
		saveBtn.disable();

		// finish the edit when presses the key ESC
		new Ext.KeyMap(codeContainer, {
			key   : Ext.EventObject.ESC,
			fn    : this._editFinished,
			scope : this
		});

		new Ext.KeyMap(codeContainer, {
			key   : Ext.EventObject.TAB,
			fn    : function(key, e) {
				Ext.ux.Util.fixExtBugOfPreventDefaultWithIE(e);
			},
			scope : this
		});
	};

	this._editFinished = function(btn, e) {
		// grab new script
		var script = this._getEditedScript();

		// update and highlight again
		this._initScriptContent(script);

		// update script to script component
		var scriptComp = this.getComponentByType(this.tplUtil.jsdlKeys.SCRIPT);
		scriptComp.setValue(script);

		// show & hide buttons
		var editBtn = Ext.getCmp(this.id + '_editBtn');
		editBtn.show();
		var finishBtn = Ext.getCmp(this.id + '_finishBtn');
		finishBtn.hide();

		var prevBtn = Ext.getCmp(this.id + '_prevBtn');
		prevBtn.enable();
		var submitBtn = Ext.getCmp(this.id + '_submitBtn');
		submitBtn.enable();
		var saveBtn = Ext.getCmp(this.id + '_saveBtn');
		saveBtn.enable();
	};

	/**
	 * @param orderType (String) indicate the order type.
	 * 		"component" : (default) order by components' order on the page
	 * 		"alphabet" : order by characters of words (nature order)
	 */
	this._initParamContent = function(orderType) {
		orderType = orderType || 'component';

		var paramsHtml = '<span style="color:#f00;">' + i18n.sww_param_usage_tip + '</span>'
				+ '<span style="color: #008200;">(' + i18n.sww_param_order
				+ '<span id="' + this.id + '_componentorderbtn" style="cursor:pointer;'
				+ 'text-decoration:underline;margin-right:5px;">' + i18n.sww_param_order_default + '</span>'
				+ '<span id="' + this.id + '_alphabetorderbtn" style="cursor:pointer;'
				+ 'text-decoration:underline;">' + i18n.sww_param_order_alphabet + '</span>'
				+ ')</span><br>';

		// parameters
		var params = this._getScriptParam();
		if (orderType === 'alphabet') {
			params = this._arraySort(params, 'alphabet');
		}
		var param;
		for (var i=0; i<params.length; ++i) {
			param = params[i];
			if (param['value'] == '') continue;

			paramsHtml += '<code class="bash plain">' + param['name']
				+ '=</code><code class="bash string">"' + param['value']
				+ (param['label'] == '' ? '' : '"</code> <code class="bash comments">#' + param['label'])
				+ '</code><br>';
		}

		if (paramsHtml) {
			paramsHtml += '<br>';
		}

		// show parameters
		var paramsComp = document.getComponentById(this.id + '_scriptedit_params');
		paramsComp.innerHTML = paramsHtml;
		paramsComp = Ext.get(paramsComp);
		paramsComp.setVisibilityMode(Ext.Element.DISPLAY);

		// add click listener to show & hide parameters
		var expandBtn = Ext.get(this.id + '_scriptedit_expandbtn');
		expandBtn.removeAllListeners();
		expandBtn.addListener('click', function() {
			var paramsComp = Ext.get(this.id + '_scriptedit_params');
			paramsComp.setVisible(!paramsComp.isVisible());
		}, this);
		// add click listener to order button
		var orderBtn;
		if (orderType === 'component') {
			orderBtn = Ext.get(this.id + '_alphabetorderbtn');
			orderBtn.addListener('click',
					this._initParamContent.createDelegate(this, ['alphabet'], false), this);
		} else {
			orderBtn = Ext.get(this.id + '_componentorderbtn');
			orderBtn.addListener('click',
					this._initParamContent.createDelegate(this, ['component'], false), this);
		}
	};

	this._initScriptContent = function(script) {
		// show and highlight the script
		var container = document.getComponentById(this.id + '_scriptedit_container');
		var scriptId = this.id + '_scriptedit_content';
		container.innerHTML = '<pre id="' + scriptId + '" class="brush: bash;">' + script + '</pre>';
		var scriptComp = document.getComponentById(scriptId);
		SyntaxHighlighter.highlight({}, scriptComp);

		// add double click listener (double click to edit)
		scriptComp = Ext.get(scriptId);
		var codeContainer = scriptComp.query('.container');
		codeContainer = Ext.get(codeContainer[0]);
		codeContainer.insertHtml('beforeEnd', '<div><br></div>');
		codeContainer.addListener('dblclick', function() {this._editScript();}, this);
	};

	this._getScriptParam = function() {
		var params = [];

		// component parameters
		var components = this.getAllComponents();
		var comp, param;
		for (var id in components) {
			if (id === this.SCRIPT_COMP_ID) continue;

			param = {};
			comp = components[id];

			param['name'] = id;
			param['label'] = comp.getLabel();
			param['value'] = comp.getValue();
			// if component's type is file, set value to file name with no path
			if (comp.type === 'SingleFile' || comp.type == 'MultipleFile') {
				param['value'] = this._getFileName(param['value']);
			}
			if (comp.type == 'ComboBox' &&
				(id === 'cluster'
					|| id === 'queue'
					|| id === 'project')) {
				param['value'] = comp.getText();
			}

			params.push(param);
		}

		params.push({
			name  : 'softwareName',
			label : 'software name',
			value : this.getSoftwareName()
			
		});

		// template parameters (note: _userProperties is read only)
		var scriptComp = this.getComponentByType(this.tplUtil.jsdlKeys.SCRIPT);
		var userProperties = scriptComp._userProperties;
		var scriptVarReg = /^_script_variable_.+$/;
		for (var key in userProperties) {
			if (scriptVarReg.test(key)) {
				param = {};

				param['name'] = key.replace('_script_variable_', '');
				param['label'] = userProperties['_'+key];
				param['value'] = userProperties[key];
				params.push(param);
			}
		}

		return params;
	};

	this._getEditedScript = function() {
		var scriptComp = Ext.get(this.id + '_scriptedit_content');
		var codeContainer = scriptComp.query('.container');
		codeContainer = codeContainer[0];

		var lines = codeContainer.childNodes;
		var code = [];
		var line, t;
		var isFF = (Ext.ux.Util.getExplorer() === 'Firefox');
		for (var i=0; i<lines.length; ++i) {
			line = lines[i];
			if (isFF) {
				// textContent in firefox has some problem, see _ffInnerText()
				t = this._ffInnerText(line, true);
				// the content from _ffInnerText() is not correct
				// if this node has been pasted from MS Word/Excel/...
				if (this._isSimilarRichTextFormat(t))
					t = line.textContent;
			} else
				t = line.innerText || line.textContent || '';

			t = t.replace(/[ \u00A0]+$/g, ''); // remove spaces at the end of line
			code.push(t);
		}

		var script = code.join('\r');
		// replace NO-Break Spaces (0xA0) with Spaces (0x32)
		script = script.replace(/\u00A0/g, ' ');
		return script;
	};

	/**
	 * (private)
	 * 在Firefox中启用编辑模式时，换行时插入的<br>是在<div>内部，
	 * 当使用textContent获取内容时，这些换行就丢失了。
	 * （Chrome和IE每插入一个<br>都会新建一个<div>，虽然获取的内容仍然为空，
	 * 但由于在join时会补上一个换行，所以这个换行符实际上没有丢失）
	 * 
	 * 该方法的作用就是为了解决FF下的这个问题，将其中的<br>替换为\r。
	 * 实现中需要注意的一点是，如果<div>的最后一个元素是<br>（通常都属于这种情况），
	 * 需要忽略之，因为在join时会补上一个换行。
	 * 
	 */
	this._ffInnerText = function(node, ignorLastBR) {
		var childNodes = node.childNodes;
		var childNode;
		var len = childNodes.length;
		var text = '';

		for (var i=0; i<len; ++i) {
			childNode = childNodes[i];
			if (childNode.tagName === 'BR') {
				// replace <br> with \\r, ignore the last one if necessary
				if (i < len - 1 || !ignorLastBR) text += '\r';
			} else if (childNode.tagName)
				// childNode is the last node, and ignorLastBR is true,
				// here _ffInnerText's ignorLastBR is true
				text += this._ffInnerText(childNode, ignorLastBR && i == len - 1);
			else // text node
				text += childNode.textContent || '';
		}

		return text;
	};

	/**
	 * judge if text might be of MS Word/Excel/... format.
	 */
	this._isSimilarRichTextFormat = function(txt) {
		var tooLong = txt.length > 1000,
			xmlTag = txt.indexOf('<xml>') !== -1 && txt.indexOf('</xml>' !== -1),
			hasMso = txt.indexOf('mso') !== -1
			;
		return tooLong && xmlTag && hasMso;
	};

	this._preprocessScript = function() {
		var scriptComp = this.getComponentByType(this.tplUtil.jsdlKeys.SCRIPT);
		var script = scriptComp.getValue();

		// replace parameters
		var params = this._getScriptParam();
		var param;
		for (var i=0; i<params.length; ++i) {
			param = params[i];

			script = script.replace(new RegExp('\\${'+param.name+'}','g'), param.value);
		}

		return script;
	};

	this._getFileName = function(file) {
		if (!file) return '';

		var fileName = '';
		if (file.indexOf('#') != -1) { // multiple files
			var files = file.split('#');
			for (var i=0; i<files.length; ++i) {
				fileName += (fileName && ', ') + this._getFileName(files[i]);
			}
		} else { // single file
			var lastIndex = file.lastIndexOf('/');
			fileName = file.substring(lastIndex + 1, file.length);
		}

		return fileName;
	};

	this._arraySort = function(array, type) {
		var newArray = [];

		// find out min element's index, not found return -1
		var min = function(array, comparator) {
			var idx = -1;
			var ele;
			for (var j=0; j<array.length; ++j) {
				ele = array[j];
				if (ele == null) continue;

				if (idx == -1 || comparator(array[idx], ele))
					idx = j;
			}

			return idx;
		}

		if (type === 'alphabet') {
			var comparator = function(ele1, ele2) {
				var name1 = ele1.name.toLowerCase();
				var name2 = ele2.name.toLowerCase();

				return name1 > name2;
			}
			var idx;
			for (var i=0; i<array.length; ++i) {
				idx = min(array, comparator);
				// no not-null component left
				if (idx == -1) break;

				newArray.push(array[idx]);
				array[idx] = null;
			}
		} else { // return original array
			newArray = array;
		}

		return newArray;
	};
};

/**
 * @class Template.TemplateParserWithCmdEdit
 * @extends Template.TemplateParser
 */
Qmk.extend(Template.TemplateParserWithCmdEdit, Template.TemplateParser);
