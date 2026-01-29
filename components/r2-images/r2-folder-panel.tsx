/**
 * R2 Folder Panel Component
 *
 * Displays folder tree in a separate middle panel.
 * Shows folders for the active bucket with recursive lazy-loading.
 */

"use client";

import { memo } from "react";
import { R2FolderTree } from "./r2-folder-tree";
import type { R2BucketName } from "@/types/r2";

interface R2FolderPanelProps {
  bucket: R2BucketName;
  currentFolder: string;
  onFolderClick: (folderPath: string) => void;
}

export const R2FolderPanel = memo(function R2FolderPanel({
  bucket,
  currentFolder,
  onFolderClick,
}: R2FolderPanelProps) {
  return (
    <aside className="w-64 border-r bg-background/50 backdrop-blur-sm shrink-0">
      <div className="sticky top-0 p-4 h-screen overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Folders
          </h2>
          {bucket && (
            <p className="text-xs text-muted-foreground mt-1 truncate" title={bucket}>
              {bucket}
            </p>
          )}
        </div>

        <R2FolderTree
          bucket={bucket}
          currentFolder={currentFolder}
          onFolderClick={onFolderClick}
        />
      </div>
    </aside>
  );
}, (prevProps, nextProps) => {
  // Re-render when bucket or selected folder changes.
  return (
    prevProps.bucket === nextProps.bucket &&
    prevProps.currentFolder === nextProps.currentFolder &&
    prevProps.onFolderClick === nextProps.onFolderClick
  );
});
