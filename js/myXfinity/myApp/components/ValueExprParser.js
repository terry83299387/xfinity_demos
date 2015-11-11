/**
 * 值表达式的解析类
 */
Template.ValueExprParser = {
	/**
	 * read-only
	 */
	tplUtil : Template.TemplateUtilities,

	/*
	 * (Private)
	 * regular expressions which are used
	 * to match the expression's fragments
	 */
	_regs : {
		theScope : /^scope$/,
		theGlobal : /^global$/,
		theSource : /^source$/,
		theTarget : /^target$/,
		theThis : /^this$/,
		theId : /^id$/,
		theVar : /^var$/,
		dot : /^\.$/,
		nullLiteral : /^null$/,
		string : /^(".*"|'.*')$/,
		bool : /^(true|false)$/,
		number : /^NaN|[+-]?(\d*(\$\.)?\d+|0[xX][0-9a-fA-F]*)$/,
		nanNumber : /^NaN$/,
		decNumber : /^[+-]?(0|[1-9]\d*|\d*\.\d+)$/,
		hexNumber : /^[+-]?0[xX][0-9a-fA-F]+$/,
		octNumber : /^[+-]?0[0-7]+$/,
		idString : /^[A-Za-z0-9_-]+$/,
		fieldName : /^[A-Za-z_][A-Za-z0-9_]*$/,
		leftBracket : /^\($/,
		rightBracket : /^\)$/,
		leftBrace : /^{$/,
		rightBrace : /^}$/,
		comma : /^,$/
	},

	/**
	 * 拆分表达式
	 */
	splitExpr : function(expr) {
		expr = this._escapeStringLiteral(expr);
		// 对“.”后面跟随着数字的地方，将其中的“.”替换为“$.”（“.”前面原本就是$的除外）
		expr = expr.replace(/(^|[^$])\.(\d+)/g, "$1\$.$2");
		return this.tplUtil.takeApart(expr, ".,({})", true);
	},

	/**
	 * 验证表达式的语法
	 * expr：拆分的表达式数组
	 * retObj：（可选）
	 *   (1) 当为数字时，表示解析器当前指针
	 *   (2) 当为对象时，具有如下形式：
	 *       {index: 0, result: null}
	 *     此时，该方法将取出其中的index，作为解析器的当前指针。并在验证
	 *     完成后，用新的指针值替换其中的index，用验证结果替换其中的result
	 *   (3) 不传递此值(undefined)，则默认为当前指针为0（即验证整个表达式的值）
	 * 
	 * 返回
	 * true：验证通过
	 * false：验证失败
	 * 
	 * 执行如下操作：
		(1) 设v表示前一步是否有值，初始时为false。
		    取得当前的解析器指针curIdx（见方法原型说明）
		
		(2) 从当前指针处开始，循环遍历表达式数组
			0. 获取指针所指向的当前的“片”，然后判断：
		    1. 若为this，则：
			   判断flag是否为false，不是则出错；
			   如果后面没有更多的片（没有更多的片表示已到达数组的末尾，或者后面的片为“}”，下同）
			   则插入2个新片：“.”和“value”，并跳过它们（curIdx增加2）；
			   否则，判断接下来的片是否为“.”，不是则出错；是则跳过“.”（将curIdx增加1）；
			   将flag赋值为true
			2. 若为id，则：
			   判断flag是否为false，不是则出错；
			   判断后面至少还有3片，且分别为“(”、id值（必须满足id值的格式要求）、“)”，不是则出错。是则跳过这3片（curIdx增加3）；
			   如果后面没有更多的片，则插入2个新片：“.”和“value”，并跳过它们（curIdx增加2）；
			   否则，判断接下来的片是否为“.”，不是则出错；是则跳过“.”（将curIdx增加1）；
			   将flag赋值为true
			3. 若为var，处理过程同id
			4. 若为字面量（以""引起来的），则：
			   判断flag是否为false，不是则出错；
			   判断字面量中的内容是否符合规范，即转义字符是否正确
			   如果后面还有更多的片，判断接下来的片是否为“.”，不是则出错；是则跳过“.”（将curIdx增加1）；
			   将flag赋值为true
			5. 若为}，判断flag是否为true，不是则出错；是则结束循环并返回
			7. 其他情况，表示这是一个属性或方法。
			   (1) 首先判断flag是否为true，不是则出错
			   (2) 判断是否符合属性/方法的命名规范（以英文字母或数字及下划线组成，且不能以数字开头的，/^[A-Za-z_][A-Za-z0-9_]*$/。
			       虽然在Javascript中，中文、$等字符也是合法的变量名，但这里不支持）
			   (3) 如果后面没有更多的片，表示是一个属性，继续下一轮循环（不能直接返回，否则curIdx可能是错的——例如后面是}，但现在指向的是}之前）
			   (4) 否则，如果接下来的片是“(”，表示是一个方法
			       跳过“(”（将curIdx增加1），然后调用validateMthdParams()验证其中的参数
				   判断validateMthdParams方法的返回值，若<0，出错；
				   将curIdx设置为返回值
			   (5) 若接下来有更多的片，判断是否是“.”，不是则出错，若是则跳过
		
		(3) 判断flag是否为true，不是则出错；是则返回curIdx
	 */
	validateExpr : function(expr, retObj) {
		var regs = this._regs;

		var i, paramRet=false;
		if (retObj == undefined) {
			i = 0;
		} else if (typeof retObj == "number") {
			i = retObj;
		} else {
			i = retObj.index;
			paramRet = true;
		}

		var v = false, err = false;
		var fragment;
		// 这里expr.length不能替换为len，因为数组的长度可能会发生变化
		for (; i<expr.length; i++) {
			fragment = expr[i];
			if (regs.theScope.test(fragment)
					|| regs.theGlobal.test(fragment)) { // scope, global
				err = v || !this._moreFrg(expr, i) || !regs.dot.test(expr[++i]);
				if (err) break;
				v = true;
			} else if (regs.theThis.test(fragment)
					|| regs.theSource.test(fragment)
					|| regs.theTarget.test(fragment)) { // this, source, target
				if (v) {
					err = true;
					break;
				}
				if (!this._moreFrg(expr, i)) {
					expr.splice(i+1, 0, ".", "value");
					i += 2;
				} else if (!regs.dot.test(expr[++i])) {
					err = true;
					break;
				}
				v = true;
			} else if (regs.theId.test(fragment) || regs.theVar.test(fragment)) { // id, var
				var err = v || this._numFrgLeft(expr, i) < 3
					|| !regs.leftBracket.test(expr[++i])
					|| !regs.idString.test(expr[++i])
					|| !regs.rightBracket.test(expr[++i]);
				if (err) break;

				if (!this._moreFrg(expr, i)) {
					expr.splice(i+1, 0, ".", "value");
					i += 2;
				} else if (!regs.dot.test(expr[++i])) {
					err = true;
					break;
				}
				v = true;
			} else if (regs.string.test(fragment)) { // string literal
				err = v || !this._validateStrLiteral(fragment)
					|| (this._moreFrg(expr, i) && !regs.dot.test(expr[++i]));
				if (err) break;

				v = true;
			} else if (regs.bool.test(fragment)
					|| regs.number.test(fragment)
					|| regs.nullLiteral.test(fragment)) { // bool or number or null literal
				err = v || (this._moreFrg(expr, i) && !regs.dot.test(expr[++i]));
				if (err) break;

				v = true;
			} else if (regs.rightBrace.test(fragment)) { // right brace "}"
//				if (!v) { // empty expression
//					err = true;
//				}
				break;
			} else { // a field or a method
				if (!regs.fieldName.test(fragment)) { // illegal name
					err = true;
					break;
				}
				if (!this._moreFrg(expr, i)) { // field
					if (!v) {
						err = true;
						break;
					} else continue;
				}

				// internal method could be invoked
				// directely, whatever v is null or not
				if (regs.leftBracket.test(expr[i+1])) { // method
					i += 2;
					if ((i=this._validateMthdParams(expr, i)) < 0) {
						i = -i;
						err = true;
						break;
					}
				}
				if (this._moreFrg(expr, i) && !regs.dot.test(expr[++i])) {
					err = true;
					break;
				}
			}
		}
//		if (!v) { // empty expression
//			err = true;
//		}

		if (paramRet) {
			retObj.index = i;
			retObj.result = !err;
		}
		return !err;
	},

	/**
	 * 计算子表达式的值。
	 * expr：拆分的表达式数组
	 * tplParser：当前的TemplateParser
	 * thisComp：表达式中this所代表的component
	 * retObj：（可选）
	 *   (1) 当为数字时，表示解析器当前指针，初始时指向数组中的第一个元素
	 *   (2) 当为对象时，具有如下形式：
	 *       {index: 0, result: null}
	 *     此时，该方法将取出其中的index，作为解析器的当前指针。并在计算
	 *     完成后，用新的指针值替换其中的index，用计算结果替换其中的result
	 *   (3) 不传递此值(undefined)，则默认为当前指针为0（即计算整个子表达式的值）
	 *
	 *  返回：计算结果（子表达式的值）
	 *  
		执行如下操作：
		(0) 设v表示前一步计算出的值。
		    取得当前的解析器指针curIdx（见方法原型说明）

		(1) 从当前指针处开始，循环遍历表达式数组
			0. 获取指针所指向的当前的“片”，然后判断：
		    1. 若为this，获取this所代表的component，并将值赋给v；
			   跳过“.”（将curIdx增加1）
			2. 若为id，获取第2片的id值（curIdx+2），并获取component，并将值赋给v；
			   跳过4片（curIdx加4）
			3. 若为var，获取第2片的id值（curIdx+2），并获取varible，并将值赋给v；
			   跳过4片（curIdx加4）
			4. 若为字面量（以""引起来的），将首尾引号去除，并将中间的内容（具体的值）转义后，赋给v；
			   若还有更多的片，则跳过“.”（将curIdx增加1）
			5. 若为}，结束循环
			6. 其他情况，表示这是一个属性或方法。
			   (1) 首先判断v是否为空(null)，为空则抛出“NullPointer”异常
			   (2) 如果是一个属性（后面没有更多的片，或者接下来的片是“.”（而不是“(”）），
			       判断对象v中是否有该属性（对于xxx，v中要么有xxx属性，要么有getXxx方法）。不存在则抛出“NoProperty”异常
				   获取对象的属性值，并赋值给v
			   (3) 如果是一个方法（后面有更多的片，且接下来的片是“(”），
			       跳过“(”（将curIdx增加1），然后调用getMethodParams()获取其中的参数（有关getMethodParams方法的说明见后）
				   
				   判断对象v中是否有该方法（对于xxx，v中必须存在xxx，且其类型是function）
				   有，则调用之；否则表示这是一个“内置方法”，调用之。
				   将结果赋值给v
				   （如果试图调用未定义的内置方法，则会抛出“method not defined”异常）

		(2) 如果参数retObj是一个非空对象，则更新其index为当前指针；并将其result赋值为v
		    返回v
	 */
	calcExpr : function(expr, tplParser, thisComp, source, target, retObj) {
		var regs = this._regs;

		var i, paramRet=false;
		if (retObj == undefined) {
			i = 0;
		} else if (typeof retObj == "number") {
			i = retObj;
		} else {
			i = retObj.index;
			paramRet = true;
		}

		var v, fragment, len = expr.length;
		for (; i<len; i++) {
			fragment = expr[i];

			if (regs.theGlobal.test(fragment)) { // global
				v = window;
			} else if (regs.theScope.test(fragment)) { // scope
				v = tplParser;
			} else if (regs.theThis.test(fragment)) { // this
				v = thisComp;
			} else if (regs.theSource.test(fragment)) { // source
				v = source;
			} else if (regs.theTarget.test(fragment)) { // target
				v = target;
			} else if (regs.theId.test(fragment)) { // id
				v = tplParser.getComponent(expr[i+2]);
				i += 3;
			} else if (regs.theVar.test(fragment)) { // var
				v = tplParser.getVariable(expr[i+2]);
				i += 3;
			} else if (regs.string.test(fragment)) { // string literal
				v = fragment.substring(1, fragment.length-1);
				v = this.tplUtil.unescapeChars(v);
			} else if (regs.bool.test(fragment)) { // bool literal
				v = (fragment === "true");
			} else if (regs.number.test(fragment)) { // number literal
				v = this._getNumberLiteral(fragment);
			} else if (regs.nullLiteral.test(fragment)) { // null literal
				v = null;
			} else if (regs.rightBrace.test(fragment)) { // right brace "}"
				break;
			} else if (regs.dot.test(fragment)) { // dot "."
				// ignore
			} else { // a field or a method
				if (!this._moreFrg(expr, i) || regs.dot.test(expr[i+1])) { // field
					if (v == null) throw "NullPointer: ValueExprParser line 281";
					var getter = this.tplUtil.getPropMethod(
							v, fragment, this.tplUtil.GETTER);
					if (getter && typeof getter == "function")
						v = getter.call(v);
					else if ((v.hasOwnProperty && v.hasOwnProperty(fragment))
							|| v[fragment] !== undefined)
						v = v[fragment];
					else
						throw "NoProperty:"+fragment;
				} else { // method
					var o = {index: ++i};
					this._getMethodParams(expr, tplParser, thisComp, source, target, o);
					i = o.index;
					var m = this.tplUtil.getObjField(v, fragment);
					if (m && typeof m == "function")
						v = m.apply(v, o.result);
					else // inner method
						v = this.tplUtil.invokeMethod(fragment, v, o.result);
				}
			}
		}

		if (paramRet) {
			retObj.index = i;
			retObj.result = v;
		}

		return v;
	},


	// --------------------------------------------------------------

	/*
	 * (Private)
	 * 对表达式中的字符串字面量进行预处理，将其中未转义的特殊字符转义（例如将$变为$$、将.变为$.、将{变为${等）。
	 * 
	 * 由于增加了这一步的处理，用户在书写表达式时就不要求对表达式中的每一个特殊字符都必须进行转义了。
	 * 
	 * 例如，以前在表达式中书写字符串字面量“abc.ef,g{}”，需要写成：
	 * 
	 *     "abc$.ef$,g${$}"（包括外面的双引号）
	 * 
	 * 而现在只需直接书写即可，在这里的预处理阶段会自动将其中的特殊字符进行转义。：
	 * 
	 *     "abc.ef,g{}"
	 * 
	 * 但是仍然要注意一点，即字面量中的单引号或双引号仍然需要手动转义。具体来说：
	 * 
	 * (1) 如果字符串是以双引号引起来的，那么在其中可以直接书写单引号，但双引号必须使用$"的形式进行转义
	 * (2) 如果字符串是以单引号引起来的，与(1)类似，在其中可以直接书写双引号，但单引号必须使用$'的形式进行转义
	 * 
	 * 例如对字符串“abc'd"ef”，可以书写为下面两种形式
	 * 
	 *     "abc'd$"ef"
	 *     'abc$'d"ef'
	 * 
	 * 当然，也可以直接写成转义后的形式：
	 * 
	 *     "abc$'d$"ef"
	 * 
	 * 这种情况，预处理时将会忽略其中已转义的特殊字符。
	 * 
	 * 最后，由于要兼容老的转义方式，所以"abc${"会被解析为"abc{"，即"${"被认为是对"{"的转义
	 * 所以，如果确实需要得到"abc${"，则应该写成"abc$${"。
	 * 也就是说，除上面所说的单/双引号外，"$"字符也需要转义。
	 */
	_escapeStringLiteral : function(expr) {
		var sArray = [];
		var len = expr.length;
		for (var i=0; i<len; i++) {
			sArray[i] = expr.charAt(i);
		}
//		var findCharsCount = 0;

		var quot = "'\""; // 寻找字符串起始引号
		var sQuot = "'";  // 单引号
		var dQuot = '"';  // 双引号
		var specialCharsWithSQuot = "(),.{};'"; // 以双引号引起来的字面量中的特殊字符（用户书写时可以在其中直接使用单引号）
		var specialCharsWithDQuot = '(),.{};"'; // 以单引号引起来的字面量中的特殊字符（用户书写时可以在其中直接使用双引号）
		var escapeChar = "$";

		var idx = 0;
		var endIdx;

		var startQuotMatch; // 找到了一个字符串字面量的起始匹配
		var endQuotMatch;   // 根据起始是单引号或双引号，寻找对应的结束匹配
		var specialCharMatch; // 字符串中的未转义特殊字符

		var matchedQuotChar;  // 表明该字符串字面量是使用单引号还是双引号引起来的

		while ((startQuotMatch=this._getMatchNoEscape(expr, quot, idx)) != null) {
			idx = startQuotMatch.index;
			matchedQuotChar = startQuotMatch[0];

			endQuotMatch = this._getMatchNoEscape(expr, matchedQuotChar, idx+1);
			if (endQuotMatch == null) return; // no match end quot
			endIdx = endQuotMatch.index;

			// 如果当前字符串是以双引号开始，那么特殊字符中将包括单引号；反之同理
			var specialChars = (matchedQuotChar == sQuot ? specialCharsWithDQuot : specialCharsWithSQuot);
			/*
			 * 寻找每个未转义的特殊字符，并将其转义。
			 * 
			 * 这里使用的方法是先将表达式拆分为字符数组（sArray）
			 * 该数组的作用类似于Java中的StringBuilder
			 * 可以对其中指定位置处的字符进行插入或删除操作
			 * （目前只用到了插入操作。若要删除，只要将指定位置处的字符设置为空字符串""即可）
			 */
			while ((specialCharMatch=this._getMatchNoEscape(expr, specialChars, idx+1, endIdx)) != null) {
				idx = specialCharMatch.index;
				/*
				 * 之前使用数组的splice()方法来进行插入（或删除）操作
				 * 但实际上只需将指定位置处的字符前增加一个字符，
				 * 或将其设置为空字符串，即可实现插入和删除操作。
				 * 
				 * 新的方法在效率上会有一些提升，并且不需要一个额外的
				 * 变量来跟踪字符偏移值的改变
				 * （通过splice进行插入或删除会改变原数组，因此其中的字符的偏移也会发生变化）
				 */
//				sArray.splice(idx+findCharsCount, 0, escapeChar);
//				findCharsCount++;
				sArray[idx] = escapeChar + sArray[idx];
			}

			idx = endIdx + 1;
		}

		return sArray.join("");
	},

	/*
	 * (Private)
	 * validateMthdParams方法原型如下：
		   int validateMthdParams(expr, index)
		参数同validateSubExpr()方法
		返回值：
		正数：验证通过，返回值表示解析器的当前指针（指向位于方法右括号")"之后的的下一个片）
		负数：验证失败，其绝对值表示失败的位置

		(1) 取得当前的解析器指针curIdx
		(2) 从当前指针处开始，循环遍历表达式数组
		 1. 获取指针所指向的当前的“片”，然后判断
		 2. 若为字面量（以""引起来的），判断字面量中的内容是否符合规范，即转义字符是否正确
		 3. 若为{，将curIdx增加1，调用validateSubExpr(expr, curIdx)
			若返回值<0，出错；
			若返回后，当前指针处的片不是}，出错；
			将curIdx设置为返回值并继续
		 4. 若为,，判断其前后的片，若为,，出错（,重复）
			若没有错误，则继续
		 5. 若为)，结束循环。返回curIdx的值
		 6. 若为其他，则出错；若已到达表达式数组的末尾，出错（右括号缺失）
	 */
	_validateMthdParams : function(expr, index) {
		var regs = this._regs;

		var fragment;
		// 这里expr.length不能替换为len，因为数组的长度可能会发生变化
		for (var i=index; i<expr.length; i++) {
			fragment = expr[i];
			if (regs.string.test(fragment)) { // string literal
				if (!this._validateStrLiteral(fragment)) return -i;
			} else if (regs.bool.test(fragment)
					|| regs.number.test(fragment)
					|| regs.nullLiteral.test(fragment)) { // bool, number, null literal
				continue;
			} else if (regs.leftBrace.test(fragment)) { // left brace "{"
				var o = {index: ++i};
				if (!this.validateExpr(expr, o)) return -o.index;
				i = o.index;
				if (!regs.rightBrace.test(expr[i])) return -i;
			} else if (regs.comma.test(fragment)) { // comma ","
				if (i == index) return -i;
				if (regs.comma.test(expr[i-1])
						|| regs.comma.test(expr[i+1]))
					return -i;
			} else if (regs.rightBracket.test(fragment)) { // right bracket ")"
				return i;
			} else {
				return -i;
			}
		}

		return -i; // missing right bracket
	},

	/*
	 * (Private)
	 * 有更多的片表示未到达表达式数组的末尾，并且后面的片不为“}”
	 */
	_moreFrg : function(expr, index) {
		return (index < expr.length - 1
			&& !this._regs.rightBrace.test(expr[index+1]));
	},

	/*
	 * (Private)
	 * 距离表达式数组末尾（而不是距离最近的}）还有多少个片
	 */
	_numFrgLeft : function(expr, index) {
		return expr.length - 1 - index;
	},

	/*
	 * (Private)
	 * 验证字符串字面量的内容是否符合规范，即转义字符是否正确
	 */
	_validateStrLiteral : function(str) {
		// TODO
		return true;
	},

	/*
	 * (Private)
		参数和calcExpr()方法相同，但retObj类型只能是对象，且不能为空
		返回获取到的参数数组，依次存放着方法各参数的值
		(1) 设a为参数数组，初始时为空
		   取得当前的解析器指针curIdx
		(2) 从当前指针处开始，循环遍历表达式数组
		 1. 获取指针所指向的当前的“片”，然后判断
		 2. 若为字面量（以""引起来的），去除首尾引号，将中间的内容（具体的值）转义，并加入数组
		 3. 若为{，将curIdx增加1，令obj={index: curIdx, result: null}（result:null也可以不写），然后调用calcExpr(expr, obj) 。
			 调用返回后，令curIdx=obj.index，并取得子表达式的计算结果v2=obj.result，加入数组
		 4. 若为,，继续
		 5. 若为)，结束循环
		 6. 若为其他，则出错
	 */
	_getMethodParams : function(expr, tplParser, thisComp, source, target, retObj) {
		var a = [];
		var regs = this._regs;
		var i = retObj.index;
		var len = expr.length;
		var fragment;
		for (; i<len; i++) {
			fragment = expr[i];
			if (regs.string.test(fragment)) { // string literal
				fragment = fragment.substring(1, fragment.length-1);
				fragment = this.tplUtil.unescapeChars(fragment);
				a.push(fragment);
			} else if (regs.bool.test(fragment)) { // bool literal
				a.push(fragment === "true");
			} else if (regs.number.test(fragment)) { // number literal
				a.push(this._getNumberLiteral(fragment));
			} else if (regs.nullLiteral.test(fragment)) { // null literal
				a.push(null);
			} else if (regs.leftBrace.test(fragment)) { // sub expression
				var o = {index: ++i};
				this.calcExpr(expr, tplParser, thisComp, source, target, o);
				i = o.index;
				a.push(o.result);
			} else if (regs.comma.test(fragment)) { // comma ","
				// ignore
			} else if (regs.rightBracket.test(fragment)) { // right bracket ")"
				break;
			} else {
				// never goes here
			}
		}

		retObj.index = i;
		retObj.result = a;

		return a;
	},

	/*
	 * (Private)
	 * @param String numStr number string
	 * @return Number
	 */
	_getNumberLiteral : function(numStr) {
		var regs = this._regs;
		numStr = numStr.replace(/\$/g, "");

		if (regs.decNumber.test(numStr)) {
			if (numStr.indexOf(".") == -1) { // integer
				return parseInt(numStr);
			} else { // float
				return parseFloat(numStr);
			}
		} else if (regs.hexNumber.test(numStr)) {
			return parseInt(numStr);
		} else if (regs.octNumber.test(numStr)) {
			return this._getOctNumberLiteral(numStr);
		} else { // illegal number or NaN
			return NaN;
		}
	},

	/*
	 * (Private)
	 * @param String numStr oct number string
	 * @return Number
	 */
	_getOctNumberLiteral : function(numStr) {
		var factor = 1;
		if (numStr.charAt(0) == "-") {
			factor = -1;
		}

		var v = 0;
		var weight = 0;
		var digit;
		var startPos = /^[+-]/.test(numStr) ? 2 : 1; // start with "+0" "-0" or "0"
		for (var i=numStr.length-1; i>=startPos; i--) {
			digit = parseInt(numStr.charAt(i));
			v += digit << weight;
			weight += 3;
		}

		return (factor == -1 ? -v : v);
	},

	/*
	 * (Private)
	 * 检索字符串字面量中未转义的特殊字符
	 * @param String expr 表达式
	 * @param String chars 要检索的字符（可以有多个，但每个都必须是单字符）
	 * @param int start （可选）在expr中开始检索的起始位置，默认是0
	 * @param int end （可选）在expr中检索的限定范围，默认是直到表达式末尾
	 */
	_getMatchNoEscape : function(expr, chars, start, end) {
		if (start == undefined) start = 0;
		if (end == undefined) end = expr.length;

		var charsReg = new RegExp("\\$*[" + chars + "]", "g");
		charsReg.lastIndex = start;

		var match;
		var matchedStr;
		var idx;
		while ((match=charsReg.exec(expr)) != null) {
			idx = match.index;
			if (idx >= end) return null;

			matchedStr = match[0];
			if (matchedStr.length % 2 == 0) continue;

			match[0] = matchedStr.charAt(matchedStr.length - 1);
			match.index = idx + matchedStr.length - 1
			return match;
		}

		return null;
	},
	

	/**
	 * parse the value's or params' expressions and get depends entities.
	 * 
	 * source and target only appear in Combination Expressions,
	 * don't need to judge dependent relation
	 */
	getDependEntity : function(expr, arr) {
		var regs = this._regs;
		var retVal = arr || [];
		var v=true, fragment, len = expr.length;
		for (var i=0; i<len; i++) {
			fragment = expr[i];

			if (v && regs.theThis.test(fragment)) { // this
				retVal.push({
					type: fragment,
					fieldName: expr[i+2]
				});
				i += 2;
			} else if (v && (regs.theId.test(fragment)
					|| regs.theVar.test(fragment))) { // id, var
				retVal.push({
					type: fragment,
					id : expr[i+2],
					fieldName: expr[i+5]
				});
				i += 5;
			}
			v = false;

			if (regs.leftBrace.test(fragment)) {
				v = true;
			}
		}

		return retVal;
	}
};
