import React, { useRef, useCallback, Fragment, useState } from "react";
import {
    ReactFlow,
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    useReactFlow,
    Background,
    MiniMap,
    reconnectEdge,
} from "reactflow";
import CustomNode from "./CustomNode";
import RightBar from "./RightBar";
import AlertDialogSlide from "./AlertDialog";
import { Backdrop } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { FaSave, FaUpload } from "react-icons/fa"; // Importa los íconos de guardar y subir

import { toast } from "react-toastify";

let id = 0;
const getId = () => `dndnode_${id++}`;

const nodeTypes = {
    customNode: CustomNode,
};

const initialNodes = [];
const initialEdges = [];

const SaveControl = ({ onSave }) => {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                padding: "8px",
                cursor: "pointer",
            }}
            onClick={onSave}
            title="Guardar Flujo"
        >
            <FaSave size={11} />
        </div>
    );
};

const UploadControl = ({ onUpload }) => {
    return (
        <label
            style={{
                display: "flex",
                alignItems: "center",
                padding: "8px",
                cursor: "pointer",
            }}
            title="Cargar Flujo"
        >
            <FaUpload size={11} />
            <input
                type="file"
                accept=".json"
                onChange={onUpload}
                style={{ display: "none" }}
            />
        </label>
    );
};

const DnDFlow = () => {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { screenToFlowPosition } = useReactFlow();

    const [nodesData, setNodesData] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [nodeToAdd, setNodeToAdd] = useState(null);

    console.log(edges);
    console.log(selectedNode);

    // Alert state
    const [openAlertDialog, setOpenAlertDialog] = useState(false);
    const [dialogInfo, setDialogInfo] = useState({ title: "", content: "" });

    const handleCloseDialog = () => {
        setOpenAlertDialog(false);
    };

    const handleOpenAlert = (titleInfo, contentInfo) => {
        setOpenAlertDialog(true);
        setDialogInfo({ title: titleInfo, content: contentInfo });
    };

    const handleReplaceNode = () => {
        var newNodes = [];

        if (nodeToAdd.data.name === "BWA") {
            newNodes = nodes.filter((node) => node.data.name !== "Star");
        }
        if (nodeToAdd.data.name === "Star") {
            newNodes = nodes.filter((node) => node.data.name !== "BWA");
            console.log(newNodes);
        }

        setNodes([...newNodes, nodeToAdd]);
        setNodesData([...newNodes, nodeToAdd]);
        handleCloseDialog();
    };

    const handleCancelNodeAddition = () => {
        setNodeToAdd(null);
        handleCloseDialog();
    };

    // Handle node click and set selected node
    const handleNodeClick = (node) => {
        setSelectedNode(node);
    };

    const onCloseRightBar = () => {
        setNodes((nodes) =>
            nodes.map((node) => ({
                ...node,
                selected: false,
            }))
        );
        setSelectedNode(null);
    };

    const onConnect = useCallback(
        (params) =>
            setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        []
    );

    const onReconnect = useCallback(
        (oldEdge, newConnection) =>
            setEdges((els) =>
                reconnectEdge(
                    { ...oldEdge, animated: true },
                    { ...newConnection, animated: true },
                    els
                )
            ),
        []
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    // Alignment validation
    const aligmentValidation = (newNode, currentNodes) => {
        if (newNode.data.name === "BWA") {
            const starCount = currentNodes.filter(
                (node) => node.data.name === "Star"
            ).length;
            if (starCount > 0) {
                handleOpenAlert(
                    "Hmmm.... Solo se puede tener 1 herramienta de alineación",
                    "La herramienta BWA reemplazará a STAR"
                );
                setNodeToAdd(newNode);
                return false;
            }
        }

        if (newNode.data.name === "Star") {
            const bwaCount = currentNodes.filter(
                (node) => node.data.name === "BWA"
            ).length;
            if (bwaCount > 0) {
                handleOpenAlert(
                    "Hmmm.... Solo se puede tener 1 herramienta de alineación",
                    "La herramienta STAR reemplazará a BWA"
                );
                setNodeToAdd(newNode);
                return false;
            }
        }
        return true;
    };

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const nodeDataString = event.dataTransfer.getData(
                "application/reactflow"
            );
            const nodeData = JSON.parse(nodeDataString);

            if (!nodeData) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: getId(),
                type: "customNode",
                position,
                data: nodeData,
            };

            // Validation onDrop
            const isValid = aligmentValidation(newNode, nodes);
            if (!isValid) {
                return;
            }

            setNodes((nds) => nds.concat(newNode));
            setNodesData((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, aligmentValidation, nodes]
    );

    // Handle form data change
    const handleFormDataChange = (newFormData) => {
        const newNodeData = [...nodesData];
        const newNode = newNodeData.find((node) => node.id === selectedNode.id);
        newNode.data.formData = newFormData;
        setNodesData(newNodeData);
    };

    // Loading state
    const [loading, setLoading] = useState(false);

    // Get sources of edges where the selected node is the target
    const sourcesOfSelectedNode = selectedNode
        ? edges
              .filter((edge) => edge.target === selectedNode.id)
              .map((edge) => edge.source)
        : [];

    const saveFlowToJson = () => {
        const flow = {
            nodes,
            edges,
        };
        const json = JSON.stringify(flow, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "flow.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const uploadFlowFromJson = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const flow = JSON.parse(e.target.result);
            setNodes(flow.nodes);
            setEdges(flow.edges);
            setNodesData(flow.nodes); // Actualiza los datos de los nodos
        };
        reader.readAsText(file);
    };

    return (
        <Fragment>
            <div className="dndflow">
                <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onReconnect={onReconnect}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onSelectionChange={(elements) => {
                            if (elements.nodes.length === 0) {
                                setSelectedNode(null);
                            }
                        }}
                        nodeTypes={nodeTypes}
                        onNodeClick={(event, node) => handleNodeClick(node)}
                        fitView
                    >
                        <Background />
                        <Controls>
                            <SaveControl onSave={saveFlowToJson} />
                            <UploadControl onUpload={uploadFlowFromJson} />
                        </Controls>
                        <MiniMap />
                    </ReactFlow>
                </div>
                <RightBar
                    open={Boolean(selectedNode)}
                    toolName={selectedNode?.data?.name}
                    onClose={onCloseRightBar}
                    formData={selectedNode?.data?.formData}
                    id={selectedNode?.id}
                    onFormDataChange={handleFormDataChange}
                    setLoading={setLoading}
                    loading={loading}
                    sources={sourcesOfSelectedNode} // Pass sources here
                />
            </div>
            <AlertDialogSlide
                open={openAlertDialog}
                handleClose={handleCloseDialog}
                title={dialogInfo.title}
                content={dialogInfo.content}
                onConfirm={handleReplaceNode}
                onCancel={handleCancelNodeAddition}
            />
            <Backdrop
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Fragment>
    );
};

export default () => (
    <ReactFlowProvider>
        <DnDFlow />
    </ReactFlowProvider>
);
