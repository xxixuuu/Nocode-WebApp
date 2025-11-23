import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

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

interface CollaborationState {
  connected: boolean;
  activeUsers: User[];
  cursors: Map<string, CursorPosition>;
}

interface UseCollaborationOptions {
  roomId: string;
  userId: string;
  userName: string;
  onComponentUpdate?: (components: any[], userId: string) => void;
  onSelectionChange?: (userId: string, componentId: string | null) => void;
  enabled?: boolean;
}

export function useCollaboration({
  roomId,
  userId,
  userName,
  onComponentUpdate,
  onSelectionChange,
  enabled = true,
}: UseCollaborationOptions) {
  const [state, setState] = useState<CollaborationState>({
    connected: false,
    activeUsers: [],
    cursors: new Map(),
  });

  const socketRef = useRef<Socket | null>(null);
  const userColorRef = useRef<string>(generateRandomColor());

  // Initialize socket connection
  useEffect(() => {
    if (!enabled) return;

    const socket = io('http://localhost:3001/collaboration', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setState((prev) => ({ ...prev, connected: true }));

      // Join the room
      socket.emit('join_room', { roomId, userId, userName });
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setState((prev) => ({ ...prev, connected: false }));
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Room events
    socket.on('room_state', ({ components, users }) => {
      console.log('Received room state:', { components, users });
      if (onComponentUpdate) {
        onComponentUpdate(components, 'sync');
      }
    });

    socket.on('active_users', (users: User[]) => {
      setState((prev) => ({ ...prev, activeUsers: users }));
    });

    socket.on('user_joined', ({ userId: joinedUserId, userName: joinedUserName }) => {
      console.log(`User ${joinedUserName} joined the room`);
    });

    socket.on('user_left', ({ userId: leftUserId, userName: leftUserName }) => {
      console.log(`User ${leftUserName} left the room`);
      setState((prev) => {
        const newCursors = new Map(prev.cursors);
        newCursors.delete(leftUserId);
        return { ...prev, cursors: newCursors };
      });
    });

    // Collaboration events
    socket.on('component_update', ({ userId: updateUserId, components }) => {
      console.log(`Received component update from user ${updateUserId}`);
      if (onComponentUpdate && updateUserId !== userId) {
        onComponentUpdate(components, updateUserId);
      }
    });

    socket.on('cursor_move', (data: Omit<CursorPosition, 'userId'> & { userId: string }) => {
      setState((prev) => {
        const newCursors = new Map(prev.cursors);
        newCursors.set(data.userId, {
          userId: data.userId,
          userName: data.userName,
          position: data.position,
          color: data.color,
        });
        return { ...prev, cursors: newCursors };
      });
    });

    socket.on('selection_change', ({ userId: selectUserId, componentId }) => {
      if (onSelectionChange && selectUserId !== userId) {
        onSelectionChange(selectUserId, componentId);
      }

      setState((prev) => ({
        ...prev,
        activeUsers: prev.activeUsers.map((user) =>
          user.userId === selectUserId
            ? { ...user, selectedComponentId: componentId }
            : user
        ),
      }));
    });

    // Cleanup
    return () => {
      if (socket.connected) {
        socket.emit('leave_room', { roomId, userId });
        socket.disconnect();
      }
    };
  }, [roomId, userId, userName, enabled, onComponentUpdate, onSelectionChange]);

  // Broadcast component updates
  const broadcastComponentUpdate = useCallback(
    (components: any[]) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('component_update', {
          roomId,
          userId,
          components,
          timestamp: Date.now(),
        });
      }
    },
    [roomId, userId]
  );

  // Broadcast cursor position
  const broadcastCursorPosition = useCallback(
    (position: { x: number; y: number }) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('cursor_move', {
          roomId,
          userId,
          userName,
          position,
          color: userColorRef.current,
        });
      }
    },
    [roomId, userId, userName]
  );

  // Broadcast selection change
  const broadcastSelectionChange = useCallback(
    (componentId: string | null) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('selection_change', {
          roomId,
          userId,
          componentId,
        });
      }
    },
    [roomId, userId]
  );

  // Request sync from server
  const requestSync = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('request_sync', { roomId });
    }
  }, [roomId]);

  return {
    connected: state.connected,
    activeUsers: state.activeUsers,
    cursors: state.cursors,
    broadcastComponentUpdate,
    broadcastCursorPosition,
    broadcastSelectionChange,
    requestSync,
  };
}

// Utility: Generate random color for cursor
function generateRandomColor(): string {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
    '#F8B739',
    '#52B788',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
