/**
 *
 */
Qmk = {
	version : "1.0.0"
};

Qmk.apply = function(C, D, B) {
	if (B) {
		Qmk.apply(C, B)
	}
	if (C && D && typeof D == "object") {
		for (var A in D) {
			C[A] = D[A]
		}
	}
	return C
};

(function() {
	var ua = navigator.userAgent.toLowerCase();
	var isStrict      = document.compatMode == "CSS1Compat",
		isOpera       = ua.indexOf("opera") > -1,
		isSafari      = (/webkit|khtml/).test(ua),
		isSafari3     = isSafari && ua.indexOf("webkit/5") != -1,
		isIE          = !isOpera && ua.indexOf("msie") > -1,
		isIE7         = !isOpera && ua.indexOf("msie 7") > -1,
		isGecko       = !isSafari && ua.indexOf("gecko") > -1,
		isBorderBox   = isIE && !isStrict,
		isWindows     = (ua.indexOf("windows") != -1 || ua.indexOf("win32") != -1),
		isMac         = (ua.indexOf("macintosh") != -1 || ua.indexOf("mac os x") != -1),
		isAir         = (ua.indexOf("adobeair") != -1),
		isLinux       = (ua.indexOf("linux") != -1),
		isSecure      = window.location.href.toLowerCase().indexOf("https") === 0
		;

	if (isIE && !isIE7) {
		try {
			document.execCommand("BackgroundImageCache", false, true)
		} catch (e) {
		}
	}

	Qmk.apply(Qmk, {
		isStrict : isStrict,
		isSecure : isSecure,
		isReady : false,
		enableGarbageCollector : true,
		enableListenerCollection : false,
		SSL_SECURE_URL : "javascript:false",
		BLANK_IMAGE_URL : "http:/" + "/extjs.com/s.gif",
		emptyFn : function() {
		},
		applyIf : function(o, c) {
			if (o && c) {
				for (var p in c) {
					if (typeof o[p] == "undefined") {
						o[p] = c[p]
					}
				}
			}
			return o
		},
		addBehaviors : function(o) {
			if (!Qmk.isReady) {
				Qmk.onReady(function() {
					Qmk.addBehaviors(o)
				});
				return
			}
			var cache = {};
			for (var b in o) {
				var parts = b.split("@");
				if (parts[1]) {
					var s = parts[0];
					if (!cache[s]) {
						cache[s] = Qmk.select(s)
					}
					cache[s].on(parts[1], o[b])
				}
			}
			cache = null
		},
		extend : function() {
			var io = function(o) {
				for (var m in o) {
					this[m] = o[m]
				}
			};
			var oc = Object.prototype.constructor;
			return function(sb, sp, overrides) {
				if (typeof sp == "object") {
					overrides = sp;
					sp = sb;
					sb = overrides.constructor != oc
							? overrides.constructor
							: function() {
								sp.apply(this, arguments)
							}
				}
				var F = function() {
				}, sbp, spp = sp.prototype;
				F.prototype = spp;
				sbp = sb.prototype = new F();
				sbp.constructor = sb;
				sb.superclass = spp;
				if (spp.constructor == oc) {
					spp.constructor = sp
				}
				sb.override = function(o) {
					Qmk.override(sb, o)
				};
				sbp.override = io;
				Qmk.override(sb, overrides);
				sb.extend = function(o) {
					Qmk.extend(sb, o)
				};
				return sb
			}
		}(),
		override : function(origclass, overrides) {
			if (overrides) {
				var p = origclass.prototype;
				for (var method in overrides) {
					p[method] = overrides[method]
				}
			}
		},
		namespace : function() {
			var a = arguments, o = null, i, j, d, rt;
			for (i = 0; i < a.length; ++i) {
				d = a[i].split(".");
				rt = d[0];
				eval("if (typeof " + rt + " == \"undefined\"){" + rt
						+ " = {};} o = " + rt + ";");
				for (j = 1; j < d.length; ++j) {
					o[d[j]] = o[d[j]] || {};
					o = o[d[j]]
				}
			}
		},
		urlEncode : function(o) {
			if (!o) {
				return ""
			}
			var buf = [];
			for (var key in o) {
				var ov = o[key], k = encodeURIComponent(key);
				var type = typeof ov;
				if (type == "undefined") {
					buf.push(k, "=&")
				} else if (type != "function" && type != "object") {
						buf.push(k, "=", encodeURIComponent(ov), "&")
				} else if (Qmk.isArray(ov)) {
					if (ov.length) {
						for (var i = 0, len = ov.length; i < len; i++) {
							buf.push(k, "=",
								encodeURIComponent(ov[i] === undefined
										? ""
										: ov[i]), "&")
						}
					} else {
						buf.push(k, "=&")
					}
				}
			}
			buf.pop();
			return buf.join("")
		},
		urlDecode : function(string, overwrite) {
			if (!string || !string.length) {
				return {}
			}
			var obj = {};
			var pairs = string.split("&");
			var pair, name, value;
			for (var i = 0, len = pairs.length; i < len; i++) {
				pair = pairs[i].split("=");
				name = decodeURIComponent(pair[0]);
				value = decodeURIComponent(pair[1]);
				if (overwrite !== true) {
					if (typeof obj[name] == "undefined") {
						obj[name] = value
					} else {
						if (typeof obj[name] == "string") {
							obj[name] = [obj[name]];
							obj[name].push(value)
						} else {
							obj[name].push(value)
						}
					}
				} else {
					obj[name] = value
				}
			}
			return obj
		},
		each : function(array, fn, scope) {
			if (typeof array.length == "undefined" || typeof array == "string") {
				array = [array]
			}
			for (var i = 0, len = array.length; i < len; i++) {
				if (fn.call(scope || array[i], array[i], i, array) === false) {
					return i
				}
			}
		},
		combine : function() {
			var as = arguments, l = as.length, r = [];
			for (var i = 0; i < l; i++) {
				var a = as[i];
				if (Qmk.isArray(a)) {
					r = r.concat(a)
				} else {
					if (a.length !== undefined && !a.substr) {
						r = r.concat(Array.prototype.slice.call(a, 0))
					} else {
						r.push(a)
					}
				}
			}
			return r
		},
		escapeRe : function(s) {
			return s.replace(/([.*+?^${}()|[\]\/\\])/g, "\\$1")
		},
		callback : function(cb, scope, args, delay) {
			if (typeof cb == "function") {
				if (delay) {
					cb.defer(delay, scope, args || [])
				} else {
					cb.apply(scope, args || [])
				}
			}
		},
		num : function(v, defaultValue) {
			if (typeof v != "number") {
				return defaultValue
			}
			return v
		},
		removeNode : isIE ? function() {
			var d;
			return function(n) {
				if (n && n.tagName != "BODY") {
					d = d || document.createElement("div");
					d.appendChild(n);
					d.innerHTML = ""
				}
			}
		}() : function(n) {
			if (n && n.parentNode && n.tagName != "BODY") {
				n.parentNode.removeChild(n)
			}
		},
		type : function(o) {
			if (o === undefined || o === null) {
				return false
			}
			if (o.htmlElement) {
				return "element"
			}
			var t = typeof o;
			if (t == "object" && o.nodeName) {
				switch (o.nodeType) {
					case 1 :
						return "element";
					case 3 :
						return (/\S/).test(o.nodeValue)
								? "textnode"
								: "whitespace"
				}
			}
			if (t == "object" || t == "function") {
				switch (o.constructor) {
					case Array :
						return "array";
					case RegExp :
						return "regexp"
				}
				if (typeof o.length == "number" && typeof o.item == "function") {
					return "nodelist"
				}
			}
			return t
		},
		isEmpty : function(v, allowBlank) {
			return v === null || v === undefined
					|| (!allowBlank ? v === "" : false)
		},
		value : function(v, defaultValue, allowBlank) {
			return Qmk.isEmpty(v, allowBlank) ? defaultValue : v
		},
		isArray : function(v) {
			return v && typeof v.pop == "function"
		},
		isDate : function(v) {
			return v && typeof v.getFullYear == "function"
		},
		isOpera : isOpera,
		isSafari : isSafari,
		isSafari3 : isSafari3,
		isSafari2 : isSafari && !isSafari3,
		isIE : isIE,
		isIE6 : isIE && !isIE7,
		isIE7 : isIE7,
		isGecko : isGecko,
		isBorderBox : isBorderBox,
		isLinux : isLinux,
		isWindows : isWindows,
		isMac : isMac,
		isAir : isAir,
		useShims : ((isIE && !isIE7) || (isGecko && isMac))
	});
	Qmk.ns = Qmk.namespace
})();

