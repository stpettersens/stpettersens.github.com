(function () { "use strict";
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.__name__ = true;
EReg.prototype = {
	replace: function(s,by) {
		return s.replace(this.r,by);
	}
	,__class__: EReg
}
var HGaudiApp = function() { }
HGaudiApp.__name__ = true;
HGaudiApp.displayVersion = function() {
	HGaudiPlatform.println("hackedGaudi v. " + HGaudiApp.appVersion + HGaudiPlatform.getPlatform());
}
HGaudiApp.displayError = function(error) {
	HGaudiPlatform.println("Error: " + error + ".");
	HGaudiApp.displayUsage(HGaudiApp.errorCode);
}
HGaudiApp.displayUsage = function(exitCode) {
	var usage = "hackedGaudi platform agnostic build tool" + "\nCopyright (c) 2013 Sam Saint-Pettersen" + "\n\nReleased under the MIT/X11 License." + "\n\nUsage: hgaudi [-l][-u][-i][-v][-n][-m][-q]";
	HGaudiPlatform.println(usage);
}
HGaudiApp.loadBuild = function(action) {
	var buildConf = null;
	var request = new XMLHttpRequest();
	request.open("GET",HGaudiApp.buildFile,false);
	request.send();
	if(request.status == 200) buildConf = request.responseText; else HGaudiApp.displayError("Build file (" + HGaudiApp.buildFile + ") cannot be loaded");
	buildConf = StringTools.replace(buildConf,"\t","");
	var foreman = new HGaudiForeman(buildConf,action);
	var builder = new HGaudiBuilder(action);
	builder.setTarget(foreman.getTarget());
	builder.setAction(foreman.getAction());
	builder.doAction();
}
HGaudiApp.main = function() {
	HGaudiApp.buildFile = "build.json";
	var action = "build";
	var prompt = function() {
		HGaudiPlatform.instruct("Load a build file to begin with: hgaudi -l &lt;file&gt; or -u &lt;url&gt;.");
		HGaudiApp.displayUsage(HGaudiApp.cleanCode);
	};
	new $(function() {
		var loaded = false;
		prompt();
		new $("#enterCommand").click(function(ev) {
			HGaudiPlatform.cls();
			var commandParam = new $("#command").val();
			var command = commandParam.split(" ");
			HGaudiPlatform.clear();
			console.log(command);
			if(command[1] == "-l") {
				HGaudiApp.buildFile = command[2];
				loaded = true;
				if(command[3] != null) action = command[3];
				HGaudiPlatform.cls();
				HGaudiApp.loadBuild(action);
			} else if(command[1].charAt(0) == "-") {
				if(command[1] == "-v") HGaudiApp.displayVersion(); else if(command[1] == "-i") HGaudiApp.displayUsage(HGaudiApp.cleanCode);
			} else if(loaded && command[1] != "") HGaudiApp.loadBuild(command[1]); else if(command[1] == "") HGaudiApp.displayError("No build file or action provided");
		});
	});
}
var HGaudiBuilder = function(action_name) {
	this.action_name = action_name;
	this.passed = false;
	this.verbose = true;
};
HGaudiBuilder.__name__ = true;
HGaudiBuilder.prototype = {
	doAction: function() {
		HGaudiPlatform.println("[ " + this.target + " => " + this.action_name + " ]");
		var $it0 = this.action.keys();
		while( $it0.hasNext() ) {
			var command = $it0.next();
			var exitCode = this.doCommand(command,this.action.get(command));
			if(exitCode == 0) this.passed = true; else this.passed = false;
		}
		var status = "failed";
		if(this.passed) status = "completed successfully";
		HGaudiPlatform.println("\nAction " + status + ".");
	}
	,doCommand: function(command,param) {
		this.printCommand(command,param);
		var exitCode = 0;
		switch(command) {
		case "null":
			break;
		case "exec":
			exitCode = this.execExtern(param);
			break;
		case "erase":
			break;
		}
		return exitCode;
	}
	,setAction: function(action) {
		this.action = action;
	}
	,setTarget: function(target) {
		this.target = target;
	}
	,execExtern: function(app) {
		var app1 = app.split(" ");
		var params = app1.slice(2,app1.length - 1);
		return 0;
	}
	,printCommand: function(command,param) {
		if(this.verbose && command != "echo" && command != "null") HGaudiPlatform.println("\t:" + command + " " + param); else if(command == "echo") HGaudiPlatform.println("\t#" + param);
	}
	,__class__: HGaudiBuilder
}
var HGaudiForeman = function(buildConf,action_name) {
	this.buildConf = buildConf;
	this.action_name = action_name;
	this.parseBuildJSON();
};
HGaudiForeman.__name__ = true;
HGaudiForeman.prototype = {
	getAction: function() {
		return this.action;
	}
	,getTarget: function() {
		return this.preamble.get("target");
	}
	,parseBuildJSON: function() {
		this.preamble = new haxe.ds.StringMap();
		var json = null;
		try {
			json = haxe.Json.parse(this.buildConf);
		} catch( msg ) {
			if( js.Boot.__instanceof(msg,String) ) {
				HGaudiApp.displayError("Badly formatted JSON in build file");
			} else throw(msg);
		}
		var _g = 0, _g1 = Reflect.fields(json.preamble);
		while(_g < _g1.length) {
			var key = _g1[_g];
			++_g;
			var p = Reflect.field(json.preamble,key);
			this.preamble.set(Std.string(key),Std.string(p));
		}
		var json_b = haxe.Json.parse(this.buildConf);
		var x = new haxe.ds.StringMap();
		var a = null;
		this.action = new haxe.ds.StringMap();
		var _g = this;
		switch(_g.action_name) {
		case "build":
			var _g1 = 0, _g2 = Reflect.fields(json_b.build);
			while(_g1 < _g2.length) {
				var key = _g2[_g1];
				++_g1;
				a = Reflect.field(json_b.build,key);
				x.set(Std.string(key),Std.string(a));
				var y = x.get(key);
				y = StringTools.replace(y,"[","");
				y = StringTools.replace(y,"{","");
				y = StringTools.replace(y,"}","");
				y = StringTools.replace(y,"\n","");
				var z = y.split(":");
				var regex = new EReg("(\\W+)","g");
				z[0] = regex.replace(z[0],"");
				this.action.set(z[0],z[1]);
			}
			break;
		case "clean":
			var _g1 = 0, _g2 = Reflect.fields(json_b.clean);
			while(_g1 < _g2.length) {
				var key = _g2[_g1];
				++_g1;
				a = Reflect.field(json_b.clean,key);
				x.set(Std.string(key),Std.string(a));
				var y = x.get(key);
				y = StringTools.replace(y,"[","");
				y = StringTools.replace(y,"{","");
				y = StringTools.replace(y,"}","");
				y = StringTools.replace(y,"\n","");
				var z = y.split(":");
				var regex = new EReg("(\\W+)","g");
				z[0] = regex.replace(z[0],"");
				this.action.set(z[0],z[1]);
			}
			break;
		}
	}
	,__class__: HGaudiForeman
}
var HGaudiPlatform = function() { }
HGaudiPlatform.__name__ = true;
HGaudiPlatform.println = function(line) {
	new $(function() {
		new $("#console").append(line + "<br/>").fadeIn("slow",function() {
		});
	});
}
HGaudiPlatform.instruct = function(line) {
	new $(function() {
		new $("#console").append("<strong>" + line + "</strong><br/>");
	});
}
HGaudiPlatform.cls = function() {
	new $(function() {
		new $("#console").empty();
	});
}
HGaudiPlatform.clear = function() {
	new $(function() {
		new $("#command").val("");
		new $("#command").val("hgaudi ");
		new $("#command").focus();
	});
}
HGaudiPlatform.getPlatform = function() {
	var platform = null;
	platform = "JavaScript";
	return " (" + platform + ").";
}
var HxOverrides = function() { }
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
}
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
}
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
}
var Reflect = function() { }
Reflect.__name__ = true;
Reflect.field = function(o,field) {
	var v = null;
	try {
		v = o[field];
	} catch( e ) {
	}
	return v;
}
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
}
var Std = function() { }
Std.__name__ = true;
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
}
Std.parseFloat = function(x) {
	return parseFloat(x);
}
var StringBuf = function() {
	this.b = "";
};
StringBuf.__name__ = true;
StringBuf.prototype = {
	addSub: function(s,pos,len) {
		this.b += len == null?HxOverrides.substr(s,pos,null):HxOverrides.substr(s,pos,len);
	}
	,__class__: StringBuf
}
var StringTools = function() { }
StringTools.__name__ = true;
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
}
var haxe = {}
haxe.Json = function() {
};
haxe.Json.__name__ = true;
haxe.Json.parse = function(text) {
	return new haxe.Json().doParse(text);
}
haxe.Json.prototype = {
	parseNumber: function(c) {
		var start = this.pos - 1;
		var minus = c == 45, digit = !minus, zero = c == 48;
		var point = false, e = false, pm = false, end = false;
		while(true) {
			c = this.str.charCodeAt(this.pos++);
			switch(c) {
			case 48:
				if(zero && !point) this.invalidNumber(start);
				if(minus) {
					minus = false;
					zero = true;
				}
				digit = true;
				break;
			case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:
				if(zero && !point) this.invalidNumber(start);
				if(minus) minus = false;
				digit = true;
				zero = false;
				break;
			case 46:
				if(minus || point) this.invalidNumber(start);
				digit = false;
				point = true;
				break;
			case 101:case 69:
				if(minus || zero || e) this.invalidNumber(start);
				digit = false;
				e = true;
				break;
			case 43:case 45:
				if(!e || pm) this.invalidNumber(start);
				digit = false;
				pm = true;
				break;
			default:
				if(!digit) this.invalidNumber(start);
				this.pos--;
				end = true;
			}
			if(end) break;
		}
		var f = Std.parseFloat(HxOverrides.substr(this.str,start,this.pos - start));
		var i = f | 0;
		return i == f?i:f;
	}
	,invalidNumber: function(start) {
		throw "Invalid number at position " + start + ": " + HxOverrides.substr(this.str,start,this.pos - start);
	}
	,parseString: function() {
		var start = this.pos;
		var buf = new StringBuf();
		while(true) {
			var c = this.str.charCodeAt(this.pos++);
			if(c == 34) break;
			if(c == 92) {
				buf.addSub(this.str,start,this.pos - start - 1);
				c = this.str.charCodeAt(this.pos++);
				switch(c) {
				case 114:
					buf.b += "\r";
					break;
				case 110:
					buf.b += "\n";
					break;
				case 116:
					buf.b += "\t";
					break;
				case 98:
					buf.b += "";
					break;
				case 102:
					buf.b += "";
					break;
				case 47:case 92:case 34:
					buf.b += String.fromCharCode(c);
					break;
				case 117:
					var uc = Std.parseInt("0x" + HxOverrides.substr(this.str,this.pos,4));
					this.pos += 4;
					buf.b += String.fromCharCode(uc);
					break;
				default:
					throw "Invalid escape sequence \\" + String.fromCharCode(c) + " at position " + (this.pos - 1);
				}
				start = this.pos;
			} else if(c != c) throw "Unclosed string";
		}
		buf.addSub(this.str,start,this.pos - start - 1);
		return buf.b;
	}
	,parseRec: function() {
		while(true) {
			var c = this.str.charCodeAt(this.pos++);
			switch(c) {
			case 32:case 13:case 10:case 9:
				break;
			case 123:
				var obj = { }, field = null, comma = null;
				while(true) {
					var c1 = this.str.charCodeAt(this.pos++);
					switch(c1) {
					case 32:case 13:case 10:case 9:
						break;
					case 125:
						if(field != null || comma == false) this.invalidChar();
						return obj;
					case 58:
						if(field == null) this.invalidChar();
						obj[field] = this.parseRec();
						field = null;
						comma = true;
						break;
					case 44:
						if(comma) comma = false; else this.invalidChar();
						break;
					case 34:
						if(comma) this.invalidChar();
						field = this.parseString();
						break;
					default:
						this.invalidChar();
					}
				}
				break;
			case 91:
				var arr = [], comma = null;
				while(true) {
					var c1 = this.str.charCodeAt(this.pos++);
					switch(c1) {
					case 32:case 13:case 10:case 9:
						break;
					case 93:
						if(comma == false) this.invalidChar();
						return arr;
					case 44:
						if(comma) comma = false; else this.invalidChar();
						break;
					default:
						if(comma) this.invalidChar();
						this.pos--;
						arr.push(this.parseRec());
						comma = true;
					}
				}
				break;
			case 116:
				var save = this.pos;
				if(this.str.charCodeAt(this.pos++) != 114 || this.str.charCodeAt(this.pos++) != 117 || this.str.charCodeAt(this.pos++) != 101) {
					this.pos = save;
					this.invalidChar();
				}
				return true;
			case 102:
				var save = this.pos;
				if(this.str.charCodeAt(this.pos++) != 97 || this.str.charCodeAt(this.pos++) != 108 || this.str.charCodeAt(this.pos++) != 115 || this.str.charCodeAt(this.pos++) != 101) {
					this.pos = save;
					this.invalidChar();
				}
				return false;
			case 110:
				var save = this.pos;
				if(this.str.charCodeAt(this.pos++) != 117 || this.str.charCodeAt(this.pos++) != 108 || this.str.charCodeAt(this.pos++) != 108) {
					this.pos = save;
					this.invalidChar();
				}
				return null;
			case 34:
				return this.parseString();
			case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:case 45:
				return this.parseNumber(c);
			default:
				this.invalidChar();
			}
		}
	}
	,invalidChar: function() {
		this.pos--;
		throw "Invalid char " + this.str.charCodeAt(this.pos) + " at position " + this.pos;
	}
	,doParse: function(str) {
		this.str = str;
		this.pos = 0;
		return this.parseRec();
	}
	,__class__: haxe.Json
}
haxe.ds = {}
haxe.ds.StringMap = function() {
	this.h = { };
};
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.prototype = {
	keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
	}
	,get: function(key) {
		return this.h["$" + key];
	}
	,set: function(key,value) {
		this.h["$" + key] = value;
	}
	,__class__: haxe.ds.StringMap
}
var js = {}
js.Boot = function() { }
js.Boot.__name__ = true;
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2, _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i;
			var str = "[";
			s += "\t";
			var _g = 0;
			while(_g < l) {
				var i1 = _g++;
				str += (i1 > 0?",":"") + js.Boot.__string_rec(o[i1],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) { ;
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
}
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0, _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
}
js.Boot.__instanceof = function(o,cl) {
	try {
		if(o instanceof cl) {
			if(cl == Array) return o.__enum__ == null;
			return true;
		}
		if(js.Boot.__interfLoop(o.__class__,cl)) return true;
	} catch( e ) {
		if(cl == null) return false;
	}
	switch(cl) {
	case Int:
		return Math.ceil(o%2147483648.0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return o === true || o === false;
	case String:
		return typeof(o) == "string";
	case Dynamic:
		return true;
	default:
		if(o == null) return false;
		if(cl == Class && o.__name__ != null) return true; else null;
		if(cl == Enum && o.__ename__ != null) return true; else null;
		return o.__enum__ == cl;
	}
}
String.prototype.__class__ = String;
String.__name__ = true;
Array.prototype.__class__ = Array;
Array.__name__ = true;
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
if(typeof(JSON) != "undefined") haxe.Json = JSON;
HGaudiApp.appVersion = "0.1";
HGaudiApp.buildFile = "build.json";
HGaudiApp.errorCode = -1;
HGaudiApp.cleanCode = 0;
HGaudiApp.main();
})();