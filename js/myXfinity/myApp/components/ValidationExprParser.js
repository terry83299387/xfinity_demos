/**
 * 验证表达式的解析类
 */
Template.ValidationExprParser = {
	/**
	 * read-only
	 */
	tplUtil : Template.TemplateUtilities,
	/**
	 * read-only
	 */
	valExprParser : Template.ValueExprParser,

	/**
	 * 拆分表达式
	 * @param expr
	 * @return 拆分后的表达式数组
	 */
	splitExpr : function(expr) {
		// 1. 以关系运算符来拆分
		// 在IE下split()函数没有遵循“将子表达式也存放到拆分数组中”
		// 的规则（详细见String.split()函数），因此此处需要改写
//		var splits = expr.split(/ *({not}|{and}|{or}) */);
		var splits = this._takeApart(expr);

		// TODO 待测试。因为拆分方法已改变，这里可能不需要了
//		var len = splits.length;
//		// 去除首尾的空字符串
//		if (len > 0) {
//			if (splits[0] == "")
//				splits.shift();
//			if (splits[len-1] == "")
//				splits.pop();
//		}

		var str, arr;
		// 2. 拆分语句块
		var isRelOp = /^{(not|and|or)}$/;
		// 这里splits.length不能替换为len，因为数组的长度是变化的
		for (var i=0; i<splits.length; i++) {
			str = splits[i];
			// 如果是关系运算符，去除其中的空格，然后继续循环
			if (isRelOp.test(str)) {
				splits[i] = str.replace(isRelOp, "{$1}");
				continue;
			}
			arr = this._splitBlockExpr(str);
			if (arr.length > 1) {
				splits.splice(i, 1, arr);
				i += arr.length - 1;
			}
		}

		// 3. 拆分子表达式
		var isSubExpr1 = /^[^{]/;
		var isSubExpr2 = /[^}]$/;
		len = splits.length;
		for (var i=0; i<len; i++) {
			str = splits[i];
			// 不以{开头，并且不以}结尾的是子表达式
			if (isSubExpr1.test(str)
					&& isSubExpr2.test(str)) {
				splits[i] = this.valExprParser.splitExpr(str);
			}
		}

		return splits;
	},

	/**
	 * 验证表达式的正确性
		(1) 遍历拆分出的每个部件
		(2) 遇到起始符则压入堆栈
		(3) 遇到子表达式（类型为数组的项），首先确定子表达式的正确性（见后），然后：
		  1. 若栈顶为{not}，则丢弃{not}。并压入代表表达式的符号"Exp"
		  2. 若栈顶为{or}或{and}，则丢弃之，并判断前一个是否为"Exp"，如果是则继续，否则出错
		  3. 若栈顶为{，或栈为空，则直接入栈符号"Exp"
		(4) 遇到}：
		  1. 如果堆栈为空，出错
		  2. 否则判断栈顶是否为"Exp"，不是则出错
		  3. 弹出Exp，判断栈顶是否为{，不是则出错
		  4. 执行与(3)相同的判断
		(5) 遍历完成后，如果堆栈中不是有且仅有一个符号"Exp"，出错
	 */
	validateExpr : function(exprSplits) {
		var stack = [];
		var split, curStackTop;
		var startOp = /^{((not|and|or)})?$/;
		var endOp = /^}$/;
		var leftBrace = /^{$/;
		var not = /^{not}$/;
		var and = /^{and}$/;
		var or = /^{or}$/;
		var subExprReg = /^Expr$/;
		var subExpr = "Expr";
		var len = exprSplits.length;
		for (var i=0; i<len; i++) {
			split = exprSplits[i];
			if (typeof split != "string") { // sub expression
				if (!this.valExprParser.validateExpr(split)) return false;
				// (1)
				if (stack.length == 0) {
					stack.push(subExpr);
					continue;
				}
				curStackTop = stack[stack.length-1];
				if (not.test(curStackTop)) {
					stack.pop();
				} else if (and.test(curStackTop)
						|| or.test(curStackTop)) {
					stack.pop();
					if (stack.length == 0
							|| !subExprReg.test(stack.pop())) return false;
				} else if (leftBrace.test(curStackTop)) {
					// do nothing
				}
				stack.push(subExpr);
			} else if (startOp.test(split)) { // start operation
				stack.push(split);
			} else if (endOp.test(split)) { // end operation
				if (stack.length < 2) return false;
				if (!subExprReg.test(stack.pop())) return false;
				if (!leftBrace.test(stack.pop())) return false;
				// same as (1)
				if (stack.length == 0) {
					stack.push(subExpr);
					continue;
				}
				curStackTop = stack[stack.length-1];
				if (not.test(curStackTop)) {
					stack.pop();
				} else if (and.test(curStackTop)
						|| or.test(curStackTop)) {
					stack.pop();
					if (stack.length == 0
							|| !subExprReg.test(stack.pop())) return false;
				} else if (leftBrace.test(curStackTop)) {
					// do nothing
				}
				stack.push(subExpr);
			}
		}
		if (stack.length != 1
				|| !subExprReg.test(stack[0]))
			return false;

		return true;
	},

	/**
	 * 
	 * @param {} expr
	 */
	calcExpr : function(expr, tplParser, thisComp, source, target) {
		var stack = [];
		var subExpr, curStackTop, exp;
		var startOp = /^{((not|and|or)})?$/;
		var endOp = /^}$/;
		var len = expr.length;
		for (var i=0; i<len; i++) {
			subExpr = expr[i];
			if (typeof subExpr != "string") {
				exp = this.calcSubExpr(subExpr, tplParser, thisComp, source, target);
				if (typeof exp != "boolean") {
					return false;
				}
				exp = this.relationCalc(stack, exp);
				stack.push(exp);
			} else if (startOp.test(subExpr)) {
				stack.push(subExpr);
			} else if (endOp.test(subExpr)) {
				exp = stack.pop();
				stack.pop(); // discard top element ("{")
				exp = this.relationCalc(stack, exp);
				stack.push(exp);
			}
		}

		return stack.pop();
	},

	/**
	 * 计算子表达式的值。
	 */
	calcSubExpr : function(expr, tplParser, thisComp, source, target, retObj) {
		return this.valExprParser.calcExpr(expr, tplParser, thisComp, source, target, retObj);
	},

	/**
	 * 若栈为空，直接返回exp
	 * 若栈顶为not、and或or，计算之：
	 *   1. 若栈顶为{not}，则丢弃{not}，对Exp求反，将求反后的结果入栈
	 *   2. 若栈顶为{or}，则丢弃{or}，取出前一个Exp，并将2个表达式取或
	 *   3. 若栈顶为{and}，则丢弃{and}，取出前一个Exp，并将2个表达式取与
	 * 否则，直接返回exp
	 */
	relationCalc : function(stack, exp) {
		var not = /^{not}$/;
		var and = /^{and}$/;
		var or = /^{or}$/;

		if (stack.length == 0) return exp;

		var curStackTop = stack[stack.length-1];
		if (not.test(curStackTop)) {
			stack.pop(); // discard
			return !exp;
		} else if (or.test(curStackTop)) {
			stack.pop(); // discard
			exp = stack.pop() || exp;
		} else if (and.test(curStackTop)) {
			stack.pop(); // discard
			exp = stack.pop() && exp;
		}
		return exp;
	},

	/*
	 * (Private)
	 * 拆分块表达式
	 * 对每个拆分的子串，如果不是关系运算符，则判断其是否以
	 * {开头，或者以}结尾
	 * 如果是，则将其拆分为“{+子串”或“子串+}”的形式，并将拆
	 * 分后的多个子串插入原子串所在位置并替换子串。
	 * 如果有多重嵌套，则可能有不止一个{或}，每一个都要拆分。
	 */
	_splitBlockExpr : function(str) {
		var arr = [];
		var c, i=0;
		while ((c=str.charAt(i)) == "{") {
			arr.push(c);
			i++;
		}
		arr.push("");
		var j=str.length-1;
		while ((c = str.charAt(j)) == "}") {
			arr.push(c);
			j--;
		}
		arr[i] = str.substring(i, j+1);

		return arr;
	},

	/*
	 * (Private)
	 * slice expr using operands {not}, {and} and {or},
	 * and then return result.
	 * @param String expr string
	 * @return [] slices of expr taken apart by
	 *   relative operands ({not}, {and}, {or})
	 */
	_takeApart : function(expr) {
		var splits = [];
		var reg = / *{ *(not|and|or) *} */g;
		var match, lastIdx=0, curIdx=0;
		while ((match=reg.exec(expr)) != null) {
			curIdx = match.index;
			if (curIdx != lastIdx)
				splits.push(expr.substring(lastIdx, curIdx).trim());
			splits.push("{" + match[1] + "}");
			lastIdx = reg.lastIndex;
		}
		if (lastIdx < expr.length)
			splits.push(expr.substring(lastIdx, expr.length).trim());

		return splits;
	}
};
