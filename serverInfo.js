function ServerInfo(projectName,repo,token)
{
	this.init(projectName, repo,token);
}

ServerInfo.prototype= {
	name: "undefined",
	repo: null,
	token: 'myToken',
	button: null,
	popup: null,
	init: function(projectName,repo,token){
	    this.name = projectName;
	    this.repo=repo;
	    this.token=token;
	},
	getName: function(){
		return this.name;
	},
	getUrl: function(){
		return "https://api.github.com/repos/"+this.repo+"/pulls";
	},
	getAuthentication: function(){
		return 'token '+this.token; 
	}
};
