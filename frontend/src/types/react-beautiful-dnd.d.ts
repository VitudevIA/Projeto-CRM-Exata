declare module "react-beautiful-dnd" {
  import * as React from "react";

  export interface DraggableProvided {
    draggableProps: any;
    dragHandleProps: any;
    innerRef: (element: HTMLElement | null) => void;
  }

  export interface DraggableStateSnapshot {
    isDragging: boolean;
    isDropAnimating: boolean;
  }

  export interface DroppableProvided {
    innerRef: (element: HTMLElement | null) => void;
    droppableProps: any;
    placeholder?: React.ReactElement | null;
  }

  export interface DroppableStateSnapshot {
    isDraggingOver: boolean;
    draggingOverWith: string | null;
    draggingFromThisWith: string | null;
  }

  export interface DropResult {
    draggableId: string;
    type: string;
    source: {
      droppableId: string;
      index: number;
    };
    reason: "DROP" | "CANCEL";
    destination?: {
      droppableId: string;
      index: number;
    } | null;
    combine?: {
      draggableId: string;
      droppableId: string;
    } | null;
  }

  export interface DragDropContextProps {
    onDragEnd: (result: DropResult) => void;
    onDragStart?: (initial: any) => void;
    onDragUpdate?: (update: any) => void;
    children: React.ReactNode;
  }

  export class DragDropContext extends React.Component<DragDropContextProps> {}

  export interface DroppableProps {
    droppableId: string;
    type?: string;
    mode?: "standard" | "virtual";
    isDropDisabled?: boolean;
    isCombineEnabled?: boolean;
    direction?: "horizontal" | "vertical";
    ignoreContainerClipping?: boolean;
    renderClone?: (provided: DraggableProvided, snapshot: DraggableStateSnapshot, rubric: any) => React.ReactElement;
    getContainerForClone?: () => HTMLElement;
    children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactElement;
  }

  export class Droppable extends React.Component<DroppableProps> {}

  export interface DraggableProps {
    draggableId: string;
    index: number;
    isDragDisabled?: boolean;
    disableInteractiveElementBlocking?: boolean;
    shouldRespectForcePress?: boolean;
    children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => React.ReactElement;
  }

  export class Draggable extends React.Component<DraggableProps> {}
}

