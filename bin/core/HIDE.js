(function () { "use strict";
var $hxClasses = {},$estr = function() { return js.Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
$hxClasses["EReg"] = EReg;
EReg.__name__ = ["EReg"];
EReg.prototype = {
	r: null
	,match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,matched: function(n) {
		if(this.r.m != null && n >= 0 && n < this.r.m.length) return this.r.m[n]; else throw "EReg::matched";
	}
	,matchedPos: function() {
		if(this.r.m == null) throw "No string matched";
		return { pos : this.r.m.index, len : this.r.m[0].length};
	}
	,matchSub: function(s,pos,len) {
		if(len == null) len = -1;
		if(this.r.global) {
			this.r.lastIndex = pos;
			this.r.m = this.r.exec(len < 0?s:HxOverrides.substr(s,0,pos + len));
			var b = this.r.m != null;
			if(b) this.r.s = s;
			return b;
		} else {
			var b1 = this.match(len < 0?HxOverrides.substr(s,pos,null):HxOverrides.substr(s,pos,len));
			if(b1) {
				this.r.s = s;
				this.r.m.index += pos;
			}
			return b1;
		}
	}
	,replace: function(s,by) {
		return s.replace(this.r,by);
	}
	,map: function(s,f) {
		var offset = 0;
		var buf = new StringBuf();
		do {
			if(offset >= s.length) break; else if(!this.matchSub(s,offset)) {
				buf.add(HxOverrides.substr(s,offset,null));
				break;
			}
			var p = this.matchedPos();
			buf.add(HxOverrides.substr(s,offset,p.pos - offset));
			buf.add(f(this));
			if(p.len == 0) {
				buf.add(HxOverrides.substr(s,p.pos,1));
				offset = p.pos + 1;
			} else offset = p.pos + p.len;
		} while(this.r.global);
		if(!this.r.global && offset > 0 && offset < s.length) buf.add(HxOverrides.substr(s,offset,null));
		return buf.b;
	}
	,__class__: EReg
};
var HIDE = function() { };
$hxClasses["HIDE"] = HIDE;
HIDE.__name__ = ["HIDE"];
HIDE.loadJS = function(name,urls,onLoad) {
	if(name != null) {
		var _g1 = 0;
		var _g = urls.length;
		while(_g1 < _g) {
			var i = _g1++;
			urls[i] = js.Node.require("path").join(HIDE.getPluginPath(name),urls[i]);
		}
	}
	HIDE.loadJSAsync(name,urls,onLoad);
};
HIDE.traceScriptLoadingInfo = function(name,url) {
	var str;
	if(name != null) str = "\n" + name + ":\n" + url + "\n"; else str = url + " loaded";
};
HIDE.getPluginPath = function(name) {
	var pathToPlugin = pluginloader.PluginManager.pathToPlugins.get(name);
	if(pathToPlugin == null) console.log("HIDE can't find path for plugin: " + name + "\nPlease check folder structure of plugin, make sure that it corresponds to it's 'name'");
	return pathToPlugin;
};
HIDE.openPageInNewWindow = function(name,url,params) {
	var fullPath = url;
	if(!StringTools.startsWith(url,"http") && name != null) fullPath = js.Node.require("path").join(HIDE.getPluginPath(name),url);
	var $window = nodejs.webkit.Window.open(fullPath,params);
	HIDE.windows.push($window);
	$window.on("close",function(e) {
		HxOverrides.remove(HIDE.windows,$window);
		$window.close(true);
	});
	return $window;
};
HIDE.compilePlugins = function(onComplete,onFailed) {
	pluginloader.PluginManager.compilePlugins(onComplete,onFailed);
};
HIDE.surroundWithQuotes = function(path) {
	return "\"" + path + "\"";
};
HIDE.loadJSAsync = function(name,urls,onLoad) {
	var script;
	var _this = window.document;
	script = _this.createElement("script");
	script.src = urls.splice(0,1)[0];
	script.onload = function(e) {
		HIDE.traceScriptLoadingInfo(name,script.src);
		if(urls.length > 0) HIDE.loadJSAsync(name,urls,onLoad); else if(onLoad != null) onLoad();
	};
	window.document.body.appendChild(script);
};
var HxOverrides = function() { };
$hxClasses["HxOverrides"] = HxOverrides;
HxOverrides.__name__ = ["HxOverrides"];
HxOverrides.dateStr = function(date) {
	var m = date.getMonth() + 1;
	var d = date.getDate();
	var h = date.getHours();
	var mi = date.getMinutes();
	var s = date.getSeconds();
	return date.getFullYear() + "-" + (m < 10?"0" + m:"" + m) + "-" + (d < 10?"0" + d:"" + d) + " " + (h < 10?"0" + h:"" + h) + ":" + (mi < 10?"0" + mi:"" + mi) + ":" + (s < 10?"0" + s:"" + s);
};
HxOverrides.strDate = function(s) {
	var _g = s.length;
	switch(_g) {
	case 8:
		var k = s.split(":");
		var d = new Date();
		d.setTime(0);
		d.setUTCHours(k[0]);
		d.setUTCMinutes(k[1]);
		d.setUTCSeconds(k[2]);
		return d;
	case 10:
		var k1 = s.split("-");
		return new Date(k1[0],k1[1] - 1,k1[2],0,0,0);
	case 19:
		var k2 = s.split(" ");
		var y = k2[0].split("-");
		var t = k2[1].split(":");
		return new Date(y[0],y[1] - 1,y[2],t[0],t[1],t[2]);
	default:
		throw "Invalid date format : " + s;
	}
};
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
HxOverrides.remove = function(a,obj) {
	var i = HxOverrides.indexOf(a,obj,0);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var Lambda = function() { };
$hxClasses["Lambda"] = Lambda;
Lambda.__name__ = ["Lambda"];
Lambda.has = function(it,elt) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(x == elt) return true;
	}
	return false;
};
Lambda.count = function(it,pred) {
	var n = 0;
	if(pred == null) {
		var $it0 = $iterator(it)();
		while( $it0.hasNext() ) {
			var _ = $it0.next();
			n++;
		}
	} else {
		var $it1 = $iterator(it)();
		while( $it1.hasNext() ) {
			var x = $it1.next();
			if(pred(x)) n++;
		}
	}
	return n;
};
Lambda.indexOf = function(it,v) {
	var i = 0;
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var v2 = $it0.next();
		if(v == v2) return i;
		i++;
	}
	return -1;
};
var List = function() {
	this.length = 0;
};
$hxClasses["List"] = List;
List.__name__ = ["List"];
List.prototype = {
	h: null
	,q: null
	,length: null
	,add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,push: function(item) {
		var x = [item,this.h];
		this.h = x;
		if(this.q == null) this.q = x;
		this.length++;
	}
	,remove: function(v) {
		var prev = null;
		var l = this.h;
		while(l != null) {
			if(l[0] == v) {
				if(prev == null) this.h = l[1]; else prev[1] = l[1];
				if(this.q == l) this.q = prev;
				this.length--;
				return true;
			}
			prev = l;
			l = l[1];
		}
		return false;
	}
	,iterator: function() {
		return { h : this.h, hasNext : function() {
			return this.h != null;
		}, next : function() {
			if(this.h == null) return null;
			var x = this.h[0];
			this.h = this.h[1];
			return x;
		}};
	}
	,__class__: List
};
var Main = function() { };
$hxClasses["Main"] = Main;
Main.__name__ = ["Main"];
Main.main = function() {
	Main.window = nodejs.webkit.Window.get();
	Main.window.showDevTools();
	js.Node.process.on("uncaughtException",function(err) {
		console.log(err);
		Main.window.show();
	});
	Main.sync = true;
	core.Hotkeys.prepare();
	core.PreserveWindowState.init();
	window.addEventListener("load",function(e) {
		core.Splitter.load();
		watchers.SettingsWatcher.load();
		watchers.SnippetsWatcher.load();
		core.Utils.prepare();
		menu.BootstrapMenu.createMenuBar();
		newprojectdialog.NewProjectDialog.load();
		cm.Zoom.load();
		filetree.FileTree.init();
		projectaccess.ProjectOptions.create();
		dialogs.DialogManager.load();
		core.FileDialog.create();
		tabmanager.TabManager.load();
		core.HaxeLint.load();
		cm.Editor.load();
		core.MenuCommands.add();
		core.Completion.registerHelper();
		autoformat.HaxePrinterLoader.load();
		projectaccess.ProjectAccess.registerSaveOnCloseListener();
		haxeproject.HaxeProject.load();
		openflproject.OpenFLProject.load();
		kha.KhaProject.load();
		core.CompilationOutput.load();
		core.RecentProjectsList.load();
		openproject.OpenProject.searchForLastProject();
		core.DragAndDrop.prepare();
		parser.ClasspathWalker.load();
		core.WelcomeScreen.load();
		core.QuickOpen.load();
		Main.sync = false;
		Main.currentTime = new Date().getTime();
		core.ProcessHelper.checkProcessInstalled("haxe",["-v"],function(installed) {
			if(installed) {
				core.HaxeServer.check();
				pluginloader.PluginManager.loadPlugins();
			} else {
				Alertify.error("Haxe compiler is not found");
				pluginloader.PluginManager.loadPlugins(false);
			}
		});
		core.ProcessHelper.checkProcessInstalled("npm",["-v"],function(installed1) {
			console.log("npm installed " + (installed1 == null?"null":"" + installed1));
			if(installed1) core.ProcessHelper.runProcess("npm",["list","-g","flambe"],null,function(stdout,stderr) {
				console.log("flambe installed " + Std.string(stdout.indexOf("(empty)") == -1));
			},function(code,stdout1,stderr1) {
				console.log("flambe installed " + Std.string(stdout1.indexOf("(empty)") == -1));
			});
		});
		core.ProcessHelper.checkProcessInstalled("haxelib run lime",[],function(installed2) {
			console.log("lime installed " + (installed2 == null?"null":"" + installed2));
		});
		core.ProcessHelper.checkProcessInstalled("git",["--version"],function(installed3) {
			console.log("git installed " + (installed3 == null?"null":"" + installed3));
		});
		Main.window.show();
	});
	Main.window.on("close",function(e1) {
		nodejs.webkit.App.closeAllWindows();
	});
};
var IMap = function() { };
$hxClasses["IMap"] = IMap;
IMap.__name__ = ["IMap"];
IMap.prototype = {
	get: null
	,keys: null
	,__class__: IMap
};
Math.__name__ = ["Math"];
var Reflect = function() { };
$hxClasses["Reflect"] = Reflect;
Reflect.__name__ = ["Reflect"];
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		return null;
	}
};
Reflect.setField = function(o,field,value) {
	o[field] = value;
};
Reflect.getProperty = function(o,field) {
	var tmp;
	if(o == null) return null; else if(o.__properties__ && (tmp = o.__properties__["get_" + field])) return o[tmp](); else return o[field];
};
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
};
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && !(f.__name__ || f.__ename__);
};
Reflect.compare = function(a,b) {
	if(a == b) return 0; else if(a > b) return 1; else return -1;
};
Reflect.isObject = function(v) {
	if(v == null) return false;
	var t = typeof(v);
	return t == "string" || t == "object" && v.__enum__ == null || t == "function" && (v.__name__ || v.__ename__) != null;
};
Reflect.deleteField = function(o,field) {
	if(!Object.prototype.hasOwnProperty.call(o,field)) return false;
	delete(o[field]);
	return true;
};
var Std = function() { };
$hxClasses["Std"] = Std;
Std.__name__ = ["Std"];
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
Std.parseFloat = function(x) {
	return parseFloat(x);
};
var StringBuf = function() {
	this.b = "";
};
$hxClasses["StringBuf"] = StringBuf;
StringBuf.__name__ = ["StringBuf"];
StringBuf.prototype = {
	b: null
	,add: function(x) {
		this.b += Std.string(x);
	}
	,addSub: function(s,pos,len) {
		if(len == null) this.b += HxOverrides.substr(s,pos,null); else this.b += HxOverrides.substr(s,pos,len);
	}
	,__class__: StringBuf
};
var StringTools = function() { };
$hxClasses["StringTools"] = StringTools;
StringTools.__name__ = ["StringTools"];
StringTools.htmlEscape = function(s,quotes) {
	s = s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
	if(quotes) return s.split("\"").join("&quot;").split("'").join("&#039;"); else return s;
};
StringTools.startsWith = function(s,start) {
	return s.length >= start.length && HxOverrides.substr(s,0,start.length) == start;
};
StringTools.endsWith = function(s,end) {
	var elen = end.length;
	var slen = s.length;
	return slen >= elen && HxOverrides.substr(s,slen - elen,elen) == end;
};
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	return c > 8 && c < 14 || c == 32;
};
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return HxOverrides.substr(s,r,l - r); else return s;
};
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return HxOverrides.substr(s,0,l - r); else return s;
};
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
};
StringTools.lpad = function(s,c,l) {
	if(c.length <= 0) return s;
	while(s.length < l) s = c + s;
	return s;
};
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
StringTools.fastCodeAt = function(s,index) {
	return s.charCodeAt(index);
};
var ValueType = $hxClasses["ValueType"] = { __ename__ : ["ValueType"], __constructs__ : ["TNull","TInt","TFloat","TBool","TObject","TFunction","TClass","TEnum","TUnknown"] };
ValueType.TNull = ["TNull",0];
ValueType.TNull.toString = $estr;
ValueType.TNull.__enum__ = ValueType;
ValueType.TInt = ["TInt",1];
ValueType.TInt.toString = $estr;
ValueType.TInt.__enum__ = ValueType;
ValueType.TFloat = ["TFloat",2];
ValueType.TFloat.toString = $estr;
ValueType.TFloat.__enum__ = ValueType;
ValueType.TBool = ["TBool",3];
ValueType.TBool.toString = $estr;
ValueType.TBool.__enum__ = ValueType;
ValueType.TObject = ["TObject",4];
ValueType.TObject.toString = $estr;
ValueType.TObject.__enum__ = ValueType;
ValueType.TFunction = ["TFunction",5];
ValueType.TFunction.toString = $estr;
ValueType.TFunction.__enum__ = ValueType;
ValueType.TClass = function(c) { var $x = ["TClass",6,c]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; };
ValueType.TEnum = function(e) { var $x = ["TEnum",7,e]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; };
ValueType.TUnknown = ["TUnknown",8];
ValueType.TUnknown.toString = $estr;
ValueType.TUnknown.__enum__ = ValueType;
var Type = function() { };
$hxClasses["Type"] = Type;
Type.__name__ = ["Type"];
Type.getClass = function(o) {
	if(o == null) return null;
	if((o instanceof Array) && o.__enum__ == null) return Array; else return o.__class__;
};
Type.getClassName = function(c) {
	var a = c.__name__;
	return a.join(".");
};
Type.getEnumName = function(e) {
	var a = e.__ename__;
	return a.join(".");
};
Type.resolveClass = function(name) {
	var cl = $hxClasses[name];
	if(cl == null || !cl.__name__) return null;
	return cl;
};
Type.resolveEnum = function(name) {
	var e = $hxClasses[name];
	if(e == null || !e.__ename__) return null;
	return e;
};
Type.createInstance = function(cl,args) {
	var _g = args.length;
	switch(_g) {
	case 0:
		return new cl();
	case 1:
		return new cl(args[0]);
	case 2:
		return new cl(args[0],args[1]);
	case 3:
		return new cl(args[0],args[1],args[2]);
	case 4:
		return new cl(args[0],args[1],args[2],args[3]);
	case 5:
		return new cl(args[0],args[1],args[2],args[3],args[4]);
	case 6:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5]);
	case 7:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
	case 8:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7]);
	default:
		throw "Too many arguments";
	}
	return null;
};
Type.createEmptyInstance = function(cl) {
	function empty() {}; empty.prototype = cl.prototype;
	return new empty();
};
Type.createEnum = function(e,constr,params) {
	var f = Reflect.field(e,constr);
	if(f == null) throw "No such constructor " + constr;
	if(Reflect.isFunction(f)) {
		if(params == null) throw "Constructor " + constr + " need parameters";
		return f.apply(e,params);
	}
	if(params != null && params.length != 0) throw "Constructor " + constr + " does not need parameters";
	return f;
};
Type.getInstanceFields = function(c) {
	var a = [];
	for(var i in c.prototype) a.push(i);
	HxOverrides.remove(a,"__class__");
	HxOverrides.remove(a,"__properties__");
	return a;
};
Type.getEnumConstructs = function(e) {
	var a = e.__constructs__;
	return a.slice();
};
Type["typeof"] = function(v) {
	var _g = typeof(v);
	switch(_g) {
	case "boolean":
		return ValueType.TBool;
	case "string":
		return ValueType.TClass(String);
	case "number":
		if(Math.ceil(v) == v % 2147483648.0) return ValueType.TInt;
		return ValueType.TFloat;
	case "object":
		if(v == null) return ValueType.TNull;
		var e = v.__enum__;
		if(e != null) return ValueType.TEnum(e);
		var c;
		if((v instanceof Array) && v.__enum__ == null) c = Array; else c = v.__class__;
		if(c != null) return ValueType.TClass(c);
		return ValueType.TObject;
	case "function":
		if(v.__name__ || v.__ename__) return ValueType.TObject;
		return ValueType.TFunction;
	case "undefined":
		return ValueType.TNull;
	default:
		return ValueType.TUnknown;
	}
};
Type.enumIndex = function(e) {
	return e[1];
};
var XmlType = $hxClasses["XmlType"] = { __ename__ : ["XmlType"], __constructs__ : [] };
var Xml = function() {
};
$hxClasses["Xml"] = Xml;
Xml.__name__ = ["Xml"];
Xml.parse = function(str) {
	return haxe.xml.Parser.parse(str);
};
Xml.createElement = function(name) {
	var r = new Xml();
	r.nodeType = Xml.Element;
	r._children = new Array();
	r._attributes = new haxe.ds.StringMap();
	r.set_nodeName(name);
	return r;
};
Xml.createPCData = function(data) {
	var r = new Xml();
	r.nodeType = Xml.PCData;
	r.set_nodeValue(data);
	return r;
};
Xml.createCData = function(data) {
	var r = new Xml();
	r.nodeType = Xml.CData;
	r.set_nodeValue(data);
	return r;
};
Xml.createComment = function(data) {
	var r = new Xml();
	r.nodeType = Xml.Comment;
	r.set_nodeValue(data);
	return r;
};
Xml.createDocType = function(data) {
	var r = new Xml();
	r.nodeType = Xml.DocType;
	r.set_nodeValue(data);
	return r;
};
Xml.createProcessingInstruction = function(data) {
	var r = new Xml();
	r.nodeType = Xml.ProcessingInstruction;
	r.set_nodeValue(data);
	return r;
};
Xml.createDocument = function() {
	var r = new Xml();
	r.nodeType = Xml.Document;
	r._children = new Array();
	return r;
};
Xml.prototype = {
	nodeType: null
	,_nodeName: null
	,_nodeValue: null
	,_attributes: null
	,_children: null
	,_parent: null
	,get_nodeName: function() {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._nodeName;
	}
	,set_nodeName: function(n) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._nodeName = n;
	}
	,get_nodeValue: function() {
		if(this.nodeType == Xml.Element || this.nodeType == Xml.Document) throw "bad nodeType";
		return this._nodeValue;
	}
	,set_nodeValue: function(v) {
		if(this.nodeType == Xml.Element || this.nodeType == Xml.Document) throw "bad nodeType";
		return this._nodeValue = v;
	}
	,get: function(att) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._attributes.get(att);
	}
	,set: function(att,value) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		this._attributes.set(att,value);
	}
	,exists: function(att) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._attributes.exists(att);
	}
	,iterator: function() {
		if(this._children == null) throw "bad nodetype";
		return { cur : 0, x : this._children, hasNext : function() {
			return this.cur < this.x.length;
		}, next : function() {
			return this.x[this.cur++];
		}};
	}
	,elementsNamed: function(name) {
		if(this._children == null) throw "bad nodetype";
		return { cur : 0, x : this._children, hasNext : function() {
			var k = this.cur;
			var l = this.x.length;
			while(k < l) {
				var n = this.x[k];
				if(n.nodeType == Xml.Element && n._nodeName == name) break;
				k++;
			}
			this.cur = k;
			return k < l;
		}, next : function() {
			var k1 = this.cur;
			var l1 = this.x.length;
			while(k1 < l1) {
				var n1 = this.x[k1];
				k1++;
				if(n1.nodeType == Xml.Element && n1._nodeName == name) {
					this.cur = k1;
					return n1;
				}
			}
			return null;
		}};
	}
	,addChild: function(x) {
		if(this._children == null) throw "bad nodetype";
		if(x._parent != null) HxOverrides.remove(x._parent._children,x);
		x._parent = this;
		this._children.push(x);
	}
	,toString: function() {
		if(this.nodeType == Xml.PCData) return StringTools.htmlEscape(this._nodeValue);
		if(this.nodeType == Xml.CData) return "<![CDATA[" + this._nodeValue + "]]>";
		if(this.nodeType == Xml.Comment) return "<!--" + this._nodeValue + "-->";
		if(this.nodeType == Xml.DocType) return "<!DOCTYPE " + this._nodeValue + ">";
		if(this.nodeType == Xml.ProcessingInstruction) return "<?" + this._nodeValue + "?>";
		var s = new StringBuf();
		if(this.nodeType == Xml.Element) {
			s.b += "<";
			s.b += Std.string(this._nodeName);
			var $it0 = this._attributes.keys();
			while( $it0.hasNext() ) {
				var k = $it0.next();
				s.b += " ";
				if(k == null) s.b += "null"; else s.b += "" + k;
				s.b += "=\"";
				s.add(this._attributes.get(k));
				s.b += "\"";
			}
			if(this._children.length == 0) {
				s.b += "/>";
				return s.b;
			}
			s.b += ">";
		}
		var $it1 = this.iterator();
		while( $it1.hasNext() ) {
			var x = $it1.next();
			s.add(x.toString());
		}
		if(this.nodeType == Xml.Element) {
			s.b += "</";
			s.b += Std.string(this._nodeName);
			s.b += ">";
		}
		return s.b;
	}
	,__class__: Xml
	,__properties__: {set_nodeValue:"set_nodeValue",get_nodeValue:"get_nodeValue",set_nodeName:"set_nodeName",get_nodeName:"get_nodeName"}
};
var autoformat = {};
autoformat.HaxePrinter = function() { };
$hxClasses["autoformat.HaxePrinter"] = autoformat.HaxePrinter;
autoformat.HaxePrinter.__name__ = ["autoformat","HaxePrinter"];
autoformat.HaxePrinter.formatSource = function(source) {
	var input = byte.js._ByteData.ByteData_Impl_.ofString(source);
	var parser = new haxeparser.HaxeParser(input,"");
	var ast;
	try {
		ast = parser.parse();
	} catch( $e0 ) {
		if( js.Boot.__instanceof($e0,hxparse.NoMatch) ) {
			var e = $e0;
			throw e.pos.format(input) + ": Unexpected " + Std.string(e.token.tok);
		} else if( js.Boot.__instanceof($e0,hxparse.Unexpected) ) {
			var e1 = $e0;
			throw e1.pos.format(input) + ": Unexpected " + Std.string(e1.token.tok);
		} else throw($e0);
	}
	var printer = new haxeprinter.Printer();
	var options = { };
	options.encoding = "utf8";
	printer.config = tjson.TJSON.parse(js.Node.require("fs").readFileSync(js.Node.require("path").join("core","config","autoformat.json"),options));
	return printer.printAST(ast);
};
autoformat.HaxePrinterLoader = function() { };
$hxClasses["autoformat.HaxePrinterLoader"] = autoformat.HaxePrinterLoader;
autoformat.HaxePrinterLoader.__name__ = ["autoformat","HaxePrinterLoader"];
autoformat.HaxePrinterLoader.load = function() {
	menu.BootstrapMenu.getMenu("Source",5).addMenuItem("Autoformat",1,function() {
		if(js.Node.require("path").extname(tabmanager.TabManager.getCurrentDocumentPath()) == ".hx") {
			var data = cm.Editor.editor.getValue();
			if(data != "") {
				data = autoformat.HaxePrinter.formatSource(data);
				cm.Editor.editor.setValue(data);
			}
		}
	},"Ctrl-Shift-F");
	menu.BootstrapMenu.getMenu("Options").addMenuItem("Open autoformat configuration file",1,(function(f,a1) {
		return function() {
			return f(a1);
		};
	})(tabmanager.TabManager.openFileInNewTab,js.Node.require("path").join("core","config","autoformat.json")));
};
var bootstrap = {};
bootstrap.ButtonManager = function() { };
$hxClasses["bootstrap.ButtonManager"] = bootstrap.ButtonManager;
bootstrap.ButtonManager.__name__ = ["bootstrap","ButtonManager"];
bootstrap.ButtonManager.createButton = function(text,disabled,hide,primary) {
	if(primary == null) primary = false;
	if(hide == null) hide = false;
	if(disabled == null) disabled = false;
	var button;
	var _this = window.document;
	button = _this.createElement("button");
	button.type = "button";
	if(primary) button.className = "btn btn-primary"; else button.className = "btn btn-default";
	button.setAttribute("localeString",text);
	button.textContent = watchers.LocaleWatcher.getStringSync(text);
	if(disabled) button.classList.add("disabled");
	if(hide) button.setAttribute("data-dismiss","modal");
	return button;
};
bootstrap.InputGroup = function() {
	var _this = window.document;
	this.inputGroup = _this.createElement("div");
	this.inputGroup.className = "input-group";
	var _this1 = window.document;
	this.input = _this1.createElement("input");
	this.input.type = "text";
	this.input.className = "form-control";
	this.inputGroup.appendChild(this.input);
};
$hxClasses["bootstrap.InputGroup"] = bootstrap.InputGroup;
bootstrap.InputGroup.__name__ = ["bootstrap","InputGroup"];
bootstrap.InputGroup.prototype = {
	inputGroup: null
	,input: null
	,getInput: function() {
		return this.input;
	}
	,getElement: function() {
		return this.inputGroup;
	}
	,__class__: bootstrap.InputGroup
};
bootstrap.InputGroupButton = function(text) {
	bootstrap.InputGroup.call(this);
	var _this = window.document;
	this.span = _this.createElement("span");
	this.span.className = "input-group-btn";
	this.button = bootstrap.ButtonManager.createButton(text);
	this.span.appendChild(this.button);
	this.inputGroup.appendChild(this.span);
};
$hxClasses["bootstrap.InputGroupButton"] = bootstrap.InputGroupButton;
bootstrap.InputGroupButton.__name__ = ["bootstrap","InputGroupButton"];
bootstrap.InputGroupButton.__super__ = bootstrap.InputGroup;
bootstrap.InputGroupButton.prototype = $extend(bootstrap.InputGroup.prototype,{
	span: null
	,button: null
	,getSpan: function() {
		return this.span;
	}
	,getButton: function() {
		return this.button;
	}
	,__class__: bootstrap.InputGroupButton
});
bootstrap.ListGroup = function() {
	this.items = [];
	var _this = window.document;
	this.listGroup = _this.createElement("div");
	this.listGroup.className = "list-group";
};
$hxClasses["bootstrap.ListGroup"] = bootstrap.ListGroup;
bootstrap.ListGroup.__name__ = ["bootstrap","ListGroup"];
bootstrap.ListGroup.prototype = {
	listGroup: null
	,items: null
	,addItem: function(text,description,onClick) {
		var a;
		var _this = window.document;
		a = _this.createElement("a");
		a.href = "#";
		a.className = "list-group-item";
		if(onClick != null) a.onclick = onClick;
		var h4;
		h4 = js.Boot.__cast(window.document.createElement("h4") , HTMLHeadingElement);
		h4.className = "list-group-item-heading";
		h4.textContent = text;
		a.appendChild(h4);
		var p;
		var _this1 = window.document;
		p = _this1.createElement("p");
		p.className = "list-group-item-text";
		p.textContent = description;
		a.appendChild(p);
		this.items.push(a);
		this.listGroup.appendChild(a);
	}
	,clear: function() {
		var len = this.listGroup.childNodes.length;
		while(len-- > 0) this.listGroup.removeChild(this.listGroup.lastChild);
		this.items = [];
	}
	,getItems: function() {
		return this.items;
	}
	,getElement: function() {
		return this.listGroup;
	}
	,__class__: bootstrap.ListGroup
};
bootstrap.RadioElement = function(_name,_value,_text,_onChange) {
	var _this = window.document;
	this.element = _this.createElement("div");
	this.element.className = "radio";
	var label;
	var _this1 = window.document;
	label = _this1.createElement("label");
	this.element.appendChild(label);
	var _this2 = window.document;
	this.input = _this2.createElement("input");
	this.input.type = "radio";
	this.input.name = _name;
	this.input.value = _value;
	this.input.onchange = function(e) {
		if(_onChange != null) _onChange();
	};
	label.appendChild(this.input);
	label.appendChild(window.document.createTextNode(_text));
	this.element.appendChild(label);
};
$hxClasses["bootstrap.RadioElement"] = bootstrap.RadioElement;
bootstrap.RadioElement.__name__ = ["bootstrap","RadioElement"];
bootstrap.RadioElement.prototype = {
	element: null
	,input: null
	,getInput: function() {
		return this.input;
	}
	,getElement: function() {
		return this.element;
	}
	,__class__: bootstrap.RadioElement
};
var build = {};
build.CommandPreprocessor = function() { };
$hxClasses["build.CommandPreprocessor"] = build.CommandPreprocessor;
build.CommandPreprocessor.__name__ = ["build","CommandPreprocessor"];
build.CommandPreprocessor.preprocess = function(command,path) {
	var processedCommand = command;
	processedCommand = StringTools.replace(processedCommand,"%path%",path);
	var ereg = new EReg("%join%[(](.+)[)]","");
	if(ereg.match(processedCommand)) {
		var matchedString = ereg.matched(1);
		var args = matchedString.split(",");
		processedCommand = StringTools.replace(processedCommand,ereg.matched(0),js.Node.require("path").join(args[0],args[1]));
	}
	return processedCommand;
};
build.Hxml = function() { };
$hxClasses["build.Hxml"] = build.Hxml;
build.Hxml.__name__ = ["build","Hxml"];
build.Hxml.checkHxml = function(dirname,filename,hxmlData,onComplete) {
	var useCompilationServer = true;
	var startCommandLine = false;
	if(hxmlData != null) {
		if(hxmlData.indexOf("-cmd") != -1) startCommandLine = true;
		if(hxmlData.indexOf("-cpp") != -1) useCompilationServer = false;
	}
	build.Hxml.buildHxml(dirname,filename,useCompilationServer,startCommandLine,onComplete);
};
build.Hxml.buildHxml = function(dirname,filename,useCompilationServer,startCommandLine,onComplete) {
	if(startCommandLine == null) startCommandLine = false;
	if(useCompilationServer == null) useCompilationServer = true;
	var params = [];
	if(startCommandLine) {
		var _g = core.Utils.os;
		switch(_g) {
		case 0:
			params.push("start");
			break;
		default:
			params.push("bash");
		}
	}
	params = params.concat(["haxe","--cwd",dirname]);
	if(useCompilationServer) params = params.concat(["--connect","5000"]);
	params.push(filename);
	var process = params.shift();
	core.ProcessHelper.runProcessAndPrintOutputToConsole(process,params,onComplete);
};
var byte = {};
byte.js = {};
byte.js._ByteData = {};
byte.js._ByteData.ByteData_Impl_ = function() { };
$hxClasses["byte.js._ByteData.ByteData_Impl_"] = byte.js._ByteData.ByteData_Impl_;
byte.js._ByteData.ByteData_Impl_.__name__ = ["byte","js","_ByteData","ByteData_Impl_"];
byte.js._ByteData.ByteData_Impl_.__properties__ = {get_length:"get_length"}
byte.js._ByteData.ByteData_Impl_.get_length = function(this1) {
	return this1.length;
};
byte.js._ByteData.ByteData_Impl_.readString = function(this1,pos,len) {
	var buf = new StringBuf();
	var _g1 = pos;
	var _g = pos + len;
	while(_g1 < _g) {
		var i = _g1++;
		buf.b += String.fromCharCode(this1[i]);
	}
	return buf.b;
};
byte.js._ByteData.ByteData_Impl_.ofString = function(s) {
	var a = new Uint8Array(s.length);
	var _g1 = 0;
	var _g = s.length;
	while(_g1 < _g) {
		var i = _g1++;
		a[i] = s.charCodeAt(i);
	}
	return a;
};
var cm = {};
cm.ColorPreview = function() { };
$hxClasses["cm.ColorPreview"] = cm.ColorPreview;
cm.ColorPreview.__name__ = ["cm","ColorPreview"];
cm.ColorPreview.create = function(cm1) {
	cm.ColorPreview.preview = js.Boot.__cast(window.document.getElementsByClassName("colorPreview")[0] , HTMLDivElement);
	cm.ColorPreview.startScroll = cm1.getScrollInfo();
	new $(".colorPreview").spectrum({ showButtons : false, show : function() {
		cm.ColorPreview.isColorPickerShown = true;
		cm.ColorPreview.applyChanges = true;
		new $(".colorPreview").spectrum("set",cm.ColorPreview.preview.style.backgroundColor);
	}, hide : function() {
		cm.ColorPreview.isColorPickerShown = false;
	}, change : function(color) {
		if(cm.ColorPreview.applyChanges) {
			var colorString = color.toHex();
			cm1.replaceRange(cm.ColorPreview.startingFormat + colorString,cm.ColorPreview.wordStart,cm.ColorPreview.wordEnd);
		} else cm.ColorPreview.preview.style.backgroundColor = cm.ColorPreview.startingColor;
	}, move : function(color1) {
		var colorString1 = color1.toHex();
		cm.ColorPreview.preview.style.backgroundColor = "#" + colorString1;
	}});
	window.onkeyup = function(e) {
		cm.ColorPreview.applyChanges = false;
		if(e.keyCode == 27 && cm.ColorPreview.preview.style.display != "none") new $(".colorPreview").spectrum("hide");
	};
	new $(window.document).click(function(e1) {
		if(!js.Boot.__instanceof(window.document.activeElement,HTMLTextAreaElement)) {
			cm.ColorPreview.applyChanges = false;
			new $(cm.ColorPreview.preview).fadeOut(250);
			new $(".colorPreview").spectrum("hide");
		}
	});
};
cm.ColorPreview.update = function(cm1) {
	var wordData = core.Completion.getCurrentWord(cm1,{ word : new EReg("[A-Fx0-9#]+$","i")},cm1.getCursor());
	var word = wordData.word;
	var color = null;
	if(word != null && word.length > 2) {
		if(!cm.ColorPreview.isColorPickerShown) {
			cm.ColorPreview.wordStart = wordData.from;
			cm.ColorPreview.wordEnd = wordData.to;
			if(StringTools.startsWith(word,"0x")) {
				color = HxOverrides.substr(word,2,null);
				cm.ColorPreview.startingFormat = "0x";
			} else if(StringTools.startsWith(word,"#")) {
				color = HxOverrides.substr(word,1,null);
				cm.ColorPreview.startingFormat = "#";
			}
			if(color != null) {
				cm.ColorPreview.startScroll = cm1.getScrollInfo();
				var pos = cm1.cursorCoords(null);
				cm.ColorPreview.top = pos.bottom;
				cm.ColorPreview.left = pos.left;
				cm.ColorPreview.startingColor = "#" + color;
				cm.ColorPreview.preview.style.backgroundColor = cm.ColorPreview.startingColor;
				new $(cm.ColorPreview.preview).animate({ left : (pos.left == null?"null":"" + pos.left) + "px", top : (pos.bottom == null?"null":"" + pos.bottom) + "px"});
				if(cm.ColorPreview.preview.style.display == "none") new $(cm.ColorPreview.preview).fadeIn(250);
			} else new $(cm.ColorPreview.preview).fadeOut(250);
		}
	} else {
		new $(cm.ColorPreview.preview).fadeOut(250);
		new $(".colorPreview").spectrum("hide");
	}
};
cm.ColorPreview.scroll = function(cm1) {
	if(cm.ColorPreview.preview.style.display != "none") {
		var curScroll = cm1.getScrollInfo();
		var editor = cm1.getWrapperElement().getBoundingClientRect();
		var newTop = cm.ColorPreview.top + cm.ColorPreview.startScroll.top - curScroll.top;
		var point = newTop - new $().scrollTop();
		if(point <= editor.top || point >= editor.bottom) {
			new $(cm.ColorPreview.preview).fadeOut(250);
			return;
		}
		cm.ColorPreview.preview.style.top = newTop + "px";
		cm.ColorPreview.preview.style.left = cm.ColorPreview.left + cm.ColorPreview.startScroll.left - curScroll.left + "px";
	}
};
cm.ERegPreview = function() { };
$hxClasses["cm.ERegPreview"] = cm.ERegPreview;
cm.ERegPreview.__name__ = ["cm","ERegPreview"];
cm.ERegPreview.update = function(cm1) {
	var lineData = cm1.getLine(cm1.getCursor().line);
	var ereg = new EReg("~/(.)+/[gimsu]+","");
	var foundEreg = null;
	var foundEregOptions = null;
	if(ereg.match(lineData)) {
		var str = ereg.matched(0);
		str = StringTools.trim(HxOverrides.substr(str,2,str.length - 2));
		var index = str.lastIndexOf("/");
		foundEreg = HxOverrides.substr(str,0,index);
		foundEregOptions = HxOverrides.substr(str,index + 1,null);
	}
	var _g = 0;
	var _g1 = cm.ERegPreview.markers;
	while(_g < _g1.length) {
		var marker = _g1[_g];
		++_g;
		marker.clear();
	}
	cm.ERegPreview.markers = [];
	if(foundEreg != null) try {
		var ereg1 = new EReg(foundEreg,foundEregOptions);
		ereg1.map(cm1.getValue(),function(matchedEreg) {
			var pos = cm1.posFromIndex(matchedEreg.matchedPos().pos);
			var pos2 = cm1.posFromIndex(matchedEreg.matchedPos().pos + matchedEreg.matchedPos().len);
			cm.ERegPreview.markers.push(cm1.markText(pos,pos2,{ className : "showRegex"}));
			return "";
		});
	} catch( unknown ) {
		console.log(unknown);
	}
};
cm.Editor = function() { };
$hxClasses["cm.Editor"] = cm.Editor;
cm.Editor.__name__ = ["cm","Editor"];
cm.Editor.load = function() {
	cm.Editor.regenerateCompletionOnDot = true;
	var readFileOptions = { };
	readFileOptions.encoding = "utf8";
	var options = { };
	try {
		options = tjson.TJSON.parse(js.Node.require("fs").readFileSync(js.Node.require("path").join("core","config","editor.json"),readFileOptions));
	} catch( err ) {
		if( js.Boot.__instanceof(err,Error) ) {
			console.log(err);
		} else throw(err);
	}
	cm.Editor.walk(options);
	options.extraKeys = { '.' : (function($this) {
		var $r;
		var passAndHint = function(cm1) {
			if(tabmanager.TabManager.getCurrentDocument().getMode().name == "haxe") {
				var completionActive = cm.Editor.editor.state.completionActive;
				var completionType = core.Completion.getCompletionType();
				if((completionType == core.CompletionType.REGULAR || completionType == core.CompletionType.CLASSLIST) && completionActive != null && completionActive.widget != null) completionActive.widget.pick();
			}
			return CodeMirror.Pass;
		};
		$r = passAndHint;
		return $r;
	}(this)), ';' : (function($this) {
		var $r;
		var passAndHint1 = function(cm1) {
			var cursor = cm.Editor.editor.getCursor();
			var ch = cm.Editor.editor.getRange(cursor,{ line : cursor.line, ch : cursor.ch + 1});
			if(ch == ";") cm1.execCommand("goCharRight"); else {
				return CodeMirror.Pass;
			}
		};
		$r = passAndHint1;
		return $r;
	}(this)), '=' : (function($this) {
		var $r;
		var passAndHint2 = function(cm2) {
			var mode = tabmanager.TabManager.getCurrentDocument().getMode().name;
			if(core.Completion.getCompletionType() == core.CompletionType.REGULAR && mode == "haxe") {
				var completionActive1 = cm2.state.completionActive;
				if(completionActive1 != null && completionActive1.widget != null) completionActive1.widget.pick();
			} else if(mode == "xml") cm.Xml.completeIfInTag(cm2);
			return CodeMirror.Pass;
		};
		$r = passAndHint2;
		return $r;
	}(this)), '<' : (function($this) {
		var $r;
		var passAndHint3 = function(cm21) {
			cm.Xml.completeAfter(cm21);
			return CodeMirror.Pass;
		};
		$r = passAndHint3;
		return $r;
	}(this)), '/' : (function($this) {
		var $r;
		var passAndHint4 = function(cm22) {
			cm.Xml.completeIfAfterLt(cm22);
			return CodeMirror.Pass;
		};
		$r = passAndHint4;
		return $r;
	}(this)), ' ' : (function($this) {
		var $r;
		var passAndHint5 = function(cm23) {
			cm.Xml.completeIfInTag(cm23);
			return CodeMirror.Pass;
		};
		$r = passAndHint5;
		return $r;
	}(this)), 'Ctrl-J' : "toMatchingTag"};
	cm.Editor.editor = CodeMirror.fromTextArea(window.document.getElementById("code"),options);
	cm.Editor.editor.on("keypress",function(cm3,e) {
		if(e.shiftKey) {
			if(e.keyCode == 40 || e.keyCode == 62) {
				if(core.Completion.getCompletionType() == core.CompletionType.REGULAR && tabmanager.TabManager.getCurrentDocument().getMode().name == "haxe") {
					var completionActive2 = cm.Editor.editor.state.completionActive;
					if(completionActive2 != null && completionActive2.widget != null) completionActive2.widget.pick();
				}
			}
		}
	});
	new $("#editor").hide(0);
	cm.Editor.loadThemes(["base16-light","ambiance-mobile","solarized","night","base16-dark","midnight","vibrant-ink","xq-light","ambiance","elegant","tomorrow-night-eighties","twilight","paraiso-light","monokai","3024-night","3024-day","xq-dark","pastel-on-dark","erlang-dark","cobalt","lesser-dark","blackboard","mbo","neo","paraiso-dark","neat","eclipse","rubyblue","the-matrix","mdn-like"],cm.Editor.loadTheme);
	var value = "";
	var map = CodeMirror.keyMap.sublime;
	var mapK = CodeMirror.keyMap["sublime-Ctrl-K"];
	var _g = 0;
	var _g1 = Reflect.fields(map);
	while(_g < _g1.length) {
		var key = _g1[_g];
		++_g;
		if(key != "Ctrl-K" && key != "fallthrough") value += "  \"" + key + "\": \"" + Std.string(Reflect.field(map,key)) + "\",\n";
	}
	var _g2 = 0;
	var _g11 = Reflect.fields(mapK);
	while(_g2 < _g11.length) {
		var key1 = _g11[_g2];
		++_g2;
		if(key1 != "auto" && key1 != "nofallthrough") value += "  \"Ctrl-K " + key1 + "\": \"" + Std.string(Reflect.field(mapK,key1)) + "\",\n";
	}
	js.Node.require("fs").writeFileSync(js.Node.require("path").join("core","bindings.txt"),value,"utf8");
	window.addEventListener("resize",function(e1) {
		core.Helper.debounce("resize",function() {
			cm.Editor.editor.refresh();
		},100);
		haxe.Timer.delay(cm.Editor.resize,50);
	});
	new $("#thirdNested").on("resize",null,function(event) {
		var panels = event.args.panels;
		cm.Editor.resize();
	});
	cm.ColorPreview.create(cm.Editor.editor);
	cm.Editor.editor.on("cursorActivity",function(cm4) {
		core.Helper.debounce("cursorActivity",function() {
			core.FunctionParametersHelper.update(cm4);
			cm.ColorPreview.update(cm4);
			cm.ERegPreview.update(cm4);
		},100);
	});
	cm.Editor.editor.on("scroll",function(cm5) {
		cm.ColorPreview.scroll(cm.Editor.editor);
	});
	var timer = null;
	var basicTypes = ["Array","Map","StringMap"];
	cm.Editor.editor.on("change",function(cm6,e2) {
		if(e2.origin == "paste" && e2.from.line - e2.to.line > 0) {
			var _g12 = e2.from.line;
			var _g3 = e2.to.line;
			while(_g12 < _g3) {
				var line2 = _g12++;
				cm6.indentLine(line2);
			}
		}
		var modeName = tabmanager.TabManager.getCurrentDocument().getMode().name;
		if(modeName == "haxe") {
			core.Helper.debounce("change",function() {
				core.HaxeLint.updateLinting();
			},100);
			var cursor1 = cm6.getCursor();
			var data = cm6.getLine(cursor1.line);
			if(data.charAt(cursor1.ch - 1) == ".") cm.Editor.triggerCompletion(cm.Editor.editor,true);
			if(data.charAt(cursor1.ch - 1) == ":") {
				if(data.charAt(cursor1.ch - 2) == "@") core.Completion.showMetaTagsCompletion(); else core.Completion.showClassList();
			} else if(data.charAt(cursor1.ch - 1) == "<") {
				var _g4 = 0;
				while(_g4 < basicTypes.length) {
					var type = basicTypes[_g4];
					++_g4;
					if(StringTools.endsWith(HxOverrides.substr(data,0,cursor1.ch - 1),type)) {
						core.Completion.showClassList();
						break;
					}
				}
			} else if(StringTools.endsWith(data,"import ")) core.Completion.showClassList(true);
		} else if(modeName == "hxml") {
			var cursor2 = cm6.getCursor();
			var data1 = cm6.getLine(cursor2.line);
			if(data1 == "-") core.Completion.showHxmlCompletion(); else if(data1 == "-cp ") core.Completion.showFileList(false,true); else if(data1 == "-dce ") core.Completion.showHxmlCompletion(); else if(data1 == "--macro ") core.Completion.showClassList(true);
		}
		var tab = tabmanager.TabManager.tabMap.get(tabmanager.TabManager.selectedPath);
		tab.setChanged(!tab.doc.isClean());
	});
	CodeMirror.prototype.centerOnLine = function(line) {
		 var h = this.getScrollInfo().clientHeight;  var coords = this.charCoords({line: line, ch: 0}, 'local'); this.scrollTo(null, (coords.top + coords.bottom - h) / 2); ;
	};
	cm.Xml.generateXmlCompletion();
};
cm.Editor.triggerCompletion = function(cm1,dot) {
	if(dot == null) dot = false;
	console.log("triggerCompletion");
	var modeName = tabmanager.TabManager.getCurrentDocument().getMode().name;
	switch(modeName) {
	case "haxe":
		if(!dot || cm.Editor.regenerateCompletionOnDot || dot && !cm1.state.completionActive) tabmanager.TabManager.saveActiveFile(function() {
			core.Completion.showRegularCompletion();
		});
		break;
	case "hxml":
		core.Completion.showHxmlCompletion();
		break;
	case "xml":
		cm1.showHint({ completeSingle : false});
		break;
	default:
	}
};
cm.Editor.walk = function(object) {
	var regexp = RegExp;
	var _g = 0;
	var _g1 = Reflect.fields(object);
	while(_g < _g1.length) {
		var field = _g1[_g];
		++_g;
		var value = Reflect.field(object,field);
		if(typeof(value) == "string") {
			if(StringTools.startsWith(value,"regexp")) try {
				Reflect.setField(object,field,Type.createInstance(regexp,[value.substring(6)]));
			} catch( err ) {
				if( js.Boot.__instanceof(err,Error) ) {
					console.log(err);
				} else throw(err);
			} else if(StringTools.startsWith(value,"eval")) try {
				Reflect.setField(object,field,js.Lib["eval"](value.substring(4)));
			} catch( err1 ) {
				if( js.Boot.__instanceof(err1,Error) ) {
					console.log(err1);
				} else throw(err1);
			}
		}
		if(Reflect.isObject(value) && !((value instanceof Array) && value.__enum__ == null) && (function($this) {
			var $r;
			var e = Type["typeof"](value);
			$r = e[0];
			return $r;
		}(this)) == "TObject") cm.Editor.walk(value);
	}
};
cm.Editor.resize = function() {
	var height = window.innerHeight - 34 - new $("ul.tabs").height() - new $("#tabs1").height() - 5;
	new $(".CodeMirror").css("height",Std.string(height | 0) + "px");
};
cm.Editor.loadTheme = function() {
	var localStorage2 = js.Browser.getLocalStorage();
	if(localStorage2 != null) {
		var theme = localStorage2.getItem("theme");
		if(theme != null) cm.Editor.setTheme(theme);
	}
};
cm.Editor.loadThemes = function(themes,onComplete) {
	var themesSubmenu = menu.BootstrapMenu.getMenu("View").getSubmenu("Themes");
	var theme;
	var pathToThemeArray = new Array();
	themesSubmenu.addMenuItem("default",0,function() {
		return cm.Editor.setTheme("default");
	});
	var _g1 = 0;
	var _g = themes.length;
	while(_g1 < _g) {
		var i = _g1++;
		theme = themes[i];
		themesSubmenu.addMenuItem(theme,i + 1,(function(f,a1) {
			return function() {
				return f(a1);
			};
		})(cm.Editor.setTheme,theme));
	}
	onComplete();
};
cm.Editor.setTheme = function(theme) {
	cm.Editor.editor.setOption("theme",theme);
	js.Browser.getLocalStorage().setItem("theme",theme);
};
cm.Xml = function() { };
$hxClasses["cm.Xml"] = cm.Xml;
cm.Xml.__name__ = ["cm","Xml"];
cm.Xml.generateXmlCompletion = function() {
	var dummy = { attrs : { color : ["red","green","blue","purple","white","black","yellow"], size : ["large","medium","small"], description : null}, children : []};
	cm.Xml.tags = { '!top' : ["top"], '!attrs' : { id : null}, top : { attrs : { lang : ["en","de","fr","nl"], freeform : null}, children : ["animal","plant"]}, animal : { attrs : { name : null, isduck : ["yes","no"]}, children : ["wings","feet","body","head","tail"]}, plant : { attrs : { name : null}, children : ["leaves","stem","flowers"]}, wings : dummy, feet : dummy, body : dummy, head : dummy, tail : dummy, leaves : dummy, stem : dummy, flowers : dummy};
	cm.Editor.editor.setOption("hintOptions",{ schemaInfo : cm.Xml.tags});
};
cm.Xml.completeAfter = function(cm,pred) {
	console.log("completeAfter");
	var cur = cm.getCursor();
	if(pred == null || pred() != null) haxe.Timer.delay(function() {
		if(cm.state.completionActive == null) cm.showHint({ completeSingle : false});
	},100);
	return CodeMirror.Pass;
};
cm.Xml.completeIfAfterLt = function(cm1) {
	console.log("completeIfAfterLt");
	return cm.Xml.completeAfter(cm1,function() {
		var cur = cm1.getCursor();
		return cm1.getRange({ line : cur.line, ch : cur.ch - 1},cur) == "<";
	});
};
cm.Xml.completeIfInTag = function(cm1) {
	console.log("completeIfInTag");
	return cm.Xml.completeAfter(cm1,function() {
		var tok = cm1.getTokenAt(cm1.getCursor());
		if(tok.type == "string" && (!new EReg("['\"]","").match(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1)) return false;
		var inner = CodeMirror.innerMode(cm1.getMode(),tok.state).state;
		return inner.tagName;
	});
};
cm.Zoom = function() { };
$hxClasses["cm.Zoom"] = cm.Zoom;
cm.Zoom.__name__ = ["cm","Zoom"];
cm.Zoom.load = function() {
	window.document.addEventListener("mousewheel",function(e) {
		if(e.altKey || e.ctrlKey || e.metaKey) {
			if(e.wheelDeltaY < 0) {
				var fontSize = Std.parseInt(new $(".CodeMirror").css("font-size"));
				fontSize--;
				cm.Zoom.setFontSize(fontSize);
				e.preventDefault();
				e.stopPropagation();
			} else if(e.wheelDeltaY > 0) {
				var fontSize1 = Std.parseInt(new $(".CodeMirror").css("font-size"));
				fontSize1++;
				cm.Zoom.setFontSize(fontSize1);
				e.preventDefault();
				e.stopPropagation();
			}
		}
	});
	menu.BootstrapMenu.getMenu("View").addMenuItem("Increase Font Size",10001,function() {
		var fontSize2 = Std.parseInt(new $(".CodeMirror").css("font-size"));
		fontSize2++;
		cm.Zoom.setFontSize(fontSize2);
	},"Ctrl-+");
	menu.BootstrapMenu.getMenu("View").addMenuItem("Decrease Font Size",10002,function() {
		var fontSize3 = Std.parseInt(new $(".CodeMirror").css("font-size"));
		fontSize3--;
		cm.Zoom.setFontSize(fontSize3);
	},"Ctrl--");
};
cm.Zoom.setFontSize = function(fontSize) {
	new $(".CodeMirror").css("font-size",(fontSize == null?"null":"" + fontSize) + "px");
	new $(".CodeMirror-hint").css("font-size",Std.string(fontSize - 2) + "px");
	new $(".CodeMirror-hints").css("font-size",Std.string(fontSize - 2) + "px");
	cm.Editor.editor.refresh();
};
var completion = {};
completion.Filter = function() { };
$hxClasses["completion.Filter"] = completion.Filter;
completion.Filter.__name__ = ["completion","Filter"];
completion.Filter.filter = function(completions,word,completionType) {
	var list = [];
	if(word != null) {
		var filtered_results = [];
		var sorted_results = [];
		word = word.toLowerCase();
		var _g = 0;
		while(_g < completions.length) {
			var completion = completions[_g];
			++_g;
			var n = completion.text.toLowerCase();
			var b = true;
			var _g2 = 0;
			var _g1 = word.length;
			while(_g2 < _g1) {
				var j = _g2++;
				if(n.indexOf(word.charAt(j)) == -1) {
					b = false;
					break;
				}
			}
			if(b) filtered_results.push(completion);
		}
		var results = [];
		var filtered_results2 = [];
		var filtered_results3 = [];
		var exactResults = [];
		var _g11 = 0;
		var _g3 = filtered_results.length;
		while(_g11 < _g3) {
			var i = _g11++;
			var str = filtered_results[i].text.toLowerCase();
			var index = str.indexOf(word);
			if(word == str) exactResults.push(filtered_results[i]); else if(index == 0) sorted_results.push(filtered_results[i]); else if(index == str.length) filtered_results3.push(filtered_results[i]); else if(index != -1) filtered_results2.push(filtered_results[i]); else results.push(filtered_results[i]);
		}
		var _g4 = 0;
		while(_g4 < exactResults.length) {
			var completion1 = exactResults[_g4];
			++_g4;
			list.push(completion1);
		}
		var _g5 = 0;
		while(_g5 < sorted_results.length) {
			var completion2 = sorted_results[_g5];
			++_g5;
			list.push(completion2);
		}
		var _g6 = 0;
		while(_g6 < filtered_results2.length) {
			var completion3 = filtered_results2[_g6];
			++_g6;
			list.push(completion3);
		}
		var _g7 = 0;
		while(_g7 < filtered_results3.length) {
			var completion4 = filtered_results3[_g7];
			++_g7;
			list.push(completion4);
		}
		var _g8 = 0;
		while(_g8 < results.length) {
			var completion5 = results[_g8];
			++_g8;
			list.push(completion5);
		}
	} else list = completions;
	return list;
};
completion.Filter.sortFileList = function(list) {
	list.sort(function(a,b) {
		var aCount;
		var bCount;
		var aHaxeFile = StringTools.endsWith(a.filename,".hx");
		var bHaxeFile = StringTools.endsWith(b.filename,".hx");
		if(aHaxeFile && !bHaxeFile) return -1;
		if(!aHaxeFile && bHaxeFile) return 1;
		aCount = a.path.split("\\").length + a.path.split("/").length;
		bCount = b.path.split("\\").length + b.path.split("/").length;
		if(aCount < bCount) return -1;
		if(aCount > bCount) return 1;
		return 0;
	});
	return list;
};
completion.Filter.filterFiles = function(fileList,word) {
	var list = [];
	var filtered_results = [];
	var sorted_results = [];
	word = word.toLowerCase();
	var _g = 0;
	while(_g < fileList.length) {
		var completion = fileList[_g];
		++_g;
		var n = completion.path.toLowerCase();
		var b = true;
		var _g2 = 0;
		var _g1 = word.length;
		while(_g2 < _g1) {
			var j = _g2++;
			if(n.indexOf(word.charAt(j)) == -1) {
				b = false;
				break;
			}
		}
		if(b) filtered_results.push(completion);
	}
	var results = [];
	var filtered_results2 = [];
	var filtered_results3 = [];
	var exactResults = [];
	var filenameResults = [];
	var _g11 = 0;
	var _g3 = filtered_results.length;
	while(_g11 < _g3) {
		var i = _g11++;
		var path = filtered_results[i].path.toLowerCase();
		var filename = filtered_results[i].filename.toLowerCase();
		var index = path.indexOf(word);
		if(word == filename) filenameResults.push(filtered_results[i]); else if(StringTools.startsWith(filename,word)) filenameResults.push(filtered_results[i]); else if(word == path) exactResults.push(filtered_results[i]); else if(index == 0) sorted_results.push(filtered_results[i]); else if(index == path.length) filtered_results3.push(filtered_results[i]); else if(index != -1) filtered_results2.push(filtered_results[i]); else results.push(filtered_results[i]);
	}
	var _g4 = 0;
	while(_g4 < filenameResults.length) {
		var completion1 = filenameResults[_g4];
		++_g4;
		list.push(completion1);
	}
	var _g5 = 0;
	while(_g5 < exactResults.length) {
		var completion2 = exactResults[_g5];
		++_g5;
		list.push(completion2);
	}
	var _g6 = 0;
	while(_g6 < sorted_results.length) {
		var completion3 = sorted_results[_g6];
		++_g6;
		list.push(completion3);
	}
	var _g7 = 0;
	while(_g7 < filtered_results2.length) {
		var completion4 = filtered_results2[_g7];
		++_g7;
		list.push(completion4);
	}
	var _g8 = 0;
	while(_g8 < filtered_results3.length) {
		var completion5 = filtered_results3[_g8];
		++_g8;
		list.push(completion5);
	}
	var _g9 = 0;
	while(_g9 < results.length) {
		var completion6 = results[_g9];
		++_g9;
		list.push(completion6);
	}
	return list;
};
completion.Hxml = function() { };
$hxClasses["completion.Hxml"] = completion.Hxml;
completion.Hxml.__name__ = ["completion","Hxml"];
completion.Hxml.load = function() {
	completion.Hxml.completions = [];
	completion.Hxml.getArguments(function() {
		return completion.Hxml.getDefines(completion.Hxml.getHaxelibList);
	});
};
completion.Hxml.getHaxelibList = function(onComplete) {
	core.HaxeHelper.getInstalledHaxelibList(function(installedLibs) {
		var _g = 0;
		while(_g < installedLibs.length) {
			var item = installedLibs[_g];
			++_g;
			var completionItem = { };
			completionItem.text = "-lib " + item;
			completionItem.displayText = completionItem.text + " - installed";
			completionItem.className = "CodeMirror-Tern-completion" + " CodeMirror-Tern-completion-lib";
			completion.Hxml.completions.push(completionItem);
		}
		core.HaxeHelper.getHaxelibList(function(libs) {
			var _g1 = 0;
			while(_g1 < libs.length) {
				var item1 = libs[_g1];
				++_g1;
				if(HxOverrides.indexOf(installedLibs,item1,0) == -1) {
					var completionItem1 = { };
					completionItem1.text = "-lib " + item1;
					completionItem1.displayText = completionItem1.text + " - not installed";
					completionItem1.className = "CodeMirror-Tern-completion" + " CodeMirror-Tern-completion-lib";
					completion.Hxml.completions.push(completionItem1);
				}
			}
			if(onComplete != null) onComplete();
		});
	});
};
completion.Hxml.getDefines = function(onComplete) {
	core.HaxeHelper.getDefines(function(data) {
		var _g = 0;
		while(_g < data.length) {
			var item = data[_g];
			++_g;
			completion.Hxml.completions.push({ text : "-D " + item, className : "CodeMirror-Tern-completion" + " CodeMirror-Tern-completion-define"});
		}
		if(onComplete != null) onComplete();
	});
};
completion.Hxml.getArguments = function(onComplete) {
	core.HaxeHelper.getArguments(function(data) {
		var _g = 0;
		while(_g < data.length) {
			var item = data[_g];
			++_g;
			completion.Hxml.completions.push({ text : item, className : "CodeMirror-Tern-completion"});
			if(item == "-dce") {
				completion.Hxml.completions.push({ text : item + " " + "no", className : "CodeMirror-Tern-completion"});
				completion.Hxml.completions.push({ text : item + " " + "std", className : "CodeMirror-Tern-completion"});
				completion.Hxml.completions.push({ text : item + " " + "full", className : "CodeMirror-Tern-completion"});
			}
		}
		if(onComplete != null) onComplete();
	});
};
completion.Hxml.getCompletion = function() {
	return completion.Hxml.completions;
};
completion.MetaTags = function() { };
$hxClasses["completion.MetaTags"] = completion.MetaTags;
completion.MetaTags.__name__ = ["completion","MetaTags"];
completion.MetaTags.load = function() {
	completion.MetaTags.completions = [];
	core.ProcessHelper.runProcess("haxe",["--help-metas"],null,function(stdout,stderr) {
		var regex = new EReg("@:[A-Z]+ ","gim");
		regex.map(stdout,function(ereg) {
			completion.MetaTags.completions.push({ text : StringTools.trim(ereg.matched(0))});
			return ereg.matched(0);
		});
	});
};
completion.MetaTags.getCompletion = function() {
	return completion.MetaTags.completions;
};
completion.SnippetsCompletion = function() { };
$hxClasses["completion.SnippetsCompletion"] = completion.SnippetsCompletion;
completion.SnippetsCompletion.__name__ = ["completion","SnippetsCompletion"];
completion.SnippetsCompletion.load = function() {
	var options = { };
	options.encoding = "utf8";
	js.Node.require("fs").readFile(js.Node.require("path").join("core","config","snippets.json"),options,function(error,data) {
		if(error == null) {
			var templates = tjson.TJSON.parse(data);
			var snippets = templates.snippets;
			var _g = 0;
			while(_g < snippets.length) {
				var template = snippets[_g];
				++_g;
				CodeMirror.templatesHint.addTemplates(template,true);
			}
		} else Alertify.error("Can't open core/config/snippets.json");
	});
};
completion.SnippetsCompletion.getCompletion = function() {
	var completions = CodeMirror.templatesHint.getCompletions(cm.Editor.editor);
	return completions;
};
var core = {};
core.AnnotationRuler = function() { };
$hxClasses["core.AnnotationRuler"] = core.AnnotationRuler;
core.AnnotationRuler.__name__ = ["core","AnnotationRuler"];
core.AnnotationRuler.addErrorMarker = function(pathToFile,line,ch,message) {
	var a;
	var _this = window.document;
	a = _this.createElement("a");
	a.href = "#";
	a.onclick = function(e) {
		tabmanager.TabManager.openFileInNewTab(pathToFile,true,function() {
			var cm1 = cm.Editor.editor;
			cm1.centerOnLine(line);
		});
	};
	var div;
	var _this1 = window.document;
	div = _this1.createElement("div");
	div.className = "errorMarker";
	var lineCount = tabmanager.TabManager.getCurrentDocument().lineCount();
	var targetLine = line / lineCount * 100;
	while(HxOverrides.indexOf(core.AnnotationRuler.positions,targetLine,0) != -1) targetLine++;
	div.style.top = (targetLine == null?"null":"" + targetLine) + "%";
	core.AnnotationRuler.positions.push(targetLine);
	div.setAttribute("data-toggle","tooltip");
	div.setAttribute("data-placement","left");
	div.title = "Line: " + (line == null?"null":"" + line) + ":" + message;
	new $(div).tooltip({ });
	a.appendChild(div);
	new $("#annotationRuler").append(a);
};
core.AnnotationRuler.clearErrorMarkers = function() {
	new $("#annotationRuler").children().remove();
	core.AnnotationRuler.positions = [];
};
core.CompilationOutput = function() { };
$hxClasses["core.CompilationOutput"] = core.CompilationOutput;
core.CompilationOutput.__name__ = ["core","CompilationOutput"];
core.CompilationOutput.load = function() {
	var output;
	var _this = window.document;
	output = _this.createElement("textarea");
	output.id = "outputTextArea";
	output.readOnly = true;
	new $("#output").append(output);
};
core.CompletionType = $hxClasses["core.CompletionType"] = { __ename__ : ["core","CompletionType"], __constructs__ : ["REGULAR","FILELIST","PASTEFOLDER","OPENFILE","CLASSLIST","HXML","METATAGS"] };
core.CompletionType.REGULAR = ["REGULAR",0];
core.CompletionType.REGULAR.toString = $estr;
core.CompletionType.REGULAR.__enum__ = core.CompletionType;
core.CompletionType.FILELIST = ["FILELIST",1];
core.CompletionType.FILELIST.toString = $estr;
core.CompletionType.FILELIST.__enum__ = core.CompletionType;
core.CompletionType.PASTEFOLDER = ["PASTEFOLDER",2];
core.CompletionType.PASTEFOLDER.toString = $estr;
core.CompletionType.PASTEFOLDER.__enum__ = core.CompletionType;
core.CompletionType.OPENFILE = ["OPENFILE",3];
core.CompletionType.OPENFILE.toString = $estr;
core.CompletionType.OPENFILE.__enum__ = core.CompletionType;
core.CompletionType.CLASSLIST = ["CLASSLIST",4];
core.CompletionType.CLASSLIST.toString = $estr;
core.CompletionType.CLASSLIST.__enum__ = core.CompletionType;
core.CompletionType.HXML = ["HXML",5];
core.CompletionType.HXML.toString = $estr;
core.CompletionType.HXML.__enum__ = core.CompletionType;
core.CompletionType.METATAGS = ["METATAGS",6];
core.CompletionType.METATAGS.toString = $estr;
core.CompletionType.METATAGS.__enum__ = core.CompletionType;
core.Completion = function() { };
$hxClasses["core.Completion"] = core.Completion;
core.Completion.__name__ = ["core","Completion"];
core.Completion.registerHelper = function() {
	completion.Hxml.load();
	completion.MetaTags.load();
	completion.SnippetsCompletion.load();
	core.Completion.completionActive = false;
	cm.Editor.editor.on("endCompletion",function() {
		core.Completion.completionActive = false;
	});
};
core.Completion.getHints = function(cm1,options) {
	core.Completion.word = null;
	core.Completion.range = null;
	if(options != null && options.range != null) core.Completion.range = options.range; else if(core.Completion.RANGE != null) core.Completion.range = core.Completion.RANGE;
	core.Completion.list = new Array();
	var _g = core.Completion.completionType;
	switch(_g[1]) {
	case 0:
		var _g1 = 0;
		var _g2 = core.Completion.completions;
		while(_g1 < _g2.length) {
			var completion1 = _g2[_g1];
			++_g1;
			var completionItem = { text : completion1.n};
			var functionData = core.FunctionParametersHelper.parseFunctionParams(completion1);
			var info;
			completionItem.className = "CodeMirror-Tern-completion";
			if(functionData.parameters != null) {
				info = completion1.n + "(" + functionData.parameters.join(", ") + ")" + ":" + functionData.retType;
				completionItem.className += " CodeMirror-Tern-completion-fn";
			} else {
				info = completion1.t;
				switch(info) {
				case "Bool":
					completionItem.className += " CodeMirror-Tern-completion-bool";
					break;
				case "Float":case "Int":case "UInt":
					completionItem.className += " CodeMirror-Tern-completion-number";
					break;
				case "String":
					completionItem.className += " CodeMirror-Tern-completion-string";
					break;
				default:
					if(info.indexOf("Array") != -1) completionItem.className += " CodeMirror-Tern-completion-array"; else if(info.indexOf("Map") != -1 || info.indexOf("StringMap") != -1) completionItem.className += " CodeMirror-Tern-completion-map"; else completionItem.className += " CodeMirror-Tern-completion-object";
				}
			}
			var infoSpan = [(function($this) {
				var $r;
				var _this = window.document;
				$r = _this.createElement("span");
				return $r;
			}(this))];
			var infoTypeSpan;
			var _this1 = window.document;
			infoTypeSpan = _this1.createElement("span");
			infoTypeSpan.textContent = info;
			infoSpan[0].appendChild(infoTypeSpan);
			infoSpan[0].appendChild(window.document.createElement("br"));
			infoSpan[0].appendChild(window.document.createElement("br"));
			var infoDescriptionSpan;
			var _this2 = window.document;
			infoDescriptionSpan = _this2.createElement("span");
			infoDescriptionSpan.className = "completionDescription";
			infoDescriptionSpan.innerHTML = completion1.d;
			infoSpan[0].appendChild(infoDescriptionSpan);
			completionItem.info = (function(infoSpan) {
				return function(completionItem1) {
					return infoSpan[0];
				};
			})(infoSpan);
			core.Completion.list.push(completionItem);
		}
		core.Completion.getCurrentWord(cm1,{ word : new EReg("[A-Z.]+$","i")});
		var className = "CodeMirror-Tern-completion";
		if(core.Completion.curWord == null || core.Completion.curWord.indexOf(".") == -1) {
			core.Completion.list = core.Completion.list.concat(completion.SnippetsCompletion.getCompletion());
			var classList = core.Completion.getClassList();
			var _g11 = 0;
			var _g21 = classList.topLevelClassList;
			while(_g11 < _g21.length) {
				var item = _g21[_g11];
				++_g11;
				var completion1 = { text : item.name};
				completion1.className = className + " CodeMirror-Tern-completion-class";
				core.Completion.list.push(completion1);
			}
		}
		break;
	case 6:
		core.Completion.list = completion.MetaTags.getCompletion();
		break;
	case 5:
		var _this3 = completion.Hxml.getCompletion();
		core.Completion.list = _this3.slice();
		var _g12 = 0;
		var _g22 = [parser.ClassParser.topLevelClassList,parser.ClassParser.importsList,parser.ClassParser.haxeStdTopLevelClassList,parser.ClassParser.haxeStdImports];
		while(_g12 < _g22.length) {
			var list2 = _g22[_g12];
			++_g12;
			var _g3 = 0;
			while(_g3 < list2.length) {
				var item1 = list2[_g3];
				++_g3;
				core.Completion.list.push({ text : item1});
			}
		}
		break;
	case 1:
		var displayText;
		var _g13 = 0;
		var _g23 = [parser.ClassParser.filesList,parser.ClassParser.haxeStdFileList];
		while(_g13 < _g23.length) {
			var list21 = _g23[_g13];
			++_g13;
			var _g31 = 0;
			while(_g31 < list21.length) {
				var item2 = list21[_g31];
				++_g31;
				core.Completion.list.push({ text : item2.path, displayText : core.Completion.processDisplayText(item2.path)});
			}
		}
		break;
	case 2:
		var displayText1;
		var _g14 = 0;
		var _g24 = parser.ClassParser.filesList;
		while(_g14 < _g24.length) {
			var item3 = _g24[_g14];
			++_g14;
			core.Completion.list.push({ text : item3.directory, displayText : core.Completion.processDisplayText(item3.path)});
		}
		break;
	case 4:
		var classList1 = core.Completion.getClassList();
		var className1 = "CodeMirror-Tern-completion";
		var _g15 = 0;
		var _g25 = classList1.topLevelClassList;
		while(_g15 < _g25.length) {
			var item4 = _g25[_g15];
			++_g15;
			var completion2 = { text : item4.name};
			completion2.className = className1 + " CodeMirror-Tern-completion-class";
			core.Completion.list.push(completion2);
		}
		var _g16 = 0;
		var _g26 = classList1.importsList;
		while(_g16 < _g26.length) {
			var item5 = _g26[_g16];
			++_g16;
			var completion3 = { text : item5};
			completion3.className = className1 + " CodeMirror-Tern-completion-class";
			core.Completion.list.push(completion3);
		}
		break;
	default:
	}
	core.Completion.getCurrentWord(cm1,options);
	core.Completion.list = completion.Filter.filter(core.Completion.list,core.Completion.curWord,core.Completion.completionType);
	var data = { list : core.Completion.list, from : { line : core.Completion.cur.line, ch : core.Completion.start}, to : { line : core.Completion.cur.line, ch : core.Completion.end}};
	CodeMirror.attachContextInfo(cm.Editor.editor,data);
	var _g4 = core.Completion.completionType;
	switch(_g4[1]) {
	case 0:case 4:
		CodeMirror.on(data,"pick",core.Completion.searchForImport);
		break;
	default:
	}
	return data;
};
core.Completion.searchForImport = function(completion) {
	var cm1 = cm.Editor.editor;
	var cursor = cm1.getCursor();
	var curLine = cm1.getLine(cursor.line);
	var word = new EReg("[A-Z\\.]+$","i");
	var importStart = cursor.ch;
	var importEnd = importStart;
	while(importStart > 0 && word.match(curLine.charAt(importStart - 1))) --importStart;
	if(importStart != importEnd) {
		var fullImport = curLine.substring(importStart,importEnd);
		if(fullImport.indexOf(".") != -1) {
			var topLevelClassList = core.Completion.getClassList().topLevelClassList;
			core.ImportDefinition.searchImportByText(topLevelClassList,fullImport,{ line : cursor.line, ch : importStart},{ line : cursor.line, ch : importEnd},false);
		}
	}
};
core.Completion.processDisplayText = function(displayText) {
	if(displayText.length > 70) displayText = HxOverrides.substr(displayText,0,35) + " ... " + HxOverrides.substr(displayText,displayText.length - 35,null);
	return displayText;
};
core.Completion.getCurrentWord = function(cm,options,pos) {
	if(options != null && options.word != null) core.Completion.word = options.word; else if(core.Completion.WORD != null) core.Completion.word = core.Completion.WORD;
	if(pos != null) core.Completion.cur = pos;
	var curLine = cm.getLine(core.Completion.cur.line);
	core.Completion.start = core.Completion.cur.ch;
	core.Completion.end = core.Completion.start;
	while(core.Completion.end < curLine.length && core.Completion.word.match(curLine.charAt(core.Completion.end))) ++core.Completion.end;
	while(core.Completion.start > 0 && core.Completion.word.match(curLine.charAt(core.Completion.start - 1))) --core.Completion.start;
	core.Completion.curWord = null;
	if(core.Completion.start != core.Completion.end) core.Completion.curWord = curLine.substring(core.Completion.start,core.Completion.end);
	return { word : core.Completion.curWord, from : { line : core.Completion.cur.line, ch : core.Completion.start}, to : { line : core.Completion.cur.line, ch : core.Completion.end}};
};
core.Completion.getCompletion = function(onComplete,_pos) {
	if(projectaccess.ProjectAccess.path != null) {
		var projectArguments = [];
		var project = projectaccess.ProjectAccess.currentProject;
		var _g = project.type;
		switch(_g) {
		case 0:
			var pathToHxml = project.targetData[project.target].pathToHxml;
			projectArguments.push(pathToHxml);
			core.Completion.processArguments(projectArguments,onComplete,_pos);
			break;
		case 2:
			projectArguments.push(project.main);
			core.Completion.processArguments(projectArguments,onComplete,_pos);
			break;
		case 1:
			openproject.OpenFL.parseOpenFLDisplayParameters(projectaccess.ProjectAccess.path,project.openFLTarget,function(args) {
				projectArguments = args;
				core.Completion.processArguments(projectArguments,onComplete,_pos);
			});
			break;
		default:
		}
	}
};
core.Completion.processArguments = function(projectArguments,onComplete,_pos) {
	console.log("processArguments");
	projectArguments.push("--no-output");
	projectArguments.push("--display");
	var cm1 = cm.Editor.editor;
	core.Completion.cur = _pos;
	if(_pos == null) core.Completion.cur = cm1.getCursor();
	core.Completion.getCurrentWord(cm1,null,core.Completion.cur);
	if(core.Completion.curWord != null) core.Completion.cur = { line : core.Completion.cur.line, ch : core.Completion.start};
	projectArguments.push(tabmanager.TabManager.getCurrentDocumentPath() + "@" + Std.string(cm1.indexFromPos(core.Completion.cur)));
	core.Completion.completions = [];
	var params = ["--connect","5000","--cwd",HIDE.surroundWithQuotes(projectaccess.ProjectAccess.path)].concat(projectArguments);
	core.ProcessHelper.runProcess("haxe",params,null,function(stdout,stderr) {
		var xml = Xml.parse(stderr);
		var fast = new haxe.xml.Fast(xml);
		if(fast.hasNode.resolve("list")) {
			var list = fast.node.resolve("list");
			var completion;
			if(list.hasNode.resolve("i")) {
				var $it0 = list.nodes.resolve("i").iterator();
				while( $it0.hasNext() ) {
					var item = $it0.next();
					if(item.has.resolve("n")) {
						completion = { n : item.att.resolve("n")};
						if(item.hasNode.resolve("d")) {
							var str = StringTools.trim(item.node.resolve("d").get_innerHTML());
							str = StringTools.replace(str,"\t","");
							str = StringTools.replace(str,"\n","");
							str = StringTools.replace(str,"*","");
							str = StringTools.replace(str,"&lt;","<");
							str = StringTools.replace(str,"&gt;",">");
							str = StringTools.trim(str);
							completion.d = str;
						}
						if(item.hasNode.resolve("t")) completion.t = item.node.resolve("t").get_innerData();
						core.Completion.completions.push(completion);
					}
				}
			}
		}
		onComplete();
	},function(code,stdout1,stderr1) {
		console.log(code);
		console.log(stderr1);
		onComplete();
	});
};
core.Completion.getHintAsync = function(cm,c) {
	if(core.Completion.completionActive) c(core.Completion.getHints(cm)); else {
		core.Completion.getCompletion(function() {
			c(core.Completion.getHints(cm));
		});
		core.Completion.completionActive = true;
	}
};
core.Completion.isEditorVisible = function() {
	var editor;
	editor = js.Boot.__cast(window.document.getElementById("editor") , HTMLDivElement);
	return editor.style.display != "none";
};
core.Completion.showRegularCompletion = function() {
	if(core.Completion.isEditorVisible()) {
		cm.Editor.regenerateCompletionOnDot = true;
		core.Completion.WORD = new EReg("[A-Z]+$","i");
		core.Completion.completionType = core.CompletionType.REGULAR;
		var hint = core.Completion.getHintAsync;
		hint.async = true;
		cm.Editor.editor.showHint({ hint : hint, completeSingle : false});
	}
};
core.Completion.showMetaTagsCompletion = function() {
	if(core.Completion.isEditorVisible()) {
		core.Completion.cur = cm.Editor.editor.getCursor();
		cm.Editor.regenerateCompletionOnDot = false;
		core.Completion.WORD = new EReg("[A-Z@:]+$","i");
		core.Completion.completionType = core.CompletionType.METATAGS;
		CodeMirror.showHint(cm.Editor.editor,core.Completion.getHints,{ closeCharacters : /[\s()\[\]{};>,]/});
	}
};
core.Completion.showHxmlCompletion = function() {
	if(core.Completion.isEditorVisible()) {
		core.Completion.cur = cm.Editor.editor.getCursor();
		cm.Editor.regenerateCompletionOnDot = false;
		core.Completion.WORD = new EReg("[A-Z- \\.\\\\/]+$","i");
		core.Completion.completionType = core.CompletionType.HXML;
		CodeMirror.showHint(cm.Editor.editor,core.Completion.getHints,{ closeCharacters : /[()\[\]{};:>,]/});
	}
};
core.Completion.showFileList = function(openFile,insertDirectory) {
	if(insertDirectory == null) insertDirectory = false;
	if(openFile == null) openFile = true;
	if(openFile) {
		core.Completion.completionType = core.CompletionType.OPENFILE;
		core.QuickOpen.show(parser.ClassParser.filesList.slice().concat(parser.ClassParser.haxeStdFileList));
	} else if(core.Completion.isEditorVisible()) {
		core.Completion.cur = cm.Editor.editor.getCursor();
		cm.Editor.regenerateCompletionOnDot = false;
		core.Completion.WORD = new EReg("[A-Z-\\.\\\\/]+$","i");
		if(insertDirectory == false) core.Completion.completionType = core.CompletionType.FILELIST; else core.Completion.completionType = core.CompletionType.PASTEFOLDER;
		CodeMirror.showHint(cm.Editor.editor,core.Completion.getHints);
	}
};
core.Completion.showClassList = function(ignoreWhitespace) {
	if(ignoreWhitespace == null) ignoreWhitespace = false;
	if(core.Completion.isEditorVisible()) {
		core.Completion.cur = cm.Editor.editor.getCursor();
		cm.Editor.regenerateCompletionOnDot = true;
		core.Completion.WORD = new EReg("[A-Z\\.]+$","i");
		core.Completion.completionType = core.CompletionType.CLASSLIST;
		var closeCharacters = /[\s()\[\]{};>,]/;
		if(ignoreWhitespace) closeCharacters = /[()\[\]{};>,]/;
		CodeMirror.showHint(cm.Editor.editor,core.Completion.getHints,{ closeCharacters : closeCharacters});
	}
};
core.Completion.showImportDefinition = function(importsSuggestions,from,to) {
	var cm1 = cm.Editor.editor;
	CodeMirror.showHint(cm1,function() {
		var completions = [];
		var completion;
		var _g = 0;
		while(_g < importsSuggestions.length) {
			var item = importsSuggestions[_g];
			++_g;
			completion = { };
			completion.text = item;
			completion.displayText = "import " + item;
			completion.hint = (function(f,a1,to1) {
				return function(cm1,a2,a3) {
					return f(a1,to1,cm1,a2,a3);
				};
			})(core.ImportDefinition.importClassHint,from,to);
			completions.push(completion);
		}
		var pos = cm1.getCursor();
		var data = { list : completions, from : pos, to : pos};
		return data;
	},{ completeSingle : false});
};
core.Completion.getClassList = function() {
	var value = tabmanager.TabManager.getCurrentDocument().getValue();
	var filePackage = parser.RegexParser.getFilePackage(value);
	var fileImports = parser.RegexParser.getFileImportsList(value);
	var topLevelClassList = [];
	var importsList = [];
	var relativeImport = null;
	var parentPackages = [];
	if(filePackage.filePackage != null && filePackage.filePackage != "") {
		var packages = filePackage.filePackage.split(".");
		var parentPackage;
		while(packages.length > 0) {
			parentPackage = packages.join(".");
			packages.pop();
			parentPackages.push(parentPackage);
		}
	}
	var found;
	var _g = 0;
	var _g1 = [parser.ClassParser.importsList,parser.ClassParser.haxeStdImports];
	while(_g < _g1.length) {
		var list2 = _g1[_g];
		++_g;
		var _g2 = 0;
		while(_g2 < list2.length) {
			var item = list2[_g2];
			++_g2;
			found = false;
			var _g3 = 0;
			while(_g3 < parentPackages.length) {
				var parentPackage1 = parentPackages[_g3];
				++_g3;
				if(StringTools.startsWith(item,parentPackage1 + ".") && item.indexOf(".",parentPackage1.length + 1) == -1) {
					relativeImport = HxOverrides.substr(item,parentPackage1.length + 1,null);
					topLevelClassList.push({ name : relativeImport, fullName : item});
					found = true;
					break;
				}
			}
			if(!found) {
				if(HxOverrides.indexOf(fileImports,item,0) != -1) {
					relativeImport = item.split(".").pop();
					topLevelClassList.push({ name : relativeImport, fullName : item});
				} else if(filePackage.filePackage != null && filePackage.filePackage != "" && StringTools.startsWith(item,filePackage.filePackage + ".")) {
					relativeImport = HxOverrides.substr(item,filePackage.filePackage.length + 1,null);
					importsList.push(relativeImport);
				} else {
					relativeImport = item;
					importsList.push(relativeImport);
				}
			}
		}
	}
	var _g4 = 0;
	var _g11 = [parser.ClassParser.haxeStdTopLevelClassList,parser.ClassParser.topLevelClassList];
	while(_g4 < _g11.length) {
		var list21 = _g11[_g4];
		++_g4;
		var _g21 = 0;
		while(_g21 < list21.length) {
			var item1 = list21[_g21];
			++_g21;
			topLevelClassList.push({ name : item1});
		}
	}
	var _g5 = 0;
	while(_g5 < fileImports.length) {
		var item2 = fileImports[_g5];
		++_g5;
		found = false;
		relativeImport = item2.split(".").pop();
		var _g12 = 0;
		while(_g12 < topLevelClassList.length) {
			var topLevelItem = topLevelClassList[_g12];
			++_g12;
			if(topLevelItem.name == relativeImport) {
				found = true;
				break;
			}
		}
		if(!found) topLevelClassList.push({ name : relativeImport, fullName : item2});
	}
	return { topLevelClassList : topLevelClassList, importsList : importsList};
};
core.Completion.getCompletionType = function() {
	return core.Completion.completionType;
};
core.DragAndDrop = function() { };
$hxClasses["core.DragAndDrop"] = core.DragAndDrop;
core.DragAndDrop.__name__ = ["core","DragAndDrop"];
core.DragAndDrop.prepare = function() {
	window.addEventListener("dragover",function(e) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	});
	window.addEventListener("drop",function(e1) {
		e1.preventDefault();
		e1.stopPropagation();
		var _g1 = 0;
		var _g = e1.dataTransfer.files.length;
		while(_g1 < _g) {
			var i = _g1++;
			var path = [e1.dataTransfer.files[i].path];
			js.Node.require("fs").stat(path[0],(function(path) {
				return function(err,stats) {
					if(stats.isDirectory()) filetree.FileTree.load(js.Node.require("path").basename(path[0]),path[0]); else openproject.OpenProject.openProject(path[0]);
				};
			})(path));
		}
		return false;
	});
};
core.FileDialog = function() { };
$hxClasses["core.FileDialog"] = core.FileDialog;
core.FileDialog.__name__ = ["core","FileDialog"];
core.FileDialog.create = function() {
	var _this = window.document;
	core.FileDialog.input = _this.createElement("input");
	core.FileDialog.input.type = "file";
	core.FileDialog.input.style.display = "none";
	core.FileDialog.input.addEventListener("change",function(e) {
		var value = core.FileDialog.input.value;
		if(value != "") core.FileDialog.onClick(value);
	});
	window.document.body.appendChild(core.FileDialog.input);
};
core.FileDialog.openFile = function(_onClick,extensions) {
	core.FileDialog.input.value = "";
	core.FileDialog.onClick = _onClick;
	if(core.FileDialog.input.hasAttribute("nwsaveas")) core.FileDialog.input.removeAttribute("nwsaveas");
	if(core.FileDialog.input.hasAttribute("nwdirectory")) core.FileDialog.input.removeAttribute("nwdirectory");
	if(extensions != null) core.FileDialog.input.setAttribute("accept",extensions); else core.FileDialog.input.removeAttribute("accept");
	core.FileDialog.input.click();
};
core.FileDialog.saveFile = function(_onClick,_name) {
	core.FileDialog.input.value = "";
	core.FileDialog.onClick = _onClick;
	if(_name == null) _name = "";
	if(core.FileDialog.input.hasAttribute("nwdirectory")) core.FileDialog.input.removeAttribute("nwdirectory");
	core.FileDialog.input.setAttribute("nwsaveas",_name);
	core.FileDialog.input.click();
};
core.FileDialog.openFolder = function(_onClick) {
	core.FileDialog.input.value = "";
	core.FileDialog.onClick = _onClick;
	if(core.FileDialog.input.hasAttribute("nwsaveas")) core.FileDialog.input.removeAttribute("nwsaveas");
	core.FileDialog.input.setAttribute("nwdirectory","");
	core.FileDialog.input.click();
};
core.FunctionParametersHelper = function() { };
$hxClasses["core.FunctionParametersHelper"] = core.FunctionParametersHelper;
core.FunctionParametersHelper.__name__ = ["core","FunctionParametersHelper"];
core.FunctionParametersHelper.addWidget = function(type,name,parameters,retType,description,currentParameter,pos) {
	var lineWidget = new core.LineWidget(type,name,parameters,retType,description,currentParameter,pos);
	core.FunctionParametersHelper.widgets.push(lineWidget);
};
core.FunctionParametersHelper.alreadyShown = function() {
	return core.FunctionParametersHelper.widgets.length > 0;
};
core.FunctionParametersHelper.updateScroll = function() {
	var info = cm.Editor.editor.getScrollInfo();
	var after = cm.Editor.editor.charCoords({ line : cm.Editor.editor.getCursor().line + 1, ch : 0},"local").top;
	if(info.top + info.clientHeight < after) cm.Editor.editor.scrollTo(null,after - info.clientHeight + 3);
};
core.FunctionParametersHelper.clear = function() {
	var _g = 0;
	var _g1 = core.FunctionParametersHelper.widgets;
	while(_g < _g1.length) {
		var widget = _g1[_g];
		++_g;
		cm.Editor.editor.removeLineWidget(widget.getWidget());
	}
	core.FunctionParametersHelper.widgets = [];
};
core.FunctionParametersHelper.update = function(cm) {
	var modeName = tabmanager.TabManager.getCurrentDocument().getMode().name;
	if(modeName == "haxe" && !cm.state.completionActive) {
		var cursor = cm.getCursor();
		var data = cm.getLine(cursor.line);
		if(cursor != null && data.charAt(cursor.ch - 1) != ".") core.FunctionParametersHelper.scanForBracket(cm,cursor);
	}
};
core.FunctionParametersHelper.scanForBracket = function(cm,cursor) {
	var bracketsData = cm.scanForBracket(cursor,-1,null,{ bracketRegex : /[([\]]/});
	var pos = null;
	if(bracketsData != null && bracketsData.ch == "(") {
		pos = { line : bracketsData.pos.line, ch : bracketsData.pos.ch};
		var matchedBracket = cm.findMatchingBracket(pos,false,null).to;
		if(matchedBracket == null || cursor.line <= matchedBracket.line && cursor.ch <= matchedBracket.ch) {
			var range = cm.getRange(bracketsData.pos,cursor);
			var currentParameter = range.split(",").length - 1;
			if(core.FunctionParametersHelper.lastPos == null || core.FunctionParametersHelper.lastPos.ch != pos.ch || core.FunctionParametersHelper.lastPos.line != pos.line) core.FunctionParametersHelper.getFunctionParams(cm,pos,currentParameter); else if(core.FunctionParametersHelper.alreadyShown()) core.FunctionParametersHelper.widgets[0].updateParameters(currentParameter);
			core.FunctionParametersHelper.lastPos = pos;
		} else {
			core.FunctionParametersHelper.lastPos = null;
			core.FunctionParametersHelper.clear();
		}
	} else {
		core.FunctionParametersHelper.lastPos = null;
		core.FunctionParametersHelper.clear();
	}
};
core.FunctionParametersHelper.getFunctionParams = function(cm,pos,currentParameter) {
	var word = core.Completion.getCurrentWord(cm,{ },{ line : pos.line, ch : pos.ch - 1}).word;
	core.Completion.getCompletion(function() {
		var found = false;
		var _g = 0;
		var _g1 = core.Completion.completions;
		while(_g < _g1.length) {
			var completion = _g1[_g];
			++_g;
			if(word == completion.n) {
				var functionData = core.FunctionParametersHelper.parseFunctionParams(completion);
				if(functionData.parameters != null) {
					var description = core.FunctionParametersHelper.parseDescription(completion);
					core.FunctionParametersHelper.clear();
					core.FunctionParametersHelper.addWidget("function",completion.n,functionData.parameters,functionData.retType,description,currentParameter,cm.getCursor());
					core.FunctionParametersHelper.updateScroll();
					found = true;
					break;
				}
			}
		}
		if(!found) core.FunctionParametersHelper.clear();
	},{ line : pos.line, ch : pos.ch - 1});
};
core.FunctionParametersHelper.parseDescription = function(completion) {
	var description = completion.d;
	if(description != null) {
		if(description.indexOf(".") != -1) description = description.split(".")[0];
	}
	return description;
};
core.FunctionParametersHelper.parseFunctionParams = function(completion) {
	var parameters = null;
	var retType = null;
	if(completion.t.indexOf("->") != -1) {
		var openBracketsCount = 0;
		var positions = [];
		var i = 0;
		var lastPos = 0;
		while(i < completion.t.length) {
			var _g = completion.t.charAt(i);
			switch(_g) {
			case "-":
				if(openBracketsCount == 0 && completion.t.charAt(i + 1) == ">") {
					positions.push({ start : lastPos, end : i - 1});
					i++;
					i++;
					lastPos = i;
				}
				break;
			case "(":
				openBracketsCount++;
				break;
			case ")":
				openBracketsCount--;
				break;
			default:
			}
			i++;
		}
		positions.push({ start : lastPos, end : completion.t.length});
		parameters = [];
		var _g1 = 0;
		var _g2 = positions.length;
		while(_g1 < _g2) {
			var j = _g1++;
			var param = StringTools.trim(completion.t.substring(positions[j].start,positions[j].end));
			if(j < positions.length - 1) parameters.push(param); else retType = param;
		}
		if(parameters.length == 1 && parameters[0] == "Void") parameters = [];
	}
	return { parameters : parameters, retType : retType};
};
core.GoToLine = function() { };
$hxClasses["core.GoToLine"] = core.GoToLine;
core.GoToLine.__name__ = ["core","GoToLine"];
core.GoToLine.show = function() {
	if(tabmanager.TabManager.selectedPath != null) Alertify.prompt("Go to Line",function(e,str) {
		cm.Editor.editor.centerOnLine(Std.parseInt(str));
	});
};
core.HaxeHelper = function() { };
$hxClasses["core.HaxeHelper"] = core.HaxeHelper;
core.HaxeHelper.__name__ = ["core","HaxeHelper"];
core.HaxeHelper.getArguments = function(onComplete) {
	if(core.HaxeHelper.haxeArguments != null) onComplete(core.HaxeHelper.haxeArguments); else {
		var data = [];
		core.ProcessHelper.runProcess("haxe",["--help"],null,function(stdout,stderr) {
			var regex = new EReg("-+[A-Z-]+ ","gim");
			regex.map(stderr,function(ereg) {
				var str = ereg.matched(0);
				data.push(HxOverrides.substr(str,0,str.length - 1));
				return str;
			});
			core.HaxeHelper.haxeArguments = data;
			onComplete(core.HaxeHelper.haxeArguments);
		});
	}
};
core.HaxeHelper.getDefines = function(onComplete) {
	if(core.HaxeHelper.haxeDefines != null) onComplete(core.HaxeHelper.haxeDefines); else {
		var data = [];
		core.ProcessHelper.runProcess("haxe",["--help-defines"],null,function(stdout,stderr) {
			var regex = new EReg("[A-Z-]+ +:","gim");
			regex.map(stdout,function(ereg) {
				var str = ereg.matched(0);
				data.push(StringTools.trim(HxOverrides.substr(str,0,str.length - 1)));
				return ereg.matched(0);
			});
			core.HaxeHelper.haxeDefines = data;
			onComplete(core.HaxeHelper.haxeDefines);
		});
	}
};
core.HaxeHelper.getInstalledHaxelibList = function(onComplete) {
	if(core.HaxeHelper.installedHaxelibs != null) onComplete(core.HaxeHelper.installedHaxelibs); else {
		var data = [];
		core.ProcessHelper.runProcess("haxelib",["list"],null,function(stdout,stderr) {
			var regex = new EReg("^[A-Z-]+:","gim");
			regex.map(stdout,function(ereg) {
				var str = ereg.matched(0);
				data.push(HxOverrides.substr(str,0,str.length - 1));
				return str;
			});
			core.HaxeHelper.installedHaxelibs = data;
			onComplete(core.HaxeHelper.installedHaxelibs);
		});
	}
};
core.HaxeHelper.getHaxelibList = function(onComplete) {
	if(core.HaxeHelper.haxelibHaxelibs != null) onComplete(core.HaxeHelper.haxelibHaxelibs); else {
		var data = [];
		core.ProcessHelper.runProcess("haxelib",["search","\"\""],null,function(stdout,stderr) {
			var lines = stdout.split("\n");
			var _g = 0;
			while(_g < lines.length) {
				var line = lines[_g];
				++_g;
				line = StringTools.trim(line);
				if(line.length > 0 && line.indexOf(" ") == -1) data.push(line);
			}
			core.HaxeHelper.haxelibHaxelibs = data;
			onComplete(core.HaxeHelper.haxelibHaxelibs);
		});
	}
};
var haxe = {};
haxe.ds = {};
haxe.ds.StringMap = function() {
	this.h = { };
};
$hxClasses["haxe.ds.StringMap"] = haxe.ds.StringMap;
haxe.ds.StringMap.__name__ = ["haxe","ds","StringMap"];
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	h: null
	,set: function(key,value) {
		this.h["$" + key] = value;
	}
	,get: function(key) {
		return this.h["$" + key];
	}
	,exists: function(key) {
		return this.h.hasOwnProperty("$" + key);
	}
	,remove: function(key) {
		key = "$" + key;
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
	}
	,iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref["$" + i];
		}};
	}
	,__class__: haxe.ds.StringMap
};
core.HaxeLint = function() { };
$hxClasses["core.HaxeLint"] = core.HaxeLint;
core.HaxeLint.__name__ = ["core","HaxeLint"];
core.HaxeLint.load = function() {
	CodeMirror.registerHelper("lint","haxe",function(text) {
		var found = [];
		var path = tabmanager.TabManager.getCurrentDocumentPath();
		if(core.HaxeLint.fileData.exists(path)) {
			var data = core.HaxeLint.fileData.get(path);
			found = found.concat(data);
		}
		if(core.HaxeLint.parserData.exists(path)) {
			var data1 = core.HaxeLint.parserData.get(path);
			found = found.concat(data1);
		}
		return found;
	});
};
core.HaxeLint.updateLinting = function() {
	core.AnnotationRuler.clearErrorMarkers();
	var doc = tabmanager.TabManager.getCurrentDocument();
	if(doc != null && doc.getMode().name == "haxe") {
		try {
			core.HaxeParserProvider.getClassName();
		} catch( e ) {
			console.log(e);
		}
		parser.OutlineHelper.getList(doc.getValue(),tabmanager.TabManager.getCurrentDocumentPath());
		var path = tabmanager.TabManager.getCurrentDocumentPath();
		if(core.HaxeLint.fileData.exists(path)) {
			var data = core.HaxeLint.fileData.get(path);
			var _g = 0;
			while(_g < data.length) {
				var item = data[_g];
				++_g;
				core.AnnotationRuler.addErrorMarker(path,item.from.line,item.from.ch,item.message);
			}
		}
		cm.Editor.editor.setOption("lint",false);
		cm.Editor.editor.setOption("lint",true);
	} else {
		core.OutlinePanel.clearFields();
		core.OutlinePanel.update();
	}
};
core.FunctionScopeType = $hxClasses["core.FunctionScopeType"] = { __ename__ : ["core","FunctionScopeType"], __constructs__ : ["SClass","SStatic","SRegular"] };
core.FunctionScopeType.SClass = ["SClass",0];
core.FunctionScopeType.SClass.toString = $estr;
core.FunctionScopeType.SClass.__enum__ = core.FunctionScopeType;
core.FunctionScopeType.SStatic = ["SStatic",1];
core.FunctionScopeType.SStatic.toString = $estr;
core.FunctionScopeType.SStatic.__enum__ = core.FunctionScopeType;
core.FunctionScopeType.SRegular = ["SRegular",2];
core.FunctionScopeType.SRegular.toString = $estr;
core.FunctionScopeType.SRegular.__enum__ = core.FunctionScopeType;
core.HaxeParserProvider = function() { };
$hxClasses["core.HaxeParserProvider"] = core.HaxeParserProvider;
core.HaxeParserProvider.__name__ = ["core","HaxeParserProvider"];
core.HaxeParserProvider.processClass = function(type,pos) {
	var found = false;
	core.HaxeParserProvider.currentClass = type.name;
	core.HaxeParserProvider.currentFunctionScopeType = core.FunctionScopeType.SClass;
	var _g1 = 0;
	var _g = type.data.length;
	try {
		while(_g1 < _g) {
			var i = _g1++;
			if(pos > type.data[i].pos.min && pos < type.data[i].pos.max) {
				{
					var _g2 = type.data[i].kind;
					switch(_g2[1]) {
					case 1:
						var f = _g2[2];
						core.HaxeParserProvider.currentFunctionScopeType = core.HaxeParserProvider.getFunctionScope(type.data[i],f);
						if(pos > f.expr.pos.min && pos < f.expr.pos.max) {
							if(core.HaxeParserProvider.processExpression(f.expr.expr,pos)) throw "__break__";
						}
						break;
					case 0:
						var e = _g2[3];
						var t = _g2[2];
						core.HaxeParserProvider.currentFunctionScopeType = core.FunctionScopeType.SClass;
						break;
					case 2:
						var e1 = _g2[5];
						var t1 = _g2[4];
						var set = _g2[3];
						var get = _g2[2];
						core.HaxeParserProvider.currentFunctionScopeType = core.FunctionScopeType.SClass;
						break;
					}
				}
				found = true;
				throw "__break__";
			}
		}
	} catch( e ) { if( e != "__break__" ) throw e; }
	return found;
};
core.HaxeParserProvider.processExpression = function(expr,pos) {
	var found = false;
	switch(expr[1]) {
	case 16:
		var b = expr[4];
		var e = expr[3];
		var econd = expr[2];
		break;
	case 10:
		var vars = expr[2];
		break;
	case 22:
		var e1 = expr[2];
		break;
	case 9:
		var e2 = expr[4];
		var postFix = expr[3];
		var op = expr[2];
		break;
	case 18:
		var catches = expr[3];
		var e3 = expr[2];
		break;
	case 23:
		var e4 = expr[2];
		break;
	case 27:
		var eelse = expr[4];
		var eif = expr[3];
		var econd1 = expr[2];
		break;
	case 17:
		var edef = expr[4];
		var cases = expr[3];
		var e5 = expr[2];
		break;
	case 19:
		var e6 = expr[2];
		break;
	case 4:
		var e7 = expr[2];
		break;
	case 5:
		var fields = expr[2];
		break;
	case 8:
		var params = expr[3];
		var t = expr[2];
		break;
	case 29:
		var e8 = expr[3];
		var s = expr[2];
		break;
	case 14:
		var e21 = expr[3];
		var e11 = expr[2];
		break;
	case 15:
		var eelse1 = expr[4];
		var eif1 = expr[3];
		var econd2 = expr[2];
		break;
	case 11:
		var f = expr[3];
		var name = expr[2];
		break;
	case 13:
		var expr1 = expr[3];
		var it = expr[2];
		break;
	case 3:
		var field = expr[3];
		var e9 = expr[2];
		core.HaxeParserProvider.processExpression(e9.expr,pos);
		break;
	case 26:
		var t1 = expr[2];
		break;
	case 25:
		var isCall = expr[3];
		var e10 = expr[2];
		break;
	case 21:
		break;
	case 0:
		var c = expr[2];
		switch(c[1]) {
		case 3:
			var s1 = c[2];
			break;
		default:
		}
		break;
	case 28:
		var t2 = expr[3];
		var e12 = expr[2];
		break;
	case 24:
		var t3 = expr[3];
		var e13 = expr[2];
		break;
	case 7:
		var params1 = expr[3];
		var e14 = expr[2];
		core.HaxeParserProvider.processExpression(e14.expr,pos);
		var _g = 0;
		while(_g < params1.length) {
			var param = params1[_g];
			++_g;
			core.HaxeParserProvider.processExpression(param.expr,pos);
		}
		break;
	case 20:
		break;
	case 12:
		var exprs = expr[2];
		var _g1 = 0;
		while(_g1 < exprs.length) {
			var e15 = exprs[_g1];
			++_g1;
			if(pos > e15.pos.max) {
			}
			if(pos > e15.pos.min && pos <= e15.pos.max) {
				if(core.HaxeParserProvider.processExpression(e15.expr,pos)) {
					found = true;
					break;
				}
			}
		}
		break;
	case 2:
		var e22 = expr[4];
		var e16 = expr[3];
		var op1 = expr[2];
		break;
	case 6:
		var values = expr[2];
		break;
	case 1:
		var e23 = expr[3];
		var e17 = expr[2];
		break;
	}
	return found;
};
core.HaxeParserProvider.getFunctionScope = function(field,f) {
	var functionScopeType = core.FunctionScopeType.SRegular;
	var access = field.access;
	var _g = 0;
	while(_g < access.length) {
		var accessType = access[_g];
		++_g;
		switch(accessType[1]) {
		case 0:
			break;
		case 2:
			functionScopeType = core.FunctionScopeType.SStatic;
			break;
		case 6:
			break;
		case 5:
			break;
		case 4:
			break;
		case 3:
			break;
		case 1:
			break;
		}
	}
	return functionScopeType;
};
core.HaxeParserProvider.getClassName = function() {
	var cm1 = cm.Editor.editor;
	var pos = cm1.indexFromPos(cm1.getCursor());
	var doc = tabmanager.TabManager.getCurrentDocument();
	var data = doc.getValue();
	var path = tabmanager.TabManager.getCurrentDocumentPath();
	var ast = core.HaxeParserProvider.parse(data,path);
	if(ast != null) {
		var classPackage = ast.pack;
		var _g = 0;
		var _g1 = ast.decls;
		try {
			while(_g < _g1.length) {
				var decl = _g1[_g];
				++_g;
				{
					var _g2 = decl.decl;
					switch(_g2[1]) {
					case 3:
						var mode = _g2[3];
						var sl = _g2[2];
						core.HaxeParserProvider.currentClass = null;
						if(core.HaxeParserProvider.processImport(sl,mode,pos)) throw "__break__";
						break;
					case 5:
						var path1 = _g2[2];
						core.HaxeParserProvider.currentClass = null;
						break;
					case 2:
						var data1 = _g2[2];
						core.HaxeParserProvider.currentClass = null;
						break;
					case 0:
						var data2 = _g2[2];
						if(core.HaxeParserProvider.processClass(data2,pos)) throw "__break__";
						break;
					case 1:
						var data3 = _g2[2];
						core.HaxeParserProvider.currentClass = null;
						break;
					case 4:
						var data4 = _g2[2];
						core.HaxeParserProvider.currentClass = null;
						break;
					}
				}
			}
		} catch( e ) { if( e != "__break__" ) throw e; }
	} else console.log("ast is null");
};
core.HaxeParserProvider.parse = function(data,path) {
	var input = byte.js._ByteData.ByteData_Impl_.ofString(data);
	var parser = new haxeparser.HaxeParser(input,path);
	var data1 = [];
	core.HaxeLint.parserData.set(path,data1);
	var ast = null;
	try {
		ast = parser.parse();
	} catch( $e0 ) {
		if( js.Boot.__instanceof($e0,hxparse.NoMatch) ) {
			var e = $e0;
			var pos = e.pos.getLinePosition(input);
			var info = { from : { line : pos.lineMin - 1, ch : pos.posMin}, to : { line : pos.lineMax - 1, ch : pos.posMax}, message : "Parser error:\nUnexpected " + Std.string(e.token.tok), severity : "warning"};
			data1.push(info);
		} else if( js.Boot.__instanceof($e0,hxparse.Unexpected) ) {
			var e1 = $e0;
			var pos1 = e1.pos.getLinePosition(input);
			var info1 = { from : { line : pos1.lineMin - 1, ch : pos1.posMin}, to : { line : pos1.lineMax - 1, ch : pos1.posMax}, message : "Parser error:\nUnexpected " + Std.string(e1.token.tok), severity : "warning"};
			data1.push(info1);
		} else {
		var e2 = $e0;
		if(e2 != null && e2.pos) {
			var cm1 = cm.Editor.editor;
			var message = "Parser error:\n";
			{
				var _g = e2.msg;
				switch(Type.enumIndex(_g)) {
				case 0:
					message += "Missing Semicolon";
					break;
				case 1:
					message += "Missing Type";
					break;
				case 2:
					message += "Duplicate Default";
					break;
				case 3:
					var s = _g[2];
					message += s;
					break;
				}
			}
			var info2 = { from : cm1.posFromIndex(e2.pos.min), to : cm1.posFromIndex(e2.pos.max), message : message, severity : "warning"};
			data1.push(info2);
		}
		}
	}
	return ast;
};
core.HaxeParserProvider.processImport = function(path,mode,currentPosition) {
	var found = false;
	var _g1 = 0;
	var _g = path.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(currentPosition > path[i].pos.min && currentPosition < path[i].pos.max) {
			found = true;
			break;
		}
	}
	return found;
};
core.HaxeServer = function() { };
$hxClasses["core.HaxeServer"] = core.HaxeServer;
core.HaxeServer.__name__ = ["core","HaxeServer"];
core.HaxeServer.check = function() {
	var socket = js.Node.require("net").connect(5000,"localhost");
	socket.on("error",function(e) {
		console.log("Haxe server is not found at localhost:5000");
	});
	socket.on("close",function(e1) {
		if(e1) core.HaxeServer.start();
	});
};
core.HaxeServer.start = function() {
	console.log("Starting new Haxe server at localhost:5000");
	core.HaxeServer.haxeServer = core.ProcessHelper.runPersistentProcess("haxe",["--wait","5000"],function(code,stdout,stderr) {
		console.log(stdout);
		console.log(stderr);
	});
	var $window = nodejs.webkit.Window.get();
	$window.on("close",function(e) {
		core.HaxeServer.terminate();
		$window.close();
	});
};
core.HaxeServer.terminate = function() {
	if(core.HaxeServer.haxeServer != null) core.HaxeServer.haxeServer.kill();
};
core.Helper = function() { };
$hxClasses["core.Helper"] = core.Helper;
core.Helper.__name__ = ["core","Helper"];
core.Helper.debounce = function(type,onComplete,time_ms) {
	var timer = core.Helper.timers.get(type);
	if(timer != null) timer.stop();
	timer = new haxe.Timer(time_ms);
	timer.run = function() {
		timer.stop();
		onComplete();
	};
	core.Helper.timers.set(type,timer);
};
core.Utils = function() { };
$hxClasses["core.Utils"] = core.Utils;
core.Utils.__name__ = ["core","Utils"];
core.Utils.prepare = function() {
	var platform = js.Node.require("os").platform();
	core.Utils.os = 3;
	if(platform == "linux") core.Utils.os = 1; else if(platform == "darwin") core.Utils.os = 2; else if(platform.indexOf("win") == 0) core.Utils.os = 0;
};
core.Hotkeys = function() { };
$hxClasses["core.Hotkeys"] = core.Hotkeys;
core.Hotkeys.__name__ = ["core","Hotkeys"];
core.Hotkeys.prepare = function() {
	core.Hotkeys.pathToData = js.Node.require("path").join("core","config","hotkeys.json");
	core.Hotkeys.parseData();
	var options = { };
	options.interval = 1500;
	js.Node.require("fs").watchFile(core.Hotkeys.pathToData,options,function(curr,prev) {
		if(curr.mtime != prev.mtime) {
			core.Hotkeys.parseData();
			core.Hotkeys.hotkeys = new Array();
			var $it0 = core.Hotkeys.commandMap.keys();
			while( $it0.hasNext() ) {
				var key = $it0.next();
				core.Hotkeys.addHotkey(key);
			}
		}
	});
	window.addEventListener("keyup",function(e) {
		var _g = 0;
		var _g1 = core.Hotkeys.hotkeys;
		while(_g < _g1.length) {
			var hotkey = _g1[_g];
			++_g;
			if(hotkey.keyCode == e.keyCode && hotkey.ctrl == (e.ctrlKey || core.Hotkeys.commandKey && e.metaKey) && hotkey.shift == e.shiftKey && hotkey.alt == e.altKey) hotkey.onKeyDown();
		}
	});
};
core.Hotkeys.add = function(menuItem,hotkeyText,span,onKeyDown) {
	core.Hotkeys.commandMap.set(menuItem,onKeyDown);
	if(span != null) core.Hotkeys.spanMap.set(menuItem,span);
	core.Hotkeys.addHotkey(menuItem,hotkeyText);
	if(menuItem == "Source->Show Code Completion") {
		var hotkey = core.Hotkeys.parseHotkey(hotkeyText);
		cm.Editor.editor.on("keypress",function(cm,e) {
			if(hotkey.keyCode == e.keyCode && hotkey.ctrl == (e.ctrlKey || core.Hotkeys.commandKey && e.metaKey) && hotkey.shift == e.shiftKey && hotkey.alt == e.altKey) e.preventDefault();
		});
	}
};
core.Hotkeys.addHotkey = function(menuItem,hotkeyText) {
	if(hotkeyText == null) hotkeyText = "";
	if(Object.prototype.hasOwnProperty.call(core.Hotkeys.data,menuItem)) hotkeyText = Reflect.field(core.Hotkeys.data,menuItem); else {
		core.Hotkeys.data[menuItem] = hotkeyText;
		var data = tjson.TJSON.encode(core.Hotkeys.data,"fancy");
		js.Node.require("fs").writeFileSync(core.Hotkeys.pathToData,data,"utf8");
	}
	var keyCode = null;
	var ctrl = null;
	var shift = null;
	var alt = null;
	if(hotkeyText != "") {
		var hotkey = core.Hotkeys.parseHotkey(hotkeyText);
		if(hotkey.keyCode != 0) {
			keyCode = hotkey.keyCode;
			ctrl = hotkey.ctrl;
			shift = hotkey.shift;
			alt = hotkey.alt;
		} else window.console.warn("can't assign hotkey " + hotkeyText + " for " + menuItem);
		if(core.Hotkeys.spanMap.exists(menuItem)) {
			if(core.Hotkeys.commandKey) hotkeyText = StringTools.replace(hotkeyText,"Ctrl","Cmd");
			core.Hotkeys.spanMap.get(menuItem).innerText = hotkeyText;
		}
		if(keyCode != null) {
			hotkey.onKeyDown = core.Hotkeys.commandMap.get(menuItem);
			core.Hotkeys.hotkeys.push(hotkey);
		}
	}
};
core.Hotkeys.parseData = function() {
	var options = { };
	options.encoding = "utf8";
	core.Hotkeys.data = tjson.TJSON.parse(js.Node.require("fs").readFileSync(core.Hotkeys.pathToData,options));
};
core.Hotkeys.parseHotkey = function(hotkey) {
	var keys = hotkey.split("-");
	var ctrl = false;
	var shift = false;
	var alt = false;
	var keyCode = 0;
	var _g = 0;
	while(_g < keys.length) {
		var key = keys[_g];
		++_g;
		var _g1 = key.toLowerCase();
		switch(_g1) {
		case "ctrl":
			ctrl = true;
			break;
		case "shift":
			shift = true;
			break;
		case "alt":
			alt = true;
			break;
		case "f1":
			keyCode = 112;
			break;
		case "f2":
			keyCode = 113;
			break;
		case "f3":
			keyCode = 114;
			break;
		case "f4":
			keyCode = 115;
			break;
		case "f5":
			keyCode = 116;
			break;
		case "f6":
			keyCode = 117;
			break;
		case "f7":
			keyCode = 118;
			break;
		case "f8":
			keyCode = 119;
			break;
		case "f9":
			keyCode = 120;
			break;
		case "f10":
			keyCode = 121;
			break;
		case "f11":
			keyCode = 122;
			break;
		case "f12":
			keyCode = 123;
			break;
		case "tab":
			keyCode = 9;
			break;
		case "enter":
			keyCode = 13;
			break;
		case "esc":
			keyCode = 27;
			break;
		case "space":
			keyCode = 32;
			break;
		case "+":
			keyCode = 187;
			break;
		case "":
			keyCode = 189;
			break;
		default:
			if(key.length == 1) keyCode = HxOverrides.cca(key,0);
		}
	}
	return { keyCode : keyCode, ctrl : ctrl, shift : shift, alt : alt};
};
core.ImportDefinition = function() { };
$hxClasses["core.ImportDefinition"] = core.ImportDefinition;
core.ImportDefinition.__name__ = ["core","ImportDefinition"];
core.ImportDefinition.searchImport = function(data,path) {
	var ast = parser.ClassParser.parse(data,path);
	var cm1 = cm.Editor.editor;
	var token = cm1.getTokenAt(cm1.getCursor());
	var topLevelClassList = [];
	var mode = null;
	var selectedText = null;
	var from = null;
	var to = null;
	if(cm1.somethingSelected()) {
		selectedText = cm1.getSelection();
		if(selectedText.indexOf(".") != -1) {
			mode = "selection";
			var selection = cm1.listSelections()[0];
			from = selection.anchor;
			to = selection.head;
			cm1.setSelection(to);
		}
	} else if(token.type != null && token.string != "") mode = "token";
	if(mode != null) {
		topLevelClassList = core.Completion.getClassList().topLevelClassList;
		switch(mode) {
		case "token":
			core.ImportDefinition.checkImport(topLevelClassList,token);
			break;
		case "selection":
			core.ImportDefinition.searchImportByText(topLevelClassList,selectedText,from,to);
			break;
		default:
		}
	} else Alertify.log("Place cursor on class name or select full class name to import it (for instance, you can select 'flash.display.Sprite' and it can be imported and selected text will be replaced to 'Sprite'");
};
core.ImportDefinition.searchImportByText = function(topLevelClassList,text,from,to,suggestImport) {
	if(suggestImport == null) suggestImport = true;
	var cm1 = cm.Editor.editor;
	var found = false;
	var alreadyAdded = false;
	var _g = 0;
	var _g1 = [parser.ClassParser.importsList,parser.ClassParser.haxeStdImports];
	while(_g < _g1.length) {
		var list = _g1[_g];
		++_g;
		if(HxOverrides.indexOf(list,text,0) != -1) {
			found = true;
			break;
		}
	}
	var _g2 = 0;
	while(_g2 < topLevelClassList.length) {
		var topLevelClass = topLevelClassList[_g2];
		++_g2;
		if(topLevelClass.fullName == text) {
			alreadyAdded = true;
			break;
		}
	}
	if(!alreadyAdded) {
		if(found) core.ImportDefinition.importClass(cm1,text,from,to); else if(suggestImport) core.Completion.showImportDefinition([text],from,to);
	} else core.ImportDefinition.updateImport(cm1,text.split(".").pop(),from,to);
};
core.ImportDefinition.checkImport = function(topLevelClassList,token) {
	var searchPattern = "." + token.string;
	var foundImports = [];
	var foundAtTopLevel = false;
	var alreadyImported = [];
	var _g = 0;
	while(_g < topLevelClassList.length) {
		var topLevelClass = topLevelClassList[_g];
		++_g;
		if(topLevelClass.name == token.string) {
			foundAtTopLevel = true;
			alreadyImported.push(topLevelClass.fullName);
			break;
		}
	}
	if(!foundAtTopLevel) {
		var found = false;
		var _g1 = 0;
		var _g11 = [parser.ClassParser.importsList,parser.ClassParser.haxeStdImports];
		while(_g1 < _g11.length) {
			var list = _g11[_g1];
			++_g1;
			var _g2 = 0;
			while(_g2 < list.length) {
				var item = list[_g2];
				++_g2;
				if(StringTools.endsWith(item,searchPattern)) {
					console.log(item);
					var _g3 = 0;
					while(_g3 < topLevelClassList.length) {
						var topLevelClass1 = topLevelClassList[_g3];
						++_g3;
						if(topLevelClass1.fullName == item) {
							found = true;
							break;
						}
					}
					if(!found) foundImports.push(item); else alreadyImported.push(item);
				}
			}
		}
	}
	if(foundAtTopLevel) Alertify.log("'" + token.string + "' doesn't needs to be imported, since it's already found at top level"); else if(foundImports.length > 0) core.Completion.showImportDefinition(foundImports); else {
		var info = "Unable to find additional imports for '" + token.string + "'.";
		if(alreadyImported.length > 0) info += " Already imported:\n" + Std.string(alreadyImported);
		Alertify.log(info);
	}
};
core.ImportDefinition.importClassHint = function(from,to,cm,data,completion) {
	core.ImportDefinition.importClass(cm,completion.text,from,to);
};
core.ImportDefinition.importClass = function(cm,text,from,to) {
	var value = tabmanager.TabManager.getCurrentDocument().getValue();
	var filePackage = parser.RegexParser.getFilePackage(value);
	if(from != null && to != null) core.ImportDefinition.updateImport(cm,text,from,to);
	var pos;
	if(filePackage.filePackage != null) {
		pos = cm.posFromIndex(filePackage.pos);
		pos.ch = 0;
		pos.line++;
	} else pos = cm.posFromIndex(0);
	cm.replaceRange("import " + text + ";\n",pos,pos);
	Alertify.success(text + " definition successfully imported");
};
core.ImportDefinition.updateImport = function(cm,text,from,to) {
	cm.replaceRange(text.split(".").pop(),from,to);
};
core.LineWidget = function(type,name,parameters,retType,description,currentParameter,pos) {
	var _this = window.document;
	this.element = _this.createElement("div");
	this.element.className = "lint-error";
	var spanText;
	var _this1 = window.document;
	spanText = _this1.createElement("span");
	spanText.textContent = type + " " + name + "(";
	this.element.appendChild(spanText);
	var parametersSpan;
	var _this2 = window.document;
	parametersSpan = _this2.createElement("span");
	spanText.appendChild(parametersSpan);
	this.parametersSpanElements = [];
	var _g1 = 0;
	var _g = parameters.length;
	while(_g1 < _g) {
		var i = _g1++;
		var spanText2;
		var _this3 = window.document;
		spanText2 = _this3.createElement("span");
		spanText2.textContent = parameters[i];
		if(i == currentParameter) spanText2.className = "selectedParameter";
		parametersSpan.appendChild(spanText2);
		this.parametersSpanElements.push(spanText2);
		if(i != parameters.length - 1) {
			var spanCommaText;
			var _this4 = window.document;
			spanCommaText = _this4.createElement("span");
			spanCommaText.textContent = ", ";
			parametersSpan.appendChild(spanCommaText);
		}
	}
	this.updateParameters(currentParameter);
	var spanText3;
	var _this5 = window.document;
	spanText3 = _this5.createElement("span");
	spanText3.textContent = "):" + retType;
	this.element.appendChild(spanText3);
	if(description != null) {
		this.element.appendChild((function($this) {
			var $r;
			var _this6 = window.document;
			$r = _this6.createElement("br");
			return $r;
		}(this)));
		var spanDescription;
		var _this7 = window.document;
		spanDescription = _this7.createElement("span");
		spanDescription.textContent = description;
		this.element.appendChild(spanDescription);
	}
	this.widget = cm.Editor.editor.addLineWidget(pos.line,this.element,{ coverGutter : false, noHScroll : true});
};
$hxClasses["core.LineWidget"] = core.LineWidget;
core.LineWidget.__name__ = ["core","LineWidget"];
core.LineWidget.prototype = {
	element: null
	,parametersSpanElements: null
	,widget: null
	,updateParameters: function(currentParameter) {
		var _g1 = 0;
		var _g = this.parametersSpanElements.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(i == currentParameter) this.parametersSpanElements[i].className = "selectedParameter"; else this.parametersSpanElements[i].className = "";
		}
	}
	,getWidget: function() {
		return this.widget;
	}
	,__class__: core.LineWidget
};
core.MenuCommands = function() { };
$hxClasses["core.MenuCommands"] = core.MenuCommands;
core.MenuCommands.__name__ = ["core","MenuCommands"];
core.MenuCommands.add = function() {
	var $window = nodejs.webkit.Window.get();
	menu.BootstrapMenu.getMenu("View").addMenuItem("Zoom In",2,function() {
		$window.zoomLevel += 1;
	},"Ctrl-Shift-+");
	menu.BootstrapMenu.getMenu("View").addMenuItem("Zoom Out",3,function() {
		$window.zoomLevel -= 1;
	},"Ctrl-Shift--");
	menu.BootstrapMenu.getMenu("View").addMenuItem("Reset",4,function() {
		$window.zoomLevel = 0;
	},"Ctrl-Shift-0");
	menu.BootstrapMenu.getMenu("View",3).addMenuItem("Toggle Fullscreen",1,function() {
		$window.toggleFullscreen();
	},"F11");
	menu.BootstrapMenu.getMenu("Help").addMenuItem("changelog",1,(function(f,a1) {
		return function() {
			return f(a1);
		};
	})(tabmanager.TabManager.openFileInNewTab,js.Node.require("path").join("core","changes.md")));
	menu.BootstrapMenu.getMenu("Developer Tools",100).addMenuItem("Reload IDE",1,$bind($window,$window.reloadIgnoringCache),"Ctrl-Shift-R");
	menu.BootstrapMenu.getMenu("Developer Tools").addMenuItem("Compile plugins and reload IDE",2,function() {
		HIDE.compilePlugins(function() {
			$window.reloadIgnoringCache();
		},function(data) {
		});
	},"Shift-F5");
	menu.BootstrapMenu.getMenu("Developer Tools").addMenuItem("Console",3,$bind($window,$window.showDevTools));
	menu.BootstrapMenu.getMenu("Help").addMenuItem("Show code editor key bindings",1,(function(f1,a11) {
		return function() {
			return f1(a11);
		};
	})(tabmanager.TabManager.openFileInNewTab,js.Node.require("path").join("core","bindings.txt")));
	menu.BootstrapMenu.getMenu("Help").addMenuItem("View HIDE repository on GitHub",2,function() {
		return nodejs.webkit.Shell.openExternal("https://github.com/as3boyan/HIDE");
	});
	menu.BootstrapMenu.getMenu("Help").addMenuItem("Report issue/request feature at GitHub issue tracker",3,function() {
		return nodejs.webkit.Shell.openExternal("https://github.com/as3boyan/HIDE/issues/new");
	});
	menu.BootstrapMenu.getMenu("Help").addMenuItem("Open Haxe nightly build download URL",4,function() {
		var serverUrl = "http://hxbuilds.s3-website-us-east-1.amazonaws.com/builds/haxe/";
		var target;
		var _g = core.Utils.os;
		switch(_g) {
		case 0:
			target = "windows";
			break;
		case 1:
			target = "linux64";
			break;
		case 2:
			target = "mac";
			break;
		default:
			throw "Utils class was not able to detect OS";
		}
		nodejs.webkit.Shell.openExternal(serverUrl + target + "/haxe_latest.tar.gz");
	});
	menu.BootstrapMenu.getMenu("Help").addMenuItem("About HIDE...",5,function() {
		return HIDE.openPageInNewWindow(null,"about.html",{ toolbar : false});
	});
	core.Hotkeys.add("Tab Manager->Show Next Tab","Ctrl-Tab",null,tabmanager.TabManager.showNextTab);
	core.Hotkeys.add("Tab Manager->Show Previous Tab","Ctrl-Shift-Tab",null,tabmanager.TabManager.showPreviousTab);
	core.Hotkeys.add("Tab Manager->Close File","Ctrl-W",null,tabmanager.TabManager.closeActiveTab);
	menu.BootstrapMenu.getMenu("File",1).addMenuItem("New Project...",1,newprojectdialog.NewProjectDialog.show,"Ctrl-Shift-N");
	menu.BootstrapMenu.getMenu("File").addMenuItem("New File...",2,tabmanager.TabManager.createFileInNewTab,"Ctrl-N");
	menu.BootstrapMenu.getMenu("File").addSeparator();
	menu.BootstrapMenu.getMenu("File").addMenuItem("Open Project...",3,function() {
		return openproject.OpenProject.openProject(null,true);
	});
	menu.BootstrapMenu.getMenu("File").addSubmenu("Open Recent Project");
	menu.BootstrapMenu.getMenu("File").addMenuItem("Close Project",4,openproject.OpenProject.closeProject);
	menu.BootstrapMenu.getMenu("File").addMenuItem("Open File...",5,openproject.OpenProject.openProject,"Ctrl-O");
	menu.BootstrapMenu.getMenu("File").addSubmenu("Open Recent File");
	menu.BootstrapMenu.getMenu("File").addSeparator();
	menu.BootstrapMenu.getMenu("File").addMenuItem("Save",6,tabmanager.TabManager.saveActiveFile,"Ctrl-S");
	menu.BootstrapMenu.getMenu("File").addMenuItem("Save As...",7,tabmanager.TabManager.saveActiveFileAs,"Ctrl-Shift-S");
	menu.BootstrapMenu.getMenu("File").addMenuItem("Save All",8,tabmanager.TabManager.saveAll);
	menu.BootstrapMenu.getMenu("File").addSeparator();
	menu.BootstrapMenu.getMenu("File").addMenuItem("Exit",9,nodejs.webkit.App.closeAllWindows);
	nodejs.webkit.Window.get().on("close",tabmanager.TabManager.saveAll);
	menu.BootstrapMenu.getMenu("Options").addMenuItem("Open haxelib manager",1,dialogs.DialogManager.showHaxelibManagerDialog);
	menu.BootstrapMenu.getMenu("Options").addMenuItem("Open settings",1,(function(f2,a12) {
		return function() {
			return f2(a12);
		};
	})(tabmanager.TabManager.openFileInNewTab,js.Node.require("path").join("core","config","settings.json")));
	menu.BootstrapMenu.getMenu("Options").addMenuItem("Open stylesheet",1,(function(f3,a13) {
		return function() {
			return f3(a13);
		};
	})(tabmanager.TabManager.openFileInNewTab,js.Node.require("path").join("core",watchers.SettingsWatcher.settings.theme)));
	menu.BootstrapMenu.getMenu("Options").addMenuItem("Open editor configuration file",1,(function(f4,a14) {
		return function() {
			return f4(a14);
		};
	})(tabmanager.TabManager.openFileInNewTab,js.Node.require("path").join("core","config","editor.json")));
	menu.BootstrapMenu.getMenu("Options").addMenuItem("Open templates folder",1,(function(f5,a15,a2) {
		return function() {
			return f5(a15,a2);
		};
	})(filetree.FileTree.load,"templates",js.Node.require("path").join("core","templates")));
	menu.BootstrapMenu.getMenu("Options").addMenuItem("Open localization file",1,(function(f6,a16) {
		return function() {
			return f6(a16);
		};
	})(tabmanager.TabManager.openFileInNewTab,js.Node.require("path").join("core","locale",watchers.SettingsWatcher.settings.locale)));
	menu.BootstrapMenu.getMenu("Options").addMenuItem("Open hotkey configuration file",1,(function(f7,a17) {
		return function() {
			return f7(a17);
		};
	})(tabmanager.TabManager.openFileInNewTab,js.Node.require("path").join("core","config","hotkeys.json")));
	menu.BootstrapMenu.getMenu("Options",90).addMenuItem("Open snippets configuration file",1,(function(f8,a18) {
		return function() {
			return f8(a18);
		};
	})(tabmanager.TabManager.openFileInNewTab,js.Node.require("path").join("core","config","snippets.json")));
	menu.BootstrapMenu.getMenu("Options").addMenuItem("Configure Haxe SDK",100,parser.ClasspathWalker.showHaxeDirectoryDialog);
	menu.BootstrapMenu.getMenu("Edit",2).addMenuItem("Undo",1,function() {
		return cm.Editor.editor.execCommand("undo");
	});
	menu.BootstrapMenu.getMenu("Edit").addMenuItem("Redo",1,function() {
		return cm.Editor.editor.execCommand("redo");
	});
	menu.BootstrapMenu.getMenu("Edit").addSeparator();
	menu.BootstrapMenu.getMenu("Edit").addMenuItem("Cut",1,function() {
		nodejs.webkit.Clipboard.get().set(cm.Editor.editor.getSelection());
		cm.Editor.editor.replaceSelection("");
	});
	menu.BootstrapMenu.getMenu("Edit").addMenuItem("Copy",1,function() {
		nodejs.webkit.Clipboard.get().set(cm.Editor.editor.getSelection());
	});
	menu.BootstrapMenu.getMenu("Edit").addMenuItem("Paste",1,function() {
		cm.Editor.editor.replaceSelection(nodejs.webkit.Clipboard.get().get());
	});
	menu.BootstrapMenu.getMenu("Edit").addSeparator();
	menu.BootstrapMenu.getMenu("Edit").addMenuItem("Find...",1,function() {
		return cm.Editor.editor.execCommand("find");
	});
	menu.BootstrapMenu.getMenu("Edit").addMenuItem("Replace...",1,function() {
		return cm.Editor.editor.execCommand("replace");
	});
	menu.BootstrapMenu.getMenu("Navigate",4).addMenuItem("Go to Line",2,core.GoToLine.show,"Ctrl-G");
	menu.BootstrapMenu.getMenu("Navigate").addMenuItem("Open File",3,function() {
		haxe.Timer.delay(function() {
			core.Completion.showFileList();
		},10);
	},"Ctrl-Shift-O");
	menu.BootstrapMenu.getMenu("Source").addMenuItem("Show Class List",4,core.Completion.showClassList,"Ctrl-Shift-P");
	menu.BootstrapMenu.getMenu("Source").addMenuItem("Show Code Completion",5,function() {
		return cm.Editor.triggerCompletion(cm.Editor.editor);
	},"Ctrl-Space");
	menu.BootstrapMenu.getMenu("Source").addMenuItem("Toggle Comment",5,function() {
		return cm.Editor.editor.execCommand("toggleComment");
	},"Ctrl-Q");
	menu.BootstrapMenu.getMenu("Source").addMenuItem("Import Class Definition",6,function() {
		var selectedPath = tabmanager.TabManager.getCurrentDocumentPath();
		if(selectedPath != null) core.ImportDefinition.searchImport(tabmanager.TabManager.getCurrentDocument().getValue(),selectedPath);
	},"Ctrl-Shift-1");
	menu.BootstrapMenu.getMenu("Project",80).addMenuItem("Run",1,core.RunProject.runProject,"F5");
	menu.BootstrapMenu.getMenu("Project").addMenuItem("Build",2,core.RunProject.buildProject,"F8");
	menu.BootstrapMenu.getMenu("Project").addMenuItem("Clean",3,core.RunProject.cleanProject,"Shift-F8");
	menu.BootstrapMenu.getMenu("Project").addMenuItem("Set This Hxml As Project Build File",4,core.RunProject.setHxmlAsProjectBuildFile);
	menu.BootstrapMenu.getMenu("Project").addSubmenu("Build Recent Project");
	menu.BootstrapMenu.getMenu("Project").addMenuItem("Project Options...",5,function() {
		if(projectaccess.ProjectAccess.path != null) dialogs.DialogManager.showProjectOptions(); else Alertify.error("Open or create project first");
	});
};
core.OutlinePanel = function() { };
$hxClasses["core.OutlinePanel"] = core.OutlinePanel;
core.OutlinePanel.__name__ = ["core","OutlinePanel"];
core.OutlinePanel.update = function() {
	new $("#outline").jqxTree({ source : core.OutlinePanel.source});
	new $("#outline").dblclick(function(event) {
		var item = new $("#outline").jqxTree("getSelectedItem");
		var value = item.value;
		if(value != null) {
			var line = cm.Editor.editor.posFromIndex(value).line;
			cm.Editor.editor.centerOnLine(line);
		}
	});
};
core.OutlinePanel.addField = function(item) {
	core.OutlinePanel.source.push(item);
};
core.OutlinePanel.clearFields = function() {
	core.OutlinePanel.source = [];
};
var nodejs = {};
nodejs.webkit = {};
nodejs.webkit.$ui = function() { };
$hxClasses["nodejs.webkit.$ui"] = nodejs.webkit.$ui;
nodejs.webkit.$ui.__name__ = ["nodejs","webkit","$ui"];
core.PreserveWindowState = function() { };
$hxClasses["core.PreserveWindowState"] = core.PreserveWindowState;
core.PreserveWindowState.__name__ = ["core","PreserveWindowState"];
core.PreserveWindowState.init = function() {
	core.PreserveWindowState.initWindowState();
	core.PreserveWindowState.window.on("maximize",function() {
		core.PreserveWindowState.isMaximizationEvent = true;
		core.PreserveWindowState.currWinMode = "maximized";
	});
	core.PreserveWindowState.window.on("unmaximize",function() {
		core.PreserveWindowState.currWinMode = "normal";
		core.PreserveWindowState.restoreWindowState();
	});
	core.PreserveWindowState.window.on("minimize",function() {
		core.PreserveWindowState.currWinMode = "minimized";
	});
	core.PreserveWindowState.window.on("restore",function() {
		core.PreserveWindowState.currWinMode = "normal";
	});
	core.PreserveWindowState.window.window.addEventListener("resize",function(e) {
		if(core.PreserveWindowState.resizeTimeout != null) core.PreserveWindowState.resizeTimeout.stop();
		core.PreserveWindowState.resizeTimeout = new haxe.Timer(500);
		core.PreserveWindowState.resizeTimeout.run = function() {
			if(core.PreserveWindowState.isMaximizationEvent) core.PreserveWindowState.isMaximizationEvent = false; else if(core.PreserveWindowState.currWinMode == "maximized") core.PreserveWindowState.currWinMode = "normal";
			core.PreserveWindowState.resizeTimeout.stop();
			core.PreserveWindowState.dumpWindowState();
		};
	},false);
	core.PreserveWindowState.window.on("close",function(e1) {
		core.PreserveWindowState.saveWindowState();
		core.PreserveWindowState.window.close(true);
	});
};
core.PreserveWindowState.initWindowState = function() {
	var windowState = js.Browser.getLocalStorage().getItem("windowState");
	if(windowState != null) core.PreserveWindowState.winState = js.Node.parse(windowState);
	if(core.PreserveWindowState.winState != null) {
		core.PreserveWindowState.currWinMode = core.PreserveWindowState.winState.mode;
		if(core.PreserveWindowState.currWinMode == "maximized") core.PreserveWindowState.window.maximize(); else core.PreserveWindowState.restoreWindowState();
	} else {
		core.PreserveWindowState.currWinMode = "normal";
		core.PreserveWindowState.dumpWindowState();
	}
};
core.PreserveWindowState.dumpWindowState = function() {
	if(core.PreserveWindowState.winState == null) core.PreserveWindowState.winState = { };
	if(core.PreserveWindowState.currWinMode == "maximized") core.PreserveWindowState.winState.mode = "maximized"; else core.PreserveWindowState.winState.mode = "normal";
	if(core.PreserveWindowState.currWinMode == "normal") {
		core.PreserveWindowState.winState.x = core.PreserveWindowState.window.x;
		core.PreserveWindowState.winState.y = core.PreserveWindowState.window.y;
		core.PreserveWindowState.winState.width = core.PreserveWindowState.window.width;
		core.PreserveWindowState.winState.height = core.PreserveWindowState.window.height;
	}
};
core.PreserveWindowState.restoreWindowState = function() {
	core.PreserveWindowState.window.resizeTo(core.PreserveWindowState.winState.width,core.PreserveWindowState.winState.height);
	core.PreserveWindowState.window.moveTo(core.PreserveWindowState.winState.x,core.PreserveWindowState.winState.y);
};
core.PreserveWindowState.saveWindowState = function() {
	core.PreserveWindowState.dumpWindowState();
	js.Browser.getLocalStorage().setItem("windowState",js.Node.stringify(core.PreserveWindowState.winState));
};
core.ProcessHelper = function() { };
$hxClasses["core.ProcessHelper"] = core.ProcessHelper;
core.ProcessHelper.__name__ = ["core","ProcessHelper"];
core.ProcessHelper.runProcess = function(process,params,path,onComplete,onFailed) {
	var command = core.ProcessHelper.processParamsToCommand(process,params);
	var options = { };
	if(path != null) options.cwd = path;
	var process1 = js.Node.require("child_process").exec(command,options,function(error,stdout,stderr) {
		if(error == null) onComplete(stdout,stderr); else if(onFailed != null) onFailed(error.code,stdout,stderr);
	});
	return process1;
};
core.ProcessHelper.runProcessAndPrintOutputToConsole = function(process,params,onComplete) {
	var command = core.ProcessHelper.processParamsToCommand(process,params);
	new $("#outputTab").click();
	var textarea;
	textarea = js.Boot.__cast(window.document.getElementById("outputTextArea") , HTMLTextAreaElement);
	textarea.value = "Build started\n";
	textarea.value += command + "\n";
	new $("#errors").html("");
	var process1 = core.ProcessHelper.runPersistentProcess(process,params,function(code,stdout,stderr) {
		core.ProcessHelper.processOutput(code,core.ProcessHelper.processStdout,core.ProcessHelper.processStderr,onComplete);
	});
	return process1;
};
core.ProcessHelper.processOutput = function(code,stdout,stderr,onComplete) {
	var textarea;
	textarea = js.Boot.__cast(window.document.getElementById("outputTextArea") , HTMLTextAreaElement);
	if(StringTools.trim(stdout) != "") {
		textarea.value += "stdout:\n" + stdout;
		console.log("stdout:\n" + stdout);
	}
	core.HaxeLint.fileData = new haxe.ds.StringMap();
	var switchToResultsTab = false;
	if(stderr != "") {
		var lines = stderr.split("\n");
		var _g = 0;
		while(_g < lines.length) {
			var line = lines[_g];
			++_g;
			line = StringTools.trim(line);
			if(line.indexOf("Error:") == 0) {
				Alertify.error(line);
				if(line.indexOf("unknown option `-python'") != -1) Alertify.log("You may need to install latest version of Haxe to compile to Python target","",10000);
			} else if(line.indexOf(":") != 0) {
				var args = line.split(":");
				if(args.length > 3) {
					var relativePath = args[0];
					var fullPath = [js.Node.require("path").join(projectaccess.ProjectAccess.path,relativePath)];
					if(!core.HaxeLint.fileData.exists(fullPath[0])) core.HaxeLint.fileData.set(fullPath[0],[]);
					var data = core.HaxeLint.fileData.get(fullPath[0]);
					core.HaxeLint.fileData.set(fullPath[0],data);
					var lineNumber = [Std.parseInt(args[1]) - 1];
					var charsData = null;
					if(args[2].indexOf(" ") != -1) {
						var data1 = StringTools.trim(args[2]).split(" ");
						if(data1.length > 1 && data1[1].indexOf("-") != -1) charsData = data1[1].split("-");
					}
					if(charsData != null) {
						var start = Std.parseInt(charsData[0]);
						var end = Std.parseInt(charsData[1]);
						var message = "";
						var _g2 = 3;
						var _g1 = args.length;
						while(_g2 < _g1) {
							var i = _g2++;
							message += args[i];
							if(i != args.length - 1) message += ":";
						}
						var a;
						var _this = window.document;
						a = _this.createElement("a");
						a.href = "#";
						a.className = "list-group-item";
						a.innerText = line;
						a.onclick = (function(lineNumber,fullPath) {
							return function(e) {
								tabmanager.TabManager.openFileInNewTab(fullPath[0],true,(function(lineNumber) {
									return function() {
										var cm1 = cm.Editor.editor;
										cm1.centerOnLine(lineNumber[0]);
									};
								})(lineNumber));
							};
						})(lineNumber,fullPath);
						new $("#errors").append(a);
						var info = { from : { line : lineNumber[0], ch : start}, to : { line : lineNumber[0], ch : end}, message : message, severity : "error"};
						data.push(info);
						switchToResultsTab = true;
						tabmanager.TabManager.openFileInNewTab(fullPath[0],false);
					}
				}
			}
			var lib = null;
			var ereg = new EReg("haxelib install ([^']+)","gim");
			if(ereg.match(line)) lib = ereg.matched(1);
			var ereg2 = new EReg("library ([^ ]+) is not installed","gim");
			if(ereg2.match(line)) lib = ereg2.matched(1);
			if(lib != null) {
				var pathToHxml = projectaccess.ProjectAccess.getPathToHxml();
				dialogs.DialogManager.showInstallHaxelibDialog(lib,pathToHxml);
			}
		}
		textarea.value += "stderr:\n" + stderr;
		console.log("stderr:\n" + stderr);
	}
	if(code == 0) {
		Alertify.success("Build complete!");
		textarea.value += "Build complete\n";
		if(onComplete != null) onComplete();
		new $("#buildStatus").fadeIn(250);
	} else {
		if(switchToResultsTab) new $("#resultsTab").click();
		Alertify.error("Build failed");
		textarea.value += "Build failed (exit code: " + (code == null?"null":"" + code) + ")\n";
		new $("#buildStatus").fadeOut(250);
	}
	core.HaxeLint.updateLinting();
};
core.ProcessHelper.runPersistentProcess = function(process,params,onClose,redirectToOutput) {
	if(redirectToOutput == null) redirectToOutput = false;
	var textarea;
	textarea = js.Boot.__cast(window.document.getElementById("outputTextArea") , HTMLTextAreaElement);
	core.ProcessHelper.processStdout = "";
	core.ProcessHelper.processStderr = "";
	var process1 = js.Node.require("child_process").spawn(process,params,{ });
	process1.stdout.setEncoding("utf8");
	process1.stdout.on("data",function(data) {
		core.ProcessHelper.processStdout += data;
		if(redirectToOutput) {
			textarea.value += data;
			textarea.scrollTop = textarea.scrollHeight;
		}
	});
	process1.stderr.setEncoding("utf8");
	process1.stderr.on("data",function(data1) {
		core.ProcessHelper.processStderr += data1;
		if(redirectToOutput) {
			textarea.value += data1;
			textarea.scrollTop = textarea.scrollHeight;
		}
	});
	process1.on("error",function(e) {
		console.log(e);
	});
	process1.on("close",function(code) {
		console.log(core.ProcessHelper.processStdout);
		console.log(core.ProcessHelper.processStderr);
		if(onClose != null) onClose(code,core.ProcessHelper.processStdout,core.ProcessHelper.processStderr);
		if(code != 0) process1 = null;
		console.log("started process quit with exit code " + code);
	});
	return process1;
};
core.ProcessHelper.checkProcessInstalled = function(process,params,onComplete) {
	var installed;
	js.Node.require("child_process").exec(core.ProcessHelper.processParamsToCommand(process,params),{ },function(error,stdout,stderr) {
		if(error == null) installed = true; else {
			console.log(error);
			console.log(stdout);
			console.log(stderr);
			installed = false;
		}
		onComplete(installed);
	});
};
core.ProcessHelper.processParamsToCommand = function(process,params) {
	return [process].concat(params).join(" ");
};
core.QuickOpen = function() { };
$hxClasses["core.QuickOpen"] = core.QuickOpen;
core.QuickOpen.__name__ = ["core","QuickOpen"];
core.QuickOpen.load = function() {
	var _this = window.document;
	core.QuickOpen.panel = _this.createElement("div");
	core.QuickOpen.panel.className = "panel panel-default";
	core.QuickOpen.panel.id = "quickOpen";
	var _this1 = window.document;
	core.QuickOpen.panelBody = _this1.createElement("div");
	core.QuickOpen.panelBody.className = "panel-body";
	core.QuickOpen.panel.appendChild(core.QuickOpen.panelBody);
	var _this2 = window.document;
	core.QuickOpen.div = _this2.createElement("div");
	core.QuickOpen.inputGroup = new bootstrap.InputGroup();
	core.QuickOpen.inputGroup.getElement().id = "quickOpenInputGroup";
	core.QuickOpen.input = core.QuickOpen.inputGroup.getInput();
	core.QuickOpen.listGroup = new bootstrap.ListGroup();
	core.QuickOpen.listGroup.getElement().id = "quickOpenListGroup";
	core.QuickOpen.div.appendChild(core.QuickOpen.inputGroup.getElement());
	core.QuickOpen.div.appendChild(core.QuickOpen.listGroup.getElement());
	core.QuickOpen.panel.style.display = "none";
	core.QuickOpen.panelBody.appendChild(core.QuickOpen.div);
	new $(window.document.body).append(core.QuickOpen.panel);
};
core.QuickOpen.show = function(list) {
	core.QuickOpen.activeItemIndex = 0;
	core.QuickOpen.fileList = completion.Filter.sortFileList(list);
	core.QuickOpen.currentList = core.QuickOpen.fileList;
	core.QuickOpen.input.value = "";
	core.QuickOpen.update();
	core.QuickOpen.panel.style.display = "";
	core.QuickOpen.input.focus();
	core.QuickOpen.registerListeners();
};
core.QuickOpen.onKeyUp = function(e) {
	var _g = e.keyCode;
	switch(_g) {
	case 27:
		core.QuickOpen.hide();
		break;
	default:
	}
};
core.QuickOpen.onInput = function(e) {
	core.QuickOpen.activeItemIndex = 0;
	core.Helper.debounce("openfilecompletion",function() {
		core.QuickOpen.currentList = completion.Filter.filterFiles(core.QuickOpen.fileList,core.QuickOpen.input.value);
		core.QuickOpen.update();
	},100);
};
core.QuickOpen.onKeyDown = function(e) {
	var _g = e.keyCode;
	switch(_g) {
	case 38:
		e.preventDefault();
		core.QuickOpen.activeItemIndex--;
		if(core.QuickOpen.activeItemIndex < 0) core.QuickOpen.activeItemIndex = core.QuickOpen.currentList.length - 1;
		core.QuickOpen.makeSureActiveItemVisible();
		break;
	case 40:
		e.preventDefault();
		core.QuickOpen.activeItemIndex++;
		if(core.QuickOpen.activeItemIndex >= core.QuickOpen.currentList.length) core.QuickOpen.activeItemIndex = 0;
		core.QuickOpen.makeSureActiveItemVisible();
		break;
	case 33:
		e.preventDefault();
		core.QuickOpen.activeItemIndex += -5;
		if(core.QuickOpen.activeItemIndex < 0) core.QuickOpen.activeItemIndex = 0;
		core.QuickOpen.makeSureActiveItemVisible();
		break;
	case 34:
		e.preventDefault();
		core.QuickOpen.activeItemIndex += 5;
		if(core.QuickOpen.activeItemIndex >= core.QuickOpen.currentList.length) core.QuickOpen.activeItemIndex = core.QuickOpen.currentList.length - 1;
		core.QuickOpen.makeSureActiveItemVisible();
		break;
	case 35:
		if(!e.shiftKey) {
			e.preventDefault();
			core.QuickOpen.activeItemIndex = core.QuickOpen.currentList.length - 1;
			core.QuickOpen.makeSureActiveItemVisible();
		}
		break;
	case 36:
		if(!e.shiftKey) {
			e.preventDefault();
			core.QuickOpen.activeItemIndex = 0;
			core.QuickOpen.makeSureActiveItemVisible();
		}
		break;
	case 13:
		e.preventDefault();
		core.QuickOpen.listGroup.getItems()[core.QuickOpen.activeItemIndex].click();
		break;
	}
};
core.QuickOpen.onClick = function(e) {
	core.QuickOpen.hide();
};
core.QuickOpen.registerListeners = function() {
	window.document.addEventListener("keyup",core.QuickOpen.onKeyUp);
	window.document.addEventListener("click",core.QuickOpen.onClick);
	core.QuickOpen.input.addEventListener("input",core.QuickOpen.onInput);
	core.QuickOpen.input.addEventListener("keydown",core.QuickOpen.onKeyDown);
};
core.QuickOpen.unregisterListeners = function() {
	window.document.removeEventListener("keyup",core.QuickOpen.onKeyUp);
	window.document.removeEventListener("click",core.QuickOpen.onClick);
	core.QuickOpen.input.removeEventListener("input",core.QuickOpen.onInput);
	core.QuickOpen.input.removeEventListener("keydown",core.QuickOpen.onKeyDown);
};
core.QuickOpen.hide = function() {
	core.QuickOpen.panel.style.display = "none";
	core.QuickOpen.unregisterListeners();
	if(tabmanager.TabManager.selectedPath != null) cm.Editor.editor.focus();
};
core.QuickOpen.update = function() {
	core.QuickOpen.listGroup.clear();
	var _g = 0;
	var _g1 = core.QuickOpen.currentList;
	while(_g < _g1.length) {
		var item = _g1[_g];
		++_g;
		core.QuickOpen.listGroup.addItem(item.filename,item.displayText,(function(f,a1) {
			return function() {
				return f(a1);
			};
		})(core.QuickOpen.openFile,item.path));
	}
	core.QuickOpen.makeSureActiveItemVisible();
};
core.QuickOpen.makeSureActiveItemVisible = function() {
	var items = core.QuickOpen.listGroup.getItems();
	var _g1 = 0;
	var _g = items.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(i != core.QuickOpen.activeItemIndex) {
			if(items[i].classList.contains("active")) items[i].classList.remove("active");
		} else if(!items[i].classList.contains("active")) items[i].classList.add("active");
	}
	var container = core.QuickOpen.listGroup.getElement();
	if(core.QuickOpen.activeItemIndex > 0) {
		var node = items[core.QuickOpen.activeItemIndex];
		if(node.offsetTop - node.offsetHeight < container.scrollTop) container.scrollTop = node.offsetTop - 48; else if(node.offsetTop > container.scrollTop + container.clientHeight) container.scrollTop = node.offsetTop - container.clientHeight;
	} else container.scrollTop = 0;
};
core.QuickOpen.openFile = function(path) {
	if(projectaccess.ProjectAccess.path != null) path = js.Node.require("path").resolve(projectaccess.ProjectAccess.path,path);
	tabmanager.TabManager.openFileInNewTab(path);
};
core.RecentProjectsList = function() { };
$hxClasses["core.RecentProjectsList"] = core.RecentProjectsList;
core.RecentProjectsList.__name__ = ["core","RecentProjectsList"];
core.RecentProjectsList.load = function() {
	var localStorage2 = js.Browser.getLocalStorage();
	if(localStorage2 != null) {
		var recentProjectsData = localStorage2.getItem("recentProjects");
		var recentFilesData = localStorage2.getItem("recentFiles");
		var recentFilesData1 = localStorage2.getItem("recentFiles");
		if(recentProjectsData != null) try {
			core.RecentProjectsList.projectList = tjson.TJSON.parse(recentProjectsData);
		} catch( unknown ) {
			console.log(unknown);
		}
		if(recentFilesData1 != null) try {
			core.RecentProjectsList.fileList = tjson.TJSON.parse(recentFilesData1);
		} catch( unknown1 ) {
			console.log(unknown1);
		}
	}
	nodejs.webkit.Window.get().on("close",function() {
		localStorage2.setItem("recentProjects",tjson.TJSON.encode(core.RecentProjectsList.projectList));
		localStorage2.setItem("recentFiles",tjson.TJSON.encode(core.RecentProjectsList.fileList));
	});
	core.RecentProjectsList.updateMenu();
	core.RecentProjectsList.updateWelcomeScreen();
	core.RecentProjectsList.updateRecentFileMenu();
};
core.RecentProjectsList.add = function(path) {
	core.RecentProjectsList.addItemToList(core.RecentProjectsList.projectList,path);
	core.RecentProjectsList.updateMenu();
	core.RecentProjectsList.updateWelcomeScreen();
};
core.RecentProjectsList.addFile = function(path) {
	core.RecentProjectsList.addItemToList(core.RecentProjectsList.fileList,path);
	core.RecentProjectsList.updateRecentFileMenu();
};
core.RecentProjectsList.addItemToList = function(list,item) {
	if(HxOverrides.indexOf(list,item,0) == -1) {
		if(list.length >= 10) list.pop();
	} else HxOverrides.remove(list,item);
	list.splice(0,0,item);
};
core.RecentProjectsList.updateMenu = function() {
	var submenu = menu.BootstrapMenu.getMenu("File").getSubmenu("Open Recent Project");
	submenu.clear();
	var _g1 = 0;
	var _g = core.RecentProjectsList.projectList.length;
	while(_g1 < _g) {
		var i = _g1++;
		submenu.addMenuItem(core.RecentProjectsList.projectList[i],i + 1,(function(f,a1) {
			return function() {
				return f(a1);
			};
		})(openproject.OpenProject.openProject,core.RecentProjectsList.projectList[i]));
	}
	var submenu1 = menu.BootstrapMenu.getMenu("Project").getSubmenu("Build Recent Project");
	submenu1.clear();
	var _g11 = 0;
	var _g2 = core.RecentProjectsList.projectList.length;
	while(_g11 < _g2) {
		var i1 = _g11++;
		submenu1.addMenuItem(core.RecentProjectsList.projectList[i1],i1 + 1,(function(f1,a11) {
			return function() {
				return f1(a11);
			};
		})(core.RunProject.buildProject,core.RecentProjectsList.projectList[i1]));
	}
};
core.RecentProjectsList.updateWelcomeScreen = function() {
	var listGroup;
	listGroup = js.Boot.__cast(window.document.getElementById("recentProjectsList") , HTMLDivElement);
	while(listGroup.firstChild != null) listGroup.removeChild(listGroup.firstChild);
	var _g1 = 0;
	var _g = core.RecentProjectsList.projectList.length;
	while(_g1 < _g) {
		var i = [_g1++];
		var a;
		var _this = window.document;
		a = _this.createElement("a");
		a.href = "#";
		a.className = "list-group-item recentProject";
		a.textContent = core.RecentProjectsList.projectList[i[0]];
		a.onclick = (function(i) {
			return function(e) {
				openproject.OpenProject.openProject(core.RecentProjectsList.projectList[i[0]]);
			};
		})(i);
		var buildButton = bootstrap.ButtonManager.createButton("Build");
		buildButton.classList.add("buildButton");
		buildButton.onclick = (function(i) {
			return function(e1) {
				e1.stopPropagation();
				e1.preventDefault();
				core.RunProject.buildProject(core.RecentProjectsList.projectList[i[0]]);
			};
		})(i);
		a.appendChild(buildButton);
		listGroup.appendChild(a);
	}
};
core.RecentProjectsList.updateRecentFileMenu = function() {
	var submenu = menu.BootstrapMenu.getMenu("File").getSubmenu("Open Recent File");
	submenu.clear();
	var _g1 = 0;
	var _g = core.RecentProjectsList.fileList.length;
	while(_g1 < _g) {
		var i = _g1++;
		submenu.addMenuItem(core.RecentProjectsList.fileList[i],i + 1,(function(f,a1) {
			return function() {
				return f(a1);
			};
		})(tabmanager.TabManager.openFileInNewTab,core.RecentProjectsList.fileList[i]));
	}
};
core.RunProject = function() { };
$hxClasses["core.RunProject"] = core.RunProject;
core.RunProject.__name__ = ["core","RunProject"];
core.RunProject.cleanProject = function() {
	if(projectaccess.ProjectAccess.path != null) {
		var project = projectaccess.ProjectAccess.currentProject;
		var _g = project.type;
		switch(_g) {
		case 0:
			var pathToHxml = js.Node.require("path").join(projectaccess.ProjectAccess.path,project.targetData[project.target].pathToHxml);
			break;
		case 1:
			core.RunProject.runProcess = core.RunProject.killRunningProcessAndRunNew("haxelib",["run","lime","clean",project.openFLTarget]);
			break;
		case 2:
			var pathToHxml1 = js.Node.require("path").join(projectaccess.ProjectAccess.path,project.main);
			break;
		default:
		}
	} else Alertify.error("Open or create project first");
};
core.RunProject.setHxmlAsProjectBuildFile = function() {
	var path = tabmanager.TabManager.getCurrentDocumentPath();
	var extname = js.Node.require("path").extname(path);
	var isHxml = extname == ".hxml";
	if(isHxml) {
		var noproject = projectaccess.ProjectAccess.path == null;
		var project = projectaccess.ProjectAccess.currentProject;
		project.type = 2;
		project.main = js.Node.require("path").basename(path);
		projectaccess.ProjectAccess.path = js.Node.require("path").dirname(path);
		projectaccess.ProjectAccess.save(function() {
			if(noproject) openproject.OpenProject.openProject(js.Node.require("path").join(projectaccess.ProjectAccess.path,"project.hide"));
		});
		Alertify.success(watchers.LocaleWatcher.getStringSync("Done"));
	} else Alertify.error(watchers.LocaleWatcher.getStringSync("Currently active document is not a hxml file"));
};
core.RunProject.runProject = function() {
	core.RunProject.buildProject(null,function() {
		var project = projectaccess.ProjectAccess.currentProject;
		var runActionType;
		var runActionText;
		var _g = project.type;
		switch(_g) {
		case 0:
			var targetData = project.targetData[project.target];
			runActionType = targetData.runActionType;
			runActionText = targetData.runActionText;
			break;
		default:
			runActionType = project.runActionType;
			runActionText = project.runActionText;
		}
		switch(runActionType) {
		case 0:
			var url = runActionText;
			if(core.RunProject.isValidCommand(url)) nodejs.webkit.Shell.openExternal(url);
			break;
		case 1:
			var path = runActionText;
			if(core.RunProject.isValidCommand(path)) js.Node.require("fs").exists(path,function(exists) {
				if(!exists) path = js.Node.require("path").join(projectaccess.ProjectAccess.path,path);
				nodejs.webkit.Shell.openItem(path);
			});
			break;
		case 2:
			var command = runActionText;
			if(core.RunProject.isValidCommand(command)) {
				var params = build.CommandPreprocessor.preprocess(command,projectaccess.ProjectAccess.path).split(" ");
				var process = params.shift();
				core.RunProject.runProcess = core.RunProject.killRunningProcessAndRunNew(process,params);
				var $window = nodejs.webkit.Window.get();
				$window.on("close",function(e) {
					core.RunProject.killRunProcess();
					$window.close();
				});
			}
			break;
		default:
		}
	});
};
core.RunProject.killRunningProcessAndRunNew = function(process,params) {
	core.RunProject.killRunProcess();
	return core.ProcessHelper.runPersistentProcess(process,params,null,true);
};
core.RunProject.killRunProcess = function() {
	console.log(core.RunProject.runProcess);
	if(core.RunProject.runProcess != null) {
		console.log("kill");
		core.RunProject.runProcess.kill();
	}
};
core.RunProject.isValidCommand = function(command) {
	var valid = false;
	if(command != null && StringTools.trim(command) != "") valid = true;
	return valid;
};
core.RunProject.buildProject = function(pathToProject,onComplete) {
	var project;
	if(pathToProject != null) {
		var options = { };
		options.encoding = "utf8";
		var data = js.Node.require("fs").readFileSync(pathToProject,options);
		project = tjson.TJSON.parse(data);
		pathToProject = js.Node.require("path").dirname(pathToProject);
	} else {
		project = projectaccess.ProjectAccess.currentProject;
		pathToProject = projectaccess.ProjectAccess.path;
	}
	core.RunProject.buildSpecifiedProject(project,pathToProject,onComplete);
};
core.RunProject.buildSpecifiedProject = function(project,pathToProject,onComplete) {
	if(pathToProject == null) Alertify.error(watchers.LocaleWatcher.getStringSync("Please open or create project first!")); else tabmanager.TabManager.saveAll(function() {
		var path = tabmanager.TabManager.getCurrentDocumentPath();
		var extname = js.Node.require("path").extname(path);
		var buildHxml = extname == ".hxml";
		var dirname = js.Node.require("path").dirname(path);
		var filename = js.Node.require("path").basename(path);
		if(buildHxml || project.type == 2 || project.type == 0) {
			var hxmlData;
			if(!buildHxml) {
				dirname = pathToProject;
				var _g = project.type;
				switch(_g) {
				case 2:
					filename = project.main;
					break;
				case 0:
					filename = project.targetData[project.target].pathToHxml;
					break;
				default:
				}
				var options = { };
				options.encoding = "utf8";
				js.Node.require("fs").readFile(js.Node.require("path").join(dirname,filename),options,function(err,data) {
					if(err == null) {
						hxmlData = data;
						build.Hxml.checkHxml(dirname,filename,hxmlData,onComplete);
					} else console.log(err);
				});
			} else {
				hxmlData = cm.Editor.editor.getValue();
				build.Hxml.checkHxml(dirname,filename,hxmlData,onComplete);
			}
		} else {
			var command = project.buildActionCommand;
			command = build.CommandPreprocessor.preprocess(command,pathToProject);
			var params = build.CommandPreprocessor.preprocess(command,pathToProject).split(" ");
			var process = params.shift();
			core.ProcessHelper.runProcessAndPrintOutputToConsole(process,params,onComplete);
		}
	});
};
core.Splitter = function() { };
$hxClasses["core.Splitter"] = core.Splitter;
core.Splitter.__name__ = ["core","Splitter"];
core.Splitter.load = function() {
	core.Splitter.hide();
};
core.Splitter.show = function() {
	if(core.Splitter.visible == false) {
		core.Splitter.visible = true;
		new $("#mainSplitter").jqxSplitter({ resizable : true});
		new $("#mainSplitter").jqxSplitter("expand");
		new $("#mainSplitter").jqxSplitter({ showSplitBar : true});
		new $("#thirdNested").jqxSplitter({ resizable : true});
		var panels = [{ size : "85%"},{ size : "15%"}];
		panels[0].collapsible = false;
		panels[1].collapsible = true;
		new $("#thirdNested").jqxSplitter({ panels : panels});
		new $("#thirdNested").jqxSplitter("expand");
		new $("#thirdNested").jqxSplitter({ showSplitBar : true});
		new $("#annotationRuler").fadeIn(250);
		core.WelcomeScreen.hide();
	}
};
core.Splitter.hide = function() {
	core.Splitter.visible = false;
	var panels = [{ size : 170},{ size : 170}];
	panels[0].collapsible = true;
	panels[1].collapsible = false;
	new $("#mainSplitter").jqxSplitter({ panels : panels});
	new $("#mainSplitter").jqxSplitter("collapse");
	new $("#mainSplitter").jqxSplitter({ resizable : false});
	new $("#mainSplitter").jqxSplitter({ showSplitBar : false});
	var panels1 = [{ size : "85%"},{ size : "15%"}];
	panels1[0].collapsible = false;
	panels1[1].collapsible = true;
	new $("#thirdNested").jqxSplitter({ panels : panels1});
	new $("#thirdNested").jqxSplitter("collapse");
	new $("#thirdNested").jqxSplitter({ resizable : false});
	new $("#thirdNested").jqxSplitter({ showSplitBar : false});
	new $("#annotationRuler").fadeOut(250);
	if(tabmanager.TabManager.tabMap != null && tabmanager.TabManager.tabMap.getTabs().length == 0) core.WelcomeScreen.show();
};
core.WelcomeScreen = function() { };
$hxClasses["core.WelcomeScreen"] = core.WelcomeScreen;
core.WelcomeScreen.__name__ = ["core","WelcomeScreen"];
core.WelcomeScreen.load = function() {
	core.WelcomeScreen.div = js.Boot.__cast(window.document.getElementById("welcomeScreen") , HTMLDivElement);
	new $("#createNewProject").on("click",null,newprojectdialog.NewProjectDialog.show);
	new $("#openProject").on("click",null,function() {
		return openproject.OpenProject.openProject(null,true);
	});
	var links = window.document.getElementsByClassName("welcome-screen-link");
	var _g1 = 0;
	var _g = links.length;
	while(_g1 < _g) {
		var i = _g1++;
		var link = [js.Boot.__cast(links.item(i) , HTMLLIElement)];
		link[0].onclick = (function(link) {
			return function(e) {
				var _g3 = 0;
				var _g2 = links.length;
				while(_g3 < _g2) {
					var j = _g3++;
					var link2;
					link2 = js.Boot.__cast(links.item(j) , HTMLLIElement);
					if(link2 != link[0]) {
						link2.classList.remove("active");
						new $("#welcomeScreenPage" + Std.string(j + 1)).hide(0);
					} else {
						link2.classList.add("active");
						new $("#welcomeScreenPage" + Std.string(j + 1)).fadeIn(250);
					}
				}
			};
		})(link);
	}
	new $("#github").on("click",null,function() {
		return nodejs.webkit.Shell.openExternal("https://github.com/as3boyan/HIDE");
	});
	new $("#as3boyan").on("click",null,function() {
		return nodejs.webkit.Shell.openExternal("http://twitter.com/As3Boyan");
	});
};
core.WelcomeScreen.show = function() {
	new $(core.WelcomeScreen.div).fadeIn(250);
};
core.WelcomeScreen.hide = function() {
	new $(core.WelcomeScreen.div).fadeOut(250);
};
var dialogs = {};
dialogs.ModalDialog = function(title) {
	var _g = this;
	var _this = window.document;
	this.modal = _this.createElement("div");
	this.modal.className = "modal fade";
	var dialog;
	var _this1 = window.document;
	dialog = _this1.createElement("div");
	dialog.className = "modal-dialog";
	this.modal.appendChild(dialog);
	var content;
	var _this2 = window.document;
	content = _this2.createElement("div");
	content.className = "modal-content";
	dialog.appendChild(content);
	var _this3 = window.document;
	this.header = _this3.createElement("div");
	this.header.className = "modal-header";
	content.appendChild(this.header);
	this.h4 = js.Boot.__cast(window.document.createElement("h4") , HTMLHeadingElement);
	this.h4.className = "modal-title";
	if(title != null) this.setTitle(title);
	this.header.appendChild(this.h4);
	var _this4 = window.document;
	this.body = _this4.createElement("div");
	this.body.className = "modal-body";
	this.body.style.overflow = "hidden";
	content.appendChild(this.body);
	var _this5 = window.document;
	this.footer = _this5.createElement("div");
	this.footer.className = "modal-footer";
	content.appendChild(this.footer);
	window.addEventListener("keyup",function(e) {
		if(e.keyCode == 27) _g.hide();
	});
	window.document.body.appendChild(this.modal);
};
$hxClasses["dialogs.ModalDialog"] = dialogs.ModalDialog;
dialogs.ModalDialog.__name__ = ["dialogs","ModalDialog"];
dialogs.ModalDialog.prototype = {
	modal: null
	,header: null
	,body: null
	,footer: null
	,h4: null
	,setTitle: function(title) {
		this.h4.textContent = title;
	}
	,getHeader: function() {
		return this.header;
	}
	,getBody: function() {
		return this.body;
	}
	,getFooter: function() {
		return this.footer;
	}
	,getModal: function() {
		return this.modal;
	}
	,show: function() {
		new $(this.modal).modal("show");
	}
	,hide: function() {
		new $(this.modal).modal("hide");
	}
	,__class__: dialogs.ModalDialog
};
dialogs.BrowseDirectoryDialog = function(title) {
	var _g = this;
	dialogs.ModalDialog.call(this,title);
	this.inputGroupButton = new bootstrap.InputGroupButton("Browse...");
	this.input = this.inputGroupButton.getInput();
	var browseButton = this.inputGroupButton.getButton();
	browseButton.onclick = function(e) {
		core.FileDialog.openFolder(function(path) {
			_g.input.value = path;
		});
	};
	this.getBody().appendChild(this.inputGroupButton.getElement());
	var okButton = bootstrap.ButtonManager.createButton("OK",false,false,true);
	okButton.onclick = function(e1) {
		if(_g.onComplete != null) _g.onComplete(_g.input.value);
	};
	this.getFooter().appendChild(okButton);
	this.getFooter().appendChild(bootstrap.ButtonManager.createButton("Cancel",false,true));
};
$hxClasses["dialogs.BrowseDirectoryDialog"] = dialogs.BrowseDirectoryDialog;
dialogs.BrowseDirectoryDialog.__name__ = ["dialogs","BrowseDirectoryDialog"];
dialogs.BrowseDirectoryDialog.__super__ = dialogs.ModalDialog;
dialogs.BrowseDirectoryDialog.prototype = $extend(dialogs.ModalDialog.prototype,{
	onComplete: null
	,input: null
	,inputGroupButton: null
	,setDefaultValue: function(_value) {
		this.input.value = _value;
	}
	,setCallback: function(_onComplete) {
		this.onComplete = _onComplete;
	}
	,__class__: dialogs.BrowseDirectoryDialog
});
dialogs.BrowseDirectoryWithDownloadButtonDialog = function(title) {
	dialogs.BrowseDirectoryDialog.call(this,title);
	this.downloadButton = bootstrap.ButtonManager.createButton("Download");
	this.inputGroupButton.getSpan().appendChild(this.downloadButton);
};
$hxClasses["dialogs.BrowseDirectoryWithDownloadButtonDialog"] = dialogs.BrowseDirectoryWithDownloadButtonDialog;
dialogs.BrowseDirectoryWithDownloadButtonDialog.__name__ = ["dialogs","BrowseDirectoryWithDownloadButtonDialog"];
dialogs.BrowseDirectoryWithDownloadButtonDialog.__super__ = dialogs.BrowseDirectoryDialog;
dialogs.BrowseDirectoryWithDownloadButtonDialog.prototype = $extend(dialogs.BrowseDirectoryDialog.prototype,{
	downloadButton: null
	,setDownloadButtonOptions: function(text,url) {
		this.downloadButton.textContent = text;
		this.downloadButton.onclick = function(e) {
			nodejs.webkit.Shell.openExternal(url);
		};
	}
	,__class__: dialogs.BrowseDirectoryWithDownloadButtonDialog
});
dialogs.DialogManager = function() { };
$hxClasses["dialogs.DialogManager"] = dialogs.DialogManager;
dialogs.DialogManager.__name__ = ["dialogs","DialogManager"];
dialogs.DialogManager.load = function() {
	dialogs.DialogManager.browseDirectoryDialog = new dialogs.BrowseDirectoryDialog();
	dialogs.DialogManager.browseDirectoryWithDownloadButtonDialog = new dialogs.BrowseDirectoryWithDownloadButtonDialog();
	dialogs.DialogManager.haxelibManagerDialog = new dialogs.HaxelibManagerDialog();
	dialogs.DialogManager.projectOptionsDialog = new dialogs.ProjectOptionsDialog();
	dialogs.DialogManager.installHaxelibDialog = new dialogs.InstallHaxelibDialog();
	dialogs.DialogManager.reloadFileDialogs = [];
};
dialogs.DialogManager.showBrowseFolderDialog = function(title,onComplete,defaultValue,downloadButtonText,downloadButtonURL) {
	if(defaultValue == null) defaultValue = "";
	var dialog = dialogs.DialogManager.browseDirectoryDialog;
	if(downloadButtonText != null && downloadButtonURL != null) {
		dialog = dialogs.DialogManager.browseDirectoryWithDownloadButtonDialog;
		dialogs.DialogManager.browseDirectoryWithDownloadButtonDialog.setDownloadButtonOptions(downloadButtonText,downloadButtonURL);
	}
	dialog.setTitle(title);
	dialog.setCallback(onComplete);
	dialog.setDefaultValue(defaultValue);
	dialog.show();
};
dialogs.DialogManager.showHaxelibManagerDialog = function() {
	dialogs.DialogManager.haxelibManagerDialog.show();
};
dialogs.DialogManager.showProjectOptions = function() {
	dialogs.DialogManager.projectOptionsDialog.show();
};
dialogs.DialogManager.showInstallHaxelibDialog = function(lib,pathToHxml) {
	dialogs.DialogManager.installHaxelibDialog.setLib(lib);
	dialogs.DialogManager.installHaxelibDialog.setPathToHxml(pathToHxml);
	dialogs.DialogManager.installHaxelibDialog.show();
};
dialogs.DialogManager.showReloadFileDialog = function(path,onConfirm) {
	if(HxOverrides.indexOf(dialogs.DialogManager.reloadFileDialogs,path,0) == -1) {
		Alertify.confirm(watchers.LocaleWatcher.getStringSync("File ") + path + watchers.LocaleWatcher.getStringSync(" was changed. Reload?"),function(e) {
			if(e) onConfirm();
			HxOverrides.remove(dialogs.DialogManager.reloadFileDialogs,path);
		});
		dialogs.DialogManager.reloadFileDialogs.push(path);
	}
};
dialogs.DialogManager.hide = function() {
	dialogs.DialogManager.browseDirectoryDialog.hide();
	dialogs.DialogManager.browseDirectoryWithDownloadButtonDialog.hide();
	dialogs.DialogManager.haxelibManagerDialog.hide();
};
dialogs.HaxelibManagerDialog = function() {
	var _g1 = this;
	dialogs.ModalDialog.call(this,"haxelib manager");
	var inputGroupButton = new bootstrap.InputGroupButton("Search");
	this.getBody().appendChild(inputGroupButton.getElement());
	this.listGroup = new bootstrap.ListGroup();
	this.listGroup.getElement().id = "haxelibsList";
	core.HaxeHelper.getInstalledHaxelibList(function(data) {
		var _g = 0;
		while(_g < data.length) {
			var item = data[_g];
			++_g;
			_g1.listGroup.addItem(item,"");
		}
	});
	this.getBody().appendChild(this.listGroup.getElement());
	window.addEventListener("resize",function(e) {
		_g1.updateSize();
	});
	this.getFooter().appendChild(bootstrap.ButtonManager.createButton("OK",false,true,true));
	this.updateSize();
};
$hxClasses["dialogs.HaxelibManagerDialog"] = dialogs.HaxelibManagerDialog;
dialogs.HaxelibManagerDialog.__name__ = ["dialogs","HaxelibManagerDialog"];
dialogs.HaxelibManagerDialog.__super__ = dialogs.ModalDialog;
dialogs.HaxelibManagerDialog.prototype = $extend(dialogs.ModalDialog.prototype,{
	listGroup: null
	,updateSize: function() {
		this.listGroup.getElement().style.height = window.innerHeight / 2 + "px";
	}
	,__class__: dialogs.HaxelibManagerDialog
});
dialogs.InstallHaxelibDialog = function() {
	var _g = this;
	dialogs.ModalDialog.call(this,"Missing haxelib");
	var form;
	var _this = window.document;
	form = _this.createElement("form");
	form.setAttribute("role","form");
	var inputGroup = new bootstrap.InputGroup();
	inputGroup.getElement().id = "commandInputElement";
	inputGroup.getElement().style.display = "none";
	this.input = inputGroup.getInput();
	this.installLibRadio = new bootstrap.RadioElement("haxelibInstallOptions","installLib","install from haxelib",function() {
		_g.input.value = "haxelib install " + _g.lib;
		_g.input.onchange(null);
		inputGroup.getElement().style.display = "none";
	});
	this.installLibRadio.getInput().checked = true;
	form.appendChild(this.installLibRadio.getElement());
	this.installHxmlLibsRadio = new bootstrap.RadioElement("haxelibInstallOptions","installHxmlLibs","install all libs for hxml from haxelib",function() {
		_g.input.value = "haxelib install " + _g.pathToHxml;
		_g.input.onchange(null);
		inputGroup.getElement().style.display = "none";
	});
	this.installHxmlLibsRadio.getInput().checked = true;
	form.appendChild(this.installHxmlLibsRadio.getElement());
	this.installAllHxmlLibsRadio = new bootstrap.RadioElement("haxelibInstallOptions","installHxmlLibs","install all libs for all hxml from haxelib",function() {
		_g.input.value = "haxelib install all";
		_g.input.onchange(null);
		inputGroup.getElement().style.display = "none";
	});
	this.installAllHxmlLibsRadio.getInput().checked = true;
	form.appendChild(this.installAllHxmlLibsRadio.getElement());
	var installLibFromGitRadio = new bootstrap.RadioElement("haxelibInstallOptions","installLibFromGit","install from git",function() {
		_g.input.value = "haxelib git " + _g.lib + " <git-clone-path> <branch> <subdirectory>";
		_g.input.onchange(null);
		inputGroup.getElement().style.display = "";
	});
	installLibFromGitRadio.getInput().checked = true;
	form.appendChild(installLibFromGitRadio.getElement());
	var installLibFromDevRadio = new bootstrap.RadioElement("haxelibInstallOptions","installLibFromDev","set development directory",function() {
		_g.input.value = "haxelib dev " + _g.lib + " <directory>";
		_g.input.onchange(null);
		inputGroup.getElement().style.display = "";
	});
	installLibFromDevRadio.getInput().checked = true;
	form.appendChild(installLibFromDevRadio.getElement());
	this.getBody().appendChild(form);
	this.getBody().appendChild(inputGroup.getElement());
	var _this1 = window.document;
	this.commandPreviewP = _this1.createElement("p");
	this.commandPreviewP.id = "commandPreviewText";
	this.input.onchange = function(e) {
		_g.commandPreviewP.textContent = "Run command: " + _g.input.value;
	};
	this.getBody().appendChild(this.commandPreviewP);
	var cancelButton = bootstrap.ButtonManager.createButton("Cancel",false,true);
	this.getFooter().appendChild(cancelButton);
	var okButton = bootstrap.ButtonManager.createButton("OK",false,false,true);
	okButton.onclick = function(e1) {
		Alertify.log("Running command: " + _g.input.value);
		var params = StringTools.trim(_g.input.value).split(" ");
		core.ProcessHelper.runPersistentProcess(params.shift(),params,function(code,stdout,stderr) {
			if(code == 0) Alertify.success(_g.lib + " install complete(" + _g.input.value + ")."); else {
				Alertify.error("Error on running command " + _g.input.value);
				Alertify.error(stdout);
				Alertify.error(stderr);
			}
		},true);
		_g.hide();
	};
	this.getFooter().appendChild(okButton);
	window.document.addEventListener("keyup",function(e2) {
		if(e2.keyCode == 13 && new $(_g.getModal())["is"](":visible")) okButton.click();
	});
};
$hxClasses["dialogs.InstallHaxelibDialog"] = dialogs.InstallHaxelibDialog;
dialogs.InstallHaxelibDialog.__name__ = ["dialogs","InstallHaxelibDialog"];
dialogs.InstallHaxelibDialog.__super__ = dialogs.ModalDialog;
dialogs.InstallHaxelibDialog.prototype = $extend(dialogs.ModalDialog.prototype,{
	lib: null
	,pathToHxml: null
	,input: null
	,installHxmlLibsRadio: null
	,commandPreviewP: null
	,installLibRadio: null
	,installAllHxmlLibsRadio: null
	,setLib: function(name) {
		this.lib = name;
		this.setTitle("Missing \"" + this.lib + "\" haxelib");
	}
	,setPathToHxml: function(path) {
		this.pathToHxml = path;
		if(path != null) {
			this.installHxmlLibsRadio.getInput().disabled = false;
			this.installAllHxmlLibsRadio.getInput().disabled = false;
		} else {
			this.installHxmlLibsRadio.getInput().disabled = true;
			this.installAllHxmlLibsRadio.getInput().disabled = true;
		}
	}
	,show: function() {
		dialogs.ModalDialog.prototype.show.call(this);
		this.installLibRadio.getInput().checked = true;
		this.input.value = "haxelib install " + this.lib;
		this.input.onchange(null);
	}
	,__class__: dialogs.InstallHaxelibDialog
});
dialogs.ProjectOptionsDialog = function() {
	dialogs.ModalDialog.call(this,"Project Options");
	this.getBody().appendChild(projectaccess.ProjectOptions.page);
	this.getFooter().appendChild(bootstrap.ButtonManager.createButton("OK",false,true,true));
};
$hxClasses["dialogs.ProjectOptionsDialog"] = dialogs.ProjectOptionsDialog;
dialogs.ProjectOptionsDialog.__name__ = ["dialogs","ProjectOptionsDialog"];
dialogs.ProjectOptionsDialog.__super__ = dialogs.ModalDialog;
dialogs.ProjectOptionsDialog.prototype = $extend(dialogs.ModalDialog.prototype,{
	__class__: dialogs.ProjectOptionsDialog
});
var filetree = {};
filetree.FileTree = function() { };
$hxClasses["filetree.FileTree"] = filetree.FileTree;
filetree.FileTree.__name__ = ["filetree","FileTree"];
filetree.FileTree.init = function() {
	filetree.FileTree.contextMenuCommandsMap = new haxe.ds.StringMap();
	filetree.FileTree.appendToContextMenu("New File...",function(selectedItem) {
		var path;
		if(selectedItem.value.type == "folder") path = selectedItem.value.path; else path = js.Node.require("path").dirname(selectedItem.value.path);
		Alertify.prompt(watchers.LocaleWatcher.getStringSync("Filename:"),function(e,str) {
			if(e) {
				var pathToFile = js.Node.require("path").join(path,str);
				tabmanager.TabManager.createFileInNewTab(pathToFile);
				new $("#filetree").jqxTree("addTo",filetree.FileTree.createFileItem(pathToFile),selectedItem.element);
				filetree.FileTree.attachContextMenu();
			}
		},"New.hx");
	});
	filetree.FileTree.appendToContextMenu("New Folder...",function(selectedItem1) {
		var path1;
		if(selectedItem1.value.type == "folder") path1 = selectedItem1.value.path; else path1 = js.Node.require("path").dirname(selectedItem1.value.path);
		Alertify.prompt("Folder name:",function(e1,str1) {
			if(e1) {
				var dirname = str1;
				if(dirname != null) {
					var pathToFolder = js.Node.require("path").join(path1,dirname);
					js.Node.require("fs").mkdir(pathToFolder,null,function(error) {
						if(error == null) {
							new $("#filetree").jqxTree("addTo",{ label : str1, value : { type : "folder", path : pathToFolder}, icon : "includes/images/folder.png"},selectedItem1.element);
							filetree.FileTree.attachContextMenu();
						} else Alertify.error(error);
					});
				}
			}
		},"New Folder");
	});
	filetree.FileTree.appendToContextMenu("Open Item",function(selectedItem2) {
		if(selectedItem2.value.type == "file") tabmanager.TabManager.openFileInNewTab(selectedItem2.value.path); else new $("#filetree").jqxTree("expandItem",selectedItem2.element);
	});
	filetree.FileTree.appendToContextMenu("Open using OS",function(selectedItem3) {
		nodejs.webkit.Shell.openItem(selectedItem3.value.path);
	});
	filetree.FileTree.appendToContextMenu("Show Item In Folder",function(selectedItem4) {
		nodejs.webkit.Shell.showItemInFolder(selectedItem4.value.path);
	});
	filetree.FileTree.appendToContextMenu("Rename...",function(selectedItem5) {
		var path2 = selectedItem5.value.path;
		Alertify.prompt(watchers.LocaleWatcher.getStringSync("Please enter new name for ") + path2,function(e2,str2) {
			if(e2) {
				var currentDirectory = js.Node.require("path").dirname(path2);
				js.node.Mv.move(path2,js.Node.require("path").join(currentDirectory,str2),function(error1) {
					if(error1 == null) filetree.FileTree.load(); else Alertify.error(error1);
				});
			}
		},js.Node.require("path").basename(path2));
	});
	filetree.FileTree.appendToContextMenu("Delete...",function(selectedItem6) {
		var path3 = selectedItem6.value.path;
		var _g = selectedItem6.value.type;
		switch(_g) {
		case "file":
			Alertify.confirm(watchers.LocaleWatcher.getStringSync("Remove file ") + path3 + " ?",function(e3) {
				if(e3) js.Node.require("fs").unlink(path3,function(error2) {
					if(error2 == null) {
						new $("#filetree").jqxTree("removeItem",selectedItem6.element);
						filetree.FileTree.attachContextMenu();
					} else Alertify.error(error2);
				});
			});
			break;
		case "folder":
			Alertify.confirm(watchers.LocaleWatcher.getStringSync("Remove folder ") + path3 + " ?",function(e4) {
				if(e4) js.node.Remove.removeAsync(path3,{ },function(error3) {
					if(error3 == null) {
						new $("#filetree").jqxTree("removeItem",selectedItem6.element);
						filetree.FileTree.attachContextMenu();
					} else Alertify.error(error3);
				});
			});
			break;
		default:
		}
	});
	filetree.FileTree.appendToContextMenu("Toggle Hidden Items Visibility",function(selectedItem7) {
		if(projectaccess.ProjectAccess.path != null) {
			projectaccess.ProjectAccess.currentProject.showHiddenItems = !projectaccess.ProjectAccess.currentProject.showHiddenItems;
			Alertify.success(watchers.LocaleWatcher.getStringSync("Hidden Items Visible: ") + Std.string(projectaccess.ProjectAccess.currentProject.showHiddenItems));
			if(!projectaccess.ProjectAccess.currentProject.showHiddenItems) Alertify.log("Hidden Items: \n" + Std.string(projectaccess.ProjectAccess.currentProject.hiddenItems));
		}
		filetree.FileTree.load();
	});
	filetree.FileTree.appendToContextMenu("Toggle Item Visibility",function(selectedItem8) {
		if(projectaccess.ProjectAccess.path != null) {
			var relativePath = js.Node.require("path").relative(projectaccess.ProjectAccess.path,selectedItem8.value.path);
			if(HxOverrides.indexOf(projectaccess.ProjectAccess.currentProject.hiddenItems,relativePath,0) == -1) {
				projectaccess.ProjectAccess.currentProject.hiddenItems.push(relativePath);
				new $("#filetree").jqxTree("removeItem",selectedItem8.element);
				filetree.FileTree.attachContextMenu();
			} else {
				HxOverrides.remove(projectaccess.ProjectAccess.currentProject.hiddenItems,relativePath);
				filetree.FileTree.load();
			}
		} else new $("#filetree").jqxTree("removeItem",selectedItem8.element);
	});
	filetree.FileTree.contextMenu = new $("#jqxMenu").jqxMenu({ autoOpenPopup : false, mode : "popup"});
	filetree.FileTree.attachContextMenu();
	new $(window.document).on("contextmenu",null,function(e5) {
		if(new $(e5.target).parents(".jqx-tree").length > 0) return false;
		return true;
	});
	new $("#jqxMenu").on("itemclick",null,function(event) {
		var item = $.trim(new $(event.args).text());
		(filetree.FileTree.contextMenuCommandsMap.get(item))();
	});
	new $("#filetree").dblclick(function(event1) {
		var item1 = new $("#filetree").jqxTree("getSelectedItem");
		if(item1.value.type == "file") tabmanager.TabManager.openFileInNewTab(item1.value.path);
	});
	new $("#filetree").bind("dragEnd",function(event2) {
		var target = event2.args.originalEvent.target;
		var targetParents = new $(target).parents();
		var item2 = null;
		$.each(new $("#filetree").jqxTree("getItems"),function(index,value) {
			if(value.label == event2.args.label && value.value == event2.args.value) {
				item2 = value;
				return false;
			}
		});
		if(item2) {
			var parents = new $(item2.element).parents("li");
			var path4 = "";
			$.each(parents,function(index1,value1) {
				var item3 = new $("#filetree").jqxTree("getItem",value1);
				if(item3.level > 0) path4 = item3.label + "/" + path4;
			});
			var topDirectory = new $("#filetree").jqxTree("getItems")[0].value.path;
			var selectedItem9 = new $("#filetree").jqxTree("getSelectedItem");
			var previousPath = selectedItem9.value.path;
			var newPath = js.Node.require("path").join(topDirectory,path4,selectedItem9.label);
			js.node.Mv.move(previousPath,newPath,function(error4) {
				if(error4 == null) {
					Alertify.success("File were successfully moved to " + newPath);
					selectedItem9.value.path = newPath;
				} else {
					Alertify.error("Can't move file from " + previousPath + " to " + newPath);
					filetree.FileTree.load();
				}
			});
		}
	});
};
filetree.FileTree.appendToContextMenu = function(name,onClick) {
	var li;
	var _this = window.document;
	li = _this.createElement("li");
	li.textContent = name;
	new $("#filetreemenu").append(li);
	filetree.FileTree.contextMenuCommandsMap.set(name,function() {
		var selectedItem = new $("#filetree").jqxTree("getSelectedItem");
		if(selectedItem != null) onClick(selectedItem);
	});
};
filetree.FileTree.attachContextMenu = function() {
	new $("#filetree li").on("mousedown",null,function(event) {
		var target = new $(event.target).parents("li:first")[0];
		var rightClick = filetree.FileTree.isRightClick(event);
		if(rightClick && target != null) {
			new $("#filetree").jqxTree("selectItem",target);
			var scrollTop = new $(window).scrollTop();
			var scrollLeft = new $(window).scrollLeft();
			filetree.FileTree.contextMenu.jqxMenu("open",Std.parseInt(event.clientX) + 5 + scrollLeft,Std.parseInt(event.clientY) + 5 + scrollTop);
			return false;
		} else return true;
	});
};
filetree.FileTree.isRightClick = function(event) {
	var rightclick = null;
	if(!event) {
		var event1 = window.event;
	}
	if(event.which) rightclick = event.which == 3; else if(event.button) rightclick = event.button == 2;
	return rightclick;
};
filetree.FileTree.load = function(projectName,path) {
	if(projectName == null) projectName = filetree.FileTree.lastProjectName;
	if(path == null) path = filetree.FileTree.lastProjectPath;
	var filetree1 = new $("#filetree");
	filetree1.on("expand",function(event) {
		var label = filetree1.jqxTree("getItem",event.args.element).label;
		var element2 = new $(event.args.element);
		var loader = false;
		var loaderItem = null;
		var children = element2.find("ul:first").children();
		$.each(children,function(index,value) {
			var item = filetree1.jqxTree("getItem",value);
			if(item != null && item.label == "Loading...") {
				loaderItem = item;
				loader = true;
				return false;
			}
		});
		if(loader) {
			var pathToItem = loaderItem.value;
			var items = filetree.FileTree.readDir2(pathToItem);
			filetree1.jqxTree("addTo",items,element2[0]);
			filetree1.jqxTree("removeItem",loaderItem.element);
			filetree.FileTree.attachContextMenu();
		}
	});
	filetree.FileTree.readDirItems(path,function(source) {
		new $("#filetree").jqxTree({ source : [source]});
		filetree.FileTree.attachContextMenu();
	},true);
	if(filetree.FileTree.watcher != null) {
		filetree.FileTree.watcher.close();
		filetree.FileTree.watcher = null;
	}
	var config = { path : path, listener : function(changeType,filePath,fileCurrentStat,filePreviousStat) {
		switch(changeType) {
		case "create":
			console.log(changeType);
			console.log(filePath);
			js.Node.require("fs").stat(filePath,function(error,stat) {
				if(error == null) {
					if(stat.isFile()) {
						if(changeType == "create") parser.ClasspathWalker.addFile(filePath); else parser.ClasspathWalker.removeFile(filePath);
					} else if(stat.isDirectory()) {
						console.log(changeType);
						console.log(filePath);
					}
				} else console.log(error);
			});
			break;
		case "delete":
			if(js.Node.require("path").extname(filePath) != "") parser.ClasspathWalker.removeFile(filePath);
			break;
		default:
		}
	}};
	config.interval = 3000;
	filetree.FileTree.watcher = Watchr.watch(config);
	filetree.FileTree.lastProjectName = projectName;
	filetree.FileTree.lastProjectPath = path;
};
filetree.FileTree.readDirItems = function(path,onComplete,root) {
	if(root == null) root = false;
	var source = filetree.FileTree.createFolderItem(path,[]);
	source.expanded = true;
	source.items = filetree.FileTree.readDir2(path);
	onComplete(source);
};
filetree.FileTree.readDir2 = function(path) {
	var items = [];
	var pathToFolders = [];
	var pathToFiles = [];
	var fullPath;
	var stat;
	var _g = 0;
	var _g1 = js.Node.require("fs").readdirSync(path);
	while(_g < _g1.length) {
		var pathToItem = _g1[_g];
		++_g;
		if(!watchers.SettingsWatcher.isItemInIgnoreList(pathToItem) && !projectaccess.ProjectAccess.isItemInIgnoreList(pathToItem)) {
			fullPath = js.Node.require("path").join(path,pathToItem);
			stat = js.Node.require("fs").statSync(fullPath);
			if(stat.isDirectory()) pathToFolders.push(fullPath); else if(stat.isFile()) pathToFiles.push(fullPath);
		}
	}
	var type = null;
	type = "folder";
	var item = null;
	var _g2 = 0;
	while(_g2 < pathToFolders.length) {
		var pathToItem1 = pathToFolders[_g2];
		++_g2;
		item = filetree.FileTree.createFolderItem(pathToItem1,[]);
		item.items = [];
		item.items.push({ label : "Loading...", value : pathToItem1});
		items.push(item);
	}
	type = "file";
	var _g3 = 0;
	while(_g3 < pathToFiles.length) {
		var pathToItem2 = pathToFiles[_g3];
		++_g3;
		item = filetree.FileTree.createFileItem(pathToItem2);
		items.push(item);
	}
	return items;
};
filetree.FileTree.createFileItem = function(path) {
	var basename = js.Node.require("path").basename(path);
	var extname = js.Node.require("path").extname(basename);
	var data = { label : basename, value : { path : path, type : "file"}};
	switch(extname) {
	case ".pdf":
		data.icon = "includes/images/page_white_acrobat.png";
		break;
	case ".swf":
		data.icon = "includes/images/page_white_flash.png";
		break;
	case ".jpg":case ".jpeg":case ".png":case ".gif":case ".tga":
		data.icon = "includes/images/photo.png";
		break;
	case ".html":
		data.icon = "includes/images/html.png";
		break;
	default:
	}
	return data;
};
filetree.FileTree.createFolderItem = function(path,items) {
	return { label : js.Node.require("path").basename(path), items : items, value : { path : path, type : "folder"}, icon : "includes/images/folder.png"};
};
haxe.Json = function() { };
$hxClasses["haxe.Json"] = haxe.Json;
haxe.Json.__name__ = ["haxe","Json"];
haxe.Json.parse = function(jsonString) {
	return JSON.parse(jsonString);
};
haxe.Resource = function() { };
$hxClasses["haxe.Resource"] = haxe.Resource;
haxe.Resource.__name__ = ["haxe","Resource"];
haxe.Resource.getString = function(name) {
	var _g = 0;
	var _g1 = haxe.Resource.content;
	while(_g < _g1.length) {
		var x = _g1[_g];
		++_g;
		if(x.name == name) {
			if(x.str != null) return x.str;
			var b = haxe.crypto.Base64.decode(x.data);
			return b.toString();
		}
	}
	return null;
};
haxe.Serializer = function() {
	this.buf = new StringBuf();
	this.cache = new Array();
	this.useCache = haxe.Serializer.USE_CACHE;
	this.useEnumIndex = haxe.Serializer.USE_ENUM_INDEX;
	this.shash = new haxe.ds.StringMap();
	this.scount = 0;
};
$hxClasses["haxe.Serializer"] = haxe.Serializer;
haxe.Serializer.__name__ = ["haxe","Serializer"];
haxe.Serializer.run = function(v) {
	var s = new haxe.Serializer();
	s.serialize(v);
	return s.toString();
};
haxe.Serializer.prototype = {
	buf: null
	,cache: null
	,shash: null
	,scount: null
	,useCache: null
	,useEnumIndex: null
	,toString: function() {
		return this.buf.b;
	}
	,serializeString: function(s) {
		var x = this.shash.get(s);
		if(x != null) {
			this.buf.b += "R";
			if(x == null) this.buf.b += "null"; else this.buf.b += "" + x;
			return;
		}
		this.shash.set(s,this.scount++);
		this.buf.b += "y";
		s = encodeURIComponent(s);
		if(s.length == null) this.buf.b += "null"; else this.buf.b += "" + s.length;
		this.buf.b += ":";
		if(s == null) this.buf.b += "null"; else this.buf.b += "" + s;
	}
	,serializeRef: function(v) {
		var vt = typeof(v);
		var _g1 = 0;
		var _g = this.cache.length;
		while(_g1 < _g) {
			var i = _g1++;
			var ci = this.cache[i];
			if(typeof(ci) == vt && ci == v) {
				this.buf.b += "r";
				if(i == null) this.buf.b += "null"; else this.buf.b += "" + i;
				return true;
			}
		}
		this.cache.push(v);
		return false;
	}
	,serializeFields: function(v) {
		var _g = 0;
		var _g1 = Reflect.fields(v);
		while(_g < _g1.length) {
			var f = _g1[_g];
			++_g;
			this.serializeString(f);
			this.serialize(Reflect.field(v,f));
		}
		this.buf.b += "g";
	}
	,serialize: function(v) {
		{
			var _g = Type["typeof"](v);
			switch(_g[1]) {
			case 0:
				this.buf.b += "n";
				break;
			case 1:
				var v1 = v;
				if(v1 == 0) {
					this.buf.b += "z";
					return;
				}
				this.buf.b += "i";
				if(v1 == null) this.buf.b += "null"; else this.buf.b += "" + v1;
				break;
			case 2:
				var v2 = v;
				if(Math.isNaN(v2)) this.buf.b += "k"; else if(!Math.isFinite(v2)) if(v2 < 0) this.buf.b += "m"; else this.buf.b += "p"; else {
					this.buf.b += "d";
					if(v2 == null) this.buf.b += "null"; else this.buf.b += "" + v2;
				}
				break;
			case 3:
				if(v) this.buf.b += "t"; else this.buf.b += "f";
				break;
			case 6:
				var c = _g[2];
				if(c == String) {
					this.serializeString(v);
					return;
				}
				if(this.useCache && this.serializeRef(v)) return;
				switch(c) {
				case Array:
					var ucount = 0;
					this.buf.b += "a";
					var l = v.length;
					var _g1 = 0;
					while(_g1 < l) {
						var i = _g1++;
						if(v[i] == null) ucount++; else {
							if(ucount > 0) {
								if(ucount == 1) this.buf.b += "n"; else {
									this.buf.b += "u";
									if(ucount == null) this.buf.b += "null"; else this.buf.b += "" + ucount;
								}
								ucount = 0;
							}
							this.serialize(v[i]);
						}
					}
					if(ucount > 0) {
						if(ucount == 1) this.buf.b += "n"; else {
							this.buf.b += "u";
							if(ucount == null) this.buf.b += "null"; else this.buf.b += "" + ucount;
						}
					}
					this.buf.b += "h";
					break;
				case List:
					this.buf.b += "l";
					var v3 = v;
					var $it0 = v3.iterator();
					while( $it0.hasNext() ) {
						var i1 = $it0.next();
						this.serialize(i1);
					}
					this.buf.b += "h";
					break;
				case Date:
					var d = v;
					this.buf.b += "v";
					this.buf.add(HxOverrides.dateStr(d));
					break;
				case haxe.ds.StringMap:
					this.buf.b += "b";
					var v4 = v;
					var $it1 = v4.keys();
					while( $it1.hasNext() ) {
						var k = $it1.next();
						this.serializeString(k);
						this.serialize(v4.get(k));
					}
					this.buf.b += "h";
					break;
				case haxe.ds.IntMap:
					this.buf.b += "q";
					var v5 = v;
					var $it2 = v5.keys();
					while( $it2.hasNext() ) {
						var k1 = $it2.next();
						this.buf.b += ":";
						if(k1 == null) this.buf.b += "null"; else this.buf.b += "" + k1;
						this.serialize(v5.get(k1));
					}
					this.buf.b += "h";
					break;
				case haxe.ds.ObjectMap:
					this.buf.b += "M";
					var v6 = v;
					var $it3 = v6.keys();
					while( $it3.hasNext() ) {
						var k2 = $it3.next();
						var id = Reflect.field(k2,"__id__");
						Reflect.deleteField(k2,"__id__");
						this.serialize(k2);
						k2.__id__ = id;
						this.serialize(v6.h[k2.__id__]);
					}
					this.buf.b += "h";
					break;
				case haxe.io.Bytes:
					var v7 = v;
					var i2 = 0;
					var max = v7.length - 2;
					var charsBuf = new StringBuf();
					var b64 = haxe.Serializer.BASE64;
					while(i2 < max) {
						var b1 = v7.get(i2++);
						var b2 = v7.get(i2++);
						var b3 = v7.get(i2++);
						charsBuf.add(b64.charAt(b1 >> 2));
						charsBuf.add(b64.charAt((b1 << 4 | b2 >> 4) & 63));
						charsBuf.add(b64.charAt((b2 << 2 | b3 >> 6) & 63));
						charsBuf.add(b64.charAt(b3 & 63));
					}
					if(i2 == max) {
						var b11 = v7.get(i2++);
						var b21 = v7.get(i2++);
						charsBuf.add(b64.charAt(b11 >> 2));
						charsBuf.add(b64.charAt((b11 << 4 | b21 >> 4) & 63));
						charsBuf.add(b64.charAt(b21 << 2 & 63));
					} else if(i2 == max + 1) {
						var b12 = v7.get(i2++);
						charsBuf.add(b64.charAt(b12 >> 2));
						charsBuf.add(b64.charAt(b12 << 4 & 63));
					}
					var chars = charsBuf.b;
					this.buf.b += "s";
					if(chars.length == null) this.buf.b += "null"; else this.buf.b += "" + chars.length;
					this.buf.b += ":";
					if(chars == null) this.buf.b += "null"; else this.buf.b += "" + chars;
					break;
				default:
					if(this.useCache) this.cache.pop();
					if(v.hxSerialize != null) {
						this.buf.b += "C";
						this.serializeString(Type.getClassName(c));
						if(this.useCache) this.cache.push(v);
						v.hxSerialize(this);
						this.buf.b += "g";
					} else {
						this.buf.b += "c";
						this.serializeString(Type.getClassName(c));
						if(this.useCache) this.cache.push(v);
						this.serializeFields(v);
					}
				}
				break;
			case 4:
				if(this.useCache && this.serializeRef(v)) return;
				this.buf.b += "o";
				this.serializeFields(v);
				break;
			case 7:
				var e = _g[2];
				if(this.useCache) {
					if(this.serializeRef(v)) return;
					this.cache.pop();
				}
				if(this.useEnumIndex) this.buf.b += "j"; else this.buf.b += "w";
				this.serializeString(Type.getEnumName(e));
				if(this.useEnumIndex) {
					this.buf.b += ":";
					this.buf.b += Std.string(v[1]);
				} else this.serializeString(v[0]);
				this.buf.b += ":";
				var l1 = v.length;
				this.buf.b += Std.string(l1 - 2);
				var _g11 = 2;
				while(_g11 < l1) {
					var i3 = _g11++;
					this.serialize(v[i3]);
				}
				if(this.useCache) this.cache.push(v);
				break;
			case 5:
				throw "Cannot serialize function";
				break;
			default:
				throw "Cannot serialize " + Std.string(v);
			}
		}
	}
	,__class__: haxe.Serializer
};
haxe.Timer = function(time_ms) {
	var me = this;
	this.id = setInterval(function() {
		me.run();
	},time_ms);
};
$hxClasses["haxe.Timer"] = haxe.Timer;
haxe.Timer.__name__ = ["haxe","Timer"];
haxe.Timer.delay = function(f,time_ms) {
	var t = new haxe.Timer(time_ms);
	t.run = function() {
		t.stop();
		f();
	};
	return t;
};
haxe.Timer.prototype = {
	id: null
	,stop: function() {
		if(this.id == null) return;
		clearInterval(this.id);
		this.id = null;
	}
	,run: function() {
	}
	,__class__: haxe.Timer
};
haxe.Unserializer = function(buf) {
	this.buf = buf;
	this.length = buf.length;
	this.pos = 0;
	this.scache = new Array();
	this.cache = new Array();
	var r = haxe.Unserializer.DEFAULT_RESOLVER;
	if(r == null) {
		r = Type;
		haxe.Unserializer.DEFAULT_RESOLVER = r;
	}
	this.setResolver(r);
};
$hxClasses["haxe.Unserializer"] = haxe.Unserializer;
haxe.Unserializer.__name__ = ["haxe","Unserializer"];
haxe.Unserializer.initCodes = function() {
	var codes = new Array();
	var _g1 = 0;
	var _g = haxe.Unserializer.BASE64.length;
	while(_g1 < _g) {
		var i = _g1++;
		codes[haxe.Unserializer.BASE64.charCodeAt(i)] = i;
	}
	return codes;
};
haxe.Unserializer.run = function(v) {
	return new haxe.Unserializer(v).unserialize();
};
haxe.Unserializer.prototype = {
	buf: null
	,pos: null
	,length: null
	,cache: null
	,scache: null
	,resolver: null
	,setResolver: function(r) {
		if(r == null) this.resolver = { resolveClass : function(_) {
			return null;
		}, resolveEnum : function(_1) {
			return null;
		}}; else this.resolver = r;
	}
	,get: function(p) {
		return this.buf.charCodeAt(p);
	}
	,readDigits: function() {
		var k = 0;
		var s = false;
		var fpos = this.pos;
		while(true) {
			var c = this.buf.charCodeAt(this.pos);
			if(c != c) break;
			if(c == 45) {
				if(this.pos != fpos) break;
				s = true;
				this.pos++;
				continue;
			}
			if(c < 48 || c > 57) break;
			k = k * 10 + (c - 48);
			this.pos++;
		}
		if(s) k *= -1;
		return k;
	}
	,unserializeObject: function(o) {
		while(true) {
			if(this.pos >= this.length) throw "Invalid object";
			if(this.buf.charCodeAt(this.pos) == 103) break;
			var k = this.unserialize();
			if(!(typeof(k) == "string")) throw "Invalid object key";
			var v = this.unserialize();
			o[k] = v;
		}
		this.pos++;
	}
	,unserializeEnum: function(edecl,tag) {
		if(this.get(this.pos++) != 58) throw "Invalid enum format";
		var nargs = this.readDigits();
		if(nargs == 0) return Type.createEnum(edecl,tag);
		var args = new Array();
		while(nargs-- > 0) args.push(this.unserialize());
		return Type.createEnum(edecl,tag,args);
	}
	,unserialize: function() {
		var _g = this.get(this.pos++);
		switch(_g) {
		case 110:
			return null;
		case 116:
			return true;
		case 102:
			return false;
		case 122:
			return 0;
		case 105:
			return this.readDigits();
		case 100:
			var p1 = this.pos;
			while(true) {
				var c = this.buf.charCodeAt(this.pos);
				if(c >= 43 && c < 58 || c == 101 || c == 69) this.pos++; else break;
			}
			return Std.parseFloat(HxOverrides.substr(this.buf,p1,this.pos - p1));
		case 121:
			var len = this.readDigits();
			if(this.get(this.pos++) != 58 || this.length - this.pos < len) throw "Invalid string length";
			var s = HxOverrides.substr(this.buf,this.pos,len);
			this.pos += len;
			s = decodeURIComponent(s.split("+").join(" "));
			this.scache.push(s);
			return s;
		case 107:
			return Math.NaN;
		case 109:
			return Math.NEGATIVE_INFINITY;
		case 112:
			return Math.POSITIVE_INFINITY;
		case 97:
			var buf = this.buf;
			var a = new Array();
			this.cache.push(a);
			while(true) {
				var c1 = this.buf.charCodeAt(this.pos);
				if(c1 == 104) {
					this.pos++;
					break;
				}
				if(c1 == 117) {
					this.pos++;
					var n = this.readDigits();
					a[a.length + n - 1] = null;
				} else a.push(this.unserialize());
			}
			return a;
		case 111:
			var o = { };
			this.cache.push(o);
			this.unserializeObject(o);
			return o;
		case 114:
			var n1 = this.readDigits();
			if(n1 < 0 || n1 >= this.cache.length) throw "Invalid reference";
			return this.cache[n1];
		case 82:
			var n2 = this.readDigits();
			if(n2 < 0 || n2 >= this.scache.length) throw "Invalid string reference";
			return this.scache[n2];
		case 120:
			throw this.unserialize();
			break;
		case 99:
			var name = this.unserialize();
			var cl = this.resolver.resolveClass(name);
			if(cl == null) throw "Class not found " + name;
			var o1 = Type.createEmptyInstance(cl);
			this.cache.push(o1);
			this.unserializeObject(o1);
			return o1;
		case 119:
			var name1 = this.unserialize();
			var edecl = this.resolver.resolveEnum(name1);
			if(edecl == null) throw "Enum not found " + name1;
			var e = this.unserializeEnum(edecl,this.unserialize());
			this.cache.push(e);
			return e;
		case 106:
			var name2 = this.unserialize();
			var edecl1 = this.resolver.resolveEnum(name2);
			if(edecl1 == null) throw "Enum not found " + name2;
			this.pos++;
			var index = this.readDigits();
			var tag = Type.getEnumConstructs(edecl1)[index];
			if(tag == null) throw "Unknown enum index " + name2 + "@" + index;
			var e1 = this.unserializeEnum(edecl1,tag);
			this.cache.push(e1);
			return e1;
		case 108:
			var l = new List();
			this.cache.push(l);
			var buf1 = this.buf;
			while(this.buf.charCodeAt(this.pos) != 104) l.add(this.unserialize());
			this.pos++;
			return l;
		case 98:
			var h = new haxe.ds.StringMap();
			this.cache.push(h);
			var buf2 = this.buf;
			while(this.buf.charCodeAt(this.pos) != 104) {
				var s1 = this.unserialize();
				h.set(s1,this.unserialize());
			}
			this.pos++;
			return h;
		case 113:
			var h1 = new haxe.ds.IntMap();
			this.cache.push(h1);
			var buf3 = this.buf;
			var c2 = this.get(this.pos++);
			while(c2 == 58) {
				var i = this.readDigits();
				h1.set(i,this.unserialize());
				c2 = this.get(this.pos++);
			}
			if(c2 != 104) throw "Invalid IntMap format";
			return h1;
		case 77:
			var h2 = new haxe.ds.ObjectMap();
			this.cache.push(h2);
			var buf4 = this.buf;
			while(this.buf.charCodeAt(this.pos) != 104) {
				var s2 = this.unserialize();
				h2.set(s2,this.unserialize());
			}
			this.pos++;
			return h2;
		case 118:
			var d;
			var s3 = HxOverrides.substr(this.buf,this.pos,19);
			d = HxOverrides.strDate(s3);
			this.cache.push(d);
			this.pos += 19;
			return d;
		case 115:
			var len1 = this.readDigits();
			var buf5 = this.buf;
			if(this.get(this.pos++) != 58 || this.length - this.pos < len1) throw "Invalid bytes length";
			var codes = haxe.Unserializer.CODES;
			if(codes == null) {
				codes = haxe.Unserializer.initCodes();
				haxe.Unserializer.CODES = codes;
			}
			var i1 = this.pos;
			var rest = len1 & 3;
			var size;
			size = (len1 >> 2) * 3 + (rest >= 2?rest - 1:0);
			var max = i1 + (len1 - rest);
			var bytes = haxe.io.Bytes.alloc(size);
			var bpos = 0;
			while(i1 < max) {
				var c11 = codes[StringTools.fastCodeAt(buf5,i1++)];
				var c21 = codes[StringTools.fastCodeAt(buf5,i1++)];
				bytes.set(bpos++,c11 << 2 | c21 >> 4);
				var c3 = codes[StringTools.fastCodeAt(buf5,i1++)];
				bytes.set(bpos++,c21 << 4 | c3 >> 2);
				var c4 = codes[StringTools.fastCodeAt(buf5,i1++)];
				bytes.set(bpos++,c3 << 6 | c4);
			}
			if(rest >= 2) {
				var c12 = codes[StringTools.fastCodeAt(buf5,i1++)];
				var c22 = codes[StringTools.fastCodeAt(buf5,i1++)];
				bytes.set(bpos++,c12 << 2 | c22 >> 4);
				if(rest == 3) {
					var c31 = codes[StringTools.fastCodeAt(buf5,i1++)];
					bytes.set(bpos++,c22 << 4 | c31 >> 2);
				}
			}
			this.pos += len1;
			this.cache.push(bytes);
			return bytes;
		case 67:
			var name3 = this.unserialize();
			var cl1 = this.resolver.resolveClass(name3);
			if(cl1 == null) throw "Class not found " + name3;
			var o2 = Type.createEmptyInstance(cl1);
			this.cache.push(o2);
			o2.hxUnserialize(this);
			if(this.get(this.pos++) != 103) throw "Invalid custom data";
			return o2;
		default:
		}
		this.pos--;
		throw "Invalid char " + this.buf.charAt(this.pos) + " at position " + this.pos;
	}
	,__class__: haxe.Unserializer
};
haxe.Utf8 = function(size) {
	this.__b = "";
};
$hxClasses["haxe.Utf8"] = haxe.Utf8;
haxe.Utf8.__name__ = ["haxe","Utf8"];
haxe.Utf8.prototype = {
	__b: null
	,__class__: haxe.Utf8
};
haxe.io = {};
haxe.io.Bytes = function(length,b) {
	this.length = length;
	this.b = b;
};
$hxClasses["haxe.io.Bytes"] = haxe.io.Bytes;
haxe.io.Bytes.__name__ = ["haxe","io","Bytes"];
haxe.io.Bytes.alloc = function(length) {
	return new haxe.io.Bytes(length,new Buffer(length));
};
haxe.io.Bytes.ofString = function(s) {
	var nb = new Buffer(s,"utf8");
	return new haxe.io.Bytes(nb.length,nb);
};
haxe.io.Bytes.prototype = {
	length: null
	,b: null
	,get: function(pos) {
		return this.b[pos];
	}
	,set: function(pos,v) {
		this.b[pos] = v;
	}
	,readString: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
		var s = "";
		var b = this.b;
		var fcc = String.fromCharCode;
		var i = pos;
		var max = pos + len;
		while(i < max) {
			var c = b[i++];
			if(c < 128) {
				if(c == 0) break;
				s += fcc(c);
			} else if(c < 224) s += fcc((c & 63) << 6 | b[i++] & 127); else if(c < 240) {
				var c2 = b[i++];
				s += fcc((c & 31) << 12 | (c2 & 127) << 6 | b[i++] & 127);
			} else {
				var c21 = b[i++];
				var c3 = b[i++];
				s += fcc((c & 15) << 18 | (c21 & 127) << 12 | c3 << 6 & 127 | b[i++] & 127);
			}
		}
		return s;
	}
	,toString: function() {
		return this.readString(0,this.length);
	}
	,__class__: haxe.io.Bytes
};
haxe.crypto = {};
haxe.crypto.Base64 = function() { };
$hxClasses["haxe.crypto.Base64"] = haxe.crypto.Base64;
haxe.crypto.Base64.__name__ = ["haxe","crypto","Base64"];
haxe.crypto.Base64.decode = function(str,complement) {
	if(complement == null) complement = true;
	if(complement) while(HxOverrides.cca(str,str.length - 1) == 61) str = HxOverrides.substr(str,0,-1);
	return new haxe.crypto.BaseCode(haxe.crypto.Base64.BYTES).decodeBytes(haxe.io.Bytes.ofString(str));
};
haxe.crypto.BaseCode = function(base) {
	var len = base.length;
	var nbits = 1;
	while(len > 1 << nbits) nbits++;
	if(nbits > 8 || len != 1 << nbits) throw "BaseCode : base length must be a power of two.";
	this.base = base;
	this.nbits = nbits;
};
$hxClasses["haxe.crypto.BaseCode"] = haxe.crypto.BaseCode;
haxe.crypto.BaseCode.__name__ = ["haxe","crypto","BaseCode"];
haxe.crypto.BaseCode.prototype = {
	base: null
	,nbits: null
	,tbl: null
	,initTable: function() {
		var tbl = new Array();
		var _g = 0;
		while(_g < 256) {
			var i = _g++;
			tbl[i] = -1;
		}
		var _g1 = 0;
		var _g2 = this.base.length;
		while(_g1 < _g2) {
			var i1 = _g1++;
			tbl[this.base.b[i1]] = i1;
		}
		this.tbl = tbl;
	}
	,decodeBytes: function(b) {
		var nbits = this.nbits;
		var base = this.base;
		if(this.tbl == null) this.initTable();
		var tbl = this.tbl;
		var size = b.length * nbits >> 3;
		var out = haxe.io.Bytes.alloc(size);
		var buf = 0;
		var curbits = 0;
		var pin = 0;
		var pout = 0;
		while(pout < size) {
			while(curbits < 8) {
				curbits += nbits;
				buf <<= nbits;
				var i = tbl[b.get(pin++)];
				if(i == -1) throw "BaseCode : invalid encoded char";
				buf |= i;
			}
			curbits -= 8;
			out.set(pout++,buf >> curbits & 255);
		}
		return out;
	}
	,__class__: haxe.crypto.BaseCode
};
haxe.ds.GenericCell = function(elt,next) {
	this.elt = elt;
	this.next = next;
};
$hxClasses["haxe.ds.GenericCell"] = haxe.ds.GenericCell;
haxe.ds.GenericCell.__name__ = ["haxe","ds","GenericCell"];
haxe.ds.GenericCell.prototype = {
	elt: null
	,next: null
	,__class__: haxe.ds.GenericCell
};
haxe.ds.IntMap = function() {
	this.h = { };
};
$hxClasses["haxe.ds.IntMap"] = haxe.ds.IntMap;
haxe.ds.IntMap.__name__ = ["haxe","ds","IntMap"];
haxe.ds.IntMap.__interfaces__ = [IMap];
haxe.ds.IntMap.prototype = {
	h: null
	,set: function(key,value) {
		this.h[key] = value;
	}
	,get: function(key) {
		return this.h[key];
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key | 0);
		}
		return HxOverrides.iter(a);
	}
	,__class__: haxe.ds.IntMap
};
haxe.ds.ObjectMap = function() {
	this.h = { };
	this.h.__keys__ = { };
};
$hxClasses["haxe.ds.ObjectMap"] = haxe.ds.ObjectMap;
haxe.ds.ObjectMap.__name__ = ["haxe","ds","ObjectMap"];
haxe.ds.ObjectMap.__interfaces__ = [IMap];
haxe.ds.ObjectMap.prototype = {
	h: null
	,set: function(key,value) {
		var id = key.__id__ || (key.__id__ = ++haxe.ds.ObjectMap.count);
		this.h[id] = value;
		this.h.__keys__[id] = key;
	}
	,get: function(key) {
		return this.h[key.__id__];
	}
	,keys: function() {
		var a = [];
		for( var key in this.h.__keys__ ) {
		if(this.h.hasOwnProperty(key)) a.push(this.h.__keys__[key]);
		}
		return HxOverrides.iter(a);
	}
	,__class__: haxe.ds.ObjectMap
};
haxe.ds.Option = $hxClasses["haxe.ds.Option"] = { __ename__ : ["haxe","ds","Option"], __constructs__ : ["Some","None"] };
haxe.ds.Option.Some = function(v) { var $x = ["Some",0,v]; $x.__enum__ = haxe.ds.Option; $x.toString = $estr; return $x; };
haxe.ds.Option.None = ["None",1];
haxe.ds.Option.None.toString = $estr;
haxe.ds.Option.None.__enum__ = haxe.ds.Option;
haxe.io.Eof = function() {
};
$hxClasses["haxe.io.Eof"] = haxe.io.Eof;
haxe.io.Eof.__name__ = ["haxe","io","Eof"];
haxe.io.Eof.prototype = {
	toString: function() {
		return "Eof";
	}
	,__class__: haxe.io.Eof
};
haxe.io.Error = $hxClasses["haxe.io.Error"] = { __ename__ : ["haxe","io","Error"], __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] };
haxe.io.Error.Blocked = ["Blocked",0];
haxe.io.Error.Blocked.toString = $estr;
haxe.io.Error.Blocked.__enum__ = haxe.io.Error;
haxe.io.Error.Overflow = ["Overflow",1];
haxe.io.Error.Overflow.toString = $estr;
haxe.io.Error.Overflow.__enum__ = haxe.io.Error;
haxe.io.Error.OutsideBounds = ["OutsideBounds",2];
haxe.io.Error.OutsideBounds.toString = $estr;
haxe.io.Error.OutsideBounds.__enum__ = haxe.io.Error;
haxe.io.Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe.io.Error; $x.toString = $estr; return $x; };
haxe.macro = {};
haxe.macro.Constant = $hxClasses["haxe.macro.Constant"] = { __ename__ : ["haxe","macro","Constant"], __constructs__ : ["CInt","CFloat","CString","CIdent","CRegexp"] };
haxe.macro.Constant.CInt = function(v) { var $x = ["CInt",0,v]; $x.__enum__ = haxe.macro.Constant; $x.toString = $estr; return $x; };
haxe.macro.Constant.CFloat = function(f) { var $x = ["CFloat",1,f]; $x.__enum__ = haxe.macro.Constant; $x.toString = $estr; return $x; };
haxe.macro.Constant.CString = function(s) { var $x = ["CString",2,s]; $x.__enum__ = haxe.macro.Constant; $x.toString = $estr; return $x; };
haxe.macro.Constant.CIdent = function(s) { var $x = ["CIdent",3,s]; $x.__enum__ = haxe.macro.Constant; $x.toString = $estr; return $x; };
haxe.macro.Constant.CRegexp = function(r,opt) { var $x = ["CRegexp",4,r,opt]; $x.__enum__ = haxe.macro.Constant; $x.toString = $estr; return $x; };
haxe.macro.Binop = $hxClasses["haxe.macro.Binop"] = { __ename__ : ["haxe","macro","Binop"], __constructs__ : ["OpAdd","OpMult","OpDiv","OpSub","OpAssign","OpEq","OpNotEq","OpGt","OpGte","OpLt","OpLte","OpAnd","OpOr","OpXor","OpBoolAnd","OpBoolOr","OpShl","OpShr","OpUShr","OpMod","OpAssignOp","OpInterval","OpArrow"] };
haxe.macro.Binop.OpAdd = ["OpAdd",0];
haxe.macro.Binop.OpAdd.toString = $estr;
haxe.macro.Binop.OpAdd.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpMult = ["OpMult",1];
haxe.macro.Binop.OpMult.toString = $estr;
haxe.macro.Binop.OpMult.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpDiv = ["OpDiv",2];
haxe.macro.Binop.OpDiv.toString = $estr;
haxe.macro.Binop.OpDiv.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpSub = ["OpSub",3];
haxe.macro.Binop.OpSub.toString = $estr;
haxe.macro.Binop.OpSub.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpAssign = ["OpAssign",4];
haxe.macro.Binop.OpAssign.toString = $estr;
haxe.macro.Binop.OpAssign.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpEq = ["OpEq",5];
haxe.macro.Binop.OpEq.toString = $estr;
haxe.macro.Binop.OpEq.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpNotEq = ["OpNotEq",6];
haxe.macro.Binop.OpNotEq.toString = $estr;
haxe.macro.Binop.OpNotEq.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpGt = ["OpGt",7];
haxe.macro.Binop.OpGt.toString = $estr;
haxe.macro.Binop.OpGt.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpGte = ["OpGte",8];
haxe.macro.Binop.OpGte.toString = $estr;
haxe.macro.Binop.OpGte.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpLt = ["OpLt",9];
haxe.macro.Binop.OpLt.toString = $estr;
haxe.macro.Binop.OpLt.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpLte = ["OpLte",10];
haxe.macro.Binop.OpLte.toString = $estr;
haxe.macro.Binop.OpLte.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpAnd = ["OpAnd",11];
haxe.macro.Binop.OpAnd.toString = $estr;
haxe.macro.Binop.OpAnd.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpOr = ["OpOr",12];
haxe.macro.Binop.OpOr.toString = $estr;
haxe.macro.Binop.OpOr.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpXor = ["OpXor",13];
haxe.macro.Binop.OpXor.toString = $estr;
haxe.macro.Binop.OpXor.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpBoolAnd = ["OpBoolAnd",14];
haxe.macro.Binop.OpBoolAnd.toString = $estr;
haxe.macro.Binop.OpBoolAnd.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpBoolOr = ["OpBoolOr",15];
haxe.macro.Binop.OpBoolOr.toString = $estr;
haxe.macro.Binop.OpBoolOr.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpShl = ["OpShl",16];
haxe.macro.Binop.OpShl.toString = $estr;
haxe.macro.Binop.OpShl.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpShr = ["OpShr",17];
haxe.macro.Binop.OpShr.toString = $estr;
haxe.macro.Binop.OpShr.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpUShr = ["OpUShr",18];
haxe.macro.Binop.OpUShr.toString = $estr;
haxe.macro.Binop.OpUShr.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpMod = ["OpMod",19];
haxe.macro.Binop.OpMod.toString = $estr;
haxe.macro.Binop.OpMod.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpAssignOp = function(op) { var $x = ["OpAssignOp",20,op]; $x.__enum__ = haxe.macro.Binop; $x.toString = $estr; return $x; };
haxe.macro.Binop.OpInterval = ["OpInterval",21];
haxe.macro.Binop.OpInterval.toString = $estr;
haxe.macro.Binop.OpInterval.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpArrow = ["OpArrow",22];
haxe.macro.Binop.OpArrow.toString = $estr;
haxe.macro.Binop.OpArrow.__enum__ = haxe.macro.Binop;
haxe.macro.Unop = $hxClasses["haxe.macro.Unop"] = { __ename__ : ["haxe","macro","Unop"], __constructs__ : ["OpIncrement","OpDecrement","OpNot","OpNeg","OpNegBits"] };
haxe.macro.Unop.OpIncrement = ["OpIncrement",0];
haxe.macro.Unop.OpIncrement.toString = $estr;
haxe.macro.Unop.OpIncrement.__enum__ = haxe.macro.Unop;
haxe.macro.Unop.OpDecrement = ["OpDecrement",1];
haxe.macro.Unop.OpDecrement.toString = $estr;
haxe.macro.Unop.OpDecrement.__enum__ = haxe.macro.Unop;
haxe.macro.Unop.OpNot = ["OpNot",2];
haxe.macro.Unop.OpNot.toString = $estr;
haxe.macro.Unop.OpNot.__enum__ = haxe.macro.Unop;
haxe.macro.Unop.OpNeg = ["OpNeg",3];
haxe.macro.Unop.OpNeg.toString = $estr;
haxe.macro.Unop.OpNeg.__enum__ = haxe.macro.Unop;
haxe.macro.Unop.OpNegBits = ["OpNegBits",4];
haxe.macro.Unop.OpNegBits.toString = $estr;
haxe.macro.Unop.OpNegBits.__enum__ = haxe.macro.Unop;
haxe.macro.ExprDef = $hxClasses["haxe.macro.ExprDef"] = { __ename__ : ["haxe","macro","ExprDef"], __constructs__ : ["EConst","EArray","EBinop","EField","EParenthesis","EObjectDecl","EArrayDecl","ECall","ENew","EUnop","EVars","EFunction","EBlock","EFor","EIn","EIf","EWhile","ESwitch","ETry","EReturn","EBreak","EContinue","EUntyped","EThrow","ECast","EDisplay","EDisplayNew","ETernary","ECheckType","EMeta"] };
haxe.macro.ExprDef.EConst = function(c) { var $x = ["EConst",0,c]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EArray = function(e1,e2) { var $x = ["EArray",1,e1,e2]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EBinop = function(op,e1,e2) { var $x = ["EBinop",2,op,e1,e2]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EField = function(e,field) { var $x = ["EField",3,e,field]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EParenthesis = function(e) { var $x = ["EParenthesis",4,e]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EObjectDecl = function(fields) { var $x = ["EObjectDecl",5,fields]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EArrayDecl = function(values) { var $x = ["EArrayDecl",6,values]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.ECall = function(e,params) { var $x = ["ECall",7,e,params]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.ENew = function(t,params) { var $x = ["ENew",8,t,params]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EUnop = function(op,postFix,e) { var $x = ["EUnop",9,op,postFix,e]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EVars = function(vars) { var $x = ["EVars",10,vars]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EFunction = function(name,f) { var $x = ["EFunction",11,name,f]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EBlock = function(exprs) { var $x = ["EBlock",12,exprs]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EFor = function(it,expr) { var $x = ["EFor",13,it,expr]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EIn = function(e1,e2) { var $x = ["EIn",14,e1,e2]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EIf = function(econd,eif,eelse) { var $x = ["EIf",15,econd,eif,eelse]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EWhile = function(econd,e,normalWhile) { var $x = ["EWhile",16,econd,e,normalWhile]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.ESwitch = function(e,cases,edef) { var $x = ["ESwitch",17,e,cases,edef]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.ETry = function(e,catches) { var $x = ["ETry",18,e,catches]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EReturn = function(e) { var $x = ["EReturn",19,e]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EBreak = ["EBreak",20];
haxe.macro.ExprDef.EBreak.toString = $estr;
haxe.macro.ExprDef.EBreak.__enum__ = haxe.macro.ExprDef;
haxe.macro.ExprDef.EContinue = ["EContinue",21];
haxe.macro.ExprDef.EContinue.toString = $estr;
haxe.macro.ExprDef.EContinue.__enum__ = haxe.macro.ExprDef;
haxe.macro.ExprDef.EUntyped = function(e) { var $x = ["EUntyped",22,e]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EThrow = function(e) { var $x = ["EThrow",23,e]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.ECast = function(e,t) { var $x = ["ECast",24,e,t]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EDisplay = function(e,isCall) { var $x = ["EDisplay",25,e,isCall]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EDisplayNew = function(t) { var $x = ["EDisplayNew",26,t]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.ETernary = function(econd,eif,eelse) { var $x = ["ETernary",27,econd,eif,eelse]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.ECheckType = function(e,t) { var $x = ["ECheckType",28,e,t]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ExprDef.EMeta = function(s,e) { var $x = ["EMeta",29,s,e]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; };
haxe.macro.ComplexType = $hxClasses["haxe.macro.ComplexType"] = { __ename__ : ["haxe","macro","ComplexType"], __constructs__ : ["TPath","TFunction","TAnonymous","TParent","TExtend","TOptional"] };
haxe.macro.ComplexType.TPath = function(p) { var $x = ["TPath",0,p]; $x.__enum__ = haxe.macro.ComplexType; $x.toString = $estr; return $x; };
haxe.macro.ComplexType.TFunction = function(args,ret) { var $x = ["TFunction",1,args,ret]; $x.__enum__ = haxe.macro.ComplexType; $x.toString = $estr; return $x; };
haxe.macro.ComplexType.TAnonymous = function(fields) { var $x = ["TAnonymous",2,fields]; $x.__enum__ = haxe.macro.ComplexType; $x.toString = $estr; return $x; };
haxe.macro.ComplexType.TParent = function(t) { var $x = ["TParent",3,t]; $x.__enum__ = haxe.macro.ComplexType; $x.toString = $estr; return $x; };
haxe.macro.ComplexType.TExtend = function(p,fields) { var $x = ["TExtend",4,p,fields]; $x.__enum__ = haxe.macro.ComplexType; $x.toString = $estr; return $x; };
haxe.macro.ComplexType.TOptional = function(t) { var $x = ["TOptional",5,t]; $x.__enum__ = haxe.macro.ComplexType; $x.toString = $estr; return $x; };
haxe.macro.TypeParam = $hxClasses["haxe.macro.TypeParam"] = { __ename__ : ["haxe","macro","TypeParam"], __constructs__ : ["TPType","TPExpr"] };
haxe.macro.TypeParam.TPType = function(t) { var $x = ["TPType",0,t]; $x.__enum__ = haxe.macro.TypeParam; $x.toString = $estr; return $x; };
haxe.macro.TypeParam.TPExpr = function(e) { var $x = ["TPExpr",1,e]; $x.__enum__ = haxe.macro.TypeParam; $x.toString = $estr; return $x; };
haxe.macro.Access = $hxClasses["haxe.macro.Access"] = { __ename__ : ["haxe","macro","Access"], __constructs__ : ["APublic","APrivate","AStatic","AOverride","ADynamic","AInline","AMacro"] };
haxe.macro.Access.APublic = ["APublic",0];
haxe.macro.Access.APublic.toString = $estr;
haxe.macro.Access.APublic.__enum__ = haxe.macro.Access;
haxe.macro.Access.APrivate = ["APrivate",1];
haxe.macro.Access.APrivate.toString = $estr;
haxe.macro.Access.APrivate.__enum__ = haxe.macro.Access;
haxe.macro.Access.AStatic = ["AStatic",2];
haxe.macro.Access.AStatic.toString = $estr;
haxe.macro.Access.AStatic.__enum__ = haxe.macro.Access;
haxe.macro.Access.AOverride = ["AOverride",3];
haxe.macro.Access.AOverride.toString = $estr;
haxe.macro.Access.AOverride.__enum__ = haxe.macro.Access;
haxe.macro.Access.ADynamic = ["ADynamic",4];
haxe.macro.Access.ADynamic.toString = $estr;
haxe.macro.Access.ADynamic.__enum__ = haxe.macro.Access;
haxe.macro.Access.AInline = ["AInline",5];
haxe.macro.Access.AInline.toString = $estr;
haxe.macro.Access.AInline.__enum__ = haxe.macro.Access;
haxe.macro.Access.AMacro = ["AMacro",6];
haxe.macro.Access.AMacro.toString = $estr;
haxe.macro.Access.AMacro.__enum__ = haxe.macro.Access;
haxe.macro.FieldType = $hxClasses["haxe.macro.FieldType"] = { __ename__ : ["haxe","macro","FieldType"], __constructs__ : ["FVar","FFun","FProp"] };
haxe.macro.FieldType.FVar = function(t,e) { var $x = ["FVar",0,t,e]; $x.__enum__ = haxe.macro.FieldType; $x.toString = $estr; return $x; };
haxe.macro.FieldType.FFun = function(f) { var $x = ["FFun",1,f]; $x.__enum__ = haxe.macro.FieldType; $x.toString = $estr; return $x; };
haxe.macro.FieldType.FProp = function(get,set,t,e) { var $x = ["FProp",2,get,set,t,e]; $x.__enum__ = haxe.macro.FieldType; $x.toString = $estr; return $x; };
haxe.macro.ExprTools = function() { };
$hxClasses["haxe.macro.ExprTools"] = haxe.macro.ExprTools;
haxe.macro.ExprTools.__name__ = ["haxe","macro","ExprTools"];
haxe.macro.ExprTools.toString = function(e) {
	return new haxe.macro.Printer().printExpr(e);
};
haxe.macro.Printer = function(tabString) {
	if(tabString == null) tabString = "\t";
	this.tabs = "";
	this.tabString = tabString;
};
$hxClasses["haxe.macro.Printer"] = haxe.macro.Printer;
haxe.macro.Printer.__name__ = ["haxe","macro","Printer"];
haxe.macro.Printer.prototype = {
	tabs: null
	,tabString: null
	,printUnop: function(op) {
		switch(op[1]) {
		case 0:
			return "++";
		case 1:
			return "--";
		case 2:
			return "!";
		case 3:
			return "-";
		case 4:
			return "~";
		}
	}
	,printBinop: function(op) {
		switch(op[1]) {
		case 0:
			return "+";
		case 1:
			return "*";
		case 2:
			return "/";
		case 3:
			return "-";
		case 4:
			return "=";
		case 5:
			return "==";
		case 6:
			return "!=";
		case 7:
			return ">";
		case 8:
			return ">=";
		case 9:
			return "<";
		case 10:
			return "<=";
		case 11:
			return "&";
		case 12:
			return "|";
		case 13:
			return "^";
		case 14:
			return "&&";
		case 15:
			return "||";
		case 16:
			return "<<";
		case 17:
			return ">>";
		case 18:
			return ">>>";
		case 19:
			return "%";
		case 21:
			return "...";
		case 22:
			return "=>";
		case 20:
			var op1 = op[2];
			return this.printBinop(op1) + "=";
		}
	}
	,printString: function(s) {
		return "\"" + s.split("\n").join("\\n").split("\t").join("\\t").split("'").join("\\'").split("\"").join("\\\"") + "\"";
	}
	,printConstant: function(c) {
		switch(c[1]) {
		case 2:
			var s = c[2];
			return this.printString(s);
		case 3:
			var s1 = c[2];
			return s1;
		case 0:
			var s1 = c[2];
			return s1;
		case 1:
			var s1 = c[2];
			return s1;
		case 4:
			var opt = c[3];
			var s2 = c[2];
			return "~/" + s2 + "/" + opt;
		}
	}
	,printTypeParam: function(param) {
		switch(param[1]) {
		case 0:
			var ct = param[2];
			return this.printComplexType(ct);
		case 1:
			var e = param[2];
			return this.printExpr(e);
		}
	}
	,printTypePath: function(tp) {
		return (tp.pack.length > 0?tp.pack.join(".") + ".":"") + tp.name + (tp.sub != null?"." + tp.sub:"") + (tp.params.length > 0?"<" + tp.params.map($bind(this,this.printTypeParam)).join(", ") + ">":"");
	}
	,printComplexType: function(ct) {
		switch(ct[1]) {
		case 0:
			var tp = ct[2];
			return this.printTypePath(tp);
		case 1:
			var ret = ct[3];
			var args = ct[2];
			return (args.length > 0?args.map($bind(this,this.printComplexType)).join(" -> "):"Void") + " -> " + this.printComplexType(ret);
		case 2:
			var fields = ct[2];
			return "{ " + ((function($this) {
				var $r;
				var _g = [];
				{
					var _g1 = 0;
					while(_g1 < fields.length) {
						var f = fields[_g1];
						++_g1;
						_g.push($this.printField(f) + "; ");
					}
				}
				$r = _g;
				return $r;
			}(this))).join("") + "}";
		case 3:
			var ct1 = ct[2];
			return "(" + this.printComplexType(ct1) + ")";
		case 5:
			var ct2 = ct[2];
			return "?" + this.printComplexType(ct2);
		case 4:
			var fields1 = ct[3];
			var tpl = ct[2];
			return "{> " + tpl.map($bind(this,this.printTypePath)).join(" >, ") + ", " + fields1.map($bind(this,this.printField)).join(", ") + " }";
		}
	}
	,printMetadata: function(meta) {
		return "@" + meta.name + (meta.params.length > 0?"(" + this.printExprs(meta.params,", ") + ")":"");
	}
	,printAccess: function(access) {
		switch(access[1]) {
		case 2:
			return "static";
		case 0:
			return "public";
		case 1:
			return "private";
		case 3:
			return "override";
		case 5:
			return "inline";
		case 4:
			return "dynamic";
		case 6:
			return "macro";
		}
	}
	,printField: function(field) {
		return (field.doc != null && field.doc != ""?"/**\n" + this.tabs + this.tabString + StringTools.replace(field.doc,"\n","\n" + this.tabs + this.tabString) + "\n" + this.tabs + "**/\n" + this.tabs:"") + (field.meta != null && field.meta.length > 0?field.meta.map($bind(this,this.printMetadata)).join("\n" + this.tabs) + ("\n" + this.tabs):"") + (field.access != null && field.access.length > 0?field.access.map($bind(this,this.printAccess)).join(" ") + " ":"") + (function($this) {
			var $r;
			var _g = field.kind;
			$r = (function($this) {
				var $r;
				switch(_g[1]) {
				case 0:
					$r = (function($this) {
						var $r;
						var eo = _g[3];
						var t = _g[2];
						$r = "var " + field.name + $this.opt(t,$bind($this,$this.printComplexType)," : ") + $this.opt(eo,$bind($this,$this.printExpr)," = ");
						return $r;
					}($this));
					break;
				case 2:
					$r = (function($this) {
						var $r;
						var eo1 = _g[5];
						var t1 = _g[4];
						var set = _g[3];
						var get = _g[2];
						$r = "var " + field.name + "(" + get + ", " + set + ")" + $this.opt(t1,$bind($this,$this.printComplexType)," : ") + $this.opt(eo1,$bind($this,$this.printExpr)," = ");
						return $r;
					}($this));
					break;
				case 1:
					$r = (function($this) {
						var $r;
						var func = _g[2];
						$r = "function " + field.name + $this.printFunction(func);
						return $r;
					}($this));
					break;
				}
				return $r;
			}($this));
			return $r;
		}(this));
	}
	,printTypeParamDecl: function(tpd) {
		return tpd.name + (tpd.params != null && tpd.params.length > 0?"<" + tpd.params.map($bind(this,this.printTypeParamDecl)).join(", ") + ">":"") + (tpd.constraints != null && tpd.constraints.length > 0?":(" + tpd.constraints.map($bind(this,this.printComplexType)).join(", ") + ")":"");
	}
	,printFunctionArg: function(arg) {
		return (arg.opt?"?":"") + arg.name + this.opt(arg.type,$bind(this,this.printComplexType),":") + this.opt(arg.value,$bind(this,this.printExpr)," = ");
	}
	,printFunction: function(func) {
		return (func.params.length > 0?"<" + func.params.map($bind(this,this.printTypeParamDecl)).join(", ") + ">":"") + "(" + func.args.map($bind(this,this.printFunctionArg)).join(", ") + ")" + this.opt(func.ret,$bind(this,this.printComplexType),":") + this.opt(func.expr,$bind(this,this.printExpr)," ");
	}
	,printVar: function(v) {
		return v.name + this.opt(v.type,$bind(this,this.printComplexType),":") + this.opt(v.expr,$bind(this,this.printExpr)," = ");
	}
	,printExpr: function(e) {
		var _g1 = this;
		if(e == null) return "#NULL"; else {
			var _g = e.expr;
			switch(_g[1]) {
			case 0:
				var c = _g[2];
				return this.printConstant(c);
			case 1:
				var e2 = _g[3];
				var e1 = _g[2];
				return "" + this.printExpr(e1) + "[" + this.printExpr(e2) + "]";
			case 2:
				var e21 = _g[4];
				var e11 = _g[3];
				var op = _g[2];
				return "" + this.printExpr(e11) + " " + this.printBinop(op) + " " + this.printExpr(e21);
			case 3:
				var n = _g[3];
				var e12 = _g[2];
				return "" + this.printExpr(e12) + "." + n;
			case 4:
				var e13 = _g[2];
				return "(" + this.printExpr(e13) + ")";
			case 5:
				var fl = _g[2];
				return "{ " + fl.map(function(fld) {
					return "" + fld.field + " : " + _g1.printExpr(fld.expr);
				}).join(", ") + " }";
			case 6:
				var el = _g[2];
				return "[" + this.printExprs(el,", ") + "]";
			case 7:
				var el1 = _g[3];
				var e14 = _g[2];
				return "" + this.printExpr(e14) + "(" + this.printExprs(el1,", ") + ")";
			case 8:
				var el2 = _g[3];
				var tp = _g[2];
				return "new " + this.printTypePath(tp) + "(" + this.printExprs(el2,", ") + ")";
			case 9:
				switch(_g[3]) {
				case true:
					var e15 = _g[4];
					var op1 = _g[2];
					return this.printExpr(e15) + this.printUnop(op1);
				case false:
					var e16 = _g[4];
					var op2 = _g[2];
					return this.printUnop(op2) + this.printExpr(e16);
				}
				break;
			case 11:
				var func = _g[3];
				var no = _g[2];
				if(no != null) return "function " + no + this.printFunction(func); else {
					var func1 = _g[3];
					return "function" + this.printFunction(func1);
				}
				break;
			case 10:
				var vl = _g[2];
				return "var " + vl.map($bind(this,this.printVar)).join(", ");
			case 12:
				var el3 = _g[2];
				switch(_g[2].length) {
				case 0:
					return "{ }";
				default:
					var old = this.tabs;
					this.tabs += this.tabString;
					var s = "{\n" + this.tabs + this.printExprs(el3,";\n" + this.tabs);
					this.tabs = old;
					return s + (";\n" + this.tabs + "}");
				}
				break;
			case 13:
				var e22 = _g[3];
				var e17 = _g[2];
				return "for (" + this.printExpr(e17) + ") " + this.printExpr(e22);
			case 14:
				var e23 = _g[3];
				var e18 = _g[2];
				return "" + this.printExpr(e18) + " in " + this.printExpr(e23);
			case 15:
				var eelse = _g[4];
				if(_g[4] == null) {
					var econd = _g[2];
					var eif = _g[3];
					return "if (" + this.printExpr(econd) + ") " + this.printExpr(eif);
				} else switch(_g[4]) {
				default:
					var econd1 = _g[2];
					var eif1 = _g[3];
					return "if (" + this.printExpr(econd1) + ") " + this.printExpr(eif1) + " else " + this.printExpr(eelse);
				}
				break;
			case 16:
				switch(_g[4]) {
				case true:
					var econd2 = _g[2];
					var e19 = _g[3];
					return "while (" + this.printExpr(econd2) + ") " + this.printExpr(e19);
				case false:
					var econd3 = _g[2];
					var e110 = _g[3];
					return "do " + this.printExpr(e110) + " while (" + this.printExpr(econd3) + ")";
				}
				break;
			case 17:
				var edef = _g[4];
				var cl = _g[3];
				var e111 = _g[2];
				var old1 = this.tabs;
				this.tabs += this.tabString;
				var s1 = "switch " + this.printExpr(e111) + " {\n" + this.tabs + cl.map(function(c1) {
					return "case " + _g1.printExprs(c1.values,", ") + (c1.guard != null?" if (" + _g1.printExpr(c1.guard) + "):":":") + (c1.expr != null?_g1.opt(c1.expr,$bind(_g1,_g1.printExpr)) + ";":"");
				}).join("\n" + this.tabs);
				if(edef != null) s1 += "\n" + this.tabs + "default:" + (edef.expr == null?"":this.printExpr(edef) + ";");
				this.tabs = old1;
				return s1 + ("\n" + this.tabs + "}");
			case 18:
				var cl1 = _g[3];
				var e112 = _g[2];
				return "try " + this.printExpr(e112) + cl1.map(function(c2) {
					return " catch(" + c2.name + ":" + _g1.printComplexType(c2.type) + ") " + _g1.printExpr(c2.expr);
				}).join("");
			case 19:
				var eo = _g[2];
				return "return" + this.opt(eo,$bind(this,this.printExpr)," ");
			case 20:
				return "break";
			case 21:
				return "continue";
			case 22:
				var e113 = _g[2];
				return "untyped " + this.printExpr(e113);
			case 23:
				var e114 = _g[2];
				return "throw " + this.printExpr(e114);
			case 24:
				var cto = _g[3];
				var e115 = _g[2];
				if(cto != null) return "cast(" + this.printExpr(e115) + ", " + this.printComplexType(cto) + ")"; else {
					var e116 = _g[2];
					return "cast " + this.printExpr(e116);
				}
				break;
			case 25:
				var e117 = _g[2];
				return "#DISPLAY(" + this.printExpr(e117) + ")";
			case 26:
				var tp1 = _g[2];
				return "#DISPLAY(" + this.printTypePath(tp1) + ")";
			case 27:
				var eelse1 = _g[4];
				var eif2 = _g[3];
				var econd4 = _g[2];
				return "" + this.printExpr(econd4) + " ? " + this.printExpr(eif2) + " : " + this.printExpr(eelse1);
			case 28:
				var ct = _g[3];
				var e118 = _g[2];
				return "(" + this.printExpr(e118) + " : " + this.printComplexType(ct) + ")";
			case 29:
				var e119 = _g[3];
				var meta = _g[2];
				return this.printMetadata(meta) + " " + this.printExpr(e119);
			}
		}
	}
	,printExprs: function(el,sep) {
		return el.map($bind(this,this.printExpr)).join(sep);
	}
	,opt: function(v,f,prefix) {
		if(prefix == null) prefix = "";
		if(v == null) return ""; else return prefix + f(v);
	}
	,__class__: haxe.macro.Printer
};
haxe.xml = {};
haxe.xml._Fast = {};
haxe.xml._Fast.NodeAccess = function(x) {
	this.__x = x;
};
$hxClasses["haxe.xml._Fast.NodeAccess"] = haxe.xml._Fast.NodeAccess;
haxe.xml._Fast.NodeAccess.__name__ = ["haxe","xml","_Fast","NodeAccess"];
haxe.xml._Fast.NodeAccess.prototype = {
	__x: null
	,resolve: function(name) {
		var x = this.__x.elementsNamed(name).next();
		if(x == null) {
			var xname;
			if(this.__x.nodeType == Xml.Document) xname = "Document"; else xname = this.__x.get_nodeName();
			throw xname + " is missing element " + name;
		}
		return new haxe.xml.Fast(x);
	}
	,__class__: haxe.xml._Fast.NodeAccess
};
haxe.xml._Fast.AttribAccess = function(x) {
	this.__x = x;
};
$hxClasses["haxe.xml._Fast.AttribAccess"] = haxe.xml._Fast.AttribAccess;
haxe.xml._Fast.AttribAccess.__name__ = ["haxe","xml","_Fast","AttribAccess"];
haxe.xml._Fast.AttribAccess.prototype = {
	__x: null
	,resolve: function(name) {
		if(this.__x.nodeType == Xml.Document) throw "Cannot access document attribute " + name;
		var v = this.__x.get(name);
		if(v == null) throw this.__x.get_nodeName() + " is missing attribute " + name;
		return v;
	}
	,__class__: haxe.xml._Fast.AttribAccess
};
haxe.xml._Fast.HasAttribAccess = function(x) {
	this.__x = x;
};
$hxClasses["haxe.xml._Fast.HasAttribAccess"] = haxe.xml._Fast.HasAttribAccess;
haxe.xml._Fast.HasAttribAccess.__name__ = ["haxe","xml","_Fast","HasAttribAccess"];
haxe.xml._Fast.HasAttribAccess.prototype = {
	__x: null
	,resolve: function(name) {
		if(this.__x.nodeType == Xml.Document) throw "Cannot access document attribute " + name;
		return this.__x.exists(name);
	}
	,__class__: haxe.xml._Fast.HasAttribAccess
};
haxe.xml._Fast.HasNodeAccess = function(x) {
	this.__x = x;
};
$hxClasses["haxe.xml._Fast.HasNodeAccess"] = haxe.xml._Fast.HasNodeAccess;
haxe.xml._Fast.HasNodeAccess.__name__ = ["haxe","xml","_Fast","HasNodeAccess"];
haxe.xml._Fast.HasNodeAccess.prototype = {
	__x: null
	,resolve: function(name) {
		return this.__x.elementsNamed(name).hasNext();
	}
	,__class__: haxe.xml._Fast.HasNodeAccess
};
haxe.xml._Fast.NodeListAccess = function(x) {
	this.__x = x;
};
$hxClasses["haxe.xml._Fast.NodeListAccess"] = haxe.xml._Fast.NodeListAccess;
haxe.xml._Fast.NodeListAccess.__name__ = ["haxe","xml","_Fast","NodeListAccess"];
haxe.xml._Fast.NodeListAccess.prototype = {
	__x: null
	,resolve: function(name) {
		var l = new List();
		var $it0 = this.__x.elementsNamed(name);
		while( $it0.hasNext() ) {
			var x = $it0.next();
			l.add(new haxe.xml.Fast(x));
		}
		return l;
	}
	,__class__: haxe.xml._Fast.NodeListAccess
};
haxe.xml.Fast = function(x) {
	if(x.nodeType != Xml.Document && x.nodeType != Xml.Element) throw "Invalid nodeType " + Std.string(x.nodeType);
	this.x = x;
	this.node = new haxe.xml._Fast.NodeAccess(x);
	this.nodes = new haxe.xml._Fast.NodeListAccess(x);
	this.att = new haxe.xml._Fast.AttribAccess(x);
	this.has = new haxe.xml._Fast.HasAttribAccess(x);
	this.hasNode = new haxe.xml._Fast.HasNodeAccess(x);
};
$hxClasses["haxe.xml.Fast"] = haxe.xml.Fast;
haxe.xml.Fast.__name__ = ["haxe","xml","Fast"];
haxe.xml.Fast.prototype = {
	x: null
	,node: null
	,nodes: null
	,att: null
	,has: null
	,hasNode: null
	,get_name: function() {
		if(this.x.nodeType == Xml.Document) return "Document"; else return this.x.get_nodeName();
	}
	,get_innerData: function() {
		var it = this.x.iterator();
		if(!it.hasNext()) throw this.get_name() + " does not have data";
		var v = it.next();
		var n = it.next();
		if(n != null) {
			if(v.nodeType == Xml.PCData && n.nodeType == Xml.CData && StringTools.trim(v.get_nodeValue()) == "") {
				var n2 = it.next();
				if(n2 == null || n2.nodeType == Xml.PCData && StringTools.trim(n2.get_nodeValue()) == "" && it.next() == null) return n.get_nodeValue();
			}
			throw this.get_name() + " does not only have data";
		}
		if(v.nodeType != Xml.PCData && v.nodeType != Xml.CData) throw this.get_name() + " does not have data";
		return v.get_nodeValue();
	}
	,get_innerHTML: function() {
		var s = new StringBuf();
		var $it0 = this.x.iterator();
		while( $it0.hasNext() ) {
			var x = $it0.next();
			s.add(x.toString());
		}
		return s.b;
	}
	,__class__: haxe.xml.Fast
	,__properties__: {get_innerHTML:"get_innerHTML",get_innerData:"get_innerData",get_name:"get_name"}
};
haxe.xml.Parser = function() { };
$hxClasses["haxe.xml.Parser"] = haxe.xml.Parser;
haxe.xml.Parser.__name__ = ["haxe","xml","Parser"];
haxe.xml.Parser.parse = function(str) {
	var doc = Xml.createDocument();
	haxe.xml.Parser.doParse(str,0,doc);
	return doc;
};
haxe.xml.Parser.doParse = function(str,p,parent) {
	if(p == null) p = 0;
	var xml = null;
	var state = 1;
	var next = 1;
	var aname = null;
	var start = 0;
	var nsubs = 0;
	var nbrackets = 0;
	var c = str.charCodeAt(p);
	var buf = new StringBuf();
	while(!(c != c)) {
		switch(state) {
		case 0:
			switch(c) {
			case 10:case 13:case 9:case 32:
				break;
			default:
				state = next;
				continue;
			}
			break;
		case 1:
			switch(c) {
			case 60:
				state = 0;
				next = 2;
				break;
			default:
				start = p;
				state = 13;
				continue;
			}
			break;
		case 13:
			if(c == 60) {
				var child = Xml.createPCData(buf.b + HxOverrides.substr(str,start,p - start));
				buf = new StringBuf();
				parent.addChild(child);
				nsubs++;
				state = 0;
				next = 2;
			} else if(c == 38) {
				buf.addSub(str,start,p - start);
				state = 18;
				next = 13;
				start = p + 1;
			}
			break;
		case 17:
			if(c == 93 && str.charCodeAt(p + 1) == 93 && str.charCodeAt(p + 2) == 62) {
				var child1 = Xml.createCData(HxOverrides.substr(str,start,p - start));
				parent.addChild(child1);
				nsubs++;
				p += 2;
				state = 1;
			}
			break;
		case 2:
			switch(c) {
			case 33:
				if(str.charCodeAt(p + 1) == 91) {
					p += 2;
					if(HxOverrides.substr(str,p,6).toUpperCase() != "CDATA[") throw "Expected <![CDATA[";
					p += 5;
					state = 17;
					start = p + 1;
				} else if(str.charCodeAt(p + 1) == 68 || str.charCodeAt(p + 1) == 100) {
					if(HxOverrides.substr(str,p + 2,6).toUpperCase() != "OCTYPE") throw "Expected <!DOCTYPE";
					p += 8;
					state = 16;
					start = p + 1;
				} else if(str.charCodeAt(p + 1) != 45 || str.charCodeAt(p + 2) != 45) throw "Expected <!--"; else {
					p += 2;
					state = 15;
					start = p + 1;
				}
				break;
			case 63:
				state = 14;
				start = p;
				break;
			case 47:
				if(parent == null) throw "Expected node name";
				start = p + 1;
				state = 0;
				next = 10;
				break;
			default:
				state = 3;
				start = p;
				continue;
			}
			break;
		case 3:
			if(!(c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c == 58 || c == 46 || c == 95 || c == 45)) {
				if(p == start) throw "Expected node name";
				xml = Xml.createElement(HxOverrides.substr(str,start,p - start));
				parent.addChild(xml);
				state = 0;
				next = 4;
				continue;
			}
			break;
		case 4:
			switch(c) {
			case 47:
				state = 11;
				nsubs++;
				break;
			case 62:
				state = 9;
				nsubs++;
				break;
			default:
				state = 5;
				start = p;
				continue;
			}
			break;
		case 5:
			if(!(c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c == 58 || c == 46 || c == 95 || c == 45)) {
				var tmp;
				if(start == p) throw "Expected attribute name";
				tmp = HxOverrides.substr(str,start,p - start);
				aname = tmp;
				if(xml.exists(aname)) throw "Duplicate attribute";
				state = 0;
				next = 6;
				continue;
			}
			break;
		case 6:
			switch(c) {
			case 61:
				state = 0;
				next = 7;
				break;
			default:
				throw "Expected =";
			}
			break;
		case 7:
			switch(c) {
			case 34:case 39:
				state = 8;
				start = p;
				break;
			default:
				throw "Expected \"";
			}
			break;
		case 8:
			if(c == str.charCodeAt(start)) {
				var val = HxOverrides.substr(str,start + 1,p - start - 1);
				xml.set(aname,val);
				state = 0;
				next = 4;
			}
			break;
		case 9:
			p = haxe.xml.Parser.doParse(str,p,xml);
			start = p;
			state = 1;
			break;
		case 11:
			switch(c) {
			case 62:
				state = 1;
				break;
			default:
				throw "Expected >";
			}
			break;
		case 12:
			switch(c) {
			case 62:
				if(nsubs == 0) parent.addChild(Xml.createPCData(""));
				return p;
			default:
				throw "Expected >";
			}
			break;
		case 10:
			if(!(c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c == 58 || c == 46 || c == 95 || c == 45)) {
				if(start == p) throw "Expected node name";
				var v = HxOverrides.substr(str,start,p - start);
				if(v != parent.get_nodeName()) throw "Expected </" + parent.get_nodeName() + ">";
				state = 0;
				next = 12;
				continue;
			}
			break;
		case 15:
			if(c == 45 && str.charCodeAt(p + 1) == 45 && str.charCodeAt(p + 2) == 62) {
				parent.addChild(Xml.createComment(HxOverrides.substr(str,start,p - start)));
				p += 2;
				state = 1;
			}
			break;
		case 16:
			if(c == 91) nbrackets++; else if(c == 93) nbrackets--; else if(c == 62 && nbrackets == 0) {
				parent.addChild(Xml.createDocType(HxOverrides.substr(str,start,p - start)));
				state = 1;
			}
			break;
		case 14:
			if(c == 63 && str.charCodeAt(p + 1) == 62) {
				p++;
				var str1 = HxOverrides.substr(str,start + 1,p - start - 2);
				parent.addChild(Xml.createProcessingInstruction(str1));
				state = 1;
			}
			break;
		case 18:
			if(c == 59) {
				var s = HxOverrides.substr(str,start,p - start);
				if(s.charCodeAt(0) == 35) {
					var i;
					if(s.charCodeAt(1) == 120) i = Std.parseInt("0" + HxOverrides.substr(s,1,s.length - 1)); else i = Std.parseInt(HxOverrides.substr(s,1,s.length - 1));
					buf.add(String.fromCharCode(i));
				} else if(!haxe.xml.Parser.escapes.exists(s)) buf.b += Std.string("&" + s + ";"); else buf.add(haxe.xml.Parser.escapes.get(s));
				start = p + 1;
				state = next;
			}
			break;
		}
		c = StringTools.fastCodeAt(str,++p);
	}
	if(state == 1) {
		start = p;
		state = 13;
	}
	if(state == 13) {
		if(p != start || nsubs == 0) parent.addChild(Xml.createPCData(buf.b + HxOverrides.substr(str,start,p - start)));
		return p;
	}
	throw "Unexpected end";
};
var haxeparser = {};
haxeparser.Keyword = $hxClasses["haxeparser.Keyword"] = { __ename__ : ["haxeparser","Keyword"], __constructs__ : ["KwdFunction","KwdClass","KwdVar","KwdIf","KwdElse","KwdWhile","KwdDo","KwdFor","KwdBreak","KwdContinue","KwdReturn","KwdExtends","KwdImplements","KwdImport","KwdSwitch","KwdCase","KwdDefault","KwdStatic","KwdPublic","KwdPrivate","KwdTry","KwdCatch","KwdNew","KwdThis","KwdThrow","KwdExtern","KwdEnum","KwdIn","KwdInterface","KwdUntyped","KwdCast","KwdOverride","KwdTypedef","KwdDynamic","KwdPackage","KwdInline","KwdUsing","KwdNull","KwdTrue","KwdFalse","KwdAbstract","KwdMacro"] };
haxeparser.Keyword.KwdFunction = ["KwdFunction",0];
haxeparser.Keyword.KwdFunction.toString = $estr;
haxeparser.Keyword.KwdFunction.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdClass = ["KwdClass",1];
haxeparser.Keyword.KwdClass.toString = $estr;
haxeparser.Keyword.KwdClass.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdVar = ["KwdVar",2];
haxeparser.Keyword.KwdVar.toString = $estr;
haxeparser.Keyword.KwdVar.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdIf = ["KwdIf",3];
haxeparser.Keyword.KwdIf.toString = $estr;
haxeparser.Keyword.KwdIf.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdElse = ["KwdElse",4];
haxeparser.Keyword.KwdElse.toString = $estr;
haxeparser.Keyword.KwdElse.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdWhile = ["KwdWhile",5];
haxeparser.Keyword.KwdWhile.toString = $estr;
haxeparser.Keyword.KwdWhile.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdDo = ["KwdDo",6];
haxeparser.Keyword.KwdDo.toString = $estr;
haxeparser.Keyword.KwdDo.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdFor = ["KwdFor",7];
haxeparser.Keyword.KwdFor.toString = $estr;
haxeparser.Keyword.KwdFor.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdBreak = ["KwdBreak",8];
haxeparser.Keyword.KwdBreak.toString = $estr;
haxeparser.Keyword.KwdBreak.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdContinue = ["KwdContinue",9];
haxeparser.Keyword.KwdContinue.toString = $estr;
haxeparser.Keyword.KwdContinue.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdReturn = ["KwdReturn",10];
haxeparser.Keyword.KwdReturn.toString = $estr;
haxeparser.Keyword.KwdReturn.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdExtends = ["KwdExtends",11];
haxeparser.Keyword.KwdExtends.toString = $estr;
haxeparser.Keyword.KwdExtends.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdImplements = ["KwdImplements",12];
haxeparser.Keyword.KwdImplements.toString = $estr;
haxeparser.Keyword.KwdImplements.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdImport = ["KwdImport",13];
haxeparser.Keyword.KwdImport.toString = $estr;
haxeparser.Keyword.KwdImport.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdSwitch = ["KwdSwitch",14];
haxeparser.Keyword.KwdSwitch.toString = $estr;
haxeparser.Keyword.KwdSwitch.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdCase = ["KwdCase",15];
haxeparser.Keyword.KwdCase.toString = $estr;
haxeparser.Keyword.KwdCase.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdDefault = ["KwdDefault",16];
haxeparser.Keyword.KwdDefault.toString = $estr;
haxeparser.Keyword.KwdDefault.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdStatic = ["KwdStatic",17];
haxeparser.Keyword.KwdStatic.toString = $estr;
haxeparser.Keyword.KwdStatic.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdPublic = ["KwdPublic",18];
haxeparser.Keyword.KwdPublic.toString = $estr;
haxeparser.Keyword.KwdPublic.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdPrivate = ["KwdPrivate",19];
haxeparser.Keyword.KwdPrivate.toString = $estr;
haxeparser.Keyword.KwdPrivate.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdTry = ["KwdTry",20];
haxeparser.Keyword.KwdTry.toString = $estr;
haxeparser.Keyword.KwdTry.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdCatch = ["KwdCatch",21];
haxeparser.Keyword.KwdCatch.toString = $estr;
haxeparser.Keyword.KwdCatch.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdNew = ["KwdNew",22];
haxeparser.Keyword.KwdNew.toString = $estr;
haxeparser.Keyword.KwdNew.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdThis = ["KwdThis",23];
haxeparser.Keyword.KwdThis.toString = $estr;
haxeparser.Keyword.KwdThis.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdThrow = ["KwdThrow",24];
haxeparser.Keyword.KwdThrow.toString = $estr;
haxeparser.Keyword.KwdThrow.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdExtern = ["KwdExtern",25];
haxeparser.Keyword.KwdExtern.toString = $estr;
haxeparser.Keyword.KwdExtern.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdEnum = ["KwdEnum",26];
haxeparser.Keyword.KwdEnum.toString = $estr;
haxeparser.Keyword.KwdEnum.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdIn = ["KwdIn",27];
haxeparser.Keyword.KwdIn.toString = $estr;
haxeparser.Keyword.KwdIn.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdInterface = ["KwdInterface",28];
haxeparser.Keyword.KwdInterface.toString = $estr;
haxeparser.Keyword.KwdInterface.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdUntyped = ["KwdUntyped",29];
haxeparser.Keyword.KwdUntyped.toString = $estr;
haxeparser.Keyword.KwdUntyped.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdCast = ["KwdCast",30];
haxeparser.Keyword.KwdCast.toString = $estr;
haxeparser.Keyword.KwdCast.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdOverride = ["KwdOverride",31];
haxeparser.Keyword.KwdOverride.toString = $estr;
haxeparser.Keyword.KwdOverride.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdTypedef = ["KwdTypedef",32];
haxeparser.Keyword.KwdTypedef.toString = $estr;
haxeparser.Keyword.KwdTypedef.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdDynamic = ["KwdDynamic",33];
haxeparser.Keyword.KwdDynamic.toString = $estr;
haxeparser.Keyword.KwdDynamic.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdPackage = ["KwdPackage",34];
haxeparser.Keyword.KwdPackage.toString = $estr;
haxeparser.Keyword.KwdPackage.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdInline = ["KwdInline",35];
haxeparser.Keyword.KwdInline.toString = $estr;
haxeparser.Keyword.KwdInline.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdUsing = ["KwdUsing",36];
haxeparser.Keyword.KwdUsing.toString = $estr;
haxeparser.Keyword.KwdUsing.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdNull = ["KwdNull",37];
haxeparser.Keyword.KwdNull.toString = $estr;
haxeparser.Keyword.KwdNull.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdTrue = ["KwdTrue",38];
haxeparser.Keyword.KwdTrue.toString = $estr;
haxeparser.Keyword.KwdTrue.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdFalse = ["KwdFalse",39];
haxeparser.Keyword.KwdFalse.toString = $estr;
haxeparser.Keyword.KwdFalse.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdAbstract = ["KwdAbstract",40];
haxeparser.Keyword.KwdAbstract.toString = $estr;
haxeparser.Keyword.KwdAbstract.__enum__ = haxeparser.Keyword;
haxeparser.Keyword.KwdMacro = ["KwdMacro",41];
haxeparser.Keyword.KwdMacro.toString = $estr;
haxeparser.Keyword.KwdMacro.__enum__ = haxeparser.Keyword;
haxeparser.TokenDef = $hxClasses["haxeparser.TokenDef"] = { __ename__ : ["haxeparser","TokenDef"], __constructs__ : ["Kwd","Const","Sharp","Dollar","Unop","Binop","Comment","CommentLine","IntInterval","Semicolon","Dot","DblDot","Arrow","Comma","BkOpen","BkClose","BrOpen","BrClose","POpen","PClose","Question","At","Eof"] };
haxeparser.TokenDef.Kwd = function(k) { var $x = ["Kwd",0,k]; $x.__enum__ = haxeparser.TokenDef; $x.toString = $estr; return $x; };
haxeparser.TokenDef.Const = function(c) { var $x = ["Const",1,c]; $x.__enum__ = haxeparser.TokenDef; $x.toString = $estr; return $x; };
haxeparser.TokenDef.Sharp = function(s) { var $x = ["Sharp",2,s]; $x.__enum__ = haxeparser.TokenDef; $x.toString = $estr; return $x; };
haxeparser.TokenDef.Dollar = function(s) { var $x = ["Dollar",3,s]; $x.__enum__ = haxeparser.TokenDef; $x.toString = $estr; return $x; };
haxeparser.TokenDef.Unop = function(op) { var $x = ["Unop",4,op]; $x.__enum__ = haxeparser.TokenDef; $x.toString = $estr; return $x; };
haxeparser.TokenDef.Binop = function(op) { var $x = ["Binop",5,op]; $x.__enum__ = haxeparser.TokenDef; $x.toString = $estr; return $x; };
haxeparser.TokenDef.Comment = function(s) { var $x = ["Comment",6,s]; $x.__enum__ = haxeparser.TokenDef; $x.toString = $estr; return $x; };
haxeparser.TokenDef.CommentLine = function(s) { var $x = ["CommentLine",7,s]; $x.__enum__ = haxeparser.TokenDef; $x.toString = $estr; return $x; };
haxeparser.TokenDef.IntInterval = function(s) { var $x = ["IntInterval",8,s]; $x.__enum__ = haxeparser.TokenDef; $x.toString = $estr; return $x; };
haxeparser.TokenDef.Semicolon = ["Semicolon",9];
haxeparser.TokenDef.Semicolon.toString = $estr;
haxeparser.TokenDef.Semicolon.__enum__ = haxeparser.TokenDef;
haxeparser.TokenDef.Dot = ["Dot",10];
haxeparser.TokenDef.Dot.toString = $estr;
haxeparser.TokenDef.Dot.__enum__ = haxeparser.TokenDef;
haxeparser.TokenDef.DblDot = ["DblDot",11];
haxeparser.TokenDef.DblDot.toString = $estr;
haxeparser.TokenDef.DblDot.__enum__ = haxeparser.TokenDef;
haxeparser.TokenDef.Arrow = ["Arrow",12];
haxeparser.TokenDef.Arrow.toString = $estr;
haxeparser.TokenDef.Arrow.__enum__ = haxeparser.TokenDef;
haxeparser.TokenDef.Comma = ["Comma",13];
haxeparser.TokenDef.Comma.toString = $estr;
haxeparser.TokenDef.Comma.__enum__ = haxeparser.TokenDef;
haxeparser.TokenDef.BkOpen = ["BkOpen",14];
haxeparser.TokenDef.BkOpen.toString = $estr;
haxeparser.TokenDef.BkOpen.__enum__ = haxeparser.TokenDef;
haxeparser.TokenDef.BkClose = ["BkClose",15];
haxeparser.TokenDef.BkClose.toString = $estr;
haxeparser.TokenDef.BkClose.__enum__ = haxeparser.TokenDef;
haxeparser.TokenDef.BrOpen = ["BrOpen",16];
haxeparser.TokenDef.BrOpen.toString = $estr;
haxeparser.TokenDef.BrOpen.__enum__ = haxeparser.TokenDef;
haxeparser.TokenDef.BrClose = ["BrClose",17];
haxeparser.TokenDef.BrClose.toString = $estr;
haxeparser.TokenDef.BrClose.__enum__ = haxeparser.TokenDef;
haxeparser.TokenDef.POpen = ["POpen",18];
haxeparser.TokenDef.POpen.toString = $estr;
haxeparser.TokenDef.POpen.__enum__ = haxeparser.TokenDef;
haxeparser.TokenDef.PClose = ["PClose",19];
haxeparser.TokenDef.PClose.toString = $estr;
haxeparser.TokenDef.PClose.__enum__ = haxeparser.TokenDef;
haxeparser.TokenDef.Question = ["Question",20];
haxeparser.TokenDef.Question.toString = $estr;
haxeparser.TokenDef.Question.__enum__ = haxeparser.TokenDef;
haxeparser.TokenDef.At = ["At",21];
haxeparser.TokenDef.At.toString = $estr;
haxeparser.TokenDef.At.__enum__ = haxeparser.TokenDef;
haxeparser.TokenDef.Eof = ["Eof",22];
haxeparser.TokenDef.Eof.toString = $estr;
haxeparser.TokenDef.Eof.__enum__ = haxeparser.TokenDef;
haxeparser.Token = function(tok,pos) {
	this.tok = tok;
	this.pos = pos;
};
$hxClasses["haxeparser.Token"] = haxeparser.Token;
haxeparser.Token.__name__ = ["haxeparser","Token"];
haxeparser.Token.prototype = {
	tok: null
	,pos: null
	,__class__: haxeparser.Token
};
haxeparser.TypeDef = $hxClasses["haxeparser.TypeDef"] = { __ename__ : ["haxeparser","TypeDef"], __constructs__ : ["EClass","EEnum","EAbstract","EImport","ETypedef","EUsing"] };
haxeparser.TypeDef.EClass = function(d) { var $x = ["EClass",0,d]; $x.__enum__ = haxeparser.TypeDef; $x.toString = $estr; return $x; };
haxeparser.TypeDef.EEnum = function(d) { var $x = ["EEnum",1,d]; $x.__enum__ = haxeparser.TypeDef; $x.toString = $estr; return $x; };
haxeparser.TypeDef.EAbstract = function(a) { var $x = ["EAbstract",2,a]; $x.__enum__ = haxeparser.TypeDef; $x.toString = $estr; return $x; };
haxeparser.TypeDef.EImport = function(sl,mode) { var $x = ["EImport",3,sl,mode]; $x.__enum__ = haxeparser.TypeDef; $x.toString = $estr; return $x; };
haxeparser.TypeDef.ETypedef = function(d) { var $x = ["ETypedef",4,d]; $x.__enum__ = haxeparser.TypeDef; $x.toString = $estr; return $x; };
haxeparser.TypeDef.EUsing = function(path) { var $x = ["EUsing",5,path]; $x.__enum__ = haxeparser.TypeDef; $x.toString = $estr; return $x; };
haxeparser.ClassFlag = $hxClasses["haxeparser.ClassFlag"] = { __ename__ : ["haxeparser","ClassFlag"], __constructs__ : ["HInterface","HExtern","HPrivate","HExtends","HImplements"] };
haxeparser.ClassFlag.HInterface = ["HInterface",0];
haxeparser.ClassFlag.HInterface.toString = $estr;
haxeparser.ClassFlag.HInterface.__enum__ = haxeparser.ClassFlag;
haxeparser.ClassFlag.HExtern = ["HExtern",1];
haxeparser.ClassFlag.HExtern.toString = $estr;
haxeparser.ClassFlag.HExtern.__enum__ = haxeparser.ClassFlag;
haxeparser.ClassFlag.HPrivate = ["HPrivate",2];
haxeparser.ClassFlag.HPrivate.toString = $estr;
haxeparser.ClassFlag.HPrivate.__enum__ = haxeparser.ClassFlag;
haxeparser.ClassFlag.HExtends = function(t) { var $x = ["HExtends",3,t]; $x.__enum__ = haxeparser.ClassFlag; $x.toString = $estr; return $x; };
haxeparser.ClassFlag.HImplements = function(t) { var $x = ["HImplements",4,t]; $x.__enum__ = haxeparser.ClassFlag; $x.toString = $estr; return $x; };
haxeparser.AbstractFlag = $hxClasses["haxeparser.AbstractFlag"] = { __ename__ : ["haxeparser","AbstractFlag"], __constructs__ : ["APrivAbstract","AFromType","AToType","AIsType"] };
haxeparser.AbstractFlag.APrivAbstract = ["APrivAbstract",0];
haxeparser.AbstractFlag.APrivAbstract.toString = $estr;
haxeparser.AbstractFlag.APrivAbstract.__enum__ = haxeparser.AbstractFlag;
haxeparser.AbstractFlag.AFromType = function(ct) { var $x = ["AFromType",1,ct]; $x.__enum__ = haxeparser.AbstractFlag; $x.toString = $estr; return $x; };
haxeparser.AbstractFlag.AToType = function(ct) { var $x = ["AToType",2,ct]; $x.__enum__ = haxeparser.AbstractFlag; $x.toString = $estr; return $x; };
haxeparser.AbstractFlag.AIsType = function(ct) { var $x = ["AIsType",3,ct]; $x.__enum__ = haxeparser.AbstractFlag; $x.toString = $estr; return $x; };
haxeparser.EnumFlag = $hxClasses["haxeparser.EnumFlag"] = { __ename__ : ["haxeparser","EnumFlag"], __constructs__ : ["EPrivate","EExtern"] };
haxeparser.EnumFlag.EPrivate = ["EPrivate",0];
haxeparser.EnumFlag.EPrivate.toString = $estr;
haxeparser.EnumFlag.EPrivate.__enum__ = haxeparser.EnumFlag;
haxeparser.EnumFlag.EExtern = ["EExtern",1];
haxeparser.EnumFlag.EExtern.toString = $estr;
haxeparser.EnumFlag.EExtern.__enum__ = haxeparser.EnumFlag;
haxeparser.ImportMode = $hxClasses["haxeparser.ImportMode"] = { __ename__ : ["haxeparser","ImportMode"], __constructs__ : ["INormal","IAsName","IAll"] };
haxeparser.ImportMode.INormal = ["INormal",0];
haxeparser.ImportMode.INormal.toString = $estr;
haxeparser.ImportMode.INormal.__enum__ = haxeparser.ImportMode;
haxeparser.ImportMode.IAsName = function(s) { var $x = ["IAsName",1,s]; $x.__enum__ = haxeparser.ImportMode; $x.toString = $estr; return $x; };
haxeparser.ImportMode.IAll = ["IAll",2];
haxeparser.ImportMode.IAll.toString = $estr;
haxeparser.ImportMode.IAll.__enum__ = haxeparser.ImportMode;
haxeparser.LexerErrorMsg = $hxClasses["haxeparser.LexerErrorMsg"] = { __ename__ : ["haxeparser","LexerErrorMsg"], __constructs__ : ["UnterminatedString","UnterminatedRegExp","UnclosedComment"] };
haxeparser.LexerErrorMsg.UnterminatedString = ["UnterminatedString",0];
haxeparser.LexerErrorMsg.UnterminatedString.toString = $estr;
haxeparser.LexerErrorMsg.UnterminatedString.__enum__ = haxeparser.LexerErrorMsg;
haxeparser.LexerErrorMsg.UnterminatedRegExp = ["UnterminatedRegExp",1];
haxeparser.LexerErrorMsg.UnterminatedRegExp.toString = $estr;
haxeparser.LexerErrorMsg.UnterminatedRegExp.__enum__ = haxeparser.LexerErrorMsg;
haxeparser.LexerErrorMsg.UnclosedComment = ["UnclosedComment",2];
haxeparser.LexerErrorMsg.UnclosedComment.toString = $estr;
haxeparser.LexerErrorMsg.UnclosedComment.__enum__ = haxeparser.LexerErrorMsg;
haxeparser.LexerError = function(msg,pos) {
	this.msg = msg;
	this.pos = pos;
};
$hxClasses["haxeparser.LexerError"] = haxeparser.LexerError;
haxeparser.LexerError.__name__ = ["haxeparser","LexerError"];
haxeparser.LexerError.prototype = {
	msg: null
	,pos: null
	,__class__: haxeparser.LexerError
};
var hxparse = {};
hxparse.Lexer = function(input,sourceName) {
	if(sourceName == null) sourceName = "<null>";
	this.current = "";
	this.input = input;
	this.source = sourceName;
	this.pos = 0;
};
$hxClasses["hxparse.Lexer"] = hxparse.Lexer;
hxparse.Lexer.__name__ = ["hxparse","Lexer"];
hxparse.Lexer.buildRuleset = function(rules,name) {
	if(name == null) name = "";
	var cases = [];
	var functions = [];
	var eofFunction = null;
	var _g = 0;
	while(_g < rules.length) {
		var rule = rules[_g];
		++_g;
		if(rule.rule == "") eofFunction = rule.func; else {
			cases.push(hxparse.LexEngine.parse(rule.rule));
			functions.push(rule.func);
		}
	}
	return new hxparse.Ruleset(new hxparse.LexEngine(cases).firstState(),functions,eofFunction,name);
};
hxparse.Lexer.prototype = {
	current: null
	,input: null
	,source: null
	,pos: null
	,curPos: function() {
		return new hxparse.Position(this.source,this.pos - this.current.length,this.pos);
	}
	,token: function(ruleset) {
		if(this.pos == byte.js._ByteData.ByteData_Impl_.get_length(this.input)) {
			if(ruleset.eofFunction != null) return ruleset.eofFunction(this); else throw new haxe.io.Eof();
		}
		var state = ruleset.state;
		var lastMatch = null;
		var lastMatchPos = this.pos;
		var start = this.pos;
		while(true) {
			if(state["final"] > -1) {
				lastMatch = state;
				lastMatchPos = this.pos;
			}
			if(this.pos == byte.js._ByteData.ByteData_Impl_.get_length(this.input)) break;
			var i = this.input[this.pos];
			this.pos++;
			state = state.trans[i];
			if(state == null) break;
		}
		this.pos = lastMatchPos;
		this.current = byte.js._ByteData.ByteData_Impl_.readString(this.input,start,this.pos - start);
		if(lastMatch == null || lastMatch["final"] == -1) throw new hxparse.UnexpectedChar(String.fromCharCode(this.input[this.pos]),new hxparse.Position(this.source,this.pos - this.current.length,this.pos));
		return ruleset.functions[lastMatch["final"]](this);
	}
	,__class__: hxparse.Lexer
};
hxparse.RuleBuilder = function() { };
$hxClasses["hxparse.RuleBuilder"] = hxparse.RuleBuilder;
hxparse.RuleBuilder.__name__ = ["hxparse","RuleBuilder"];
hxparse.LexEngine = function(patterns) {
	this.nodes = [];
	this.finals = [];
	this.states = [];
	this.hstates = new haxe.ds.StringMap();
	this.uid = 0;
	var pid = 0;
	var _g = 0;
	while(_g < patterns.length) {
		var p = patterns[_g];
		++_g;
		var id = pid++;
		var f = new hxparse._LexEngine.Node(this.uid++,id);
		var n = this.initNode(p,f,id);
		this.nodes.push(n);
		this.finals.push(f);
	}
	this.makeState(this.addNodes([],this.nodes));
};
$hxClasses["hxparse.LexEngine"] = hxparse.LexEngine;
hxparse.LexEngine.__name__ = ["hxparse","LexEngine"];
hxparse.LexEngine.parse = function(pattern) {
	var p = hxparse.LexEngine.parseInner(byte.js._ByteData.ByteData_Impl_.ofString(pattern));
	if(p == null) throw "Invalid pattern '" + pattern + "'";
	return p.pattern;
};
hxparse.LexEngine.next = function(a,b) {
	if(a == hxparse._LexEngine.Pattern.Empty) return b; else return hxparse._LexEngine.Pattern.Next(a,b);
};
hxparse.LexEngine.plus = function(r) {
	switch(r[1]) {
	case 4:
		var r2 = r[3];
		var r1 = r[2];
		return hxparse._LexEngine.Pattern.Next(r1,hxparse.LexEngine.plus(r2));
	default:
		return hxparse._LexEngine.Pattern.Plus(r);
	}
};
hxparse.LexEngine.star = function(r) {
	switch(r[1]) {
	case 4:
		var r2 = r[3];
		var r1 = r[2];
		return hxparse._LexEngine.Pattern.Next(r1,hxparse.LexEngine.star(r2));
	default:
		return hxparse._LexEngine.Pattern.Star(r);
	}
};
hxparse.LexEngine.opt = function(r) {
	switch(r[1]) {
	case 4:
		var r2 = r[3];
		var r1 = r[2];
		return hxparse._LexEngine.Pattern.Next(r1,hxparse.LexEngine.opt(r2));
	default:
		return hxparse._LexEngine.Pattern.Choice(r,hxparse._LexEngine.Pattern.Empty);
	}
};
hxparse.LexEngine.cinter = function(c1,c2) {
	return hxparse.LexEngine.ccomplement(hxparse.LexEngine.cunion(hxparse.LexEngine.ccomplement(c1),hxparse.LexEngine.ccomplement(c2)));
};
hxparse.LexEngine.cdiff = function(c1,c2) {
	return hxparse.LexEngine.ccomplement(hxparse.LexEngine.cunion(hxparse.LexEngine.ccomplement(c1),c2));
};
hxparse.LexEngine.ccomplement = function(c) {
	var first = c[0];
	var start;
	if(first != null && first.min == -1) start = c.shift().max + 1; else start = -1;
	var out = [];
	var _g = 0;
	while(_g < c.length) {
		var k = c[_g];
		++_g;
		out.push({ min : start, max : k.min - 1});
		start = k.max + 1;
	}
	if(start <= 255) out.push({ min : start, max : 255});
	return out;
};
hxparse.LexEngine.cunion = function(ca,cb) {
	var i = 0;
	var j = 0;
	var out = [];
	var a = ca[i++];
	var b = cb[j++];
	while(true) {
		if(a == null) {
			out.push(b);
			while(j < cb.length) out.push(cb[j++]);
			break;
		}
		if(b == null) {
			out.push(a);
			while(i < ca.length) out.push(ca[i++]);
			break;
		}
		if(a.min <= b.min) {
			if(a.max + 1 < b.min) {
				out.push(a);
				a = ca[i++];
			} else if(a.max < b.max) {
				b = { min : a.min, max : b.max};
				a = ca[i++];
			} else b = cb[j++];
		} else {
			var tmp = ca;
			ca = cb;
			cb = tmp;
			var tmp1 = j;
			j = i;
			i = tmp1;
			var tmp2 = a;
			a = b;
			b = tmp2;
		}
	}
	return out;
};
hxparse.LexEngine.parseInner = function(pattern,i,pDepth) {
	if(pDepth == null) pDepth = 0;
	if(i == null) i = 0;
	var r = hxparse._LexEngine.Pattern.Empty;
	var l = byte.js._ByteData.ByteData_Impl_.get_length(pattern);
	while(i < l) {
		var c;
		var pos = i++;
		c = pattern[pos];
		if(c > 255) throw c;
		switch(c) {
		case 43:
			if(r != hxparse._LexEngine.Pattern.Empty) r = hxparse.LexEngine.plus(r); else r = hxparse.LexEngine.next(r,hxparse._LexEngine.Pattern.Match([{ min : c, max : c}]));
			break;
		case 42:
			if(r != hxparse._LexEngine.Pattern.Empty) r = hxparse.LexEngine.star(r); else r = hxparse.LexEngine.next(r,hxparse._LexEngine.Pattern.Match([{ min : c, max : c}]));
			break;
		case 63:
			if(r != hxparse._LexEngine.Pattern.Empty) r = hxparse.LexEngine.opt(r); else r = hxparse.LexEngine.next(r,hxparse._LexEngine.Pattern.Match([{ min : c, max : c}]));
			break;
		case 124:
			if(r != hxparse._LexEngine.Pattern.Empty) {
				var r2 = hxparse.LexEngine.parseInner(pattern,i);
				return { pattern : hxparse._LexEngine.Pattern.Choice(r,r2.pattern), pos : r2.pos};
			} else r = hxparse.LexEngine.next(r,hxparse._LexEngine.Pattern.Match([{ min : c, max : c}]));
			break;
		case 46:
			r = hxparse.LexEngine.next(r,hxparse._LexEngine.Pattern.Match(hxparse.LexEngine.ALL_CHARS));
			break;
		case 40:
			var r21 = hxparse.LexEngine.parseInner(pattern,i,pDepth + 1);
			i = r21.pos;
			r = hxparse.LexEngine.next(r,r21.pattern);
			break;
		case 41:
			return { pattern : hxparse._LexEngine.Pattern.Group(r), pos : i};
		case 91:
			if(byte.js._ByteData.ByteData_Impl_.get_length(pattern) > 1) {
				var range = 0;
				var acc = [];
				var not = pattern[i] == 94;
				if(not) i++;
				while(true) {
					var c1;
					var pos1 = i++;
					c1 = pattern[pos1];
					if(c1 == 93) {
						if(range != 0) return null;
						break;
					} else if(c1 == 45) {
						if(range != 0) return null;
						var last = acc.pop();
						if(last == null) acc.push({ min : c1, max : c1}); else {
							if(last.min != last.max) return null;
							range = last.min;
						}
					} else {
						if(c1 == 92) {
							var pos2 = i++;
							c1 = pattern[pos2];
						}
						if(range == 0) acc.push({ min : c1, max : c1}); else {
							acc.push({ min : range, max : c1});
							range = 0;
						}
					}
				}
				var g = [];
				var _g = 0;
				while(_g < acc.length) {
					var k = acc[_g];
					++_g;
					g = hxparse.LexEngine.cunion(g,[k]);
				}
				if(not) g = hxparse.LexEngine.cdiff(hxparse.LexEngine.ALL_CHARS,g);
				r = hxparse.LexEngine.next(r,hxparse._LexEngine.Pattern.Match(g));
			} else r = hxparse.LexEngine.next(r,hxparse._LexEngine.Pattern.Match([{ min : c, max : c}]));
			break;
		case 92:
			var pos3 = i++;
			c = pattern[pos3];
			if(c != c) c = 92; else if(c >= 48 && c <= 57) {
				var v = c - 48;
				while(true) {
					var cNext = pattern[i];
					if(cNext >= 48 && cNext <= 57) {
						v = v * 10 + (cNext - 48);
						++i;
					} else break;
				}
				c = v;
			}
			r = hxparse.LexEngine.next(r,hxparse._LexEngine.Pattern.Match([{ min : c, max : c}]));
			break;
		default:
			r = hxparse.LexEngine.next(r,hxparse._LexEngine.Pattern.Match([{ min : c, max : c}]));
		}
	}
	if(pDepth != 0) throw "Found unclosed parenthesis while parsing \"" + Std.string(pattern) + "\"";
	return { pattern : r, pos : i};
};
hxparse.LexEngine.prototype = {
	uid: null
	,nodes: null
	,finals: null
	,states: null
	,hstates: null
	,firstState: function() {
		return this.states[0];
	}
	,makeState: function(nodes) {
		var _g = this;
		var buf = new StringBuf();
		var _g1 = 0;
		while(_g1 < nodes.length) {
			var n = nodes[_g1];
			++_g1;
			if(n.id == null) buf.b += "null"; else buf.b += "" + n.id;
			buf.b += "-";
		}
		var key = buf.b;
		var s = this.hstates.get(key);
		if(s != null) return s;
		s = new hxparse.State();
		this.states.push(s);
		this.hstates.set(key,s);
		var trans = this.getTransitions(nodes);
		var _g2 = 0;
		while(_g2 < trans.length) {
			var t = trans[_g2];
			++_g2;
			var target = this.makeState(t.n);
			var _g11 = 0;
			var _g21 = t.chars;
			while(_g11 < _g21.length) {
				var chr = _g21[_g11];
				++_g11;
				var _g4 = chr.min;
				var _g3 = chr.max + 1;
				while(_g4 < _g3) {
					var i = _g4++;
					s.trans[i] = target;
				}
			}
		}
		var setFinal = function() {
			var _g12 = 0;
			var _g22 = _g.finals;
			while(_g12 < _g22.length) {
				var f = _g22[_g12];
				++_g12;
				var _g31 = 0;
				while(_g31 < nodes.length) {
					var n1 = nodes[_g31];
					++_g31;
					if(n1 == f) {
						s["final"] = n1.pid;
						return;
					}
				}
			}
		};
		if(s["final"] == -1) setFinal();
		return s;
	}
	,getTransitions: function(nodes) {
		var tl = [];
		var _g = 0;
		while(_g < nodes.length) {
			var n = nodes[_g];
			++_g;
			var _g1 = 0;
			var _g2 = n.trans;
			while(_g1 < _g2.length) {
				var t = _g2[_g1];
				++_g1;
				tl.push(t);
			}
		}
		tl.sort(function(t1,t2) {
			return t1.n.id - t2.n.id;
		});
		var t0 = tl[0];
		var _g11 = 1;
		var _g3 = tl.length;
		while(_g11 < _g3) {
			var i = _g11++;
			var t11 = tl[i];
			if(t0.n == t11.n) {
				tl[i - 1] = null;
				t11 = { chars : hxparse.LexEngine.cunion(t0.chars,t11.chars), n : t11.n};
				tl[i] = t11;
			}
			t0 = t11;
		}
		while(HxOverrides.remove(tl,null)) {
		}
		var allChars = hxparse.LexEngine.EMPTY;
		var allStates = new List();
		var _g4 = 0;
		while(_g4 < tl.length) {
			var t3 = tl[_g4];
			++_g4;
			var states = new List();
			states.push({ chars : hxparse.LexEngine.cdiff(t3.chars,allChars), n : [t3.n]});
			var $it0 = allStates.iterator();
			while( $it0.hasNext() ) {
				var s = $it0.next();
				var nodes1 = s.n.slice();
				nodes1.push(t3.n);
				states.push({ chars : hxparse.LexEngine.cinter(s.chars,t3.chars), n : nodes1});
				states.push({ chars : hxparse.LexEngine.cdiff(s.chars,t3.chars), n : s.n});
			}
			var $it1 = states.iterator();
			while( $it1.hasNext() ) {
				var s1 = $it1.next();
				if(s1.chars.length == 0) states.remove(s1);
			}
			allChars = hxparse.LexEngine.cunion(allChars,t3.chars);
			allStates = states;
		}
		var states1 = [];
		var $it2 = allStates.iterator();
		while( $it2.hasNext() ) {
			var s2 = $it2.next();
			states1.push({ chars : s2.chars, n : this.addNodes([],s2.n)});
		}
		states1.sort(function(s11,s21) {
			var a = s11.chars.length;
			var b = s21.chars.length;
			var _g12 = 0;
			var _g5;
			if(a < b) _g5 = a; else _g5 = b;
			while(_g12 < _g5) {
				var i1 = _g12++;
				var a1 = s11.chars[i1];
				var b1 = s21.chars[i1];
				if(a1.min != b1.min) return b1.min - a1.min;
				if(a1.max != b1.max) return b1.max - a1.max;
			}
			if(a < b) return b - a;
			return 0;
		});
		return states1;
	}
	,addNode: function(nodes,n) {
		var _g = 0;
		while(_g < nodes.length) {
			var n2 = nodes[_g];
			++_g;
			if(n == n2) return;
		}
		nodes.push(n);
		this.addNodes(nodes,n.epsilon);
	}
	,addNodes: function(nodes,add) {
		var _g = 0;
		while(_g < add.length) {
			var n = add[_g];
			++_g;
			this.addNode(nodes,n);
		}
		return nodes;
	}
	,initNode: function(p,$final,pid) {
		switch(p[1]) {
		case 0:
			return $final;
		case 1:
			var c = p[2];
			var n = new hxparse._LexEngine.Node(this.uid++,pid);
			n.trans.push({ chars : c, n : $final});
			return n;
		case 2:
			var p1 = p[2];
			var n1 = new hxparse._LexEngine.Node(this.uid++,pid);
			var an = this.initNode(p1,n1,pid);
			n1.epsilon.push(an);
			n1.epsilon.push($final);
			return n1;
		case 3:
			var p2 = p[2];
			var n2 = new hxparse._LexEngine.Node(this.uid++,pid);
			var an1 = this.initNode(p2,n2,pid);
			n2.epsilon.push(an1);
			n2.epsilon.push($final);
			return an1;
		case 4:
			var b = p[3];
			var a = p[2];
			return this.initNode(a,this.initNode(b,$final,pid),pid);
		case 5:
			var b1 = p[3];
			var a1 = p[2];
			var n3 = new hxparse._LexEngine.Node(this.uid++,pid);
			n3.epsilon.push(this.initNode(a1,$final,pid));
			n3.epsilon.push(this.initNode(b1,$final,pid));
			return n3;
		case 6:
			var p3 = p[2];
			return this.initNode(p3,$final,pid);
		}
	}
	,__class__: hxparse.LexEngine
};
hxparse._LexEngine = {};
hxparse._LexEngine.Pattern = $hxClasses["hxparse._LexEngine.Pattern"] = { __ename__ : ["hxparse","_LexEngine","Pattern"], __constructs__ : ["Empty","Match","Star","Plus","Next","Choice","Group"] };
hxparse._LexEngine.Pattern.Empty = ["Empty",0];
hxparse._LexEngine.Pattern.Empty.toString = $estr;
hxparse._LexEngine.Pattern.Empty.__enum__ = hxparse._LexEngine.Pattern;
hxparse._LexEngine.Pattern.Match = function(c) { var $x = ["Match",1,c]; $x.__enum__ = hxparse._LexEngine.Pattern; $x.toString = $estr; return $x; };
hxparse._LexEngine.Pattern.Star = function(p) { var $x = ["Star",2,p]; $x.__enum__ = hxparse._LexEngine.Pattern; $x.toString = $estr; return $x; };
hxparse._LexEngine.Pattern.Plus = function(p) { var $x = ["Plus",3,p]; $x.__enum__ = hxparse._LexEngine.Pattern; $x.toString = $estr; return $x; };
hxparse._LexEngine.Pattern.Next = function(p1,p2) { var $x = ["Next",4,p1,p2]; $x.__enum__ = hxparse._LexEngine.Pattern; $x.toString = $estr; return $x; };
hxparse._LexEngine.Pattern.Choice = function(p1,p2) { var $x = ["Choice",5,p1,p2]; $x.__enum__ = hxparse._LexEngine.Pattern; $x.toString = $estr; return $x; };
hxparse._LexEngine.Pattern.Group = function(p) { var $x = ["Group",6,p]; $x.__enum__ = hxparse._LexEngine.Pattern; $x.toString = $estr; return $x; };
var js = {};
js.Boot = function() { };
$hxClasses["js.Boot"] = js.Boot;
js.Boot.__name__ = ["js","Boot"];
js.Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else return o.__class__;
};
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
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i1;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js.Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
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
		var str2 = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str2.length != 2) str2 += ", \n";
		str2 += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str2 += "\n" + s + "}";
		return str2;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
};
js.Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js.Boot.__interfLoop(js.Boot.getClass(o),cl)) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js.Boot.__cast = function(o,t) {
	if(js.Boot.__instanceof(o,t)) return o; else throw "Cannot cast " + Std.string(o) + " to " + Std.string(t);
};
hxparse._LexEngine.Node = function(id,pid) {
	this.id = id;
	this.pid = pid;
	this.trans = [];
	this.epsilon = [];
};
$hxClasses["hxparse._LexEngine.Node"] = hxparse._LexEngine.Node;
hxparse._LexEngine.Node.__name__ = ["hxparse","_LexEngine","Node"];
hxparse._LexEngine.Node.prototype = {
	id: null
	,pid: null
	,trans: null
	,epsilon: null
	,__class__: hxparse._LexEngine.Node
};
hxparse.Ruleset = function(state,functions,eofFunction,name) {
	if(name == null) name = "";
	this.state = state;
	this.functions = functions;
	this.eofFunction = eofFunction;
	this.name = name;
};
$hxClasses["hxparse.Ruleset"] = hxparse.Ruleset;
hxparse.Ruleset.__name__ = ["hxparse","Ruleset"];
hxparse.Ruleset.prototype = {
	state: null
	,functions: null
	,eofFunction: null
	,name: null
	,__class__: hxparse.Ruleset
};
hxparse.Position = function(source,min,max) {
	this.psource = source;
	this.pmin = min;
	this.pmax = max;
};
$hxClasses["hxparse.Position"] = hxparse.Position;
hxparse.Position.__name__ = ["hxparse","Position"];
hxparse.Position.prototype = {
	psource: null
	,pmin: null
	,pmax: null
	,toString: function() {
		return "" + this.psource + ":characters " + this.pmin + "-" + this.pmax;
	}
	,getLinePosition: function(input) {
		var lineMin = 1;
		var lineMax = 1;
		var posMin = 0;
		var posMax = 0;
		var cur = 0;
		while(cur < this.pmin) {
			if(input[cur] == 10) {
				lineMin++;
				posMin = cur;
			}
			cur++;
		}
		lineMax = lineMin;
		posMax = posMin;
		posMin = cur - posMin;
		while(cur < this.pmax) {
			if(input[cur] == 10) {
				lineMax++;
				posMax = cur;
			}
			cur++;
		}
		posMax = cur - posMax;
		return { lineMin : lineMin, lineMax : lineMax, posMin : posMin, posMax : posMax};
	}
	,format: function(input) {
		var linePos = this.getLinePosition(input);
		if(linePos.lineMin != linePos.lineMax) return "" + this.psource + ":lines " + linePos.lineMin + "-" + linePos.lineMax; else return "" + this.psource + ":line " + linePos.lineMin + ":characters " + linePos.posMin + "-" + linePos.posMax;
	}
	,__class__: hxparse.Position
};
haxeparser.HaxeLexer = function(input,sourceName) {
	hxparse.Lexer.call(this,input,sourceName);
};
$hxClasses["haxeparser.HaxeLexer"] = haxeparser.HaxeLexer;
haxeparser.HaxeLexer.__name__ = ["haxeparser","HaxeLexer"];
haxeparser.HaxeLexer.__interfaces__ = [hxparse.RuleBuilder];
haxeparser.HaxeLexer.mkPos = function(p) {
	return { file : p.psource, min : p.pmin, max : p.pmax};
};
haxeparser.HaxeLexer.mk = function(lexer,td) {
	return new haxeparser.Token(td,haxeparser.HaxeLexer.mkPos(new hxparse.Position(lexer.source,lexer.pos - lexer.current.length,lexer.pos)));
};
haxeparser.HaxeLexer.unescape = function(s) {
	var b = new StringBuf();
	var i = 0;
	var esc = false;
	while(true) {
		if(s.length == i) break;
		var c = HxOverrides.cca(s,i);
		if(esc) {
			var iNext = i + 1;
			var __ex0 = c;
			switch(c) {
			case 110:
				b.b += "\n";
				break;
			case 114:
				b.b += "\r";
				break;
			case 116:
				b.b += "\t";
				break;
			case 34:case 39:case 92:
				b.b += String.fromCharCode(c);
				break;
			default:
				{
					var _g = __ex0 >= 48 && __ex0 <= 51;
					switch(_g) {
					case true:
						iNext = iNext + 2;
						break;
					default:
						var c1 = c;
						switch(c) {
						case 120:
							var c2 = Std.parseInt("0x" + HxOverrides.substr(s,i + 1,2));
							b.b += String.fromCharCode(c2);
							iNext = iNext + 2;
							break;
						default:
							throw "Unknown escape sequence: " + String.fromCharCode(c1);
						}
					}
				}
			}
			esc = false;
			i = iNext;
		} else switch(c) {
		case 92:
			++i;
			esc = true;
			break;
		default:
			b.b += String.fromCharCode(c);
			++i;
		}
	}
	return b.b;
};
haxeparser.HaxeLexer.__super__ = hxparse.Lexer;
haxeparser.HaxeLexer.prototype = $extend(hxparse.Lexer.prototype,{
	__class__: haxeparser.HaxeLexer
});
haxeparser.ParserErrorMsg = $hxClasses["haxeparser.ParserErrorMsg"] = { __ename__ : ["haxeparser","ParserErrorMsg"], __constructs__ : ["MissingSemicolon","MissingType","DuplicateDefault","Custom"] };
haxeparser.ParserErrorMsg.MissingSemicolon = ["MissingSemicolon",0];
haxeparser.ParserErrorMsg.MissingSemicolon.toString = $estr;
haxeparser.ParserErrorMsg.MissingSemicolon.__enum__ = haxeparser.ParserErrorMsg;
haxeparser.ParserErrorMsg.MissingType = ["MissingType",1];
haxeparser.ParserErrorMsg.MissingType.toString = $estr;
haxeparser.ParserErrorMsg.MissingType.__enum__ = haxeparser.ParserErrorMsg;
haxeparser.ParserErrorMsg.DuplicateDefault = ["DuplicateDefault",2];
haxeparser.ParserErrorMsg.DuplicateDefault.toString = $estr;
haxeparser.ParserErrorMsg.DuplicateDefault.__enum__ = haxeparser.ParserErrorMsg;
haxeparser.ParserErrorMsg.Custom = function(s) { var $x = ["Custom",3,s]; $x.__enum__ = haxeparser.ParserErrorMsg; $x.toString = $estr; return $x; };
haxeparser.ParserError = function(message,pos) {
	this.msg = message;
	this.pos = pos;
};
$hxClasses["haxeparser.ParserError"] = haxeparser.ParserError;
haxeparser.ParserError.__name__ = ["haxeparser","ParserError"];
haxeparser.ParserError.prototype = {
	msg: null
	,pos: null
	,__class__: haxeparser.ParserError
};
haxeparser.SmallType = $hxClasses["haxeparser.SmallType"] = { __ename__ : ["haxeparser","SmallType"], __constructs__ : ["SNull","SBool","SFloat","SString"] };
haxeparser.SmallType.SNull = ["SNull",0];
haxeparser.SmallType.SNull.toString = $estr;
haxeparser.SmallType.SNull.__enum__ = haxeparser.SmallType;
haxeparser.SmallType.SBool = function(b) { var $x = ["SBool",1,b]; $x.__enum__ = haxeparser.SmallType; $x.toString = $estr; return $x; };
haxeparser.SmallType.SFloat = function(f) { var $x = ["SFloat",2,f]; $x.__enum__ = haxeparser.SmallType; $x.toString = $estr; return $x; };
haxeparser.SmallType.SString = function(s) { var $x = ["SString",3,s]; $x.__enum__ = haxeparser.SmallType; $x.toString = $estr; return $x; };
hxparse.Parser_haxeparser_HaxeLexer_haxeparser_Token = function(stream,ruleset) {
	this.stream = stream;
	this.ruleset = ruleset;
};
$hxClasses["hxparse.Parser_haxeparser_HaxeLexer_haxeparser_Token"] = hxparse.Parser_haxeparser_HaxeLexer_haxeparser_Token;
hxparse.Parser_haxeparser_HaxeLexer_haxeparser_Token.__name__ = ["hxparse","Parser_haxeparser_HaxeLexer_haxeparser_Token"];
hxparse.Parser_haxeparser_HaxeLexer_haxeparser_Token.prototype = {
	ruleset: null
	,last: null
	,stream: null
	,token: null
	,peek: function(n) {
		if(this.token == null) {
			this.token = new haxe.ds.GenericCell(this.stream.token(this.ruleset),null);
			n--;
		}
		var tok = this.token;
		while(n > 0) {
			if(tok.next == null) tok.next = new haxe.ds.GenericCell(this.stream.token(this.ruleset),null);
			tok = tok.next;
			n--;
		}
		return tok.elt;
	}
	,parseOptional: function(f) {
		try {
			return f();
		} catch( e ) {
			if( js.Boot.__instanceof(e,hxparse.NoMatch) ) {
				return null;
			} else throw(e);
		}
	}
	,parseRepeat: function(f) {
		var acc = [];
		while(true) try {
			acc.push(f());
		} catch( e ) {
			if( js.Boot.__instanceof(e,hxparse.NoMatch) ) {
				return acc;
			} else throw(e);
		}
	}
	,__class__: hxparse.Parser_haxeparser_HaxeLexer_haxeparser_Token
};
hxparse.ParserBuilder = function() { };
$hxClasses["hxparse.ParserBuilder"] = hxparse.ParserBuilder;
hxparse.ParserBuilder.__name__ = ["hxparse","ParserBuilder"];
haxeparser.HaxeParser = function(input,sourceName) {
	this.doResume = false;
	hxparse.Parser_haxeparser_HaxeLexer_haxeparser_Token.call(this,new haxeparser.HaxeLexer(input,sourceName),haxeparser.HaxeLexer.tok);
	this.mstack = [];
	this.defines = new haxe.ds.StringMap();
	this.defines.set("true",true);
	this.inMacro = false;
	this.doc = "";
};
$hxClasses["haxeparser.HaxeParser"] = haxeparser.HaxeParser;
haxeparser.HaxeParser.__name__ = ["haxeparser","HaxeParser"];
haxeparser.HaxeParser.__interfaces__ = [hxparse.ParserBuilder];
haxeparser.HaxeParser.punion = function(p1,p2) {
	return { file : p1.file, min : p1.min < p2.min?p1.min:p2.min, max : p1.max > p2.max?p1.max:p2.max};
};
haxeparser.HaxeParser.quoteIdent = function(s) {
	return s;
};
haxeparser.HaxeParser.isLowerIdent = function(s) {
	var loop;
	var loop1 = null;
	loop1 = function(p) {
		var c = HxOverrides.cca(s,p);
		if(c >= 97 && c <= 122) return true; else if(c == 95) {
			if(p + 1 < s.length) return loop1(p + 1); else return true;
		} else return false;
	};
	loop = loop1;
	return loop(0);
};
haxeparser.HaxeParser.isPostfix = function(e,u) {
	switch(u[1]) {
	case 0:case 1:
		{
			var _g = e.expr;
			switch(_g[1]) {
			case 0:case 3:case 1:
				return true;
			default:
				return false;
			}
		}
		break;
	case 2:case 3:case 4:
		return false;
	}
};
haxeparser.HaxeParser.precedence = function(op) {
	var left = true;
	var right = false;
	switch(op[1]) {
	case 19:
		return { p : 0, left : left};
	case 1:case 2:
		return { p : 0, left : left};
	case 0:case 3:
		return { p : 0, left : left};
	case 16:case 17:case 18:
		return { p : 0, left : left};
	case 12:case 11:case 13:
		return { p : 0, left : left};
	case 5:case 6:case 7:case 9:case 8:case 10:
		return { p : 0, left : left};
	case 21:
		return { p : 0, left : left};
	case 14:
		return { p : 0, left : left};
	case 15:
		return { p : 0, left : left};
	case 22:
		return { p : 0, left : left};
	case 4:case 20:
		return { p : 10, left : right};
	}
};
haxeparser.HaxeParser.isNotAssign = function(op) {
	switch(op[1]) {
	case 4:case 20:
		return false;
	default:
		return true;
	}
};
haxeparser.HaxeParser.isDollarIdent = function(e) {
	{
		var _g = e.expr;
		switch(_g[1]) {
		case 0:
			switch(_g[2][1]) {
			case 3:
				var n = _g[2][2];
				if(HxOverrides.cca(n,0) == 36) return true; else return false;
				break;
			default:
				return false;
			}
			break;
		default:
			return false;
		}
	}
};
haxeparser.HaxeParser.swap = function(op1,op2) {
	var i1 = haxeparser.HaxeParser.precedence(op1);
	var i2 = haxeparser.HaxeParser.precedence(op2);
	return i1.left && i1.p <= i2.p;
};
haxeparser.HaxeParser.makeBinop = function(op,e,e2) {
	{
		var _g = e2.expr;
		switch(_g[1]) {
		case 2:
			var _e2 = _g[4];
			var _e = _g[3];
			var _op = _g[2];
			if(haxeparser.HaxeParser.swap(op,_op)) {
				var _e1 = haxeparser.HaxeParser.makeBinop(op,e,_e);
				return { expr : haxe.macro.ExprDef.EBinop(_op,_e1,_e2), pos : haxeparser.HaxeParser.punion(_e1.pos,_e2.pos)};
			} else return { expr : haxe.macro.ExprDef.EBinop(op,e,e2), pos : haxeparser.HaxeParser.punion(e.pos,e2.pos)};
			break;
		case 27:
			var e3 = _g[4];
			var e21 = _g[3];
			var e1 = _g[2];
			if(haxeparser.HaxeParser.isNotAssign(op)) {
				var e4 = haxeparser.HaxeParser.makeBinop(op,e,e1);
				return { expr : haxe.macro.ExprDef.ETernary(e4,e21,e3), pos : haxeparser.HaxeParser.punion(e4.pos,e3.pos)};
			} else return { expr : haxe.macro.ExprDef.EBinop(op,e,e2), pos : haxeparser.HaxeParser.punion(e.pos,e2.pos)};
			break;
		default:
			return { expr : haxe.macro.ExprDef.EBinop(op,e,e2), pos : haxeparser.HaxeParser.punion(e.pos,e2.pos)};
		}
	}
};
haxeparser.HaxeParser.makeUnop = function(op,e,p1) {
	{
		var _g = e.expr;
		switch(_g[1]) {
		case 2:
			var e2 = _g[4];
			var e1 = _g[3];
			var bop = _g[2];
			return { expr : haxe.macro.ExprDef.EBinop(bop,haxeparser.HaxeParser.makeUnop(op,e1,p1),e2), pos : haxeparser.HaxeParser.punion(p1,e1.pos)};
		case 27:
			var e3 = _g[4];
			var e21 = _g[3];
			var e11 = _g[2];
			return { expr : haxe.macro.ExprDef.ETernary(haxeparser.HaxeParser.makeUnop(op,e11,p1),e21,e3), pos : haxeparser.HaxeParser.punion(p1,e.pos)};
		default:
			return { expr : haxe.macro.ExprDef.EUnop(op,false,e), pos : haxeparser.HaxeParser.punion(p1,e.pos)};
		}
	}
};
haxeparser.HaxeParser.makeMeta = function(name,params,e,p1) {
	{
		var _g = e.expr;
		switch(_g[1]) {
		case 2:
			var e2 = _g[4];
			var e1 = _g[3];
			var bop = _g[2];
			return { expr : haxe.macro.ExprDef.EBinop(bop,haxeparser.HaxeParser.makeMeta(name,params,e1,p1),e2), pos : haxeparser.HaxeParser.punion(p1,e1.pos)};
		case 27:
			var e3 = _g[4];
			var e21 = _g[3];
			var e11 = _g[2];
			return { expr : haxe.macro.ExprDef.ETernary(haxeparser.HaxeParser.makeMeta(name,params,e11,p1),e21,e3), pos : haxeparser.HaxeParser.punion(p1,e.pos)};
		default:
			return { expr : haxe.macro.ExprDef.EMeta({ name : name, params : params, pos : p1},e), pos : haxeparser.HaxeParser.punion(p1,e.pos)};
		}
	}
};
haxeparser.HaxeParser.aadd = function(a,t) {
	a.push(t);
	return a;
};
haxeparser.HaxeParser.__super__ = hxparse.Parser_haxeparser_HaxeLexer_haxeparser_Token;
haxeparser.HaxeParser.prototype = $extend(hxparse.Parser_haxeparser_HaxeLexer_haxeparser_Token.prototype,{
	defines: null
	,mstack: null
	,doResume: null
	,doc: null
	,inMacro: null
	,parse: function() {
		return this.parseFile();
	}
	,peek: function(n) {
		if(n == 0) {
			var tk = hxparse.Parser_haxeparser_HaxeLexer_haxeparser_Token.prototype.peek.call(this,0);
			{
				var t = tk;
				switch(tk.tok[1]) {
				case 7:case 6:
					this.last = this.token.elt;
					this.token = this.token.next;
					return this.peek(0);
				case 2:
					switch(tk.tok[2]) {
					case "error":case "line":
						this.last = this.token.elt;
						this.token = this.token.next;
						return this.peek(0);
					case "end":
						this.last = this.token.elt;
						this.token = this.token.next;
						if(this.mstack.length == 0) return tk; else {
							this.mstack.shift();
							return this.peek(0);
						}
						break;
					case "else":case "elseif":
						this.last = this.token.elt;
						this.token = this.token.next;
						if(this.mstack.length == 0) return tk; else {
							this.mstack.shift();
							return this.skipTokens(tk.pos,false);
						}
						break;
					case "if":
						this.last = this.token.elt;
						this.token = this.token.next;
						return this.enterMacro(tk.pos);
					default:
						return t;
					}
					break;
				default:
					return t;
				}
			}
		} else return hxparse.Parser_haxeparser_HaxeLexer_haxeparser_Token.prototype.peek.call(this,n);
	}
	,keywordString: function(k) {
		return ((function($this) {
			var $r;
			var _this = Std.string(k);
			$r = HxOverrides.substr(_this,3,null);
			return $r;
		}(this))).toLowerCase();
	}
	,parseMacroCond: function(allowOp) {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 1:
				switch(_g.tok[2][1]) {
				case 3:
					var p = _g.pos;
					var t = _g.tok[2][2];
					this.last = this.token.elt;
					this.token = this.token.next;
					return this.parseMacroIdent(allowOp,t,p);
				case 2:
					var p1 = _g.pos;
					var s = _g.tok[2][2];
					this.last = this.token.elt;
					this.token = this.token.next;
					return { tk : haxe.ds.Option.None, expr : { expr : haxe.macro.ExprDef.EConst(haxe.macro.Constant.CString(s)), pos : p1}};
				case 0:
					var p2 = _g.pos;
					var s1 = _g.tok[2][2];
					this.last = this.token.elt;
					this.token = this.token.next;
					return { tk : haxe.ds.Option.None, expr : { expr : haxe.macro.ExprDef.EConst(haxe.macro.Constant.CInt(s1)), pos : p2}};
				case 1:
					var p3 = _g.pos;
					var s2 = _g.tok[2][2];
					this.last = this.token.elt;
					this.token = this.token.next;
					return { tk : haxe.ds.Option.None, expr : { expr : haxe.macro.ExprDef.EConst(haxe.macro.Constant.CFloat(s2)), pos : p3}};
				default:
					throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
				}
				break;
			case 0:
				var p4 = _g.pos;
				var k = _g.tok[2];
				this.last = this.token.elt;
				this.token = this.token.next;
				return this.parseMacroIdent(allowOp,this.keywordString(k),p4);
			case 18:
				var p11 = _g.pos;
				this.last = this.token.elt;
				this.token = this.token.next;
				var o = this.parseMacroCond(true);
				{
					var _g1 = this.peek(0);
					switch(_g1.tok[1]) {
					case 19:
						var p21 = _g1.pos;
						this.last = this.token.elt;
						this.token = this.token.next;
						var e = { expr : haxe.macro.ExprDef.EParenthesis(o.expr), pos : haxeparser.HaxeParser.punion(p11,p21)};
						if(allowOp) return this.parseMacroOp(e); else return { tk : haxe.ds.Option.None, expr : e};
						break;
					default:
						throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
					}
				}
				break;
			case 4:
				var p5 = _g.pos;
				var op = _g.tok[2];
				this.last = this.token.elt;
				this.token = this.token.next;
				var o1 = this.parseMacroCond(allowOp);
				return { tk : o1.tk, expr : haxeparser.HaxeParser.makeUnop(op,o1.expr,p5)};
			default:
				throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
			}
		}
	}
	,parseMacroIdent: function(allowOp,t,p) {
		var e = { expr : haxe.macro.ExprDef.EConst(haxe.macro.Constant.CIdent(t)), pos : p};
		if(!allowOp) return { tk : haxe.ds.Option.None, expr : e}; else return this.parseMacroOp(e);
	}
	,parseMacroOp: function(e) {
		{
			var _g = this.peek(0);
			var tk = _g;
			switch(_g.tok[1]) {
			case 5:
				var op = _g.tok[2];
				this.last = this.token.elt;
				this.token = this.token.next;
				{
					var _g1 = this.peek(0);
					switch(_g1.tok[1]) {
					case 5:
						switch(_g1.tok[2][1]) {
						case 4:
							if(op == haxe.macro.Binop.OpGt) {
								this.last = this.token.elt;
								this.token = this.token.next;
								op = haxe.macro.Binop.OpGte;
							} else op = op;
							break;
						default:
							op = op;
						}
						break;
					default:
						op = op;
					}
				}
				var o = this.parseMacroCond(true);
				return { tk : o.tk, expr : haxeparser.HaxeParser.makeBinop(op,e,o.expr)};
			default:
				return { tk : haxe.ds.Option.Some(tk), expr : e};
			}
		}
	}
	,enterMacro: function(p) {
		var o = this.parseMacroCond(false);
		var tk;
		{
			var _g = o.tk;
			switch(_g[1]) {
			case 1:
				tk = this.peek(0);
				break;
			case 0:
				var tk1 = _g[2];
				tk = tk1;
				break;
			}
		}
		if(this.isTrue(this["eval"](o.expr))) {
			this.mstack.unshift(p);
			return tk;
		} else return this.skipTokensLoop(p,true,tk);
	}
	,next: function() {
		var tk = hxparse.Parser_haxeparser_HaxeLexer_haxeparser_Token.prototype.peek.call(this,0);
		this.last = this.token.elt;
		this.token = this.token.next;
		return tk;
	}
	,skipTokens: function(p,test) {
		return this.skipTokensLoop(p,test,this.next());
	}
	,skipTokensLoop: function(p,test,tk) {
		switch(tk.tok[1]) {
		case 2:
			switch(tk.tok[2]) {
			case "end":
				return this.peek(0);
			case "elseif":
				if(!test) return this.skipTokens(p,test); else return this.enterMacro(tk.pos);
				break;
			case "else":
				if(!test) return this.skipTokens(p,test); else {
					this.mstack.unshift(tk.pos);
					return this.peek(0);
				}
				break;
			case "if":
				return this.skipTokensLoop(p,test,this.skipTokens(p,false));
			default:
				return this.skipTokens(p,test);
			}
			break;
		case 22:
			throw "unclosed macro";
			break;
		default:
			return this.skipTokens(p,test);
		}
	}
	,isTrue: function(a) {
		switch(a[1]) {
		case 1:
			switch(a[2]) {
			case false:
				return false;
			default:
				return true;
			}
			break;
		case 0:
			return false;
		case 2:
			switch(a[2]) {
			case 0.0:
				return false;
			default:
				return true;
			}
			break;
		case 3:
			switch(a[2]) {
			case "":
				return false;
			default:
				return true;
			}
			break;
		}
	}
	,compare: function(a,b) {
		switch(a[1]) {
		case 0:
			switch(b[1]) {
			case 0:
				return 0;
			default:
				return 0;
			}
			break;
		case 2:
			switch(b[1]) {
			case 2:
				var a1 = a[2];
				var b1 = b[2];
				return Reflect.compare(a1,b1);
			case 3:
				var a2 = a[2];
				var b2 = b[2];
				return Reflect.compare(a2,Std.parseFloat(b2));
			default:
				return 0;
			}
			break;
		case 3:
			switch(b[1]) {
			case 3:
				var a3 = a[2];
				var b3 = b[2];
				return Reflect.compare(a3,b3);
			case 2:
				var a4 = a[2];
				var b4 = b[2];
				return Reflect.compare(Std.parseFloat(a4),b4);
			default:
				return 0;
			}
			break;
		case 1:
			switch(b[1]) {
			case 1:
				var a5 = a[2];
				var b5 = b[2];
				return Reflect.compare(a5,b5);
			default:
				return 0;
			}
			break;
		}
	}
	,'eval': function(e) {
		{
			var _g = e.expr;
			switch(_g[1]) {
			case 0:
				switch(_g[2][1]) {
				case 3:
					var s = _g[2][2];
					if(this.defines.exists(s)) return haxeparser.SmallType.SString(s); else return haxeparser.SmallType.SNull;
					break;
				case 2:
					var s1 = _g[2][2];
					return haxeparser.SmallType.SString(s1);
				case 0:
					var f = _g[2][2];
					return haxeparser.SmallType.SFloat(Std.parseFloat(f));
				case 1:
					var f = _g[2][2];
					return haxeparser.SmallType.SFloat(Std.parseFloat(f));
				default:
					throw "Invalid condition expression";
				}
				break;
			case 2:
				var op = _g[2];
				switch(_g[2][1]) {
				case 14:
					var e2 = _g[4];
					var e1 = _g[3];
					return haxeparser.SmallType.SBool(this.isTrue(this["eval"](e1)) && this.isTrue(this["eval"](e2)));
				case 15:
					var e21 = _g[4];
					var e11 = _g[3];
					return haxeparser.SmallType.SBool(this.isTrue(this["eval"](e11)) || this.isTrue(this["eval"](e21)));
				default:
					var e22 = _g[4];
					var e12 = _g[3];
					var v1 = this["eval"](e12);
					var v2 = this["eval"](e22);
					var cmp = this.compare(v1,v2);
					var val;
					switch(op[1]) {
					case 5:
						val = cmp == 0;
						break;
					case 6:
						val = cmp != 0;
						break;
					case 7:
						val = cmp > 0;
						break;
					case 8:
						val = cmp >= 0;
						break;
					case 9:
						val = cmp < 0;
						break;
					case 10:
						val = cmp <= 0;
						break;
					default:
						throw "Unsupported operation";
					}
					return haxeparser.SmallType.SBool(val);
				}
				break;
			case 9:
				switch(_g[2][1]) {
				case 2:
					var e3 = _g[4];
					return haxeparser.SmallType.SBool(!this.isTrue(this["eval"](e3)));
				default:
					throw "Invalid condition expression";
				}
				break;
			case 4:
				var e4 = _g[2];
				return this["eval"](e4);
			default:
				throw "Invalid condition expression";
			}
		}
	}
	,psep: function(sep,f) {
		var _g = this;
		var acc = [];
		while(true) try {
			acc.push(f());
			var def = function() {
				throw new hxparse.NoMatch(_g.stream.curPos(),_g.peek(0));
			};
			{
				var _g1 = this.peek(0);
				var sep2 = _g1.tok;
				if(sep2 == sep) {
					this.last = this.token.elt;
					this.token = this.token.next;
					null;
				} else def();
			}
		} catch( e ) {
			if( js.Boot.__instanceof(e,hxparse.NoMatch) ) {
				break;
			} else throw(e);
		}
		return acc;
	}
	,ident: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 1:
				switch(_g.tok[2][1]) {
				case 3:
					var p = _g.pos;
					var i = _g.tok[2][2];
					this.last = this.token.elt;
					this.token = this.token.next;
					return { name : i, pos : p};
				default:
					throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
				}
				break;
			default:
				throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
			}
		}
	}
	,dollarIdent: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 1:
				switch(_g.tok[2][1]) {
				case 3:
					var p = _g.pos;
					var i = _g.tok[2][2];
					this.last = this.token.elt;
					this.token = this.token.next;
					return { name : i, pos : p};
				default:
					throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
				}
				break;
			case 3:
				var p1 = _g.pos;
				var i1 = _g.tok[2];
				this.last = this.token.elt;
				this.token = this.token.next;
				return { name : "$" + i1, pos : p1};
			default:
				throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
			}
		}
	}
	,dollarIdentMacro: function(pack) {
		var _g1 = this;
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 1:
				switch(_g.tok[2][1]) {
				case 3:
					var p = _g.pos;
					var i = _g.tok[2][2];
					this.last = this.token.elt;
					this.token = this.token.next;
					return { name : i, pos : p};
				default:
					var def = function() {
						throw new hxparse.NoMatch(_g1.stream.curPos(),_g1.peek(0));
					};
					{
						var _g11 = this.peek(0);
						switch(_g11.tok[1]) {
						case 0:
							switch(_g11.tok[2][1]) {
							case 41:
								var p1 = _g11.pos;
								if(pack.length > 0) {
									this.last = this.token.elt;
									this.token = this.token.next;
									return { name : "macro", pos : p1};
								} else return def();
								break;
							default:
								return def();
							}
							break;
						default:
							return def();
						}
					}
				}
				break;
			case 3:
				var p2 = _g.pos;
				var i1 = _g.tok[2];
				this.last = this.token.elt;
				this.token = this.token.next;
				return { name : "$" + i1, pos : p2};
			default:
				var def = function() {
					throw new hxparse.NoMatch(_g1.stream.curPos(),_g1.peek(0));
				};
				{
					var _g11 = this.peek(0);
					switch(_g11.tok[1]) {
					case 0:
						switch(_g11.tok[2][1]) {
						case 41:
							var p1 = _g11.pos;
							if(pack.length > 0) {
								this.last = this.token.elt;
								this.token = this.token.next;
								return { name : "macro", pos : p1};
							} else return def();
							break;
						default:
							return def();
						}
						break;
					default:
						return def();
					}
				}
			}
		}
	}
	,lowerIdentOrMacro: function() {
		var _g = this;
		var def = function() {
			{
				var _g1 = _g.peek(0);
				switch(_g1.tok[1]) {
				case 0:
					switch(_g1.tok[2][1]) {
					case 41:
						_g.last = _g.token.elt;
						_g.token = _g.token.next;
						return "macro";
					default:
						throw new hxparse.NoMatch(_g.stream.curPos(),_g.peek(0));
					}
					break;
				default:
					throw new hxparse.NoMatch(_g.stream.curPos(),_g.peek(0));
				}
			}
		};
		{
			var _g2 = this.peek(0);
			switch(_g2.tok[1]) {
			case 1:
				switch(_g2.tok[2][1]) {
				case 3:
					var i = _g2.tok[2][2];
					if(haxeparser.HaxeParser.isLowerIdent(i)) {
						this.last = this.token.elt;
						this.token = this.token.next;
						return i;
					} else return def();
					break;
				default:
					return def();
				}
				break;
			default:
				return def();
			}
		}
	}
	,anyEnumIdent: function() {
		try {
			var i = this.ident();
			return i;
		} catch( _ ) {
			if( js.Boot.__instanceof(_,hxparse.NoMatch) ) {
				{
					var _g = this.peek(0);
					switch(_g.tok[1]) {
					case 0:
						var p = _g.pos;
						var k = _g.tok[2];
						this.last = this.token.elt;
						this.token = this.token.next;
						return { name : k[0].toLowerCase(), pos : p};
					default:
						throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
					}
				}
			} else throw(_);
		}
	}
	,propertyIdent: function() {
		try {
			var i = this.ident();
			return i.name;
		} catch( _ ) {
			if( js.Boot.__instanceof(_,hxparse.NoMatch) ) {
				{
					var _g = this.peek(0);
					switch(_g.tok[1]) {
					case 0:
						switch(_g.tok[2][1]) {
						case 33:
							this.last = this.token.elt;
							this.token = this.token.next;
							return "dynamic";
						case 16:
							this.last = this.token.elt;
							this.token = this.token.next;
							return "default";
						case 37:
							this.last = this.token.elt;
							this.token = this.token.next;
							return "null";
						default:
							throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
						}
						break;
					default:
						throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
					}
				}
			} else throw(_);
		}
	}
	,getDoc: function() {
		return "";
	}
	,semicolon: function() {
		if(this.last.tok == haxeparser.TokenDef.BrClose) {
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 9:
				var p = _g.pos;
				this.last = this.token.elt;
				this.token = this.token.next;
				return p;
			default:
				return this.last.pos;
			}
		} else {
			var _g1 = this.peek(0);
			switch(_g1.tok[1]) {
			case 9:
				var p1 = _g1.pos;
				this.last = this.token.elt;
				this.token = this.token.next;
				return p1;
			default:
				var pos = this.last.pos;
				if(this.doResume) return pos; else throw new haxeparser.ParserError(haxeparser.ParserErrorMsg.MissingSemicolon,pos);
			}
		}
	}
	,parseFile: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 0:
				switch(_g.tok[2][1]) {
				case 34:
					this.last = this.token.elt;
					this.token = this.token.next;
					var p = this.parsePackage();
					this.semicolon();
					var l = this.parseTypeDecls(p,[]);
					{
						var _g1 = this.peek(0);
						switch(_g1.tok[1]) {
						case 22:
							this.last = this.token.elt;
							this.token = this.token.next;
							return { pack : p, decls : l};
						default:
							throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
						}
					}
					break;
				default:
					var l1 = this.parseTypeDecls([],[]);
					{
						var _g11 = this.peek(0);
						switch(_g11.tok[1]) {
						case 22:
							this.last = this.token.elt;
							this.token = this.token.next;
							return { pack : [], decls : l1};
						default:
							throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
						}
					}
				}
				break;
			default:
				var l1 = this.parseTypeDecls([],[]);
				{
					var _g11 = this.peek(0);
					switch(_g11.tok[1]) {
					case 22:
						this.last = this.token.elt;
						this.token = this.token.next;
						return { pack : [], decls : l1};
					default:
						throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
					}
				}
			}
		}
	}
	,parseTypeDecls: function(pack,acc) {
		try {
			var v = this.parseTypeDecl();
			var l = this.parseTypeDecls(pack,haxeparser.HaxeParser.aadd(acc,v));
			return l;
		} catch( _ ) {
			if( js.Boot.__instanceof(_,hxparse.NoMatch) ) {
				return acc;
			} else throw(_);
		}
	}
	,parseTypeDecl: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 0:
				switch(_g.tok[2][1]) {
				case 13:
					var p1 = _g.pos;
					this.last = this.token.elt;
					this.token = this.token.next;
					return this.parseImport(p1);
				case 36:
					var p11 = _g.pos;
					this.last = this.token.elt;
					this.token = this.token.next;
					var t = this.parseTypePath();
					var p2 = this.semicolon();
					return { decl : haxeparser.TypeDef.EUsing(t), pos : haxeparser.HaxeParser.punion(p11,p2)};
				default:
					var meta = this.parseMeta();
					var c = this.parseCommonFlags();
					try {
						var flags = this.parseEnumFlags();
						var doc = this.getDoc();
						var name = this.typeName();
						var tl = this.parseConstraintParams();
						{
							var _g1 = this.peek(0);
							switch(_g1.tok[1]) {
							case 16:
								this.last = this.token.elt;
								this.token = this.token.next;
								var l = this.parseRepeat($bind(this,this.parseEnum));
								{
									var _g2 = this.peek(0);
									switch(_g2.tok[1]) {
									case 17:
										var p21 = _g2.pos;
										this.last = this.token.elt;
										this.token = this.token.next;
										return { decl : haxeparser.TypeDef.EEnum({ name : name, doc : doc, meta : meta, params : tl, flags : c.map(function(i) {
											return i.e;
										}).concat(flags.flags), data : l}), pos : haxeparser.HaxeParser.punion(flags.pos,p21)};
									default:
										throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
									}
								}
								break;
							default:
								throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
							}
						}
					} catch( _ ) {
						if( js.Boot.__instanceof(_,hxparse.NoMatch) ) {
							try {
								var flags1 = this.parseClassFlags();
								var doc1 = this.getDoc();
								var name1 = this.typeName();
								var tl1 = this.parseConstraintParams();
								var hl = this.parseRepeat($bind(this,this.parseClassHerit));
								{
									var _g11 = this.peek(0);
									switch(_g11.tok[1]) {
									case 16:
										this.last = this.token.elt;
										this.token = this.token.next;
										var fl = this.parseClassFields(false,flags1.pos);
										return { decl : haxeparser.TypeDef.EClass({ name : name1, doc : doc1, meta : meta, params : tl1, flags : c.map(function(i1) {
											return i1.c;
										}).concat(flags1.flags).concat(hl), data : fl.fields}), pos : haxeparser.HaxeParser.punion(flags1.pos,fl.pos)};
									default:
										throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
									}
								}
							} catch( _1 ) {
								if( js.Boot.__instanceof(_1,hxparse.NoMatch) ) {
									{
										var _g12 = this.peek(0);
										switch(_g12.tok[1]) {
										case 0:
											switch(_g12.tok[2][1]) {
											case 32:
												var p12 = _g12.pos;
												this.last = this.token.elt;
												this.token = this.token.next;
												var doc2 = this.getDoc();
												var name2 = this.typeName();
												var tl2 = this.parseConstraintParams();
												{
													var _g21 = this.peek(0);
													switch(_g21.tok[1]) {
													case 5:
														switch(_g21.tok[2][1]) {
														case 4:
															var p22 = _g21.pos;
															this.last = this.token.elt;
															this.token = this.token.next;
															var t1 = this.parseComplexType();
															{
																var _g3 = this.peek(0);
																switch(_g3.tok[1]) {
																case 9:
																	this.last = this.token.elt;
																	this.token = this.token.next;
																	null;
																	break;
																default:
																	null;
																}
															}
															return { decl : haxeparser.TypeDef.ETypedef({ name : name2, doc : doc2, meta : meta, params : tl2, flags : c.map(function(i2) {
																return i2.e;
															}), data : t1}), pos : haxeparser.HaxeParser.punion(p12,p22)};
														default:
															throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
														}
														break;
													default:
														throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
													}
												}
												break;
											case 40:
												var p13 = _g12.pos;
												this.last = this.token.elt;
												this.token = this.token.next;
												var name3 = this.typeName();
												var tl3 = this.parseConstraintParams();
												var st = this.parseAbstractSubtype();
												var sl = this.parseRepeat($bind(this,this.parseAbstractRelations));
												{
													var _g22 = this.peek(0);
													switch(_g22.tok[1]) {
													case 16:
														this.last = this.token.elt;
														this.token = this.token.next;
														var fl1 = this.parseClassFields(false,p13);
														var flags2 = c.map(function(flag) {
															var _g31 = flag.e;
															switch(_g31[1]) {
															case 0:
																return haxeparser.AbstractFlag.APrivAbstract;
															case 1:
																throw "extern abstract is not allowed";
																break;
															}
														});
														if(st != null) flags2.push(haxeparser.AbstractFlag.AIsType(st));
														return { decl : haxeparser.TypeDef.EAbstract({ name : name3, doc : this.doc, meta : meta, params : tl3, flags : flags2.concat(sl), data : fl1.fields}), pos : haxeparser.HaxeParser.punion(p13,fl1.pos)};
													default:
														throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
													}
												}
												break;
											default:
												throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
											}
											break;
										default:
											throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
										}
									}
								} else throw(_1);
							}
						} else throw(_);
					}
				}
				break;
			default:
				var meta = this.parseMeta();
				var c = this.parseCommonFlags();
				try {
					var flags = this.parseEnumFlags();
					var doc = this.getDoc();
					var name = this.typeName();
					var tl = this.parseConstraintParams();
					{
						var _g1 = this.peek(0);
						switch(_g1.tok[1]) {
						case 16:
							this.last = this.token.elt;
							this.token = this.token.next;
							var l = this.parseRepeat($bind(this,this.parseEnum));
							{
								var _g2 = this.peek(0);
								switch(_g2.tok[1]) {
								case 17:
									var p21 = _g2.pos;
									this.last = this.token.elt;
									this.token = this.token.next;
									return { decl : haxeparser.TypeDef.EEnum({ name : name, doc : doc, meta : meta, params : tl, flags : c.map(function(i) {
										return i.e;
									}).concat(flags.flags), data : l}), pos : haxeparser.HaxeParser.punion(flags.pos,p21)};
								default:
									throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
								}
							}
							break;
						default:
							throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
						}
					}
				} catch( _ ) {
					if( js.Boot.__instanceof(_,hxparse.NoMatch) ) {
						try {
							var flags1 = this.parseClassFlags();
							var doc1 = this.getDoc();
							var name1 = this.typeName();
							var tl1 = this.parseConstraintParams();
							var hl = this.parseRepeat($bind(this,this.parseClassHerit));
							{
								var _g11 = this.peek(0);
								switch(_g11.tok[1]) {
								case 16:
									this.last = this.token.elt;
									this.token = this.token.next;
									var fl = this.parseClassFields(false,flags1.pos);
									return { decl : haxeparser.TypeDef.EClass({ name : name1, doc : doc1, meta : meta, params : tl1, flags : c.map(function(i1) {
										return i1.c;
									}).concat(flags1.flags).concat(hl), data : fl.fields}), pos : haxeparser.HaxeParser.punion(flags1.pos,fl.pos)};
								default:
									throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
								}
							}
						} catch( _1 ) {
							if( js.Boot.__instanceof(_1,hxparse.NoMatch) ) {
								{
									var _g12 = this.peek(0);
									switch(_g12.tok[1]) {
									case 0:
										switch(_g12.tok[2][1]) {
										case 32:
											var p12 = _g12.pos;
											this.last = this.token.elt;
											this.token = this.token.next;
											var doc2 = this.getDoc();
											var name2 = this.typeName();
											var tl2 = this.parseConstraintParams();
											{
												var _g21 = this.peek(0);
												switch(_g21.tok[1]) {
												case 5:
													switch(_g21.tok[2][1]) {
													case 4:
														var p22 = _g21.pos;
														this.last = this.token.elt;
														this.token = this.token.next;
														var t1 = this.parseComplexType();
														{
															var _g3 = this.peek(0);
															switch(_g3.tok[1]) {
															case 9:
																this.last = this.token.elt;
																this.token = this.token.next;
																null;
																break;
															default:
																null;
															}
														}
														return { decl : haxeparser.TypeDef.ETypedef({ name : name2, doc : doc2, meta : meta, params : tl2, flags : c.map(function(i2) {
															return i2.e;
														}), data : t1}), pos : haxeparser.HaxeParser.punion(p12,p22)};
													default:
														throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
													}
													break;
												default:
													throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
												}
											}
											break;
										case 40:
											var p13 = _g12.pos;
											this.last = this.token.elt;
											this.token = this.token.next;
											var name3 = this.typeName();
											var tl3 = this.parseConstraintParams();
											var st = this.parseAbstractSubtype();
											var sl = this.parseRepeat($bind(this,this.parseAbstractRelations));
											{
												var _g22 = this.peek(0);
												switch(_g22.tok[1]) {
												case 16:
													this.last = this.token.elt;
													this.token = this.token.next;
													var fl1 = this.parseClassFields(false,p13);
													var flags2 = c.map(function(flag) {
														var _g31 = flag.e;
														switch(_g31[1]) {
														case 0:
															return haxeparser.AbstractFlag.APrivAbstract;
														case 1:
															throw "extern abstract is not allowed";
															break;
														}
													});
													if(st != null) flags2.push(haxeparser.AbstractFlag.AIsType(st));
													return { decl : haxeparser.TypeDef.EAbstract({ name : name3, doc : this.doc, meta : meta, params : tl3, flags : flags2.concat(sl), data : fl1.fields}), pos : haxeparser.HaxeParser.punion(p13,fl1.pos)};
												default:
													throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
												}
											}
											break;
										default:
											throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
										}
										break;
									default:
										throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
									}
								}
							} else throw(_1);
						}
					} else throw(_);
				}
			}
		}
	}
	,parseClass: function(meta,cflags,needName) {
		var _g = this;
		var optName;
		if(needName) optName = $bind(this,this.typeName); else optName = function() {
			var t = _g.parseOptional($bind(_g,_g.typeName));
			if(t == null) return ""; else return t;
		};
		var flags = this.parseClassFlags();
		var doc = this.getDoc();
		var name = optName();
		var tl = this.parseConstraintParams();
		var hl = this.psep(haxeparser.TokenDef.Comma,$bind(this,this.parseClassHerit));
		{
			var _g1 = this.peek(0);
			switch(_g1.tok[1]) {
			case 16:
				this.last = this.token.elt;
				this.token = this.token.next;
				var fl = this.parseClassFields(false,flags.pos);
				return { decl : haxeparser.TypeDef.EClass({ name : name, doc : doc, meta : meta, params : tl, flags : cflags.map(function(i) {
					return i.fst;
				}).concat(flags.flags).concat(hl), data : fl.fields}), pos : haxeparser.HaxeParser.punion(flags.pos,fl.pos)};
			default:
				throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
			}
		}
	}
	,parseImport: function(p1) {
		var acc;
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 1:
				switch(_g.tok[2][1]) {
				case 3:
					var p = _g.pos;
					var name = _g.tok[2][2];
					this.last = this.token.elt;
					this.token = this.token.next;
					acc = [{ pack : name, pos : p}];
					break;
				default:
					throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
				}
				break;
			default:
				throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
			}
		}
		while(true) {
			var _g1 = this.peek(0);
			switch(_g1.tok[1]) {
			case 10:
				this.last = this.token.elt;
				this.token = this.token.next;
				{
					var _g11 = this.peek(0);
					switch(_g11.tok[1]) {
					case 1:
						switch(_g11.tok[2][1]) {
						case 3:
							var p2 = _g11.pos;
							var k = _g11.tok[2][2];
							this.last = this.token.elt;
							this.token = this.token.next;
							acc.push({ pack : k, pos : p2});
							break;
						default:
							throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
						}
						break;
					case 0:
						switch(_g11.tok[2][1]) {
						case 41:
							var p3 = _g11.pos;
							this.last = this.token.elt;
							this.token = this.token.next;
							acc.push({ pack : "macro", pos : p3});
							break;
						default:
							throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
						}
						break;
					case 5:
						switch(_g11.tok[2][1]) {
						case 1:
							this.last = this.token.elt;
							this.token = this.token.next;
							{
								var _g2 = this.peek(0);
								switch(_g2.tok[1]) {
								case 9:
									var p21 = _g2.pos;
									this.last = this.token.elt;
									this.token = this.token.next;
									return { decl : haxeparser.TypeDef.EImport(acc,haxeparser.ImportMode.IAll), pos : p21};
								default:
									throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
								}
							}
							break;
						default:
							throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
						}
						break;
					default:
						throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
					}
				}
				break;
			case 9:
				var p22 = _g1.pos;
				this.last = this.token.elt;
				this.token = this.token.next;
				return { decl : haxeparser.TypeDef.EImport(acc,haxeparser.ImportMode.INormal), pos : p22};
			case 0:
				switch(_g1.tok[2][1]) {
				case 27:
					this.last = this.token.elt;
					this.token = this.token.next;
					{
						var _g12 = this.peek(0);
						switch(_g12.tok[1]) {
						case 1:
							switch(_g12.tok[2][1]) {
							case 3:
								var name1 = _g12.tok[2][2];
								this.last = this.token.elt;
								this.token = this.token.next;
								{
									var _g21 = this.peek(0);
									switch(_g21.tok[1]) {
									case 9:
										var p23 = _g21.pos;
										this.last = this.token.elt;
										this.token = this.token.next;
										return { decl : haxeparser.TypeDef.EImport(acc,haxeparser.ImportMode.IAsName(name1)), pos : p23};
									default:
										throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
									}
								}
								break;
							default:
								throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
							}
							break;
						default:
							throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
						}
					}
					break;
				default:
					throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
				}
				break;
			default:
				throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
			}
		}
	}
	,parseAbstractRelations: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 1:
				switch(_g.tok[2][1]) {
				case 3:
					switch(_g.tok[2][2]) {
					case "to":
						this.last = this.token.elt;
						this.token = this.token.next;
						var t = this.parseComplexType();
						return haxeparser.AbstractFlag.AToType(t);
					case "from":
						this.last = this.token.elt;
						this.token = this.token.next;
						var t1 = this.parseComplexType();
						return haxeparser.AbstractFlag.AFromType(t1);
					default:
						throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
					}
					break;
				default:
					throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
				}
				break;
			default:
				throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
			}
		}
	}
	,parseAbstractSubtype: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 18:
				this.last = this.token.elt;
				this.token = this.token.next;
				var t = this.parseComplexType();
				{
					var _g1 = this.peek(0);
					switch(_g1.tok[1]) {
					case 19:
						this.last = this.token.elt;
						this.token = this.token.next;
						return t;
					default:
						throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
					}
				}
				break;
			default:
				return null;
			}
		}
	}
	,parsePackage: function() {
		return this.psep(haxeparser.TokenDef.Dot,$bind(this,this.lowerIdentOrMacro));
	}
	,parseClassFields: function(tdecl,p1) {
		var l = this.parseClassFieldResume(tdecl);
		var p2;
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 17:
				var p21 = _g.pos;
				this.last = this.token.elt;
				this.token = this.token.next;
				p2 = p21;
				break;
			default:
				throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
			}
		}
		return { fields : l, pos : p2};
	}
	,parseClassFieldResume: function(tdecl) {
		return this.parseRepeat($bind(this,this.parseClassField));
	}
	,parseCommonFlags: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 0:
				switch(_g.tok[2][1]) {
				case 19:
					this.last = this.token.elt;
					this.token = this.token.next;
					var l = this.parseCommonFlags();
					return haxeparser.HaxeParser.aadd(l,{ c : haxeparser.ClassFlag.HPrivate, e : haxeparser.EnumFlag.EPrivate});
				case 25:
					this.last = this.token.elt;
					this.token = this.token.next;
					var l1 = this.parseCommonFlags();
					return haxeparser.HaxeParser.aadd(l1,{ c : haxeparser.ClassFlag.HExtern, e : haxeparser.EnumFlag.EExtern});
				default:
					return [];
				}
				break;
			default:
				return [];
			}
		}
	}
	,parseMetaParams: function(pname) {
		var def = function() {
			return [];
		};
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 18:
				var p = _g.pos;
				if(p.min == pname.max) {
					this.last = this.token.elt;
					this.token = this.token.next;
					var params = this.psep(haxeparser.TokenDef.Comma,$bind(this,this.expr));
					{
						var _g1 = this.peek(0);
						switch(_g1.tok[1]) {
						case 19:
							this.last = this.token.elt;
							this.token = this.token.next;
							return params;
						default:
							throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
						}
					}
				} else return def();
				break;
			default:
				return def();
			}
		}
	}
	,parseMetaEntry: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 21:
				this.last = this.token.elt;
				this.token = this.token.next;
				var name = this.metaName();
				var params = this.parseMetaParams(name.pos);
				return { name : name.name, params : params, pos : name.pos};
			default:
				throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
			}
		}
	}
	,parseMeta: function() {
		try {
			var entry = this.parseMetaEntry();
			return haxeparser.HaxeParser.aadd(this.parseMeta(),entry);
		} catch( _ ) {
			if( js.Boot.__instanceof(_,hxparse.NoMatch) ) {
				return [];
			} else throw(_);
		}
	}
	,metaName: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 1:
				switch(_g.tok[2][1]) {
				case 3:
					var p = _g.pos;
					var i = _g.tok[2][2];
					this.last = this.token.elt;
					this.token = this.token.next;
					return { name : i, pos : p};
				default:
					throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
				}
				break;
			case 0:
				var p1 = _g.pos;
				var k = _g.tok[2];
				this.last = this.token.elt;
				this.token = this.token.next;
				return { name : k[0].toLowerCase(), pos : p1};
			case 11:
				this.last = this.token.elt;
				this.token = this.token.next;
				{
					var _g1 = this.peek(0);
					switch(_g1.tok[1]) {
					case 1:
						switch(_g1.tok[2][1]) {
						case 3:
							var p2 = _g1.pos;
							var i1 = _g1.tok[2][2];
							this.last = this.token.elt;
							this.token = this.token.next;
							return { name : ":" + i1, pos : p2};
						default:
							throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
						}
						break;
					case 0:
						var p3 = _g1.pos;
						var k1 = _g1.tok[2];
						this.last = this.token.elt;
						this.token = this.token.next;
						return { name : ":" + k1[0].toLowerCase(), pos : p3};
					default:
						throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
					}
				}
				break;
			default:
				throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
			}
		}
	}
	,parseEnumFlags: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 0:
				switch(_g.tok[2][1]) {
				case 26:
					var p = _g.pos;
					this.last = this.token.elt;
					this.token = this.token.next;
					return { flags : [], pos : p};
				default:
					throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
				}
				break;
			default:
				throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
			}
		}
	}
	,parseClassFlags: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 0:
				switch(_g.tok[2][1]) {
				case 1:
					var p = _g.pos;
					this.last = this.token.elt;
					this.token = this.token.next;
					return { flags : [], pos : p};
				case 28:
					var p1 = _g.pos;
					this.last = this.token.elt;
					this.token = this.token.next;
					return { flags : haxeparser.HaxeParser.aadd([],haxeparser.ClassFlag.HInterface), pos : p1};
				default:
					throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
				}
				break;
			default:
				throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
			}
		}
	}
	,parseTypeOpt: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 11:
				this.last = this.token.elt;
				this.token = this.token.next;
				var t = this.parseComplexType();
				return t;
			default:
				return null;
			}
		}
	}
	,parseComplexType: function() {
		var t = this.parseComplexTypeInner();
		return this.parseComplexTypeNext(t);
	}
	,parseComplexTypeInner: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 18:
				this.last = this.token.elt;
				this.token = this.token.next;
				var t = this.parseComplexType();
				{
					var _g1 = this.peek(0);
					switch(_g1.tok[1]) {
					case 19:
						this.last = this.token.elt;
						this.token = this.token.next;
						return haxe.macro.ComplexType.TParent(t);
					default:
						throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
					}
				}
				break;
			case 16:
				var p1 = _g.pos;
				this.last = this.token.elt;
				this.token = this.token.next;
				try {
					var l = this.parseTypeAnonymous(false);
					return haxe.macro.ComplexType.TAnonymous(l);
				} catch( _ ) {
					if( js.Boot.__instanceof(_,hxparse.NoMatch) ) {
						{
							var _g11 = this.peek(0);
							switch(_g11.tok[1]) {
							case 5:
								switch(_g11.tok[2][1]) {
								case 7:
									this.last = this.token.elt;
									this.token = this.token.next;
									var t1 = this.parseTypePath();
									{
										var _g2 = this.peek(0);
										switch(_g2.tok[1]) {
										case 13:
											this.last = this.token.elt;
											this.token = this.token.next;
											try {
												var l1 = this.parseTypeAnonymous(false);
												return haxe.macro.ComplexType.TExtend([t1],l1);
											} catch( _1 ) {
												if( js.Boot.__instanceof(_1,hxparse.NoMatch) ) {
													try {
														var fl = this.parseClassFields(true,p1);
														return haxe.macro.ComplexType.TExtend([t1],fl.fields);
													} catch( _2 ) {
														if( js.Boot.__instanceof(_2,hxparse.NoMatch) ) {
															throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
														} else throw(_2);
													}
												} else throw(_1);
											}
											break;
										default:
											throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
										}
									}
									break;
								default:
									try {
										var l2 = this.parseClassFields(true,p1);
										return haxe.macro.ComplexType.TAnonymous(l2.fields);
									} catch( _3 ) {
										if( js.Boot.__instanceof(_3,hxparse.NoMatch) ) {
											throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
										} else throw(_3);
									}
								}
								break;
							default:
								try {
									var l2 = this.parseClassFields(true,p1);
									return haxe.macro.ComplexType.TAnonymous(l2.fields);
								} catch( _3 ) {
									if( js.Boot.__instanceof(_3,hxparse.NoMatch) ) {
										throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
									} else throw(_3);
								}
							}
						}
					} else throw(_);
				}
				break;
			case 20:
				this.last = this.token.elt;
				this.token = this.token.next;
				var t2 = this.parseComplexTypeInner();
				return haxe.macro.ComplexType.TOptional(t2);
			default:
				var t3 = this.parseTypePath();
				return haxe.macro.ComplexType.TPath(t3);
			}
		}
	}
	,parseTypePath: function() {
		return this.parseTypePath1([]);
	}
	,parseTypePath1: function(pack) {
		var _g1 = this;
		var ident = this.dollarIdentMacro(pack);
		if(haxeparser.HaxeParser.isLowerIdent(ident.name)) {
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 10:
				this.last = this.token.elt;
				this.token = this.token.next;
				return this.parseTypePath1(haxeparser.HaxeParser.aadd(pack,ident.name));
			case 9:
				this.last = this.token.elt;
				this.token = this.token.next;
				throw new haxeparser.ParserError(haxeparser.ParserErrorMsg.Custom("Type name should start with an uppercase letter"),ident.pos);
				break;
			default:
				throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
			}
		} else {
			var sub;
			{
				var _g2 = this.peek(0);
				switch(_g2.tok[1]) {
				case 10:
					this.last = this.token.elt;
					this.token = this.token.next;
					var def = function() {
						throw new hxparse.Unexpected(_g1.peek(0),_g1.stream.curPos());
					};
					{
						var _g11 = this.peek(0);
						switch(_g11.tok[1]) {
						case 1:
							switch(_g11.tok[2][1]) {
							case 3:
								var name = _g11.tok[2][2];
								if(!haxeparser.HaxeParser.isLowerIdent(name)) {
									this.last = this.token.elt;
									this.token = this.token.next;
									sub = name;
								} else sub = def();
								break;
							default:
								sub = def();
							}
							break;
						default:
							sub = def();
						}
					}
					break;
				default:
					sub = null;
				}
			}
			var params;
			{
				var _g3 = this.peek(0);
				switch(_g3.tok[1]) {
				case 5:
					switch(_g3.tok[2][1]) {
					case 9:
						this.last = this.token.elt;
						this.token = this.token.next;
						var l = this.psep(haxeparser.TokenDef.Comma,$bind(this,this.parseTypePathOrConst));
						{
							var _g12 = this.peek(0);
							switch(_g12.tok[1]) {
							case 5:
								switch(_g12.tok[2][1]) {
								case 7:
									this.last = this.token.elt;
									this.token = this.token.next;
									params = l;
									break;
								default:
									throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
								}
								break;
							default:
								throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
							}
						}
						break;
					default:
						params = [];
					}
					break;
				default:
					params = [];
				}
			}
			return { pack : pack, name : ident.name, params : params, sub : sub};
		}
	}
	,typeName: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 1:
				switch(_g.tok[2][1]) {
				case 3:
					var p = _g.pos;
					var name = _g.tok[2][2];
					this.last = this.token.elt;
					this.token = this.token.next;
					if(haxeparser.HaxeParser.isLowerIdent(name)) throw new haxeparser.ParserError(haxeparser.ParserErrorMsg.Custom("Type name should start with an uppercase letter"),p); else return name;
					break;
				default:
					throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
				}
				break;
			default:
				throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
			}
		}
	}
	,parseTypePathOrConst: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 14:
				var p1 = _g.pos;
				this.last = this.token.elt;
				this.token = this.token.next;
				var l = this.parseArrayDecl();
				{
					var _g1 = this.peek(0);
					switch(_g1.tok[1]) {
					case 15:
						var p2 = _g1.pos;
						this.last = this.token.elt;
						this.token = this.token.next;
						return haxe.macro.TypeParam.TPExpr({ expr : haxe.macro.ExprDef.EArrayDecl(l), pos : haxeparser.HaxeParser.punion(p1,p2)});
					default:
						throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
					}
				}
				break;
			default:
				try {
					var t = this.parseComplexType();
					return haxe.macro.TypeParam.TPType(t);
				} catch( _ ) {
					if( js.Boot.__instanceof(_,hxparse.NoMatch) ) {
						{
							var _g11 = this.peek(0);
							switch(_g11.tok[1]) {
							case 1:
								var p = _g11.pos;
								var c = _g11.tok[2];
								this.last = this.token.elt;
								this.token = this.token.next;
								return haxe.macro.TypeParam.TPExpr({ expr : haxe.macro.ExprDef.EConst(c), pos : p});
							default:
								try {
									var e = this.expr();
									return haxe.macro.TypeParam.TPExpr(e);
								} catch( _1 ) {
									if( js.Boot.__instanceof(_1,hxparse.NoMatch) ) {
										throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
									} else throw(_1);
								}
							}
						}
					} else throw(_);
				}
			}
		}
	}
	,parseComplexTypeNext: function(t) {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 12:
				this.last = this.token.elt;
				this.token = this.token.next;
				var t2 = this.parseComplexType();
				switch(t2[1]) {
				case 1:
					var r = t2[3];
					var args = t2[2];
					return haxe.macro.ComplexType.TFunction(haxeparser.HaxeParser.aadd(args,t),r);
				default:
					return haxe.macro.ComplexType.TFunction([t],t2);
				}
				break;
			default:
				return t;
			}
		}
	}
	,parseTypeAnonymous: function(opt) {
		var _g = this;
		try {
			var id = this.ident();
			{
				var _g1 = this.peek(0);
				switch(_g1.tok[1]) {
				case 11:
					this.last = this.token.elt;
					this.token = this.token.next;
					var t = this.parseComplexType();
					var next = function(p2,acc) {
						var t1;
						if(!opt) t1 = t; else switch(t[1]) {
						case 0:
							switch(t[2].pack.length) {
							case 0:
								switch(t[2].name) {
								case "Null":
									t1 = t;
									break;
								default:
									t1 = haxe.macro.ComplexType.TPath({ pack : [], name : "Null", sub : null, params : [haxe.macro.TypeParam.TPType(t)]});
								}
								break;
							default:
								t1 = haxe.macro.ComplexType.TPath({ pack : [], name : "Null", sub : null, params : [haxe.macro.TypeParam.TPType(t)]});
							}
							break;
						default:
							t1 = haxe.macro.ComplexType.TPath({ pack : [], name : "Null", sub : null, params : [haxe.macro.TypeParam.TPType(t)]});
						}
						return haxeparser.HaxeParser.aadd(acc,{ name : id.name, meta : opt?[{ name : ":optional", params : [], pos : id.pos}]:[], access : [], doc : null, kind : haxe.macro.FieldType.FVar(t1,null), pos : haxeparser.HaxeParser.punion(id.pos,p2)});
					};
					{
						var _g11 = this.peek(0);
						switch(_g11.tok[1]) {
						case 17:
							var p21 = _g11.pos;
							this.last = this.token.elt;
							this.token = this.token.next;
							return next(p21,[]);
						case 13:
							var p22 = _g11.pos;
							this.last = this.token.elt;
							this.token = this.token.next;
							{
								var _g2 = this.peek(0);
								switch(_g2.tok[1]) {
								case 17:
									this.last = this.token.elt;
									this.token = this.token.next;
									return next(p22,[]);
								default:
									try {
										var l = this.parseTypeAnonymous(false);
										return next(p22,l);
									} catch( _ ) {
										if( js.Boot.__instanceof(_,hxparse.NoMatch) ) {
											throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
										} else throw(_);
									}
								}
							}
							break;
						default:
							throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
						}
					}
					break;
				default:
					throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
				}
			}
		} catch( _1 ) {
			if( js.Boot.__instanceof(_1,hxparse.NoMatch) ) {
				var def = function() {
					throw new hxparse.NoMatch(_g.stream.curPos(),_g.peek(0));
				};
				{
					var _g3 = this.peek(0);
					switch(_g3.tok[1]) {
					case 20:
						if(!opt) {
							this.last = this.token.elt;
							this.token = this.token.next;
							return this.parseTypeAnonymous(true);
						} else return def();
						break;
					default:
						return def();
					}
				}
			} else throw(_1);
		}
	}
	,parseEnum: function() {
		this.doc = null;
		var meta = this.parseMeta();
		var name = this.anyEnumIdent();
		var doc = this.getDoc();
		var params = this.parseConstraintParams();
		var args;
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 18:
				this.last = this.token.elt;
				this.token = this.token.next;
				var l = this.psep(haxeparser.TokenDef.Comma,$bind(this,this.parseEnumParam));
				{
					var _g1 = this.peek(0);
					switch(_g1.tok[1]) {
					case 19:
						this.last = this.token.elt;
						this.token = this.token.next;
						args = l;
						break;
					default:
						throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
					}
				}
				break;
			default:
				args = [];
			}
		}
		var t;
		{
			var _g2 = this.peek(0);
			switch(_g2.tok[1]) {
			case 11:
				this.last = this.token.elt;
				this.token = this.token.next;
				var t1 = this.parseComplexType();
				t = t1;
				break;
			default:
				t = null;
			}
		}
		var p2;
		try {
			var p = this.semicolon();
			p2 = p;
		} catch( _ ) {
			if( js.Boot.__instanceof(_,hxparse.NoMatch) ) {
				throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
			} else throw(_);
		}
		return { name : name.name, doc : doc, meta : meta, args : args, params : params, type : t, pos : haxeparser.HaxeParser.punion(name.pos,p2)};
	}
	,parseEnumParam: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 20:
				this.last = this.token.elt;
				this.token = this.token.next;
				var name = this.ident();
				{
					var _g1 = this.peek(0);
					switch(_g1.tok[1]) {
					case 11:
						this.last = this.token.elt;
						this.token = this.token.next;
						var t = this.parseComplexType();
						return { name : name.name, opt : true, type : t};
					default:
						throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
					}
				}
				break;
			default:
				var name1 = this.ident();
				{
					var _g11 = this.peek(0);
					switch(_g11.tok[1]) {
					case 11:
						this.last = this.token.elt;
						this.token = this.token.next;
						var t1 = this.parseComplexType();
						return { name : name1.name, opt : false, type : t1};
					default:
						throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
					}
				}
			}
		}
	}
	,parseClassField: function() {
		this.doc = null;
		var meta = this.parseMeta();
		var al = this.parseCfRights(true,[]);
		var doc = this.getDoc();
		var data;
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 0:
				switch(_g.tok[2][1]) {
				case 2:
					var p1 = _g.pos;
					this.last = this.token.elt;
					this.token = this.token.next;
					var name = this.ident();
					{
						var _g1 = this.peek(0);
						switch(_g1.tok[1]) {
						case 18:
							this.last = this.token.elt;
							this.token = this.token.next;
							var i1 = this.propertyIdent();
							{
								var _g2 = this.peek(0);
								switch(_g2.tok[1]) {
								case 13:
									this.last = this.token.elt;
									this.token = this.token.next;
									var i2 = this.propertyIdent();
									{
										var _g3 = this.peek(0);
										switch(_g3.tok[1]) {
										case 19:
											this.last = this.token.elt;
											this.token = this.token.next;
											var t;
											{
												var _g4 = this.peek(0);
												switch(_g4.tok[1]) {
												case 11:
													this.last = this.token.elt;
													this.token = this.token.next;
													var t1 = this.parseComplexType();
													t = t1;
													break;
												default:
													t = null;
												}
											}
											var e;
											{
												var _g41 = this.peek(0);
												switch(_g41.tok[1]) {
												case 5:
													switch(_g41.tok[2][1]) {
													case 4:
														this.last = this.token.elt;
														this.token = this.token.next;
														var e1 = this.toplevelExpr();
														var p2 = this.semicolon();
														e = { expr : e1, pos : p2};
														break;
													default:
														throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
													}
													break;
												case 9:
													var p21 = _g41.pos;
													this.last = this.token.elt;
													this.token = this.token.next;
													e = { expr : null, pos : p21};
													break;
												default:
													throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
												}
											}
											data = { name : name.name, pos : haxeparser.HaxeParser.punion(p1,e.pos), kind : haxe.macro.FieldType.FProp(i1,i2,t,e.expr)};
											break;
										default:
											throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
										}
									}
									break;
								default:
									throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
								}
							}
							break;
						default:
							var t2 = this.parseTypeOpt();
							var e2;
							{
								var _g21 = this.peek(0);
								switch(_g21.tok[1]) {
								case 5:
									switch(_g21.tok[2][1]) {
									case 4:
										this.last = this.token.elt;
										this.token = this.token.next;
										var e3 = this.toplevelExpr();
										var p22 = this.semicolon();
										e2 = { expr : e3, pos : p22};
										break;
									default:
										throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
									}
									break;
								case 9:
									var p23 = _g21.pos;
									this.last = this.token.elt;
									this.token = this.token.next;
									e2 = { expr : null, pos : p23};
									break;
								default:
									throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
								}
							}
							data = { name : name.name, pos : haxeparser.HaxeParser.punion(p1,e2.pos), kind : haxe.macro.FieldType.FVar(t2,e2.expr)};
						}
					}
					break;
				case 0:
					var p11 = _g.pos;
					this.last = this.token.elt;
					this.token = this.token.next;
					var name1 = this.parseFunName();
					var pl = this.parseConstraintParams();
					{
						var _g11 = this.peek(0);
						switch(_g11.tok[1]) {
						case 18:
							this.last = this.token.elt;
							this.token = this.token.next;
							var al1 = this.psep(haxeparser.TokenDef.Comma,$bind(this,this.parseFunParam));
							{
								var _g22 = this.peek(0);
								switch(_g22.tok[1]) {
								case 19:
									this.last = this.token.elt;
									this.token = this.token.next;
									var t3 = this.parseTypeOpt();
									var e4;
									try {
										var e5 = this.toplevelExpr();
										this.semicolon();
										e4 = { expr : e5, pos : e5.pos};
									} catch( _ ) {
										if( js.Boot.__instanceof(_,hxparse.NoMatch) ) {
											{
												var _g31 = this.peek(0);
												switch(_g31.tok[1]) {
												case 9:
													var p = _g31.pos;
													this.last = this.token.elt;
													this.token = this.token.next;
													e4 = { expr : null, pos : p};
													break;
												default:
													throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
												}
											}
										} else throw(_);
									}
									var f = { params : pl, args : al1, ret : t3, expr : e4.expr};
									data = { name : name1, pos : haxeparser.HaxeParser.punion(p11,e4.pos), kind : haxe.macro.FieldType.FFun(f)};
									break;
								default:
									throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
								}
							}
							break;
						default:
							throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
						}
					}
					break;
				default:
					if(al.length == 0) throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0)); else throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
				}
				break;
			default:
				if(al.length == 0) throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0)); else throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
			}
		}
		return { name : data.name, doc : doc, meta : meta, access : al, pos : data.pos, kind : data.kind};
	}
	,parseCfRights: function(allowStatic,l) {
		var _g = this;
		var def = function() {
			var def1 = function() {
				var def2 = function() {
					var def3 = function() {
						var def4 = function() {
							var def5 = function() {
								{
									var _g1 = _g.peek(0);
									switch(_g1.tok[1]) {
									case 0:
										switch(_g1.tok[2][1]) {
										case 35:
											_g.last = _g.token.elt;
											_g.token = _g.token.next;
											var l1 = _g.parseCfRights(allowStatic,haxeparser.HaxeParser.aadd(l,haxe.macro.Access.AInline));
											return l1;
										default:
											return l;
										}
										break;
									default:
										return l;
									}
								}
							};
							{
								var _g11 = _g.peek(0);
								switch(_g11.tok[1]) {
								case 0:
									switch(_g11.tok[2][1]) {
									case 33:
										if(!Lambda.has(l,haxe.macro.Access.ADynamic)) {
											_g.last = _g.token.elt;
											_g.token = _g.token.next;
											var l2 = _g.parseCfRights(allowStatic,haxeparser.HaxeParser.aadd(l,haxe.macro.Access.ADynamic));
											return l2;
										} else return def5();
										break;
									default:
										return def5();
									}
									break;
								default:
									return def5();
								}
							}
						};
						{
							var _g12 = _g.peek(0);
							switch(_g12.tok[1]) {
							case 0:
								switch(_g12.tok[2][1]) {
								case 31:
									if(!Lambda.has(l,haxe.macro.Access.AOverride)) {
										_g.last = _g.token.elt;
										_g.token = _g.token.next;
										var l3 = _g.parseCfRights(false,haxeparser.HaxeParser.aadd(l,haxe.macro.Access.AOverride));
										return l3;
									} else return def4();
									break;
								default:
									return def4();
								}
								break;
							default:
								return def4();
							}
						}
					};
					{
						var _g13 = _g.peek(0);
						switch(_g13.tok[1]) {
						case 0:
							switch(_g13.tok[2][1]) {
							case 19:
								if(!(Lambda.has(l,haxe.macro.Access.APublic) || Lambda.has(l,haxe.macro.Access.APrivate))) {
									_g.last = _g.token.elt;
									_g.token = _g.token.next;
									var l4 = _g.parseCfRights(allowStatic,haxeparser.HaxeParser.aadd(l,haxe.macro.Access.APrivate));
									return l4;
								} else return def3();
								break;
							default:
								return def3();
							}
							break;
						default:
							return def3();
						}
					}
				};
				{
					var _g14 = _g.peek(0);
					switch(_g14.tok[1]) {
					case 0:
						switch(_g14.tok[2][1]) {
						case 18:
							if(!(Lambda.has(l,haxe.macro.Access.APublic) || Lambda.has(l,haxe.macro.Access.APrivate))) {
								_g.last = _g.token.elt;
								_g.token = _g.token.next;
								var l5 = _g.parseCfRights(allowStatic,haxeparser.HaxeParser.aadd(l,haxe.macro.Access.APublic));
								return l5;
							} else return def2();
							break;
						default:
							return def2();
						}
						break;
					default:
						return def2();
					}
				}
			};
			{
				var _g15 = _g.peek(0);
				switch(_g15.tok[1]) {
				case 0:
					switch(_g15.tok[2][1]) {
					case 41:
						if(!Lambda.has(l,haxe.macro.Access.AMacro)) {
							_g.last = _g.token.elt;
							_g.token = _g.token.next;
							var l6 = _g.parseCfRights(allowStatic,haxeparser.HaxeParser.aadd(l,haxe.macro.Access.AMacro));
							return l6;
						} else return def1();
						break;
					default:
						return def1();
					}
					break;
				default:
					return def1();
				}
			}
		};
		{
			var _g2 = this.peek(0);
			switch(_g2.tok[1]) {
			case 0:
				switch(_g2.tok[2][1]) {
				case 17:
					if(allowStatic) {
						this.last = this.token.elt;
						this.token = this.token.next;
						var l7 = this.parseCfRights(false,haxeparser.HaxeParser.aadd(l,haxe.macro.Access.AStatic));
						return l7;
					} else return def();
					break;
				default:
					return def();
				}
				break;
			default:
				return def();
			}
		}
	}
	,parseFunName: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 1:
				switch(_g.tok[2][1]) {
				case 3:
					var name = _g.tok[2][2];
					this.last = this.token.elt;
					this.token = this.token.next;
					return name;
				default:
					throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
				}
				break;
			case 0:
				switch(_g.tok[2][1]) {
				case 22:
					this.last = this.token.elt;
					this.token = this.token.next;
					return "new";
				default:
					throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
				}
				break;
			default:
				throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
			}
		}
	}
	,parseFunParam: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 20:
				this.last = this.token.elt;
				this.token = this.token.next;
				var id = this.ident();
				var t = this.parseTypeOpt();
				var c = this.parseFunParamValue();
				return { name : id.name, opt : true, type : t, value : c};
			default:
				var id1 = this.ident();
				var t1 = this.parseTypeOpt();
				var c1 = this.parseFunParamValue();
				return { name : id1.name, opt : false, type : t1, value : c1};
			}
		}
	}
	,parseFunParamValue: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 5:
				switch(_g.tok[2][1]) {
				case 4:
					this.last = this.token.elt;
					this.token = this.token.next;
					var e = this.toplevelExpr();
					return e;
				default:
					return null;
				}
				break;
			default:
				return null;
			}
		}
	}
	,parseConstraintParams: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 5:
				switch(_g.tok[2][1]) {
				case 9:
					this.last = this.token.elt;
					this.token = this.token.next;
					var l = this.psep(haxeparser.TokenDef.Comma,$bind(this,this.parseConstraintParam));
					{
						var _g1 = this.peek(0);
						switch(_g1.tok[1]) {
						case 5:
							switch(_g1.tok[2][1]) {
							case 7:
								this.last = this.token.elt;
								this.token = this.token.next;
								return l;
							default:
								throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
							}
							break;
						default:
							throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
						}
					}
					break;
				default:
					return [];
				}
				break;
			default:
				return [];
			}
		}
	}
	,parseConstraintParam: function() {
		var name = this.typeName();
		var params = [];
		var ctl;
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 11:
				this.last = this.token.elt;
				this.token = this.token.next;
				{
					var _g1 = this.peek(0);
					switch(_g1.tok[1]) {
					case 18:
						this.last = this.token.elt;
						this.token = this.token.next;
						var l = this.psep(haxeparser.TokenDef.Comma,$bind(this,this.parseComplexType));
						{
							var _g2 = this.peek(0);
							switch(_g2.tok[1]) {
							case 19:
								this.last = this.token.elt;
								this.token = this.token.next;
								ctl = l;
								break;
							default:
								throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
							}
						}
						break;
					default:
						try {
							var t = this.parseComplexType();
							ctl = [t];
						} catch( _ ) {
							if( js.Boot.__instanceof(_,hxparse.NoMatch) ) {
								throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
							} else throw(_);
						}
					}
				}
				break;
			default:
				ctl = [];
			}
		}
		return { name : name, params : params, constraints : ctl};
	}
	,parseClassHerit: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 0:
				switch(_g.tok[2][1]) {
				case 11:
					this.last = this.token.elt;
					this.token = this.token.next;
					var t = this.parseTypePath();
					return haxeparser.ClassFlag.HExtends(t);
				case 12:
					this.last = this.token.elt;
					this.token = this.token.next;
					var t1 = this.parseTypePath();
					return haxeparser.ClassFlag.HImplements(t1);
				default:
					throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
				}
				break;
			default:
				throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
			}
		}
	}
	,block1: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 1:
				switch(_g.tok[2][1]) {
				case 3:
					var p = _g.pos;
					var name = _g.tok[2][2];
					this.last = this.token.elt;
					this.token = this.token.next;
					return this.block2(name,haxe.macro.Constant.CIdent(name),p);
				case 2:
					var p1 = _g.pos;
					var name1 = _g.tok[2][2];
					this.last = this.token.elt;
					this.token = this.token.next;
					return this.block2(haxeparser.HaxeParser.quoteIdent(name1),haxe.macro.Constant.CString(name1),p1);
				default:
					var b = this.block([]);
					return haxe.macro.ExprDef.EBlock(b);
				}
				break;
			default:
				var b = this.block([]);
				return haxe.macro.ExprDef.EBlock(b);
			}
		}
	}
	,block2: function(name,ident,p) {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 11:
				this.last = this.token.elt;
				this.token = this.token.next;
				var e = this.expr();
				var l = this.parseObjDecl();
				l.unshift({ field : name, expr : e});
				return haxe.macro.ExprDef.EObjectDecl(l);
			default:
				var e1 = this.exprNext({ expr : haxe.macro.ExprDef.EConst(ident), pos : p});
				var _ = this.semicolon();
				var b = this.block([e1]);
				return haxe.macro.ExprDef.EBlock(b);
			}
		}
	}
	,block: function(acc) {
		try {
			var e = this.parseBlockElt();
			return this.block(haxeparser.HaxeParser.aadd(acc,e));
		} catch( e1 ) {
			if( js.Boot.__instanceof(e1,hxparse.NoMatch) ) {
				return acc;
			} else throw(e1);
		}
	}
	,parseBlockElt: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 0:
				switch(_g.tok[2][1]) {
				case 2:
					var p1 = _g.pos;
					this.last = this.token.elt;
					this.token = this.token.next;
					var vl = this.psep(haxeparser.TokenDef.Comma,$bind(this,this.parseVarDecl));
					var p2 = this.semicolon();
					return { expr : haxe.macro.ExprDef.EVars(vl), pos : haxeparser.HaxeParser.punion(p1,p2)};
				default:
					var e = this.expr();
					this.semicolon();
					return e;
				}
				break;
			default:
				var e = this.expr();
				this.semicolon();
				return e;
			}
		}
	}
	,parseObjDecl: function() {
		var acc = [];
		try {
			while(true) {
				var _g = this.peek(0);
				switch(_g.tok[1]) {
				case 13:
					this.last = this.token.elt;
					this.token = this.token.next;
					try {
						var id = this.ident();
						{
							var _g1 = this.peek(0);
							switch(_g1.tok[1]) {
							case 11:
								this.last = this.token.elt;
								this.token = this.token.next;
								var e = this.expr();
								acc.push({ field : id.name, expr : e});
								break;
							default:
								throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
							}
						}
					} catch( _ ) {
						if( js.Boot.__instanceof(_,hxparse.NoMatch) ) {
							{
								var _g11 = this.peek(0);
								switch(_g11.tok[1]) {
								case 1:
									switch(_g11.tok[2][1]) {
									case 2:
										var name = _g11.tok[2][2];
										this.last = this.token.elt;
										this.token = this.token.next;
										{
											var _g2 = this.peek(0);
											switch(_g2.tok[1]) {
											case 11:
												this.last = this.token.elt;
												this.token = this.token.next;
												var e1 = this.expr();
												acc.push({ field : haxeparser.HaxeParser.quoteIdent(name), expr : e1});
												break;
											default:
												throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
											}
										}
										break;
									default:
										throw "__break__";
									}
									break;
								default:
									throw "__break__";
								}
							}
						} else throw(_);
					}
					break;
				default:
					throw "__break__";
				}
			}
		} catch( e ) { if( e != "__break__" ) throw e; }
		return acc;
	}
	,parseArrayDecl: function() {
		var acc = [];
		var br = false;
		while(true) {
			try {
				var e = this.expr();
				acc.push(e);
				{
					var _g = this.peek(0);
					switch(_g.tok[1]) {
					case 13:
						this.last = this.token.elt;
						this.token = this.token.next;
						null;
						break;
					default:
						br = true;
					}
				}
			} catch( _ ) {
				if( js.Boot.__instanceof(_,hxparse.NoMatch) ) {
					br = true;
				} else throw(_);
			}
			if(br) break;
		}
		return acc;
	}
	,parseVarDecl: function() {
		var id = this.dollarIdent();
		var t = this.parseTypeOpt();
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 5:
				switch(_g.tok[2][1]) {
				case 4:
					this.last = this.token.elt;
					this.token = this.token.next;
					var e = this.expr();
					return { name : id.name, type : t, expr : e};
				default:
					return { name : id.name, type : t, expr : null};
				}
				break;
			default:
				return { name : id.name, type : t, expr : null};
			}
		}
	}
	,inlineFunction: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 0:
				switch(_g.tok[2][1]) {
				case 35:
					this.last = this.token.elt;
					this.token = this.token.next;
					{
						var _g1 = this.peek(0);
						switch(_g1.tok[1]) {
						case 0:
							switch(_g1.tok[2][1]) {
							case 0:
								var p1 = _g1.pos;
								this.last = this.token.elt;
								this.token = this.token.next;
								return { isInline : true, pos : p1};
							default:
								throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
							}
							break;
						default:
							throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
						}
					}
					break;
				case 0:
					var p11 = _g.pos;
					this.last = this.token.elt;
					this.token = this.token.next;
					return { isInline : false, pos : p11};
				default:
					throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
				}
				break;
			default:
				throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
			}
		}
	}
	,reify: function(inMacro) {
		return { toExpr : function(e) {
			return null;
		}, toType : function(t,p) {
			return null;
		}, toTypeDef : function(t1) {
			return null;
		}};
	}
	,reifyExpr: function(e) {
		var toExpr = this.reify(this.inMacro).toExpr;
		var e1 = toExpr(e);
		return { expr : haxe.macro.ExprDef.ECheckType(e1,haxe.macro.ComplexType.TPath({ pack : ["haxe","macro"], name : "Expr", sub : null, params : []})), pos : e1.pos};
	}
	,parseMacroExpr: function(p) {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 11:
				this.last = this.token.elt;
				this.token = this.token.next;
				var t = this.parseComplexType();
				var toType = this.reify(this.inMacro).toType;
				var t1 = toType(t,p);
				return { expr : haxe.macro.ExprDef.ECheckType(t1,haxe.macro.ComplexType.TPath({ pack : ["haxe","macro"], name : "Expr", sub : "ComplexType", params : []})), pos : p};
			case 0:
				switch(_g.tok[2][1]) {
				case 2:
					var p1 = _g.pos;
					this.last = this.token.elt;
					this.token = this.token.next;
					var vl = this.psep(haxeparser.TokenDef.Comma,$bind(this,this.parseVarDecl));
					return this.reifyExpr({ expr : haxe.macro.ExprDef.EVars(vl), pos : p1});
				default:
					var e = this.secureExpr();
					return this.reifyExpr(e);
				}
				break;
			case 14:
				this.last = this.token.elt;
				this.token = this.token.next;
				var d = this.parseClass([],[],false);
				var toType1 = this.reify(this.inMacro).toTypeDef;
				return { expr : haxe.macro.ExprDef.ECheckType(toType1(d),haxe.macro.ComplexType.TPath({ pack : ["haxe","macro"], name : "Expr", sub : "TypeDefinition", params : []})), pos : p};
			default:
				var e = this.secureExpr();
				return this.reifyExpr(e);
			}
		}
	}
	,expr: function() {
		try {
			var meta = this.parseMetaEntry();
			return haxeparser.HaxeParser.makeMeta(meta.name,meta.params,this.secureExpr(),meta.pos);
		} catch( _ ) {
			if( js.Boot.__instanceof(_,hxparse.NoMatch) ) {
				{
					var _g = this.peek(0);
					switch(_g.tok[1]) {
					case 16:
						var p1 = _g.pos;
						this.last = this.token.elt;
						this.token = this.token.next;
						var b = this.block1();
						{
							var _g1 = this.peek(0);
							switch(_g1.tok[1]) {
							case 17:
								var p2 = _g1.pos;
								this.last = this.token.elt;
								this.token = this.token.next;
								var e = { expr : b, pos : haxeparser.HaxeParser.punion(p1,p2)};
								switch(b[1]) {
								case 5:
									return this.exprNext(e);
								default:
									return e;
								}
								break;
							default:
								throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
							}
						}
						break;
					case 0:
						switch(_g.tok[2][1]) {
						case 41:
							var p = _g.pos;
							this.last = this.token.elt;
							this.token = this.token.next;
							return this.parseMacroExpr(p);
						case 2:
							var p11 = _g.pos;
							this.last = this.token.elt;
							this.token = this.token.next;
							var v = this.parseVarDecl();
							return { expr : haxe.macro.ExprDef.EVars([v]), pos : p11};
						case 23:
							var p3 = _g.pos;
							this.last = this.token.elt;
							this.token = this.token.next;
							return this.exprNext({ expr : haxe.macro.ExprDef.EConst(haxe.macro.Constant.CIdent("this")), pos : p3});
						case 38:
							var p4 = _g.pos;
							this.last = this.token.elt;
							this.token = this.token.next;
							return this.exprNext({ expr : haxe.macro.ExprDef.EConst(haxe.macro.Constant.CIdent("true")), pos : p4});
						case 39:
							var p5 = _g.pos;
							this.last = this.token.elt;
							this.token = this.token.next;
							return this.exprNext({ expr : haxe.macro.ExprDef.EConst(haxe.macro.Constant.CIdent("false")), pos : p5});
						case 37:
							var p6 = _g.pos;
							this.last = this.token.elt;
							this.token = this.token.next;
							return this.exprNext({ expr : haxe.macro.ExprDef.EConst(haxe.macro.Constant.CIdent("null")), pos : p6});
						case 30:
							var p12 = _g.pos;
							this.last = this.token.elt;
							this.token = this.token.next;
							{
								var _g11 = this.peek(0);
								switch(_g11.tok[1]) {
								case 18:
									this.last = this.token.elt;
									this.token = this.token.next;
									var e1 = this.expr();
									{
										var _g2 = this.peek(0);
										switch(_g2.tok[1]) {
										case 13:
											this.last = this.token.elt;
											this.token = this.token.next;
											var t = this.parseComplexType();
											{
												var _g3 = this.peek(0);
												switch(_g3.tok[1]) {
												case 19:
													var p21 = _g3.pos;
													this.last = this.token.elt;
													this.token = this.token.next;
													return this.exprNext({ expr : haxe.macro.ExprDef.ECast(e1,t), pos : haxeparser.HaxeParser.punion(p12,p21)});
												default:
													throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
												}
											}
											break;
										case 19:
											var p22 = _g2.pos;
											this.last = this.token.elt;
											this.token = this.token.next;
											return this.exprNext({ expr : haxe.macro.ExprDef.ECast(e1,null), pos : haxeparser.HaxeParser.punion(p12,p22)});
										default:
											throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
										}
									}
									break;
								default:
									var e2 = this.secureExpr();
									return this.exprNext({ expr : haxe.macro.ExprDef.ECast(e2,null), pos : haxeparser.HaxeParser.punion(p12,e2.pos)});
								}
							}
							break;
						case 24:
							var p7 = _g.pos;
							this.last = this.token.elt;
							this.token = this.token.next;
							var e3 = this.expr();
							return { expr : haxe.macro.ExprDef.EThrow(e3), pos : p7};
						case 22:
							var p13 = _g.pos;
							this.last = this.token.elt;
							this.token = this.token.next;
							var t1 = this.parseTypePath();
							{
								var _g12 = this.peek(0);
								switch(_g12.tok[1]) {
								case 18:
									this.last = this.token.elt;
									this.token = this.token.next;
									try {
										var al = this.psep(haxeparser.TokenDef.Comma,$bind(this,this.expr));
										{
											var _g21 = this.peek(0);
											switch(_g21.tok[1]) {
											case 19:
												var p23 = _g21.pos;
												this.last = this.token.elt;
												this.token = this.token.next;
												return this.exprNext({ expr : haxe.macro.ExprDef.ENew(t1,al), pos : haxeparser.HaxeParser.punion(p13,p23)});
											default:
												throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
											}
										}
									} catch( _1 ) {
										if( js.Boot.__instanceof(_1,hxparse.NoMatch) ) {
											throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
										} else throw(_1);
									}
									break;
								default:
									throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
								}
							}
							break;
						default:
							try {
								var inl = this.inlineFunction();
								var name = this.parseOptional($bind(this,this.dollarIdent));
								var pl = this.parseConstraintParams();
								{
									var _g13 = this.peek(0);
									switch(_g13.tok[1]) {
									case 18:
										this.last = this.token.elt;
										this.token = this.token.next;
										var al1 = this.psep(haxeparser.TokenDef.Comma,$bind(this,this.parseFunParam));
										{
											var _g22 = this.peek(0);
											switch(_g22.tok[1]) {
											case 19:
												this.last = this.token.elt;
												this.token = this.token.next;
												var t2 = this.parseTypeOpt();
												var make = function(e4) {
													var f = { params : pl, ret : t2, args : al1, expr : e4};
													return { expr : haxe.macro.ExprDef.EFunction(name == null?null:inl.isInline?"inline_" + name.name:name.name,f), pos : haxeparser.HaxeParser.punion(inl.pos,e4.pos)};
												};
												return this.exprNext(make(this.secureExpr()));
											default:
												throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
											}
										}
										break;
									default:
										throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
									}
								}
							} catch( _2 ) {
								if( js.Boot.__instanceof(_2,hxparse.NoMatch) ) {
									{
										var _g14 = this.peek(0);
										switch(_g14.tok[1]) {
										case 4:
											var p14 = _g14.pos;
											var op = _g14.tok[2];
											this.last = this.token.elt;
											this.token = this.token.next;
											var e5 = this.expr();
											return haxeparser.HaxeParser.makeUnop(op,e5,p14);
										case 5:
											switch(_g14.tok[2][1]) {
											case 3:
												var p15 = _g14.pos;
												this.last = this.token.elt;
												this.token = this.token.next;
												var e6 = this.expr();
												var neg = function(s) {
													if(HxOverrides.cca(s,0) == 45) return HxOverrides.substr(s,1,null); else return "-" + s;
												};
												{
													var _g23 = haxeparser.HaxeParser.makeUnop(haxe.macro.Unop.OpNeg,e6,p15);
													var e7 = _g23;
													switch(_g23.expr[1]) {
													case 9:
														switch(_g23.expr[2][1]) {
														case 3:
															switch(_g23.expr[3]) {
															case false:
																switch(_g23.expr[4].expr[1]) {
																case 0:
																	switch(_g23.expr[4].expr[2][1]) {
																	case 0:
																		var p8 = _g23.pos;
																		var i = _g23.expr[4].expr[2][2];
																		return { expr : haxe.macro.ExprDef.EConst(haxe.macro.Constant.CInt(neg(i))), pos : p8};
																	case 1:
																		var p9 = _g23.pos;
																		var j = _g23.expr[4].expr[2][2];
																		return { expr : haxe.macro.ExprDef.EConst(haxe.macro.Constant.CFloat(neg(j))), pos : p9};
																	default:
																		return e7;
																	}
																	break;
																default:
																	return e7;
																}
																break;
															default:
																return e7;
															}
															break;
														default:
															return e7;
														}
														break;
													default:
														return e7;
													}
												}
												break;
											default:
												throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
											}
											break;
										case 0:
											switch(_g14.tok[2][1]) {
											case 7:
												var p10 = _g14.pos;
												this.last = this.token.elt;
												this.token = this.token.next;
												{
													var _g24 = this.peek(0);
													switch(_g24.tok[1]) {
													case 18:
														this.last = this.token.elt;
														this.token = this.token.next;
														var it = this.expr();
														{
															var _g31 = this.peek(0);
															switch(_g31.tok[1]) {
															case 19:
																this.last = this.token.elt;
																this.token = this.token.next;
																var e8 = this.secureExpr();
																return { expr : haxe.macro.ExprDef.EFor(it,e8), pos : haxeparser.HaxeParser.punion(p10,e8.pos)};
															default:
																throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
															}
														}
														break;
													default:
														throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
													}
												}
												break;
											case 3:
												var p16 = _g14.pos;
												this.last = this.token.elt;
												this.token = this.token.next;
												{
													var _g25 = this.peek(0);
													switch(_g25.tok[1]) {
													case 18:
														this.last = this.token.elt;
														this.token = this.token.next;
														var cond = this.expr();
														{
															var _g32 = this.peek(0);
															switch(_g32.tok[1]) {
															case 19:
																this.last = this.token.elt;
																this.token = this.token.next;
																var e11 = this.expr();
																var e21;
																{
																	var _g4 = this.peek(0);
																	switch(_g4.tok[1]) {
																	case 0:
																		switch(_g4.tok[2][1]) {
																		case 4:
																			this.last = this.token.elt;
																			this.token = this.token.next;
																			var e22 = this.expr();
																			e21 = e22;
																			break;
																		default:
																			{
																				var _g5 = this.peek(0);
																				var _g6 = this.peek(1);
																				switch(_g5.tok[1]) {
																				case 9:
																					switch(_g6.tok[1]) {
																					case 0:
																						switch(_g6.tok[2][1]) {
																						case 4:
																							this.last = this.token.elt;
																							this.token = this.token.next;
																							this.last = this.token.elt;
																							this.token = this.token.next;
																							e21 = this.secureExpr();
																							break;
																						default:
																							e21 = null;
																						}
																						break;
																					default:
																						e21 = null;
																					}
																					break;
																				default:
																					e21 = null;
																				}
																			}
																		}
																		break;
																	default:
																		{
																			var _g5 = this.peek(0);
																			var _g6 = this.peek(1);
																			switch(_g5.tok[1]) {
																			case 9:
																				switch(_g6.tok[1]) {
																				case 0:
																					switch(_g6.tok[2][1]) {
																					case 4:
																						this.last = this.token.elt;
																						this.token = this.token.next;
																						this.last = this.token.elt;
																						this.token = this.token.next;
																						e21 = this.secureExpr();
																						break;
																					default:
																						e21 = null;
																					}
																					break;
																				default:
																					e21 = null;
																				}
																				break;
																			default:
																				e21 = null;
																			}
																		}
																	}
																}
																return { expr : haxe.macro.ExprDef.EIf(cond,e11,e21), pos : haxeparser.HaxeParser.punion(p16,e21 == null?e11.pos:e21.pos)};
															default:
																throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
															}
														}
														break;
													default:
														throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
													}
												}
												break;
											case 10:
												var p17 = _g14.pos;
												this.last = this.token.elt;
												this.token = this.token.next;
												var e9 = this.parseOptional($bind(this,this.expr));
												return { expr : haxe.macro.ExprDef.EReturn(e9), pos : e9 == null?p17:haxeparser.HaxeParser.punion(p17,e9.pos)};
											case 8:
												var p18 = _g14.pos;
												this.last = this.token.elt;
												this.token = this.token.next;
												return { expr : haxe.macro.ExprDef.EBreak, pos : p18};
											case 9:
												var p19 = _g14.pos;
												this.last = this.token.elt;
												this.token = this.token.next;
												return { expr : haxe.macro.ExprDef.EContinue, pos : p19};
											case 5:
												var p110 = _g14.pos;
												this.last = this.token.elt;
												this.token = this.token.next;
												{
													var _g26 = this.peek(0);
													switch(_g26.tok[1]) {
													case 18:
														this.last = this.token.elt;
														this.token = this.token.next;
														var cond1 = this.expr();
														{
															var _g33 = this.peek(0);
															switch(_g33.tok[1]) {
															case 19:
																this.last = this.token.elt;
																this.token = this.token.next;
																var e10 = this.secureExpr();
																return { expr : haxe.macro.ExprDef.EWhile(cond1,e10,true), pos : haxeparser.HaxeParser.punion(p110,e10.pos)};
															default:
																throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
															}
														}
														break;
													default:
														throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
													}
												}
												break;
											case 6:
												var p111 = _g14.pos;
												this.last = this.token.elt;
												this.token = this.token.next;
												var e12 = this.expr();
												{
													var _g27 = this.peek(0);
													switch(_g27.tok[1]) {
													case 0:
														switch(_g27.tok[2][1]) {
														case 5:
															this.last = this.token.elt;
															this.token = this.token.next;
															{
																var _g34 = this.peek(0);
																switch(_g34.tok[1]) {
																case 18:
																	this.last = this.token.elt;
																	this.token = this.token.next;
																	var cond2 = this.expr();
																	{
																		var _g41 = this.peek(0);
																		switch(_g41.tok[1]) {
																		case 19:
																			this.last = this.token.elt;
																			this.token = this.token.next;
																			return { expr : haxe.macro.ExprDef.EWhile(cond2,e12,false), pos : haxeparser.HaxeParser.punion(p111,e12.pos)};
																		default:
																			throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
																		}
																	}
																	break;
																default:
																	throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
																}
															}
															break;
														default:
															throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
														}
														break;
													default:
														throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
													}
												}
												break;
											case 14:
												var p112 = _g14.pos;
												this.last = this.token.elt;
												this.token = this.token.next;
												var e13 = this.expr();
												{
													var _g28 = this.peek(0);
													switch(_g28.tok[1]) {
													case 16:
														this.last = this.token.elt;
														this.token = this.token.next;
														var cases = this.parseSwitchCases();
														{
															var _g35 = this.peek(0);
															switch(_g35.tok[1]) {
															case 17:
																var p24 = _g35.pos;
																this.last = this.token.elt;
																this.token = this.token.next;
																return { expr : haxe.macro.ExprDef.ESwitch(e13,cases.cases,cases.def), pos : haxeparser.HaxeParser.punion(p112,p24)};
															default:
																throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
															}
														}
														break;
													default:
														throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
													}
												}
												break;
											case 20:
												var p113 = _g14.pos;
												this.last = this.token.elt;
												this.token = this.token.next;
												var e14 = this.expr();
												var cl = this.parseRepeat($bind(this,this.parseCatch));
												return { expr : haxe.macro.ExprDef.ETry(e14,cl), pos : p113};
											case 29:
												var p114 = _g14.pos;
												this.last = this.token.elt;
												this.token = this.token.next;
												var e15 = this.expr();
												return { expr : haxe.macro.ExprDef.EUntyped(e15), pos : haxeparser.HaxeParser.punion(p114,e15.pos)};
											default:
												throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
											}
											break;
										case 8:
											var p115 = _g14.pos;
											var i1 = _g14.tok[2];
											this.last = this.token.elt;
											this.token = this.token.next;
											var e23 = this.expr();
											return haxeparser.HaxeParser.makeBinop(haxe.macro.Binop.OpInterval,{ expr : haxe.macro.ExprDef.EConst(haxe.macro.Constant.CInt(i1)), pos : p115},e23);
										case 3:
											var p20 = _g14.pos;
											var v1 = _g14.tok[2];
											this.last = this.token.elt;
											this.token = this.token.next;
											return this.exprNext({ expr : haxe.macro.ExprDef.EConst(haxe.macro.Constant.CIdent("$" + v1)), pos : p20});
										default:
											throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
										}
									}
								} else throw(_2);
							}
						}
						break;
					case 1:
						var p25 = _g.pos;
						var c = _g.tok[2];
						this.last = this.token.elt;
						this.token = this.token.next;
						return this.exprNext({ expr : haxe.macro.ExprDef.EConst(c), pos : p25});
					case 18:
						var p116 = _g.pos;
						this.last = this.token.elt;
						this.token = this.token.next;
						var e16 = this.expr();
						{
							var _g15 = this.peek(0);
							switch(_g15.tok[1]) {
							case 19:
								var p26 = _g15.pos;
								this.last = this.token.elt;
								this.token = this.token.next;
								return this.exprNext({ expr : haxe.macro.ExprDef.EParenthesis(e16), pos : haxeparser.HaxeParser.punion(p116,p26)});
							default:
								throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
							}
						}
						break;
					case 14:
						var p117 = _g.pos;
						this.last = this.token.elt;
						this.token = this.token.next;
						var l = this.parseArrayDecl();
						{
							var _g16 = this.peek(0);
							switch(_g16.tok[1]) {
							case 15:
								var p27 = _g16.pos;
								this.last = this.token.elt;
								this.token = this.token.next;
								return this.exprNext({ expr : haxe.macro.ExprDef.EArrayDecl(l), pos : haxeparser.HaxeParser.punion(p117,p27)});
							default:
								throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
							}
						}
						break;
					default:
						try {
							var inl = this.inlineFunction();
							var name = this.parseOptional($bind(this,this.dollarIdent));
							var pl = this.parseConstraintParams();
							{
								var _g13 = this.peek(0);
								switch(_g13.tok[1]) {
								case 18:
									this.last = this.token.elt;
									this.token = this.token.next;
									var al1 = this.psep(haxeparser.TokenDef.Comma,$bind(this,this.parseFunParam));
									{
										var _g22 = this.peek(0);
										switch(_g22.tok[1]) {
										case 19:
											this.last = this.token.elt;
											this.token = this.token.next;
											var t2 = this.parseTypeOpt();
											var make = function(e4) {
												var f = { params : pl, ret : t2, args : al1, expr : e4};
												return { expr : haxe.macro.ExprDef.EFunction(name == null?null:inl.isInline?"inline_" + name.name:name.name,f), pos : haxeparser.HaxeParser.punion(inl.pos,e4.pos)};
											};
											return this.exprNext(make(this.secureExpr()));
										default:
											throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
										}
									}
									break;
								default:
									throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
								}
							}
						} catch( _2 ) {
							if( js.Boot.__instanceof(_2,hxparse.NoMatch) ) {
								{
									var _g14 = this.peek(0);
									switch(_g14.tok[1]) {
									case 4:
										var p14 = _g14.pos;
										var op = _g14.tok[2];
										this.last = this.token.elt;
										this.token = this.token.next;
										var e5 = this.expr();
										return haxeparser.HaxeParser.makeUnop(op,e5,p14);
									case 5:
										switch(_g14.tok[2][1]) {
										case 3:
											var p15 = _g14.pos;
											this.last = this.token.elt;
											this.token = this.token.next;
											var e6 = this.expr();
											var neg = function(s) {
												if(HxOverrides.cca(s,0) == 45) return HxOverrides.substr(s,1,null); else return "-" + s;
											};
											{
												var _g23 = haxeparser.HaxeParser.makeUnop(haxe.macro.Unop.OpNeg,e6,p15);
												var e7 = _g23;
												switch(_g23.expr[1]) {
												case 9:
													switch(_g23.expr[2][1]) {
													case 3:
														switch(_g23.expr[3]) {
														case false:
															switch(_g23.expr[4].expr[1]) {
															case 0:
																switch(_g23.expr[4].expr[2][1]) {
																case 0:
																	var p8 = _g23.pos;
																	var i = _g23.expr[4].expr[2][2];
																	return { expr : haxe.macro.ExprDef.EConst(haxe.macro.Constant.CInt(neg(i))), pos : p8};
																case 1:
																	var p9 = _g23.pos;
																	var j = _g23.expr[4].expr[2][2];
																	return { expr : haxe.macro.ExprDef.EConst(haxe.macro.Constant.CFloat(neg(j))), pos : p9};
																default:
																	return e7;
																}
																break;
															default:
																return e7;
															}
															break;
														default:
															return e7;
														}
														break;
													default:
														return e7;
													}
													break;
												default:
													return e7;
												}
											}
											break;
										default:
											throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
										}
										break;
									case 0:
										switch(_g14.tok[2][1]) {
										case 7:
											var p10 = _g14.pos;
											this.last = this.token.elt;
											this.token = this.token.next;
											{
												var _g24 = this.peek(0);
												switch(_g24.tok[1]) {
												case 18:
													this.last = this.token.elt;
													this.token = this.token.next;
													var it = this.expr();
													{
														var _g31 = this.peek(0);
														switch(_g31.tok[1]) {
														case 19:
															this.last = this.token.elt;
															this.token = this.token.next;
															var e8 = this.secureExpr();
															return { expr : haxe.macro.ExprDef.EFor(it,e8), pos : haxeparser.HaxeParser.punion(p10,e8.pos)};
														default:
															throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
														}
													}
													break;
												default:
													throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
												}
											}
											break;
										case 3:
											var p16 = _g14.pos;
											this.last = this.token.elt;
											this.token = this.token.next;
											{
												var _g25 = this.peek(0);
												switch(_g25.tok[1]) {
												case 18:
													this.last = this.token.elt;
													this.token = this.token.next;
													var cond = this.expr();
													{
														var _g32 = this.peek(0);
														switch(_g32.tok[1]) {
														case 19:
															this.last = this.token.elt;
															this.token = this.token.next;
															var e11 = this.expr();
															var e21;
															{
																var _g4 = this.peek(0);
																switch(_g4.tok[1]) {
																case 0:
																	switch(_g4.tok[2][1]) {
																	case 4:
																		this.last = this.token.elt;
																		this.token = this.token.next;
																		var e22 = this.expr();
																		e21 = e22;
																		break;
																	default:
																		{
																			var _g5 = this.peek(0);
																			var _g6 = this.peek(1);
																			switch(_g5.tok[1]) {
																			case 9:
																				switch(_g6.tok[1]) {
																				case 0:
																					switch(_g6.tok[2][1]) {
																					case 4:
																						this.last = this.token.elt;
																						this.token = this.token.next;
																						this.last = this.token.elt;
																						this.token = this.token.next;
																						e21 = this.secureExpr();
																						break;
																					default:
																						e21 = null;
																					}
																					break;
																				default:
																					e21 = null;
																				}
																				break;
																			default:
																				e21 = null;
																			}
																		}
																	}
																	break;
																default:
																	{
																		var _g5 = this.peek(0);
																		var _g6 = this.peek(1);
																		switch(_g5.tok[1]) {
																		case 9:
																			switch(_g6.tok[1]) {
																			case 0:
																				switch(_g6.tok[2][1]) {
																				case 4:
																					this.last = this.token.elt;
																					this.token = this.token.next;
																					this.last = this.token.elt;
																					this.token = this.token.next;
																					e21 = this.secureExpr();
																					break;
																				default:
																					e21 = null;
																				}
																				break;
																			default:
																				e21 = null;
																			}
																			break;
																		default:
																			e21 = null;
																		}
																	}
																}
															}
															return { expr : haxe.macro.ExprDef.EIf(cond,e11,e21), pos : haxeparser.HaxeParser.punion(p16,e21 == null?e11.pos:e21.pos)};
														default:
															throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
														}
													}
													break;
												default:
													throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
												}
											}
											break;
										case 10:
											var p17 = _g14.pos;
											this.last = this.token.elt;
											this.token = this.token.next;
											var e9 = this.parseOptional($bind(this,this.expr));
											return { expr : haxe.macro.ExprDef.EReturn(e9), pos : e9 == null?p17:haxeparser.HaxeParser.punion(p17,e9.pos)};
										case 8:
											var p18 = _g14.pos;
											this.last = this.token.elt;
											this.token = this.token.next;
											return { expr : haxe.macro.ExprDef.EBreak, pos : p18};
										case 9:
											var p19 = _g14.pos;
											this.last = this.token.elt;
											this.token = this.token.next;
											return { expr : haxe.macro.ExprDef.EContinue, pos : p19};
										case 5:
											var p110 = _g14.pos;
											this.last = this.token.elt;
											this.token = this.token.next;
											{
												var _g26 = this.peek(0);
												switch(_g26.tok[1]) {
												case 18:
													this.last = this.token.elt;
													this.token = this.token.next;
													var cond1 = this.expr();
													{
														var _g33 = this.peek(0);
														switch(_g33.tok[1]) {
														case 19:
															this.last = this.token.elt;
															this.token = this.token.next;
															var e10 = this.secureExpr();
															return { expr : haxe.macro.ExprDef.EWhile(cond1,e10,true), pos : haxeparser.HaxeParser.punion(p110,e10.pos)};
														default:
															throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
														}
													}
													break;
												default:
													throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
												}
											}
											break;
										case 6:
											var p111 = _g14.pos;
											this.last = this.token.elt;
											this.token = this.token.next;
											var e12 = this.expr();
											{
												var _g27 = this.peek(0);
												switch(_g27.tok[1]) {
												case 0:
													switch(_g27.tok[2][1]) {
													case 5:
														this.last = this.token.elt;
														this.token = this.token.next;
														{
															var _g34 = this.peek(0);
															switch(_g34.tok[1]) {
															case 18:
																this.last = this.token.elt;
																this.token = this.token.next;
																var cond2 = this.expr();
																{
																	var _g41 = this.peek(0);
																	switch(_g41.tok[1]) {
																	case 19:
																		this.last = this.token.elt;
																		this.token = this.token.next;
																		return { expr : haxe.macro.ExprDef.EWhile(cond2,e12,false), pos : haxeparser.HaxeParser.punion(p111,e12.pos)};
																	default:
																		throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
																	}
																}
																break;
															default:
																throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
															}
														}
														break;
													default:
														throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
													}
													break;
												default:
													throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
												}
											}
											break;
										case 14:
											var p112 = _g14.pos;
											this.last = this.token.elt;
											this.token = this.token.next;
											var e13 = this.expr();
											{
												var _g28 = this.peek(0);
												switch(_g28.tok[1]) {
												case 16:
													this.last = this.token.elt;
													this.token = this.token.next;
													var cases = this.parseSwitchCases();
													{
														var _g35 = this.peek(0);
														switch(_g35.tok[1]) {
														case 17:
															var p24 = _g35.pos;
															this.last = this.token.elt;
															this.token = this.token.next;
															return { expr : haxe.macro.ExprDef.ESwitch(e13,cases.cases,cases.def), pos : haxeparser.HaxeParser.punion(p112,p24)};
														default:
															throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
														}
													}
													break;
												default:
													throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
												}
											}
											break;
										case 20:
											var p113 = _g14.pos;
											this.last = this.token.elt;
											this.token = this.token.next;
											var e14 = this.expr();
											var cl = this.parseRepeat($bind(this,this.parseCatch));
											return { expr : haxe.macro.ExprDef.ETry(e14,cl), pos : p113};
										case 29:
											var p114 = _g14.pos;
											this.last = this.token.elt;
											this.token = this.token.next;
											var e15 = this.expr();
											return { expr : haxe.macro.ExprDef.EUntyped(e15), pos : haxeparser.HaxeParser.punion(p114,e15.pos)};
										default:
											throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
										}
										break;
									case 8:
										var p115 = _g14.pos;
										var i1 = _g14.tok[2];
										this.last = this.token.elt;
										this.token = this.token.next;
										var e23 = this.expr();
										return haxeparser.HaxeParser.makeBinop(haxe.macro.Binop.OpInterval,{ expr : haxe.macro.ExprDef.EConst(haxe.macro.Constant.CInt(i1)), pos : p115},e23);
									case 3:
										var p20 = _g14.pos;
										var v1 = _g14.tok[2];
										this.last = this.token.elt;
										this.token = this.token.next;
										return this.exprNext({ expr : haxe.macro.ExprDef.EConst(haxe.macro.Constant.CIdent("$" + v1)), pos : p20});
									default:
										throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
									}
								}
							} else throw(_2);
						}
					}
				}
			} else throw(_);
		}
	}
	,toplevelExpr: function() {
		return this.expr();
	}
	,exprNext: function(e1) {
		var _g2 = this;
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 10:
				var p = _g.pos;
				this.last = this.token.elt;
				this.token = this.token.next;
				{
					var _g1 = this.peek(0);
					switch(_g1.tok[1]) {
					case 3:
						var p2 = _g1.pos;
						var v = _g1.tok[2];
						this.last = this.token.elt;
						this.token = this.token.next;
						return this.exprNext({ expr : haxe.macro.ExprDef.EField(e1,"$" + v), pos : haxeparser.HaxeParser.punion(e1.pos,p2)});
					default:
						var def = function() {
							var def1 = function() {
								switch(e1.expr[1]) {
								case 0:
									switch(e1.expr[2][1]) {
									case 0:
										var p21 = e1.pos;
										var v1 = e1.expr[2][2];
										if(p21.max == p.min) return _g2.exprNext({ expr : haxe.macro.ExprDef.EConst(haxe.macro.Constant.CFloat(v1 + ".")), pos : haxeparser.HaxeParser.punion(p,p21)}); else throw new hxparse.Unexpected(_g2.peek(0),_g2.stream.curPos());
										break;
									default:
										throw new hxparse.Unexpected(_g2.peek(0),_g2.stream.curPos());
									}
									break;
								default:
									throw new hxparse.Unexpected(_g2.peek(0),_g2.stream.curPos());
								}
							};
							{
								var _g3 = _g2.peek(0);
								switch(_g3.tok[1]) {
								case 0:
									switch(_g3.tok[2][1]) {
									case 41:
										var p22 = _g3.pos;
										if(p.max == p22.min) {
											_g2.last = _g2.token.elt;
											_g2.token = _g2.token.next;
											return _g2.exprNext({ expr : haxe.macro.ExprDef.EField(e1,"macro"), pos : haxeparser.HaxeParser.punion(e1.pos,p22)});
										} else return def1();
										break;
									default:
										return def1();
									}
									break;
								default:
									return def1();
								}
							}
						};
						{
							var _g21 = this.peek(0);
							switch(_g21.tok[1]) {
							case 1:
								switch(_g21.tok[2][1]) {
								case 3:
									var p23 = _g21.pos;
									var f = _g21.tok[2][2];
									if(p.max == p23.min) {
										this.last = this.token.elt;
										this.token = this.token.next;
										return this.exprNext({ expr : haxe.macro.ExprDef.EField(e1,f), pos : haxeparser.HaxeParser.punion(e1.pos,p23)});
									} else return def();
									break;
								default:
									return def();
								}
								break;
							default:
								return def();
							}
						}
					}
				}
				break;
			case 18:
				this.last = this.token.elt;
				this.token = this.token.next;
				try {
					var params = this.parseCallParams();
					{
						var _g11 = this.peek(0);
						switch(_g11.tok[1]) {
						case 19:
							var p24 = _g11.pos;
							this.last = this.token.elt;
							this.token = this.token.next;
							return this.exprNext({ expr : haxe.macro.ExprDef.ECall(e1,params), pos : haxeparser.HaxeParser.punion(e1.pos,p24)});
						default:
							throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
						}
					}
				} catch( _ ) {
					if( js.Boot.__instanceof(_,hxparse.NoMatch) ) {
						throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
					} else throw(_);
				}
				break;
			case 14:
				this.last = this.token.elt;
				this.token = this.token.next;
				var e2 = this.expr();
				{
					var _g12 = this.peek(0);
					switch(_g12.tok[1]) {
					case 15:
						var p25 = _g12.pos;
						this.last = this.token.elt;
						this.token = this.token.next;
						return this.exprNext({ expr : haxe.macro.ExprDef.EArray(e1,e2), pos : haxeparser.HaxeParser.punion(e1.pos,p25)});
					default:
						throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
					}
				}
				break;
			case 5:
				var op = _g.tok[2];
				switch(_g.tok[2][1]) {
				case 7:
					this.last = this.token.elt;
					this.token = this.token.next;
					{
						var _g13 = this.peek(0);
						switch(_g13.tok[1]) {
						case 5:
							switch(_g13.tok[2][1]) {
							case 7:
								this.last = this.token.elt;
								this.token = this.token.next;
								{
									var _g22 = this.peek(0);
									switch(_g22.tok[1]) {
									case 5:
										switch(_g22.tok[2][1]) {
										case 7:
											this.last = this.token.elt;
											this.token = this.token.next;
											{
												var _g31 = this.peek(0);
												switch(_g31.tok[1]) {
												case 5:
													switch(_g31.tok[2][1]) {
													case 4:
														this.last = this.token.elt;
														this.token = this.token.next;
														var e21 = this.expr();
														return haxeparser.HaxeParser.makeBinop(haxe.macro.Binop.OpAssignOp(haxe.macro.Binop.OpUShr),e1,e21);
													default:
														var e22 = this.secureExpr();
														return haxeparser.HaxeParser.makeBinop(haxe.macro.Binop.OpUShr,e1,e22);
													}
													break;
												default:
													var e22 = this.secureExpr();
													return haxeparser.HaxeParser.makeBinop(haxe.macro.Binop.OpUShr,e1,e22);
												}
											}
											break;
										case 4:
											this.last = this.token.elt;
											this.token = this.token.next;
											var e23 = this.expr();
											return haxeparser.HaxeParser.makeBinop(haxe.macro.Binop.OpAssignOp(haxe.macro.Binop.OpShr),e1,e23);
										default:
											var e24 = this.secureExpr();
											return haxeparser.HaxeParser.makeBinop(haxe.macro.Binop.OpShr,e1,e24);
										}
										break;
									default:
										var e24 = this.secureExpr();
										return haxeparser.HaxeParser.makeBinop(haxe.macro.Binop.OpShr,e1,e24);
									}
								}
								break;
							case 4:
								this.last = this.token.elt;
								this.token = this.token.next;
								return haxeparser.HaxeParser.makeBinop(haxe.macro.Binop.OpGte,e1,this.secureExpr());
							default:
								var e25 = this.secureExpr();
								return haxeparser.HaxeParser.makeBinop(haxe.macro.Binop.OpGt,e1,e25);
							}
							break;
						default:
							var e25 = this.secureExpr();
							return haxeparser.HaxeParser.makeBinop(haxe.macro.Binop.OpGt,e1,e25);
						}
					}
					break;
				default:
					this.last = this.token.elt;
					this.token = this.token.next;
					var e26 = this.expr();
					return haxeparser.HaxeParser.makeBinop(op,e1,e26);
				}
				break;
			case 20:
				this.last = this.token.elt;
				this.token = this.token.next;
				var e27 = this.expr();
				{
					var _g14 = this.peek(0);
					switch(_g14.tok[1]) {
					case 11:
						this.last = this.token.elt;
						this.token = this.token.next;
						var e3 = this.expr();
						return { expr : haxe.macro.ExprDef.ETernary(e1,e27,e3), pos : haxeparser.HaxeParser.punion(e1.pos,e3.pos)};
					default:
						throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
					}
				}
				break;
			case 0:
				switch(_g.tok[2][1]) {
				case 27:
					this.last = this.token.elt;
					this.token = this.token.next;
					var e28 = this.expr();
					return { expr : haxe.macro.ExprDef.EIn(e1,e28), pos : haxeparser.HaxeParser.punion(e1.pos,e28.pos)};
				default:
					var def2 = function() {
						var def3 = function() {
							return e1;
						};
						{
							var _g15 = _g2.peek(0);
							switch(_g15.tok[1]) {
							case 16:
								var p1 = _g15.pos;
								if(haxeparser.HaxeParser.isDollarIdent(e1)) {
									_g2.last = _g2.token.elt;
									_g2.token = _g2.token.next;
									var eparam = _g2.expr();
									{
										var _g32 = _g2.peek(0);
										switch(_g32.tok[1]) {
										case 17:
											var p26 = _g32.pos;
											_g2.last = _g2.token.elt;
											_g2.token = _g2.token.next;
											{
												var _g4 = e1.expr;
												switch(_g4[1]) {
												case 0:
													switch(_g4[2][1]) {
													case 3:
														var n = _g4[2][2];
														return _g2.exprNext({ expr : haxe.macro.ExprDef.EMeta({ name : n, params : [], pos : e1.pos},eparam), pos : haxeparser.HaxeParser.punion(p1,p26)});
													default:
														throw false;
													}
													break;
												default:
													throw false;
												}
											}
											break;
										default:
											throw new hxparse.Unexpected(_g2.peek(0),_g2.stream.curPos());
										}
									}
								} else return def3();
								break;
							default:
								return def3();
							}
						}
					};
					{
						var _g16 = this.peek(0);
						switch(_g16.tok[1]) {
						case 4:
							var p3 = _g16.pos;
							var op1 = _g16.tok[2];
							if(haxeparser.HaxeParser.isPostfix(e1,op1)) {
								this.last = this.token.elt;
								this.token = this.token.next;
								return this.exprNext({ expr : haxe.macro.ExprDef.EUnop(op1,true,e1), pos : haxeparser.HaxeParser.punion(e1.pos,p3)});
							} else return def2();
							break;
						default:
							return def2();
						}
					}
				}
				break;
			default:
				var def2 = function() {
					var def3 = function() {
						return e1;
					};
					{
						var _g15 = _g2.peek(0);
						switch(_g15.tok[1]) {
						case 16:
							var p1 = _g15.pos;
							if(haxeparser.HaxeParser.isDollarIdent(e1)) {
								_g2.last = _g2.token.elt;
								_g2.token = _g2.token.next;
								var eparam = _g2.expr();
								{
									var _g32 = _g2.peek(0);
									switch(_g32.tok[1]) {
									case 17:
										var p26 = _g32.pos;
										_g2.last = _g2.token.elt;
										_g2.token = _g2.token.next;
										{
											var _g4 = e1.expr;
											switch(_g4[1]) {
											case 0:
												switch(_g4[2][1]) {
												case 3:
													var n = _g4[2][2];
													return _g2.exprNext({ expr : haxe.macro.ExprDef.EMeta({ name : n, params : [], pos : e1.pos},eparam), pos : haxeparser.HaxeParser.punion(p1,p26)});
												default:
													throw false;
												}
												break;
											default:
												throw false;
											}
										}
										break;
									default:
										throw new hxparse.Unexpected(_g2.peek(0),_g2.stream.curPos());
									}
								}
							} else return def3();
							break;
						default:
							return def3();
						}
					}
				};
				{
					var _g16 = this.peek(0);
					switch(_g16.tok[1]) {
					case 4:
						var p3 = _g16.pos;
						var op1 = _g16.tok[2];
						if(haxeparser.HaxeParser.isPostfix(e1,op1)) {
							this.last = this.token.elt;
							this.token = this.token.next;
							return this.exprNext({ expr : haxe.macro.ExprDef.EUnop(op1,true,e1), pos : haxeparser.HaxeParser.punion(e1.pos,p3)});
						} else return def2();
						break;
					default:
						return def2();
					}
				}
			}
		}
	}
	,parseGuard: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 0:
				switch(_g.tok[2][1]) {
				case 3:
					this.last = this.token.elt;
					this.token = this.token.next;
					{
						var _g1 = this.peek(0);
						switch(_g1.tok[1]) {
						case 18:
							this.last = this.token.elt;
							this.token = this.token.next;
							var e = this.expr();
							{
								var _g2 = this.peek(0);
								switch(_g2.tok[1]) {
								case 19:
									this.last = this.token.elt;
									this.token = this.token.next;
									return e;
								default:
									throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
								}
							}
							break;
						default:
							throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
						}
					}
					break;
				default:
					throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
				}
				break;
			default:
				throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
			}
		}
	}
	,parseSwitchCases: function() {
		var cases = [];
		var def = null;
		var caseBlock = function(b,p) {
			if(b.length == 0) return null; else switch(b.length) {
			case 1:
				var e = b[0];
				switch(b[0].expr[1]) {
				case 12:
					var el = b[0].expr[2];
					return e;
				default:
					return { expr : haxe.macro.ExprDef.EBlock(b), pos : p};
				}
				break;
			default:
				return { expr : haxe.macro.ExprDef.EBlock(b), pos : p};
			}
		};
		try {
			while(true) {
				var _g = this.peek(0);
				switch(_g.tok[1]) {
				case 0:
					switch(_g.tok[2][1]) {
					case 16:
						var p1 = _g.pos;
						this.last = this.token.elt;
						this.token = this.token.next;
						{
							var _g1 = this.peek(0);
							switch(_g1.tok[1]) {
							case 11:
								this.last = this.token.elt;
								this.token = this.token.next;
								var b1 = this.block([]);
								var e1 = caseBlock(b1,p1);
								if(e1 == null) e1 = { expr : null, pos : p1};
								if(def != null) throw new haxeparser.ParserError(haxeparser.ParserErrorMsg.DuplicateDefault,p1);
								def = e1;
								break;
							default:
								throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
							}
						}
						break;
					case 15:
						var p11 = _g.pos;
						this.last = this.token.elt;
						this.token = this.token.next;
						var el1 = this.psep(haxeparser.TokenDef.Comma,$bind(this,this.expr));
						var eg = this.parseOptional($bind(this,this.parseGuard));
						{
							var _g11 = this.peek(0);
							switch(_g11.tok[1]) {
							case 11:
								this.last = this.token.elt;
								this.token = this.token.next;
								var b2 = this.block([]);
								var e2 = caseBlock(b2,p11);
								cases.push({ values : el1, guard : eg, expr : e2});
								break;
							default:
								throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
							}
						}
						break;
					default:
						throw "__break__";
					}
					break;
				default:
					throw "__break__";
				}
			}
		} catch( e ) { if( e != "__break__" ) throw e; }
		return { cases : cases, def : def};
	}
	,parseCatch: function() {
		{
			var _g = this.peek(0);
			switch(_g.tok[1]) {
			case 0:
				switch(_g.tok[2][1]) {
				case 21:
					var p = _g.pos;
					this.last = this.token.elt;
					this.token = this.token.next;
					{
						var _g1 = this.peek(0);
						switch(_g1.tok[1]) {
						case 18:
							this.last = this.token.elt;
							this.token = this.token.next;
							var id = this.ident();
							{
								var _g2 = this.peek(0);
								switch(_g2.tok[1]) {
								case 11:
									this.last = this.token.elt;
									this.token = this.token.next;
									var t = this.parseComplexType();
									{
										var _g3 = this.peek(0);
										switch(_g3.tok[1]) {
										case 19:
											this.last = this.token.elt;
											this.token = this.token.next;
											return { name : id.name, type : t, expr : this.secureExpr()};
										default:
											throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
										}
									}
									break;
								default:
									throw new haxeparser.ParserError(haxeparser.ParserErrorMsg.MissingType,p);
								}
							}
							break;
						default:
							throw new hxparse.Unexpected(this.peek(0),this.stream.curPos());
						}
					}
					break;
				default:
					throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
				}
				break;
			default:
				throw new hxparse.NoMatch(this.stream.curPos(),this.peek(0));
			}
		}
	}
	,parseCallParams: function() {
		var ret = [];
		try {
			var e = this.expr();
			ret.push(e);
		} catch( _ ) {
			if( js.Boot.__instanceof(_,hxparse.NoMatch) ) {
				return [];
			} else throw(_);
		}
		try {
			while(true) {
				var _g = this.peek(0);
				switch(_g.tok[1]) {
				case 13:
					this.last = this.token.elt;
					this.token = this.token.next;
					var e1 = this.expr();
					ret.push(e1);
					break;
				default:
					throw "__break__";
				}
			}
		} catch( e ) { if( e != "__break__" ) throw e; }
		return ret;
	}
	,secureExpr: function() {
		return this.expr();
	}
	,__class__: haxeparser.HaxeParser
});
var haxeprinter = {};
haxeprinter.Printer = function() {
	this.config = haxe.Json.parse(haxe.Resource.getString("config"));
};
$hxClasses["haxeprinter.Printer"] = haxeprinter.Printer;
haxeprinter.Printer.__name__ = ["haxeprinter","Printer"];
haxeprinter.Printer.prototype = {
	config: null
	,buf: null
	,line: null
	,lineLen: null
	,indentLevel: null
	,indent: null
	,col: null
	,setIndent: function(level) {
		this.indentLevel = level;
		if(this.config.indent_with_tabs) this.indent = StringTools.lpad("","\t",this.indentLevel); else this.indent = StringTools.lpad(""," ",this.indentLevel * this.config.tab_width | 0);
	}
	,newline: function() {
		this.buf.b += Std.string(this.line.b + "\n");
		this.line = new StringBuf();
		this.col = 0;
		this.lineLen = 0;
	}
	,print: function(s,style) {
		if(style == null) style = haxeprinter.Style.SNormal;
		this.lineLen += s.length;
		if(s == null) this.line.b += "null"; else this.line.b += "" + s;
	}
	,breakPoint: function(force) {
		if(force == null) force = false;
		if(this.col > 0 && (force || this.col + this.lineLen > this.config.maximum_line_length)) {
			this.buf.b += "\n";
			this.setIndent(this.indentLevel + 1);
			this.buf.b += Std.string(this.indent);
			this.col = this.indent.length;
			this.setIndent(this.indentLevel - 1);
		}
		this.col += this.lineLen;
		this.buf.b += Std.string(this.line.b);
		this.line = new StringBuf();
		this.lineLen = 0;
	}
	,printAST: function(ast) {
		this.indentLevel = 0;
		this.indent = "";
		this.col = 0;
		this.buf = new StringBuf();
		this.line = new StringBuf();
		this.lineLen = 0;
		this.printPackage(ast.pack);
		var _g = 0;
		var _g1 = ast.decls;
		while(_g < _g1.length) {
			var type = _g1[_g];
			++_g;
			this.printType(type.decl);
		}
		return this.buf.b;
	}
	,printPackage: function(pack) {
		if(pack.length == 0 && !this.config.print_root_package) return;
		this.print("package",haxeprinter.Style.SDirective);
		var _g1 = 0;
		var _g = pack.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(i == 0) this.print(" ");
			this.print(pack[i],haxeprinter.Style.SType);
			if(i < pack.length - 1) this.print(".");
		}
		this.print(";");
		this.newline();
		if(this.config.empty_line_after_package) this.newline();
	}
	,printType: function(type) {
		switch(type[1]) {
		case 3:
			var mode = type[3];
			var sl = type[2];
			this.printImport(sl,mode);
			break;
		case 5:
			var path = type[2];
			this.printUsing(path);
			break;
		case 2:
			var data = type[2];
			this.printAbstract(data);
			break;
		case 0:
			var data1 = type[2];
			this.printClass(data1);
			break;
		case 1:
			var data2 = type[2];
			this.printEnum(data2);
			break;
		case 4:
			var data3 = type[2];
			this.printTypedef(data3);
			break;
		}
	}
	,printImport: function(path,mode) {
		this.print("import",haxeprinter.Style.SDirective);
		var _g1 = 0;
		var _g = path.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(i == 0) this.print(" ");
			this.print(path[i].pack,haxeprinter.Style.SType);
			if(i < path.length - 1) this.print(".");
		}
		{
			var o = mode;
			switch(mode[1]) {
			case 2:
				this.print(".");
				this.print("*",haxeprinter.Style.SOperator);
				break;
			case 1:
				var s = mode[2];
				this.print(" ");
				this.print("in",haxeprinter.Style.SKeyword);
				this.print(" ");
				this.print(s);
				break;
			default:
			}
		}
		this.print(";");
		this.newline();
		if(this.config.empty_line_after_import) this.newline();
	}
	,printUsing: function(path) {
		this.print("using",haxeprinter.Style.SDirective);
		this.print(" ");
		this.printTypePath(path);
		this.print(";");
		this.newline();
		if(this.config.empty_line_after_import) this.newline();
	}
	,printAbstract: function(data) {
		console.log(data);
	}
	,printClass: function(type) {
		if(this.buf.b.length > 0 && this.config.empty_line_before_type) this.newline();
		var isInterface = false;
		var modifiers = [];
		var ext = null;
		var impls = [];
		var _g = 0;
		var _g1 = type.flags;
		while(_g < _g1.length) {
			var flag = _g1[_g];
			++_g;
			switch(flag[1]) {
			case 0:
				isInterface = true;
				break;
			case 1:
				modifiers.push("extern");
				break;
			case 2:
				modifiers.push("private");
				break;
			case 3:
				var t = flag[2];
				ext = t;
				break;
			case 4:
				var t1 = flag[2];
				impls.push(t1);
				break;
			}
		}
		this.printModifiers(modifiers);
		this.print(isInterface?"interface":"class",haxeprinter.Style.SDirective);
		this.print(" ");
		this.print(type.name,haxeprinter.Style.SType);
		this.printTypeParamDecls(type.params);
		if(ext != null) {
			this.print(" ");
			this.breakPoint();
			this.print("extends",haxeprinter.Style.SKeyword);
			this.print(" ");
			this.printTypePath(ext);
			this.breakPoint(this.config.extends_on_newline);
		}
		if(impls.length > 0) {
			var _g2 = 0;
			while(_g2 < impls.length) {
				var impl = impls[_g2];
				++_g2;
				this.print(" ");
				this.breakPoint();
				this.print("implements",haxeprinter.Style.SKeyword);
				this.print(" ");
				this.printTypePath(impl);
				this.breakPoint(this.config.implements_on_newline);
			}
		}
		if(type.data.length == 0 && this.config.inline_empty_braces) {
			this.print(" {}");
			this.newline();
			return;
		}
		if(this.config.cuddle_type_braces) {
			this.print(" {");
			this.newline();
			this.breakPoint();
		} else {
			this.breakPoint();
			this.newline();
			this.print("{");
			this.newline();
		}
		this.setIndent(this.indentLevel + 1);
		var _g11 = 0;
		var _g3 = type.data.length;
		while(_g11 < _g3) {
			var i = _g11++;
			this.printClassField(type.data[i]);
			if(i < type.data.length - 1 && this.config.empty_line_between_fields) this.newline();
		}
		this.setIndent(this.indentLevel - 1);
		this.print("}");
		this.newline();
	}
	,printClassField: function(field) {
		this.print(this.indent);
		var modifiers = field.access.map(function(a) {
			return ((function($this) {
				var $r;
				var _this = Std.string(a);
				$r = HxOverrides.substr(_this,1,null);
				return $r;
			}(this))).toLowerCase();
		});
		if(this.config.remove_private_field_modifier) HxOverrides.remove(modifiers,"private");
		this.printModifiers(modifiers);
		{
			var _g = field.kind;
			switch(_g[1]) {
			case 1:
				var f = _g[2];
				this.printFunction(field,f);
				break;
			case 0:
				var e = _g[3];
				var t = _g[2];
				this.printProp(field,null,null,t,e);
				break;
			case 2:
				var e1 = _g[5];
				var t1 = _g[4];
				var set = _g[3];
				var get = _g[2];
				this.printProp(field,get,set,t1,e1);
				break;
			}
		}
	}
	,printEnum: function(type) {
		if(this.config.empty_line_before_type) this.newline();
		var modifiers = type.flags.map(function(flag) {
			return ((function($this) {
				var $r;
				var _this = Std.string(flag);
				$r = HxOverrides.substr(_this,1,null);
				return $r;
			}(this))).toLowerCase();
		});
		this.printModifiers(modifiers);
		this.print("enum",haxeprinter.Style.SDirective);
		this.print(" ");
		this.print(type.name,haxeprinter.Style.SType);
		this.printTypeParamDecls(type.params);
		if(type.data.length == 0 && this.config.inline_empty_braces) {
			this.print(" {}");
			this.newline();
			return;
		}
		if(this.config.cuddle_type_braces) {
			this.print(" {");
			this.newline();
		} else {
			this.newline();
			this.print("{");
			this.newline();
		}
		this.setIndent(this.indentLevel + 1);
		var _g1 = 0;
		var _g = type.data.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.printEnumConstructor(type.data[i]);
			if(i < type.data.length - 1 && this.config.empty_line_between_enum_constructors) this.newline();
		}
		this.setIndent(this.indentLevel - 1);
		this.print("}");
		this.newline();
	}
	,printEnumConstructor: function(ctor) {
		this.print(this.indent);
		this.print(ctor.name,haxeprinter.Style.SType);
		this.printTypeParamDecls(ctor.params);
		this.printEnumConstructorArgs(ctor.args);
		this.print(";");
		this.newline();
	}
	,printEnumConstructorArgs: function(args) {
		if(args.length == 0) return;
		this.print("(");
		var _g1 = 0;
		var _g = args.length;
		while(_g1 < _g) {
			var i = _g1++;
			var arg = args[i];
			if(arg.opt) this.print("?");
			this.print(arg.name,haxeprinter.Style.SIdent);
			this.print(":");
			this.printComplexType(arg.type);
			if(i < args.length - 1) {
				if(this.config.space_between_enum_constructor_args) this.print(", "); else this.print(",");
			}
		}
		this.print(")");
	}
	,printTypedef: function(type) {
		if(this.config.empty_line_before_type) this.newline();
		var modifiers = type.flags.map(function(flag) {
			return ((function($this) {
				var $r;
				var _this = Std.string(flag);
				$r = HxOverrides.substr(_this,1,null);
				return $r;
			}(this))).toLowerCase();
		});
		this.printModifiers(modifiers);
		this.print("typedef",haxeprinter.Style.SDirective);
		this.print(" ");
		this.print(type.name,haxeprinter.Style.SType);
		this.printTypeParamDecls(type.params);
		this.print(" = ");
		{
			var _g = type.data;
			switch(_g[1]) {
			case 2:
				var fields = _g[2];
				this.printAnonFields(fields);
				break;
			case 0:
				var path = _g[2];
				this.printTypePath(path);
				break;
			default:
				throw "todo: " + Std.string(type.data);
			}
		}
		this.newline();
	}
	,printAnonFields: function(fields) {
		if(fields.length == 0 && this.config.inline_empty_braces) {
			this.print(" {}");
			return;
		}
		if(this.config.cuddle_type_braces) {
			this.print(" {");
			this.newline();
		} else {
			this.newline();
			this.print("{");
			this.newline();
		}
		this.setIndent(this.indentLevel + 1);
		var _g1 = 0;
		var _g = fields.length;
		while(_g1 < _g) {
			var i = _g1++;
			var field = fields[i];
			this.print(this.indent);
			this.print(field.name,haxeprinter.Style.SIdent);
			this.print(":");
			{
				var _g2 = field.kind;
				switch(_g2[1]) {
				case 0:
					var t = _g2[2];
					this.printComplexType(t);
					break;
				default:
					throw "todo: " + Std.string(field.kind);
				}
			}
			if(i < fields.length - 1) {
				this.print(",");
				if(this.config.empty_line_between_typedef_fields) this.newline();
			}
			this.newline();
		}
		this.setIndent(this.indentLevel - 1);
		this.print("}");
	}
	,printFunction: function(field,f) {
		this.print("function",haxeprinter.Style.SKeyword);
		this.print(" ");
		this.print(field.name,haxeprinter.Style.SIdent);
		this.printTypeParamDecls(f.params);
		this.printFunctionArgs(f.args);
		if(f.ret != null) {
			this.print(":");
			this.printComplexType(f.ret);
		}
		if(this.config.cuddle_method_braces) this.print(" "); else {
			this.newline();
			this.print(this.indent);
		}
		this.printExpr(f.expr);
		this.newline();
	}
	,printProp: function(field,get,set,type,expr) {
		this.print("var",haxeprinter.Style.SKeyword);
		this.print(" ");
		this.print(field.name,haxeprinter.Style.SIdent);
		if(get != null && set != null) {
			this.print("(");
			this.print(get,haxeprinter.Style.SModifier);
			if(this.config.space_betwen_property_get_set) this.print(", "); else this.print(",");
			this.print(set,haxeprinter.Style.SModifier);
			this.print(")");
		}
		if(type != null) {
			this.print(":");
			this.printComplexType(type);
		}
		if(expr != null) {
			if(this.config.space_around_property_assign) this.print(" = "); else this.print("=");
			this.printExpr(expr);
		}
		this.print(";");
		this.newline();
	}
	,printExpr: function(expr) {
		this.print(haxe.macro.ExprTools.toString(expr).split("\n").join("\n" + this.indent));
	}
	,printFunctionArgs: function(args) {
		this.print("(");
		this.breakPoint(this.config.function_arg_on_newline);
		var _g1 = 0;
		var _g = args.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.breakPoint(this.config.function_arg_on_newline);
			var arg = args[i];
			if(arg.opt) this.print("?");
			this.print(arg.name,haxeprinter.Style.SIdent);
			if(arg.type != null) {
				this.print(":");
				this.printComplexType(arg.type);
			}
			if(arg.value != null) {
				if(this.config.space_around_function_arg_assign) this.print(" = "); else this.print("=");
				this.printExpr(arg.value);
			}
			if(i < args.length - 1) {
				this.print(",");
				if(this.config.space_between_function_args) this.print(" ");
				this.breakPoint();
			}
		}
		this.print(")");
		this.breakPoint();
	}
	,printModifiers: function(modifiers) {
		if(modifiers.length == 0) return;
		var order = this.config.modifier_order;
		modifiers.sort(function(a,b) {
			return HxOverrides.indexOf(order,a,0) - HxOverrides.indexOf(order,b,0);
		});
		var _g = 0;
		while(_g < modifiers.length) {
			var modifier = modifiers[_g];
			++_g;
			this.print(modifier,haxeprinter.Style.SModifier);
			this.print(" ");
		}
	}
	,printTypePath: function(path) {
		var pack = path.pack.concat([path.name]);
		var _g1 = 0;
		var _g = pack.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.print(pack[i],haxeprinter.Style.SType);
			if(i < pack.length - 1) this.print(".");
		}
		var params = path.params;
		if(params.length == 0) return;
		this.print("<");
		var _g11 = 0;
		var _g2 = params.length;
		while(_g11 < _g2) {
			var i1 = _g11++;
			this.printTypeParam(params[i1]);
			if(i1 < params.length - 1) {
				if(this.config.space_between_type_params) this.print(", "); else this.print(",");
			}
		}
		this.print(">");
	}
	,printTypeParamDecls: function(params) {
		if(params.length == 0) return;
		this.print("<");
		var _g1 = 0;
		var _g = params.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.printTypeParamDecl(params[i]);
			if(i < params.length - 1) {
				if(this.config.space_between_type_params) this.print(", "); else this.print(",");
			}
		}
		this.print(">");
	}
	,printTypeParamDecl: function(param) {
		this.print(param.name,haxeprinter.Style.SType);
		var constraints = param.constraints;
		if(constraints.length == 0) return;
		this.print(":");
		if(constraints.length > 1) this.print("(");
		var _g1 = 0;
		var _g = constraints.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.printComplexType(constraints[i]);
			if(i < constraints.length - 1) {
				if(this.config.space_between_type_param_constraints) this.print(", "); else this.print(",");
			}
		}
		if(constraints.length > 1) this.print(")");
	}
	,printTypeParam: function(param) {
		switch(param[1]) {
		case 0:
			var type = param[2];
			this.printComplexType(type);
			break;
		default:
			throw "todo: " + Std.string(param);
		}
	}
	,printComplexType: function(type) {
		switch(type[1]) {
		case 0:
			var path = type[2];
			this.printTypePath(path);
			break;
		case 2:
			var fields = type[2];
			this.printAnonType(fields);
			break;
		default:
			throw "todo: " + Std.string(type);
		}
	}
	,printAnonType: function(fields) {
		this.print("{");
		var _g1 = 0;
		var _g = fields.length;
		while(_g1 < _g) {
			var i = _g1++;
			var field = fields[i];
			this.print(field.name,haxeprinter.Style.SIdent);
			this.print(":");
			{
				var _g2 = field.kind;
				switch(_g2[1]) {
				case 0:
					var t = _g2[2];
					this.printComplexType(t);
					break;
				default:
					throw "todo: " + Std.string(field.kind);
				}
			}
			if(i < fields.length - 1) {
				if(this.config.space_between_anon_type_fields) this.print(", "); else this.print(",");
			}
		}
		this.print("}");
	}
	,__class__: haxeprinter.Printer
};
haxeprinter.Style = $hxClasses["haxeprinter.Style"] = { __ename__ : ["haxeprinter","Style"], __constructs__ : ["SNormal","SDirective","SOperator","SKeyword","SIdent","SString","SNumber","SType","SModifier"] };
haxeprinter.Style.SNormal = ["SNormal",0];
haxeprinter.Style.SNormal.toString = $estr;
haxeprinter.Style.SNormal.__enum__ = haxeprinter.Style;
haxeprinter.Style.SDirective = ["SDirective",1];
haxeprinter.Style.SDirective.toString = $estr;
haxeprinter.Style.SDirective.__enum__ = haxeprinter.Style;
haxeprinter.Style.SOperator = ["SOperator",2];
haxeprinter.Style.SOperator.toString = $estr;
haxeprinter.Style.SOperator.__enum__ = haxeprinter.Style;
haxeprinter.Style.SKeyword = ["SKeyword",3];
haxeprinter.Style.SKeyword.toString = $estr;
haxeprinter.Style.SKeyword.__enum__ = haxeprinter.Style;
haxeprinter.Style.SIdent = ["SIdent",4];
haxeprinter.Style.SIdent.toString = $estr;
haxeprinter.Style.SIdent.__enum__ = haxeprinter.Style;
haxeprinter.Style.SString = ["SString",5];
haxeprinter.Style.SString.toString = $estr;
haxeprinter.Style.SString.__enum__ = haxeprinter.Style;
haxeprinter.Style.SNumber = ["SNumber",6];
haxeprinter.Style.SNumber.toString = $estr;
haxeprinter.Style.SNumber.__enum__ = haxeprinter.Style;
haxeprinter.Style.SType = ["SType",7];
haxeprinter.Style.SType.toString = $estr;
haxeprinter.Style.SType.__enum__ = haxeprinter.Style;
haxeprinter.Style.SModifier = ["SModifier",8];
haxeprinter.Style.SModifier.toString = $estr;
haxeprinter.Style.SModifier.__enum__ = haxeprinter.Style;
var haxeproject = {};
haxeproject.HaxeProject = function() { };
$hxClasses["haxeproject.HaxeProject"] = haxeproject.HaxeProject;
haxeproject.HaxeProject.__name__ = ["haxeproject","HaxeProject"];
haxeproject.HaxeProject.load = function() {
	newprojectdialog.NewProjectDialog.getCategory("Haxe",1).addItem("Flash Project",haxeproject.HaxeProject.createFlashProject);
	newprojectdialog.NewProjectDialog.getCategory("Haxe").addItem("JavaScript Project",haxeproject.HaxeProject.createJavaScriptProject);
	newprojectdialog.NewProjectDialog.getCategory("Haxe").addItem("Neko Project",haxeproject.HaxeProject.createNekoProject);
	newprojectdialog.NewProjectDialog.getCategory("Haxe").addItem("PHP Project",haxeproject.HaxeProject.createPhpProject);
	newprojectdialog.NewProjectDialog.getCategory("Haxe").addItem("C++ Project",haxeproject.HaxeProject.createCppProject);
	newprojectdialog.NewProjectDialog.getCategory("Haxe").addItem("Java Project",haxeproject.HaxeProject.createJavaProject);
	newprojectdialog.NewProjectDialog.getCategory("Haxe").addItem("C# Project",haxeproject.HaxeProject.createCSharpProject);
	newprojectdialog.NewProjectDialog.getCategory("Haxe").addItem("Python Project",haxeproject.HaxeProject.createPythonProject);
	var options = { };
	options.encoding = "utf8";
	var path = js.Node.require("path").join("core","templates","Main.hx");
	js.Node.require("fs").readFile(path,options,function(error,data) {
		if(error == null) haxeproject.HaxeProject.code = data; else {
			console.log(error);
			Alertify.error("Can't load template " + path);
		}
	});
	path = js.Node.require("path").join("core","templates","index.html");
	js.Node.require("fs").readFile(path,options,function(error1,data1) {
		if(error1 == null) haxeproject.HaxeProject.indexPageCode = data1; else {
			console.log(error1);
			Alertify.error("Can't load template " + path);
		}
	});
};
haxeproject.HaxeProject.createPythonProject = function(data) {
	haxeproject.HaxeProject.createHaxeProject(data,7);
};
haxeproject.HaxeProject.createCSharpProject = function(data) {
	haxeproject.HaxeProject.createHaxeProject(data,6);
};
haxeproject.HaxeProject.createJavaProject = function(data) {
	haxeproject.HaxeProject.createHaxeProject(data,5);
};
haxeproject.HaxeProject.createCppProject = function(data) {
	haxeproject.HaxeProject.createHaxeProject(data,4);
};
haxeproject.HaxeProject.createPhpProject = function(data) {
	haxeproject.HaxeProject.createHaxeProject(data,3);
};
haxeproject.HaxeProject.createNekoProject = function(data) {
	haxeproject.HaxeProject.createHaxeProject(data,2);
};
haxeproject.HaxeProject.createFlashProject = function(data) {
	haxeproject.HaxeProject.createHaxeProject(data,0);
};
haxeproject.HaxeProject.createJavaScriptProject = function(data) {
	haxeproject.HaxeProject.createHaxeProject(data,1);
};
haxeproject.HaxeProject.createHaxeProject = function(data,target) {
	var pathToSrc = js.Node.require("path").join(data.projectLocation,data.projectName,"src");
	js.node.Mkdirp.mkdirp(pathToSrc,function(err,made) {
		var pathToProject = data.projectLocation;
		if(data.createDirectory) pathToProject = js.Node.require("path").join(pathToProject,data.projectName);
		var pathToMain;
		pathToMain = js.Node.require("path").join(pathToProject,"src","Main.hx");
		js.Node.require("fs").writeFile(pathToMain,haxeproject.HaxeProject.code,null,function(error) {
			if(error != null) Alertify.error("Write file error" + error);
			js.Node.require("fs").exists(pathToMain,function(exists) {
				if(exists) tabmanager.TabManager.openFileInNewTab(pathToMain); else console.log(pathToMain + " file was not generated");
			});
		});
		var project = new projectaccess.Project();
		project.name = data.projectName;
		project.projectPackage = data.projectPackage;
		project.company = data.projectCompany;
		project.license = data.projectLicense;
		project.url = data.projectURL;
		project.type = 0;
		project.target = target;
		projectaccess.ProjectAccess.path = pathToProject;
		var filenames = ["flash","javascript","neko","php","cpp","java","csharp","python"];
		var pathToProjectTemplates = js.Node.require("path").join("core","templates","project");
		var _g1 = 0;
		var _g = filenames.length;
		while(_g1 < _g) {
			var i = _g1++;
			var targetData = { };
			targetData.pathToHxml = filenames[i] + ".hxml";
			var options = { };
			options.encoding = "utf8";
			var templateCode = js.Node.require("fs").readFileSync(js.Node.require("path").join(pathToProjectTemplates,targetData.pathToHxml),options);
			var pathToFile;
			switch(i) {
			case 0:
				pathToFile = "bin/" + project.name + ".swf";
				targetData.runActionType = 1;
				targetData.runActionText = pathToFile;
				break;
			case 1:
				pathToFile = "bin/" + project.name + ".js";
				targetData.runActionType = 1;
				targetData.runActionText = js.Node.require("path").join("bin","index.html");
				break;
			case 2:
				pathToFile = "bin/" + project.name + ".n";
				targetData.runActionType = 2;
				targetData.runActionText = "neko " + pathToFile;
				break;
			case 3:
				pathToFile = "bin/" + project.name + ".php";
				break;
			case 4:
				pathToFile = "bin/" + project.name + ".exe";
				targetData.runActionType = 2;
				targetData.runActionText = pathToFile;
				break;
			case 5:
				pathToFile = "bin/" + project.name + ".jar";
				break;
			case 6:
				pathToFile = "bin/" + project.name + ".exe";
				break;
			case 7:
				pathToFile = "bin/" + project.name + ".py";
				targetData.runActionType = 2;
				targetData.runActionText = "python " + pathToFile;
				break;
			default:
				throw "Path to file is null";
			}
			templateCode = mustache.Mustache.render(templateCode,{ file : pathToFile});
			js.Node.require("fs").writeFileSync(js.Node.require("path").join(pathToProject,targetData.pathToHxml),templateCode,"utf8");
			project.targetData.push(targetData);
		}
		js.Node.require("fs").mkdir(js.Node.require("path").join(pathToProject,"bin"),null,function(error1) {
			if(error1 == null) {
				var updatedPageCode = mustache.Mustache.render(haxeproject.HaxeProject.indexPageCode,{ title : project.name, script : project.name + ".js"});
				var pathToWebPage = js.Node.require("path").join(pathToProject,"bin","index.html");
				js.Node.require("fs").writeFile(pathToWebPage,updatedPageCode,"utf8",function(error2) {
					if(error2 != null) {
						console.log(error2);
						Alertify.error("Generate web page error: " + error2);
					}
				});
			} else Alertify.error("Folder creation error: " + error1);
		});
		var path = js.Node.require("path").join(pathToProject,"project.hide");
		projectaccess.ProjectAccess.currentProject = project;
		projectaccess.ProjectAccess.save((function(f,a1) {
			return function() {
				return f(a1);
			};
		})(openproject.OpenProject.openProject,path));
	});
};
hxparse.NoMatch = function(pos,token) {
	this.pos = pos;
	this.token = token;
};
$hxClasses["hxparse.NoMatch"] = hxparse.NoMatch;
hxparse.NoMatch.__name__ = ["hxparse","NoMatch"];
hxparse.NoMatch.prototype = {
	pos: null
	,token: null
	,toString: function() {
		return "" + Std.string(this.pos) + ": No match: " + Std.string(this.token);
	}
	,__class__: hxparse.NoMatch
};
hxparse.State = function() {
	this["final"] = -1;
	var this1;
	this1 = new Array(256);
	this.trans = this1;
};
$hxClasses["hxparse.State"] = hxparse.State;
hxparse.State.__name__ = ["hxparse","State"];
hxparse.State.prototype = {
	trans: null
	,'final': null
	,__class__: hxparse.State
};
hxparse.Unexpected = function(token,pos) {
	this.token = token;
	this.pos = pos;
};
$hxClasses["hxparse.Unexpected"] = hxparse.Unexpected;
hxparse.Unexpected.__name__ = ["hxparse","Unexpected"];
hxparse.Unexpected.prototype = {
	token: null
	,pos: null
	,toString: function() {
		return "Unexpected " + Std.string(this.token) + " at " + Std.string(this.pos);
	}
	,__class__: hxparse.Unexpected
};
hxparse.UnexpectedChar = function($char,pos) {
	this["char"] = $char;
	this.pos = pos;
};
$hxClasses["hxparse.UnexpectedChar"] = hxparse.UnexpectedChar;
hxparse.UnexpectedChar.__name__ = ["hxparse","UnexpectedChar"];
hxparse.UnexpectedChar.prototype = {
	'char': null
	,pos: null
	,toString: function() {
		return "" + Std.string(this.pos) + ": Unexpected " + this["char"];
	}
	,__class__: hxparse.UnexpectedChar
};
js.Browser = function() { };
$hxClasses["js.Browser"] = js.Browser;
js.Browser.__name__ = ["js","Browser"];
js.Browser.getLocalStorage = function() {
	try {
		var s = window.localStorage;
		s.getItem("");
		return s;
	} catch( e ) {
		return null;
	}
};
js.Lib = function() { };
$hxClasses["js.Lib"] = js.Lib;
js.Lib.__name__ = ["js","Lib"];
js.Lib["eval"] = function(code) {
	return eval(code);
};
js.Node = function() { };
$hxClasses["js.Node"] = js.Node;
js.Node.__name__ = ["js","Node"];
js.node = {};
js.node.Mkdirp = function() { };
$hxClasses["js.node.Mkdirp"] = js.node.Mkdirp;
js.node.Mkdirp.__name__ = ["js","node","Mkdirp"];
js.node.Mkdirp.mkdirp = function(dir,mode,cb) {
	if(cb == null) js.node.Mkdirp._mkdirp(dir,mode); else js.node.Mkdirp._mkdirp(dir,mode,cb);
};
js.node.Mv = function() { };
$hxClasses["js.node.Mv"] = js.node.Mv;
js.node.Mv.__name__ = ["js","node","Mv"];
js.node.Mv.move = function(src,dest,cb) {
	js.node.Mv.mv(src,dest,cb);
};
js.node.Remove = function() { };
$hxClasses["js.node.Remove"] = js.node.Remove;
js.node.Remove.__name__ = ["js","node","Remove"];
js.node.Remove.removeAsync = function(path,options,cb) {
	js.node.Remove.remove(path,options,cb);
};
var Walkdir = function() { };
$hxClasses["Walkdir"] = Walkdir;
Walkdir.__name__ = ["Walkdir"];
Walkdir.walk = function(path,options,onItem) {
	var emitter;
	if(onItem != null) emitter = Walkdir.walkdir(path,options,onItem); else emitter = Walkdir.walkdir(path,options);
	return emitter;
};
Walkdir.walkSync = function(path,options,onItem) {
	var result;
	if(options != null) result = Walkdir.walkdir.sync(path,options,onItem); else result = Walkdir.walkdir.sync(path,onItem);
	return result;
};
var kha = {};
kha.KhaProject = function() { };
$hxClasses["kha.KhaProject"] = kha.KhaProject;
kha.KhaProject.__name__ = ["kha","KhaProject"];
kha.KhaProject.load = function() {
	newprojectdialog.NewProjectDialog.getCategory("Kha",3).addItem("Empty project",null,false,false);
};
var menu = {};
menu.BootstrapMenu = function() { };
$hxClasses["menu.BootstrapMenu"] = menu.BootstrapMenu;
menu.BootstrapMenu.__name__ = ["menu","BootstrapMenu"];
menu.BootstrapMenu.createMenuBar = function() {
	window.document.body.style.overflow = "hidden";
	var navbar;
	var _this = window.document;
	navbar = _this.createElement("div");
	navbar.className = "navbar navbar-default navbar-inverse navbar-fixed-top";
	var navbarHeader;
	var _this1 = window.document;
	navbarHeader = _this1.createElement("div");
	navbarHeader.className = "navbar-header";
	navbar.appendChild(navbarHeader);
	var a;
	var _this2 = window.document;
	a = _this2.createElement("a");
	a.className = "navbar-brand";
	a.href = "#";
	a.innerText = watchers.LocaleWatcher.getStringSync("HIDE");
	a.setAttribute("localeString","HIDE");
	navbarHeader.appendChild(a);
	var div;
	var _this3 = window.document;
	div = _this3.createElement("div");
	div.className = "navbar-collapse collapse";
	var ul;
	var _this4 = window.document;
	ul = _this4.createElement("ul");
	ul.id = "position-navbar";
	ul.className = "nav navbar-nav";
	div.appendChild(ul);
	navbar.appendChild(div);
	window.document.body.appendChild(navbar);
};
menu.BootstrapMenu.getMenu = function(name,position) {
	var menu1;
	if(!menu.BootstrapMenu.menus.exists(name)) {
		menu1 = new menu.Menu(name);
		menu1.setPosition(position);
		menu.BootstrapMenu.addMenuToDocument(menu1);
		menu.BootstrapMenu.menus.set(name,menu1);
	} else {
		menu1 = menu.BootstrapMenu.menus.get(name);
		if(position != null && menu1.position != position) {
			menu1.removeFromDocument();
			menu.BootstrapMenu.menus.remove(name);
			menu1.setPosition(position);
			menu.BootstrapMenu.addMenuToDocument(menu1);
			menu.BootstrapMenu.menus.set(name,menu1);
		}
	}
	return menu1;
};
menu.BootstrapMenu.addMenuToDocument = function(menu1) {
	var div;
	div = js.Boot.__cast(window.document.getElementById("position-navbar") , Element);
	if(menu1.position != null && menu.BootstrapMenu.menuArray.length > 0 && div.childNodes.length > 0) {
		var currentMenu;
		var added = false;
		var _g1 = 0;
		var _g = menu.BootstrapMenu.menuArray.length;
		while(_g1 < _g) {
			var i = _g1++;
			currentMenu = menu.BootstrapMenu.menuArray[i];
			if(currentMenu != menu1 && currentMenu.position == null || menu1.position < currentMenu.position) {
				div.insertBefore(menu1.getElement(),currentMenu.getElement());
				menu.BootstrapMenu.menuArray.splice(i,0,menu1);
				added = true;
				break;
			}
		}
		if(!added) {
			menu1.addToDocument();
			menu.BootstrapMenu.menuArray.push(menu1);
		}
	} else {
		menu1.addToDocument();
		menu.BootstrapMenu.menuArray.push(menu1);
	}
};
menu.MenuItem = function() { };
$hxClasses["menu.MenuItem"] = menu.MenuItem;
menu.MenuItem.__name__ = ["menu","MenuItem"];
menu.MenuButtonItem = function(_menu,_text,_onClickFunction,_hotkey,_submenu) {
	if(_submenu == null) _submenu = false;
	if(_hotkey == null) _hotkey = "";
	var _g = this;
	var hotkeyText = _hotkey;
	var menuItem = _menu + "->" + _text;
	var span;
	var _this = window.document;
	span = _this.createElement("span");
	span.className = "hotkey";
	if(!_submenu) core.Hotkeys.add(menuItem,hotkeyText,span,_onClickFunction);
	var _this1 = window.document;
	this.li = _this1.createElement("li");
	this.li.classList.add("menu-item");
	var a;
	var _this2 = window.document;
	a = _this2.createElement("a");
	a.style.left = "0";
	if(!_submenu) {
		a.textContent = watchers.LocaleWatcher.getStringSync(_text);
		a.setAttribute("localeString",_text);
	} else a.textContent = _text;
	if(_onClickFunction != null) a.onclick = function(e) {
		if(_g.li.className != "disabled") _onClickFunction();
	};
	a.innerText = _text;
	a.appendChild(span);
	this.li.appendChild(a);
};
$hxClasses["menu.MenuButtonItem"] = menu.MenuButtonItem;
menu.MenuButtonItem.__name__ = ["menu","MenuButtonItem"];
menu.MenuButtonItem.__interfaces__ = [menu.MenuItem];
menu.MenuButtonItem.prototype = {
	li: null
	,position: null
	,getElement: function() {
		return this.li;
	}
	,__class__: menu.MenuButtonItem
};
menu.Separator = function() {
	var _this = window.document;
	this.li = _this.createElement("li");
	this.li.className = "divider";
};
$hxClasses["menu.Separator"] = menu.Separator;
menu.Separator.__name__ = ["menu","Separator"];
menu.Separator.__interfaces__ = [menu.MenuItem];
menu.Separator.prototype = {
	li: null
	,getElement: function() {
		return this.li;
	}
	,__class__: menu.Separator
};
menu.Submenu = function(_parentMenu,_name) {
	var _g = this;
	this.name = _name;
	this.parentMenu = _parentMenu;
	var li2;
	var _this = window.document;
	li2 = _this.createElement("li");
	li2.classList.add("menu-item");
	li2.classList.add("dropdown");
	li2.classList.add("dropdown-submenu");
	this.li = li2;
	var _this1 = window.document;
	this.ul = _this1.createElement("ul");
	var a2;
	var _this2 = window.document;
	a2 = _this2.createElement("a");
	a2.href = "#";
	a2.classList.add("dropdown-toggle");
	a2.setAttribute("data-toggle","dropdown");
	a2.setAttribute("localeString",this.name);
	a2.textContent = this.name;
	a2.onclick = function(event) {
		new $("li.menu-item.dropdown.dropdown-submenu.open").removeClass("open");
		event.preventDefault();
		event.stopPropagation();
		if(_g.ul.childElementCount > 0) {
			li2.classList.add("open");
			var menu = _g.ul;
			var newpos;
			if(menu.offsetLeft + menu.clientWidth + 30 > window.innerWidth) newpos = -menu.clientWidth; else newpos = li2.clientWidth;
			menu.style.left = (newpos == null?"null":"" + newpos) + "px";
		}
	};
	li2.appendChild(a2);
	this.ul.classList.add("dropdown-menu");
	li2.appendChild(this.ul);
};
$hxClasses["menu.Submenu"] = menu.Submenu;
menu.Submenu.__name__ = ["menu","Submenu"];
menu.Submenu.prototype = {
	ul: null
	,li: null
	,name: null
	,parentMenu: null
	,addMenuItem: function(_text,_position,_onClickFunction,_hotkey) {
		var menuButtonItem = new menu.MenuButtonItem(this.parentMenu + "->" + this.name,_text,_onClickFunction,_hotkey,true);
		this.ul.appendChild(menuButtonItem.getElement());
	}
	,clear: function() {
		while(this.ul.firstChild != null) this.ul.removeChild(this.ul.firstChild);
	}
	,getElement: function() {
		return this.li;
	}
	,__class__: menu.Submenu
};
menu.Menu = function(_text,_headerText) {
	this.name = _text;
	var _this = window.document;
	this.li = _this.createElement("li");
	this.li.className = "dropdown";
	var a;
	var _this1 = window.document;
	a = _this1.createElement("a");
	a.href = "#";
	a.className = "dropdown-toggle";
	a.setAttribute("data-toggle","dropdown");
	a.innerText = watchers.LocaleWatcher.getStringSync(_text);
	a.setAttribute("localeString",_text);
	this.li.appendChild(a);
	var _this2 = window.document;
	this.ul = _this2.createElement("ul");
	this.ul.className = "dropdown-menu";
	this.ul.classList.add("dropdown-menu-form");
	if(_headerText != null) {
		var li_header;
		var _this3 = window.document;
		li_header = _this3.createElement("li");
		li_header.className = "dropdown-header";
		li_header.innerText = _headerText;
		this.ul.appendChild(li_header);
	}
	this.li.appendChild(this.ul);
	this.items = new Array();
	this.submenus = new haxe.ds.StringMap();
};
$hxClasses["menu.Menu"] = menu.Menu;
menu.Menu.__name__ = ["menu","Menu"];
menu.Menu.prototype = {
	li: null
	,ul: null
	,items: null
	,name: null
	,submenus: null
	,position: null
	,addMenuItem: function(_text,_position,_onClickFunction,_hotkey) {
		var menuButtonItem = new menu.MenuButtonItem(this.name,_text,_onClickFunction,_hotkey);
		menuButtonItem.position = _position;
		if(menuButtonItem.position != null && this.items.length > 0 && this.ul.childNodes.length > 0) {
			var currentMenuButtonItem;
			var added = false;
			var _g1 = 0;
			var _g = this.items.length;
			while(_g1 < _g) {
				var i = _g1++;
				currentMenuButtonItem = this.items[i];
				if(currentMenuButtonItem != menuButtonItem && currentMenuButtonItem.position == null || menuButtonItem.position < currentMenuButtonItem.position) {
					this.ul.insertBefore(menuButtonItem.getElement(),currentMenuButtonItem.getElement());
					this.items.splice(i,0,menuButtonItem);
					added = true;
					break;
				}
			}
			if(!added) {
				this.ul.appendChild(menuButtonItem.getElement());
				this.items.push(menuButtonItem);
			}
		} else {
			this.ul.appendChild(menuButtonItem.getElement());
			this.items.push(menuButtonItem);
		}
	}
	,addSeparator: function() {
		this.ul.appendChild(new menu.Separator().getElement());
	}
	,addSubmenu: function(_text) {
		var submenu = new menu.Submenu(this.name,_text);
		this.ul.appendChild(submenu.getElement());
		this.submenus.set(_text,submenu);
		return submenu;
	}
	,addToDocument: function() {
		var div;
		div = js.Boot.__cast(window.document.getElementById("position-navbar") , Element);
		div.appendChild(this.li);
	}
	,removeFromDocument: function() {
		this.li.remove();
	}
	,setPosition: function(_position) {
		this.position = _position;
	}
	,getSubmenu: function(name) {
		if(!this.submenus.exists(name)) this.submenus.set(name,this.addSubmenu(name));
		return this.submenus.get(name);
	}
	,getElement: function() {
		return this.li;
	}
	,__class__: menu.Menu
};
var mustache = {};
mustache.Mustache = function(template,data) {
	this.template = new String(template);
	this.data = data;
	this.context = data;
	this.stack = [];
	this.replacing = true;
};
$hxClasses["mustache.Mustache"] = mustache.Mustache;
mustache.Mustache.__name__ = ["mustache","Mustache"];
mustache.Mustache.render = function(template,data) {
	var mustache1 = new mustache.Mustache(template,data);
	return mustache1._render();
};
mustache.Mustache.prototype = {
	template: null
	,data: null
	,context: null
	,stack: null
	,replacing: null
	,_render: function() {
		var canReplace = true;
		while(canReplace) canReplace = this._replaceNext();
		return this.template;
	}
	,_getValue: function(key) {
		var raw = Reflect.getProperty(this.context,key);
		var value = raw;
		if(Reflect.isFunction(raw)) value = raw();
		return value;
	}
	,_replaceVariable: function(pattern) {
		var expression = pattern.matched(3);
		return Std.string(this._getValue(expression));
	}
	,_replaceArray: function(array,beginPattern,endPattern) {
		var beginPosition = beginPattern.matchedPos();
		var endPosition = endPattern.matchedPos();
		var beforeArray = this.template.substring(0,beginPosition.pos);
		var afterArray = this.template.substring(endPosition.pos + endPosition.len,this.template.length);
		var arrayString = this.template.substring(beginPosition.pos + beginPosition.len,endPosition.pos);
		var value = "";
		var _g = 0;
		while(_g < array.length) {
			var element = array[_g];
			++_g;
			value += mustache.Mustache.render(arrayString,element);
		}
		this.template = beforeArray + value + afterArray;
	}
	,_replaceCondition: function(condition,beginPattern,endPattern) {
		var beginPosition = beginPattern.matchedPos();
		var endPosition = endPattern.matchedPos();
		var beforeArray = this.template.substring(0,beginPosition.pos);
		var afterArray = this.template.substring(endPosition.pos + endPosition.len,this.template.length);
		var arrayString = this.template.substring(beginPosition.pos + beginPosition.len,endPosition.pos);
		var value = "";
		if(condition) value = arrayString;
		this.template = beforeArray + value + afterArray;
	}
	,_replaceBlockOpener: function(pattern) {
		var expression = pattern.matched(3);
		if((this._getValue(expression) instanceof Array) && this._getValue(expression).__enum__ == null) {
			this.replacing = false;
			var endPattern = new EReg("{{/" + expression + "}}","g");
			if(endPattern.match(this.template)) this._replaceArray(this._getValue(expression),pattern,endPattern); else this.replacing = true;
		} else if(typeof(this._getValue(expression)) == "boolean") {
			this.replacing = false;
			var endPattern1 = new EReg("{{/" + expression + "\\?}}","g");
			if(endPattern1.match(this.template)) this._replaceCondition(this._getValue(expression),pattern,endPattern1); else this.replacing = true;
		} else if(Reflect.isObject(this._getValue(expression))) {
			this.stack.push({ name : expression, context : this.context});
			this.context = this._getValue(expression);
		}
	}
	,_replaceBlockCloser: function(pattern) {
		var expression = pattern.matched(3);
		if(this.stack.length > 0 && expression == this.stack[this.stack.length - 1].name) this.context = this.stack.pop().context;
	}
	,_replacePattern: function(pattern) {
		var value = "";
		var tag = pattern.matched(2);
		this.replacing = true;
		if(tag.length == 0) value = this._replaceVariable(pattern); else if(tag == "#") this._replaceBlockOpener(pattern); else if(tag == "/") this._replaceBlockCloser(pattern);
		if(this.replacing) this.template = pattern.replace(this.template,value);
	}
	,_replaceNext: function() {
		var pattern = new EReg("{{(([#/]?)([\\.\\w\\?]+))}}","");
		var replaced = false;
		if(pattern.match(this.template)) {
			this._replacePattern(pattern);
			replaced = true;
		}
		return replaced;
	}
	,__class__: mustache.Mustache
};
var newprojectdialog = {};
newprojectdialog.Category = function(_name,_element) {
	this.element = _element;
	this.subcategories = new haxe.ds.StringMap();
	this.items = new Array();
	this.name = _name;
};
$hxClasses["newprojectdialog.Category"] = newprojectdialog.Category;
newprojectdialog.Category.__name__ = ["newprojectdialog","Category"];
newprojectdialog.Category.prototype = {
	element: null
	,items: null
	,subcategories: null
	,position: null
	,name: null
	,parent: null
	,getCategory: function(name) {
		if(!this.subcategories.exists(name)) newprojectdialog.NewProjectDialog.createSubcategory(name,this);
		return this.subcategories.get(name);
	}
	,addItem: function(name,createProjectFunction,showCreateDirectoryOption,nameLocked) {
		if(nameLocked == null) nameLocked = false;
		if(showCreateDirectoryOption == null) showCreateDirectoryOption = true;
		this.items.push(new newprojectdialog.Item(name,createProjectFunction,showCreateDirectoryOption,nameLocked));
		newprojectdialog.NewProjectDialog.loadProjectCategory();
	}
	,getItems: function() {
		var itemNames = new Array();
		var _g = 0;
		var _g1 = this.items;
		while(_g < _g1.length) {
			var item = _g1[_g];
			++_g;
			itemNames.push(item.name);
		}
		return itemNames;
	}
	,select: function(item) {
		newprojectdialog.NewProjectDialog.updateListItems(this,item);
	}
	,getItem: function(name) {
		var currentItem = null;
		var _g = 0;
		var _g1 = this.items;
		while(_g < _g1.length) {
			var item = _g1[_g];
			++_g;
			if(name == item.name) currentItem = item;
		}
		return currentItem;
	}
	,setPosition: function(_position) {
		this.position = _position;
	}
	,getElement: function() {
		return this.element;
	}
	,__class__: newprojectdialog.Category
};
newprojectdialog.Item = function(_name,_createProjectFunction,_showCreateDirectoryOption,_nameLocked) {
	if(_nameLocked == null) _nameLocked = false;
	if(_showCreateDirectoryOption == null) _showCreateDirectoryOption = true;
	this.name = _name;
	this.showCreateDirectoryOption = _showCreateDirectoryOption;
	this.nameLocked = _nameLocked;
	this.createProjectFunction = _createProjectFunction;
};
$hxClasses["newprojectdialog.Item"] = newprojectdialog.Item;
newprojectdialog.Item.__name__ = ["newprojectdialog","Item"];
newprojectdialog.Item.prototype = {
	name: null
	,showCreateDirectoryOption: null
	,nameLocked: null
	,createProjectFunction: null
	,__class__: newprojectdialog.Item
};
newprojectdialog.NewProjectDialog = function() { };
$hxClasses["newprojectdialog.NewProjectDialog"] = newprojectdialog.NewProjectDialog;
newprojectdialog.NewProjectDialog.__name__ = ["newprojectdialog","NewProjectDialog"];
newprojectdialog.NewProjectDialog.load = function() {
	newprojectdialog.NewProjectDialog.modalDialog = new dialogs.ModalDialog("New Project");
	var button;
	var _this = window.document;
	button = _this.createElement("button");
	button.type = "button";
	button.className = "close";
	button.setAttribute("data-dismiss","modal");
	button.setAttribute("aria-hidden","true");
	button.innerHTML = "&times;";
	newprojectdialog.NewProjectDialog.modalDialog.getHeader().appendChild(button);
	newprojectdialog.NewProjectDialog.textfieldsWithCheckboxes = new haxe.ds.StringMap();
	newprojectdialog.NewProjectDialog.checkboxes = new haxe.ds.StringMap();
	newprojectdialog.NewProjectDialog.createPage1();
	newprojectdialog.NewProjectDialog.modalDialog.getBody().appendChild(newprojectdialog.NewProjectDialog.page1);
	newprojectdialog.NewProjectDialog.createPage2();
	newprojectdialog.NewProjectDialog.page2.style.display = "none";
	newprojectdialog.NewProjectDialog.modalDialog.getBody().appendChild(newprojectdialog.NewProjectDialog.page2);
	newprojectdialog.NewProjectDialog.backButton = bootstrap.ButtonManager.createButton("Back",true);
	newprojectdialog.NewProjectDialog.modalDialog.getFooter().appendChild(newprojectdialog.NewProjectDialog.backButton);
	newprojectdialog.NewProjectDialog.nextButton = bootstrap.ButtonManager.createButton("Next");
	newprojectdialog.NewProjectDialog.backButton.onclick = function(e) {
		if(newprojectdialog.NewProjectDialog.backButton.className.indexOf("disabled") == -1) newprojectdialog.NewProjectDialog.showPage1();
	};
	newprojectdialog.NewProjectDialog.nextButton.onclick = function(e1) {
		if(newprojectdialog.NewProjectDialog.nextButton.className.indexOf("disabled") == -1) newprojectdialog.NewProjectDialog.showPage2();
	};
	newprojectdialog.NewProjectDialog.modalDialog.getFooter().appendChild(newprojectdialog.NewProjectDialog.nextButton);
	var finishButton = bootstrap.ButtonManager.createButton("Finish",false,false,true);
	finishButton.onclick = function(e2) {
		if(newprojectdialog.NewProjectDialog.projectLocation.value == "") {
			newprojectdialog.NewProjectDialog.showPage2();
			newprojectdialog.NewProjectDialog.projectLocation.focus();
			Alertify.log("Please specify location for your projects");
		} else if(newprojectdialog.NewProjectDialog.page1.style.display != "none" || newprojectdialog.NewProjectDialog.projectName.value == "") newprojectdialog.NewProjectDialog.generateProjectName(newprojectdialog.NewProjectDialog.createProject); else newprojectdialog.NewProjectDialog.createProject();
	};
	newprojectdialog.NewProjectDialog.modalDialog.getFooter().appendChild(finishButton);
	var cancelButton = bootstrap.ButtonManager.createButton("Cancel",false,true);
	newprojectdialog.NewProjectDialog.modalDialog.getFooter().appendChild(cancelButton);
	var location = js.Browser.getLocalStorage().getItem("Location");
	if(location != null) newprojectdialog.NewProjectDialog.projectLocation.value = location;
	newprojectdialog.NewProjectDialog.loadData("Package");
	newprojectdialog.NewProjectDialog.loadData("Company");
	newprojectdialog.NewProjectDialog.loadData("License");
	newprojectdialog.NewProjectDialog.loadData("URL");
	newprojectdialog.NewProjectDialog.loadCheckboxState("Package");
	newprojectdialog.NewProjectDialog.loadCheckboxState("Company");
	newprojectdialog.NewProjectDialog.loadCheckboxState("License");
	newprojectdialog.NewProjectDialog.loadCheckboxState("URL");
	newprojectdialog.NewProjectDialog.loadCheckboxState("CreateDirectory");
	newprojectdialog.NewProjectDialog.lastProjectCategoryPath = js.Browser.getLocalStorage().getItem("lastProject");
};
newprojectdialog.NewProjectDialog.showPage1 = function() {
	new $(newprojectdialog.NewProjectDialog.page1).show(300);
	new $(newprojectdialog.NewProjectDialog.page2).hide(300);
	newprojectdialog.NewProjectDialog.backButton.className = "btn btn-default disabled";
	newprojectdialog.NewProjectDialog.nextButton.className = "btn btn-default";
};
newprojectdialog.NewProjectDialog.showPage2 = function() {
	newprojectdialog.NewProjectDialog.generateProjectName();
	new $(newprojectdialog.NewProjectDialog.page1).hide(300);
	new $(newprojectdialog.NewProjectDialog.page2).show(300);
	newprojectdialog.NewProjectDialog.backButton.className = "btn btn-default";
	newprojectdialog.NewProjectDialog.nextButton.className = "btn btn-default disabled";
};
newprojectdialog.NewProjectDialog.getCheckboxData = function(key) {
	var data = "";
	if(newprojectdialog.NewProjectDialog.checkboxes.get(key).checked) data = newprojectdialog.NewProjectDialog.textfieldsWithCheckboxes.get(key).value;
	return data;
};
newprojectdialog.NewProjectDialog.createProject = function() {
	if(newprojectdialog.NewProjectDialog.projectLocation.value != "" && newprojectdialog.NewProjectDialog.projectName.value != "") js.Node.require("fs").exists(newprojectdialog.NewProjectDialog.projectLocation.value,function(exists) {
		if(exists) {
			var item = newprojectdialog.NewProjectDialog.selectedCategory.getItem(newprojectdialog.NewProjectDialog.list.value);
			newprojectdialog.NewProjectDialog.saveProjectCategory();
			if(item.createProjectFunction != null) {
				var projectPackage = newprojectdialog.NewProjectDialog.getCheckboxData("Package");
				var projectCompany = newprojectdialog.NewProjectDialog.getCheckboxData("Company");
				var projectLicense = newprojectdialog.NewProjectDialog.getCheckboxData("License");
				var projectURL = newprojectdialog.NewProjectDialog.getCheckboxData("URL");
				item.createProjectFunction({ projectName : newprojectdialog.NewProjectDialog.projectName.value, projectLocation : newprojectdialog.NewProjectDialog.projectLocation.value, projectPackage : projectPackage, projectCompany : projectCompany, projectLicense : projectLicense, projectURL : projectURL, createDirectory : !newprojectdialog.NewProjectDialog.selectedCategory.getItem(newprojectdialog.NewProjectDialog.list.value).showCreateDirectoryOption || newprojectdialog.NewProjectDialog.createDirectoryForProject.checked});
				js.Browser.getLocalStorage().setItem("Location",newprojectdialog.NewProjectDialog.projectLocation.value);
			}
			newprojectdialog.NewProjectDialog.saveData("Package");
			newprojectdialog.NewProjectDialog.saveData("Company");
			newprojectdialog.NewProjectDialog.saveData("License");
			newprojectdialog.NewProjectDialog.saveData("URL");
			newprojectdialog.NewProjectDialog.saveCheckboxState("Package");
			newprojectdialog.NewProjectDialog.saveCheckboxState("Company");
			newprojectdialog.NewProjectDialog.saveCheckboxState("License");
			newprojectdialog.NewProjectDialog.saveCheckboxState("URL");
			newprojectdialog.NewProjectDialog.saveCheckboxState("CreateDirectory");
			newprojectdialog.NewProjectDialog.hide();
		}
	});
};
newprojectdialog.NewProjectDialog.saveProjectCategory = function() {
	var fullCategoryPath = "";
	var root = false;
	var parentCategory = newprojectdialog.NewProjectDialog.selectedCategory;
	while(!root) {
		fullCategoryPath = parentCategory.name + "/" + fullCategoryPath;
		if(parentCategory.parent != null) parentCategory = parentCategory.parent; else root = true;
	}
	fullCategoryPath += newprojectdialog.NewProjectDialog.list.value;
	js.Browser.getLocalStorage().setItem("lastProject",fullCategoryPath);
};
newprojectdialog.NewProjectDialog.generateProjectName = function(onGenerated) {
	if(newprojectdialog.NewProjectDialog.selectedCategory.getItem(newprojectdialog.NewProjectDialog.list.value).nameLocked == false) {
		var value = StringTools.replace(newprojectdialog.NewProjectDialog.list.value,"+","p");
		value = StringTools.replace(value,"#","sharp");
		value = StringTools.replace(value," ","");
		newprojectdialog.NewProjectDialog.generateFolderName(newprojectdialog.NewProjectDialog.projectLocation.value,value,1,onGenerated);
	} else {
		newprojectdialog.NewProjectDialog.projectName.value = newprojectdialog.NewProjectDialog.list.value;
		newprojectdialog.NewProjectDialog.updateHelpBlock();
		if(onGenerated != null) onGenerated();
	}
	if(newprojectdialog.NewProjectDialog.selectedCategory.getItem(newprojectdialog.NewProjectDialog.list.value).showCreateDirectoryOption) newprojectdialog.NewProjectDialog.createDirectoryForProject.parentElement.parentElement.style.display = "block"; else newprojectdialog.NewProjectDialog.createDirectoryForProject.parentElement.parentElement.style.display = "none";
	newprojectdialog.NewProjectDialog.projectName.disabled = newprojectdialog.NewProjectDialog.selectedCategory.getItem(newprojectdialog.NewProjectDialog.list.value).nameLocked;
};
newprojectdialog.NewProjectDialog.show = function() {
	if(newprojectdialog.NewProjectDialog.page1.style.display == "none") newprojectdialog.NewProjectDialog.backButton.click();
	if(newprojectdialog.NewProjectDialog.selectedCategory == null && newprojectdialog.NewProjectDialog.categoriesArray.length > 0) newprojectdialog.NewProjectDialog.categoriesArray[0].select(); else newprojectdialog.NewProjectDialog.selectedCategory.select(newprojectdialog.NewProjectDialog.list.value);
	newprojectdialog.NewProjectDialog.modalDialog.show();
};
newprojectdialog.NewProjectDialog.hide = function() {
	newprojectdialog.NewProjectDialog.modalDialog.hide();
};
newprojectdialog.NewProjectDialog.getCategory = function(name,position) {
	var category;
	if(!newprojectdialog.NewProjectDialog.categories.exists(name)) {
		category = newprojectdialog.NewProjectDialog.createCategory(name);
		newprojectdialog.NewProjectDialog.categories.set(name,category);
		category.setPosition(position);
		newprojectdialog.NewProjectDialog.addCategoryToDocument(category);
	} else {
		category = newprojectdialog.NewProjectDialog.categories.get(name);
		if(position != null && category.position != position) {
		}
	}
	if(position != null && category.position != position) {
		category.getElement().remove();
		newprojectdialog.NewProjectDialog.categories.remove(name);
		category.setPosition(position);
		newprojectdialog.NewProjectDialog.addCategoryToDocument(category);
		newprojectdialog.NewProjectDialog.categories.set(name,category);
	}
	return category;
};
newprojectdialog.NewProjectDialog.loadProjectCategory = function() {
	if(newprojectdialog.NewProjectDialog.lastProjectCategoryPath != null) {
		var categoryNames = newprojectdialog.NewProjectDialog.lastProjectCategoryPath.split("/");
		if(newprojectdialog.NewProjectDialog.categories.exists(categoryNames[0])) {
			var category = newprojectdialog.NewProjectDialog.categories.get(categoryNames[0]);
			if(categoryNames.length > 2) {
				var _g1 = 1;
				var _g = categoryNames.length - 1;
				while(_g1 < _g) {
					var i = _g1++;
					if(category.subcategories.exists(categoryNames[i])) {
						category = category.subcategories.get(categoryNames[i]);
						if(Lambda.has(category.getItems(),categoryNames[categoryNames.length - 1])) {
							category.select(categoryNames[categoryNames.length - 1]);
							newprojectdialog.NewProjectDialog.lastProjectCategoryPath = null;
							new $(category.element).children("ul.tree").show(300);
						}
					} else break;
				}
			} else if(Lambda.has(category.getItems(),categoryNames[categoryNames.length - 1])) {
				category.select(categoryNames[categoryNames.length - 1]);
				newprojectdialog.NewProjectDialog.lastProjectCategoryPath = null;
				new $(category.element).children("ul.tree").show(300);
			}
		}
	}
};
newprojectdialog.NewProjectDialog.addCategoryToDocument = function(category) {
	if(category.position != null && newprojectdialog.NewProjectDialog.categoriesArray.length > 0 && newprojectdialog.NewProjectDialog.tree.childNodes.length > 0) {
		var currentCategory;
		var added = false;
		var _g1 = 0;
		var _g = newprojectdialog.NewProjectDialog.categoriesArray.length;
		while(_g1 < _g) {
			var i = _g1++;
			currentCategory = newprojectdialog.NewProjectDialog.categoriesArray[i];
			if(currentCategory != category && currentCategory.position == null || category.position < currentCategory.position) {
				newprojectdialog.NewProjectDialog.tree.insertBefore(category.getElement(),currentCategory.getElement());
				newprojectdialog.NewProjectDialog.categoriesArray.splice(i,0,category);
				added = true;
				break;
			}
		}
		if(!added) {
			newprojectdialog.NewProjectDialog.tree.appendChild(category.getElement());
			newprojectdialog.NewProjectDialog.categoriesArray.push(category);
		}
	} else {
		newprojectdialog.NewProjectDialog.tree.appendChild(category.getElement());
		newprojectdialog.NewProjectDialog.categoriesArray.push(category);
	}
};
newprojectdialog.NewProjectDialog.generateFolderName = function(path,folder,n,onGenerated) {
	if(path != "" && folder != "") js.Node.require("fs").exists(js.Node.require("path").join(path,folder + (n == null?"null":"" + n)),function(exists) {
		if(exists) newprojectdialog.NewProjectDialog.generateFolderName(path,folder,n + 1,onGenerated); else {
			newprojectdialog.NewProjectDialog.projectName.value = folder + (n == null?"null":"" + n);
			newprojectdialog.NewProjectDialog.updateHelpBlock();
			if(onGenerated != null) onGenerated();
		}
	}); else {
		newprojectdialog.NewProjectDialog.projectName.value = folder + (n == null?"null":"" + n);
		newprojectdialog.NewProjectDialog.updateHelpBlock();
	}
};
newprojectdialog.NewProjectDialog.loadData = function(_text) {
	var text = js.Browser.getLocalStorage().getItem(_text);
	if(text != null) newprojectdialog.NewProjectDialog.textfieldsWithCheckboxes.get(_text).value = text;
};
newprojectdialog.NewProjectDialog.saveData = function(_text) {
	if(newprojectdialog.NewProjectDialog.checkboxes.get(_text).checked) {
		var value = newprojectdialog.NewProjectDialog.textfieldsWithCheckboxes.get(_text).value;
		if(value != "") js.Browser.getLocalStorage().setItem(_text,value);
	}
};
newprojectdialog.NewProjectDialog.loadCheckboxState = function(_text) {
	var text = js.Browser.getLocalStorage().getItem(_text + "Checkbox");
	if(text != null) newprojectdialog.NewProjectDialog.checkboxes.get(_text).checked = js.Node.parse(text);
};
newprojectdialog.NewProjectDialog.saveCheckboxState = function(_text) {
	js.Browser.getLocalStorage().setItem(_text + "Checkbox",js.Node.stringify(newprojectdialog.NewProjectDialog.checkboxes.get(_text).checked));
};
newprojectdialog.NewProjectDialog.createPage1 = function() {
	var _this = window.document;
	newprojectdialog.NewProjectDialog.page1 = _this.createElement("div");
	var well;
	var _this1 = window.document;
	well = _this1.createElement("div");
	well.id = "new-project-dialog-well";
	well.className = "well";
	well.style["float"] = "left";
	well.style.width = "50%";
	well.style.height = "250px";
	well.style.marginBottom = "0";
	newprojectdialog.NewProjectDialog.page1.appendChild(well);
	var _this2 = window.document;
	newprojectdialog.NewProjectDialog.tree = _this2.createElement("ul");
	newprojectdialog.NewProjectDialog.tree.className = "nav nav-list";
	well.appendChild(newprojectdialog.NewProjectDialog.tree);
	newprojectdialog.NewProjectDialog.list = newprojectdialog.NewProjectDialog.createList();
	newprojectdialog.NewProjectDialog.list.style["float"] = "left";
	newprojectdialog.NewProjectDialog.list.style.width = "50%";
	newprojectdialog.NewProjectDialog.list.style.height = "250px";
	newprojectdialog.NewProjectDialog.page1.appendChild(newprojectdialog.NewProjectDialog.list);
	newprojectdialog.NewProjectDialog.page1.appendChild((function($this) {
		var $r;
		var _this3 = window.document;
		$r = _this3.createElement("br");
		return $r;
	}(this)));
	var _this4 = window.document;
	newprojectdialog.NewProjectDialog.description = _this4.createElement("p");
	newprojectdialog.NewProjectDialog.description.style.width = "100%";
	newprojectdialog.NewProjectDialog.description.style.height = "50px";
	newprojectdialog.NewProjectDialog.description.style.overflow = "auto";
	newprojectdialog.NewProjectDialog.description.textContent = watchers.LocaleWatcher.getStringSync("Description");
	newprojectdialog.NewProjectDialog.description.setAttribute("localeString","Description");
	newprojectdialog.NewProjectDialog.page1.appendChild(newprojectdialog.NewProjectDialog.description);
	return newprojectdialog.NewProjectDialog.page1;
};
newprojectdialog.NewProjectDialog.createPage2 = function() {
	var _this = window.document;
	newprojectdialog.NewProjectDialog.page2 = _this.createElement("div");
	newprojectdialog.NewProjectDialog.page2.style.padding = "15px";
	var row;
	var _this1 = window.document;
	row = _this1.createElement("div");
	row.className = "row";
	var _this2 = window.document;
	newprojectdialog.NewProjectDialog.projectName = _this2.createElement("input");
	newprojectdialog.NewProjectDialog.projectName.type = "text";
	newprojectdialog.NewProjectDialog.projectName.className = "form-control";
	newprojectdialog.NewProjectDialog.projectName.placeholder = watchers.LocaleWatcher.getStringSync("Name");
	newprojectdialog.NewProjectDialog.projectName.style.width = "100%";
	row.appendChild(newprojectdialog.NewProjectDialog.projectName);
	newprojectdialog.NewProjectDialog.page2.appendChild(row);
	var _this3 = window.document;
	row = _this3.createElement("div");
	row.className = "row";
	var inputGroup;
	var _this4 = window.document;
	inputGroup = _this4.createElement("div");
	inputGroup.className = "input-group";
	inputGroup.style.display = "inline";
	row.appendChild(inputGroup);
	var _this5 = window.document;
	newprojectdialog.NewProjectDialog.projectLocation = _this5.createElement("input");
	newprojectdialog.NewProjectDialog.projectLocation.type = "text";
	newprojectdialog.NewProjectDialog.projectLocation.className = "form-control";
	newprojectdialog.NewProjectDialog.projectLocation.placeholder = watchers.LocaleWatcher.getStringSync("Location");
	newprojectdialog.NewProjectDialog.projectLocation.style.width = "80%";
	inputGroup.appendChild(newprojectdialog.NewProjectDialog.projectLocation);
	var browseButton;
	var _this6 = window.document;
	browseButton = _this6.createElement("button");
	browseButton.type = "button";
	browseButton.className = "btn btn-default";
	browseButton.textContent = watchers.LocaleWatcher.getStringSync("Browse...");
	browseButton.style.width = "20%";
	browseButton.onclick = function(e) {
		core.FileDialog.openFolder(function(path) {
			newprojectdialog.NewProjectDialog.projectLocation.value = path;
			newprojectdialog.NewProjectDialog.updateHelpBlock();
			js.Browser.getLocalStorage().setItem("Location",path);
		});
	};
	inputGroup.appendChild(browseButton);
	newprojectdialog.NewProjectDialog.page2.appendChild(row);
	newprojectdialog.NewProjectDialog.createTextWithCheckbox(newprojectdialog.NewProjectDialog.page2,"Package");
	newprojectdialog.NewProjectDialog.createTextWithCheckbox(newprojectdialog.NewProjectDialog.page2,"Company");
	newprojectdialog.NewProjectDialog.createTextWithCheckbox(newprojectdialog.NewProjectDialog.page2,"License");
	newprojectdialog.NewProjectDialog.createTextWithCheckbox(newprojectdialog.NewProjectDialog.page2,"URL");
	var _this7 = window.document;
	row = _this7.createElement("div");
	row.className = "row";
	var checkboxDiv;
	var _this8 = window.document;
	checkboxDiv = _this8.createElement("div");
	checkboxDiv.className = "checkbox";
	row.appendChild(checkboxDiv);
	var label;
	var _this9 = window.document;
	label = _this9.createElement("label");
	checkboxDiv.appendChild(label);
	var _this10 = window.document;
	newprojectdialog.NewProjectDialog.createDirectoryForProject = _this10.createElement("input");
	newprojectdialog.NewProjectDialog.createDirectoryForProject.type = "checkbox";
	newprojectdialog.NewProjectDialog.createDirectoryForProject.checked = true;
	label.appendChild(newprojectdialog.NewProjectDialog.createDirectoryForProject);
	newprojectdialog.NewProjectDialog.checkboxes.set("CreateDirectory",newprojectdialog.NewProjectDialog.createDirectoryForProject);
	newprojectdialog.NewProjectDialog.createDirectoryForProject.onchange = function(e1) {
		newprojectdialog.NewProjectDialog.updateHelpBlock();
	};
	label.appendChild(window.document.createTextNode("Create directory for project"));
	newprojectdialog.NewProjectDialog.page2.appendChild(row);
	var _this11 = window.document;
	row = _this11.createElement("div");
	var _this12 = window.document;
	newprojectdialog.NewProjectDialog.helpBlock = _this12.createElement("p");
	newprojectdialog.NewProjectDialog.helpBlock.className = "help-block";
	row.appendChild(newprojectdialog.NewProjectDialog.helpBlock);
	newprojectdialog.NewProjectDialog.projectLocation.onchange = function(e2) {
		newprojectdialog.NewProjectDialog.updateHelpBlock();
		newprojectdialog.NewProjectDialog.generateFolderName(newprojectdialog.NewProjectDialog.projectLocation.value,newprojectdialog.NewProjectDialog.projectName.value,1);
	};
	newprojectdialog.NewProjectDialog.projectName.onchange = function(e3) {
		newprojectdialog.NewProjectDialog.projectName.value = HxOverrides.substr(newprojectdialog.NewProjectDialog.projectName.value,0,1).toUpperCase() + HxOverrides.substr(newprojectdialog.NewProjectDialog.projectName.value,1,null);
		newprojectdialog.NewProjectDialog.updateHelpBlock();
	};
	newprojectdialog.NewProjectDialog.page2.appendChild(row);
	return newprojectdialog.NewProjectDialog.page2;
};
newprojectdialog.NewProjectDialog.updateHelpBlock = function() {
	if(newprojectdialog.NewProjectDialog.projectLocation.value != "") {
		var str = "";
		if((!newprojectdialog.NewProjectDialog.selectedCategory.getItem(newprojectdialog.NewProjectDialog.list.value).showCreateDirectoryOption || newprojectdialog.NewProjectDialog.createDirectoryForProject.checked == true) && newprojectdialog.NewProjectDialog.projectName.value != "") str = newprojectdialog.NewProjectDialog.projectName.value;
		newprojectdialog.NewProjectDialog.helpBlock.innerText = watchers.LocaleWatcher.getStringSync("Project will be created in: ") + js.Node.require("path").join(newprojectdialog.NewProjectDialog.projectLocation.value,str);
	} else newprojectdialog.NewProjectDialog.helpBlock.innerText = "";
};
newprojectdialog.NewProjectDialog.createTextWithCheckbox = function(_page2,_text) {
	var row;
	var _this = window.document;
	row = _this.createElement("div");
	row.className = "row";
	var inputGroup;
	var _this1 = window.document;
	inputGroup = _this1.createElement("div");
	inputGroup.className = "input-group";
	row.appendChild(inputGroup);
	var inputGroupAddon;
	var _this2 = window.document;
	inputGroupAddon = _this2.createElement("span");
	inputGroupAddon.className = "input-group-addon";
	inputGroup.appendChild(inputGroupAddon);
	var checkbox;
	var _this3 = window.document;
	checkbox = _this3.createElement("input");
	checkbox.type = "checkbox";
	checkbox.checked = true;
	inputGroupAddon.appendChild(checkbox);
	newprojectdialog.NewProjectDialog.checkboxes.set(_text,checkbox);
	var text;
	var _this4 = window.document;
	text = _this4.createElement("input");
	text.type = "text";
	text.className = "form-control";
	text.placeholder = watchers.LocaleWatcher.getStringSync(_text);
	newprojectdialog.NewProjectDialog.textfieldsWithCheckboxes.set(_text,text);
	checkbox.onchange = function(e) {
		if(checkbox.checked) text.disabled = false; else text.disabled = true;
	};
	inputGroup.appendChild(text);
	_page2.appendChild(row);
};
newprojectdialog.NewProjectDialog.createCategory = function(text) {
	var li;
	var _this = window.document;
	li = _this.createElement("li");
	var category = new newprojectdialog.Category(text,li);
	var a;
	var _this1 = window.document;
	a = _this1.createElement("a");
	a.href = "#";
	a.addEventListener("click",function(e) {
		newprojectdialog.NewProjectDialog.updateListItems(category);
	});
	var span;
	var _this2 = window.document;
	span = _this2.createElement("span");
	span.className = "glyphicon glyphicon-folder-open";
	a.appendChild(span);
	var _this3 = window.document;
	span = _this3.createElement("span");
	span.textContent = watchers.LocaleWatcher.getStringSync(text);
	span.setAttribute("localeString",text);
	span.style.marginLeft = "5px";
	a.appendChild(span);
	li.appendChild(a);
	return category;
};
newprojectdialog.NewProjectDialog.createSubcategory = function(text,category) {
	var a;
	a = js.Boot.__cast(category.element.getElementsByTagName("a")[0] , HTMLAnchorElement);
	a.className = "tree-toggler nav-header";
	a.onclick = function(e) {
		new $(category.element).children("ul.tree").toggle(300);
	};
	var ul;
	var _this = window.document;
	ul = _this.createElement("ul");
	ul.className = "nav nav-list tree";
	category.element.appendChild(ul);
	category.element.onclick = function(e1) {
		var $it0 = category.subcategories.keys();
		while( $it0.hasNext() ) {
			var subcategory = $it0.next();
			ul.appendChild(category.subcategories.get(subcategory).element);
		}
		e1.stopPropagation();
		e1.preventDefault();
		category.element.onclick = null;
		new $(ul).show(300);
	};
	var subcategory1 = newprojectdialog.NewProjectDialog.createCategory(text);
	subcategory1.parent = category;
	category.subcategories.set(text,subcategory1);
};
newprojectdialog.NewProjectDialog.updateListItems = function(category,item) {
	newprojectdialog.NewProjectDialog.selectedCategory = category;
	new $(newprojectdialog.NewProjectDialog.list).children().remove();
	newprojectdialog.NewProjectDialog.setListItems(newprojectdialog.NewProjectDialog.list,category.getItems(),item);
	newprojectdialog.NewProjectDialog.checkSelectedOptions();
};
newprojectdialog.NewProjectDialog.createList = function() {
	var select;
	var _this = window.document;
	select = _this.createElement("select");
	select.size = 10;
	select.onchange = function(e) {
		newprojectdialog.NewProjectDialog.checkSelectedOptions();
	};
	select.ondblclick = function(e1) {
		newprojectdialog.NewProjectDialog.showPage2();
	};
	return select;
};
newprojectdialog.NewProjectDialog.checkSelectedOptions = function() {
	if(newprojectdialog.NewProjectDialog.list.selectedOptions.length > 0) {
		var option;
		option = js.Boot.__cast(newprojectdialog.NewProjectDialog.list.selectedOptions[0] , HTMLOptionElement);
	}
};
newprojectdialog.NewProjectDialog.setListItems = function(list,items,selectedItem) {
	var _g = 0;
	while(_g < items.length) {
		var item = items[_g];
		++_g;
		list.appendChild(newprojectdialog.NewProjectDialog.createListItem(item));
	}
	list.selectedIndex = 0;
	newprojectdialog.NewProjectDialog.checkSelectedOptions();
};
newprojectdialog.NewProjectDialog.createListItem = function(text) {
	var option;
	var _this = window.document;
	option = _this.createElement("option");
	option.textContent = watchers.LocaleWatcher.getStringSync(text);
	option.setAttribute("localeString",text);
	option.value = text;
	return option;
};
var openflproject = {};
openflproject.CreateOpenFLProject = function() { };
$hxClasses["openflproject.CreateOpenFLProject"] = openflproject.CreateOpenFLProject;
openflproject.CreateOpenFLProject.__name__ = ["openflproject","CreateOpenFLProject"];
openflproject.CreateOpenFLProject.createOpenFLProject = function(params,path,onComplete) {
	var processParams = ["run","lime","create"].concat(params);
	core.ProcessHelper.runProcess("haxelib",processParams,path,onComplete,function(code,stdout,stderr) {
		Alertify.error(["haxelib"].concat(processParams).join(" ") + " " + (code == null?"null":"" + code));
		if(stdout != "") Alertify.error("stdout:\n" + stdout);
		if(stderr != "") Alertify.error("stderr:\n" + stderr);
	});
};
openflproject.OpenFLProject = function() { };
$hxClasses["openflproject.OpenFLProject"] = openflproject.OpenFLProject;
openflproject.OpenFLProject.__name__ = ["openflproject","OpenFLProject"];
openflproject.OpenFLProject.load = function() {
	newprojectdialog.NewProjectDialog.getCategory("OpenFL",2).addItem("OpenFL Project",openflproject.OpenFLProject.createOpenFLProject,false);
	newprojectdialog.NewProjectDialog.getCategory("OpenFL").addItem("OpenFL Extension",openflproject.OpenFLProject.createOpenFLExtension,false);
	var samples = ["ActuateExample","AddingAnimation","AddingText","DisplayingABitmap","HandlingKeyboardEvents","HandlingMouseEvent","HerokuShaders","PiratePig","PlayingSound","SimpleBox2D","SimpleOpenGLView"];
	var _g = 0;
	while(_g < samples.length) {
		var sample = samples[_g];
		++_g;
		newprojectdialog.NewProjectDialog.getCategory("OpenFL").getCategory("Samples").addItem(sample,function(data) {
			openflproject.OpenFLProject.createOpenFLProject(data,true);
		},false,true);
	}
};
openflproject.OpenFLProject.createOpenFLProject = function(data,sample) {
	if(sample == null) sample = false;
	var params;
	if(!sample) {
		var str = "";
		if(data.projectPackage != "") str = data.projectPackage + ".";
		params = ["openfl:project","\"" + str + data.projectName + "\""];
		if(data.projectCompany != "") params.push("\"" + data.projectCompany + "\"");
	} else params = [data.projectName];
	openflproject.CreateOpenFLProject.createOpenFLProject(params,data.projectLocation,function() {
		var pathToProject = js.Node.require("path").join(data.projectLocation,data.projectName);
		openflproject.OpenFLProject.createProject(data);
		tabmanager.TabManager.openFileInNewTab(js.Node.require("path").join(pathToProject,"Source","Main.hx"));
	});
};
openflproject.OpenFLProject.createOpenFLExtension = function(data) {
	openflproject.CreateOpenFLProject.createOpenFLProject(["extension",data.projectName],data.projectLocation,function() {
		openflproject.OpenFLProject.createProject(data);
	});
};
openflproject.OpenFLProject.createProject = function(data) {
	var pathToProject = js.Node.require("path").join(data.projectLocation,data.projectName);
	var project = new projectaccess.Project();
	project.name = data.projectName;
	project.projectPackage = data.projectPackage;
	project.company = data.projectCompany;
	project.license = data.projectLicense;
	project.url = data.projectURL;
	project.type = 1;
	project.openFLTarget = "flash";
	projectaccess.ProjectAccess.path = pathToProject;
	project.buildActionCommand = ["haxelib","run","lime","build","\"%path%\"",project.openFLTarget,"--connect","5000"].join(" ");
	project.runActionType = 2;
	project.runActionText = ["haxelib","run","lime","run","\"%path%\"",project.openFLTarget].join(" ");
	projectaccess.ProjectAccess.currentProject = project;
	projectaccess.ProjectAccess.save(function() {
		var path = js.Node.require("path").join(pathToProject,"project.hide");
		openproject.OpenProject.openProject(path);
	});
};
openflproject.OpenFLTools = function() { };
$hxClasses["openflproject.OpenFLTools"] = openflproject.OpenFLTools;
openflproject.OpenFLTools.__name__ = ["openflproject","OpenFLTools"];
openflproject.OpenFLTools.getParams = function(path,target,onLoaded) {
	core.ProcessHelper.runProcess("haxelib",["run","lime","display",target],path,function(stdout,stderr) {
		if(onLoaded != null) onLoaded(stdout);
		openflproject.OpenFLTools.printStderr(stderr);
	},function(code,stdout1,stderr1) {
		Alertify.error("OpenFL tools error. OpenFL may be not installed. Please update OpenFL.(haxelib upgrade)");
		Alertify.error("OpenFL tools process exit code " + code);
		openflproject.OpenFLTools.printStderr(stderr1);
	});
};
openflproject.OpenFLTools.printStderr = function(stderr) {
	if(stderr != "") Alertify.error("OpenFL tools stderr: " + stderr);
};
var openproject = {};
openproject.OpenFL = function() { };
$hxClasses["openproject.OpenFL"] = openproject.OpenFL;
openproject.OpenFL.__name__ = ["openproject","OpenFL"];
openproject.OpenFL.open = function(path) {
	var pathToProject = js.Node.require("path").dirname(path);
	var project = new projectaccess.Project();
	var pos = pathToProject.lastIndexOf(js.Node.require("path").sep);
	project.name = HxOverrides.substr(pathToProject,pos,null);
	project.type = 1;
	project.openFLTarget = "flash";
	projectaccess.ProjectAccess.path = pathToProject;
	project.buildActionCommand = ["haxelib","run","lime","build","\"%path%\"",project.openFLTarget,"--connect","5000"].join(" ");
	project.runActionType = 2;
	project.runActionText = ["haxelib","run","lime","run","\"%path%\"",project.openFLTarget].join(" ");
	var pathToProjectHide = js.Node.require("path").join(pathToProject,"project.hide");
	projectaccess.ProjectAccess.currentProject = project;
	projectaccess.ProjectOptions.updateProjectOptions();
	projectaccess.ProjectAccess.save((function(f,a1,a2) {
		return function() {
			return f(a1,a2);
		};
	})(filetree.FileTree.load,project.name,pathToProject));
	core.Splitter.show();
	js.Browser.getLocalStorage().setItem("pathToLastProject",pathToProjectHide);
	core.RecentProjectsList.add(pathToProjectHide);
};
openproject.OpenFL.parseOpenFLDisplayParameters = function(pathToProject,target,onComplete) {
	openflproject.OpenFLTools.getParams(pathToProject,target,function(stdout) {
		var args = [];
		var currentLine;
		var _g = 0;
		var _g1 = stdout.split("\n");
		while(_g < _g1.length) {
			var line = _g1[_g];
			++_g;
			currentLine = StringTools.trim(line);
			if(!StringTools.startsWith(currentLine,"#")) args.push(currentLine);
		}
		onComplete(args);
	});
};
openproject.OpenProject = function() { };
$hxClasses["openproject.OpenProject"] = openproject.OpenProject;
openproject.OpenProject.__name__ = ["openproject","OpenProject"];
openproject.OpenProject.openProject = function(pathToProject,project) {
	if(project == null) project = false;
	if(pathToProject == null) {
		if(project) core.FileDialog.openFile(openproject.OpenProject.parseProject,".hide,.lime,.xml,.hxml"); else core.FileDialog.openFile(openproject.OpenProject.parseProject);
	} else openproject.OpenProject.checkIfFileExists(pathToProject);
};
openproject.OpenProject.checkIfFileExists = function(path) {
	js.Node.require("fs").exists(path,function(exists) {
		if(exists) openproject.OpenProject.parseProject(path); else console.log("previously opened project: " + path + " was not found");
	});
};
openproject.OpenProject.parseProject = function(path) {
	console.log("open: " + path);
	openproject.OpenProject.closeProject(true);
	var filename = js.Node.require("path").basename(path);
	switch(filename) {
	case "project.hide":
		core.OutlinePanel.clearFields();
		core.OutlinePanel.update();
		var options = { };
		options.encoding = "utf8";
		js.Node.require("fs").readFile(path,options,function(error,data) {
			var pathToProject = js.Node.require("path").dirname(path);
			projectaccess.ProjectAccess.currentProject = openproject.OpenProject.parseProjectData(data);
			projectaccess.ProjectAccess.path = pathToProject;
			parser.ClasspathWalker.parseProjectArguments();
			var loadedFilesCount = 0;
			var totalFilesCount;
			if(projectaccess.ProjectAccess.currentProject.files == null) projectaccess.ProjectAccess.currentProject.files = []; else {
				totalFilesCount = projectaccess.ProjectAccess.currentProject.files.length;
				var _g = 0;
				var _g1 = projectaccess.ProjectAccess.currentProject.files;
				while(_g < _g1.length) {
					var file = _g1[_g];
					++_g;
					var fullPath = [js.Node.require("path").join(pathToProject,file)];
					js.Node.require("fs").exists(fullPath[0],(function(fullPath) {
						return function(exists) {
							if(exists) tabmanager.TabManager.openFileInNewTab(fullPath[0],false,(function() {
								return function() {
									loadedFilesCount++;
									if(loadedFilesCount == totalFilesCount) {
										var activeFile = projectaccess.ProjectAccess.currentProject.activeFile;
										if(activeFile != null) {
											var fullPathToActiveFile = js.Node.require("path").join(pathToProject,activeFile);
											js.Node.require("fs").exists(fullPathToActiveFile,(function() {
												return function(exists1) {
													if(exists1) {
														tabmanager.TabManager.selectDoc(fullPathToActiveFile);
														cm.Editor.editor.focus();
													}
												};
											})());
										}
									}
								};
							})());
						};
					})(fullPath));
				}
			}
			if(projectaccess.ProjectAccess.currentProject.hiddenItems == null) projectaccess.ProjectAccess.currentProject.hiddenItems = [];
			if(projectaccess.ProjectAccess.currentProject.showHiddenItems == null) projectaccess.ProjectAccess.currentProject.showHiddenItems = false;
			projectaccess.ProjectOptions.updateProjectOptions();
			filetree.FileTree.load(projectaccess.ProjectAccess.currentProject.name,pathToProject);
			core.Splitter.show();
			js.Browser.getLocalStorage().setItem("pathToLastProject",path);
			core.RecentProjectsList.add(path);
		});
		break;
	default:
		var extension = js.Node.require("path").extname(filename);
		switch(extension) {
		case ".hxml":
			core.OutlinePanel.clearFields();
			core.OutlinePanel.update();
			var pathToProject1 = js.Node.require("path").dirname(path);
			var project = new projectaccess.Project();
			var pos = pathToProject1.lastIndexOf(js.Node.require("path").sep);
			project.name = HxOverrides.substr(pathToProject1,pos,null);
			project.type = 2;
			projectaccess.ProjectAccess.path = pathToProject1;
			project.main = js.Node.require("path").basename(path);
			projectaccess.ProjectAccess.currentProject = project;
			projectaccess.ProjectOptions.updateProjectOptions();
			var pathToProjectHide = js.Node.require("path").join(pathToProject1,"project.hide");
			projectaccess.ProjectAccess.save(function() {
				filetree.FileTree.load(project.name,pathToProject1);
			});
			core.Splitter.show();
			js.Browser.getLocalStorage().setItem("pathToLastProject",pathToProjectHide);
			core.RecentProjectsList.add(pathToProjectHide);
			break;
		case ".lime":case ".xml":
			core.OutlinePanel.clearFields();
			core.OutlinePanel.update();
			var options1 = { };
			options1.encoding = "utf8";
			js.Node.require("fs").readFile(path,options1,function(error1,data1) {
				if(error1 == null) {
					var xml = Xml.parse(data1);
					var fast = new haxe.xml.Fast(xml);
					if(fast.hasNode.resolve("project")) openproject.OpenFL.open(path); else Alertify.error("This is not an OpenFL project. OpenFL project xml should have 'project' node");
				} else {
					console.log(error1);
					Alertify.error("Can't open file: " + path + "\n" + error1);
				}
			});
			break;
		default:
		}
		tabmanager.TabManager.openFileInNewTab(path);
	}
};
openproject.OpenProject.searchForLastProject = function() {
	var pathToLastProject = js.Browser.getLocalStorage().getItem("pathToLastProject");
	if(pathToLastProject != null) openproject.OpenProject.openProject(pathToLastProject);
};
openproject.OpenProject.closeProject = function(sync) {
	if(sync == null) sync = false;
	if(projectaccess.ProjectAccess.path != null) {
		projectaccess.ProjectAccess.save(openproject.OpenProject.updateProjectData,sync);
		tabmanager.TabManager.closeAll();
	} else openproject.OpenProject.updateProjectData();
};
openproject.OpenProject.updateProjectData = function() {
	projectaccess.ProjectAccess.path = null;
	core.Splitter.hide();
	js.Browser.getLocalStorage().removeItem("pathToLastProject");
};
openproject.OpenProject.parseProjectData = function(data) {
	var project = null;
	try {
		project = tjson.TJSON.parse(data);
	} catch( unknown ) {
		console.log(unknown);
		console.log(data);
		project = js.Node.parse(data);
	}
	return project;
};
var parser = {};
parser.ClassParser = function() { };
$hxClasses["parser.ClassParser"] = parser.ClassParser;
parser.ClassParser.__name__ = ["parser","ClassParser"];
parser.ClassParser.parse = function(data,path) {
	var input = byte.js._ByteData.ByteData_Impl_.ofString(data);
	var parser = new haxeparser.HaxeParser(input,path);
	var ast = null;
	try {
		ast = parser.parse();
	} catch( $e0 ) {
		if( js.Boot.__instanceof($e0,hxparse.NoMatch) ) {
			var e = $e0;
		} else if( js.Boot.__instanceof($e0,hxparse.Unexpected) ) {
			var e1 = $e0;
		} else {
		var e2 = $e0;
		}
	}
	return ast;
};
parser.ClassParser.processFile = function(data,path,std) {
	var ast = parser.ClassParser.parse(data,path);
	var mainClass = js.Node.require("path").basename(path,".hx");
	if(ast != null) parser.ClassParser.parseDeclarations(ast,mainClass,std); else {
		var filePackage = parser.RegexParser.getFilePackage(data);
		var typeDeclarations = parser.RegexParser.getTypeDeclarations(data);
		var packages;
		if(filePackage.filePackage != null) packages = filePackage.filePackage.split("."); else packages = [];
		var _g = 0;
		while(_g < typeDeclarations.length) {
			var item = typeDeclarations[_g];
			++_g;
			var className = parser.ClassParser.resolveClassName(packages,mainClass,item.name);
			parser.ClassParser.addClassName(className,std);
		}
	}
};
parser.ClassParser.parseDeclarations = function(ast,mainClass,std) {
	var _g = 0;
	var _g1 = ast.decls;
	while(_g < _g1.length) {
		var decl = _g1[_g];
		++_g;
		{
			var _g2 = decl.decl;
			switch(_g2[1]) {
			case 3:
				var mode = _g2[3];
				var sl = _g2[2];
				break;
			case 5:
				var path = _g2[2];
				break;
			case 2:
				var data = _g2[2];
				var className = parser.ClassParser.resolveClassName(ast.pack,mainClass,data.name);
				parser.ClassParser.addClassName(className,std);
				break;
			case 0:
				var data1 = _g2[2];
				var className1 = parser.ClassParser.resolveClassName(ast.pack,mainClass,data1.name);
				parser.ClassParser.processClass(className1,data1);
				parser.ClassParser.addClassName(className1,std);
				break;
			case 1:
				var data2 = _g2[2];
				var className2 = parser.ClassParser.resolveClassName(ast.pack,mainClass,data2.name);
				parser.ClassParser.addClassName(className2,std);
				break;
			case 4:
				var data3 = _g2[2];
				var className3 = parser.ClassParser.resolveClassName(ast.pack,mainClass,data3.name);
				parser.ClassParser.addClassName(className3,std);
				break;
			}
		}
	}
};
parser.ClassParser.processClass = function(className,type) {
	var completions = [];
	var _g1 = 0;
	var _g = type.data.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(parser.ClassParser.getScope(type.data[i])) completions.push(type.data[i].name);
	}
	if(completions.length > 0) parser.ClassParser.classCompletions.set(className,completions);
};
parser.ClassParser.getScope = function(field) {
	var isPublic = false;
	var access = field.access;
	var _g = 0;
	while(_g < access.length) {
		var accessType = access[_g];
		++_g;
		switch(accessType[1]) {
		case 0:
			isPublic = true;
			break;
		case 2:
			break;
		case 6:
			break;
		case 5:
			break;
		case 4:
			break;
		case 3:
			break;
		case 1:
			break;
		}
	}
	return isPublic;
};
parser.ClassParser.resolveClassName = function(pack,mainClass,name) {
	var classPackage = pack.slice();
	if(name == mainClass) classPackage.push(name); else {
		classPackage.push(mainClass);
		classPackage.push(name);
	}
	var className = classPackage.join(".");
	return className;
};
parser.ClassParser.addClassName = function(name,std) {
	var list;
	if(name.indexOf(".") == -1) {
		if(std) list = parser.ClassParser.haxeStdTopLevelClassList; else list = parser.ClassParser.topLevelClassList;
		if(HxOverrides.indexOf(list,name,0) == -1) list.push(name);
	} else {
		if(std) list = parser.ClassParser.haxeStdImports; else list = parser.ClassParser.importsList;
		if(HxOverrides.indexOf(list,name,0) == -1) list.push(name);
	}
};
parser.ClasspathWalker = function() { };
$hxClasses["parser.ClasspathWalker"] = parser.ClasspathWalker;
parser.ClasspathWalker.__name__ = ["parser","ClasspathWalker"];
parser.ClasspathWalker.load = function() {
	var localStorage2 = js.Browser.getLocalStorage();
	var paths = [js.Node.process.env.HAXEPATH,js.Node.process.env.HAXE_STD_PATH,js.Node.process.env.HAXE_HOME];
	if(localStorage2 != null) {
		var x = localStorage2.getItem("pathToHaxe");
		paths.splice(0,0,x);
	}
	var _g = core.Utils.os;
	switch(_g) {
	case 0:
		paths.push("C:/HaxeToolkit/haxe");
		break;
	case 1:case 2:
		paths.push("/usr/lib/haxe");
		break;
	default:
	}
	var _g1 = 0;
	while(_g1 < paths.length) {
		var envVar = paths[_g1];
		++_g1;
		if(envVar != null) {
			parser.ClasspathWalker.pathToHaxeStd = parser.ClasspathWalker.getHaxeStdFolder(envVar);
			if(parser.ClasspathWalker.pathToHaxeStd != null) {
				localStorage2.setItem("pathToHaxe",parser.ClasspathWalker.pathToHaxeStd);
				break;
			}
		}
	}
	if(parser.ClasspathWalker.pathToHaxeStd == null) parser.ClasspathWalker.showHaxeDirectoryDialog(); else parser.ClasspathWalker.parseClasspath(parser.ClasspathWalker.pathToHaxeStd,true);
};
parser.ClasspathWalker.showHaxeDirectoryDialog = function() {
	var localStorage2 = js.Browser.getLocalStorage();
	var currentLocation = "";
	var pathToHaxe = localStorage2.getItem("pathToHaxe");
	if(pathToHaxe != null) currentLocation = pathToHaxe;
	dialogs.DialogManager.showBrowseFolderDialog("Please specify path to Haxe compiler(parent folder of std): ",function(path) {
		parser.ClasspathWalker.pathToHaxeStd = parser.ClasspathWalker.getHaxeStdFolder(path);
		if(parser.ClasspathWalker.pathToHaxeStd != null) {
			parser.ClasspathWalker.parseClasspath(parser.ClasspathWalker.pathToHaxeStd,true);
			localStorage2.setItem("pathToHaxe",parser.ClasspathWalker.pathToHaxeStd);
			dialogs.DialogManager.hide();
		} else Alertify.error(watchers.LocaleWatcher.getStringSync("Can't find 'std' folder in specified path"));
	},currentLocation,"Download Haxe","http://haxe.org/download");
};
parser.ClasspathWalker.getHaxeStdFolder = function(path) {
	var pathToStd = null;
	if(js.Node.require("fs").existsSync(path)) {
		if(js.Node.require("fs").existsSync(js.Node.require("path").join(path,"Std.hx"))) pathToStd = path; else {
			path = js.Node.require("path").join(path,"std");
			if(js.Node.require("fs").existsSync(path)) pathToStd = parser.ClasspathWalker.getHaxeStdFolder(path);
		}
	}
	return pathToStd;
};
parser.ClasspathWalker.parseProjectArguments = function() {
	parser.ClassParser.classCompletions = new haxe.ds.StringMap();
	parser.ClassParser.filesList = [];
	parser.ClassParser.topLevelClassList = [];
	parser.ClassParser.importsList = [];
	if(projectaccess.ProjectAccess.path != null) {
		var project = projectaccess.ProjectAccess.currentProject;
		var _g = project.type;
		switch(_g) {
		case 0:case 2:
			var path;
			if(project.type == 0) path = js.Node.require("path").join(projectaccess.ProjectAccess.path,project.targetData[project.target].pathToHxml); else path = js.Node.require("path").join(projectaccess.ProjectAccess.path,project.main);
			var options = { };
			options.encoding = "utf8";
			var data = js.Node.require("fs").readFileSync(path,options);
			parser.ClasspathWalker.getClasspaths(data.split("\n"));
			break;
		case 1:
			openflproject.OpenFLTools.getParams(projectaccess.ProjectAccess.path,project.openFLTarget,function(stdout) {
				parser.ClasspathWalker.getClasspaths(stdout.split("\n"));
			});
			break;
		default:
		}
	}
	parser.ClasspathWalker.walkProjectDirectory(projectaccess.ProjectAccess.path);
};
parser.ClasspathWalker.getFileDirectory = function(relativePath) {
	var directory = "";
	if(relativePath.indexOf("/") != -1) directory = relativePath.substring(0,relativePath.lastIndexOf("/")); else if(relativePath.indexOf("\\") != -1) directory = relativePath.substring(0,relativePath.lastIndexOf("\\"));
	return directory;
};
parser.ClasspathWalker.getClasspaths = function(data) {
	var classpaths = [];
	var _g = 0;
	var _g1 = parser.ClasspathWalker.parseArg(data,"-cp");
	while(_g < _g1.length) {
		var arg = _g1[_g];
		++_g;
		var classpath = js.Node.require("path").resolve(projectaccess.ProjectAccess.path,arg);
		classpaths.push(classpath);
	}
	var _g2 = 0;
	while(_g2 < classpaths.length) {
		var path = classpaths[_g2];
		++_g2;
		parser.ClasspathWalker.parseClasspath(path);
	}
	var libs = parser.ClasspathWalker.parseArg(data,"-lib");
	parser.ClasspathWalker.processHaxelibs(libs,parser.ClasspathWalker.parseClasspath);
};
parser.ClasspathWalker.processHaxelibs = function(libs,onPath) {
	var _g = 0;
	while(_g < libs.length) {
		var arg = libs[_g];
		++_g;
		core.ProcessHelper.runProcess("haxelib",["path",arg],null,(function() {
			return function(stdout,stderr) {
				var _g1 = 0;
				var _g2 = stdout.split("\n");
				while(_g1 < _g2.length) {
					var path = [_g2[_g1]];
					++_g1;
					if(path[0].indexOf(js.Node.require("path").sep) != -1) {
						path[0] = StringTools.trim(path[0]);
						path[0] = js.Node.require("path").normalize(path[0]);
						js.Node.require("fs").exists(path[0],(function(path) {
							return function(exists) {
								if(exists) onPath(path[0],false);
							};
						})(path));
					}
				}
			};
		})());
	}
};
parser.ClasspathWalker.parseArg = function(args,type) {
	var result = [];
	var _g = 0;
	while(_g < args.length) {
		var arg = args[_g];
		++_g;
		arg = StringTools.trim(arg);
		if(StringTools.startsWith(arg,type)) result.push(HxOverrides.substr(arg,type.length + 1,null));
	}
	return result;
};
parser.ClasspathWalker.parseClasspath = function(path,std) {
	if(std == null) std = false;
	if(Main.sync) {
		var _g = 0;
		var _g1 = Walkdir.walkSync(path);
		while(_g < _g1.length) {
			var pathToFile = _g1[_g];
			++_g;
			var stat = js.Node.require("fs").lstatSync(pathToFile);
			if(stat.isFile()) parser.ClasspathWalker.processFile(pathToFile,std);
		}
	} else {
		var emitter = Walkdir.walk(path,{ });
		emitter.on("file",function(pathToFile1,stat1) {
			parser.ClasspathWalker.processFile(pathToFile1,std);
		});
		emitter.on("error",function(pathToFile2,stat2) {
			console.log(pathToFile2);
		});
	}
};
parser.ClasspathWalker.processFile = function(path,std) {
	parser.ClasspathWalker.addFile(path,std);
	var options = { };
	options.encoding = "utf8";
	if(js.Node.require("path").extname(path) == ".hx") js.Node.require("fs").readFile(path,options,function(error,data) {
		if(error == null) parser.ClassParser.processFile(data,path,std);
	});
};
parser.ClasspathWalker.getFileIndex = function(pathToFile,list) {
	var index = -1;
	var _g1 = 0;
	var _g = list.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(list[i].path == pathToFile) {
			index = i;
			break;
		}
	}
	return index;
};
parser.ClasspathWalker.addFile = function(path,std) {
	if(std == null) std = false;
	var relativePath;
	var list;
	if(!watchers.SettingsWatcher.isItemInIgnoreList(path) && !projectaccess.ProjectAccess.isItemInIgnoreList(path)) {
		if(std) list = parser.ClassParser.haxeStdFileList; else list = parser.ClassParser.filesList;
		if(projectaccess.ProjectAccess.path != null && (core.Utils.os == 0 || !std)) {
			relativePath = js.Node.require("path").relative(projectaccess.ProjectAccess.path,path);
			if(parser.ClasspathWalker.getFileIndex(relativePath,list) == -1) list.push({ path : relativePath, directory : parser.ClasspathWalker.getFileDirectory(relativePath), displayText : core.Completion.processDisplayText(relativePath), filename : js.Node.require("path").basename(relativePath)});
		} else if(parser.ClasspathWalker.getFileIndex(path,list) == -1) list.push({ path : path, directory : parser.ClasspathWalker.getFileDirectory(path), displayText : core.Completion.processDisplayText(path), filename : js.Node.require("path").basename(path)});
	}
};
parser.ClasspathWalker.removeFile = function(path) {
	var relativePath;
	var index = -1;
	var _g = 0;
	var _g1 = [parser.ClassParser.haxeStdFileList,parser.ClassParser.filesList];
	while(_g < _g1.length) {
		var list = _g1[_g];
		++_g;
		if(projectaccess.ProjectAccess.path != null) {
			relativePath = js.Node.require("path").relative(projectaccess.ProjectAccess.path,path);
			index = parser.ClasspathWalker.getFileIndex(relativePath,list);
			if(index != -1) HxOverrides.remove(list,list[index]);
		}
		index = parser.ClasspathWalker.getFileIndex(path,list);
		if(index != -1) HxOverrides.remove(list,list[index]);
	}
};
parser.ClasspathWalker.walkProjectDirectory = function(path) {
	if(Main.sync) Walkdir.walkSync(path,{ },function(path1,stat) {
		if(stat.isFile()) parser.ClasspathWalker.addFile(path1);
	}); else {
		var emitter = Walkdir.walk(path,{ });
		var options = { };
		options.encoding = "utf8";
		emitter.on("file",function(path2,stat1) {
			parser.ClasspathWalker.addFile(path2);
		});
		emitter.on("error",function(path3,stat2) {
			console.log(path3);
		});
	}
};
parser.OutlineHelper = function() { };
$hxClasses["parser.OutlineHelper"] = parser.OutlineHelper;
parser.OutlineHelper.__name__ = ["parser","OutlineHelper"];
parser.OutlineHelper.getList = function(data,path) {
	var ast = parser.ClassParser.parse(data,path);
	if(ast != null) {
		var parsedData = parser.OutlineHelper.parseDeclarations(ast);
		var mainClass = js.Node.require("path").basename(path);
		var rootItem = { label : mainClass};
		rootItem.items = parsedData.treeItems;
		rootItem.expanded = true;
		parser.OutlineHelper.pathToLastFile = path;
		core.OutlinePanel.clearFields();
		core.OutlinePanel.addField(rootItem);
		core.OutlinePanel.update();
	} else if(parser.OutlineHelper.pathToLastFile != path) {
		core.OutlinePanel.clearFields();
		core.OutlinePanel.update();
	}
};
parser.OutlineHelper.parseDeclarations = function(ast) {
	var fileImports = [];
	var treeItems = [];
	var _g = 0;
	var _g1 = ast.decls;
	while(_g < _g1.length) {
		var decl = _g1[_g];
		++_g;
		{
			var _g2 = decl.decl;
			switch(_g2[1]) {
			case 3:
				var mode = _g2[3];
				var sl = _g2[2];
				fileImports = fileImports.concat(parser.OutlineHelper.parseImports(sl,mode));
				break;
			case 5:
				var path = _g2[2];
				break;
			case 2:
				var data = _g2[2];
				var treeItem = { label : data.name};
				treeItem.expanded = true;
				treeItems.push(treeItem);
				break;
			case 0:
				var data1 = _g2[2];
				var treeItem1 = { label : data1.name};
				var items = [];
				treeItem1.items = items;
				treeItem1.expanded = true;
				var _g3 = 0;
				var _g4 = parser.OutlineHelper.getClassFields(data1);
				while(_g3 < _g4.length) {
					var item = _g4[_g3];
					++_g3;
					items.push({ label : item.name, value : item.pos});
				}
				treeItems.push(treeItem1);
				break;
			case 1:
				var data2 = _g2[2];
				var treeItem2 = { label : data2.name};
				var items1 = [];
				treeItem2.items = items1;
				treeItem2.expanded = true;
				treeItems.push(treeItem2);
				var _g31 = 0;
				var _g41 = data2.data;
				while(_g31 < _g41.length) {
					var item1 = _g41[_g31];
					++_g31;
					items1.push({ label : item1.name, value : item1.pos.min});
				}
				break;
			case 4:
				var data3 = _g2[2];
				var treeItem3 = { label : data3.name};
				var items2 = [];
				treeItem3.items = items2;
				treeItem3.expanded = true;
				treeItems.push(treeItem3);
				var _g32 = 0;
				var _g42 = parser.OutlineHelper.getTypeDefFields(data3);
				while(_g32 < _g42.length) {
					var item2 = _g42[_g32];
					++_g32;
					items2.push({ label : item2.name, value : item2.pos});
				}
				break;
			}
		}
	}
	return { fileImports : fileImports, treeItems : treeItems};
};
parser.OutlineHelper.parseImports = function(sl,mode) {
	var fileImports = [];
	var importPackages = [];
	var _g = 0;
	while(_g < sl.length) {
		var item = sl[_g];
		++_g;
		importPackages.push(item.pack);
	}
	var fullImportName = importPackages.join(".");
	switch(mode[1]) {
	case 0:
		fileImports.push(fullImportName);
		break;
	case 1:
		var s = mode[2];
		fileImports.push(s);
		break;
	case 2:
		fileImports.push(fullImportName);
		var _g1 = 0;
		var _g11 = [parser.ClassParser.importsList,parser.ClassParser.haxeStdImports];
		while(_g1 < _g11.length) {
			var list = _g11[_g1];
			++_g1;
			var _g2 = 0;
			while(_g2 < list.length) {
				var item1 = list[_g2];
				++_g2;
				if(item1.indexOf(fullImportName) == 0) fileImports.push(item1);
			}
		}
		break;
	}
	return fileImports;
};
parser.OutlineHelper.getClassFields = function(type) {
	var fields = [];
	var _g1 = 0;
	var _g = type.data.length;
	while(_g1 < _g) {
		var i = _g1++;
		{
			var _g2 = type.data[i].kind;
			switch(_g2[1]) {
			case 1:
				var f = _g2[2];
				var data = type.data[i].name + "(";
				var args = [];
				var _g3 = 0;
				var _g4 = f.args;
				while(_g3 < _g4.length) {
					var item = _g4[_g3];
					++_g3;
					args.push(parser.OutlineHelper.getFieldNameAndType(item.name,item.type));
				}
				data += args.join(", ");
				data += ")";
				if(f.ret != null) data += ":" + parser.OutlineHelper.getFieldType(f.ret);
				fields.push({ name : data, pos : type.data[i].pos.min});
				break;
			case 0:
				var e = _g2[3];
				var t = _g2[2];
				fields.push({ name : parser.OutlineHelper.getFieldNameAndType(type.data[i].name,t), pos : type.data[i].pos.min});
				break;
			case 2:
				var e1 = _g2[5];
				var t1 = _g2[4];
				var set = _g2[3];
				var get = _g2[2];
				fields.push({ name : type.data[i].name, pos : type.data[i].pos.min});
				break;
			}
		}
	}
	return fields;
};
parser.OutlineHelper.getTypeDefFields = function(type) {
	var typeDefFields = [];
	{
		var _g = type.data;
		switch(_g[1]) {
		case 0:
			var p = _g[2];
			break;
		case 1:
			var ret = _g[3];
			var args = _g[2];
			break;
		case 2:
			var fields = _g[2];
			var _g1 = 0;
			while(_g1 < fields.length) {
				var field = fields[_g1];
				++_g1;
				{
					var _g2 = field.kind;
					switch(_g2[1]) {
					case 1:
						var f = _g2[2];
						var data = field.name + "(";
						var args1 = [];
						var _g3 = 0;
						var _g4 = f.args;
						while(_g3 < _g4.length) {
							var item = _g4[_g3];
							++_g3;
							args1.push(parser.OutlineHelper.getFieldNameAndType(item.name,item.type));
						}
						data += args1.join(", ");
						data += ")";
						if(f.ret != null) data += ":" + parser.OutlineHelper.getFieldType(f.ret);
						typeDefFields.push({ name : data, pos : field.pos.min});
						break;
					case 0:
						var e = _g2[3];
						var t = _g2[2];
						typeDefFields.push({ name : parser.OutlineHelper.getFieldNameAndType(field.name,t), pos : field.pos.min});
						break;
					case 2:
						var e1 = _g2[5];
						var t1 = _g2[4];
						var set = _g2[3];
						var get = _g2[2];
						typeDefFields.push({ name : field.name, pos : field.pos.min});
						break;
					}
				}
			}
			break;
		case 3:
			var t2 = _g[2];
			break;
		case 4:
			var fields1 = _g[3];
			var p1 = _g[2];
			break;
		case 5:
			var t3 = _g[2];
			break;
		}
	}
	return typeDefFields;
};
parser.OutlineHelper.getFieldType = function(t) {
	var name = null;
	if(t != null) switch(t[1]) {
	case 0:
		var p = t[2];
		name = p.name;
		break;
	case 1:
		var ret = t[3];
		var args = t[2];
		break;
	case 2:
		var fields = t[2];
		break;
	case 3:
		var t1 = t[2];
		break;
	case 4:
		var fields1 = t[3];
		var p1 = t[2];
		break;
	case 5:
		var t2 = t[2];
		break;
	}
	return name;
};
parser.OutlineHelper.getFieldNameAndType = function(name,type) {
	var nameAndType = name;
	var fieldType = parser.OutlineHelper.getFieldType(type);
	if(fieldType != null) nameAndType += ":" + fieldType;
	return nameAndType;
};
parser.RegexParser = function() { };
$hxClasses["parser.RegexParser"] = parser.RegexParser;
parser.RegexParser.__name__ = ["parser","RegexParser"];
parser.RegexParser.getFileImportsList = function(data) {
	var fileImports = [];
	var ereg = new EReg("^[ \t]*import ([a-z0-9._*]+);$","gim");
	ereg.map(data,function(ereg1) {
		fileImports.push(ereg1.matched(1));
		return "";
	});
	return fileImports;
};
parser.RegexParser.getFilePackage = function(data) {
	var filePackage = null;
	var pos = null;
	var ereg = new EReg("package *([^;]*);$","m");
	if(ereg.match(data)) {
		filePackage = StringTools.trim(ereg.matched(1));
		pos = ereg.matchedPos().pos;
	}
	return { filePackage : filePackage, pos : pos};
};
parser.RegexParser.getTypeDeclarations = function(data) {
	var typeDeclarations = [];
	var ereg = new EReg("(class|typedef|enum|typedef|abstract) +([A-Z][a-zA-Z0-9_]*) *(<[a-zA-Z0-9_,]+>)?","gm");
	ereg.map(data,function(ereg2) {
		var typeDeclaration = { type : ereg2.matched(1), name : ereg2.matched(2)};
		typeDeclarations.push(typeDeclaration);
		return "";
	});
	return typeDeclarations;
};
var pluginloader = {};
pluginloader.PluginManager = function() { };
$hxClasses["pluginloader.PluginManager"] = pluginloader.PluginManager;
pluginloader.PluginManager.__name__ = ["pluginloader","PluginManager"];
pluginloader.PluginManager.loadPlugins = function(compile) {
	if(compile == null) compile = true;
	var pathToPluginsFolder = "plugins";
	if(!js.Node.require("fs").existsSync(pathToPluginsFolder)) js.Node.require("fs").mkdirSync(pathToPluginsFolder);
	var pathToPluginsMTime = "pluginsMTime.dat";
	var args;
	if(js.Node.require("fs").existsSync(pathToPluginsMTime)) {
		var options = { };
		options.encoding = "utf8";
		var data = js.Node.require("fs").readFileSync(pathToPluginsMTime,options);
		if(data != "") pluginloader.PluginManager.pluginsMTime = haxe.Unserializer.run(data);
	} else pluginloader.PluginManager.firstRun = true;
	pluginloader.PluginManager.readDir(pathToPluginsFolder,"",function(path,pathToPlugin) {
		var pluginName = StringTools.replace(pathToPlugin,js.Node.require("path").sep,".");
		var relativePathToPlugin = js.Node.require("path").join(path,pathToPlugin);
		pluginloader.PluginManager.pathToPlugins.set(pluginName,relativePathToPlugin);
		var absolutePathToPlugin = js.Node.require("path").resolve(relativePathToPlugin);
		if(pluginloader.PluginManager.firstRun) pluginloader.PluginManager.pluginsMTime.set(pluginName,Std.parseInt(Std.string(new Date().getTime())));
		if(compile && (!pluginloader.PluginManager.pluginsMTime.exists(pluginName) || pluginloader.PluginManager.pluginsMTime.get(pluginName) < pluginloader.PluginManager.walk(absolutePathToPlugin))) pluginloader.PluginManager.compilePlugin(pluginName,absolutePathToPlugin,pluginloader.PluginManager.loadPlugin); else pluginloader.PluginManager.loadPlugin(absolutePathToPlugin);
	});
	haxe.Timer.delay(function() {
		if(pluginloader.PluginManager.requestedPluginsData.length > 0) {
			console.log("still not loaded plugins: ");
			var _g = 0;
			var _g1 = pluginloader.PluginManager.requestedPluginsData;
			while(_g < _g1.length) {
				var pluginData = _g1[_g];
				++_g;
				console.log(pluginData.name + ": can't load plugin, required plugins are not found");
				console.log(pluginData.plugins);
			}
			pluginloader.PluginManager.savePluginsMTime();
		}
	},10000);
};
pluginloader.PluginManager.walk = function(pathToPlugin) {
	var pathToItem;
	var time = -1;
	var mtime;
	var extension;
	var _g = 0;
	var _g1 = js.Node.require("fs").readdirSync(pathToPlugin);
	while(_g < _g1.length) {
		var item = _g1[_g];
		++_g;
		pathToItem = js.Node.require("path").join(pathToPlugin,item);
		var stat = js.Node.require("fs").statSync(pathToItem);
		extension = js.Node.require("path").extname(pathToItem);
		if(stat.isFile() && (extension == ".hx" || extension == ".hxml")) {
			mtime = stat.mtime.getTime();
			if(time < mtime) time = mtime;
		} else if(stat.isDirectory()) {
			mtime = pluginloader.PluginManager.walk(pathToItem);
			if(time < mtime) time = mtime;
		}
	}
	return time;
};
pluginloader.PluginManager.readDir = function(path,pathToPlugin,onLoad) {
	var pathToFolder;
	js.Node.require("fs").readdir(js.Node.require("path").join(path,pathToPlugin),function(error,folders) {
		if(error != null) console.log(error); else {
			var _g = 0;
			while(_g < folders.length) {
				var item = [folders[_g]];
				++_g;
				if(item[0] != "inactive") {
					pathToFolder = js.Node.require("path").join(path,pathToPlugin,item[0]);
					js.Node.require("fs").stat(pathToFolder,(function(item) {
						return function(error1,stat) {
							if(error1 != null) {
							} else {
								var pluginName = StringTools.replace(pathToPlugin,js.Node.require("path").sep,".");
								if(stat.isDirectory()) pluginloader.PluginManager.readDir(path,js.Node.require("path").join(pathToPlugin,item[0]),onLoad); else if(item[0] == "plugin.hxml" && !Lambda.has(pluginloader.PluginManager.inactivePlugins,pluginName)) {
									var levels = "";
									var _g2 = 0;
									var _g1 = pathToPlugin.split("\\").length;
									while(_g2 < _g1) {
										var i = _g2++;
										levels += "../";
									}
									pluginloader.PluginManager.pluginsTestingData += "\n  - cd " + StringTools.replace(pathToPlugin,"\\","/") + "\n  - haxe plugin.hxml\n  - cd " + levels;
									onLoad(path,pathToPlugin);
									return;
								}
							}
						};
					})(item));
				}
			}
		}
	});
};
pluginloader.PluginManager.loadPlugin = function(pathToPlugin) {
	var pathToMain = js.Node.require("path").join(pathToPlugin,"bin","Main.js");
	js.Node.require("fs").exists(pathToMain,function(exists) {
		if(exists) HIDE.loadJS(null,[pathToMain]); else console.log(pathToMain + " is not found/nPlease compile " + pathToPlugin + " plugin");
	});
};
pluginloader.PluginManager.compilePlugin = function(name,pathToPlugin,onSuccess,onFailed) {
	var pathToBin = js.Node.require("path").join(pathToPlugin,"bin");
	js.Node.require("fs").exists(pathToBin,function(exists) {
		if(exists) pluginloader.PluginManager.startPluginCompilation(name,pathToPlugin,onSuccess,onFailed); else js.Node.require("fs").mkdir(pathToBin,null,function(error) {
			pluginloader.PluginManager.startPluginCompilation(name,pathToPlugin,onSuccess,onFailed);
		});
	});
};
pluginloader.PluginManager.startPluginCompilation = function(name,pathToPlugin,onSuccess,onFailed) {
	var startTime = new Date().getTime();
	var delta;
	var command = ["haxe","--cwd",HIDE.surroundWithQuotes(pathToPlugin),"plugin.hxml"].join(" ");
	console.log(command);
	var haxeCompilerProcess = js.Node.require("child_process").exec(command,{ },function(err,stdout,stderr) {
		if(err == null) {
			delta = new Date().getTime() - startTime;
			Std.string(console.log(name + " compilation took " + (delta == null?"null":"" + delta))) + " ms";
			onSuccess(pathToPlugin);
			pluginloader.PluginManager.pluginsMTime.set(name,Std.parseInt(Std.string(new Date().getTime())));
		} else {
			var element = window.document.getElementById("plugin-compilation-console");
			var textarea;
			if(element == null) {
				var _this = window.document;
				textarea = _this.createElement("textarea");
				textarea.id = "plugin-compilation-console";
				textarea.value = "Plugins compile-time errors:\n";
				window.document.body.appendChild(textarea);
			} else textarea = js.Boot.__cast(element , HTMLTextAreaElement);
			console.log(pathToPlugin + " stderr: " + stderr);
			textarea.value += name + "\n" + stderr + "\n";
			console.log("can't load " + name + " plugin, compilation failed");
			var regex = new EReg("haxelib install (.+) ","gim");
			regex.map(stderr,function(ereg) {
				console.log(ereg);
				return "";
			});
			if(onFailed != null) onFailed(stderr);
		}
	});
};
pluginloader.PluginManager.savePluginsMTime = function() {
	var pathToPluginsMTime = js.Node.require("path").join("..","pluginsMTime.dat");
	var data = haxe.Serializer.run(pluginloader.PluginManager.pluginsMTime);
	js.Node.require("fs").writeFile(pathToPluginsMTime,data,"utf8",function(error) {
	});
};
pluginloader.PluginManager.compilePlugins = function(onComplete,onFailed) {
	var pluginCount = Lambda.count(pluginloader.PluginManager.pathToPlugins);
	var compiledPluginCount = 0;
	var relativePathToPlugin;
	var absolutePathToPlugin;
	if(pluginCount > 0) {
		var $it0 = pluginloader.PluginManager.pathToPlugins.keys();
		while( $it0.hasNext() ) {
			var name = $it0.next();
			relativePathToPlugin = pluginloader.PluginManager.pathToPlugins.get(name);
			absolutePathToPlugin = js.Node.require("path").resolve(relativePathToPlugin);
			pluginloader.PluginManager.compilePlugin(name,absolutePathToPlugin,function() {
				compiledPluginCount++;
				if(compiledPluginCount == pluginCount) onComplete();
			},onFailed);
		}
	} else onComplete();
};
var projectaccess = {};
projectaccess.Project = function() {
	this.files = [];
	this.hiddenItems = [];
	this.targetData = [];
	this.showHiddenItems = false;
};
$hxClasses["projectaccess.Project"] = projectaccess.Project;
projectaccess.Project.__name__ = ["projectaccess","Project"];
projectaccess.Project.prototype = {
	type: null
	,target: null
	,name: null
	,main: null
	,projectPackage: null
	,company: null
	,license: null
	,url: null
	,targetData: null
	,files: null
	,activeFile: null
	,openFLTarget: null
	,runActionType: null
	,runActionText: null
	,buildActionCommand: null
	,hiddenItems: null
	,showHiddenItems: null
	,__class__: projectaccess.Project
};
projectaccess.ProjectAccess = function() { };
$hxClasses["projectaccess.ProjectAccess"] = projectaccess.ProjectAccess;
projectaccess.ProjectAccess.__name__ = ["projectaccess","ProjectAccess"];
projectaccess.ProjectAccess.registerSaveOnCloseListener = function() {
	var $window = nodejs.webkit.Window.get();
	$window.on("close",function() {
		projectaccess.ProjectAccess.save(null,true);
		$window.close();
	});
};
projectaccess.ProjectAccess.save = function(onComplete,sync) {
	if(sync == null) sync = false;
	if(projectaccess.ProjectAccess.path != null) {
		var pathToProjectHide = js.Node.require("path").join(projectaccess.ProjectAccess.path,"project.hide");
		var data = tjson.TJSON.encode(projectaccess.ProjectAccess.currentProject,"fancy");
		if(sync) js.Node.require("fs").writeFileSync(pathToProjectHide,data,"utf8"); else core.Helper.debounce("saveProject",function() {
			js.Node.require("fs").writeFile(pathToProjectHide,data,"utf8",function(error) {
				if(onComplete != null) onComplete();
			});
		},250);
	} else console.log("project path is null");
};
projectaccess.ProjectAccess.isItemInIgnoreList = function(path) {
	var ignore = false;
	if(projectaccess.ProjectAccess.path != null && !projectaccess.ProjectAccess.currentProject.showHiddenItems) {
		var relativePath = js.Node.require("path").relative(projectaccess.ProjectAccess.path,path);
		if(HxOverrides.indexOf(projectaccess.ProjectAccess.currentProject.hiddenItems,relativePath,0) != -1) ignore = true;
	}
	return ignore;
};
projectaccess.ProjectAccess.getPathToHxml = function() {
	var pathToHxml = null;
	var project = projectaccess.ProjectAccess.currentProject;
	var _g = project.type;
	switch(_g) {
	case 0:
		var targetData = project.targetData[project.target];
		pathToHxml = targetData.pathToHxml;
		break;
	case 2:
		pathToHxml = project.main;
		break;
	default:
	}
	return pathToHxml;
};
projectaccess.ProjectOptions = function() { };
$hxClasses["projectaccess.ProjectOptions"] = projectaccess.ProjectOptions;
projectaccess.ProjectOptions.__name__ = ["projectaccess","ProjectOptions"];
projectaccess.ProjectOptions.create = function() {
	var _this = window.document;
	projectaccess.ProjectOptions.page = _this.createElement("div");
	projectaccess.ProjectOptions.createOptionsForMultipleHxmlProjects();
	var _this1 = window.document;
	projectaccess.ProjectOptions.projectTargetText = _this1.createElement("p");
	projectaccess.ProjectOptions.projectTargetText.textContent = watchers.LocaleWatcher.getStringSync("Project target:");
	projectaccess.ProjectOptions.projectTargetText.setAttribute("localeString","Project target:");
	projectaccess.ProjectOptions.projectTargetText.className = "custom-font-size";
	projectaccess.ProjectOptions.page.appendChild(projectaccess.ProjectOptions.projectTargetText);
	var _this2 = window.document;
	projectaccess.ProjectOptions.projectTargetList = _this2.createElement("select");
	projectaccess.ProjectOptions.projectTargetList.id = "project-options-project-target";
	projectaccess.ProjectOptions.projectTargetList.className = "custom-font-size";
	projectaccess.ProjectOptions.projectTargetList.style.width = "100%";
	var _this3 = window.document;
	projectaccess.ProjectOptions.openFLTargetList = _this3.createElement("select");
	projectaccess.ProjectOptions.openFLTargetList.id = "project-options-openfl-target";
	projectaccess.ProjectOptions.openFLTargetList.className = "custom-font-size";
	projectaccess.ProjectOptions.openFLTargetList.style.width = "100%";
	var _this4 = window.document;
	projectaccess.ProjectOptions.openFLTargetText = _this4.createElement("p");
	projectaccess.ProjectOptions.openFLTargetText.innerText = watchers.LocaleWatcher.getStringSync("OpenFL target:");
	projectaccess.ProjectOptions.openFLTargetText.setAttribute("localeString","OpenFL target:");
	projectaccess.ProjectOptions.openFLTargetText.className = "custom-font-size";
	var _g = 0;
	var _g1 = ["Flash","JavaScript","Neko","OpenFL","PHP","C++","Java","C#","Python"];
	while(_g < _g1.length) {
		var target = _g1[_g];
		++_g;
		projectaccess.ProjectOptions.projectTargetList.appendChild(projectaccess.ProjectOptions.createListItem(target));
	}
	projectaccess.ProjectOptions.projectTargetList.onchange = function(e) {
		var project = projectaccess.ProjectAccess.currentProject;
		var _g2 = projectaccess.ProjectOptions.projectTargetList.value;
		switch(_g2) {
		case "Flash":
			project.target = 0;
			break;
		case "JavaScript":
			project.target = 1;
			break;
		case "Neko":
			project.target = 2;
			break;
		case "OpenFL":
			project.target = 1;
			break;
		case "PHP":
			project.target = 3;
			break;
		case "C++":
			project.target = 4;
			break;
		case "Java":
			project.target = 5;
			break;
		case "C#":
			project.target = 6;
			break;
		default:
			throw "Unknown target";
		}
		parser.ClasspathWalker.parseProjectArguments();
		projectaccess.ProjectOptions.updateProjectOptions();
	};
	projectaccess.ProjectOptions.openFLTargets = ["flash","html5","neko","android","blackberry","emscripten","webos","tizen","ios","windows","mac","linux"];
	var _g3 = 0;
	var _g11 = projectaccess.ProjectOptions.openFLTargets;
	while(_g3 < _g11.length) {
		var target1 = _g11[_g3];
		++_g3;
		projectaccess.ProjectOptions.openFLTargetList.appendChild(projectaccess.ProjectOptions.createListItem(target1));
	}
	projectaccess.ProjectOptions.openFLTargetList.onchange = function(_) {
		var project1 = projectaccess.ProjectAccess.currentProject;
		project1.openFLTarget = projectaccess.ProjectOptions.openFLTargets[projectaccess.ProjectOptions.openFLTargetList.selectedIndex];
		var buildParams = ["haxelib","run","lime","build","\"%path%\"",project1.openFLTarget];
		var _g4 = projectaccess.ProjectAccess.currentProject.openFLTarget;
		switch(_g4) {
		case "flash":case "html5":case "neko":
			buildParams = buildParams.concat(["--connect","5000"]);
			break;
		default:
		}
		project1.buildActionCommand = buildParams.join(" ");
		project1.runActionType = 2;
		project1.runActionText = ["haxelib","run","lime","run","\"%path%\"",project1.openFLTarget].join(" ");
		parser.ClasspathWalker.parseProjectArguments();
		projectaccess.ProjectOptions.updateProjectOptions();
	};
	var _this5 = window.document;
	projectaccess.ProjectOptions.runActionDescription = _this5.createElement("p");
	projectaccess.ProjectOptions.runActionDescription.className = "custom-font-size";
	projectaccess.ProjectOptions.runActionDescription.textContent = watchers.LocaleWatcher.getStringSync("Run action:");
	projectaccess.ProjectOptions.runActionDescription.setAttribute("localeString","Run action:");
	var _this6 = window.document;
	projectaccess.ProjectOptions.runActionTextAreaDescription = _this6.createElement("p");
	projectaccess.ProjectOptions.runActionTextAreaDescription.textContent = watchers.LocaleWatcher.getStringSync("URL:");
	projectaccess.ProjectOptions.runActionTextAreaDescription.setAttribute("localeString","URL:");
	projectaccess.ProjectOptions.runActionTextAreaDescription.className = "custom-font-size";
	var actions = ["Open URL","Open File","Run command"];
	var _this7 = window.document;
	projectaccess.ProjectOptions.runActionList = _this7.createElement("select");
	projectaccess.ProjectOptions.runActionList.style.width = "100%";
	projectaccess.ProjectOptions.runActionList.onchange = projectaccess.ProjectOptions.update;
	var _g5 = 0;
	while(_g5 < actions.length) {
		var action = actions[_g5];
		++_g5;
		projectaccess.ProjectOptions.runActionList.appendChild(projectaccess.ProjectOptions.createListItem(action));
	}
	var _this8 = window.document;
	projectaccess.ProjectOptions.actionTextArea = _this8.createElement("textarea");
	projectaccess.ProjectOptions.actionTextArea.id = "project-options-action-textarea";
	projectaccess.ProjectOptions.actionTextArea.className = "custom-font-size";
	projectaccess.ProjectOptions.actionTextArea.onchange = function(e1) {
		var project2 = projectaccess.ProjectAccess.currentProject;
		if(project2.type == 0) {
			var targetData = project2.targetData[project2.target];
			targetData.runActionText = projectaccess.ProjectOptions.actionTextArea.value;
		} else project2.runActionText = projectaccess.ProjectOptions.actionTextArea.value;
		projectaccess.ProjectOptions.update(null);
	};
	var _this9 = window.document;
	projectaccess.ProjectOptions.buildActionDescription = _this9.createElement("p");
	projectaccess.ProjectOptions.buildActionDescription.className = "custom-font-size";
	projectaccess.ProjectOptions.buildActionDescription.textContent = watchers.LocaleWatcher.getStringSync("Build command:");
	projectaccess.ProjectOptions.buildActionDescription.setAttribute("localeString","Build command:");
	var _this10 = window.document;
	projectaccess.ProjectOptions.buildActionTextArea = _this10.createElement("textarea");
	projectaccess.ProjectOptions.buildActionTextArea.id = "project-options-build-action-textarea";
	projectaccess.ProjectOptions.buildActionTextArea.className = "custom-font-size";
	projectaccess.ProjectOptions.buildActionTextArea.onchange = function(e2) {
		projectaccess.ProjectAccess.currentProject.buildActionCommand = projectaccess.ProjectOptions.buildActionTextArea.value;
		projectaccess.ProjectAccess.save();
	};
	projectaccess.ProjectOptions.page.appendChild(projectaccess.ProjectOptions.projectTargetList);
	projectaccess.ProjectOptions.page.appendChild(projectaccess.ProjectOptions.buildActionDescription);
	projectaccess.ProjectOptions.page.appendChild(projectaccess.ProjectOptions.buildActionTextArea);
	projectaccess.ProjectOptions.page.appendChild(projectaccess.ProjectOptions.pathToHxmlDescription);
	projectaccess.ProjectOptions.page.appendChild(projectaccess.ProjectOptions.inputGroupButton.getElement());
	projectaccess.ProjectOptions.page.appendChild(projectaccess.ProjectOptions.openFLTargetText);
	projectaccess.ProjectOptions.page.appendChild(projectaccess.ProjectOptions.openFLTargetList);
	projectaccess.ProjectOptions.page.appendChild(projectaccess.ProjectOptions.runActionDescription);
	projectaccess.ProjectOptions.page.appendChild(projectaccess.ProjectOptions.runActionList);
	projectaccess.ProjectOptions.page.appendChild(projectaccess.ProjectOptions.runActionTextAreaDescription);
	projectaccess.ProjectOptions.page.appendChild(projectaccess.ProjectOptions.actionTextArea);
};
projectaccess.ProjectOptions.createOptionsForMultipleHxmlProjects = function() {
	var _this = window.document;
	projectaccess.ProjectOptions.pathToHxmlDescription = _this.createElement("p");
	projectaccess.ProjectOptions.pathToHxmlDescription.textContent = watchers.LocaleWatcher.getStringSync("Path to Hxml:");
	projectaccess.ProjectOptions.pathToHxmlDescription.setAttribute("localeString","Path to Hxml:");
	projectaccess.ProjectOptions.pathToHxmlDescription.className = "custom-font-size";
	projectaccess.ProjectOptions.inputGroupButton = new bootstrap.InputGroupButton("Browse...");
	projectaccess.ProjectOptions.pathToHxmlInput = projectaccess.ProjectOptions.inputGroupButton.getInput();
	projectaccess.ProjectOptions.pathToHxmlInput.onchange = function(e) {
		if(js.Node.require("fs").existsSync(projectaccess.ProjectOptions.pathToHxmlInput.value)) {
			var project = projectaccess.ProjectAccess.currentProject;
			project.targetData[project.target].pathToHxml = projectaccess.ProjectOptions.pathToHxmlInput.value;
			projectaccess.ProjectAccess.save();
		} else Alertify.error(projectaccess.ProjectOptions.pathToHxmlInput.value + " is not found");
	};
	var browseButton = projectaccess.ProjectOptions.inputGroupButton.getButton();
	browseButton.onclick = function(e1) {
		core.FileDialog.openFile(function(path) {
			projectaccess.ProjectOptions.pathToHxmlInput.value = path;
			var project1 = projectaccess.ProjectAccess.currentProject;
			project1.targetData[project1.target].pathToHxml = projectaccess.ProjectOptions.pathToHxmlInput.value;
			projectaccess.ProjectAccess.save();
		},".hxml");
	};
	var editButton = bootstrap.ButtonManager.createButton("Edit",false,true);
	editButton.onclick = function(e2) {
		tabmanager.TabManager.openFileInNewTab(js.Node.require("path").resolve(projectaccess.ProjectAccess.path,projectaccess.ProjectOptions.pathToHxmlInput.value));
	};
	projectaccess.ProjectOptions.inputGroupButton.getSpan().appendChild(editButton);
};
projectaccess.ProjectOptions.update = function(_) {
	if(projectaccess.ProjectOptions.projectTargetList.selectedIndex == 3) {
		projectaccess.ProjectOptions.openFLTargetList.style.display = "";
		projectaccess.ProjectOptions.openFLTargetText.style.display = "";
	} else {
		projectaccess.ProjectOptions.openFLTargetList.style.display = "none";
		projectaccess.ProjectOptions.openFLTargetText.style.display = "none";
	}
	if(projectaccess.ProjectAccess.currentProject.type == 2) {
		projectaccess.ProjectOptions.openFLTargetList.style.display = "none";
		projectaccess.ProjectOptions.openFLTargetText.style.display = "none";
		projectaccess.ProjectOptions.buildActionTextArea.style.display = "none";
		projectaccess.ProjectOptions.buildActionDescription.style.display = "none";
		projectaccess.ProjectOptions.projectTargetList.style.display = "none";
		projectaccess.ProjectOptions.projectTargetText.style.display = "none";
	} else {
		projectaccess.ProjectOptions.buildActionTextArea.style.display = "none";
		projectaccess.ProjectOptions.buildActionDescription.style.display = "none";
		projectaccess.ProjectOptions.runActionTextAreaDescription.style.display = "";
		projectaccess.ProjectOptions.runActionList.style.display = "";
		projectaccess.ProjectOptions.runActionDescription.style.display = "";
		projectaccess.ProjectOptions.projectTargetList.style.display = "";
		projectaccess.ProjectOptions.projectTargetText.style.display = "";
		projectaccess.ProjectOptions.actionTextArea.style.display = "";
	}
	if(projectaccess.ProjectAccess.currentProject.type == 0) {
		projectaccess.ProjectOptions.pathToHxmlDescription.style.display = "";
		projectaccess.ProjectOptions.inputGroupButton.getElement().style.display = "";
	} else {
		projectaccess.ProjectOptions.pathToHxmlDescription.style.display = "none";
		projectaccess.ProjectOptions.inputGroupButton.getElement().style.display = "none";
	}
	var runActionType;
	var _g = projectaccess.ProjectOptions.runActionList.selectedIndex;
	switch(_g) {
	case 0:
		projectaccess.ProjectOptions.runActionTextAreaDescription.innerText = watchers.LocaleWatcher.getStringSync("URL: ");
		runActionType = 0;
		break;
	case 1:
		projectaccess.ProjectOptions.runActionTextAreaDescription.innerText = watchers.LocaleWatcher.getStringSync("Path: ");
		runActionType = 1;
		break;
	case 2:
		projectaccess.ProjectOptions.runActionTextAreaDescription.innerText = watchers.LocaleWatcher.getStringSync("Command: ");
		runActionType = 2;
		break;
	default:
		runActionType = 0;
	}
	var project = projectaccess.ProjectAccess.currentProject;
	var _g1 = project.type;
	switch(_g1) {
	case 0:
		var targetData = project.targetData[project.target];
		targetData.runActionType = runActionType;
		break;
	default:
		project.runActionType = runActionType;
	}
	projectaccess.ProjectAccess.save();
};
projectaccess.ProjectOptions.updateProjectOptions = function() {
	var project = projectaccess.ProjectAccess.currentProject;
	var runActionType;
	var runActionText;
	var _g = project.type;
	switch(_g) {
	case 0:
		var targetData = project.targetData[project.target];
		runActionType = targetData.runActionType;
		runActionText = targetData.runActionText;
		projectaccess.ProjectOptions.pathToHxmlInput.value = targetData.pathToHxml;
		break;
	default:
		runActionType = project.runActionType;
		runActionText = project.runActionText;
	}
	if(project.type == 1) {
		projectaccess.ProjectOptions.projectTargetList.selectedIndex = 3;
		var i = Lambda.indexOf(projectaccess.ProjectOptions.openFLTargets,project.openFLTarget);
		if(i != -1) projectaccess.ProjectOptions.openFLTargetList.selectedIndex = i; else projectaccess.ProjectOptions.openFLTargetList.selectedIndex = 0;
	} else {
		var _g1 = project.target;
		switch(_g1) {
		case 0:
			projectaccess.ProjectOptions.projectTargetList.selectedIndex = 0;
			break;
		case 1:
			projectaccess.ProjectOptions.projectTargetList.selectedIndex = 1;
			break;
		case 2:
			projectaccess.ProjectOptions.projectTargetList.selectedIndex = 2;
			break;
		case 3:
			projectaccess.ProjectOptions.projectTargetList.selectedIndex = 4;
			break;
		case 4:
			projectaccess.ProjectOptions.projectTargetList.selectedIndex = 5;
			break;
		case 5:
			projectaccess.ProjectOptions.projectTargetList.selectedIndex = 6;
			break;
		case 6:
			projectaccess.ProjectOptions.projectTargetList.selectedIndex = 7;
			break;
		case 7:
			projectaccess.ProjectOptions.projectTargetList.selectedIndex = 8;
			break;
		default:
		}
	}
	projectaccess.ProjectOptions.buildActionTextArea.value = project.buildActionCommand;
	switch(runActionType) {
	case 0:
		projectaccess.ProjectOptions.runActionList.selectedIndex = 0;
		break;
	case 1:
		projectaccess.ProjectOptions.runActionList.selectedIndex = 1;
		break;
	case 2:
		projectaccess.ProjectOptions.runActionList.selectedIndex = 2;
		break;
	default:
	}
	if(runActionText == null) runActionText = "";
	projectaccess.ProjectOptions.actionTextArea.value = runActionText;
	projectaccess.ProjectOptions.update(null);
};
projectaccess.ProjectOptions.createListItem = function(text) {
	var option;
	var _this = window.document;
	option = _this.createElement("option");
	option.textContent = watchers.LocaleWatcher.getStringSync(text);
	option.value = text;
	return option;
};
var tabmanager = {};
tabmanager.ContextMenu = function() { };
$hxClasses["tabmanager.ContextMenu"] = tabmanager.ContextMenu;
tabmanager.ContextMenu.__name__ = ["tabmanager","ContextMenu"];
tabmanager.ContextMenu.createContextMenu = function() {
	var _this = window.document;
	tabmanager.ContextMenu.contextMenu = _this.createElement("div");
	tabmanager.ContextMenu.contextMenu.className = "dropdown";
	tabmanager.ContextMenu.contextMenu.style.position = "absolute";
	tabmanager.ContextMenu.contextMenu.style.display = "none";
	window.document.addEventListener("click",function(e) {
		tabmanager.ContextMenu.contextMenu.style.display = "none";
	});
	var ul;
	var _this1 = window.document;
	ul = _this1.createElement("ul");
	ul.className = "dropdown-menu";
	ul.style.display = "block";
	ul.appendChild(tabmanager.ContextMenu.createContextMenuItem("New File...",tabmanager.TabManager.createFileInNewTab));
	ul.appendChild(tabmanager.ContextMenu.createDivider());
	ul.appendChild(tabmanager.ContextMenu.createContextMenuItem("Close",function() {
		tabmanager.TabManager.closeTab(tabmanager.ContextMenu.contextMenu.getAttribute("path"));
	}));
	ul.appendChild(tabmanager.ContextMenu.createContextMenuItem("Close All",function() {
		tabmanager.TabManager.closeAll();
	}));
	ul.appendChild(tabmanager.ContextMenu.createContextMenuItem("Close Other",function() {
		var path = tabmanager.ContextMenu.contextMenu.getAttribute("path");
		tabmanager.TabManager.closeOthers(path);
	}));
	ul.appendChild(tabmanager.ContextMenu.createDivider());
	ul.appendChild(tabmanager.ContextMenu.createContextMenuItem("Show Item In Folder",function() {
		var path1 = tabmanager.ContextMenu.contextMenu.getAttribute("path");
		nodejs.webkit.Shell.showItemInFolder(path1);
	}));
	tabmanager.ContextMenu.contextMenu.appendChild(ul);
	window.document.body.appendChild(tabmanager.ContextMenu.contextMenu);
};
tabmanager.ContextMenu.showMenu = function(path,e) {
	tabmanager.ContextMenu.contextMenu.setAttribute("path",path);
	tabmanager.ContextMenu.contextMenu.style.display = "block";
	tabmanager.ContextMenu.contextMenu.style.left = (e.pageX == null?"null":"" + e.pageX) + "px";
	tabmanager.ContextMenu.contextMenu.style.top = (e.pageY == null?"null":"" + e.pageY) + "px";
};
tabmanager.ContextMenu.createContextMenuItem = function(text,onClick) {
	var li;
	var _this = window.document;
	li = _this.createElement("li");
	li.onclick = function(e) {
		onClick();
	};
	var a;
	var _this1 = window.document;
	a = _this1.createElement("a");
	a.href = "#";
	a.textContent = watchers.LocaleWatcher.getStringSync(text);
	li.appendChild(a);
	return li;
};
tabmanager.ContextMenu.createDivider = function() {
	var li;
	var _this = window.document;
	li = _this.createElement("li");
	li.className = "divider";
	return li;
};
tabmanager.Tab = function(_name,_path,_doc,_save) {
	var _g = this;
	this.ignoreNextUpdates = 0;
	this.name = _name;
	this.doc = _doc;
	this.path = _path;
	var _this = window.document;
	this.li = _this.createElement("li");
	this.li.title = this.path;
	this.li.setAttribute("path",this.path);
	var _this1 = window.document;
	this.span3 = _this1.createElement("span");
	this.span3.textContent = this.name + "\t";
	this.span3.addEventListener("click",function(e) {
		tabmanager.TabManager.selectDoc(_g.path);
	});
	this.li.addEventListener("contextmenu",function(e1) {
		tabmanager.ContextMenu.showMenu(_g.path,e1);
	});
	this.li.appendChild(this.span3);
	var span;
	var _this2 = window.document;
	span = _this2.createElement("span");
	span.style.position = "relative";
	span.style.top = "2px";
	span.addEventListener("click",function(e2) {
		tabmanager.TabManager.closeTab(_g.path);
	});
	var span2;
	var _this3 = window.document;
	span2 = _this3.createElement("span");
	span2.className = "glyphicon glyphicon-remove-circle";
	span.appendChild(span2);
	this.li.appendChild(span);
	if(_save) this.save();
	this.startWatcher();
};
$hxClasses["tabmanager.Tab"] = tabmanager.Tab;
tabmanager.Tab.__name__ = ["tabmanager","Tab"];
tabmanager.Tab.prototype = {
	name: null
	,path: null
	,doc: null
	,li: null
	,span3: null
	,watcher: null
	,ignoreNextUpdates: null
	,startWatcher: function() {
		var _g = this;
		this.watcher = watchers.Watcher.watchFileForUpdates(this.path,function() {
			if(_g.ignoreNextUpdates <= 0) dialogs.DialogManager.showReloadFileDialog(_g.path,$bind(_g,_g.reloadFile)); else _g.ignoreNextUpdates--;
		});
	}
	,reloadFile: function() {
		var _g = this;
		tabmanager.TabManager.openFile(this.path,function(code) {
			_g.doc.setValue(code);
			_g.doc.markClean();
			_g.setChanged(false);
		});
	}
	,setChanged: function(changed) {
		this.span3.textContent = this.name;
		if(changed) this.span3.textContent += "*";
		this.span3.textContent += "\n";
	}
	,remove: function() {
		this.li.remove();
		if(this.watcher != null) this.watcher.close();
	}
	,save: function() {
		this.ignoreNextUpdates++;
		js.Node.require("fs").writeFileSync(this.path,this.doc.getValue(),"utf8");
		this.doc.markClean();
		this.setChanged(false);
	}
	,getElement: function() {
		return this.li;
	}
	,__class__: tabmanager.Tab
};
tabmanager.TabManager = function() { };
$hxClasses["tabmanager.TabManager"] = tabmanager.TabManager;
tabmanager.TabManager.__name__ = ["tabmanager","TabManager"];
tabmanager.TabManager.load = function() {
	tabmanager.TabManager.tabs = js.Boot.__cast(window.document.getElementById("tabs") , HTMLUListElement);
	tabmanager.TabManager.tabMap = new tabmanager.TabMap();
	tabmanager.ContextMenu.createContextMenu();
	var options = { };
	options.labels = { };
	options.labels.ok = watchers.LocaleWatcher.getStringSync("Yes");
	options.labels.cancel = watchers.LocaleWatcher.getStringSync("No");
	Alertify.set(options);
};
tabmanager.TabManager.createNewTab = function(name,path,doc,save) {
	if(save == null) save = false;
	var tab = new tabmanager.Tab(name,path,doc,save);
	tabmanager.TabManager.tabMap.add(tab);
	tabmanager.TabManager.tabs.appendChild(tab.getElement());
	if(projectaccess.ProjectAccess.path != null) {
		var relativePath = js.Node.require("path").relative(projectaccess.ProjectAccess.path,path);
		if(HxOverrides.indexOf(projectaccess.ProjectAccess.currentProject.files,relativePath,0) == -1) projectaccess.ProjectAccess.currentProject.files.push(relativePath);
	}
	core.RecentProjectsList.addFile(path);
	cm.Editor.resize();
};
tabmanager.TabManager.openFile = function(path,onComplete) {
	var options = { };
	options.encoding = "utf8";
	js.Node.require("fs").readFile(path,options,function(error,code) {
		if(error != null) console.log(error); else onComplete(code);
	});
};
tabmanager.TabManager.openFileInNewTab = function(path,show,onComplete) {
	if(show == null) show = true;
	if(core.Utils.os == 0) {
		var ereg = new EReg("[a-z]:\\\\","i");
		if(ereg.match(path)) path = HxOverrides.substr(path,0,3).toLowerCase() + HxOverrides.substr(path,3,null);
	}
	path = StringTools.replace(path,"\\",js.Node.require("path").sep);
	if(tabmanager.TabManager.isAlreadyOpened(path,show)) {
		if(onComplete != null) onComplete();
		return;
	}
	tabmanager.TabManager.openFile(path,function(code) {
		if(tabmanager.TabManager.isAlreadyOpened(path,show)) {
			if(onComplete != null) onComplete();
			return;
		}
		if(code != null) {
			var mode = tabmanager.TabManager.getMode(path);
			var name = js.Node.require("path").basename(path);
			var doc = new CodeMirror.Doc(code,mode);
			tabmanager.TabManager.createNewTab(name,path,doc);
			if(show) tabmanager.TabManager.selectDoc(path);
			tabmanager.TabManager.checkTabsCount();
			if(onComplete != null) onComplete();
		} else console.log("tab-manager: can't load file " + path);
	});
};
tabmanager.TabManager.createFileInNewTab = function(pathToFile) {
	var path = pathToFile;
	if(path == null) core.FileDialog.saveFile(function(_selectedPath) {
		tabmanager.TabManager.createNewFile(_selectedPath);
	}); else tabmanager.TabManager.createNewFile(path);
};
tabmanager.TabManager.createNewFile = function(path) {
	var name = js.Node.require("path").basename(path);
	var mode = tabmanager.TabManager.getMode(name);
	var code = "";
	var extname = js.Node.require("path").extname(name);
	switch(extname) {
	case ".hx":
		path = HxOverrides.substr(path,0,path.length - name.length) + HxOverrides.substr(name,0,1).toUpperCase() + HxOverrides.substr(name,1,null);
		var options = { };
		options.encoding = "utf8";
		var pathToTemplate = js.Node.require("path").join("core","templates","New.hx");
		var templateCode = js.Node.require("fs").readFileSync(pathToTemplate,options);
		code = mustache.Mustache.render(templateCode,{ name : js.Node.require("path").basename(name,extname), pack : "", author : ""});
		break;
	case ".hxml":
		var options1 = { };
		options1.encoding = "utf8";
		var pathToTemplate1 = js.Node.require("path").join("core","templates","build.hxml");
		var templateCode1 = js.Node.require("fs").readFileSync(pathToTemplate1,options1);
		code = templateCode1;
		break;
	default:
	}
	var doc = new CodeMirror.Doc(code,mode);
	tabmanager.TabManager.createNewTab(name,path,doc,true);
	tabmanager.TabManager.selectDoc(path);
	tabmanager.TabManager.checkTabsCount();
	filetree.FileTree.load();
};
tabmanager.TabManager.checkTabsCount = function() {
	if(window.document.getElementById("editor").style.display == "none" && tabmanager.TabManager.tabMap.getTabs().length > 0) {
		new $("#editor").show(0);
		core.WelcomeScreen.hide();
		cm.Editor.editor.refresh();
		cm.Editor.resize();
	}
};
tabmanager.TabManager.closeAll = function() {
	var _g = 0;
	var _g1 = tabmanager.TabManager.tabMap.keys();
	while(_g < _g1.length) {
		var key = _g1[_g];
		++_g;
		tabmanager.TabManager.closeTab(key,false);
	}
};
tabmanager.TabManager.closeOthers = function(path) {
	var _g = 0;
	var _g1 = tabmanager.TabManager.tabMap.keys();
	while(_g < _g1.length) {
		var key = _g1[_g];
		++_g;
		if(key != path) tabmanager.TabManager.closeTab(key,false);
	}
	if(tabmanager.TabManager.tabMap.getTabs().length == 1) tabmanager.TabManager.showNextTab();
};
tabmanager.TabManager.closeTab = function(path,switchToTab) {
	if(switchToTab == null) switchToTab = true;
	if(tabmanager.TabManager.isChanged(path)) Alertify.confirm(watchers.LocaleWatcher.getStringSync("File ") + path + watchers.LocaleWatcher.getStringSync(" was changed. Save it?"),function(e) {
		if(e) tabmanager.TabManager.saveDoc(path);
		tabmanager.TabManager.removeTab(path,switchToTab);
	}); else tabmanager.TabManager.removeTab(path,switchToTab);
	cm.Editor.resize();
};
tabmanager.TabManager.removeTab = function(path,switchToTab) {
	var tab = tabmanager.TabManager.tabMap.get(path);
	tabmanager.TabManager.tabMap.remove(path);
	tab.remove();
	if(tabmanager.TabManager.tabMap.getTabs().length > 0) {
		if(switchToTab) tabmanager.TabManager.showPreviousTab();
	} else {
		new $("#editor").hide(0);
		if(projectaccess.ProjectAccess.path != null) core.WelcomeScreen.hide(); else core.WelcomeScreen.show();
		tabmanager.TabManager.selectedPath = null;
		core.OutlinePanel.clearFields();
		core.OutlinePanel.update();
	}
	if(projectaccess.ProjectAccess.path != null) {
		var pathToDocument = js.Node.require("path").relative(projectaccess.ProjectAccess.path,path);
		HxOverrides.remove(projectaccess.ProjectAccess.currentProject.files,pathToDocument);
	}
};
tabmanager.TabManager.showPreviousTab = function() {
	var index = tabmanager.TabManager.selectedIndex - 1;
	var tabArray = tabmanager.TabManager.tabMap.getTabs();
	if(index < 0) index = tabArray.length - 1;
	tabmanager.TabManager.selectDoc(tabArray[index].path);
};
tabmanager.TabManager.showNextTab = function() {
	var index = tabmanager.TabManager.selectedIndex + 1;
	var tabArray = tabmanager.TabManager.tabMap.getTabs();
	if(index > tabArray.length - 1) index = 0;
	tabmanager.TabManager.selectDoc(tabArray[index].path);
};
tabmanager.TabManager.closeActiveTab = function() {
	tabmanager.TabManager.closeTab(tabmanager.TabManager.selectedPath);
};
tabmanager.TabManager.isAlreadyOpened = function(path,show) {
	if(show == null) show = true;
	var opened = tabmanager.TabManager.tabMap.exists(path);
	if(opened && show) tabmanager.TabManager.selectDoc(path);
	return opened;
};
tabmanager.TabManager.getMode = function(path) {
	var mode = null;
	var _g = js.Node.require("path").extname(path);
	switch(_g) {
	case ".hx":
		mode = "haxe";
		break;
	case ".hxml":
		mode = "hxml";
		break;
	case ".js":
		mode = "javascript";
		break;
	case ".css":
		mode = "css";
		break;
	case ".xml":
		mode = "xml";
		break;
	case ".html":
		mode = "text/html";
		break;
	case ".md":
		mode = "markdown";
		break;
	case ".sh":case ".bat":
		mode = "shell";
		break;
	case ".ml":
		mode = "ocaml";
		break;
	default:
	}
	return mode;
};
tabmanager.TabManager.selectDoc = function(path) {
	var keys = tabmanager.TabManager.tabMap.keys();
	var _g1 = 0;
	var _g = keys.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(keys[i] == path) {
			tabmanager.TabManager.tabMap.get(keys[i]).getElement().className = "selected";
			tabmanager.TabManager.selectedIndex = i;
		} else tabmanager.TabManager.tabMap.get(keys[i]).getElement().className = "";
	}
	tabmanager.TabManager.selectedPath = path;
	if(projectaccess.ProjectAccess.path != null) projectaccess.ProjectAccess.currentProject.activeFile = js.Node.require("path").relative(projectaccess.ProjectAccess.path,tabmanager.TabManager.selectedPath);
	cm.Editor.editor.swapDoc(tabmanager.TabManager.tabMap.get(tabmanager.TabManager.selectedPath).doc);
	core.HaxeLint.updateLinting();
	var completionActive = cm.Editor.editor.state.completionActive;
	if(completionActive != null && completionActive.widget != null) completionActive.widget.close();
	cm.Editor.editor.focus();
};
tabmanager.TabManager.getCurrentDocumentPath = function() {
	return tabmanager.TabManager.selectedPath;
};
tabmanager.TabManager.getCurrentDocument = function() {
	var doc = null;
	if(tabmanager.TabManager.selectedPath != null) doc = tabmanager.TabManager.tabMap.get(tabmanager.TabManager.selectedPath).doc;
	return doc;
};
tabmanager.TabManager.saveDoc = function(path,onComplete) {
	if(tabmanager.TabManager.isChanged(path)) {
		var tab = tabmanager.TabManager.tabMap.get(path);
		tab.save();
	}
	if(onComplete != null) onComplete();
};
tabmanager.TabManager.isChanged = function(path) {
	var tab = tabmanager.TabManager.tabMap.get(path);
	return !tab.doc.isClean();
};
tabmanager.TabManager.saveActiveFile = function(onComplete) {
	if(tabmanager.TabManager.selectedPath != null) tabmanager.TabManager.saveDoc(tabmanager.TabManager.selectedPath,onComplete); else console.log(tabmanager.TabManager.selectedPath);
};
tabmanager.TabManager.saveActiveFileAs = function() {
	var tab = tabmanager.TabManager.tabMap.get(tabmanager.TabManager.selectedPath);
	core.FileDialog.saveFile(function(path) {
		tabmanager.TabManager.tabMap.remove(tabmanager.TabManager.selectedPath);
		tab.path = path;
		tabmanager.TabManager.selectedPath = path;
		tabmanager.TabManager.tabMap.add(tab);
		tabmanager.TabManager.saveDoc(tabmanager.TabManager.selectedPath);
	},tab.name);
};
tabmanager.TabManager.saveAll = function(onComplete) {
	var _g = 0;
	var _g1 = tabmanager.TabManager.tabMap.keys();
	while(_g < _g1.length) {
		var key = _g1[_g];
		++_g;
		tabmanager.TabManager.saveDoc(key);
	}
	if(onComplete != null) onComplete();
};
tabmanager.TabMap = function() {
	this.tabArray = [];
};
$hxClasses["tabmanager.TabMap"] = tabmanager.TabMap;
tabmanager.TabMap.__name__ = ["tabmanager","TabMap"];
tabmanager.TabMap.prototype = {
	tabArray: null
	,get: function(path) {
		var tab = null;
		var _g = 0;
		var _g1 = this.tabArray;
		while(_g < _g1.length) {
			var t = _g1[_g];
			++_g;
			if(t.path == path) {
				tab = t;
				break;
			}
		}
		return tab;
	}
	,exists: function(path) {
		var exists = false;
		var _g = 0;
		var _g1 = this.tabArray;
		while(_g < _g1.length) {
			var t = _g1[_g];
			++_g;
			if(t.path == path) {
				exists = true;
				break;
			}
		}
		return exists;
	}
	,getIndex: function(path) {
		var index = -1;
		var _g1 = 0;
		var _g = this.tabArray.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(this.tabArray[i].path == path) {
				index = i;
				break;
			}
		}
		return index;
	}
	,add: function(tab) {
		this.tabArray.push(tab);
	}
	,remove: function(path) {
		this.tabArray.splice(this.getIndex(path),1);
	}
	,keys: function() {
		var keys = [];
		var _g = 0;
		var _g1 = this.tabArray;
		while(_g < _g1.length) {
			var t = _g1[_g];
			++_g;
			keys.push(t.path);
		}
		return keys;
	}
	,getTabs: function() {
		return this.tabArray;
	}
	,__class__: tabmanager.TabMap
};
var tjson = {};
tjson.TJSON = function() { };
$hxClasses["tjson.TJSON"] = tjson.TJSON;
tjson.TJSON.__name__ = ["tjson","TJSON"];
tjson.TJSON.parse = function(json,fileName,stringProcessor) {
	if(fileName == null) fileName = "JSON Data";
	tjson.TJSON.floatRegex = new EReg("^-?[0-9]*\\.[0-9]+$","");
	tjson.TJSON.intRegex = new EReg("^-?[0-9]+$","");
	tjson.TJSON.json = json;
	tjson.TJSON.fileName = fileName;
	tjson.TJSON.currentLine = 1;
	tjson.TJSON.pos = 0;
	if(stringProcessor == null) tjson.TJSON.strProcessor = tjson.TJSON.defaultStringProcessor; else tjson.TJSON.strProcessor = stringProcessor;
	try {
		return tjson.TJSON.doParse();
	} catch( e ) {
		if( js.Boot.__instanceof(e,String) ) {
			throw fileName + " on line " + tjson.TJSON.currentLine + ": " + e;
		} else throw(e);
	}
	return null;
};
tjson.TJSON.encode = function(obj,style) {
	if(!Reflect.isObject(obj)) throw "Provided object is not an object.";
	var st;
	if(js.Boot.__instanceof(style,tjson.EncodeStyle)) st = style; else if(style == "fancy") st = new tjson.FancyStyle(); else st = new tjson.SimpleStyle();
	var buffer = new StringBuf();
	if((obj instanceof Array) && obj.__enum__ == null || js.Boot.__instanceof(obj,List)) tjson.TJSON.encodeIterable(buffer,obj,st,0); else if(js.Boot.__instanceof(obj,haxe.ds.StringMap)) tjson.TJSON.encodeMap(buffer,obj,st,0); else tjson.TJSON.encodeObject(buffer,obj,st,0);
	return buffer.b;
};
tjson.TJSON.defaultStringProcessor = function(str) {
	return str;
};
tjson.TJSON.doParse = function() {
	var s = tjson.TJSON.getNextSymbol();
	if(s == "{") return tjson.TJSON.doObject();
	if(s == "[") return tjson.TJSON.doArray();
	return null;
};
tjson.TJSON.doObject = function() {
	var o = { };
	var val = "";
	var key;
	while(tjson.TJSON.pos < tjson.TJSON.json.length) {
		key = tjson.TJSON.getNextSymbol();
		if(key == "," && !tjson.TJSON.lastSymbolQuoted) continue;
		if(key == "}" && !tjson.TJSON.lastSymbolQuoted) return o;
		var seperator = tjson.TJSON.getNextSymbol();
		if(seperator != ":") throw "Expected ':' but got '" + seperator + "' instead.";
		var v = tjson.TJSON.getNextSymbol();
		if(v == "{" && !tjson.TJSON.lastSymbolQuoted) val = tjson.TJSON.doObject(); else if(v == "[" && !tjson.TJSON.lastSymbolQuoted) val = tjson.TJSON.doArray(); else val = tjson.TJSON.convertSymbolToProperType(v);
		o[key] = val;
	}
	throw "Unexpected end of file. Expected '}'";
};
tjson.TJSON.doArray = function() {
	var a = new Array();
	var val;
	while(tjson.TJSON.pos < tjson.TJSON.json.length) {
		val = tjson.TJSON.getNextSymbol();
		if(val == "," && !tjson.TJSON.lastSymbolQuoted) continue; else if(val == "]" && !tjson.TJSON.lastSymbolQuoted) return a; else if(val == "{" && !tjson.TJSON.lastSymbolQuoted) val = tjson.TJSON.doObject(); else if(val == "[" && !tjson.TJSON.lastSymbolQuoted) val = tjson.TJSON.doArray(); else val = tjson.TJSON.convertSymbolToProperType(val);
		a.push(val);
	}
	throw "Unexpected end of file. Expected ']'";
};
tjson.TJSON.convertSymbolToProperType = function(symbol) {
	if(tjson.TJSON.lastSymbolQuoted) return symbol;
	if(tjson.TJSON.looksLikeFloat(symbol)) return Std.parseFloat(symbol);
	if(tjson.TJSON.looksLikeInt(symbol)) return Std.parseInt(symbol);
	if(symbol.toLowerCase() == "true") return true;
	if(symbol.toLowerCase() == "false") return false;
	if(symbol.toLowerCase() == "null") return null;
	return symbol;
};
tjson.TJSON.looksLikeFloat = function(s) {
	return tjson.TJSON.floatRegex.match(s);
};
tjson.TJSON.looksLikeInt = function(s) {
	return tjson.TJSON.intRegex.match(s);
};
tjson.TJSON.getNextSymbol = function() {
	tjson.TJSON.lastSymbolQuoted = false;
	var c = "";
	var inQuote = false;
	var quoteType = "";
	var symbol = "";
	var inEscape = false;
	var inSymbol = false;
	var inLineComment = false;
	var inBlockComment = false;
	while(tjson.TJSON.pos < tjson.TJSON.json.length) {
		c = tjson.TJSON.json.charAt(tjson.TJSON.pos++);
		if(c == "\n" && !inSymbol) tjson.TJSON.currentLine++;
		if(inLineComment) {
			if(c == "\n" || c == "\r") {
				inLineComment = false;
				tjson.TJSON.pos++;
			}
			continue;
		}
		if(inBlockComment) {
			if(c == "*" && tjson.TJSON.json.charAt(tjson.TJSON.pos) == "/") {
				inBlockComment = false;
				tjson.TJSON.pos++;
			}
			continue;
		}
		if(inQuote) {
			if(inEscape) {
				inEscape = false;
				if(c == "'" || c == "\"") {
					symbol += c;
					continue;
				}
				if(c == "t") {
					symbol += "\t";
					continue;
				}
				if(c == "n") {
					symbol += "\n";
					continue;
				}
				if(c == "\\") {
					symbol += "\\";
					continue;
				}
				if(c == "r") {
					symbol += "\r";
					continue;
				}
				if(c == "/") {
					symbol += "/";
					continue;
				}
				if(c == "u") {
					var hexValue = 0;
					var _g = 0;
					while(_g < 4) {
						var i = _g++;
						if(tjson.TJSON.pos >= tjson.TJSON.json.length) throw "Unfinished UTF8 character";
						var nc;
						var index = tjson.TJSON.pos++;
						nc = HxOverrides.cca(tjson.TJSON.json,index);
						hexValue = hexValue << 4;
						if(nc >= 48 && nc <= 57) hexValue += nc - 48; else if(nc >= 65 && nc <= 70) hexValue += 10 + nc - 65; else if(nc >= 97 && nc <= 102) hexValue += 10 + nc - 95; else throw "Not a hex digit";
					}
					var utf = new haxe.Utf8();
					utf.__b += String.fromCharCode(hexValue);
					symbol += utf.__b;
					continue;
				}
				throw "Invalid escape sequence '\\" + c + "'";
			} else {
				if(c == "\\") {
					inEscape = true;
					continue;
				}
				if(c == quoteType) return symbol;
				symbol += c;
				continue;
			}
		} else if(c == "/") {
			var c2 = tjson.TJSON.json.charAt(tjson.TJSON.pos);
			if(c2 == "/") {
				inLineComment = true;
				tjson.TJSON.pos++;
				continue;
			} else if(c2 == "*") {
				inBlockComment = true;
				tjson.TJSON.pos++;
				continue;
			}
		}
		if(inSymbol) {
			if(c == " " || c == "\n" || c == "\r" || c == "\t" || c == "," || c == ":" || c == "}" || c == "]") {
				tjson.TJSON.pos--;
				return symbol;
			} else {
				symbol += c;
				continue;
			}
		} else {
			if(c == " " || c == "\t" || c == "\n" || c == "\r") continue;
			if(c == "{" || c == "}" || c == "[" || c == "]" || c == "," || c == ":") return c;
			if(c == "'" || c == "\"") {
				inQuote = true;
				quoteType = c;
				tjson.TJSON.lastSymbolQuoted = true;
				continue;
			} else {
				inSymbol = true;
				symbol = c;
				continue;
			}
		}
	}
	if(inQuote) throw "Unexpected end of data. Expected ( " + quoteType + " )";
	return symbol;
};
tjson.TJSON.encodeObject = function(buffer,obj,style,depth) {
	buffer.add(style.beginObject(depth));
	var fieldCount = 0;
	var fields;
	var cls = Type.getClass(obj);
	if(cls != null) fields = Type.getInstanceFields(cls); else fields = Reflect.fields(obj);
	var _g = 0;
	while(_g < fields.length) {
		var field = fields[_g];
		++_g;
		if(fieldCount++ > 0) buffer.add(style.entrySeperator(depth)); else buffer.add(style.firstEntry(depth));
		var value = Reflect.field(obj,field);
		buffer.add("\"" + field + "\"" + style.keyValueSeperator(depth));
		tjson.TJSON.encodeValue(buffer,value,style,depth);
	}
	buffer.add(style.endObject(depth));
};
tjson.TJSON.encodeMap = function(buffer,obj,style,depth) {
	buffer.add(style.beginObject(depth));
	var fieldCount = 0;
	var $it0 = obj.keys();
	while( $it0.hasNext() ) {
		var field = $it0.next();
		if(fieldCount++ > 0) buffer.add(style.entrySeperator(depth)); else buffer.add(style.firstEntry(depth));
		var value = obj.get(field);
		buffer.add("\"" + field + "\"" + style.keyValueSeperator(depth));
		tjson.TJSON.encodeValue(buffer,value,style,depth);
	}
	buffer.add(style.endObject(depth));
};
tjson.TJSON.encodeIterable = function(buffer,obj,style,depth) {
	buffer.add(style.beginArray(depth));
	var fieldCount = 0;
	var $it0 = $iterator(obj)();
	while( $it0.hasNext() ) {
		var value = $it0.next();
		if(fieldCount++ > 0) buffer.add(style.entrySeperator(depth)); else buffer.add(style.firstEntry(depth));
		tjson.TJSON.encodeValue(buffer,value,style,depth);
	}
	buffer.add(style.endArray(depth));
};
tjson.TJSON.encodeValue = function(buffer,value,style,depth) {
	if(((value | 0) === value) || typeof(value) == "number") buffer.add(value); else if((value instanceof Array) && value.__enum__ == null || js.Boot.__instanceof(value,List)) {
		var v = value;
		tjson.TJSON.encodeIterable(buffer,v,style,depth + 1);
	} else if(js.Boot.__instanceof(value,List)) {
		var v1 = value;
		tjson.TJSON.encodeIterable(buffer,v1,style,depth + 1);
	} else if(js.Boot.__instanceof(value,haxe.ds.StringMap)) tjson.TJSON.encodeMap(buffer,value,style,depth + 1); else if(typeof(value) == "string") buffer.add("\"" + StringTools.replace(StringTools.replace(StringTools.replace(StringTools.replace(Std.string(value),"\\","\\\\"),"\n","\\n"),"\r","\\r"),"\"","\\\"") + "\""); else if(typeof(value) == "boolean") buffer.add(value); else if(Reflect.isObject(value)) tjson.TJSON.encodeObject(buffer,value,style,depth + 1); else if(value == null) buffer.b += "null"; else throw "Unsupported field type: " + Std.string(value);
};
tjson.EncodeStyle = function() { };
$hxClasses["tjson.EncodeStyle"] = tjson.EncodeStyle;
tjson.EncodeStyle.__name__ = ["tjson","EncodeStyle"];
tjson.EncodeStyle.prototype = {
	beginObject: null
	,endObject: null
	,beginArray: null
	,endArray: null
	,firstEntry: null
	,entrySeperator: null
	,keyValueSeperator: null
	,__class__: tjson.EncodeStyle
};
tjson.SimpleStyle = function() {
};
$hxClasses["tjson.SimpleStyle"] = tjson.SimpleStyle;
tjson.SimpleStyle.__name__ = ["tjson","SimpleStyle"];
tjson.SimpleStyle.__interfaces__ = [tjson.EncodeStyle];
tjson.SimpleStyle.prototype = {
	beginObject: function(depth) {
		return "{";
	}
	,endObject: function(depth) {
		return "}";
	}
	,beginArray: function(depth) {
		return "[";
	}
	,endArray: function(depth) {
		return "]";
	}
	,firstEntry: function(depth) {
		return "";
	}
	,entrySeperator: function(depth) {
		return ",";
	}
	,keyValueSeperator: function(depth) {
		return ":";
	}
	,__class__: tjson.SimpleStyle
};
tjson.FancyStyle = function(tab) {
	if(tab == null) tab = "    ";
	this.tab = tab;
	this.charTimesNCache = [""];
};
$hxClasses["tjson.FancyStyle"] = tjson.FancyStyle;
tjson.FancyStyle.__name__ = ["tjson","FancyStyle"];
tjson.FancyStyle.__interfaces__ = [tjson.EncodeStyle];
tjson.FancyStyle.prototype = {
	tab: null
	,beginObject: function(depth) {
		return "{\n";
	}
	,endObject: function(depth) {
		return "\n" + this.charTimesN(depth) + "}";
	}
	,beginArray: function(depth) {
		return "[\n";
	}
	,endArray: function(depth) {
		return "\n" + this.charTimesN(depth) + "]";
	}
	,firstEntry: function(depth) {
		return this.charTimesN(depth + 1) + " ";
	}
	,entrySeperator: function(depth) {
		return "\n" + this.charTimesN(depth + 1) + ",";
	}
	,keyValueSeperator: function(depth) {
		return " : ";
	}
	,charTimesNCache: null
	,charTimesN: function(n) {
		if(n < this.charTimesNCache.length) return this.charTimesNCache[n]; else return this.charTimesNCache[n] = this.charTimesN(n - 1) + this.tab;
	}
	,__class__: tjson.FancyStyle
};
var watchers = {};
watchers.LocaleWatcher = function() { };
$hxClasses["watchers.LocaleWatcher"] = watchers.LocaleWatcher;
watchers.LocaleWatcher.__name__ = ["watchers","LocaleWatcher"];
watchers.LocaleWatcher.load = function() {
	if(watchers.LocaleWatcher.watcher != null) watchers.LocaleWatcher.watcher.close();
	watchers.LocaleWatcher.parse();
	watchers.LocaleWatcher.watcher = watchers.Watcher.watchFileForUpdates(watchers.LocaleWatcher.pathToLocale,function() {
		watchers.LocaleWatcher.parse();
		watchers.LocaleWatcher.processHtmlElements();
	},1000);
	watchers.LocaleWatcher.processHtmlElements();
	if(!watchers.LocaleWatcher.listenerAdded) {
		nodejs.webkit.Window.get().on("close",function(e) {
			if(watchers.LocaleWatcher.watcher != null) watchers.LocaleWatcher.watcher.close();
		});
		watchers.LocaleWatcher.listenerAdded = true;
	}
};
watchers.LocaleWatcher.parse = function() {
	watchers.LocaleWatcher.pathToLocale = js.Node.require("path").join("core","locale",watchers.SettingsWatcher.settings.locale);
	var options = { };
	options.encoding = "utf8";
	var data = js.Node.require("fs").readFileSync(watchers.LocaleWatcher.pathToLocale,options);
	watchers.LocaleWatcher.localeData = tjson.TJSON.parse(data);
};
watchers.LocaleWatcher.getStringSync = function(name) {
	var value = name;
	if(Object.prototype.hasOwnProperty.call(watchers.LocaleWatcher.localeData,name)) value = Reflect.field(watchers.LocaleWatcher.localeData,name); else {
		watchers.LocaleWatcher.localeData[name] = name;
		var data = tjson.TJSON.encode(watchers.LocaleWatcher.localeData,"fancy");
		js.Node.require("fs").writeFileSync(watchers.LocaleWatcher.pathToLocale,data,"utf8");
	}
	return value;
};
watchers.LocaleWatcher.processHtmlElements = function() {
	var element;
	var value;
	var _g = 0;
	var _g1 = window.document.getElementsByTagName("*");
	while(_g < _g1.length) {
		var node = _g1[_g];
		++_g;
		element = js.Boot.__cast(node , Element);
		value = element.getAttribute("localeString");
		if(value != null) element.textContent = watchers.LocaleWatcher.getStringSync(value);
	}
};
watchers.SettingsWatcher = function() { };
$hxClasses["watchers.SettingsWatcher"] = watchers.SettingsWatcher;
watchers.SettingsWatcher.__name__ = ["watchers","SettingsWatcher"];
watchers.SettingsWatcher.load = function() {
	watchers.SettingsWatcher.pathToSettings = js.Node.require("path").join("core","config","settings.json");
	watchers.SettingsWatcher.watcher = watchers.Watcher.watchFileForUpdates(watchers.SettingsWatcher.pathToSettings,watchers.SettingsWatcher.parse,3000);
	watchers.SettingsWatcher.parse();
	nodejs.webkit.Window.get().on("close",function(e) {
		if(watchers.SettingsWatcher.watcher != null) watchers.SettingsWatcher.watcher.close();
	});
};
watchers.SettingsWatcher.parse = function() {
	var options = { };
	options.encoding = "utf8";
	var data = js.Node.require("fs").readFileSync(watchers.SettingsWatcher.pathToSettings,options);
	watchers.SettingsWatcher.settings = tjson.TJSON.parse(data);
	watchers.ThemeWatcher.load();
	watchers.LocaleWatcher.load();
	if(projectaccess.ProjectAccess.path != null) filetree.FileTree.load();
};
watchers.SettingsWatcher.isItemInIgnoreList = function(path) {
	var ignored = false;
	var ereg;
	var _g = 0;
	var _g1 = watchers.SettingsWatcher.settings.ignore;
	while(_g < _g1.length) {
		var item = _g1[_g];
		++_g;
		ereg = new EReg(item,"");
		if(ereg.match(path)) {
			ignored = true;
			break;
		}
	}
	return ignored;
};
watchers.SnippetsWatcher = function() { };
$hxClasses["watchers.SnippetsWatcher"] = watchers.SnippetsWatcher;
watchers.SnippetsWatcher.__name__ = ["watchers","SnippetsWatcher"];
watchers.SnippetsWatcher.load = function() {
	var pathToFile = js.Node.require("path").join("core","config","snippets.json");
	watchers.SnippetsWatcher.watcher = watchers.Watcher.watchFileForUpdates(pathToFile,function() {
		completion.SnippetsCompletion.load();
	},1000);
	nodejs.webkit.Window.get().on("close",function(e) {
		if(watchers.SnippetsWatcher.watcher != null) watchers.SnippetsWatcher.watcher.close();
	});
};
watchers.ThemeWatcher = function() { };
$hxClasses["watchers.ThemeWatcher"] = watchers.ThemeWatcher;
watchers.ThemeWatcher.__name__ = ["watchers","ThemeWatcher"];
watchers.ThemeWatcher.load = function() {
	watchers.ThemeWatcher.pathToTheme = js.Node.require("path").join("core",watchers.SettingsWatcher.settings.theme);
	js.Node.require("fs").exists(watchers.ThemeWatcher.pathToTheme,function(exists) {
		if(exists) watchers.ThemeWatcher.continueLoading(); else Alertify.log("File " + watchers.ThemeWatcher.pathToTheme + " for theme " + watchers.SettingsWatcher.settings.theme + " was not found. CSS files in core folder: [" + watchers.ThemeWatcher.getListOfCSSFiles().join(",") + "]","",10000);
	});
};
watchers.ThemeWatcher.continueLoading = function() {
	watchers.ThemeWatcher.updateTheme();
	if(watchers.ThemeWatcher.watcher != null) watchers.ThemeWatcher.watcher.close();
	watchers.ThemeWatcher.watcher = watchers.Watcher.watchFileForUpdates(watchers.ThemeWatcher.pathToTheme,function() {
		watchers.ThemeWatcher.updateTheme();
	},1000);
	if(!watchers.ThemeWatcher.listenerAdded) {
		nodejs.webkit.Window.get().on("close",function(e) {
			if(watchers.ThemeWatcher.watcher != null) watchers.ThemeWatcher.watcher.close();
		});
		watchers.ThemeWatcher.listenerAdded = true;
	}
};
watchers.ThemeWatcher.getListOfCSSFiles = function() {
	var files = [];
	var _g = 0;
	var _g1 = js.Node.require("fs").readdirSync("core");
	while(_g < _g1.length) {
		var item = _g1[_g];
		++_g;
		if(js.Node.require("path").extname(item) == ".css") files.push(js.Node.require("path").basename(item));
	}
	return files;
};
watchers.ThemeWatcher.updateTheme = function() {
	new $("#theme").attr("href",watchers.SettingsWatcher.settings.theme);
};
watchers.Watcher = function() { };
$hxClasses["watchers.Watcher"] = watchers.Watcher;
watchers.Watcher.__name__ = ["watchers","Watcher"];
watchers.Watcher.watchFileForUpdates = function(_path,onUpdate,_interval) {
	var config = { path : _path, listener : function(changeType,filePath,fileCurrentStat,filePreviousStat) {
		if(changeType == "update") onUpdate();
	}};
	if(_interval != null) config.interval = _interval;
	var watcher = Watchr.watch(config);
	return watcher;
};
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
var Alertify = alertify;
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
$hxClasses.Math = Math;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i1) {
	return isNaN(i1);
};
String.prototype.__class__ = $hxClasses.String = String;
String.__name__ = ["String"];
$hxClasses.Array = Array;
Array.__name__ = ["Array"];
Date.prototype.__class__ = $hxClasses.Date = Date;
Date.__name__ = ["Date"];
var Int = $hxClasses.Int = { __name__ : ["Int"]};
var Dynamic = $hxClasses.Dynamic = { __name__ : ["Dynamic"]};
var Float = $hxClasses.Float = Number;
Float.__name__ = ["Float"];
var Bool = $hxClasses.Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = $hxClasses.Class = { __name__ : ["Class"]};
var Enum = { };
if(Array.prototype.map == null) Array.prototype.map = function(f) {
	var a = [];
	var _g1 = 0;
	var _g = this.length;
	while(_g1 < _g) {
		var i = _g1++;
		a[i] = f(this[i]);
	}
	return a;
};
Xml.Element = "element";
Xml.PCData = "pcdata";
Xml.CData = "cdata";
Xml.Comment = "comment";
Xml.DocType = "doctype";
Xml.ProcessingInstruction = "processingInstruction";
Xml.Document = "document";
nodejs.webkit.$ui = require('nw.gui');
nodejs.webkit.Window = nodejs.webkit.$ui.Window;
haxe.Resource.content = [{ name : "config", data : "ewoJIm1heGltdW1fbGluZV9sZW5ndGgiOjgwLAoJIm1vZGlmaWVyX29yZGVyIjpbIm92ZXJyaWRlIiwgInB1YmxpYyIsICJwcml2YXRlIiwgInN0YXRpYyIsICJleHRlcm4iLCAiZHluYW1pYyIsICJpbmxpbmUiLCAibWFjcm8iXSwKCSJpbmRlbnRfd2l0aF90YWJzIjpmYWxzZSwKCSJ0YWJfd2lkdGgiOjQsCgkicHJpbnRfcm9vdF9wYWNrYWdlIjpmYWxzZSwKCSJlbXB0eV9saW5lX2FmdGVyX3BhY2thZ2UiOnRydWUsCgkiZW1wdHlfbGluZV9hZnRlcl9pbXBvcnQiOmZhbHNlLAoJImVtcHR5X2xpbmVfYmVmb3JlX3R5cGUiOnRydWUsCgkiY3VkZGxlX3R5cGVfYnJhY2VzIjpmYWxzZSwKCSJjdWRkbGVfbWV0aG9kX2JyYWNlcyI6ZmFsc2UsCgkiZW1wdHlfbGluZV9iZXR3ZWVuX2ZpZWxkcyI6dHJ1ZSwKCSJzcGFjZV9iZXR3ZWVuX3R5cGVfcGFyYW1zIjp0cnVlLAoJInNwYWNlX2JldHdlZW5fYW5vbl90eXBlX2ZpZWxkcyI6dHJ1ZSwKCSJzcGFjZV9iZXR3ZWVuX3R5cGVfcGFyYW1fY29uc3RyYWludHMiOnRydWUsCgkiaW5saW5lX2VtcHR5X2JyYWNlcyI6dHJ1ZSwKCSJleHRlbmRzX29uX25ld2xpbmUiOmZhbHNlLAoJImltcGxlbWVudHNfb25fbmV3bGluZSI6ZmFsc2UsCgkiZnVuY3Rpb25fYXJnX29uX25ld2xpbmUiOmZhbHNlLAoJInNwYWNlX2JldHdlZW5fZnVuY3Rpb25fYXJncyI6dHJ1ZSwKCSJzcGFjZV9hcm91bmRfZnVuY3Rpb25fYXJnX2Fzc2lnbiI6dHJ1ZSwKCSJzcGFjZV9hcm91bmRfcHJvcGVydHlfYXNzaWduIjp0cnVlLAoJInNwYWNlX2JldHdlbl9wcm9wZXJ0eV9nZXRfc2V0Ijp0cnVlLAoJInJlbW92ZV9wcml2YXRlX2ZpZWxkX21vZGlmaWVyIjp0cnVlLAoJImVtcHR5X2xpbmVfYmV0d2Vlbl9lbnVtX2NvbnN0cnVjdG9ycyI6ZmFsc2UsCgkiZW1wdHlfbGluZV9iZXR3ZWVuX3R5cGVkZWZfZmllbGRzIjpmYWxzZSwKCSJzcGFjZV9iZXR3ZWVuX2VudW1fY29uc3RydWN0b3JfYXJncyI6dHJ1ZQp9"}];
var module, setImmediate, clearImmediate;
js.Node.setTimeout = setTimeout;
js.Node.clearTimeout = clearTimeout;
js.Node.setInterval = setInterval;
js.Node.clearInterval = clearInterval;
js.Node.global = global;
js.Node.process = process;
js.Node.require = require;
js.Node.console = console;
js.Node.module = module;
js.Node.stringify = JSON.stringify;
js.Node.parse = JSON.parse;
var version = HxOverrides.substr(js.Node.process.version,1,null).split(".").map(Std.parseInt);
if(version[0] > 0 || version[1] >= 9) {
	js.Node.setImmediate = setImmediate;
	js.Node.clearImmediate = clearImmediate;
}
js.node.Mkdirp._mkdirp = js.Node.require("mkdirp");
js.node.Mv.mv = js.Node.require("mv");
js.node.Remove.remove = js.Node.require("remove");
Walkdir.walkdir = js.Node.require("walkdir");
var Watchr = js.Node.require("watchr");
nodejs.webkit.App = nodejs.webkit.$ui.App;
nodejs.webkit.Clipboard = nodejs.webkit.$ui.Clipboard;
nodejs.webkit.Menu = nodejs.webkit.$ui.Menu;
nodejs.webkit.MenuItem = nodejs.webkit.$ui.MenuItem;
nodejs.webkit.Shell = nodejs.webkit.$ui.Shell;
HIDE.windows = [];
cm.ColorPreview.top = 0;
cm.ColorPreview.left = 0;
cm.ERegPreview.markers = [];
core.AnnotationRuler.positions = [];
core.Completion.WORD = new EReg("[A-Z]+$","i");
core.Completion.RANGE = 500;
core.Completion.completions = [];
core.Completion.completionType = core.CompletionType.REGULAR;
core.FunctionParametersHelper.widgets = [];
core.HaxeLint.fileData = new haxe.ds.StringMap();
core.HaxeLint.parserData = new haxe.ds.StringMap();
core.Helper.timers = new haxe.ds.StringMap();
core.Hotkeys.hotkeys = new Array();
core.Hotkeys.commandMap = new haxe.ds.StringMap();
core.Hotkeys.spanMap = new haxe.ds.StringMap();
core.Hotkeys.commandKey = core.Utils.os == 2;
core.OutlinePanel.source = [];
core.PreserveWindowState.isMaximizationEvent = false;
core.PreserveWindowState.window = nodejs.webkit.Window.get();
core.RecentProjectsList.projectList = [];
core.RecentProjectsList.fileList = [];
haxe.Serializer.USE_CACHE = false;
haxe.Serializer.USE_ENUM_INDEX = false;
haxe.Serializer.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:";
haxe.Unserializer.DEFAULT_RESOLVER = Type;
haxe.Unserializer.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:";
haxe.crypto.Base64.CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
haxe.crypto.Base64.BYTES = haxe.io.Bytes.ofString(haxe.crypto.Base64.CHARS);
haxe.ds.ObjectMap.count = 0;
haxe.xml.Parser.escapes = (function($this) {
	var $r;
	var h = new haxe.ds.StringMap();
	h.set("lt","<");
	h.set("gt",">");
	h.set("amp","&");
	h.set("quot","\"");
	h.set("apos","'");
	h.set("nbsp",String.fromCharCode(160));
	$r = h;
	return $r;
}(this));
hxparse.LexEngine.EMPTY = [];
hxparse.LexEngine.ALL_CHARS = [{ min : 0, max : 255}];
haxeparser.HaxeLexer.keywords = (function($this) {
	var $r;
	var _g = new haxe.ds.StringMap();
	_g.set("abstract",haxeparser.Keyword.KwdAbstract);
	_g.set("break",haxeparser.Keyword.KwdBreak);
	_g.set("case",haxeparser.Keyword.KwdCase);
	_g.set("cast",haxeparser.Keyword.KwdCast);
	_g.set("catch",haxeparser.Keyword.KwdCatch);
	_g.set("class",haxeparser.Keyword.KwdClass);
	_g.set("continue",haxeparser.Keyword.KwdContinue);
	_g.set("default",haxeparser.Keyword.KwdDefault);
	_g.set("do",haxeparser.Keyword.KwdDo);
	_g.set("dynamic",haxeparser.Keyword.KwdDynamic);
	_g.set("else",haxeparser.Keyword.KwdElse);
	_g.set("enum",haxeparser.Keyword.KwdEnum);
	_g.set("extends",haxeparser.Keyword.KwdExtends);
	_g.set("extern",haxeparser.Keyword.KwdExtern);
	_g.set("false",haxeparser.Keyword.KwdFalse);
	_g.set("for",haxeparser.Keyword.KwdFor);
	_g.set("function",haxeparser.Keyword.KwdFunction);
	_g.set("if",haxeparser.Keyword.KwdIf);
	_g.set("implements",haxeparser.Keyword.KwdImplements);
	_g.set("import",haxeparser.Keyword.KwdImport);
	_g.set("in",haxeparser.Keyword.KwdIn);
	_g.set("inline",haxeparser.Keyword.KwdInline);
	_g.set("interface",haxeparser.Keyword.KwdInterface);
	_g.set("macro",haxeparser.Keyword.KwdMacro);
	_g.set("new",haxeparser.Keyword.KwdNew);
	_g.set("null",haxeparser.Keyword.KwdNull);
	_g.set("override",haxeparser.Keyword.KwdOverride);
	_g.set("package",haxeparser.Keyword.KwdPackage);
	_g.set("private",haxeparser.Keyword.KwdPrivate);
	_g.set("public",haxeparser.Keyword.KwdPublic);
	_g.set("return",haxeparser.Keyword.KwdReturn);
	_g.set("static",haxeparser.Keyword.KwdStatic);
	_g.set("switch",haxeparser.Keyword.KwdSwitch);
	_g.set("this",haxeparser.Keyword.KwdThis);
	_g.set("throw",haxeparser.Keyword.KwdThrow);
	_g.set("true",haxeparser.Keyword.KwdTrue);
	_g.set("try",haxeparser.Keyword.KwdTry);
	_g.set("typedef",haxeparser.Keyword.KwdTypedef);
	_g.set("untyped",haxeparser.Keyword.KwdUntyped);
	_g.set("using",haxeparser.Keyword.KwdUsing);
	_g.set("var",haxeparser.Keyword.KwdVar);
	_g.set("while",haxeparser.Keyword.KwdWhile);
	$r = _g;
	return $r;
}(this));
haxeparser.HaxeLexer.buf = new StringBuf();
haxeparser.HaxeLexer.tok = hxparse.Lexer.buildRuleset([{ rule : "", func : function(lexer) {
	return haxeparser.HaxeLexer.mk(lexer,haxeparser.TokenDef.Eof);
}},{ rule : "[\r\n\t ]+", func : function(lexer1) {
	return lexer1.token(haxeparser.HaxeLexer.tok);
}},{ rule : "0x[0-9a-fA-F]+", func : function(lexer2) {
	return haxeparser.HaxeLexer.mk(lexer2,haxeparser.TokenDef.Const(haxe.macro.Constant.CInt(lexer2.current)));
}},{ rule : "[0-9]+", func : function(lexer3) {
	return haxeparser.HaxeLexer.mk(lexer3,haxeparser.TokenDef.Const(haxe.macro.Constant.CInt(lexer3.current)));
}},{ rule : "[0-9]+\\.[0-9]+", func : function(lexer4) {
	return haxeparser.HaxeLexer.mk(lexer4,haxeparser.TokenDef.Const(haxe.macro.Constant.CFloat(lexer4.current)));
}},{ rule : "\\.[0-9]+", func : function(lexer5) {
	return haxeparser.HaxeLexer.mk(lexer5,haxeparser.TokenDef.Const(haxe.macro.Constant.CFloat(lexer5.current)));
}},{ rule : "[0-9]+[eE][\\+\\-]?[0-9]+", func : function(lexer6) {
	return haxeparser.HaxeLexer.mk(lexer6,haxeparser.TokenDef.Const(haxe.macro.Constant.CFloat(lexer6.current)));
}},{ rule : "[0-9]+\\.[0-9]*[eE][\\+\\-]?[0-9]+", func : function(lexer7) {
	return haxeparser.HaxeLexer.mk(lexer7,haxeparser.TokenDef.Const(haxe.macro.Constant.CFloat(lexer7.current)));
}},{ rule : "[0-9]+\\.\\.\\.", func : function(lexer8) {
	return haxeparser.HaxeLexer.mk(lexer8,haxeparser.TokenDef.IntInterval(HxOverrides.substr(lexer8.current,0,-3)));
}},{ rule : "//[^\n\r]*", func : function(lexer9) {
	return haxeparser.HaxeLexer.mk(lexer9,haxeparser.TokenDef.CommentLine(HxOverrides.substr(lexer9.current,2,null)));
}},{ rule : "+\\+", func : function(lexer10) {
	return haxeparser.HaxeLexer.mk(lexer10,haxeparser.TokenDef.Unop(haxe.macro.Unop.OpIncrement));
}},{ rule : "--", func : function(lexer11) {
	return haxeparser.HaxeLexer.mk(lexer11,haxeparser.TokenDef.Unop(haxe.macro.Unop.OpDecrement));
}},{ rule : "~", func : function(lexer12) {
	return haxeparser.HaxeLexer.mk(lexer12,haxeparser.TokenDef.Unop(haxe.macro.Unop.OpNegBits));
}},{ rule : "%=", func : function(lexer13) {
	return haxeparser.HaxeLexer.mk(lexer13,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpAssignOp(haxe.macro.Binop.OpMod)));
}},{ rule : "&=", func : function(lexer14) {
	return haxeparser.HaxeLexer.mk(lexer14,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpAssignOp(haxe.macro.Binop.OpAnd)));
}},{ rule : "|=", func : function(lexer15) {
	return haxeparser.HaxeLexer.mk(lexer15,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpAssignOp(haxe.macro.Binop.OpOr)));
}},{ rule : "^=", func : function(lexer16) {
	return haxeparser.HaxeLexer.mk(lexer16,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpAssignOp(haxe.macro.Binop.OpXor)));
}},{ rule : "+=", func : function(lexer17) {
	return haxeparser.HaxeLexer.mk(lexer17,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpAssignOp(haxe.macro.Binop.OpAdd)));
}},{ rule : "-=", func : function(lexer18) {
	return haxeparser.HaxeLexer.mk(lexer18,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpAssignOp(haxe.macro.Binop.OpSub)));
}},{ rule : "*=", func : function(lexer19) {
	return haxeparser.HaxeLexer.mk(lexer19,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpAssignOp(haxe.macro.Binop.OpMult)));
}},{ rule : "/=", func : function(lexer20) {
	return haxeparser.HaxeLexer.mk(lexer20,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpAssignOp(haxe.macro.Binop.OpDiv)));
}},{ rule : "<<=", func : function(lexer21) {
	return haxeparser.HaxeLexer.mk(lexer21,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpAssignOp(haxe.macro.Binop.OpShl)));
}},{ rule : "==", func : function(lexer22) {
	return haxeparser.HaxeLexer.mk(lexer22,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpEq));
}},{ rule : "!=", func : function(lexer23) {
	return haxeparser.HaxeLexer.mk(lexer23,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpNotEq));
}},{ rule : "<=", func : function(lexer24) {
	return haxeparser.HaxeLexer.mk(lexer24,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpLte));
}},{ rule : "&&", func : function(lexer25) {
	return haxeparser.HaxeLexer.mk(lexer25,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpBoolAnd));
}},{ rule : "|\\|", func : function(lexer26) {
	return haxeparser.HaxeLexer.mk(lexer26,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpBoolOr));
}},{ rule : "<<", func : function(lexer27) {
	return haxeparser.HaxeLexer.mk(lexer27,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpShl));
}},{ rule : "->", func : function(lexer28) {
	return haxeparser.HaxeLexer.mk(lexer28,haxeparser.TokenDef.Arrow);
}},{ rule : "\\.\\.\\.", func : function(lexer29) {
	return haxeparser.HaxeLexer.mk(lexer29,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpInterval));
}},{ rule : "=>", func : function(lexer30) {
	return haxeparser.HaxeLexer.mk(lexer30,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpArrow));
}},{ rule : "!", func : function(lexer31) {
	return haxeparser.HaxeLexer.mk(lexer31,haxeparser.TokenDef.Unop(haxe.macro.Unop.OpNot));
}},{ rule : "<", func : function(lexer32) {
	return haxeparser.HaxeLexer.mk(lexer32,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpLt));
}},{ rule : ">", func : function(lexer33) {
	return haxeparser.HaxeLexer.mk(lexer33,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpGt));
}},{ rule : ";", func : function(lexer34) {
	return haxeparser.HaxeLexer.mk(lexer34,haxeparser.TokenDef.Semicolon);
}},{ rule : ":", func : function(lexer35) {
	return haxeparser.HaxeLexer.mk(lexer35,haxeparser.TokenDef.DblDot);
}},{ rule : ",", func : function(lexer36) {
	return haxeparser.HaxeLexer.mk(lexer36,haxeparser.TokenDef.Comma);
}},{ rule : "\\.", func : function(lexer37) {
	return haxeparser.HaxeLexer.mk(lexer37,haxeparser.TokenDef.Dot);
}},{ rule : "%", func : function(lexer38) {
	return haxeparser.HaxeLexer.mk(lexer38,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpMod));
}},{ rule : "&", func : function(lexer39) {
	return haxeparser.HaxeLexer.mk(lexer39,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpAnd));
}},{ rule : "|", func : function(lexer40) {
	return haxeparser.HaxeLexer.mk(lexer40,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpOr));
}},{ rule : "^", func : function(lexer41) {
	return haxeparser.HaxeLexer.mk(lexer41,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpXor));
}},{ rule : "+", func : function(lexer42) {
	return haxeparser.HaxeLexer.mk(lexer42,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpAdd));
}},{ rule : "*", func : function(lexer43) {
	return haxeparser.HaxeLexer.mk(lexer43,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpMult));
}},{ rule : "/", func : function(lexer44) {
	return haxeparser.HaxeLexer.mk(lexer44,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpDiv));
}},{ rule : "-", func : function(lexer45) {
	return haxeparser.HaxeLexer.mk(lexer45,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpSub));
}},{ rule : "=", func : function(lexer46) {
	return haxeparser.HaxeLexer.mk(lexer46,haxeparser.TokenDef.Binop(haxe.macro.Binop.OpAssign));
}},{ rule : "[", func : function(lexer47) {
	return haxeparser.HaxeLexer.mk(lexer47,haxeparser.TokenDef.BkOpen);
}},{ rule : "]", func : function(lexer48) {
	return haxeparser.HaxeLexer.mk(lexer48,haxeparser.TokenDef.BkClose);
}},{ rule : "{", func : function(lexer49) {
	return haxeparser.HaxeLexer.mk(lexer49,haxeparser.TokenDef.BrOpen);
}},{ rule : "}", func : function(lexer50) {
	return haxeparser.HaxeLexer.mk(lexer50,haxeparser.TokenDef.BrClose);
}},{ rule : "\\(", func : function(lexer51) {
	return haxeparser.HaxeLexer.mk(lexer51,haxeparser.TokenDef.POpen);
}},{ rule : "\\)", func : function(lexer52) {
	return haxeparser.HaxeLexer.mk(lexer52,haxeparser.TokenDef.PClose);
}},{ rule : "?", func : function(lexer53) {
	return haxeparser.HaxeLexer.mk(lexer53,haxeparser.TokenDef.Question);
}},{ rule : "@", func : function(lexer54) {
	return haxeparser.HaxeLexer.mk(lexer54,haxeparser.TokenDef.At);
}},{ rule : "\"", func : function(lexer55) {
	haxeparser.HaxeLexer.buf = new StringBuf();
	var pmin = new hxparse.Position(lexer55.source,lexer55.pos - lexer55.current.length,lexer55.pos);
	var pmax;
	try {
		pmax = lexer55.token(haxeparser.HaxeLexer.string);
	} catch( e ) {
		if( js.Boot.__instanceof(e,haxe.io.Eof) ) {
			throw new haxeparser.LexerError(haxeparser.LexerErrorMsg.UnterminatedString,haxeparser.HaxeLexer.mkPos(pmin));
		} else throw(e);
	}
	var token = haxeparser.HaxeLexer.mk(lexer55,haxeparser.TokenDef.Const(haxe.macro.Constant.CString(haxeparser.HaxeLexer.unescape(haxeparser.HaxeLexer.buf.b))));
	token.pos.min = pmin.pmin;
	return token;
}},{ rule : "'", func : function(lexer56) {
	haxeparser.HaxeLexer.buf = new StringBuf();
	var pmin1 = new hxparse.Position(lexer56.source,lexer56.pos - lexer56.current.length,lexer56.pos);
	var pmax1;
	try {
		pmax1 = lexer56.token(haxeparser.HaxeLexer.string2);
	} catch( e1 ) {
		if( js.Boot.__instanceof(e1,haxe.io.Eof) ) {
			throw new haxeparser.LexerError(haxeparser.LexerErrorMsg.UnterminatedString,haxeparser.HaxeLexer.mkPos(pmin1));
		} else throw(e1);
	}
	var token1 = haxeparser.HaxeLexer.mk(lexer56,haxeparser.TokenDef.Const(haxe.macro.Constant.CString(haxeparser.HaxeLexer.unescape(haxeparser.HaxeLexer.buf.b))));
	token1.pos.min = pmin1.pmin;
	return token1;
}},{ rule : "~/", func : function(lexer57) {
	haxeparser.HaxeLexer.buf = new StringBuf();
	var pmin2 = new hxparse.Position(lexer57.source,lexer57.pos - lexer57.current.length,lexer57.pos);
	var info;
	try {
		info = lexer57.token(haxeparser.HaxeLexer.regexp);
	} catch( e2 ) {
		if( js.Boot.__instanceof(e2,haxe.io.Eof) ) {
			throw new haxeparser.LexerError(haxeparser.LexerErrorMsg.UnterminatedRegExp,haxeparser.HaxeLexer.mkPos(pmin2));
		} else throw(e2);
	}
	var token2 = haxeparser.HaxeLexer.mk(lexer57,haxeparser.TokenDef.Const(haxe.macro.Constant.CRegexp(haxeparser.HaxeLexer.buf.b,info.opt)));
	token2.pos.min = pmin2.pmin;
	return token2;
}},{ rule : "/\\*", func : function(lexer58) {
	haxeparser.HaxeLexer.buf = new StringBuf();
	var pmin3 = new hxparse.Position(lexer58.source,lexer58.pos - lexer58.current.length,lexer58.pos);
	var pmax2;
	try {
		pmax2 = lexer58.token(haxeparser.HaxeLexer.comment);
	} catch( e3 ) {
		if( js.Boot.__instanceof(e3,haxe.io.Eof) ) {
			throw new haxeparser.LexerError(haxeparser.LexerErrorMsg.UnclosedComment,haxeparser.HaxeLexer.mkPos(pmin3));
		} else throw(e3);
	}
	var token3 = haxeparser.HaxeLexer.mk(lexer58,haxeparser.TokenDef.Comment(haxeparser.HaxeLexer.buf.b));
	token3.pos.min = pmin3.pmin;
	return token3;
}},{ rule : "(#)(_*[a-z][a-zA-Z0-9_]*|_+|_+[0-9][_a-zA-Z0-9]*)", func : function(lexer59) {
	return haxeparser.HaxeLexer.mk(lexer59,haxeparser.TokenDef.Sharp(HxOverrides.substr(lexer59.current,1,null)));
}},{ rule : "$[_a-zA-Z0-9]*", func : function(lexer60) {
	return haxeparser.HaxeLexer.mk(lexer60,haxeparser.TokenDef.Dollar(HxOverrides.substr(lexer60.current,1,null)));
}},{ rule : "_*[a-z][a-zA-Z0-9_]*|_+|_+[0-9][_a-zA-Z0-9]*", func : function(lexer61) {
	var kwd = haxeparser.HaxeLexer.keywords.get(lexer61.current);
	if(kwd != null) return haxeparser.HaxeLexer.mk(lexer61,haxeparser.TokenDef.Kwd(kwd)); else return haxeparser.HaxeLexer.mk(lexer61,haxeparser.TokenDef.Const(haxe.macro.Constant.CIdent(lexer61.current)));
}},{ rule : "_*[A-Z][a-zA-Z0-9_]*", func : function(lexer62) {
	return haxeparser.HaxeLexer.mk(lexer62,haxeparser.TokenDef.Const(haxe.macro.Constant.CIdent(lexer62.current)));
}}],"tok");
haxeparser.HaxeLexer.string = hxparse.Lexer.buildRuleset([{ rule : "\\\\\\\\", func : function(lexer) {
	haxeparser.HaxeLexer.buf.b += "\\\\";
	return lexer.token(haxeparser.HaxeLexer.string);
}},{ rule : "\\\\", func : function(lexer1) {
	haxeparser.HaxeLexer.buf.b += "\\";
	return lexer1.token(haxeparser.HaxeLexer.string);
}},{ rule : "\\\\n", func : function(lexer2) {
	haxeparser.HaxeLexer.buf.b += "\n";
	return lexer2.token(haxeparser.HaxeLexer.string);
}},{ rule : "\\\\r", func : function(lexer3) {
	haxeparser.HaxeLexer.buf.b += "\r";
	return lexer3.token(haxeparser.HaxeLexer.string);
}},{ rule : "\\\\t", func : function(lexer4) {
	haxeparser.HaxeLexer.buf.b += "\t";
	return lexer4.token(haxeparser.HaxeLexer.string);
}},{ rule : "\\\\\"", func : function(lexer5) {
	haxeparser.HaxeLexer.buf.b += "\"";
	return lexer5.token(haxeparser.HaxeLexer.string);
}},{ rule : "\"", func : function(lexer6) {
	return new hxparse.Position(lexer6.source,lexer6.pos - lexer6.current.length,lexer6.pos).pmax;
}},{ rule : "[^\\\\\"]+", func : function(lexer7) {
	if(lexer7.current == null) haxeparser.HaxeLexer.buf.b += "null"; else haxeparser.HaxeLexer.buf.b += "" + lexer7.current;
	return lexer7.token(haxeparser.HaxeLexer.string);
}}],"string");
haxeparser.HaxeLexer.string2 = hxparse.Lexer.buildRuleset([{ rule : "\\\\\\\\", func : function(lexer) {
	haxeparser.HaxeLexer.buf.b += "\\";
	return lexer.token(haxeparser.HaxeLexer.string2);
}},{ rule : "\\\\n", func : function(lexer1) {
	haxeparser.HaxeLexer.buf.b += "\n";
	return lexer1.token(haxeparser.HaxeLexer.string2);
}},{ rule : "\\\\r", func : function(lexer2) {
	haxeparser.HaxeLexer.buf.b += "\r";
	return lexer2.token(haxeparser.HaxeLexer.string2);
}},{ rule : "\\\\t", func : function(lexer3) {
	haxeparser.HaxeLexer.buf.b += "\t";
	return lexer3.token(haxeparser.HaxeLexer.string2);
}},{ rule : "\\\\'", func : function(lexer4) {
	haxeparser.HaxeLexer.buf.b += "\"";
	return lexer4.token(haxeparser.HaxeLexer.string2);
}},{ rule : "'", func : function(lexer5) {
	return new hxparse.Position(lexer5.source,lexer5.pos - lexer5.current.length,lexer5.pos).pmax;
}},{ rule : "[^\\\\']+", func : function(lexer6) {
	if(lexer6.current == null) haxeparser.HaxeLexer.buf.b += "null"; else haxeparser.HaxeLexer.buf.b += "" + lexer6.current;
	return lexer6.token(haxeparser.HaxeLexer.string2);
}}],"string2");
haxeparser.HaxeLexer.comment = hxparse.Lexer.buildRuleset([{ rule : "*/", func : function(lexer) {
	return new hxparse.Position(lexer.source,lexer.pos - lexer.current.length,lexer.pos).pmax;
}},{ rule : "*", func : function(lexer1) {
	haxeparser.HaxeLexer.buf.b += "*";
	return lexer1.token(haxeparser.HaxeLexer.comment);
}},{ rule : "[^\\*]+", func : function(lexer2) {
	if(lexer2.current == null) haxeparser.HaxeLexer.buf.b += "null"; else haxeparser.HaxeLexer.buf.b += "" + lexer2.current;
	return lexer2.token(haxeparser.HaxeLexer.comment);
}}],"comment");
haxeparser.HaxeLexer.regexp = hxparse.Lexer.buildRuleset([{ rule : "\\\\/", func : function(lexer) {
	haxeparser.HaxeLexer.buf.b += "/";
	return lexer.token(haxeparser.HaxeLexer.regexp);
}},{ rule : "\\\\r", func : function(lexer1) {
	haxeparser.HaxeLexer.buf.b += "\r";
	return lexer1.token(haxeparser.HaxeLexer.regexp);
}},{ rule : "\\\\n", func : function(lexer2) {
	haxeparser.HaxeLexer.buf.b += "\n";
	return lexer2.token(haxeparser.HaxeLexer.regexp);
}},{ rule : "\\\\t", func : function(lexer3) {
	haxeparser.HaxeLexer.buf.b += "\t";
	return lexer3.token(haxeparser.HaxeLexer.regexp);
}},{ rule : "\\\\[\\$\\.*+\\^|{}\\[\\]()?\\-0-9]", func : function(lexer4) {
	if(lexer4.current == null) haxeparser.HaxeLexer.buf.b += "null"; else haxeparser.HaxeLexer.buf.b += "" + lexer4.current;
	return lexer4.token(haxeparser.HaxeLexer.regexp);
}},{ rule : "\\\\[wWbBsSdDx]", func : function(lexer5) {
	if(lexer5.current == null) haxeparser.HaxeLexer.buf.b += "null"; else haxeparser.HaxeLexer.buf.b += "" + lexer5.current;
	return lexer5.token(haxeparser.HaxeLexer.regexp);
}},{ rule : "/", func : function(lexer6) {
	return lexer6.token(haxeparser.HaxeLexer.regexp_options);
}},{ rule : "[^\\\\/\r\n]+", func : function(lexer7) {
	if(lexer7.current == null) haxeparser.HaxeLexer.buf.b += "null"; else haxeparser.HaxeLexer.buf.b += "" + lexer7.current;
	return lexer7.token(haxeparser.HaxeLexer.regexp);
}}],"regexp");
haxeparser.HaxeLexer.regexp_options = hxparse.Lexer.buildRuleset([{ rule : "[gimsu]*", func : function(lexer) {
	return { pmax : new hxparse.Position(lexer.source,lexer.pos - lexer.current.length,lexer.pos).pmax, opt : lexer.current};
}}],"regexp_options");
menu.BootstrapMenu.menus = new haxe.ds.StringMap();
menu.BootstrapMenu.menuArray = new Array();
newprojectdialog.NewProjectDialog.categories = new haxe.ds.StringMap();
newprojectdialog.NewProjectDialog.categoriesArray = new Array();
parser.ClassParser.haxeStdTopLevelClassList = [];
parser.ClassParser.topLevelClassList = [];
parser.ClassParser.haxeStdImports = [];
parser.ClassParser.importsList = [];
parser.ClassParser.classCompletions = new haxe.ds.StringMap();
parser.ClassParser.haxeStdFileList = [];
parser.ClassParser.filesList = [];
pluginloader.PluginManager.pathToPlugins = new haxe.ds.StringMap();
pluginloader.PluginManager.inactivePlugins = [];
pluginloader.PluginManager.requestedPluginsData = new Array();
pluginloader.PluginManager.pluginsMTime = new haxe.ds.StringMap();
pluginloader.PluginManager.firstRun = false;
pluginloader.PluginManager.pluginsTestingData = "  - cd plugins";
projectaccess.ProjectAccess.currentProject = new projectaccess.Project();
watchers.LocaleWatcher.listenerAdded = false;
watchers.ThemeWatcher.listenerAdded = false;
Main.main();
})();

//# sourceMappingURL=HIDE.js.map