Qmk.ns("Qmk", "Qmk.util", "Qmk.lib"
	// , "Qmk.grid", "Qmk.dd", "Qmk.tree", "Qmk.data",
	// "Qmk.form", "Qmk.menu", "Qmk.state", "Qmk.layout",
	// "Qmk.app", "Qmk.ux"
);

Qmk.apply(Function.prototype, {
	createCallback : function() {
		var A = arguments;
		var B = this;
		return function() {
			return B.apply(window, A)
		}
	},
	createDelegate : function(C, B, A) {
		var D = this;
		return function() {
			var F = B || arguments;
			if (A === true) {
				F = Array.prototype.slice.call(arguments, 0);
				F = F.concat(B)
			} else {
				if (typeof A == "number") {
					F = Array.prototype.slice.call(arguments, 0);
					var E = [A, 0].concat(B);
					Array.prototype.splice.apply(F, E)
				}
			}
			return D.apply(C || window, F)
		}
	},
	defer : function(C, E, B, A) {
		var D = this.createDelegate(E, B, A);
		if (C) {
			return setTimeout(D, C)
		}
		D();
		return 0
	},
	createSequence : function(B, A) {
		if (typeof B != "function") {
			return this
		}
		var C = this;
		return function() {
			var D = C.apply(this || window, arguments);
			B.apply(A || this || window, arguments);
			return D
		}
	},
	createInterceptor : function(B, A) {
		if (typeof B != "function") {
			return this
		}
		var C = this;
		return function() {
			B.target = this;
			B.method = C;
			if (B.apply(A || this || window, arguments) === false) {
				return
			}
			return C.apply(this || window, arguments)
		}
	}
});

