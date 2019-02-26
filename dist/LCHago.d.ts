declare namespace LCHago {
    let Config: {
        wsUrl: string;
        pingSpace: number;
        timeoutSpace: number;
        closeSpace: number;
        userData: gameProto.UserData;
        roomData: gameProto.RoomData;
    };
}
declare namespace LCHago {
    let onWSConnect: () => void;
    let onWSTimeout: () => void;
    let onWSClose: () => void;
    let onWSDisconnect: () => void;
    let onWSReconnect: () => void;
    let onJoin: (myID: string) => void;
    let onCreate: (data: any) => void;
    let onStart: () => void;
    let onCustom: (data: any) => void;
    let onEnd: (winnerID: any) => void;
    let onError: (data: any) => void;
}
declare namespace LCHago {
    class WSServer {
        private ws;
        private joinID;
        private isClose;
        private isSendReady;
        private isSendResult;
        private hasRecvResult;
        private pingInterval;
        private pingDuration;
        private timeoutInterval;
        private timeoutDuration;
        private closeInterval;
        private closeDuration;
        private sendIndex;
        private sendHistory;
        private recvIndex;
        constructor();
        connect(): void;
        private onOpen();
        private onMessage(evt);
        private resetDuration();
        private onClose();
        saveSend(bytes: any): void;
        recvMsg(index: number): void;
        ping(): void;
        pong(): void;
        send(msg: string): void;
        disconnect(): void;
        close(): void;
        join(): void;
        sendReady(): void;
        sendCustom(data: any): void;
        sendResult(type: number): void;
    }
}
declare namespace LCHago {
    function Connect(): void;
    function Disconnect(): void;
    function Ready(): void;
    function Custom(data: string): void;
    function ResultNoStart(): void;
    function ResultWin(): void;
    function ResultLose(): void;
    function ResultDraw(): void;
}
