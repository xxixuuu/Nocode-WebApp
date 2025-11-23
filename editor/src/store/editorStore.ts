import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type { Component, EditorState } from '../types';

interface EditorStore extends EditorState {
  components: Component[];

  // Component operations
  addComponent: (component: Omit<Component, 'id'>) => void;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  deleteComponent: (id: string) => void;
  moveComponent: (id: string, newParentId: string | null, newOrder: number) => void;
  duplicateComponent: (id: string) => void;

  // Selection
  selectComponent: (id: string | null) => void;
  hoverComponent: (id: string | null) => void;

  // Clipboard
  copyComponent: (id: string) => void;
  pasteComponent: () => void;

  // History
  undo: () => void;
  redo: () => void;

  // Utilities
  getComponentById: (id: string) => Component | undefined;
  getComponentChildren: (id: string) => Component[];
}

export const useEditorStore = create<EditorStore>()(
  devtools(
    immer((set, get) => ({
      components: [],
      selectedComponentId: null,
      hoveredComponentId: null,
      clipboard: null,
      history: [[]],
      historyIndex: 0,

      addComponent: (component) =>
        set((state) => {
          const newComponent: Component = {
            ...component,
            id: nanoid(),
            children: [],
          };

          state.components.push(newComponent);

          // Update parent's children
          if (newComponent.parentId) {
            const parent = state.components.find(c => c.id === newComponent.parentId);
            if (parent) {
              parent.children.push(newComponent.id);
            }
          }

          // Save to history
          state.history = state.history.slice(0, state.historyIndex + 1);
          state.history.push([...state.components]);
          state.historyIndex++;
        }),

      updateComponent: (id, updates) =>
        set((state) => {
          const component = state.components.find(c => c.id === id);
          if (component) {
            Object.assign(component, updates);

            // Save to history
            state.history = state.history.slice(0, state.historyIndex + 1);
            state.history.push([...state.components]);
            state.historyIndex++;
          }
        }),

      deleteComponent: (id) =>
        set((state) => {
          const component = state.components.find(c => c.id === id);
          if (!component) return;

          // Remove from parent's children
          if (component.parentId) {
            const parent = state.components.find(c => c.id === component.parentId);
            if (parent) {
              parent.children = parent.children.filter(childId => childId !== id);
            }
          }

          // Delete all children recursively
          const deleteRecursive = (componentId: string) => {
            const comp = state.components.find(c => c.id === componentId);
            if (comp) {
              comp.children.forEach(deleteRecursive);
              state.components = state.components.filter(c => c.id !== componentId);
            }
          };

          deleteRecursive(id);

          // Clear selection if deleted
          if (state.selectedComponentId === id) {
            state.selectedComponentId = null;
          }

          // Save to history
          state.history = state.history.slice(0, state.historyIndex + 1);
          state.history.push([...state.components]);
          state.historyIndex++;
        }),

      moveComponent: (id, newParentId, newOrder) =>
        set((state) => {
          const component = state.components.find(c => c.id === id);
          if (!component) return;

          // Remove from old parent
          if (component.parentId) {
            const oldParent = state.components.find(c => c.id === component.parentId);
            if (oldParent) {
              oldParent.children = oldParent.children.filter(childId => childId !== id);
            }
          }

          // Add to new parent
          component.parentId = newParentId;
          component.order = newOrder;

          if (newParentId) {
            const newParent = state.components.find(c => c.id === newParentId);
            if (newParent) {
              newParent.children.splice(newOrder, 0, id);
            }
          }

          // Save to history
          state.history = state.history.slice(0, state.historyIndex + 1);
          state.history.push([...state.components]);
          state.historyIndex++;
        }),

      duplicateComponent: (id) =>
        set((state) => {
          const component = state.components.find(c => c.id === id);
          if (!component) return;

          const duplicateRecursive = (comp: Component, parentId: string | null): Component => {
            const newComp: Component = {
              ...comp,
              id: nanoid(),
              parentId,
              children: [],
            };

            state.components.push(newComp);

            // Duplicate children
            comp.children.forEach(childId => {
              const child = state.components.find(c => c.id === childId);
              if (child) {
                const duplicatedChild = duplicateRecursive(child, newComp.id);
                newComp.children.push(duplicatedChild.id);
              }
            });

            return newComp;
          };

          duplicateRecursive(component, component.parentId);

          // Save to history
          state.history = state.history.slice(0, state.historyIndex + 1);
          state.history.push([...state.components]);
          state.historyIndex++;
        }),

      selectComponent: (id) =>
        set((state) => {
          state.selectedComponentId = id;
        }),

      hoverComponent: (id) =>
        set((state) => {
          state.hoveredComponentId = id;
        }),

      copyComponent: (id) =>
        set((state) => {
          const component = state.components.find(c => c.id === id);
          if (component) {
            state.clipboard = component;
          }
        }),

      pasteComponent: () =>
        set((state) => {
          if (!state.clipboard) return;

          const duplicateRecursive = (comp: Component, parentId: string | null): Component => {
            const newComp: Component = {
              ...comp,
              id: nanoid(),
              parentId,
              children: [],
            };

            state.components.push(newComp);

            return newComp;
          };

          duplicateRecursive(state.clipboard, state.selectedComponentId);

          // Save to history
          state.history = state.history.slice(0, state.historyIndex + 1);
          state.history.push([...state.components]);
          state.historyIndex++;
        }),

      undo: () =>
        set((state) => {
          if (state.historyIndex > 0) {
            state.historyIndex--;
            state.components = [...state.history[state.historyIndex]];
          }
        }),

      redo: () =>
        set((state) => {
          if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            state.components = [...state.history[state.historyIndex]];
          }
        }),

      getComponentById: (id) => get().components.find(c => c.id === id),

      getComponentChildren: (id) =>
        get().components.filter(c => c.parentId === id),
    })),
    { name: 'EditorStore' }
  )
);
