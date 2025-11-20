/**
 * Keyboard Shortcuts Help Dialog Component
 *
 * Displays all available keyboard shortcuts in a help dialog
 */

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useKeyboardShortcutsContext } from "./keyboard-shortcuts-provider";
import { formatShortcut } from "@/lib/constants/keyboard-shortcuts";

/**
 * Keyboard Shortcuts Dialog Component
 */
export function KeyboardShortcutsDialog() {
  const { isHelpDialogOpen, closeHelpDialog, getAllShortcuts } =
    useKeyboardShortcutsContext();
  const shortcuts = getAllShortcuts();

  return (
    <Dialog open={isHelpDialogOpen} onOpenChange={closeHelpDialog}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and interact with the
            application more efficiently.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-card"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {shortcut.description}
                </p>
                {shortcut.condition && (
                  <p className="text-xs text-muted-foreground mt-1">
                    (Only active when condition is met)
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded-md">
                  {formatShortcut(shortcut)}
                </kbd>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Tip: Press{" "}
            <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border border-border rounded">
              Esc
            </kbd>{" "}
            to close this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