Qmk.applyIf(String, {
	escape : function(A) {
		return A.replace(/('|\\)/g, "\\$1")
	},
	leftPad : function(D, B, C) {
		var A = new String(D);
		if (!C) {
			C = " "
		}
		while (A.length < B) {
			A = C + A
		}
		return A.toString()
	},
	format : function(B) {
		var A = Array.prototype.slice.call(arguments, 1);
		return B.replace(/\{(\d+)\}/g, function(C, D) {
			return A[D]
		})
	}
});

String.prototype.toggle = function(B, A) {
	return this == B ? A : B
};

String.prototype.trim = function() {
	var A = /^\s+|\s+$/g;
	return function() {
		return this.replace(A, "")
	}
}();

Qmk.applyIf(Number.prototype, {
	constrain : function(B, A) {
		return Math.min(Math.max(this, B), A)
	}
});

Qmk.applyIf(Array.prototype, {
	indexOf : function(C) {
		for (var B = 0, A = this.length; B < A; B++) {
			if (this[B] == C) {
				return B
			}
		}
		return -1
	},
	remove : function(B) {
		var A = this.indexOf(B);
		if (A != -1) {
			this.splice(A, 1)
		}
		return this
	}
});

Date.prototype.getElapsed = function(A) {
	return Math.abs((A || new Date()).getTime() - this.getTime())
};

/**
 * Format util.
 */
Qmk.util.Format = function() {
	var trimRe = /^\s+|\s+$/g;
	return {
		ellipsis : function(value, len) {
			if (value && value.length > len) {
				return value.substr(0, len-3)+"...";
			}
			return value;
		},

		undef : function(value) {
			return value !== undefined ? value : "";
		},

		defaultValue : function(value, defaultValue) {
			return value !== undefined && value !== '' ? value : defaultValue;
		},

		htmlEncode : function(value) {
			return !value ? value : String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
		},

		htmlDecode : function(value) {
			return !value ? value : String(value).replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"');
		},

		trim : function(value) {
			return String(value).replace(trimRe, "");
		},

		substr : function(value, start, length) {
			return String(value).substr(start, length);
		},

		lowercase : function(value) {
			return String(value).toLowerCase();
		},

		uppercase : function(value) {
			return String(value).toUpperCase();
		},

		capitalize : function(value) {
			return !value ? value : value.charAt(0).toUpperCase() + value.substr(1).toLowerCase();
		},

		call : function(value, fn) {
			if (arguments.length > 2) {
				var args = Array.prototype.slice.call(arguments, 2);
				args.unshift(value);
				return eval(fn).apply(window, args);
			} else {
				return eval(fn).call(window, value);
			}
		},

		usMoney : function(v) {
			v = (Math.round((v-0)*100))/100;
			v = (v == Math.floor(v)) ? v + ".00" : ((v*10 == Math.floor(v*10)) ? v + "0" : v);
			v = String(v);
			var ps = v.split('.');
			var whole = ps[0];
			var sub = ps[1] ? '.'+ ps[1] : '.00';
			var r = /(\d+)(\d{3})/;
			while (r.test(whole)) {
				whole = whole.replace(r, '$1' + ',' + '$2');
			}
			v = whole + sub;
			if (v.charAt(0) == '-') {
				return '-$' + v.substr(1);
			}
			return "$" +  v;
		},

		date : function(v, format) {
			if (!v) {
				return "";
			}
			if (!Qmk.isDate(v)) {
				v = new Date(Date.parse(v));
			}
			return v.dateFormat(format || "m/d/Y");
		},

		dateRenderer : function(format) {
			return function(v) {
				return Qmk.util.Format.date(v, format);
			};
		},

		stripTagsRE : /<\/?[^>]+>/gi,

		stripTags : function(v) {
			return !v ? v : String(v).replace(this.stripTagsRE, "");
		},

		stripScriptsRe : /(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig,

		stripScripts : function(v) {
			return !v ? v : String(v).replace(this.stripScriptsRe, "");
		},

		fileSize : function(size) {
			if (size < 1024) {
				return size + " bytes";
			} else if (size < 1048576) {
				return (Math.round(((size*10) / 1024))/10) + " KB";
			} else if (size < 1073741824) {
				return (Math.round(((size*10) / 1048576))/10) + " MB";
			} else {
				return (Math.round(((size*10) / 1073741824))/10) + " GB";
			}
		},

		math : function() {
			var fns = {};
			return function(v, a) {
				if (!fns[a]) {
					fns[a] = new Function('v', 'return v ' + a + ';');
				}
				return fns[a](v);
			}
		}()
	};
}();

/**
 * Template engine.
 * @param String html
 */
Qmk.Template = function(html) {
	var a = arguments;
	if (Qmk.isArray(html)) {
		html = html.join("");
	} else if (a.length > 1) {
		var buf = [];
		for (var i = 0, len = a.length; i < len; i++) {
			if (typeof a[i] == 'object') {
				Qmk.apply(this, a[i]);
			} else {
				buf[buf.length] = a[i];
			}
		}
		html = buf.join('');
	}

	this.html = html;
	if (this.compiled) {
		this.compile();
	}
};

Qmk.Template.prototype = {
	applyTemplate : function(values) {
		if (this.compiled) {
			return this.compiled(values);
		}
		var useF = this.disableFormats !== true;
		var fm = Qmk.util.Format, tpl = this;
		var fn = function(m, name, format, args) {
			if (format && useF) {
				if (format.substr(0, 5) == "this.") {
					return tpl.call(format.substr(5), values[name], values);
				} else {
					if (args) {
						var re = /^\s*['"](.*)["']\s*$/;
						args = args.split(',');
						for (var i = 0, len = args.length; i < len; i++) {
							args[i] = args[i].replace(re, "$1");
						}
						args = [values[name]].concat(args);
					} else {
						args = [values[name]];
					}
					return fm[format].apply(fm, args);
				}
			} else {
				return values[name] !== undefined ? values[name] : "";
			}
		};
		return this.html.replace(this.re, fn);
	},

	set : function(html, compile) {
		this.html = html;
		this.compiled = null;
		if (compile) {
			this.compile();
		}
		return this;
	},

	disableFormats : false,

	re : /\{([\w-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,

	compile : function() {
		var fm = Qmk.util.Format;
		var useF = this.disableFormats !== true;
		var sep = Qmk.isGecko ? "+" : ",";
		var fn = function(m, name, format, args) {
			if (format && useF) {
				args = args ? ',' + args : "";
				if (format.substr(0, 5) != "this.") {
					format = "fm." + format + '(';
				} else {
					format = 'this.call("'+ format.substr(5) + '", ';
					args = ", values";
				}
			} else {
				args= ''; format = "(values['" + name + "'] == undefined ? '' : ";
			}
			return "'"+ sep + format + "values['" + name + "']" + args + ")"+sep+"'";
		};
		var body;

		if (Qmk.isGecko) {
			body = "this.compiled = function(values){ return '" +
				   this.html.replace(/\\/g, '\\\\').replace(/(\r\n|\n)/g, '\\n').replace(/'/g, "\\'").replace(this.re, fn) +
					"';};";
		} else {
			body = ["this.compiled = function(values){ return ['"];
			body.push(this.html.replace(/\\/g, '\\\\').replace(/(\r\n|\n)/g, '\\n').replace(/'/g, "\\'").replace(this.re, fn));
			body.push("'].join('');};");
			body = body.join('');
		}
		eval(body);
		return this;
	},


	call : function(fnName, value, allValues) {
		return this[fnName](value, allValues);
	}
};

Qmk.Template.prototype.apply = Qmk.Template.prototype.applyTemplate;

/**
 * XTemplate, extends from Qmk.Template.
 *
 */
Qmk.XTemplate = function() {
	Qmk.XTemplate.superclass.constructor.apply(this, arguments);
	var s = this.html;

	s = ['<tpl>', s, '</tpl>'].join('');

	var re = /<tpl\b[^>]*>((?:(?=([^<]+))\2|<(?!tpl\b[^>]*>))*?)<\/tpl>/;

	var nameRe = /^<tpl\b[^>]*?for="(.*?)"/;
	var ifRe = /^<tpl\b[^>]*?if="(.*?)"/;
	var execRe = /^<tpl\b[^>]*?exec="(.*?)"/;
	var m, id = 0;
	var tpls = [];

	while (m = s.match(re)) {
	   var m2 = m[0].match(nameRe);
	   var m3 = m[0].match(ifRe);
	   var m4 = m[0].match(execRe);
	   var exp = null, fn = null, exec = null;
	   var name = m2 && m2[1] ? m2[1] : '';
	   if (m3) {
		   exp = m3 && m3[1] ? m3[1] : null;
		   if (exp) {
			   fn = new Function('values', 'parent', 'xindex', 'xcount', 'with(values){ return '+(Qmk.util.Format.htmlDecode(exp))+'; }');
		   }
	   }
	   if (m4) {
		   exp = m4 && m4[1] ? m4[1] : null;
		   if(exp){
			   exec = new Function('values', 'parent', 'xindex', 'xcount', 'with(values){ '+(Qmk.util.Format.htmlDecode(exp))+'; }');
		   }
	   }
	   if (name) {
		   switch (name) {
			   case '.': name = new Function('values', 'parent', 'with(values){ return values; }'); break;
			   case '..': name = new Function('values', 'parent', 'with(values){ return parent; }'); break;
			   default: name = new Function('values', 'parent', 'with(values){ return '+name+'; }');
		   }
	   }
	   tpls.push({
			id: id,
			target: name,
			exec: exec,
			test: fn,
			body: m[1]||''
		});
	   s = s.replace(m[0], '{xtpl'+ id + '}');
	   ++id;
	}
	for (var i = tpls.length-1; i >= 0; --i) {
		this.compileTpl(tpls[i]);
	}
	this.master = tpls[tpls.length-1];
	this.tpls = tpls;
};

Qmk.extend(Qmk.XTemplate, Qmk.Template, {
	re : /\{([\w-\.\#]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?(\s?[\+\-\*\\]\s?[\d\.\+\-\*\\\(\)]+)?\}/g,

	codeRe : /\{\[((?:\\\]|.|\n)*?)\]\}/g,

	applySubTemplate : function(id, values, parent, xindex, xcount) {
		var t = this.tpls[id];
		if (t.test && !t.test.call(this, values, parent, xindex, xcount)) {
			return '';
		}
		if (t.exec && t.exec.call(this, values, parent, xindex, xcount)) {
			return '';
		}
		var vs = t.target ? t.target.call(this, values, parent) : values;
		parent = t.target ? values : parent;
		if (t.target && Qmk.isArray(vs)) {
			var buf = [];
			for (var i = 0, len = vs.length; i < len; i++) {
				buf[buf.length] = t.compiled.call(this, vs[i], parent, i+1, len);
			}
			return buf.join('');
		}
		return t.compiled.call(this, vs, parent, xindex, xcount);
	},

	compileTpl : function(tpl) {
		var fm = Qmk.util.Format;
		var useF = this.disableFormats !== true;
		var sep = Qmk.isGecko ? "+" : ",";
		var fn = function (m, name, format, args, math) {
			if (name.substr(0, 4) == 'xtpl') {
				return "'"+ sep +'this.applySubTemplate('+name.substr(4)+', values, parent, xindex, xcount)'+sep+"'";
			}
			var v;
			if (name === '.') {
				v = 'values';
			} else if (name === '#') {
				v = 'xindex';
			} else if (name.indexOf('.') != -1) {
				v = name;
			} else {
				v = "values['" + name + "']";
			}
			if (math) {
				v = '(' + v + math + ')';
			}
			if (format && useF) {
				args = args ? ',' + args : "";
				if (format.substr(0, 5) != "this.") {
					format = "fm." + format + '(';
				} else {
					format = 'this.call("'+ format.substr(5) + '", ';
					args = ", values";
				}
			} else {
				args= ''; format = "("+v+" === undefined ? '' : ";
			}
			return "'"+ sep + format + v + args + ")"+sep+"'";
		};
		var codeFn = function(m, code) {
			return "'"+ sep +'('+code+')'+sep+"'";
		};

		var body;
		if (Qmk.isGecko) {
			body = "tpl.compiled = function(values, parent, xindex, xcount){ return '" +
				   tpl.body.replace(/(\r\n|\n)/g, '\\n').replace(/'/g, "\\'").replace(this.re, fn).replace(this.codeRe, codeFn) +
					"';};";
		} else {
			body = ["tpl.compiled = function(values, parent, xindex, xcount){ return ['"];
			body.push(tpl.body.replace(/(\r\n|\n)/g, '\\n').replace(/'/g, "\\'").replace(this.re, fn).replace(this.codeRe, codeFn));
			body.push("'].join('');};");
			body = body.join('');
		}
		eval(body);
		return this;
	},

	apply : function(values) {
		return this.master.compiled.call(this, values, {}, 1, 1);
	},

	applyTemplate : function(values) {
		return this.master.compiled.call(this, values, {}, 1, 1);
	},

	compile : function(){return this;}
});

/**
 * Observable.
 */
Qmk.util.Observable = function() {
	if (this.listeners) {
		this.on(this.listeners);
		delete this.listeners;
	}
};
Qmk.util.Observable.prototype = {
	fireEvent : function() {
		if (this.eventsSuspended !== true) {
			var ce = this.events[arguments[0].toLowerCase()];
			if (typeof ce == "object") {
				return ce.fire.apply(ce, Array.prototype.slice.call(arguments, 1));
			}
		}
		return true;
	},

	filterOptRe : /^(?:scope|delay|buffer|single)$/,

	addListener : function(eventName, fn, scope, o) {
		if (typeof eventName == "object") {
			o = eventName;
			for (var e in o) {
				if (this.filterOptRe.test(e)) {
					continue;
				}
				if (typeof o[e] == "function") {
					this.addListener(e, o[e], o.scope, o);
				} else {
					this.addListener(e, o[e].fn, o[e].scope, o[e]);
				}
			}
			return;
		}
		o = (!o || typeof o == "boolean") ? {} : o;
		eventName = eventName.toLowerCase();
		var ce = this.events[eventName] || true;
		if (typeof ce == "boolean") {
			ce = new Qmk.util.Event(this, eventName);
			this.events[eventName] = ce;
		}
		ce.addListener(fn, scope, o);
	},

	removeListener : function(eventName, fn, scope) {
		var ce = this.events[eventName.toLowerCase()];
		if (typeof ce == "object") {
			ce.removeListener(fn, scope);
		}
	},

	purgeListeners : function() {
		for (var evt in this.events) {
			if (typeof this.events[evt] == "object") {
				this.events[evt].clearListeners();
			}
		}
	},

	relayEvents : function(o, events) {
		var createHandler = function(ename) {
			return function() {
				return this.fireEvent.apply(this, Qmk.combine(ename,
								Array.prototype.slice.call(arguments, 0)));
			};
		};
		for (var i = 0, len = events.length; i < len; i++) {
			var ename = events[i];
			if (!this.events[ename]) {
				this.events[ename] = true;
			};
			o.on(ename, createHandler(ename), this);
		}
	},

	addEvents : function(o) {
		if (!this.events) {
			this.events = {};
		}
		if (typeof o == 'string') {
			for (var i = 0, a = arguments, v; v = a[i]; i++) {
				if (!this.events[a[i]]) {
					o[a[i]] = true;
				}
			}
		} else {
			Qmk.applyIf(this.events, o);
		}
	},

	hasListener : function(eventName) {
		var e = this.events[eventName];
		return typeof e == "object" && e.listeners.length > 0;
	},

	suspendEvents : function() {
		this.eventsSuspended = true;
	},

	resumeEvents : function() {
		this.eventsSuspended = false;
	},

	getMethodEvent : function(method) {
		if (!this.methodEvents) {
			this.methodEvents = {};
		}
		var e = this.methodEvents[method];
		if (!e) {
			e = {};
			this.methodEvents[method] = e;

			e.originalFn = this[method];
			e.methodName = method;
			e.before = [];
			e.after = [];

			var returnValue, v, cancel;
			var obj = this;

			var makeCall = function(fn, scope, args) {
				if ((v = fn.apply(scope || obj, args)) !== undefined) {
					if (typeof v === 'object') {
						if (v.returnValue !== undefined) {
							returnValue = v.returnValue;
						} else {
							returnValue = v;
						}
						if (v.cancel === true) {
							cancel = true;
						}
					} else if (v === false) {
						cancel = true;
					} else {
						returnValue = v;
					}
				}
			}

			this[method] = function() {
				returnValue = v = undefined;
				cancel = false;
				var args = Array.prototype.slice.call(arguments, 0);
				for (var i = 0, len = e.before.length; i < len; i++) {
					makeCall(e.before[i].fn, e.before[i].scope, args);
					if (cancel) {
						return returnValue;
					}
				}

				if ((v = e.originalFn.apply(obj, args)) !== undefined) {
					returnValue = v;
				}

				for (var i = 0, len = e.after.length; i < len; i++) {
					makeCall(e.after[i].fn, e.after[i].scope, args);
					if (cancel) {
						return returnValue;
					}
				}
				return returnValue;
			};
		}
		return e;
	},

	beforeMethod : function(method, fn, scope) {
		var e = this.getMethodEvent(method);
		e.before.push({
					fn : fn,
					scope : scope
				});
	},

	afterMethod : function(method, fn, scope) {
		var e = this.getMethodEvent(method);
		e.after.push({
					fn : fn,
					scope : scope
				});
	},

	removeMethodListener : function(method, fn, scope) {
		var e = this.getMethodEvent(method);
		for (var i = 0, len = e.before.length; i < len; i++) {
			if (e.before[i].fn == fn && e.before[i].scope == scope) {
				e.before.splice(i, 1);
				return;
			}
		}
		for (var i = 0, len = e.after.length; i < len; i++) {
			if (e.after[i].fn == fn && e.after[i].scope == scope) {
				e.after.splice(i, 1);
				return;
			}
		}
	}
};

Qmk.util.Observable.prototype.on = Qmk.util.Observable.prototype.addListener;

Qmk.util.Observable.prototype.un = Qmk.util.Observable.prototype.removeListener;

Qmk.util.Observable.capture = function(o, fn, scope) {
	o.fireEvent = o.fireEvent.createInterceptor(fn, scope);
};

Qmk.util.Observable.releaseCapture = function(o) {
	o.fireEvent = Qmk.util.Observable.prototype.fireEvent;
};

/**
 * Event.
 */
(function() {
	var createBuffered = function(h, o, scope) {
		var task = new Qmk.util.DelayedTask();
		return function() {
			task.delay(o.buffer, h, scope, Array.prototype.slice.call(arguments, 0));
		};
	};

	var createSingle = function(h, e, fn, scope) {
		return function() {
			e.removeListener(fn, scope);
			return h.apply(scope, arguments);
		};
	};

	var createDelayed = function(h, o, scope) {
		return function() {
			var args = Array.prototype.slice.call(arguments, 0);
			setTimeout(function() {
				h.apply(scope, args);
			}, o.delay || 10);
		};
	};

	Qmk.util.Event = function(obj, name) {
		this.name = name;
		this.obj = obj;
		this.listeners = [];
	};

	Qmk.util.Event.prototype = {
		addListener : function(fn, scope, options) {
			scope = scope || this.obj;
			if (!this.isListening(fn, scope)) {
				var l = this.createListener(fn, scope, options);
				if (!this.firing) {
					this.listeners.push(l);
				} else {
					this.listeners = this.listeners.slice(0);
					this.listeners.push(l);
				}
			}
		},

		createListener : function(fn, scope, o) {
			o = o || {};
			scope = scope || this.obj;
			var l = {fn: fn, scope: scope, options: o};
			var h = fn;
			if (o.delay) {
				h = createDelayed(h, o, scope);
			}
			if (o.single) {
				h = createSingle(h, this, fn, scope);
			}
			if (o.buffer) {
				h = createBuffered(h, o, scope);
			}
			l.fireFn = h;
			return l;
		},

		findListener : function(fn, scope) {
			scope = scope || this.obj;
			var ls = this.listeners;
			for (var i = 0, len = ls.length; i < len; i++) {
				var l = ls[i];
				if (l.fn == fn && l.scope == scope) {
					return i;
				}
			}
			return -1;
		},

		isListening : function(fn, scope) {
			return this.findListener(fn, scope) != -1;
		},

		removeListener : function(fn, scope) {
			var index;
			if ((index = this.findListener(fn, scope)) != -1) {
				if (!this.firing) {
					this.listeners.splice(index, 1);
				} else {
					this.listeners = this.listeners.slice(0);
					this.listeners.splice(index, 1);
				}
				return true;
			}
			return false;
		},

		clearListeners : function() {
			this.listeners = [];
		},

		fire : function() {
			var ls = this.listeners, scope, len = ls.length;
			if (len > 0) {
				this.firing = true;
				var args = Array.prototype.slice.call(arguments, 0);
				for (var i = 0; i < len; i++) {
					var l = ls[i];
					if (l.fireFn.apply(l.scope||this.obj||window, arguments) === false) {
						this.firing = false;
						return false;
					}
				}
				this.firing = false;
			}
			return true;
		}
	};
})();

/**
 *
 * @param {} fn
 * @param {} scope
 * @param {} args
 */
Qmk.util.DelayedTask = function(fn, scope, args) {
	var id = null, d, t;

	var call = function() {
		var now = new Date().getTime();
		if (now - t >= d) {
			clearInterval(id);
			id = null;
			fn.apply(scope, args || []);
		}
	};

	this.delay = function(delay, newFn, newScope, newArgs) {
		if (id && delay != d) {
			this.cancel();
		}
		d = delay;
		t = new Date().getTime();
		fn = newFn || fn;
		scope = newScope || scope;
		args = newArgs || args;
		if (!id) {
			id = setInterval(call, d);
		}
	};

	this.cancel = function() {
		if (id) {
			clearInterval(id);
			id = null;
		}
	};
};

/**
 *
 * @param {} interval
 */
Qmk.util.TaskRunner = function(interval) {
	interval = interval || 10;
	var tasks = [], removeQueue = [];
	var id = 0;
	var running = false;

	var stopThread = function() {
		running = false;
		clearInterval(id);
		id = 0;
	};

	var startThread = function() {
		if (!running) {
			running = true;
			id = setInterval(runTasks, interval);
		}
	};

	var removeTask = function(t) {
		removeQueue.push(t);
		if (t.onStop) {
			t.onStop.apply(t.scope || t);
		}
	};

	var runTasks = function() {
		if (removeQueue.length > 0) {
			for (var i = 0, len = removeQueue.length; i < len; i++) {
				tasks.remove(removeQueue[i]);
			}
			removeQueue = [];
			if (tasks.length < 1) {
				stopThread();
				return;
			}
		}
		var now = new Date().getTime();
		for (var i = 0, len = tasks.length; i < len; ++i) {
			var t = tasks[i];
			var itime = now - t.taskRunTime;
			if (t.interval <= itime) {
				var rt = t.run.apply(t.scope || t, t.args || [++t.taskRunCount]);
				t.taskRunTime = now;
				if (rt === false || t.taskRunCount === t.repeat) {
					removeTask(t);
					return;
				}
			}
			if (t.duration && t.duration <= (now - t.taskStartTime)) {
				removeTask(t);
			}
		}
	};

	this.start = function(task) {
		tasks.push(task);
		task.taskStartTime = new Date().getTime();
		task.taskRunTime = 0;
		task.taskRunCount = 0;
		startThread();
		return task;
	};

	this.stop = function(task) {
		removeTask(task);
		return task;
	};

	this.stopAll = function() {
		stopThread();
		for (var i = 0, len = tasks.length; i < len; i++) {
			if (tasks[i].onStop) {
				tasks[i].onStop();
			}
		}
		tasks = [];
		removeQueue = [];
	};
};

/**
 *
 */
Qmk.util.JSON = new (function() {
	var useHasOwn = {}.hasOwnProperty ? true : false;

	var pad = function(n) {
		return n < 10 ? "0" + n : n;
	};

	var m = {
		"\b": '\\b',
		"\t": '\\t',
		"\n": '\\n',
		"\f": '\\f',
		"\r": '\\r',
		'"' : '\\"',
		"\\": '\\\\'
	};

	var encodeString = function(s) {
		if (/["\\\x00-\x1f]/.test(s)) {
			return '"' + s.replace(/([\x00-\x1f\\"])/g, function(a, b) {
				var c = m[b];
				if (c) {
					return c;
				}
				c = b.charCodeAt();
				return "\\u00" + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
			}) + '"';
		}
		return '"' + s + '"';
	};

	var encodeArray = function(o) {
		var a = ["["], b, i, l = o.length, v;
			for (i = 0; i < l; i += 1) {
				v = o[i];
				switch (typeof v) {
					case "undefined":
					case "function":
					case "unknown":
						break;
					default:
						if (b) {
							a.push(',');
						}
						a.push(v === null ? "null" : Qmk.util.JSON.encode(v));
						b = true;
				}
			}
			a.push("]");
			return a.join("");
	};

	var encodeDate = function(o) {
		return '"' + o.getFullYear() + "-" +
				pad(o.getMonth() + 1) + "-" +
				pad(o.getDate()) + "T" +
				pad(o.getHours()) + ":" +
				pad(o.getMinutes()) + ":" +
				pad(o.getSeconds()) + '"';
	};

	this.encode = function(o) {
		if (typeof o == "undefined" || o === null) {
			return "null";
		} else if (Qmk.isArray(o)) {
			return encodeArray(o);
		} else if (Qmk.isDate(o)) {
			return encodeDate(o);
		} else if (typeof o == "string") {
			return encodeString(o);
		} else if (typeof o == "number") {
			return isFinite(o) ? String(o) : "null";
		} else if (typeof o == "boolean"){ 
			return String(o);
		} else {
			var a = ["{"], b, i, v;
			for (i in o) {
				if (!useHasOwn || o.hasOwnProperty(i)) {
					v = o[i];
					switch (typeof v) {
						case "undefined":
						case "function":
						case "unknown":
							break;
						default:
							if (b) {
								a.push(',');
							}
							a.push(this.encode(i), ":", v === null ? "null" : this.encode(v));
							b = true;
					}
				}
			}
			a.push("}");
			return a.join("");
		}
	};

	this.decode = function(jsonStr) {
		try {
			return eval('(' + jsonStr + ')');
		} catch (e) {
			return null;
		}
	};
})();
