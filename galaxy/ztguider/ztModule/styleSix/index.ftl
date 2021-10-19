<#assign block_number = 1 />
<@Subject />
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="page-view-size" content="1920*1080">
<meta name="type" content="styleSix">
<title>${subjectName}</title>
<script>
var bImgPath = '<@SubjectPic type="105" />';
var subjectId = '${subjectId}';
var subjectName = '${subjectName}';
var DATALIST = 
    <@Block order=1>
	<#assign contentIndex=0 />
    {
    name :'${blockName}',
	valList: [
    <@ContentList>
        {
            'contentId':'${contentId}',
            'contentType':'${contentType}',
            'contentName':'${contentName}',
            'des':'${contentDescrible}',
            'imgPath': " <@ContentPic type = '101'/>"
            <#if contentType = "0">
                <#assign vodBaseInfo = f_VodBaseInfo(contentId, distDomainId) />
                ,
                "totalTime":"${vodBaseInfo.vodTimes}",
                "vipFlag" : "${vodBaseInfo.vipFlag}"
            </#if>
        }
        <#if (contentIndex<(listSize - 1))>
            ,
        </#if>
        <#assign contentIndex=(contentIndex+1) />
    </@ContentList>
    ]
    }
    </@Block>
</script>
<script src="${relativePath}resources/ztguider/index.js"></script>
</head>
<body onload="initPage()" onunload="unload()">
	<div id="video">
		<div class="adTip"></div>
	</div>
	<div class="right">
		<div class="list"></div>
    </div>
    <div id="arrowUp"></div>
    <div id="arrowDown"></div>
</body>
</html>