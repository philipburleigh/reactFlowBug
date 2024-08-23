import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  ReactFlowProvider,
  Controls,
  Node,
  ProOptions,
  applyNodeChanges,
  OnNodesChange,
  NodeChange,
  useReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import {
  nodes as defaultNodes,
  edges as defaultEdges,
} from "./initialElements";
import { getHelperLines } from "./utils";
import HelperLines from "./HelperLines";

const proOptions: ProOptions = { account: "paid-pro", hideAttribution: true };

// this example shows how to implement helper lines within React Flow
// usage: drag nodes around to see them snap and align with other nodes boundaries
function ReactFlowPro() {
  const [helperLineHorizontal, setHelperLineHorizontal] = useState<
    number | undefined
  >(undefined);
  const [helperLineVertical, setHelperLineVertical] = useState<
    number | undefined
  >(undefined);

  const customApplyNodeChanges = useCallback(
    (changes: NodeChange[], nodes: Node[]): Node[] => {
      // reset the helper lines (clear existing lines, if any)
      setHelperLineHorizontal(undefined);
      setHelperLineVertical(undefined);

      // this will be true if it's a single node being dragged
      // inside we calculate the helper lines and snap position for the position where the node is being moved to
      if (
        changes.length === 1 &&
        changes[0].type === "position" &&
        changes[0].dragging &&
        changes[0].position
      ) {
        const helperLines = getHelperLines(changes[0], nodes);

        // if we have a helper line, we snap the node to the helper line position
        // this is being done by manipulating the node position inside the change object
        changes[0].position.x =
          helperLines.snapPosition.x ?? changes[0].position.x;
        changes[0].position.y =
          helperLines.snapPosition.y ?? changes[0].position.y;

        // if helper lines are returned, we set them so that they can be displayed
        setHelperLineHorizontal(helperLines.horizontal);
        setHelperLineVertical(helperLines.vertical);
      }

      return applyNodeChanges(changes, nodes);
    },
    []
  );

  const rfInstance = useReactFlow();

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      if (rfInstance) {
        rfInstance.setNodes((nodes) => customApplyNodeChanges(changes, nodes));
      }
    },
    [rfInstance, customApplyNodeChanges]
  );

  return (
    <ReactFlow
      defaultNodes={defaultNodes}
      defaultEdges={defaultEdges}
      onNodesChange={onNodesChange}
      proOptions={proOptions}
      fitView
      elevateEdgesOnSelect
      elevateNodesOnSelect
    >
      <Background />
      <Controls />
      <HelperLines
        horizontal={helperLineHorizontal}
        vertical={helperLineVertical}
      />
    </ReactFlow>
  );
}

function ReactFlowWrapper() {
  return (
    <ReactFlowProvider>
      <ReactFlowPro />
    </ReactFlowProvider>
  );
}

export default ReactFlowWrapper;
