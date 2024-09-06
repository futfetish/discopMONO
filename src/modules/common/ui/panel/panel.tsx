import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  HTMLAttributes,
  RefObject,
} from "react";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  buttonRef: RefObject<HTMLElement>;
}

export const Panel: React.FC<PanelProps> = ({
  isOpen,
  setIsOpen,
  children,
  buttonRef,
  ...divProps
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // const togglePanel = () => {
  //   setIsOpen(!isOpen);
  // };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsOpen]);

  return (
    <div style={{ position: "absolute" , zIndex : '100' }}>
      {isOpen && (
        <div ref={panelRef} {...divProps}>
          {children}
        </div>
      )}
    </div>
  );
};
