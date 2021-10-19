<#assign block_number = 2 />
<@Subject />
<html>
<head>
<meta charset="UTF-8">
<meta name="page-view-size" content="1920*1080">
<meta name="type" content="styleTen">
<title>${subjectName}</title>
<script>
var bImgPath = '<@SubjectPic type="105" />';
var subjectId = '${subjectId}';
var subjectName = '${subjectName}';
var DATALIST = [
	<@Block order=1>
	<#assign contentIndex=0 />
        {
        	title:'${blockName}',
        	valData: [
        		<@ContentList>
        		{
        			'contentId':'${contentId}',
		        	'contentUrl':'${contentUrl}',
		        	'contentType':'${contentType}',
		        	'status':'${urlStatus}',
		        	'channelNumber':'${channelNumber}',
		        	'TvodStartTime':'${TvodStartTime}',
		        	'TvodEndTime':'${TvodEndTime}',
		        	'contentName':'${contentName}',
		        	'img':'<@ContentPic type="102" />',
		        	'intro':'${contentDescrible}'
		        	<#if contentType = "7">
			        	<#assign xileijuBaseInfo = f_TopicSceneData(contentId, distDomainId) />
			        	,
			        	"intro":"${xileijuBaseInfo.seriesDescription}"
		        	</#if>
        		}<#if (contentIndex<(listSize - 1))>,</#if>
        		<#assign contentIndex=(contentIndex+1) />
        		</@ContentList>]
        }
	</@Block>,
	<@Block order=2>
		<#assign contentIndex=0 />
	        {
	        	title:'${blockName}',
	        	bgData: [
	        		<@ContentList>
	        		{
			        	'bgImg':'<@ContentPic type="105" />'
			        	
	        		}<#if (contentIndex<(listSize - 1))>,</#if>
	        		<#assign contentIndex=(contentIndex+1) />
	        		</@ContentList>]
	        }
	</@Block>
];

</script>
<script src="${relativePath}resources/ztguider/index.js"></script>
</head>
<body onload="initPage()">
<div id="content">
<div id="list"></div>
</div>	
</body>
</html>