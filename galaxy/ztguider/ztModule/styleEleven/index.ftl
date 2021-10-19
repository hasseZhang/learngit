<#assign block_number = 2 />
<@Subject />
<html>
<head>
<meta charset="UTF-8">
<meta name="page-view-size" content="1920*1080">
<meta name="type" content="styleEleven">
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
		        	'img':'<@ContentPic type="101" />',
		        	'intro':'${contentDescrible}'
					<#if contentType = "0">
                	<#assign vodBaseInfo = f_VodBaseInfo(contentId, distDomainId) />
                	,
                	"totalTime":"${vodBaseInfo.vodTimes}",
                	"vipFlag" : "${vodBaseInfo.vipFlag}"
            		</#if>
        		}
				<#if (contentIndex<(listSize - 1))>,</#if>
        		<#assign contentIndex=(contentIndex+1) />
        		</@ContentList>]
        }
	</@Block>,
];

</script>
<script src="${relativePath}resources/ztguider/index.js"></script>
</head>
<body onload="initPage()" onunload="unload()" >
<div id="content">
 <div id="video">
 </div>
 <div class="list">
 </div>
</div>	
</body>
</html>