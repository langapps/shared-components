import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { Copy, Undo2, Languages } from 'lucide-react';

export interface TextAreaWithControlsProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    onTranslate: () => void;
    isLoading: boolean;
    loadingText?: string;
    copyTitle?: string;
    revertTitle?: string;
    translateTitle?: string;
    previousValue: string | null;
    onRevert: () => void;
}

/**
 * TextAreaWithControls Component
 * 
 * A specialized textarea component designed for grammar correction applications.
 * It provides a rich user interface with additional control buttons for copy, revert, and translate functionalities.
 * 
 * User Perspective:
 * - Users can input their text for grammar correction in this component.
 * - The textarea automatically resizes based on content, providing a seamless writing experience.
 * - Users can copy their text, revert changes, and initiate translation directly from this component.
 * - The component visually indicates when it's processing a request (correcting, improving, or translating).
 * - It respects character limits based on the user's subscription status.
 * 
 * Usage:
 * - The parent component should manage the text state and pass it via the `value` prop.
 * - The parent component is responsible for handling text processing operations (correction, improvement, translation).
 * - When a text operation is in progress, set `isLoading` to true and provide appropriate `loadingText` (e.g., "Correcting...", "Improving...", "Translating...").
 * - Implement and pass the `onTranslate` function to handle translation requests.
 * - Manage the `previousValue` state in the parent component to enable the revert functionality.
 * - Implement and pass the `onRevert` function to handle reverting to the previous text state.
 * 
 * Example:
 * <TextAreaWithControls
 *   value={text}
 *   onChange={handleTextChange}
 *   onTranslate={handleTranslate}
 *   isLoading={isProcessing}
 *   loadingText={isTranslating ? "Translating..." : "Correcting..."}
 *   previousValue={previousText}
 *   onRevert={handleRevert}
 * />
 * 
 * @component
 * @param {Object} props - The component props
 * @param {() => void} props.onTranslate - Function to be called when the translate button is clicked
 * @param {boolean} props.isLoading - Indicates if the component is in a loading state (e.g., during correction or translation)
 * @param {string} [props.loadingText] - Text to display when the component is loading (e.g., "Correcting...", "Translating...")
 * @param {string} [props.copyTitle="Copy"] - Title for the copy button
 * @param {string} [props.revertTitle="Revert"] - Title for the revert button
 * @param {string} [props.translateTitle="Translate"] - Title for the translate button
 * @param {string | null} props.previousValue - The previous value of the textarea, used for reverting
 * @param {() => void} props.onRevert - Function to be called when the revert button is clicked
 * @param {React.TextareaHTMLAttributes<HTMLTextAreaElement>} props - All other props are passed to the underlying textarea element
 * 
 * @returns {React.ReactElement} The rendered TextAreaWithControls component
 */
export const TextAreaWithControls = forwardRef<HTMLTextAreaElement, TextAreaWithControlsProps>(
  ({ 
    onTranslate, 
    isLoading, 
    loadingText,
    copyTitle = "Copy",
    revertTitle = "Revert",
    translateTitle = "Translate",
    previousValue,
    onRevert,
    onChange,
    ...props 
  }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    useImperativeHandle(ref, () => textareaRef.current!);

    /**
     * Auto-resize effect
     * 
     * Automatically adjusts the height of the textarea based on its content.
     * This provides a smooth user experience, allowing the textarea to grow as the user types,
     * eliminating the need for scrolling within the textarea itself.
     */
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';

        const padding = 32;
        textarea.style.height = `${textarea.scrollHeight + padding}px`;
      }
    }, [props.value]);

    /**
     * handleCopy
     * 
     * Copies the current textarea value to the clipboard and shows a success indicator.
     * This allows users to quickly copy their text, whether it's the original input or the corrected version.
     * The success indicator (green checkmark) provides visual feedback to the user that the copy action was successful.
     */
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(props.value as string);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 500);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    };

    return (
      <div className="relative">
        <textarea
          ref={textareaRef}
          {...props}
          onChange={onChange}
          className={`w-full mb-4 p-3 rounded-md border border-input bg-input text-foreground font-body ${props.className || ''}`}
        />
        {isLoading && loadingText && (
          <div className="absolute inset-0 bg-primary/80 flex items-center justify-center rounded-md" style={{ height: 'calc(100% - 1rem)' }}>
            <p className="text-white font-semibold text-lg">{loadingText}</p>
          </div>
        )}
        <div className="absolute bottom-7 left-2 space-x-2">
          <button
            className="p-1 rounded-md font-body text-sm disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            onClick={handleCopy}
            title={copyTitle}
            disabled={!props.value}
          >
            {copySuccess ? <Copy className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            className="p-1 rounded-md font-body text-sm disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            onClick={onRevert}
            title={revertTitle}
            disabled={props.disabled || previousValue === props.value || previousValue === null}
          >
            <Undo2 className="w-4 h-4" />
          </button>
        </div>
        <div className="absolute bottom-7 right-2">
          <button
            className="p-1 rounded-md font-body text-sm disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            onClick={onTranslate}
            title={translateTitle}
            disabled={props.disabled || props.value === ''}
          >
            <span className="hidden md:flex items-center">
              <Languages className="w-4 h-4 mr-1" />
              {translateTitle}
            </span>
            <span className="md:hidden">
              <Languages className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    );
  }
);

TextAreaWithControls.displayName = 'TextAreaWithControls';

export default TextAreaWithControls;