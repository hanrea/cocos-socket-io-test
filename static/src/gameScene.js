/**
 * Created by wzm on 14-8-9.
 */
//
var  hillscore = 0;//最高成绩
var opts = {path:"/socket",transports:[ 'websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'],pingInterval:5000};
 var socket = io(opts);
var phone = '';//手机号
var push = {};


var phoneMatch = /(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
var tmpphone = ''
while(phone ==''){
    var title = "请输入领奖通知手机号";
    if (tmpphone!='' ) { title = "请输入正确的手机号"};
    tmpphone=prompt(title);
    if(tmpphone.match(phoneMatch))
    {
        phone=tmpphone;
        push = {
            phone:tmpphone,
            score:0
        }
        //存cookie
        socket.emit('login', phone);
    }
}

socket.on('init', function (data) {
    console.log("init");
    pushNewInfo("欢迎进入游戏，您目前最高抢得 "+data["myScore"]+"个粽子.");
    pushNewInfo("当前系统最高抢得 "+data["topScore"]+"个粽子.");
});

socket.on('rank', function (data) {
    var info = "您本次排名 "+data["curIndex"]+" ,最佳排名"+data["topIndex"]+".";
    pushNewInfo(info);
});

socket.on('push', function (data) {
    var info = data["phone"]+"抢了"+data["score"]+"个粽子。";
    pushNewInfo(info);
});

socket.on('join', function (phone) {
    console.log("用户"+phone+"加入游戏。");
    var info = "用户"+phone+"加入游戏。";
    pushNewInfo(info);
});

function pushNewInfo (info) {
    $('#gamestate').children().first().remove();
    $('#gamestate').append("<div>"+info+"</div>");
}



var gameLayer = cc.Layer.extend({
    score: null,
    welcomeTitle: null,
    resultTitle: null,
    shareText: null,
    listener: null,
    index: null,
    curIndex: null,
    downOffset: null,
    countOffset: null,
    downSpeed: null,
    lineIndex: null,
    blockList: null,
    resultLayer: null,
    gameStatus: null,
    updateTime: false,
    timeDt: 0,
   hillscore : 0,
    ctor: function (status) {
        this._super();
        this.init(status);
    },
    init: function (status) {
        this.score = 0;
        this.blockList = [];
        this.downOffset = 0;
        this.countOffset = 0;
        this.curIndex = 0;
        this.index = 0;
        this.hillscore = hillscore;
        this.gameStatus = gameStatus.ready;
        this.downSpeed = TemplateUtils.getVariable("downSpeed");
        this.lineIndex = TemplateUtils.getVariable("linePerScreen");

        // var bgLayer = cc.LayerColor.create();//游戏中背景
        // bgLayer.setColor(cc.color(TemplateUtils.getVariable("bgColor")));
        // this.addChild(bgLayer);
         var back = TemplateUtils.getVariable("back");
        this.bgLayer =  new cc.Sprite(back);
        var winsize = cc.director.getWinSize();
        var centerPos = cc.p(winsize.width / 2, winsize.height / 2);
        this.bgLayer.setPosition(centerPos);
        var scale = winsize.height / 1136 ;
        this.bgLayer.setScale(scale);
        this.addChild(this.bgLayer, 0);

        this.blockLayer = cc.Layer.create();
        if (!cc.sys.isNative) {
            this.blockLayer.bake();
        }
        this.makeStartLines();
        this.addChild(this.blockLayer);

        this.scoreLabel = cc.LabelTTF.create(TemplateUtils.getVariable("gameTime"), "Arial", 22);
        this.scoreLabel.setColor(cc.color(199, 100, 255));
        this.scoreLabel.setPosition(cc.pAdd(cc.visibleRect.top, cc.p(0, -250)));
        this.addChild(this.scoreLabel);
        if (!status) {
            this.initStartUI();
        } else {
            this.schedule(this.updateDown);
        };

    },
    registetBlockListener: function (target) {
        var list = this.getListener();
        list._index = target._index;
        cc.eventManager.addListener(list, target);
    },
    updateDown: function (dt) {
        if (this.gameStatus == gameStatus.start) {
            this.timeDt += dt;
            if (!this.updateTime) {
                var string = this.scoreLabel.getString();
                var time = (parseFloat(string) - this.timeDt).toFixed(2);
                if (time > 0) {
                    this.scoreLabel.setString(time + "");
                } else {
                    this.finishGame();
                }
                this.timeDt = 0;
            }
            this.updateTime = !this.updateTime;
        }
        if (this.downOffset > 0) {
            var dtDistance = this.downSpeed * dt;
            var deltaOffset = this.downOffset - dtDistance;
            if (deltaOffset < 0) {
                this.blockLayer.y -= this.downOffset;
                this.countOffset += this.downOffset;
                this.downOffset = 0;
                if (!cc.sys.isNative) {
                    this.blockLayer.bake();

                }
            } else {
                this.blockLayer.y -= dtDistance;
                this.downOffset -= dtDistance;
                this.countOffset += dtDistance;
            }
        }
    },
    getListener: function () {
        if (this.listener == null) {
            var self = this;
            this.listener = cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: function (touch, event) {
                    var target = event.getCurrentTarget();
                    var tmptPos = touch.getLocation();
                    if (target.getIndex() == self.curIndex && !target.getClicked() && cc.rectContainsPoint(target.getBoundingBox(), cc.p(tmptPos.x, tmptPos.y + self.countOffset))) {
//                        cc.log(target._index);
                        if (self.gameStatus == gameStatus.ready) {
                            self.gameStatus = gameStatus.start;
                        } else if (self.gameStatus == gameStatus.pause) {
                            return;
                        }
                        if (!cc.sys.isNative) {
                            self.blockLayer.unbake();
                        }
                        if (target.getColorStatus()) {
                            target.click();
                            self.downOffset += target.height + 1;
                            self.addScore();
                            self.lineIndex++;
                            self.curIndex++;
                            self.makeLine();
                            self.removeLine();
                        } else {
                            self.gameStatus = gameStatus.pause;
                            target.whiteClick(function () {
                                self.finishGame();
                            });
                        }
                        return true;
                    }
                    return false;
//                    return true;
                },
                onTouchMoved: function (touch, event) {
//                    cc.log("move");
                },
                onTouchEnded: function (touch, event) {
//                    cc.log("end");
                },
                onTouchCancelled: function (touch, event) {
                    cc.log("cancel");
                }
            });
            this.listener.retain();
        }
        return this.listener.clone();
    },
    addScore: function () {
        this.score++;
    },
    makeStartLines: function () {
        var height = Block.conputeBlockHeight();
        for (var i = 0; i <= this.lineIndex; i++) {
            this.makeBlockLine(i * height + i);
        }
    },
    makeLine: function () {
        var height = Block.conputeBlockHeight();
        this.makeBlockLine(this.lineIndex * height + this.lineIndex);
    },
    makeBlockLine: function (startY) {
        var lineCount = TemplateUtils.getVariable("numPerLine");
        var mark = tools.random(0, lineCount - 1);
        for (var i = 0; i < lineCount; i++) {
            var bl = Block.make();
            bl.retain();
            bl.y = startY + 1;
            if (i != 0) {
                bl.x = bl.width * i + i;
            } else {
                bl.x = 0;
            }
            if (i == mark) {
                bl.setClickPic();
            }
            this.blockLayer.addChild(bl);
            this.blockList.push(bl);
            bl.setIndex(this.index);
//            cc.log("bl width is " + bl.width + ",height is " + bl.height);
            this.registetBlockListener(bl);
        }
        this.index++;
    },
    removeLine: function () {
        for (var i = 0; i < this.blockList.length; i++) {
            var block = this.blockList[i];
            if (block.y - this.countOffset + block.height + 10 <= 0) {
                block.release();
                block.removeFromParent(true);
                this.blockList.splice(i,1);
            } else {
                break;
            }
        }
    },
    initStartUI: function () {
        //bgLayer
        this.resultLayer = cc.LayerColor.create();
        this.resultLayer.setColor(cc.color(121, 178, 97));
        this.addChild(this.resultLayer);

        var labelTitle = cc.LabelTTF.create(TemplateUtils.getVariable("startTitle"), "Arial", 25);
        labelTitle.setColor(cc.color(255, 255, 255));
        labelTitle.setPosition(cc.pAdd(cc.visibleRect.top, cc.p(0, -50)));
        this.resultLayer.addChild(labelTitle);

        var gameTime = TemplateUtils.getVariable("gameTime");
        var labelContent = cc.LabelTTF.create(TemplateUtils.getVariable("startContent", {"number": gameTime}), "Arial");
        labelContent.setColor(cc.color(255, 255, 255));
        labelContent.setPosition(cc.pAdd(cc.visibleRect.center, cc.p(0, 50)));
        labelContent.setDimensions(cc.size(cc.winSize.width - 60, 150));
        this.resultLayer.addChild(labelContent);

        var labelShare = cc.LabelTTF.create("分享给好友", "Arial", 25);
        var labelStart = cc.LabelTTF.create("开始玩游戏", "Arial", 25);
        var menuItemShare = cc.MenuItemLabel.create(labelShare, this.shareGame, this);
        var menuItemStart = cc.MenuItemLabel.create(labelStart, this.startGame, this);
        var menu = cc.Menu.create(menuItemStart, menuItemShare);
        menu.alignItemsVerticallyWithPadding(20);
        menu.setPosition(cc.pAdd(cc.visibleRect.center, cc.p(0, -100)));
        this.resultLayer.addChild(menu);
        share(0);
    },
    startGame: function () {
        this.resultLayer.removeFromParent(true);
        this.schedule(this.updateDown);
        $('#gamestate').css({ display: "block"});

    },

    finishGame: function () {
        this.unschedule(this.updateDown);
        this.resultLayer = cc.LayerColor.create();
        this.resultLayer.setColor(cc.color(121, 178, 97));
        this.addChild(this.resultLayer);

        //提交成绩
        push["score"] = this.score;
        socket.emit('push',push);
        $('#gamestate').css({display: "none"});
        this.hillscore=hillscore  = this.score > this.hillscore ? this.score :hillscore;

        var labelTitle = cc.LabelTTF.create(TemplateUtils.getVariable("resultTitle", {"score": this.score}), "Arial", 22);
        labelTitle.setColor(cc.color(255, 255, 255));
        labelTitle.setPosition(cc.pAdd(cc.visibleRect.top, cc.p(0, -50)));
        this.resultLayer.addChild(labelTitle);

        var number = tools.random(1, 10);
        var labelContent = cc.LabelTTF.create(TemplateUtils.getVariable("resultContent", {"number": number}), "Arial");
        labelContent.setColor(cc.color(255, 255, 255));
        labelContent.setPosition(cc.pAdd(cc.visibleRect.center, cc.p(0, 50)));
        labelContent.setDimensions(cc.size(cc.winSize.width - 60, 150));
        this.resultLayer.addChild(labelContent);

        var labelScore = cc.LabelTTF.create("本次最佳成绩：" + this.hillscore, "Arial", 25);
        labelScore.setColor(cc.color(244, 9, 68));
        labelScore.setPosition(cc.pAdd(cc.visibleRect.center, cc.p(0, -30)));
        this.resultLayer.addChild(labelScore);

        var labelShare = cc.LabelTTF.create("分享给好友", "Arial", 25);
        var labelStart = cc.LabelTTF.create("重新开始玩", "Arial", 25);
        var menuItemShare = cc.MenuItemLabel.create(labelShare, this.shareGame, this);
        var menuItemStart = cc.MenuItemLabel.create(labelStart, this.restartGame, this);
        var menu = cc.Menu.create(menuItemStart, menuItemShare);
        menu.alignItemsVerticallyWithPadding(20);
        menu.setPosition(cc.pAdd(cc.visibleRect.center, cc.p(0, -100)));
        this.resultLayer.addChild(menu);
        share(1, this.score);
    },
    shareGame: function () {
        var layer = cc.LayerColor.create();
        layer.setColor(cc.color(121, 178, 97));
        var shareSprite = cc.Sprite.create(res.shareText);
        shareSprite.setScale(0.25);
        layer.addChild(shareSprite);
        shareSprite.setPosition(cc.pAdd(cc.visibleRect.topRight, cc.p(-shareSprite.width / 7, -shareSprite.height / 8)));
        this.addChild(layer, 111);
        var self = this;
        var listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (event, touch) {
                if (layer.isVisible()) {
                    layer.visible = false;
                    layer.removeFromParent(true);
                }
                cc.eventManager.removeListener(listener);
                return true;
            }
        });
        cc.eventManager.addListener(listener, layer);
    },
    restartGame: function () {
        cc.director.runScene(new gameScene(true));
        share(0);
        $('#gamestate').css({display: "block"});
    },
    onExit: function () {
        this._super();
        this.listener.release();
    }
});
var gameScene = cc.Scene.extend({
    status: false,
    ctor: function (status) {
        this._super();
        this.status = status;
    },
    onEnter: function () {
        this._super();
        var layer = new gameLayer(this.status);
        this.addChild(layer);
        
    }
});
var tools = {};
tools.random = function (x, y) {
    return parseInt(Math.random() * (y + 1 - x) + x);
}
var gameStatus = {
    stop: 0,
    start: 1,
    pause: 2,
    ready: 3
};
function share(m, num) {
    if (!cc.sys.isNative) {
        if (m == 0) {
            document["title"] = window["wxData"]["desc"] = TemplateUtils.getVariable("shareBefore");
        }
        if (m == 1) {
            document["title"] = window["wxData"]["desc"] = TemplateUtils.getVariable("shareAfter", {"number": num});
        }
    }
}





