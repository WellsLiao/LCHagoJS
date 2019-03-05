var LCHago;
(function (LCHago) {
    var getQueryString = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null)
            return decodeURIComponent(r[2]);
        return null;
    };
    LCHago.Config = {
        wsUrl: "ws://127.0.0.1:8888",
        pingSpace: 1,
        waitStartSpace: 15,
        timeoutSpace: 3,
        closeSpace: 6,
        userData: {
            uid: "uid",
            name: "name",
            avatar: "",
            opt: "",
        },
        roomData: {
            roomID: "1",
            gameID: "gameID",
            channelID: "channelID",
            kv: "",
        }
    };
})(LCHago || (LCHago = {}));
var LCHago;
(function (LCHago) {
    LCHago.onWSConnect = function () {
        console.log("未监听onWSConnect", "正在加入房间");
    };
    LCHago.onWSTimeout = function () {
        console.log("未监听onWSClose", "连接关闭，游戏结算");
    };
    LCHago.onWSClose = function () {
        console.log("未监听onWSClose", "连接关闭，游戏结束");
    };
    LCHago.onWSDisconnect = function () {
        console.log("未监听onWSDisconnect", "正在尝试重连");
    };
    LCHago.onWSReconnect = function () {
        console.log("未监听onWSReconnect", "重连成功");
    };
    LCHago.onJoin = function () {
        console.log("未监听onJoin", "等待对手加入");
    };
    LCHago.onCreate = function (data) {
        console.log("未监听onCreate", data);
        console.log(JSON.stringify(data));
    };
    LCHago.onStart = function (data) {
        console.log("未监听onStart", data, "双方都完毕，可倒计时并开始游戏");
    };
    LCHago.onCustom = function (data) {
        console.log("未监听onCustom", data, "对方发送的消息");
    };
    LCHago.onNoStart = function () {
        console.log("未监听onNoStart", "游戏等待超时，以未开始结算");
    };
    LCHago.onEndWin = function () {
        console.log("未监听onEndWin", "游戏结算 我方胜利");
    };
    LCHago.onEndLose = function () {
        console.log("未监听onEndLose", "游戏结算 我方失败");
    };
    LCHago.onEndDraw = function () {
        console.log("未监听onEndDraw", "游戏结算 平局");
    };
    LCHago.onError = function (data) {
        console.log("未监听onError", "错误", data);
    };
})(LCHago || (LCHago = {}));
var LCHago;
(function (LCHago) {
    var msgPing = new gameProto.Msg();
    msgPing.ID = gameProto.MsgID.Ping;
    var pingBytes = gameProto.Msg.encode(msgPing).finish();
    var msgPong = new gameProto.Msg();
    msgPong.ID = gameProto.MsgID.Pong;
    var pongBytes = gameProto.Msg.encode(msgPing).finish();
    var WSServer = (function () {
        function WSServer() {
            this.isClose = false;
            this.isSendReady = false;
            this.isSendResult = false;
            this.hasRecvResult = false;
            this.pingDuration = 0;
            this.timeoutDuration = 0;
            this.closeDuration = 0;
            this.sendIndex = 0;
            this.sendHistory = [];
            this.recvIndex = 0;
        }
        WSServer.prototype.connect = function () {
            if (this.ws || this.isClose) {
                return;
            }
            this.isClose = false;
            console.log("正在连接服务器", LCHago.Config.wsUrl);
            var self = this;
            if (self.closeInterval == null) {
                self.closeInterval = setInterval(function () {
                    self.closeDuration += 1;
                    if (self.closeDuration >= LCHago.Config.closeSpace) {
                        console.log("timeout");
                        self.closeDuration -= LCHago.Config.closeSpace;
                        self.close();
                    }
                }, 1000);
            }
            var ws = this.ws = new WebSocket(LCHago.Config.wsUrl);
            ws.onopen = this.onOpen.bind(this);
            ws.onmessage = this.onMessage.bind(this);
            ws.onclose = this.onClose.bind(this);
        };
        WSServer.prototype.onOpen = function () {
            var self = this;
            self.resetDuration();
            if (self.pingInterval == null) {
                self.pingInterval = setInterval(function () {
                    self.pingDuration += 0.5;
                    if (self.pingDuration >= LCHago.Config.pingSpace) {
                        self.pingDuration -= LCHago.Config.pingSpace;
                        self.ping();
                    }
                }, 500);
            }
            if (self.timeoutInterval == null) {
                self.timeoutInterval = setInterval(function () {
                    self.timeoutDuration += 0.5;
                    if (self.timeoutDuration >= LCHago.Config.timeoutSpace) {
                        console.log("disconnect");
                        self.timeoutDuration -= LCHago.Config.timeoutSpace;
                        self.disconnect();
                    }
                }, 500);
            }
            self.ws.binaryType = 'arraybuffer';
            if (this.joinID == null) {
                LCHago.onWSConnect();
                this.join();
            }
            else {
                LCHago.onWSReconnect();
                this.rejoin();
            }
        };
        WSServer.prototype.onMessage = function (evt) {
            try {
                var uint8array = new Uint8Array(evt.data);
                var msg = gameProto.Msg.decode(uint8array);
                switch (msg.ID) {
                    case gameProto.MsgID.Ping:
                        this.pong();
                        break;
                    case gameProto.MsgID.JoinResp:
                        var msgJoinResp = gameProto.MsgJoinResp.decode(uint8array);
                        this.joinID = msgJoinResp.joinID;
                        LCHago.onJoin();
                        break;
                    case gameProto.MsgID.Create:
                        var msgCreate = gameProto.MsgCreate.decode(uint8array);
                        this.recvMsg(msgCreate.index);
                        LCHago.onCreate(msgCreate);
                        break;
                    case gameProto.MsgID.Start:
                        var msgStart = gameProto.MsgStart.decode(uint8array);
                        this.recvMsg(msgStart.index);
                        LCHago.onStart(msgStart);
                        break;
                    case gameProto.MsgID.Custom:
                        var msgCustom = gameProto.MsgCustom.decode(uint8array);
                        LCHago.onCustom(msgCustom.data);
                        this.recvMsg(msgCustom.index);
                        break;
                    case gameProto.MsgID.Error:
                        var msgError = gameProto.MsgError.decode(uint8array);
                        LCHago.onError(msgError.msg);
                        this.close();
                        break;
                    case gameProto.MsgID.SendError:
                        var msgSendError = gameProto.MsgSendError.decode(uint8array);
                        this.onSendError(msgSendError.from);
                        console.log("msgSendError", msgSendError);
                        break;
                    case gameProto.MsgID.End:
                        var msgEnd = gameProto.MsgEnd.decode(uint8array);
                        if (msgEnd.type == 0) {
                            LCHago.onNoStart();
                        }
                        if (msgEnd.type == 1) {
                            LCHago.onEndWin();
                        }
                        else if (msgEnd.type == 2) {
                            LCHago.onEndLose();
                        }
                        else {
                            LCHago.onEndDraw();
                        }
                        this.hasRecvResult = true;
                        break;
                }
            }
            catch (error) {
                console.log(error);
            }
            this.resetDuration();
        };
        WSServer.prototype.resetDuration = function () {
            this.pingDuration = 0;
            this.timeoutDuration = 0;
            this.closeDuration = 0;
        };
        WSServer.prototype.onClose = function () {
            this.ws = null;
            this.disconnect();
        };
        WSServer.prototype.saveSend = function (bytes) {
            this.sendIndex += 1;
            this.sendHistory.push(bytes);
        };
        WSServer.prototype.recvMsg = function (index) {
            if (index == this.recvIndex) {
                console.log("recvMsg", index, "顺序正确");
                this.recvIndex += 1;
            }
            else {
                console.log("recvMsg", index, "顺序错误", this.recvIndex);
            }
        };
        WSServer.prototype.ping = function () {
            this.send(pingBytes);
        };
        WSServer.prototype.pong = function () {
            this.send(pongBytes);
        };
        WSServer.prototype.send = function (msg) {
            if (this.ws && this.ws.readyState == 1) {
                this.ws.send(msg);
            }
        };
        WSServer.prototype.disconnect = function () {
            var _this = this;
            if (this.ws) {
                this.ws.close();
            }
            else {
                if (this.isClose == false) {
                    LCHago.onWSDisconnect();
                    setTimeout(function () {
                        if (_this.isClose == false) {
                            _this.connect();
                        }
                    }, 1000);
                }
            }
        };
        WSServer.prototype.close = function () {
            if (this.isClose) {
                return;
            }
            this.isClose = true;
            if (this.ws) {
                this.ws.close();
            }
            if (this.pingInterval) {
                clearInterval(this.pingInterval);
                this.pingInterval = null;
            }
            if (this.timeoutInterval) {
                clearInterval(this.timeoutInterval);
                this.timeoutInterval = null;
            }
            if (this.closeInterval) {
                clearInterval(this.closeInterval);
                this.closeInterval = null;
            }
            if (this.hasRecvResult) {
                LCHago.onWSClose();
            }
            else {
                LCHago.onWSTimeout();
            }
        };
        WSServer.prototype.join = function () {
            var msg = new gameProto.MsgJoin({
                ID: gameProto.MsgID.Join,
                userData: LCHago.Config.userData,
                roomData: LCHago.Config.roomData,
            });
            var msgBytes = gameProto.MsgJoin.encode(msg).finish();
            this.send(msgBytes);
        };
        WSServer.prototype.rejoin = function () {
            var msg = new gameProto.MsgRejoin({
                ID: gameProto.MsgID.Rejoin,
                joinID: this.joinID,
            });
            var msgBytes = gameProto.MsgRejoin.encode(msg).finish();
            this.send(msgBytes);
        };
        WSServer.prototype.sendReady = function () {
            if (!this.isSendReady) {
                this.isSendReady = true;
                var msg = new gameProto.MsgReady({
                    ID: gameProto.MsgID.Ready,
                    index: this.sendIndex
                });
                var msgBytes = gameProto.MsgReady.encode(msg).finish();
                this.saveSend(msgBytes);
                this.send(msgBytes);
                console.log("send Ready", "我方准备就绪");
            }
        };
        WSServer.prototype.sendCustom = function (data) {
            var msg = new gameProto.MsgCustom({
                ID: gameProto.MsgID.Custom,
                index: this.sendIndex,
                data: data
            });
            var msgBytes = gameProto.MsgCustom.encode(msg).finish();
            this.saveSend(msgBytes);
            this.send(msgBytes);
        };
        WSServer.prototype.sendResult = function (type) {
            if (!this.isSendResult) {
                this.isSendResult = true;
                var msg = new gameProto.MsgResult({
                    ID: gameProto.MsgID.Result,
                    index: this.sendIndex,
                    type: type
                });
                var msgBytes = gameProto.MsgResult.encode(msg).finish();
                this.saveSend(msgBytes);
                this.send(msgBytes);
            }
        };
        WSServer.prototype.onSendError = function (from) {
            for (var i = from, len = this.sendIndex; i < len; ++i) {
                this.send(this.sendHistory[i]);
            }
        };
        return WSServer;
    }());
    LCHago.WSServer = WSServer;
})(LCHago || (LCHago = {}));
var LCHago;
(function (LCHago) {
    var wsServer = new LCHago.WSServer();
    function Connect() {
        wsServer.connect();
    }
    LCHago.Connect = Connect;
    function Disconnect() {
        wsServer.disconnect();
    }
    LCHago.Disconnect = Disconnect;
    function Ready() {
        wsServer.sendReady();
    }
    LCHago.Ready = Ready;
    function Custom(data) {
        wsServer.sendCustom(data);
    }
    LCHago.Custom = Custom;
    function ResultNoStart() {
        wsServer.sendResult(0);
    }
    LCHago.ResultNoStart = ResultNoStart;
    function ResultWin() {
        wsServer.sendResult(1);
    }
    LCHago.ResultWin = ResultWin;
    function ResultLose() {
        wsServer.sendResult(2);
    }
    LCHago.ResultLose = ResultLose;
    function ResultDraw() {
        wsServer.sendResult(3);
    }
    LCHago.ResultDraw = ResultDraw;
})(LCHago || (LCHago = {}));
//# sourceMappingURL=LCHago.js.map