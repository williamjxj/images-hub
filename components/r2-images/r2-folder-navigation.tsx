/**
 * R2 Folder Navigation Component
 *
 * Displays breadcrumb navigation and folder list for navigating through bucket folders.
 */

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Folder } from "lucide-react";
import { R2ImageFilter } from "./r2-image-filter";
import type { R2BucketName, R2Object, ImageGalleryFilter } from "@/types/r2";

interface R2FolderNavigationProps {
  bucket: R2BucketName;
  currentFolder: string;
  folders: R2Object[];
  onFolderClick: (folderPath: string) => void;
  filter?: ImageGalleryFilter;
  onFilterChange?: (filter: ImageGalleryFilter) => void;
  imageCount?: number;
}

export function R2FolderNavigation({
  bucket,
  currentFolder,
  folders,
  onFolderClick,
  filter,
  onFilterChange,
  imageCount,
}: R2FolderNavigationProps) {
  // Build breadcrumb items from current folder path
  const pathParts = currentFolder.split("/").filter(Boolean);
  const breadcrumbs = [
    { name: bucket, path: "" },
    ...pathParts.map((part, index) => ({
      name: part,
      path: pathParts.slice(0, index + 1).join("/") + "/",
    })),
  ];

  // Filter folders to only show immediate subfolders of the current directory
  // R2 API with Delimiter="/" should already return only immediate subfolders,
  // but we add this as a safety check
  const currentLevelFolders = folders.filter((folder) => {
    const folderPath = folder.key;

    // If we're at root, folders should not contain "/" except trailing
    if (!currentFolder) {
      const parts = folderPath.split("/").filter(Boolean);
      return parts.length === 1; // e.g., "images/" -> ["images"]
    }

    // If we're in a folder, check that the folder path starts with current folder
    // and is exactly one level deeper
    if (!folderPath.startsWith(currentFolder)) {
      return false;
    }

    // Get the part after current folder
    const relativePath = folderPath.slice(currentFolder.length);
    const parts = relativePath.split("/").filter(Boolean);

    // Should be exactly one folder name (e.g., "images/2024/" -> ["2024"])
    return parts.length === 1;
  });

  const handleBreadcrumbClick = (path: string) => {
    onFolderClick(path);
  };

  return (
    <div className="space-y-4" role="navigation" aria-label="Folder navigation">
      {/* Breadcrumb Navigation with Filter */}
      <div className="flex items-center justify-between gap-4">
        <AnimatePresence mode="wait">
          {currentFolder ? (
            <motion.div
              key={currentFolder}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <Breadcrumb aria-label="Breadcrumb navigation">
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.path}>
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage aria-current="page">
                            {crumb.name}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            onClick={() => handleBreadcrumbClick(crumb.path)}
                            className="cursor-pointer"
                            aria-label={`Navigate to ${crumb.name}`}
                          >
                            {crumb.name}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </motion.div>
          ) : (
            <div className="flex-1" /> // Spacer when no breadcrumb
          )}
        </AnimatePresence>

        {/* Filter Component - Right side */}
        {filter && onFilterChange && (
          <div className="flex-shrink-0">
            <R2ImageFilter
              filter={filter}
              onFilterChange={onFilterChange}
              imageCount={imageCount}
            />
          </div>
        )}
      </div>

      {/* Folder List */}
      <AnimatePresence>
        {currentLevelFolders.length > 0 && (
          <motion.div
            key={`folders-${currentFolder}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            <p className="text-sm font-medium text-muted-foreground">
              {currentFolder ? "Subfolders" : "Folders"}
            </p>
            <div
              className="flex flex-wrap gap-2"
              role="list"
              aria-label="Folder list"
            >
              {currentLevelFolders.map((folder, index) => (
                <motion.div
                  key={folder.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  role="listitem"
                >
                  <Button
                    variant="outline"
                    onClick={() => onFolderClick(folder.key)}
                    className="flex items-center gap-2"
                    aria-label={`Open folder ${folder.name}`}
                  >
                    <Folder className="h-4 w-4" aria-hidden="true" />
                    {folder.name}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
