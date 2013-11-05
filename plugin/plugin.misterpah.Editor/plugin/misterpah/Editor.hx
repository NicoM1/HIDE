package plugin.misterpah;
import jQuery.*;
import js.Browser;
import ui.*;
import Utils;

// This is the recommended minimum structure of a HIDE plugin

@:keepSub @:expose class Editor
{
	private static var plugin:Map<String,String>;
    private static var tab_index:Array<String>;
    private static var cm:CodeMirror;
    private static var completion_list:Array<String>;


    public static function main()
    {
    	plugin = new Map();
    	plugin.set("name","Misterpah Editor"); 
    	plugin.set("filename","plugin.misterpah.Editor.js");
    	plugin.set("feature","Editor,Completion"); // 
    	plugin.set("listen_event","core_file_openFile_complete,core_utils_getCompletion_complete"); // events listened by this plugin
    	plugin.set("trigger_event","core_file_save"); // events triggered by this plugin
    	plugin.set("version","0.1");
    	plugin.set("required",""); // other file required by this plugin

    	
        new JQuery(js.Browser.document).on(plugin.get('filename')+'.init',init);
    	Utils.register_plugin(plugin);
        
    }

    public static function init()
    {
        trace(plugin.get("filename")+" started");
        tab_index = new Array();
        completion_list = new Array();

        Utils.loadJavascript("./plugin/support_files/plugin.misterpah/codemirror-3.18/lib/codemirror.js");
        Utils.loadJavascript("./plugin/support_files/plugin.misterpah/codemirror-3.18/mode/haxe/haxe.js");
        Utils.loadJavascript("./plugin/support_files/plugin.misterpah/jquery.xml2json.js");

        // somehow show-hint 3.18 were not working. we'll be use show-hint.js version 3.15;
        Utils.loadJavascript("./plugin/support_files/plugin.misterpah/show-hint-3.15.js");
        Utils.loadCss("./plugin/support_files/plugin.misterpah/codemirror-3.18/lib/codemirror.css");
        Utils.loadCss("./plugin/support_files/plugin.misterpah/show-hint-custom.css");

        create_ui();
        register_hooks(); 	
    }


    public static function create_ui()
    {
        new JQuery("#editor_position").css("display","none");
        new JQuery("#editor_position").append("<div style='margin-top:10px;' id='misterpah_editor_tabs_position'><ul class='nav nav-tabs'></ul></div>");
        new JQuery("#editor_position").append("<div id='misterpah_editor_cm_position'></div>");
        new JQuery("#misterpah_editor_cm_position").append("<textarea style='display:none;' name='misterpah_editor_cm_name' id='misterpah_editor_cm'></textarea>");
        
        cm = CodeMirror.fromTextArea(Browser.document.getElementById("misterpah_editor_cm"), {
            lineNumbers:true,
            matchBrackets: true,
            autoCloseBrackets: true,
            mode:'haxe',
          });

        
        CodeMirror.on(cm,"change",function(cm){
            var path = Main.session.active_file;

            if (path == "") {trace("ignore");return;}
            
            var file_obj = Main.file_stack.find(path);
            //file_obj.set('content',cm.getValue());
            Main.file_stack.update_content(path,cm.getValue());
            //.set(path,file_obj);

            var cursor_pos = cm.indexFromPos(cm.getCursor());
            if (cm.getValue().charAt(cursor_pos - 1) == '.')
                {
                    new JQuery(js.Browser.document).triggerHandler("core_file_save");
                    Utils.system_get_completion(cursor_pos);
                }

            });

        editor_resize();
        CodeMirror.registerHelper("hint","haxe",simpleCompletion);      
    }


    public static function register_hooks()
    {

        new JQuery(js.Browser.document).on("show.bs.tab",function(e):Void
            {
                var target = new JQuery(e.target);
                show_tab(target.attr("data-path"),false);
            });

        new JQuery(js.Browser.document).on("core_file_openFile_complete",function():Void
            {
            new JQuery("#editor_position").css("display","block");
            make_tab();
            });

        new JQuery(js.Browser.window).on("resize",function()
            {
            editor_resize();
            });

        
        // this is to process / add / remove from the completion results
        new JQuery(js.Browser.document).on("core_utils_getCompletion_complete",function(event,data){

            var completion_array:Dynamic = untyped $.xml2json(data);
            
            completion_list = new Array();
            if (completion_array.i == null) // type completion
            {

            }
            else
            {
                for (each in 0...completion_array.i.length)
                {
                    completion_list.push(completion_array.i[each].n);
                }               
            }

            CodeMirror.showHint(cm,simpleCompletion);
            });


    }

    private static  function simpleCompletion(cm:CodeMirror)
    {
        var cur = cm.getCursor();
        var start = cur.ch;
        var end = start;
        return {list: completion_list, from: cur, to: cur};
    }



    private static function editor_resize()
        {
            var win = Utils.gui.Window.get();
            var win_height = cast(win.height,Int);
            var doc_height = new JQuery(js.Browser.document).height();
            var nav_height = new JQuery(".nav").height();
            var tab_height = new JQuery("#misterpah_editor_tabs_position").height();
            new JQuery(".CodeMirror").css("height", (win_height -nav_height - tab_height - 38) +"px");
        }

    private static function close_tab()
    {
        var path = Main.session.active_file; 
        var tab_number = Lambda.indexOf(tab_index,path);
        new JQuery("#misterpah_editor_tabs_position li:eq("+tab_number+")").remove();
        Main.session.active_file = '';
        cm.setOption('value','');
        tab_index.remove(path);
        if (tab_index.length < 1)
        {
            new JQuery("#editor_position").css("display","none");
        }
        else
        {
            new JQuery("#misterpah_editor_cm_position").css("display","none");  
        }
    }


    private static function make_tab()
    {
        
        var path = Main.session.active_file;
        var file_obj = Main.file_stack.find(path);
        tab_index.push(path);
        //var tab_number = Lambda.indexOf(tab_index,path);

        new JQuery("#misterpah_editor_tabs_position ul").append("<li><a data-path='"+path+"' data-toggle='tab'>"+file_obj[2]+"</a></li>");
        show_tab(path);
        cm.setOption('value',file_obj[1]);
        editor_resize();
    }   

    private static function show_tab(path:String,tabShow:Bool=true)
    {
        //editor_resize();
        //trace(path);
        var tab_number = Lambda.indexOf(tab_index,path);
        var file_obj = Main.file_stack.find(path);
        Main.session.active_file = path;
        cm.setOption('value',file_obj[1]);
        if (tabShow == true)
            {
            untyped $("#misterpah_editor_tabs_position li:eq("+tab_number+") a").tab("show");       
            }
        new JQuery("#misterpah_editor_cm_position").css("display","block"); 
    }

}