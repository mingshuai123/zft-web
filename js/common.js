

// 判断是否是微信
function isWeiXin(){
	var ua = window.navigator.userAgent.toLowerCase();
	if(ua.match(/MicroMessenger/i) == 'micromessenger'){
		return true;
	}else{
		return false;
	}
}
var browser = {
    versions: function () {
        var u = navigator.userAgent, app = navigator.appVersion;
        return {         //移动终端浏览器版本信息
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
            iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
        };
    }(),
    language: (navigator.browserLanguage || navigator.language).toLowerCase()
}

//获取滚动条当前的位置
function getScrollTop() {
	var scrollTop = 0;
	if (document.documentElement && document.documentElement.scrollTop) {
		scrollTop = document.documentElement.scrollTop;
	}
	else if (document.body) {
		scrollTop = document.body.scrollTop;
	}
	return scrollTop;
}
//获取当前可视范围的高度
function getClientHeight() {
	var clientHeight = 0;
	if (document.body.clientHeight && document.documentElement.clientHeight) {
		clientHeight = Math.min(document.body.clientHeight, document.documentElement.clientHeight);
	}
	else {
		clientHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight);
	}
	return clientHeight;
}
//获取文档完整的高度
function getScrollHeight() {
	return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
}
//微信分享
function shareWx(title,desc, dlink, imgUrl){
	console.log(title)
	console.log(desc)
	//alert(dlink)
	console.log(imgUrl)
	$.get('http://m.jesport.com/backend/member/jsapi',{url:dlink}, function(json){
		wx.config({
			debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
			appId: json.appId, // 必填，公众号的唯一标识
			timestamp: json.timestamp, // 必填，生成签名的时间戳
			nonceStr: json.nonceStr, // 必填，生成签名的随机串
			signature: json.signature,// 必填，签名，见附录1
			// 必填，需要使用的JS接口列表，所有JS接口列表见附录2
			jsApiList: [
				'checkJsApi',  //判断当前客户端版本是否支持指定JS接口
				'onMenuShareTimeline', //分享到朋友圈
				'onMenuShareAppMessage', //分享给好友
				'onMenuShareWeibo',//分享到微博
				'onMenuShareQQ'
				]
			});

		wx.ready(function(){
			wx.onMenuShareTimeline({
				title: title,
				desc: desc,
				link: dlink,
				imgUrl:imgUrl,
				success:function(){
					alert("分享成功");
					$(".share-modal").css({display:"none"});
					$(".modal-mask").css({display:"none"});
					
				},
				cancel:function(){
					alert("已取消分享");
					$(".share-modal").css({display:"none"});
					$(".modal-mask").css({display:"none"});
					
				}
			});

			wx.onMenuShareAppMessage({
				title: title,
				desc: desc,
				link: dlink,
				imgUrl:imgUrl,
				success:function(){
					alert("分享成功");
					$(".share-modal").css({display:"none"});
					$(".modal-mask").css({display:"none"});
					
				},
				cancel:function(){
					$(".share-modal").css({display:"none"});
					alert("已取消分享");
					$(".modal-mask").css({display:"none"});
					
				}
			});
			wx.error(function( res ){
				//alert(res.errMsg);
			});

		});
	});
}
//处理cookie
function setCookie(name,value,domain) {
	var Days = 30;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days*24*60*60*1000);
	if(!domain){
        domain='m.jesport.com'
	}
	document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString()+';domain='+domain+';path=/';
}
function getCookie(name) {
	var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	if(arr=document.cookie.match(reg))
		return unescape(arr[2]);
	else
		return null;
}
//清除cookie
function clearCookie(name) {
	setCookie(name, "","", -1);
}

