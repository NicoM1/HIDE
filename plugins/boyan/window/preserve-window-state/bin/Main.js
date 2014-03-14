(function () { "use strict";
var HxOverrides = function() { };
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
var Main = function() { };
Main.main = function() {
	PreserveWindowState.init();
	HIDE.notifyLoadingComplete(Main.$name);
};
var nodejs = {};
nodejs.webkit = {};
nodejs.webkit.$ui = function() { };
var PreserveWindowState = function() { };
PreserveWindowState.init = function() {
	PreserveWindowState.initWindowState();
	PreserveWindowState.window.on("maximize",function() {
		PreserveWindowState.isMaximizationEvent = true;
		PreserveWindowState.currWinMode = "maximized";
	});
	PreserveWindowState.window.on("unmaximize",function() {
		PreserveWindowState.currWinMode = "normal";
		PreserveWindowState.restoreWindowState();
	});
	PreserveWindowState.window.on("minimize",function() {
		PreserveWindowState.currWinMode = "minimized";
	});
	PreserveWindowState.window.on("restore",function() {
		PreserveWindowState.currWinMode = "normal";
	});
	PreserveWindowState.window.window.addEventListener("resize",function(e) {
		if(PreserveWindowState.resizeTimeout != null) PreserveWindowState.resizeTimeout.stop();
		PreserveWindowState.resizeTimeout = new haxe.Timer(500);
		PreserveWindowState.resizeTimeout.run = function() {
			if(PreserveWindowState.isMaximizationEvent) PreserveWindowState.isMaximizationEvent = false; else if(PreserveWindowState.currWinMode == "maximized") PreserveWindowState.currWinMode = "normal";
			PreserveWindowState.resizeTimeout.stop();
			PreserveWindowState.dumpWindowState();
		};
	},false);
	PreserveWindowState.window.on("close",function(e1) {
		PreserveWindowState.saveWindowState();
		PreserveWindowState.window.close(true);
	});
};
PreserveWindowState.initWindowState = function() {
	var windowState = js.Browser.getLocalStorage().getItem("windowState");
	if(windowState != null) PreserveWindowState.winState = js.Node.parse(windowState);
	if(PreserveWindowState.winState != null) {
		PreserveWindowState.currWinMode = PreserveWindowState.winState.mode;
		if(PreserveWindowState.currWinMode == "maximized") PreserveWindowState.window.maximize(); else PreserveWindowState.restoreWindowState();
	} else {
		PreserveWindowState.currWinMode = "normal";
		PreserveWindowState.dumpWindowState();
	}
	PreserveWindowState.window.show();
};
PreserveWindowState.dumpWindowState = function() {
	if(PreserveWindowState.winState == null) PreserveWindowState.winState = { };
	if(PreserveWindowState.currWinMode == "maximized") PreserveWindowState.winState.mode = "maximized"; else PreserveWindowState.winState.mode = "normal";
	if(PreserveWindowState.currWinMode == "normal") {
		PreserveWindowState.winState.x = PreserveWindowState.window.x;
		PreserveWindowState.winState.y = PreserveWindowState.window.y;
		PreserveWindowState.winState.width = PreserveWindowState.window.width;
		PreserveWindowState.winState.height = PreserveWindowState.window.height;
	}
};
PreserveWindowState.restoreWindowState = function() {
	PreserveWindowState.window.resizeTo(PreserveWindowState.winState.width,PreserveWindowState.winState.height);
	PreserveWindowState.window.moveTo(PreserveWindowState.winState.x,PreserveWindowState.winState.y);
};
PreserveWindowState.saveWindowState = function() {
	PreserveWindowState.dumpWindowState();
	js.Browser.getLocalStorage().setItem("windowState",js.Node.stringify(PreserveWindowState.winState));
};
var Std = function() { };
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
var haxe = {};
haxe.Timer = function(time_ms) {
	var me = this;
	this.id = setInterval(function() {
		me.run();
	},time_ms);
};
haxe.Timer.prototype = {
	stop: function() {
		if(this.id == null) return;
		clearInterval(this.id);
		this.id = null;
	}
	,run: function() {
	}
};
var js = {};
js.Browser = function() { };
js.Browser.getLocalStorage = function() {
	try {
		var s = window.localStorage;
		s.getItem("");
		return s;
	} catch( e ) {
		return null;
	}
};
js.Node = function() { };
nodejs.webkit.$ui = require('nw.gui');
nodejs.webkit.Window = nodejs.webkit.$ui.Window;
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
nodejs.webkit.Menu = nodejs.webkit.$ui.Menu;
nodejs.webkit.MenuItem = nodejs.webkit.$ui.MenuItem;
Main.$name = "boyan.window.preserve-window-state";
PreserveWindowState.isMaximizationEvent = false;
PreserveWindowState.window = nodejs.webkit.Window.get();
Main.main();
})();

//# sourceMappingURL=Main.js.map