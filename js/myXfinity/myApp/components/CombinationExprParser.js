/**
 * 联动表达式的解析类
 */
Template.CombinationExprParser = {
	/**
	 * read-only
	 */
	tplUtil : Template.TemplateUtilities,
	/**
	 * read-only
	 */
	valExprParser : Template.ValueExprParser,
	/**
	 * read-only
	 */
	validExprParser : Template.ValidationExprParser,

	/**
	 * split the represented expression.
	 * 
	 * @param expr
	 * @return split expression array. the splitting result
	 * has the following form:
	 * 
	 * [
	 * 	[value-expression_1],
	 * 	[value-expression_m],
	 *  [conditional-expression],
	 *  [value-expression_x],
	 *  [value-expression_y],
	 *  ...
	 * ]
	 * 
	 * and here is conditional-expression:
	 * 
	 * [
	 * 	"{if}",
	 *  	[validate-expression],
	 *  "{then}",
	 *  	a statement,
	 *  "{elif}",
	 *  	[validate-expression],
	 *  "{then}",
	 *  	a statement,
	 *  "{else}",
	 *  	a statement,
	 *  "{fi}"
	 * ]
	 * 
	 * where the elif part can repeat 0, 1 or more times;
	 * and "a statement" is another combination expression
	 * as well.
	 */
	splitExpr : function(expr) {
		var result = [];

		// 
		expr = expr.replace(/\/\*.*\*\//g, '');
		expr = this.tplUtil.filterCRs(expr);

		var splits = this._takeApart(expr);

		var subExpr;
		var theIf = /^{if}$/;
		for (var i=0; i<splits.length; i++) {
			subExpr = splits[i];
			if (theIf.test(subExpr)) { // if
				i = this._splitConditionalExpr(splits, result, i);
			} else { // value-expression
				this._splitValueExpr(subExpr, result);
			}
		}

		return result;
	},

	/**
	 * validate expression
	 */
	validateExpr : function(exprSplits) {
		// TODO
//		var len = exprSplits.length;
//		var split;
//		for (var i=0; i<len; i++) {
//			split = exprSplits[i];
//			if (!this.valExprParser.validateExpr(split)) return false;
//		}

		return true;
	},

	/**
	 * 
	 * @param {} expr
	 * @param {} tplParser
	 * @param {} thisComp
	 * TODO source & target
	 * @return {}
	 */
	execExpr : function(expr, tplParser, thisComp, source, target) {
		var theIf = /^{if}$/;
		var theElif = /^{elif}$/;
		var theElse = /^{else}$/;
		var theThen = /^{then}$/;
		var theFi = /^{fi}$/;

		var len = expr.length;
		var subExpr;
		for (var i=0; i<len; i++) {
			subExpr = expr[i];
			if (subExpr.length > 0 &&
					theIf.test(subExpr[0])) { // conditional expression
				this._execConditionalExpr(subExpr, tplParser, thisComp, source, target);
			} else { // value-expression
				this.valExprParser.calcExpr(
						subExpr, tplParser, thisComp, source, target);
			}
		}
	},

	/*---------------------------- private methods -------------------------*/
	/*
	 * (Private)
	 */
	_splitValueExpr : function(expr, result) {
		var splits = this.tplUtil.takeApart(expr, ";", false);
		for (var i=0; i<splits.length; i++) {
			result.push(this.valExprParser.splitExpr(splits[i]));
		}

		return result;
	},

	/*
	 * (Private)
	 * @param exprSplits split expression (an array)
	 * @param result the final result
	 * @param index current index in exprSplits
	 * @return 
	 */
	_splitConditionalExpr : function(exprSplits, result, index) {
		var theIf = /^{if}$/;
		var theElif = /^{elif}$/;
		var theElse = /^{else}$/;
		var theThen = /^{then}$/;
		var theFi = /^{fi}$/;

		var curBlock = [];
		var statements;

		curBlock.push(exprSplits[index]); // if
		curBlock.push(this.validExprParser.splitExpr(exprSplits[++index])); // condition
		curBlock.push(exprSplits[++index]); // then
		statements = [];

		var subExpr;
		var len = exprSplits.length;
		for (var i=index+1; i<len; i++) {
			subExpr = exprSplits[i];
			if (theIf.test(subExpr)) { // if (another conditional expression)
				i = this._splitConditionalExpr(exprSplits, statements, i);
			} else if (theElif.test(subExpr)) { // elif
				curBlock.push(statements);
				statements = [];
				curBlock.push(subExpr);
				curBlock.push(this.validExprParser.splitExpr(exprSplits[++i])); // condition
				curBlock.push(exprSplits[++i]); // then
			} else if (theElse.test(subExpr)) { // else
				curBlock.push(statements);
				statements = [];
				curBlock.push(subExpr);
			} else if (theFi.test(subExpr)) { // fi
				curBlock.push(statements);
				result.push(curBlock);
				return i;
			} else { // value-expression
				this._splitValueExpr(subExpr, statements);
			}
		}

		// error! missing end symbol "fi"
		return len;
	},

	/*
	 * (Private)
	 */
	_execConditionalExpr : function(expr, tplParser, thisComp, source, target) {
		var theElif = /^{elif}$/;
		var theElse = /^{else}$/;
		var theFi = /^{fi}$/;

		var condition = expr[1];
		var subExpr;
		// if branch
		if (this.validExprParser.calcExpr(
				condition, tplParser, thisComp, source, target)) {
			subExpr = expr[3];
			this.execExpr(subExpr, tplParser, thisComp, source, target);
			return;
		}

		// other branches
		var len = expr.length;
		for (var i=4; i<len; i++) {
			subExpr = expr[i];
			if (theElif.test(subExpr)) { // elif
				condition = expr[++i];
				i += 2;
				if (this.validExprParser.calcExpr(
						condition, tplParser, thisComp, source, target)) { // matched
					subExpr = expr[i];
					this.execExpr(subExpr, tplParser, thisComp, source, target);
					return;
				}
			} else if (theElse.test(subExpr)) { // else
				subExpr = expr[++i];
				this.execExpr(subExpr, tplParser, thisComp, source, target);
				return;
			} else if (theFi.test(subExpr)) { // end if
				return;
			}
		}
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
		var reg = / *{ *(if|elif|else|then|fi) *} */g;
		var match, lastIdx=0, curIdx=0;
		while ((match=reg.exec(expr)) != null) {
			curIdx = match.index;
			if (curIdx != lastIdx) {
				var t = expr.substring(lastIdx, curIdx).trim();
				if (t != "") splits.push(t);
			}
			splits.push("{" + match[1] + "}");
			lastIdx = reg.lastIndex;
		}
		if (lastIdx < expr.length) {
			splits.push(expr.substring(lastIdx, expr.length).trim());
		}

		return splits;
	}
};
