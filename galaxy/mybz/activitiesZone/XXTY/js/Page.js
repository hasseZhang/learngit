var pageName = 'XXTY_home';
$.recodeData(pageName, 'access');
var PAGE_INFO = [
	{
		key:'sug0',
		pressUp:'',
		pressDown:'sug2',
		pressLeft:'',
		pressRight:_toVod,
		pressOk:pressOk,
		index:0,
		args:[0]
	},
	{
		key:'sug1',
		pressUp:'',
		pressDown:'sug3',
		pressLeft:_toVod,
		pressRight:'',
		pressOk:pressOk,
		index:1,
		args:[1]
	},
	{
		key:'sug2',
		pressUp:'sug0',
		pressDown:'section0',
		pressLeft:'',
		pressRight:_toVod,
		pressOk:pressOk,
		index:2,
		args:[2]
	},
	{
		key:'sug3',
		pressUp:'sug1',
		pressDown:'section6',
		pressLeft:_toVod,
		pressRight:'',
		pressOk:pressOk,
		index:3,
		args:[3]
	},
	{
		key:'video',
		pressUp:'',
		pressDown:_toDown,
		pressLeft:_toLeft,
		pressRight:_toRight,
		pressOk:_toFull
	},
];
var SUGGEST_INFO = [
	{
		key:'section0',
		pressUp:'sug2',
		pressDown:'',
		pressLeft:'section6',
		pressRight:'section1',
		pressOk:pressOk,
		index:4,
		args:[0]
	},
	{
		key:'section1',
		pressUp:_toVod,
		pressDown:'',
		pressLeft:'section0',
		pressRight:'section2',
		pressOk:pressOk,
		index:5,
		args:[1]
	},
	{
		key:'section2',
		pressUp:_toVod,
		pressDown:'',
		pressLeft:'section1',
		pressRight:'section3',
		pressOk:pressOk,
		index:6,
		args:[2]
	},
	{
		key:'section3',
		pressUp:_toVod,
		pressDown:'',
		pressLeft:'section2',
		pressRight:'section4',
		pressOk:pressOk,
		index:7,
		args:[3]
	},
	{
		key:'section4',
		pressUp:_toVod,
		pressDown:'',
		pressLeft:'section3',
		pressRight:'section5',
		pressOk:pressOk,
		index:8,
		args:[4]
	},
	{
		key:'section5',
		pressUp:_toVod,
		pressDown:'',
		pressLeft:'section4',
		pressRight:'section6',
		pressOk:pressOk,
		index:9,
		args:[5]
	},
	{
		key:'section6',
		pressUp:'sug3',
		pressDown:'',
		pressLeft:'section5',
		pressRight:'section0',
		pressOk:pressOk,
		index:10,
		args:[6]
	}
];
// 四个图片推荐位 视频窗 7个子分类入口 走马灯 背景图
var guidance = { //现网
	sug: '1100005158',
	video: '1100005157',
	section: '1100005161',
	mar: '1100005159',
	bg: '1100005160'
};
// var guidance = { //测试
// 	sug: '1100005225',
// 	video: '1100005227',
// 	section: '1100005228',
// 	mar: '1100005231',
// 	bg: '1100005235'
// };
var ACTIVE_OBJECT;
var pageInfo = $.initPageInfo(pageName,["focus"],{focus:'video'});

var rememberIndex = '';
var videoCategoryId = '';
var channelNum = '';
var vl = '';
var mp = '';
var vodList = [];
var sugList = [];
var secList = [];
var vodIndex = 0;
var playTime = 0;
var playIndex = 0;


function load() {
	$.initPage();
	initPage();
	PAGE_INFO=PAGE_INFO.concat(SUGGEST_INFO);
	$.focusTo(pageInfo.focus);
};

function stopPlayer() {
	window.mp && mp.stop && (mp.stop());
	if (vl) {
		vl.release();
		vl = null;
	};
}
function unload(){
	stopPlayer();
}
function request(id,success,error){
	$.s.guidance.get(
		{
			id: id
		}, {
			success: success,
			error:error
		}
	);
}

