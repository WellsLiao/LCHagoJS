declare namespace LCHago {
    let isHago: boolean;
}
declare namespace LCHago {
    interface IUserData {
        uid?: (string | null);
        name?: (string | null);
        avatar?: (string | null);
        opt?: (string | null);
    }
    interface IPlayer {
        id?: (string | null);
        user?: (IUserData | null);
    }
    interface IMsgCreate {
        seed?: (number | null);
        playerArray?: (IPlayer[] | null);
        timestamp?: (number | null);
    }
    interface IMsgStart {
        timestamp?: (number | null);
    }
    let onWSOpen: () => void;
    let onWSReconnect: () => void;
    let onJoin: () => void;
    let onCreate: (data: IMsgCreate) => void;
    let onStart: (data: IMsgStart) => void;
    let onCustom: (data: string) => void;
    let onNoStart: () => void;
    let onEndWin: () => void;
    let onEndLose: () => void;
    let onEndDraw: () => void;
    let onError: (data: any) => void;
    let onEnterBackground: () => void;
    let onEnterForeground: () => void;
    let isEnterBackground: boolean;
}
declare namespace LCHago {
    enum WebsocketClientStatus {
        CLOSED = 0,
        CLOSING = 1,
        CONNECTING = 2,
        OPEN = 3,
    }
    class WebsocketClient {
        private conn;
        private url;
        private status;
        private sendIndex;
        private sendHistory;
        private recvIndex;
        private pingInterval;
        private timeoutInterval;
        private closeInterval;
        private pingDuration;
        private timeoutDuration;
        private closeDuration;
        private intervalNumber;
        joinID: string;
        isEnd: boolean;
        isSendReady: boolean;
        isSendResult: boolean;
        isCreate: boolean;
        isSurrender: boolean;
        isStart: boolean;
        onOpen: () => void;
        onReconnect: () => void;
        onClose: () => void;
        constructor();
        connect(url: string): void;
        private startInterval();
        reconnect(): void;
        private resetDuration();
        saveSend(bytes: any): void;
        recvMsg(index: number): void;
        ping(): void;
        pong(): void;
        send(msg: string | Uint8Array): boolean;
        close(): void;
        join(userData: any, roomData: any): void;
        rejoin(): void;
        recvErr(): void;
        sendReady(): void;
        sendCustom(data: any): void;
        sendResult(type: number): void;
        onSendError(from: number): void;
    }
}
declare namespace LCHago {
    let testRobot: boolean;
    function Connect(): void;
    function reconnect(): void;
    function Close(): void;
    function Ready(): void;
    function Custom(data: string): void;
    function ResultNoStart(): void;
    function ResultWin(): void;
    function ResultLose(): void;
    function ResultDraw(): void;
    function GetDeviceInfo(cb: (deviceInfo: {
        safeAreaInser: {
            top: number;
            left: number;
            bottom: number;
            right: number;
        };
        lang: string;
        screenSize: {
            width: number;
            height: number;
        };
    }) => void): void;
}
