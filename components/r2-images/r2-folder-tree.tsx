/**
 * R2 Folder Tree Component
 *
 * Recursive folder tree component with lazy-loading subfolders.
 * Displays folders in a tree structure with expand/collapse functionality.
 */

"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Folder, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { R2BucketName, R2Object } from "@/types/r2";

interface FolderNode {
  key: string;
  name: string;
  path: string;
  children?: FolderNode[];
  isLoading?: boolean;
  isExpanded?: boolean;
  hasLoaded?: boolean;
}

interface R2FolderTreeProps {
  bucket: R2BucketName;
  currentFolder: string;
  rootFolders?: R2Object[]; // Optional, tree fetches root folders independently
  onFolderClick: (folderPath: string) => void;
}

/**
 * Fetch subfolders for a given folder path
 */
async function fetchSubfolders(
  bucket: R2BucketName,
  folderPath: string
): Promise<R2Object[]> {
  const params = new URLSearchParams();
  params.set("bucket", bucket);
  params.set("prefix", folderPath);
  params.set("maxKeys", "1000"); // Get all folders at once

  const response = await fetch(`/api/r2/list?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch folders: ${response.status}`);
  }

  const data = await response.json();
  return data.folders || [];
}

/**
 * Build folder tree structure from flat folder list
 */
function buildFolderTree(
  folders: R2Object[],
  currentPath: string = ""
): FolderNode[] {
  // Filter folders that are direct children of currentPath
  const directChildren = folders.filter((folder) => {
    const folderPath = folder.key;

    if (!currentPath) {
      // Root level: folders should have exactly one part
      const parts = folderPath.split("/").filter(Boolean);
      return parts.length === 1;
    }

    // Check if folder is a direct child
    if (!folderPath.startsWith(currentPath)) {
      return false;
    }

    const relativePath = folderPath.slice(currentPath.length);
    const parts = relativePath.split("/").filter(Boolean);
    return parts.length === 1;
  });

  return directChildren.map((folder) => {
    const parts = folder.key.split("/").filter(Boolean);
    const name = parts[parts.length - 1] || folder.name;

    return {
      key: folder.key,
      name,
      path: folder.key,
      children: [],
      isExpanded: false,
      hasLoaded: false,
    };
  });
}

/**
 * Recursive folder tree item component
 * Memoized to prevent unnecessary re-renders
 */
