package projectaccess;
import core.Helper;
import haxe.Json;
import js.Browser;
import js.Node;
import nodejs.webkit.Window;
import projectaccess.Project.TargetData;
import tjson.TJSON;

/**
 * ...
 * @author AS3Boyan
 */
class ProjectAccess
{
	public static var currentProject:Project = new Project();
	
	public static var path:String;
	
	public static function registerSaveOnCloseListener():Void
	{
		var window = Window.get();
		
		window.on("close", function ():Void 
		{
			save(null, true);
			window.close();
			
		});
	}
	
	public static function save(?onComplete:Dynamic, ?sync:Bool = false):Void
	{
		if (ProjectAccess.path != null)
		{
			var pathToProjectHide:String = js.Node.path.join(ProjectAccess.path, "project.hide");
			
			var data:String = TJSON.encode(ProjectAccess.currentProject, 'fancy');
			
			if (sync) 
			{
				Node.fs.writeFileSync(pathToProjectHide, data, js.Node.NodeC.UTF8);
			}
			else 
			{
				Helper.debounce("saveProject", function ():Void 
				{
					Node.fs.writeFile(pathToProjectHide, data, js.Node.NodeC.UTF8, function (error:js.Node.NodeErr)
					{
						if (onComplete != null)
						{
							onComplete();
						}
					}
					);
				}, 250);
			}
		}
		else 
		{
			trace("project path is null");
		}
	}
	
	public static function load(path:String, ?onComplete:Dynamic):Void
	{
		//trace(js.Node.parse());
	}
	
	public static function isItemInIgnoreList(path:String):Bool
	{        
		var ignore:Bool = false;
        
		if (ProjectAccess.path != null && !ProjectAccess.currentProject.showHiddenItems) 
		{
			var relativePath:String = Node.path.relative(ProjectAccess.path, path);
			
			if (ProjectAccess.currentProject.hiddenItems.indexOf(relativePath) != -1) 
			{
				ignore = true;
			}
		}
		
		return ignore;
	}
	
	public static function getPathToHxml():String
	{
		var pathToHxml:String = null;
					
		var project = ProjectAccess.currentProject;
		
		switch (project.type) 
		{
			case Project.HAXE:
				var targetData:TargetData = project.targetData[project.target];
				pathToHxml = targetData.pathToHxml;
			case Project.HXML:
				pathToHxml = project.main;
			default:
		}
		
		return pathToHxml;
	}
}