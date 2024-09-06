import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  HTMLAttributes,
  RefObject,
  useState,
  MutableRefObject,
} from "react";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  buttonRef: RefObject<HTMLElement>;
  animationDuration?: number;
}

export const Panel: React.FC<PanelProps> = ({
  isOpen,
  setIsOpen,
  children,
  buttonRef,
  animationDuration = 0,
  ...divProps
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  const closeTimer: MutableRefObject<NodeJS.Timeout | null> =
    useRef<NodeJS.Timeout>(null);

  const [show, setShow] = useState(false);

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

  useEffect(() => {
    if (panelRef.current) {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null
      }
      if (isOpen == true) {
        setShow(true);

        panelRef.current.style.opacity = "1";
      } else {
        panelRef.current.style.opacity = "0";

        closeTimer.current = setTimeout(() => {
          setShow(false);
        }, animationDuration);
      }
    }
  }, [isOpen, animationDuration]);

  return (
    <div {...divProps} style={{ position: "absolute", zIndex: "100" }}>
      <div
        style={{
          transition: "opacity " + animationDuration + "ms ease-in",
          opacity: 0,
        }}
        ref={panelRef}
      >
        {show && <div>{children}</div>}
      </div>
    </div>
  );
};
