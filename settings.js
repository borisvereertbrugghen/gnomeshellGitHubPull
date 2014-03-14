/*
 * @author Philipp Hoffmann
 */

const Params = imports.misc.params;

// default settings for new servers
let DefaultSettings = {
    "repos": [
        {	
        	"id":"1",
            "name": "Default",
            "repo": "Octocal/Test",
			"token": "token"
        }
    ],
    "user":
         {
            "id":"1",
            "name":"Default",
            "token":"token"
         }
}

// helper to prevent weird errors if possible settings change in future updates by using default settings
function getSettingsJSON(settings)
{
	let settingsJSON = JSON.parse(settings.get_string("settings-json"));
	
	// assert that at least default settings are available
	settingsJSON = settingsJSON || DefaultSettings;
	settingsJSON.servers = settingsJSON.servers || DefaultSettings.servers;
	let i;
	for( i=0 ; i<settingsJSON.repos.length ; ++i )
	{
		let setting;
		for(setting in DefaultSettings.repos[0] )
		{
			if( !(setting in settingsJSON.repos[i]) )
				settingsJSON.repos[i][setting] = DefaultSettings.repos[0][setting];
		}
	}
	if(!settingsJSON.user){
		settingsJSON.user = DefaultSettings.user;
	}
	let setting;
	for(setting in DefaultSettings.user)
	{
		if( !(setting in settingsJSON.user) )
			settingsJSON.user[setting] = DefaultSettings.user[setting];
	}
	return settingsJSON;
}
