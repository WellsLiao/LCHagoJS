var LCHago;
(function (LCHago) {
    LCHago.isHago = false;
    try {
        if (hago != null) {
            LCHago.isHago = true;
        }
    }
    catch (error) {
    }
    console.log("isHago", LCHago.isHago);
})(LCHago || (LCHago = {}));
var LCHago;
(function (LCHago) {
    LCHago.onWSOpen = function () {
        console.log("未监听onWSOpen", "网络连接正常");
    };
    LCHago.onWSReconnect = function () {
        console.log("未监听onWSReconnect", "正在尝试重连");
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
    LCHago.onEnterBackground = function () {
        console.log("未监听onEnterBackground");
    };
    LCHago.onEnterForeground = function () {
        console.log("未监听onEnterForeground");
    };
    LCHago.isEnterBackground = false;
    if (LCHago.isHago) {
        hago.setEnterBackgroundCallback(function () {
            console.error("setEnterBackgroundCallback");
            if (LCHago.onEnterBackground) {
                LCHago.onEnterBackground();
            }
            LCHago.isEnterBackground = true;
        });
        hago.setEnterForegroundCallback(function () {
            console.error("setEnterForegroundCallback");
            if (LCHago.onEnterForeground) {
                LCHago.onEnterForeground();
            }
            LCHago.isEnterBackground = false;
        });
    }
    else {
        document.addEventListener("visibilitychange", function (event) {
            if (document.hidden == true) {
                if (LCHago.onEnterBackground) {
                    LCHago.onEnterBackground();
                }
                LCHago.isEnterBackground = true;
            }
            else {
                if (LCHago.onEnterForeground) {
                    LCHago.onEnterForeground();
                }
                LCHago.isEnterBackground = false;
            }
        });
    }
})(LCHago || (LCHago = {}));
var LCHago;
(function (LCHago) {
    var msgPing = new gameProto.Msg();
    msgPing.ID = gameProto.MsgID.Ping;
    var pingBytes = gameProto.Msg.encode(msgPing).finish();
    var msgPong = new gameProto.Msg();
    msgPong.ID = gameProto.MsgID.Pong;
    var pongBytes = gameProto.Msg.encode(msgPing).finish();
    var lastT = 0;
    var currentTimestamp = 0;
    var update = function (t) {
        if (lastT != 0) {
            currentTimestamp += t - lastT;
        }
        lastT = t;
        requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
    var WebsocketClientStatus;
    (function (WebsocketClientStatus) {
        WebsocketClientStatus[WebsocketClientStatus["CLOSED"] = 0] = "CLOSED";
        WebsocketClientStatus[WebsocketClientStatus["CLOSING"] = 1] = "CLOSING";
        WebsocketClientStatus[WebsocketClientStatus["CONNECTING"] = 2] = "CONNECTING";
        WebsocketClientStatus[WebsocketClientStatus["OPEN"] = 3] = "OPEN";
    })(WebsocketClientStatus = LCHago.WebsocketClientStatus || (LCHago.WebsocketClientStatus = {}));
    var WebsocketClient = (function () {
        function WebsocketClient() {
            this.sendIndex = 0;
            this.sendHistory = [];
            this.recvIndex = 0;
            this.pingInterval = 3;
            this.timeoutInterval = 6;
            this.closeInterval = 10;
            this.pingDuration = 0;
            this.timeoutDuration = 0;
            this.closeDuration = 0;
            this.isConnected = false;
            this.isEnd = false;
            this.isSendReady = false;
            this.isSendResult = false;
            this.isCreate = false;
            this.isSurrender = false;
            this.isStart = false;
        }
        WebsocketClient.prototype.connect = function (url) {
            if (this.conn != null) {
                return;
            }
            this.url = url;
            this.status = WebsocketClientStatus.CONNECTING;
            this.startInterval();
            var conn = new WebSocket(url);
            if (this.isConnected == false) {
                this.isConnected = true;
                var startT_1 = currentTimestamp;
                var intervalNoStart_1 = setInterval(function () {
                    if (currentTimestamp - startT_1 >= 8000) {
                        clearInterval(intervalNoStart_1);
                        if (self.isCreate == false) {
                            LCHago.ResultNoStart();
                        }
                    }
                }, 500);
                var intervalError_1 = setInterval(function () {
                    if (currentTimestamp - startT_1 >= 12000) {
                        clearInterval(intervalError_1);
                        if (self.isCreate == false) {
                            hago.onPKExceptionFinish();
                        }
                    }
                }, 500);
            }
            var self = this;
            conn.onopen = function () {
                conn.binaryType = 'arraybuffer';
                self.status = WebsocketClientStatus.OPEN;
                self.resetDuration();
                if (self.onOpen) {
                    self.onOpen();
                }
            };
            conn.onmessage = function (evt) {
                self.resetDuration();
                var uint8array = new Uint8Array(evt.data);
                var msg = gameProto.Msg.decode(uint8array);
                switch (msg.ID) {
                    case gameProto.MsgID.Ping:
                        self.pong();
                        break;
                    case gameProto.MsgID.JoinResp:
                        var msgJoinResp = gameProto.MsgJoinResp.decode(uint8array);
                        self.joinID = msgJoinResp.joinID;
                        LCHago.onJoin();
                        break;
                    case gameProto.MsgID.Create:
                        self.isCreate = true;
                        var msgCreate = gameProto.MsgCreate.decode(uint8array);
                        self.recvMsg(msgCreate.index);
                        LCHago.onCreate(msgCreate);
                        if (LCHago.isHago) {
                            hago.onPKStart();
                            hago.setGameExitCallback(function () {
                                LCHago.ResultLose();
                            });
                        }
                        break;
                    case gameProto.MsgID.Start:
                        var msgStart = gameProto.MsgStart.decode(uint8array);
                        self.recvMsg(msgStart.index);
                        LCHago.onStart(msgStart);
                        self.isStart = true;
                        break;
                    case gameProto.MsgID.Custom:
                        var msgCustom = gameProto.MsgCustom.decode(uint8array);
                        LCHago.onCustom(msgCustom.data);
                        self.recvMsg(msgCustom.index);
                        break;
                    case gameProto.MsgID.Error:
                        var msgError = gameProto.MsgError.decode(uint8array);
                        self.close();
                        break;
                    case gameProto.MsgID.SendError:
                        var msgSendError = gameProto.MsgSendError.decode(uint8array);
                        self.onSendError(msgSendError.from);
                        break;
                    case gameProto.MsgID.End:
                        var msgEnd = gameProto.MsgEnd.decode(uint8array);
                        self.isEnd = true;
                        if (msgEnd.type == 0) {
                            LCHago.onNoStart();
                            self.isSurrender = true;
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
                        var result_1 = {
                            timestamp: msgEnd.timestamp,
                            nonstr: msgEnd.nonstr,
                            sign: msgEnd.sign,
                            resultrawdata: msgEnd.resultrawdata,
                            result: JSON.parse(msgEnd.resultrawdata)
                        };
                        if (LCHago.isHago) {
                            var startT_2 = currentTimestamp;
                            var number_1 = setInterval(function () {
                                if (currentTimestamp - startT_2 >= 3000) {
                                    clearInterval(number_1);
                                    hago.onPKFinish(JSON.stringify(result_1));
                                }
                            }, 500);
                        }
                        self.close();
                        break;
                }
            };
            this.conn = conn;
        };
        WebsocketClient.prototype.startInterval = function () {
            if (this.intervalNumber != null) {
                return;
            }
            var self = this;
            var startT = currentTimestamp;
            this.intervalNumber = setInterval(function () {
                var delta = (currentTimestamp - startT) / 1000;
                self.pingDuration += delta;
                self.timeoutDuration += delta;
                self.closeDuration += delta;
                startT = currentTimestamp;
                if (self.closeDuration >= self.closeInterval) {
                    self.closeDuration -= self.closeInterval;
                    self.close();
                }
                if (self.timeoutDuration >= self.timeoutInterval) {
                    self.timeoutDuration -= self.timeoutInterval;
                    self.reconnect();
                }
                if (self.pingDuration >= self.pingInterval) {
                    self.pingDuration -= self.pingInterval;
                    self.ping();
                }
            }, 500);
        };
        WebsocketClient.prototype.reconnect = function () {
            if (this.status <= WebsocketClientStatus.CLOSING) {
                return;
            }
            this.status = WebsocketClientStatus.CLOSING;
            if (this.conn) {
                this.conn.close();
                this.conn = null;
            }
            if (this.onReconnect) {
                this.onReconnect();
            }
            this.pingDuration = 0;
            this.timeoutDuration = 0;
            var self = this;
            setTimeout(function () {
                if (self.status == WebsocketClientStatus.CLOSING) {
                    self.connect(self.url);
                }
            }, 1000);
        };
        WebsocketClient.prototype.resetDuration = function () {
            this.pingDuration = 0;
            this.timeoutDuration = 0;
            this.closeDuration = 0;
        };
        WebsocketClient.prototype.saveSend = function (bytes) {
            this.sendIndex += 1;
            this.sendHistory.push(bytes);
        };
        WebsocketClient.prototype.recvMsg = function (index) {
            if (index == this.recvIndex) {
                this.recvIndex += 1;
            }
            else {
            }
        };
        WebsocketClient.prototype.ping = function () {
            if (LCHago.isEnterBackground) {
                return;
            }
            this.send(pingBytes);
        };
        WebsocketClient.prototype.pong = function () {
            if (LCHago.isEnterBackground) {
                return;
            }
            this.send(pongBytes);
        };
        WebsocketClient.prototype.send = function (msg) {
            if (this.status == WebsocketClientStatus.OPEN) {
                this.conn.send(msg);
                return true;
            }
            return false;
        };
        WebsocketClient.prototype.close = function () {
            if (this.status != WebsocketClientStatus.CLOSED) {
                this.status = WebsocketClientStatus.CLOSED;
                if (this.intervalNumber) {
                    clearInterval(this.intervalNumber);
                    this.intervalNumber = null;
                }
                if (this.conn) {
                    this.conn.close();
                    this.conn = null;
                }
                if (this.isEnd == false) {
                    LCHago.onEndLose();
                    var startT_3 = currentTimestamp;
                    var number_2 = setInterval(function () {
                        if (currentTimestamp - startT_3 >= 3000) {
                            clearInterval(number_2);
                            hago.onPKFinish("");
                        }
                    }, 500);
                }
            }
        };
        WebsocketClient.prototype.join = function (userData, roomData) {
            var msg = new gameProto.MsgJoin({
                ID: gameProto.MsgID.Join,
                userData: userData,
                roomData: roomData,
            });
            var msgBytes = gameProto.MsgJoin.encode(msg).finish();
            this.send(msgBytes);
        };
        WebsocketClient.prototype.rejoin = function () {
            var msg = new gameProto.MsgRejoin({
                ID: gameProto.MsgID.Rejoin,
                joinID: this.joinID,
            });
            var msgBytes = gameProto.MsgRejoin.encode(msg).finish();
            this.send(msgBytes);
        };
        WebsocketClient.prototype.recvErr = function () {
            var msg = new gameProto.MsgRecvError({
                ID: gameProto.MsgID.RecvError,
                from: this.recvIndex,
            });
            var msgBytes = gameProto.MsgRecvError.encode(msg).finish();
            this.send(msgBytes);
        };
        WebsocketClient.prototype.sendReady = function () {
            if (!this.isSendReady) {
                this.isSendReady = true;
                var msg = new gameProto.MsgReady({
                    ID: gameProto.MsgID.Ready,
                    index: this.sendIndex
                });
                var msgBytes = gameProto.MsgReady.encode(msg).finish();
                this.saveSend(msgBytes);
                this.send(msgBytes);
            }
        };
        WebsocketClient.prototype.sendCustom = function (data) {
            var msg = new gameProto.MsgCustom({
                ID: gameProto.MsgID.Custom,
                index: this.sendIndex,
                data: data
            });
            var msgBytes = gameProto.MsgCustom.encode(msg).finish();
            this.saveSend(msgBytes);
            this.send(msgBytes);
        };
        WebsocketClient.prototype.sendResult = function (type) {
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
        WebsocketClient.prototype.onSendError = function (from) {
            for (var i = from, len = this.sendIndex; i < len; ++i) {
                this.send(this.sendHistory[i]);
            }
        };
        return WebsocketClient;
    }());
    LCHago.WebsocketClient = WebsocketClient;
})(LCHago || (LCHago = {}));
var LCHago;
(function (LCHago) {
    LCHago.testRobot = false;
    var url = "wss://www.duligame.cn:8890";
    var userData = {
        uid: "uid",
        name: "name",
        avatar: "avatar",
        opt: "",
    };
    var roomData = {
        roomID: "roomID",
        gameID: "gameID",
        channelID: "channelID",
        kv: "",
    };
    var wsClient = new LCHago.WebsocketClient();
    wsClient.onOpen = function () {
        LCHago.onWSOpen();
        if (wsClient.joinID == null) {
            if (LCHago.isHago == false && LCHago.testRobot == true) {
                userData.opt = JSON.stringify({
                    ai_info: {
                        uid: "robotuid",
                        nick: "robotnick"
                    }
                });
            }
            wsClient.join(userData, roomData);
        }
        else {
            wsClient.rejoin();
            wsClient.recvErr();
        }
    };
    wsClient.onReconnect = function () {
        LCHago.onWSReconnect();
    };
    if (LCHago.isHago) {
        hago.setGameExitCallback(function () {
            hago.onGameExit();
        });
        hago.onPKLoading();
        function getURL(wsscheme, wsDomain, port, gameid, roomid, postData, timestamp, nonstr, sign) {
            var url = wsscheme +
                "://" +
                wsDomain +
                ":" +
                port +
                "/" +
                gameid +
                "/" +
                roomid +
                "?post_data=" +
                encodeURIComponent(postData) +
                "&timestamp=" +
                timestamp + "&nonstr=" + nonstr + "&sign=" + sign;
            return url;
        }
        var getQueryString = function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null)
                return decodeURIComponent(r[2]);
            return null;
        };
        var wsscheme_1 = getQueryString("wsscheme");
        var wsDomain_1 = getQueryString("websocketdomain");
        var port_1 = getQueryString("port");
        var postData_1 = getQueryString("post_data");
        var timestamp_1 = getQueryString("timestamp");
        var nonstr_1 = getQueryString("nonstr");
        var sign_1 = getQueryString("sign");
        var pd = JSON.parse(postData_1);
        var gameid_1 = pd.gameid;
        var roomid_1 = pd.roomid;
        function getPlayerURL() {
            return getURL(wsscheme_1, wsDomain_1, port_1, gameid_1, roomid_1, postData_1, timestamp_1, nonstr_1, sign_1);
        }
        url = getPlayerURL();
        userData = {
            uid: pd.player.uid,
            name: pd.player.name,
            avatar: pd.player.avatar,
            opt: pd.player.opt,
        };
        roomData = {
            roomID: pd.roomid,
            gameID: pd.gameid,
            channelID: pd.channelid,
            kv: getQueryString("kv_url"),
        };
    }
    function Connect() {
        if (LCHago.isHago) {
            hago.onPKFinishLoading();
        }
        wsClient.connect(url);
    }
    LCHago.Connect = Connect;
    function reconnect() {
        wsClient.reconnect();
    }
    LCHago.reconnect = reconnect;
    function Close() {
        wsClient.close();
    }
    LCHago.Close = Close;
    function Ready() {
        wsClient.sendReady();
    }
    LCHago.Ready = Ready;
    function Custom(data) {
        wsClient.sendCustom(data);
    }
    LCHago.Custom = Custom;
    function ResultNoStart() {
        wsClient.sendResult(0);
    }
    LCHago.ResultNoStart = ResultNoStart;
    function ResultWin() {
        wsClient.sendResult(1);
    }
    LCHago.ResultWin = ResultWin;
    function ResultLose() {
        wsClient.sendResult(2);
    }
    LCHago.ResultLose = ResultLose;
    function ResultDraw() {
        wsClient.sendResult(3);
    }
    LCHago.ResultDraw = ResultDraw;
    function GetDeviceInfo(cb) {
        if (LCHago.isHago) {
            hago.getDeviceInfo({
                success: function (deviceInfo) {
                    cb(deviceInfo);
                },
                failure: function () {
                }
            });
        }
        else {
            cb({
                safeAreaInser: {
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0
                },
                lang: "en",
                screenSize: {
                    width: document.body.clientWidth,
                    height: document.body.clientHeight
                }
            });
        }
    }
    LCHago.GetDeviceInfo = GetDeviceInfo;
})(LCHago || (LCHago = {}));
//# sourceMappingURL=LCHago.js.map