const FolderTreeItem = memo(function FolderTreeItem({
  node,
  bucket,
  currentFolder,
  level = 0,
  onFolderClick,
  onToggleExpand,
}: {
  node: FolderNode;
  bucket: R2BucketName;
  currentFolder: string;
  level: number;
  onFolderClick: (path: string) => void;
  onToggleExpand: (path: string) => void;
}) {
  const isActive = currentFolder === node.path;
  const hasChildren = (node.children?.length ?? 0) > 0;
  const canExpand = !node.hasLoaded || hasChildren;

  const handleClick = (e: React.MouseEvent) => {
    // Clicking folder name navigates to it and expands if it has children
    e.stopPropagation();
    
    // If folder has children and is not expanded, expand it first
    if (canExpand && !node.isExpanded) {
      onToggleExpand(node.path);
    }
    
    // Navigate to folder to show its images
    onFolderClick(node.path);
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    // Clicking chevron expands/collapses without navigation
    e.stopPropagation();
    e.preventDefault();
    if (canExpand) {
      onToggleExpand(node.path);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors",
          "hover:bg-muted/50",
          isActive && "bg-primary/10 text-primary font-medium",
          !isActive && "text-foreground/80"
        )}
        style={{ paddingLeft: `${0.5 + level * 1.25}rem` }}
      >
        {/* Expand/Collapse Icon */}
        <button
          onClick={handleExpandToggle}
          className={cn(
            "flex items-center justify-center w-4 h-4 rounded transition-transform cursor-pointer",
            "hover:bg-muted/70",
            !canExpand && "invisible"
          )}
          aria-label={node.isExpanded ? "Collapse folder" : "Expand folder"}
          type="button"
        >
          {node.isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          ) : (
            <ChevronRight
              className={cn(
                "h-3 w-3 text-muted-foreground transition-transform",
                node.isExpanded && "rotate-90"
              )}
            />
          )}
        </button>

        {/* Folder Icon */}
        <Folder
          className={cn(
            "h-4 w-4 shrink-0",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        />

        {/* Folder Name - Clickable to navigate */}
        <button
          onClick={handleClick}
          className="truncate text-sm flex-1 text-left cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded px-1 -mx-1"
          type="button"
        >
          {node.name}
        </button>
      </div>

      {/* Children */}
      <AnimatePresence>
        {node.isExpanded && node.children && node.children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children.map((child) => (
              <FolderTreeItem
                key={child.key}
                node={child}
                bucket={bucket}
                currentFolder={currentFolder}
                level={level + 1}
                onFolderClick={onFolderClick}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  // Only re-render if:
  // 1. Node structure changed (path, expanded, loading, children)
  // 2. This node's active state changed (was active, now not, or vice versa)
  const wasActive = prevProps.currentFolder === prevProps.node.path;
  const isActive = nextProps.currentFolder === nextProps.node.path;
  const activeStateChanged = wasActive !== isActive;
  
  const structureChanged = (
    prevProps.node.path !== nextProps.node.path ||
    prevProps.node.isExpanded !== nextProps.node.isExpanded ||
    prevProps.node.isLoading !== nextProps.node.isLoading ||
    prevProps.node.hasLoaded !== nextProps.node.hasLoaded ||
    prevProps.bucket !== nextProps.bucket ||
    (prevProps.node.children?.length ?? 0) !== (nextProps.node.children?.length ?? 0)
  );
  
  // Only re-render if structure changed OR this specific node's active state changed
  // This prevents all nodes from re-rendering when currentFolder changes
  return !structureChanged && !activeStateChanged;
});

export const R2FolderTree = memo(function R2FolderTree({
  bucket,
  currentFolder,
  rootFolders,
  onFolderClick,
}: R2FolderTreeProps) {
  const [tree, setTree] = useState<FolderNode[]>([]);
  const treeRef = useRef<FolderNode[]>([]);
  const inFlightRef = useRef<Set<string>>(new Set());
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  // Keep treeRef in sync with tree state
  useEffect(() => {
    treeRef.current = tree;
  }, [tree]);

  // Fetch root-level folders on mount and when bucket changes
  useEffect(() => {
    let isMounted = true;

    const loadRootFolders = async () => {
      try {
        inFlightRef.current.clear();
        const rootFoldersData = await fetchSubfolders(bucket, "");
        if (isMounted) {
          const rootNodes = buildFolderTree(rootFoldersData, "");
          setTree(rootNodes);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Failed to load root folders:", error);
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    setIsInitialized(false);
    loadRootFolders();

    return () => {
      isMounted = false;
    };
  }, [bucket]);

  // Auto-expand path to current folder - only update expandedPaths, don't rebuild tree
  useEffect(() => {
    if (!isInitialized) return;

    if (!currentFolder) {
      setExpandedPaths(new Set());
      return;
    }

    const pathParts = currentFolder.split("/").filter(Boolean);
    const pathsToExpand = new Set<string>();

    // Build all parent paths
    for (let i = 0; i < pathParts.length; i++) {
      const path = pathParts.slice(0, i + 1).join("/") + "/";
      pathsToExpand.add(path);
    }

    // Only update expanded paths, don't trigger tree rebuild
    setExpandedPaths((prev) => {
      // Check if paths are already expanded to avoid unnecessary updates
      const hasChanges = 
        pathsToExpand.size !== prev.size ||
        Array.from(pathsToExpand).some(path => !prev.has(path)) ||
        Array.from(prev).some(path => !pathsToExpand.has(path));
      
      if (!hasChanges) return prev;
      return pathsToExpand;
    });

    // Best-effort: pre-load parent folders for the selected path.
    // Guarded to avoid duplicate requests / stuck spinners.
    const loadParentFolders = async () => {
      const updateNodeInTree = (
        p: string,
        updater: (n: FolderNode) => FolderNode,
        nodes: FolderNode[]
      ): FolderNode[] => {
        return nodes.map((n) => {
          if (n.path === p) return updater(n);
          if (n.children) {
            return { ...n, children: updateNodeInTree(p, updater, n.children) };
          }
          return n;
        });
      };

      const findNodeInTree = (p: string, nodes: FolderNode[]): FolderNode | null => {
        for (const node of nodes) {
          if (node.path === p) return node;
          if (node.children) {
            const found = findNodeInTree(p, node.children);
            if (found) return found;
          }
        }
        return null;
      };

      for (let i = 0; i < pathParts.length; i++) {
        const path = pathParts.slice(0, i + 1).join("/") + "/";
        if (inFlightRef.current.has(path)) continue;

        const node = findNodeInTree(path, treeRef.current);
        if (!node || node.hasLoaded || node.isLoading) continue;

        inFlightRef.current.add(path);
        setTree((prev) =>
          updateNodeInTree(path, (n) => ({ ...n, isLoading: true }), prev)
        );

        try {
          const subfolders = await fetchSubfolders(bucket, path);
          const children = buildFolderTree(subfolders, path);
          setTree((prev) =>
            updateNodeInTree(
              path,
              (n) => ({
                ...n,
                children,
                isLoading: false,
                hasLoaded: true,
              }),
              prev
            )
          );
        } catch (error) {
          console.error("Failed to load parent folders:", error);
          setTree((prev) =>
            updateNodeInTree(path, (n) => ({ ...n, isLoading: false }), prev)
          );
        } finally {
          inFlightRef.current.delete(path);
        }
      }
    };

    loadParentFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolder, isInitialized, bucket]);

  /**
   * Find a node in the tree by path
   */
  const findNode = useCallback(
    (path: string, nodes: FolderNode[]): FolderNode | null => {
      for (const node of nodes) {
        if (node.path === path) {
          return node;
        }
        if (node.children) {
          const found = findNode(path, node.children);
          if (found) return found;
        }
      }
      return null;
    },
    []
  );

  /**
   * Update a node in the tree
   */
  const updateNode = useCallback(
    (
      path: string,
      updater: (node: FolderNode) => FolderNode,
      nodes: FolderNode[]
    ): FolderNode[] => {
      return nodes.map((node) => {
        if (node.path === path) {
          return updater(node);
        }
        if (node.children) {
          return {
            ...node,
            children: updateNode(path, updater, node.children),
          };
        }
        return node;
      });
    },
    []
  );

  /**
   * Handle folder expand/collapse
   */
  const handleToggleExpand = useCallback(
    async (folderPath: string) => {
      if (inFlightRef.current.has(folderPath)) return;
      const node = findNode(folderPath, tree);
      if (!node) return;

      const isExpanding = !node.isExpanded;

      // Update expanded state
      setExpandedPaths((prev) => {
        const next = new Set(prev);
        if (isExpanding) {
          next.add(folderPath);
        } else {
          next.delete(folderPath);
        }
        return next;
      });

      // If expanding and not loaded, fetch subfolders
      if (isExpanding && !node.hasLoaded) {
        inFlightRef.current.add(folderPath);
        // Mark as loading
        setTree((prev) =>
          updateNode(
            folderPath,
            (n) => ({ ...n, isLoading: true }),
            prev
          )
        );

        try {
          const subfolders = await fetchSubfolders(bucket, folderPath);
          const children = buildFolderTree(subfolders, folderPath);

          // Update tree with children
          setTree((prev) =>
            updateNode(
              folderPath,
              (n) => ({
                ...n,
                children,
                isLoading: false,
                hasLoaded: true,
                isExpanded: expandedPaths.has(folderPath),
              }),
              prev
            )
          );
        } catch (error) {
          console.error("Failed to load subfolders:", error);
          setTree((prev) =>
            updateNode(
              folderPath,
              (n) => ({ ...n, isLoading: false }),
              prev
            )
          );
        } finally {
          inFlightRef.current.delete(folderPath);
        }
      } else {
        // Just toggle expanded state - will be synced by useEffect below
      }
    },
    [bucket, tree, findNode, updateNode, expandedPaths]
  );

  // Sync expanded state with expandedPaths - use functional update to avoid unnecessary re-renders
  useEffect(() => {
    setTree((prev) => {
      let hasChanges = false;
      
      const updateExpanded = (nodes: FolderNode[]): FolderNode[] => {
        return nodes.map((node) => {
          const shouldBeExpanded = expandedPaths.has(node.path);
          const hasChanged = node.isExpanded !== shouldBeExpanded;
          
          if (hasChanged) {
            hasChanges = true;
          }
          
          return {
            ...node,
            isExpanded: shouldBeExpanded,
            children: node.children ? updateExpanded(node.children) : undefined,
          };
        });
      };
      
      const updated = updateExpanded(prev);
      
      // Only update if there are actual changes
      return hasChanges ? updated : prev;
    });
  }, [expandedPaths]);

  if (!isInitialized) {
    return (
      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
        <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
        Loading folders...
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
        No folders
      </div>
    );
  }

  return (
    <div className="py-1" role="tree" aria-label="Folder tree">
      {tree.map((node) => (
        <FolderTreeItem
          key={node.key}
          node={node}
          bucket={bucket}
          currentFolder={currentFolder}
          level={0}
          onFolderClick={onFolderClick}
          onToggleExpand={handleToggleExpand}
        />
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // Allow re-render when currentFolder changes so items can update their active state
  // But prevent re-render if only unrelated props change
  // The individual FolderTreeItem memo will handle preventing unnecessary item re-renders
  return (
    prevProps.bucket === nextProps.bucket &&
    prevProps.onFolderClick === nextProps.onFolderClick &&
    prevProps.rootFolders === nextProps.rootFolders &&
    prevProps.currentFolder === nextProps.currentFolder
  );
});
