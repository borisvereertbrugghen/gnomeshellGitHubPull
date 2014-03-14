const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Soup = imports.gi.Soup;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const PopupBaseMenuItem = PopupMenu.PopupBaseMenuItem;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Gio = imports.gi.Gio;
const Mainloop = imports.mainloop;
const Clutter=imports.gi.Clutter;
const ICON_SIZE_INDICATOR = 16;
const Convenience = Extension.imports.convenience;
const UserInfo = Extension.imports.userInfo;
/**
 * Extention part to show the user issues
 */

/**
 * Should be called everey x time to show/refresh the users their issues
 */

function showUsersIssues(httpSession,user){
	if(!user.button){
		doLog(user.name+" Adding IssuesButton");
		user.button = new PanelMenu.Button(0.25, "Issues", false) ;
		let main_box = new St.BoxLayout({ style_class: 'activities_box'});		
		let icon = new St.Icon({ icon_name: 'GitHub-Mark-32px',icon_size : ICON_SIZE_INDICATOR, style:"background-color:#555555;" });
		//let icon =  Clutter.Texture.new_from_file(extensionPath+"/icons/GitHub-Mark-32px.png");
		main_box.add_actor(icon);
		let countLabel = new St.Label({ text: ''});
		user.countLabel=countLabel;
		main_box.add_actor(countLabel);
		// button.actor.connect('button-press-event', _showHello);
		user.button.actor.add_actor(main_box);

		user.popup = new PopupMenu.PopupMenu(user.button.actor, 0.25, St.Side.TOP);
		user.button.setMenu(user.popup);
        
		Main.panel.addToStatusArea('gitHubIssues'+user.name,user.button,0,'right');

    	let box = new St.BoxLayout({ style_class: 'journal' });
		let MenuIcon = new St.Icon({ icon_name: 'Octocat',icon_size : ICON_SIZE_INDICATOR });
    	box.add(MenuIcon);
            // this.icon = Utils.createStatusIcon('jenkins_headshot');
    	let label = new St.Label({ text: user.getName()});

            // this.box.add(this.icon);
    	box.add(label);
    	var serverMenuItem = new PopupBaseMenuItem();
    	serverMenuItem.actor.add_child(box);
    	user.popup.addMenuItem(serverMenuItem);
	};
	var request = Soup.Message.new('GET',user.getUrl());
    request.request_headers.append('Authorization', user.getAuthentication());
    request.request_headers.append('User-Agent', 'githubPull.boris@avezoete.be - git@github.com:borisvereertbrugghen/gnomeshellGitHubPull.git');
    httpSession.send_message(request);
    if (request.status_code !== 200) {
    	serverMenuItem = new PopupBaseMenuItem();
    	serverMenuItem.actor.add_child(new St.Label({ text: ''+request.status_code+''+request.response_body.data+' "'+user.getAuthentication()+'"'}));
    	user.popup.addMenuItem(serverMenuItem);
    	log(""+user.name+"no 200"+request.status_code);
	    log(request.response_body.data);
    }else{
    	var pullsJSON = request.response_body.data;
    	var pulls = JSON.parse(pullsJSON);
    	doLog(user.name+" got pullRequestData");

    	addMenuItems(pulls,user.popup,user);
    	
    };
};

function addMenuItems(pulls,popup,user){
	 var len = pulls.length;
	 if(len>0){
		 user.countLabel.text=''+len;
	 }else{
		 user.countLabel.text='';
	 }
	 for (var i = 0 ; i < len; ++i) {
	     var pull = pulls[i];
	     let serverMenuItem=null;
	     if(popup.numMenuItems >= i+1){
	    	 serverMenuItem = popup._getMenuItems()[i+1];
	     }
	     doLog(user.name+" do "+pull.number);
	     let detailText = createAgeText(pull)+"\n"+pull.user.login;
	     let theLabelText = pull.number+": "+pull.title;
	     if(serverMenuItem){
	    	 serverMenuItem.pull=pull;
    		 serverMenuItem.theLabel.text=theLabelText;
	    	 serverMenuItem.details.text= detailText;
	     }else{
			serverMenuItem = new PopupBaseMenuItem();
			serverMenuItem.pullNumber=pull.number;
			//let icon = Clutter.Texture.new_from_file(pull.head.user.avatar_url);
			let box = new St.BoxLayout({ style_class: 'journal',vertical:"true" });
			let label = new St.Label({ text: theLabelText ,style:"padding-bottom:0px;margin-bottom:0px;"});
			serverMenuItem.theLabel=label;
			box.add(label);
			
			let details = new St.Label({ text: detailText
				,style:"font-size:smaller;padding-left:50px;padding-bottom:0px;margin-bottom:0px;padding-top:0px;margin-top:0px"});
			box.add(details);
			serverMenuItem.details=details;
			//box.add(icon);
			serverMenuItem.actor.add_child(box);
			serverMenuItem.pull=pull;
			serverMenuItem.connect("activate", Lang.bind(this, function(event){
		      Gio.app_info_launch_default_for_uri(event.pull.html_url, global.create_app_launch_context());
		      }));
			popup.addMenuItem(serverMenuItem);
		 }
	 }
	 if(pulls.length<popup.numMenuItems-1){
		 for (var i = len; i < popup.numMenuItems; ++i) {
			 popup._getMenuItems()[i].destroy();
		 }
	 }
}

function createAgeText(pull){
	var crOldMs = new Date().getTime() - new Date(pull.created_at).getTime();
	var crOld = Math.floor(((crOldMs))/1000/60);
	var crOldd=Math.floor(crOld/60/24);
	var crOldh=Math.floor(crOld/60)-crOldd*24;
	var crOldm=crOld%60;
	var upOldMs = new Date().getTime() - new Date(pull.updated_at).getTime();
	var upOld = Math.floor(((upOldMs))/1000/60);
	var upOldd=Math.floor(upOld/60/24);
	var upOldh=Math.floor(upOld/60)-upOldd*24;
	var upOldm=upOld%60;
	return " age:"+crOldd+" "+crOldh+":"+crOldm+" - "+upOldd+" "+upOldh+":"+upOldm;
}



function doLog(logging){
	log("githubPull-"+new Date().toLocaleTimeString()+":"+logging);
};