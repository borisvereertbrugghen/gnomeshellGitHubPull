/*
 * @author Philipp Hoffmann
 */

const Lang = imports.lang;
const Gtk = imports.gi.Gtk;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Settings = Me.imports.settings;

const _ = imports.gettext.domain(Me.metadata['gettext-domain']).gettext;

let settings, settingsJSON;

function init() {
    Convenience.initTranslations();
    settings = Convenience.getSettings();
    settingsJSON = Settings.getSettingsJSON(settings);
}

// builds a line (icon + label + switch) for a setting
function buildIconSwitchSetting(icon, label, setting_name, server_num)
{
	let hboxFilterJobs = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
	let iconFilterJobs = new Gtk.Image({file: Me.dir.get_path() + "/icons/prefs/" + icon + ".png"});
	let labelFilterJobs = new Gtk.Label({label: label, xalign: 0});
	let inputFilterJobs = new Gtk.Switch({active: settingsJSON['repos'][server_num][setting_name]});

	inputFilterJobs.connect("notify::active", Lang.bind(this, function(input){ updateServerSetting(server_num, setting_name, input.get_active()); }));

    hboxFilterJobs.pack_start(iconFilterJobs, false, false, 0);
    hboxFilterJobs.pack_start(labelFilterJobs, true, true, 0);
	hboxFilterJobs.add(inputFilterJobs);

	return hboxFilterJobs;
}

// update json settings for server in settings schema
function updateUserSetting(setting, value)
{
    settingsJSON = Settings.getSettingsJSON(settings);
    settingsJSON["user"][setting] = value;
    settings.set_string("settings-json", JSON.stringify(settingsJSON));
}

// create a new server tab and add it to the notebook
function addTabPanel(notebook, server_num)
{
    // use server name as tab label
    let tabLabel = new Gtk.Label({ label: settingsJSON['repos'][server_num]['name']});
    
    let vbox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, border_width: 10 });

    // *** jenkins connection ***
    let labelJenkinsConnection = new Gtk.Label({ label: "<b>" + _("Git hub repo") + "</b>", use_markup: true, xalign: 0 });
    vbox.add(labelJenkinsConnection);

    let vboxJenkinsConnection = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, margin_left: 20, margin_bottom: 15 });
    
        // server name
        let hboxServerName = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
        let labelServerName = new Gtk.Label({label: _("Repo name"), xalign: 0});
        let inputServerName = new Gtk.Entry({ hexpand: true, text: settingsJSON['repos'][server_num]['name'] });

        inputServerName.connect("changed", Lang.bind(this, function(input){ tabLabel.set_text(input.text); updateServerSetting(server_num, "name", input.text); }));

        hboxServerName.pack_start(labelServerName, true, true, 0);
        hboxServerName.add(inputServerName);
        vboxJenkinsConnection.add(hboxServerName);

        // jenkins url
        let hboxRepoUrl = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
        let labelRepoUrl = new Gtk.Label({label: _("Repo: user/repo"), xalign: 0});
        let inputRepoUrl = new Gtk.Entry({ hexpand: true, text: settingsJSON['repos'][server_num]['repo'] });

        inputRepoUrl.connect("changed", Lang.bind(this, function(input){ updateServerSetting(server_num, "repo", input.text); }));

        hboxRepoUrl.pack_start(labelRepoUrl, true, true, 0);
        hboxRepoUrl.add(inputRepoUrl);
        vboxJenkinsConnection.add(hboxRepoUrl);
        
        // token
        let hboxToken = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
        let labelToken = new Gtk.Label({label: _("Token"), xalign: 0});
        let inputToken = new Gtk.Entry({ hexpand: true, text: ''+settingsJSON['repos'][server_num]['token'] });

        inputToken.connect("changed", Lang.bind(this, function(input){ updateServerSetting(server_num, "token", input.text); }));

        hboxToken.pack_start(labelToken, true, true, 0);
        hboxToken.add(inputToken);
        vboxJenkinsConnection.add(hboxToken);
        vbox.add(vboxJenkinsConnection);
        
    // button to remove tab
    let iconRemoveServer = new Gtk.Image({file: Me.dir.get_path() + "/icons/prefs/stop.png"});
    let btnRemoveServer = new Gtk.Button({image: iconRemoveServer});
        
    btnRemoveServer.connect('clicked', Lang.bind(notebook, function(){
        if( notebook.get_n_pages()>1 )
        {
            // remove server from settings
            settingsJSON['repos'].splice(notebook.page_num(tabContent), 1);
            settings.set_string("settings-json", JSON.stringify(settingsJSON));
            
            // remove tab from notebook
            notebook.remove_page(notebook.page_num(tabContent));
        }
    }));

    // widget for tab containing label and close button
    let tabWidget = new Gtk.HBox({ spacing: 5 });
    tabWidget.add(tabLabel);
    tabWidget.add(btnRemoveServer);
    tabWidget.show_all();
    
    // tab content
    let tabContent = new Gtk.ScrolledWindow({ vexpand: true });
    tabContent.add_with_viewport(vbox);
    
    // append tab to notebook
    notebook.append_page(tabContent, tabWidget);
}

