/**
 * internal functions
 */
Template.InternalFunctions = {

	eq : function(p1, p2) {
		if (p2.length == 0) return false;
		return (p1 == p2[0]);
	},

	ne : function(p1, p2) {
		if (p2.length == 0) return true;
		return (p1 != p2[0]);
	},

	gt : function(p1, p2) {
		if (p2.length == 0) return false;
		var t = p2[0];
		if (this.isNum(p1) && this.isNum(t))
			return parseFloat(p1) > parseFloat(t);

		return (p1 > t);
	},

	ge : function(p1, p2) {
		if (p2.length == 0) return false;
		var t = p2[0];
		if (this.isNum(p1) && this.isNum(t))
			return parseFloat(p1) >= parseFloat(t);

		return (p1 >= t);
	},

	lt : function(p1, p2) {
		if (p2.length == 0) return false;
		var t = p2[0];
		if (this.isNum(p1) && this.isNum(t))
			return parseFloat(p1) < parseFloat(t);

		return (p1 < t);
	},

	le : function(p1, p2) {
		if (p2.length == 0) return false;
		var t = p2[0];
		if (this.isNum(p1) && this.isNum(t))
			return parseFloat(p1) <= parseFloat(t);

		return (p1 <= t);
	},

	plus : function(p1, p2) {
		if (p2.length == 0) return p1;
		var t = p2[0];
		if (this.isNum(p1) && this.isNum(t))
			return parseFloat(p1) + parseFloat(t);

		return p1 + p2;
	},

	minus : function(p1, p2) {
		if (p2.length == 0) return p1;
		var t = p2[0];
		if (this.isNum(p1) && this.isNum(t))
			return parseFloat(p1) - parseFloat(t);

		// 从当前字符串中“减去”给定字符串（将其替换为空字符串）
		if (typeof p1 == "string" && typeof t == "string") {
			t = t.replace(/([\]\/\\])/g, "\\$1");
			t = new RegExp(t, "g");
			return p1.replace(t, "");
		}

		return NaN;
	},

	multiply : function(p1, p2) {
		if (p2.length == 0) return p1;
		var t = p2[0];
		if (this.isNum(p1) && this.isNum(t))
			return parseFloat(p1) * parseFloat(t);

		// 将当前字符串“乘以”特定的次数（重复指定次）
		if (typeof p1 == "string" && this.isNum(t)) {
			t = parseInt(t);
			if (t <= 0) return ""; // 小于0次返回空字符串

			var v = p1;
			while (t--) v += p1;
			return v;
		}

		return NaN;
	},

	division : function(p1, p2) {
		if (p2.length == 0) return p1;
		var t = p2[0];
		if (this.isNum(p1) && this.isNum(t)) {
			t = parseFloat(t);
			if (t == 0) return Infinity;

			return parseFloat(p1) / t;
		}

		// 将当前字符串“除以”特定的倍数（截取长度）
		if (typeof p1 == "string" && this.isNum(t)) {
			t = parseInt(t);
			if (t <= 0) return p1;

			return p1.substring(0, Math.floor(p1.length / t));
		}

		return NaN;
	},

	mod : function(p1, p2) {
		if (p2.length == 0) return 0;

		var t = p2[0];
		if (this.isNum(p1) && this.isNum(t)) {
			t = parseFloat(t);
			if (t == 0) return NaN;

			return parseFloat(p1) % t;
		}

		return NaN;
	},

	/**
	 * 
	 * 将给定的字符串转化为JSON对象。
	 * 如果参数不是字符串，或者不是合法的JSON表达式，返回null
	 * @param String p1
	 * @return {}
	 */
	json : function(s) {
		if (typeof s != "string") return null;

		return Qmk.util.JSON.decode(s);
	},

	/**
	 * 返回指定对象中的某个属性的值。
	 * @param {} obj
	 * @param [] p
	 * @return {}
	 */
	getObjField : function(obj, p) {
		if (obj == null || p.length == 0)
			throw "(getObjField)NullPointer";

		var fieldName = p[0];

		if ((obj.hasOwnProperty && obj.hasOwnProperty(fieldName))
				|| obj[fieldName] !== undefined)
			return obj[fieldName];

		var t = obj.prototype;
		if (t && ((t.hasOwnProperty && t.hasOwnProperty(fieldName))
				|| t[fieldName] !== undefined))
			return t[fieldName];
		t = obj.constructor.prototype;
		if (t && ((t.hasOwnProperty && t.hasOwnProperty(fieldName))
				|| t[fieldName] !== undefined))
			return t[fieldName];

		throw "(getObjField)Field Not Found(" + fieldName + ")";
	},

	/**
	 * 判断p是否为（十进制）数字。
	 * 当p为null时，返回false；
	 * 否则，若p的类型为数字，返回true；
	 * 否则，若p为字符串，去除首尾空格后，判断其是否符合正则表达式：
	 *   ^[+-]?((\d+\.?\d*)|(\d*\.?\d+))$
	 * 即：
	 * 可选地以+或-开头；
	 * 余下部分符合“数字.数字”的格式。
	 * （其中.号前面或后面可以没有数字，但不能都没有）
	 * 例如+3.5、5.8、8.、-.3都是有效的数字
	 * 
	 * 注意NaN是一个数字，虽然它的名字暗示它“Not A Number”
	 * 
	 * @param p
	 * @return 如果参数的类型是一个数字，或是一个符合数字格
	 * 式的字符串，返回true；否则返回false
	 */
	isNum : function(p) {
		if (p == null) return false;
		if (typeof p == "number") return true;
		if (typeof p != "string") return false;

		var num = /^[+-]?((\d+\.?\d*)|(\d*\.?\d+))$/;
		return num.test(p.trim());
	},

	/**
	 * return whether p is null or not.
	 * @param p
	 */
	isNull : function(p) {
		return (p == null);
	},

	/**
	 * 判断p是否为（十进制）整数。
	 * 当p不为数字时，返回false；当p是一个NaN时，返回false。
	 * 否则，当p不含有小数点时，返回true。
	 * 
	 * 所以要注意，3为整数，但3.0则属于非整数。
	 * 
	 * @param p
	 * @return 如果参数是一个整数，或者是一个表示整数的字符串，返回true；否则返回false
	 */
	isInteger : function(p) {
		if (!this.isNum(p)) return false;
		if (isNaN(p)) return false;

		return ((p+"").indexOf(".") == -1);
	},

	/**
	 * 判断p是否（相当于）一个（十进制）整数。
	 * 
	 * 与isInteger不同，如果p含有小数部分，但小数部分为0，p仍然
	 * 会被当成一个整数。例如3.0、8.00、-1.0等
	 * 
	 * @param p
	 * @return 如果p是一个整数，或一个表示整数的
	 * 字符串，返回true；否则返回false
	 */
	asInteger : function(p) {
		if (!this.isNum(p)) return false;

		if (typeof p == "number") {
			if (isNaN(p)) return false;
			return Math.floor(p) == p;
		}

		var t = parseFloat(p);
		return Math.floor(t) == t;
	},

	/**
	 * 判断给定的字符串是否全部由英文字母组成
	 */
	isLetter : function(p) {
		if (typeof p != "string") return false;
		var reg = /^[A-Za-z]+$/;
		return reg.test(p);
	},

	/**
	 * 判断给定的字符串是否与指定的正则表达式匹配
	 */
	regular : function(p1, p2) {
		if (typeof p1 != "string") return false;

		if (p2.length == 0
				|| p2[0] == null)
			return false;
		var reg = new RegExp(p2[0]);
		return reg.test(p1);
	},

	/**
	 * only true (in boolean) and true (in Boolean)
	 * and "true" (in string) and non-zero or non-NaN (in number)
	 * lead result to true; all others get false.
	 */
	toBool : function(p1) {
//		return (p1 === true || p1 == "true");
		if (typeof p1 == "string") return (p1 == "true");
		if (typeof p1 == "number") return (!isNaN(p1) && p1 != 0);
		if (typeof p1 == "boolean") return p1;
		if (p1 instanceof Boolean) return (p1 == true);

		return false;
	}
};
