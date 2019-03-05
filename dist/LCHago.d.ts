declare namespace LCHago {
    let Config: {
        wsUrl: string;
        pingSpace: number;
        waitStartSpace: number;
        timeoutSpace: number;
        closeSpace: number;
        userData: {
            uid: string;
            name: string;
            avatar: string;
            opt: string;
        };
        roomData: {
            roomID: string;
            gameID: string;
            channelID: string;
            kv: string;
        };
    };
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
    let onWSConnect: () => void;
    let onWSTimeout: () => void;
    let onWSClose: () => void;
    let onWSDisconnect: () => void;
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
        send(msg: string | Uint8Array): void;
        disconnect(): void;
        close(): void;
        join(): void;
        rejoin(): void;
        sendReady(): void;
        sendCustom(data: any): void;
        sendResult(type: number): void;
        onSendError(from: number): void;
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
