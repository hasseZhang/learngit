var oMeta = document.querySelector('meta[name=type]');
var type = oMeta && oMeta.getAttribute('content');
if(parent.EPG&&parent.EPG.version){
	document.write('<link rel="stylesheet" href="/pub/galaxy/css/public.css">'+'<script src="/pub/'+parent.EPG.version+'/puppy/common.js"><\/script>');
}else{
	document.write('<script src="/pub/resources/Refactoring/common.js"><\/script>');
}
if(type){
	var oPath = parent.EPG && parent.EPG.version ? parent.EPG.version : "resources";
	oMeta = null;
	var cite = {
		"styleFive":{
			"css":'<link rel="stylesheet" href="/pub/resources/playControl/css/common.css">',
			"js" :'<script src="/pub/resources/Refactoring/MP.js"><\/script>'+
				  '<script src="/pub/resources/js/auth_hd/js/auth_lib.js"><\/script>'
		},
		"styleSix":{
			"css":'<link rel="stylesheet" href="/pub/resources/playControl/css/common.css">',
			"js" :'<script src="/pub/resources/Refactoring/MP.js"><\/script>'+
				  '<script src="/pub/resources/js/auth_hd/js/auth_lib.js"><\/script>'
		},
		"styleSeven":{
			"css":'<link rel="stylesheet" href="/pub/resources/playControl/css/common.css">',
			"js" :'<script src="/pub/resources/Refactoring/MP.js"><\/script>'+
				  '<script src="/pub/resources/js/auth_hd/js/auth_lib.js"><\/script>'
		},
		"styleEleven":{
			"css":'<link rel="stylesheet" href="/pub/resources/playControl/css/common.css">',
			"js" :'<script src="/pub/resources/Refactoring/MP.js"><\/script>'+
				  '<script src="/pub/resources/js/auth_hd/js/auth_lib.js"><\/script>'
		}
	};
	if(oPath === "resources" && cite[type]){
		document.write(cite[type]["css"] + cite[type]["js"]);
	}
	if(type){
		document.write('<link rel="stylesheet" href="/pub/'+oPath+'/ztguider/zts/'+type+'/css/Page.css">'+'<script src="/pub/'+oPath+'/ztguider/zts/'+type+'/js/Page.js"><\/script>');
	}
}
