function UserInfo(name,token)
{
	this.init(name,token);
}

UserInfo.prototype= {
	name: "undefined",
	token: 'myToken',
	button: null,
	popup: null,
	init: function(name,token){
	    this.name = name;
	    this.token=token;
	},
	getName: function(){
		return this.name;
	},
	getUrl: function(){
		return "https://api.github.com/issues";
	},
	getAuthentication: function(){
		return 'token '+this.token; 
	}
};