function initPage(id){
	request(guidance.bg,function(res){
		if (res && res.length) {
			var src = $.getPic(res[0].pics, [0]);
			$("#wrap").css('background','url("'+src+'") no-repeat');
		};
		init();
	},function(){
		init();
	});
}
function init(){
	renderSug(guidance.sug);
	renderSec(guidance.section);
	showMarquee(guidance.mar);
	initVl();
}
function renderSug(id){
	request(id,function(res){
		if (res && res.length) {
			sugList = res;
			var src = '';
			var vip = '';
			for (var i = 0; i < res.length; i++) {
				src = $.getPic(res[i].pics, [128]);
				$('#sug'+i+' img').attr({
					src:src
				});
				var ChargesArray = res[i].contentCharges.split(",");
				var haveSinglepoint = ChargesArray.indexOf("1100000184") > -1 || ChargesArray.indexOf("1100000383") > -1 || ChargesArray.indexOf("1100000185") > -1 || ChargesArray.indexOf("1100000781") > -1;
				vip = ChargesArray.indexOf("1100000761") > -1 ? '<div class="MoviesVip"></div>' : ChargesArray.indexOf("1100000381") > -1 ? '<div class="childrenVip"></div>' : haveSinglepoint == true ? '<div class="SinglepointVip"></div>' : ChargesArray.indexOf("1100000181") > -1 ? '<div class="Qiyivip"></div>' : ChargesArray.indexOf("1100000241") > -1 ? '<div class="MoviesVip"></div>'  : '';
				$(vip).appendTo($('#sug'+i));
			}
		}
	},function(){
	})
}
function renderSec(id){
	request(id,function(res){
		if (res && res.length) {
			secList = res;
			var src = '';
			for (var i = 0; i < res.length; i++) {
				src = $.getPic(res[i].pics, [128]);
				$('#section'+i+' img').attr({
					src:src
				})
			}
		}
	},function(){

	})
}
function showMarquee(id){
	request(id,function(res){
		$(function () {
			if (res && res.length) {
				var msg = res[0].contentUri;
				if (msg && !(msg === "#")) {
					$("#footer").show();
					$("#mar").html('<marquee width="98%" height="99%" scrollamount="4">'+msg+'</marquee>');
					
				};
			};
		})
	},function(){

	})
}
function initVl(){
	request(guidance.video,function(res){
		if (res && res.length) {
			videoCategoryId = res[0].contentUri;
			if (/^(channel:\/\/~?)(\d+)/.test(videoCategoryId)) {
				channelNum = RegExp.$2;
				vodList = res;
				playChannel();
			} else {
				$.s.guidance.get(
					{
						id: videoCategoryId
					}, {
					success: function(res) {
						vodList = res;
						playVod();
					},
					error: function(){

					}
				});
			};
		};
	});
}
function playChannel(){
	mp = new $.MP();
	if (channelNum) {
		mp.size(true,393,153,1134,642);
		mp.load(channelNum);
		$.vs.liveSizePlay(channelNum);
		$.initVolume(mp);
	};
}
function playVod(){
	for(var i = 0;i<vodList.length;i++){
		vodList[i].name = vodList[i].contentName;
	};
	vodList.categoryId = videoCategoryId;
	vl = $.playSizeList({
		list: vodList,
		current: vodIndex,
		playTime: playTime,
		multiVod: false,
		auto: true,
		left: 393,
		top: 153,
		width: 1134,
		height: 642
	}, videoCategoryId);
	vl.play();
}

/*页面操作*/ 
function _toVod(){
	rememberIndex = ACTIVE_OBJECT.index;
	$.focusTo("video");
}
function _toLeft(){
	if (rememberIndex && ( rememberIndex == 0 || rememberIndex == 2) ){
		$.focusTo("sug"+rememberIndex);
		rememberIndex = '';
		return;
	};
	$.focusTo("sug0");
}
function _toRight(){
	if (rememberIndex && ( rememberIndex == 1 || rememberIndex == 3)) {
		$.focusTo("sug"+rememberIndex);
		rememberIndex = '';
		return;
	};
	$.focusTo("sug1");
}
function _toDown(){
	if (rememberIndex && rememberIndex >= 4) {
		var index = rememberIndex - 4;
		$.focusTo("section"+index);
		rememberIndex = '';
		return;
	};
	$.focusTo("section1");
}
function _toFull(){
	if(channelNum){
		$.gotoDetail(_formatCNum(vodList[0]));
	}else{
		vl.enter({
			multiVod : true
		});
	}
}
function _formatCNum(channelObj) {
	var contentUri = channelObj.contentUri || channelObj.contentUrl || '';
	if (/channel:\/\//.test(contentUri)) {
		contentUri = contentUri.replace(/(\d+)/, function(){
			return $.getChan(RegExp.$1) ? $.getChan(RegExp.$1).channelId : RegExp.$1;
		})
	};
	channelObj.contentUri && (channelObj.contentUri = contentUri);
	channelObj.contentUrl && (channelObj.contentUrl = contentUri);
	return channelObj;
}
function pressOk(){
	var idx = ACTIVE_OBJECT.args[0];
	var url = '';
	if (getName() === 'sug') {
		url = sugList[idx];
		url.categoryId = guidance.sug;
	};
	if (getName() === 'section') {
		url = secList[idx];
	};
	url.entrance = 'XXTY';
	$.gotoDetail(_formatCNum(url),false,sendEventData);
}
function getName(){
	var name = ACTIVE_OBJECT.key;
	if (/sug/.test(name)) {
		return 'sug';
	};
	if (/section/.test(name)) {
		return 'section';
	}
}
function savePageInfo(){
	$.savePageInfo(pageName, {
		'focus': ACTIVE_OBJECT.key
	});
};
function numTools(e) {
	return e < 10 ? '0' + e : e;
}
function sendEventData(){
	var sendId = 'XXTYHOME'+'00'+numTools(ACTIVE_OBJECT.index);
	$.vs.homeTj(sendId,true,true);
	savePageInfo();
}
