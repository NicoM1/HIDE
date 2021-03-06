package projectaccess;

/**
 * ...
 * @author AS3Boyan
 */
 
typedef TargetData = {
	@:optional var pathToHxml:String;
	@:optional var runActionType:Int;
	@:optional var runActionText:String;
} 
 
class Project
{
	inline public static var HAXE:Int = 0;
	inline public static var OPENFL:Int = 1;
	inline public static var HXML:Int = 2;
	
	inline public static var FLASH:Int = 0;
	inline public static var JAVASCRIPT:Int = 1;
	inline public static var NEKO:Int = 2;
	inline public static var PHP:Int = 3;
	inline public static var CPP:Int = 4;
	inline public static var JAVA:Int = 5;
	inline public static var CSHARP:Int = 6;
	inline public static var PYTHON:Int = 7;
	
	inline public static var URL:Int = 0;
	inline public static var FILE:Int = 1;
	inline public static var COMMAND:Int = 2;
	//inline public static var WEBSERVER:Int = 3;
	//inline public static var URL_IN_HIDE:Int = 4;
	
	public var type:Int;
	public var target:Int;
	
	public var name:String;
	public var main:String;
	public var projectPackage:String;
	public var company:String;
	public var license:String;
	public var url:String;
	
	public var targetData:Array<TargetData>;
	
	public var files:Array<String>;
	public var activeFile:String;
	
	public var openFLTarget:String;
	
	public var runActionType:Int;
	public var runActionText:String;
	public var buildActionCommand:String;
	
	public var hiddenItems:Array<String>;
	public var showHiddenItems:Bool;
	
	public function new() 
	{
		files = [];
		hiddenItems = [];
		targetData = [];
		
		showHiddenItems = false;
	}
	
}