function userIssues(notebook)
{
    // use server name as tab label
    let tabLabel = new Gtk.Label({ label: "Issues"});
    
    let vbox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, border_width: 10 });

    // *** jenkins connection ***
    let labelJenkinsConnection = new Gtk.Label({ label: "<b>" + _("Git hub Issues") + "</b>", use_markup: true, xalign: 0 });
    vbox.add(labelJenkinsConnection);

    let vboxJenkinsConnection = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, margin_left: 20, margin_bottom: 15 });
    
        // server name
        let hboxServerName = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
        let labelServerName = new Gtk.Label({label: _("Name"), xalign: 0});
        let inputServerName = new Gtk.Entry({ hexpand: true, text: settingsJSON['user']['name'] });

        inputServerName.connect("changed", Lang.bind(this, function(input){ tabLabel.set_text(input.text); updateUserSetting("name", input.text); }));

        hboxServerName.pack_start(labelServerName, true, true, 0);
        hboxServerName.add(inputServerName);
        vboxJenkinsConnection.add(hboxServerName);

        // token
        let hboxToken = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
        let labelToken = new Gtk.Label({label: _("Token"), xalign: 0});
        let inputToken = new Gtk.Entry({ hexpand: true, text: ''+settingsJSON['user']['token'] });

        inputToken.connect("changed", Lang.bind(this, function(input){ updateUserSetting("token", input.text); }));

        hboxToken.pack_start(labelToken, true, true, 0);
        hboxToken.add(inputToken);
        vboxJenkinsConnection.add(hboxToken);
        vbox.add(vboxJenkinsConnection);
        

    // widget for tab containing label and close button
    let tabWidget = new Gtk.HBox({ spacing: 5 });
    tabWidget.add(tabLabel);
    tabWidget.show_all();
    
    // tab content
    let tabContent = new Gtk.ScrolledWindow({ vexpand: true });
    tabContent.add_with_viewport(vbox);
    
    // append tab to notebook
    notebook.append_page(tabContent, tabWidget);
}

function buildPrefsWidget() {
	// *** tab panel ***
	let notebook = new Gtk.Notebook();
	userIssues(notebook);
	
	for( let i=0 ; i<settingsJSON['repos'].length ; ++i )
	{
	    // add tab panels for each server
	    addTabPanel(notebook, i);
    }
	    
	
	// button to add new servers
	let btnNewServer = new Gtk.Button({label: _('Add repo')});
	btnNewServer.connect('clicked', Lang.bind(notebook, function(){
        // get default settings for this new server
        settingsJSON['repos'][settingsJSON['repos'].length] = Settings.DefaultSettings['repos'][0];
        
        // set new id
        let currentDate = new Date;
        settingsJSON['repos'][settingsJSON['repos'].length-1]['id'] = currentDate.getTime();
        
        // save new settings
        settings.set_string("settings-json", JSON.stringify(settingsJSON));
    
        // add tab with copied settings
        addTabPanel(notebook, settingsJSON['repos'].length-1);
        notebook.show_all();
        
        // jump to added tab
        notebook.set_current_page(settingsJSON['repos'].length-1);
    }));

    // *** overall frame ***
    let frame = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, border_width: 10 });
    
    // add new server button
    frame.add(btnNewServer);
    
    // add notebook
	frame.add(notebook);
	
	// show the frame
    frame.show_all();

    return frame;
}