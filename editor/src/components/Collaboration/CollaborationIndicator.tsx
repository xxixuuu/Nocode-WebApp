import { Users, Wifi, WifiOff } from 'lucide-react';

interface User {
  userId: string;
  userName: string;
  selectedComponentId?: string | null;
}

interface CursorPosition {
  userId: string;
  userName: string;
  position: { x: number; y: number };
  color: string;
}

interface CollaborationIndicatorProps {
  connected: boolean;
  activeUsers: User[];
  cursors: Map<string, CursorPosition>;
}

export function CollaborationIndicator({
  connected,
  activeUsers,
  cursors,
}: CollaborationIndicatorProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {connected ? (
          <>
            <Wifi className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-600">Live</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Offline</span>
          </>
        )}
      </div>

      {/* Active Users */}
      {connected && activeUsers.length > 0 && (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <div className="flex -space-x-2">
            {activeUsers.map((user) => (
              <div
                key={user.userId}
                className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium border-2 border-background"
                title={user.userName}
              >
                {user.userName.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'}
          </span>
        </div>
      )}

      {/* Remote Cursors */}
      {Array.from(cursors.values()).map((cursor) => (
        <RemoteCursor key={cursor.userId} cursor={cursor} />
      ))}
    </div>
  );
}

function RemoteCursor({ cursor }: { cursor: CursorPosition }) {
  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-100"
      style={{
        left: `${cursor.position.x}px`,
        top: `${cursor.position.y}px`,
      }}
    >
      {/* Cursor Icon */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.3673L11.8619 6.15922C12.3002 5.72098 13.014 5.98867 13.014 6.60303V17.3967C13.014 18.0111 12.3002 18.2788 11.8619 17.8405L9.91586 15.8945L8.75381 19.0755C8.63713 19.4053 8.29861 19.5999 7.94901 19.5327L5.93686 19.1513C5.58726 19.0842 5.34913 18.7456 5.41623 18.396L6.56167 13.9709L5.65376 13.0629C5.21552 12.6247 5.21552 11.9109 5.65376 11.4726V12.3673Z"
          fill={cursor.color}
        />
      </svg>

      {/* User Name Label */}
      <div
        className="absolute top-6 left-6 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap"
        style={{ backgroundColor: cursor.color }}
      >
        {cursor.userName}
      </div>
    </div>
  );
}
