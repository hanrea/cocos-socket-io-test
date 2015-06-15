(function(){
var d = document, dgi = function(v){return d.getElementById(v)}, dgc = function(v){return d.getElementsByClassName(v)}, dc = function(v){return document.createElement(String(v))}, hh = function(v){var m = dc('DIV'); m.innerHTML = v; return m.children[0]}, be = function(e,n,fn){e.addEventListener(n,fn)};

var B={ 
v:function(){
var u = navigator.userAgent, app = navigator.appVersion; 
return {
  trident: u.indexOf(/Trident/) > -1, //IE
  presto: u.indexOf(/Presto/) > -1, //opera
  webKit: u.indexOf(/AppleWebKit/) > -1, //apple,google
  gecko: u.indexOf(/Gecko/) > -1 && u.indexOf(/KHTML/) == -1, //ff 
  mobile: !!u.match(/AppleWebKit.*Mobile.*/), //mobile
  ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios
  android: u.indexOf(/Android/) > -1 || u.indexOf(/Linux/) > -1,
  iPhone: u.indexOf(/iPhone/) > -1,
  iPad: u.indexOf(/iPad/) > -1,
  webApp: u.indexOf(/Safari/) == -1
}; 
}(), 
l:(navigator.browserLanguage || navigator.language).toLowerCase()
};

var cvs = dgc('canvas')[0], ck_cgc = dc('DIV');
var url = '';

if(B.v.mobile || B.v.ios || B.v.android || B.v.iPhone || B.v.iPad){ 
  url = "http://www.anrenco.com/"
}else{
  url = "javascript:void(0)"
}


var ft = hh('<div style="position:absolute;height:20px;line-height:20px;font:100 12px/20px arial;bottom:0px;z-index:999;width:100%;text-align:center">\
  <a style="display:none;    position:absolute;left:0px;padding:0px 10px;background:rgba(0,0,0,.2);" href="'+url+'"><svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"><g><line id="svg_1" y2="5" x2="0" y1="0" x1="5" stroke="#ffffff" fill="none"/><line id="svg_2" y2="5" x2="0" y1="10" x1="5" stroke="#ffffff" fill="none"/></g></svg></a>\
  <a style="color:#fff;" href="'+url+'">安仁科技 提供技术支持</a>\
</div>');

/*
var ads = hh('<div class="ahd" style="position:absolute;font:100 1em arial;top:0px;z-index:999;width:100%;height:36px;background-color:rgba(0,0,0,.2)">\
        <div>\
            <ins class="adsbygoogle" style="display:inline-block;width:320px;height:50px" data-ad-client="ca-pub-8553158830227934" data-ad-slot="5468081663"></ins>\
        </div>\
        <div style="position:absolute;right:10px;top:12px;" onclick="this.parentNode.parentNode.className += \' hide\'"><svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"><g><line id="svg_1" y2="10" x2="10" y1="0" x1="0" stroke="#ffffff" fill="none"/><line id="svg_2" y2="10" x2="0" y1="0" x1="10" stroke="#ffffff" fill="none"/></g></svg></div>\
    </div>');
*/    
    

// ck_cgc.innerHTML = ads;
// ck_cgc = ck_cgc.children[0];
//d.body.insertBefore(ads,d.body.children[0]);

// ck_cgc.innerHTML = ads;
// ck_cgc = ck_cgc.children[0];
d.body.appendChild(ft);

// 修复之前的bug
try{
  var old_hd = dgc('a-header');
  if (old_hd && old_hd[0]){
    old_hd[0].parentNode.removeChild(old_hd[0]);
  }
}catch(e){}

  // var hm = document.createElement("script");
  // hm.src = "//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
  // var s = document.getElementsByTagName("script")[0]; 
  // s.parentNode.insertBefore(hm, s);
  // (adsbygoogle = window.adsbygoogle || []).push({});

})();

