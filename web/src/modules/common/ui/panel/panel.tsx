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

import ReactDOM from "react-dom";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  buttonRef?: RefObject<HTMLElement>;
  animationDuration?: number;
  parentRef?: RefObject<HTMLElement>;
  offsetPx?: {
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
  };
  offsetPercentage?: {
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
  };
  useLeft?: boolean;
  useTop?: boolean;
  xCenter?: boolean;
  yCenter?: boolean;
}

export const Panel: React.FC<PanelProps> = ({
  isOpen,
  setIsOpen,
  children,
  buttonRef,
  animationDuration = 1,
  parentRef,
  offsetPx = {},
  offsetPercentage = {},
  useLeft = true,
  useTop = true,
  xCenter = false,
  yCenter = false,
  ...divProps
}) => {
  animationDuration = Math.max(animationDuration, 1);
  const WINDOWS_PADDING = 8; //px
  const panelRef = useRef<HTMLDivElement>(null);

  const closeTimer: MutableRefObject<NodeJS.Timeout | null> =
    useRef<NodeJS.Timeout>(null);

  const [show, setShow] = useState(false);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  });
  const [parentDimensions, setParentDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [panelDimensions, setPanelDimensions] = useState({
    width: 0,
    height: 0,
  });

  const topPx = offsetPx.top ?? 0;
  const leftPx = offsetPx.left ?? 0;
  const bottomPx = offsetPx.bottom ?? 0;
  const rightPx = offsetPx.right ?? 0;

  const topPercentage = offsetPercentage.top ?? 0;
  const leftPercentage = offsetPercentage.left ?? 0;
  const bottomPercentage = offsetPercentage.bottom ?? 0;
  const rightPercentage = offsetPercentage.right ?? 0;

  // const togglePanel = () => {
  //   setIsOpen(!isOpen);
  // };

  useEffect(() => {
    if (  parentRef?.current) {
      const rect = parentRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.left,
        bottom: window.innerHeight - rect.bottom,
        right: window.innerWidth - rect.right,
      });

      setParentDimensions({
        width: rect.width,
        height: rect.height,
      });
    }
  }, [isOpen , parentRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsOpen , buttonRef]);

  useEffect(() => {
    const handleResize = () => {
      if (panelRef.current) {
        const rect = panelRef.current.getBoundingClientRect();
        setPanelDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (panelRef.current) {
      resizeObserver.observe(panelRef.current);
    }

    // Cleanup on unmount
    return () => {
      if (panelRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        resizeObserver.unobserve(panelRef.current);
      }
    };
  }, []);

  console.log(position, panelDimensions);

  useEffect(() => {
    if (panelRef.current) {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      if (isOpen == true) {
        setShow(true);

        panelRef.current.style.opacity = "1";
      } else {
        panelRef.current.style.opacity = "0";
        if (animationDuration) {
          closeTimer.current = setTimeout(() => {
            setShow(false);
          }, animationDuration);
        } else {
          setShow(false);
        }
      }
    }
  }, [isOpen, animationDuration]);

  console.log(window.innerWidth);

  console.log(
    position.right + rightPx + parentDimensions.width * (rightPercentage / 100),
    WINDOWS_PADDING,

    window.innerWidth - panelDimensions.width - WINDOWS_PADDING,
  );

  return ReactDOM.createPortal(
    <div
      {...divProps}
      style={{
        position: "absolute",
        top: useTop
          ? `calc(${Math.min(
              Math.max(
                yCenter
                  ? parentDimensions.height / 2 + position.top - panelDimensions.height / 2
                  : position.top +
                      topPx +
                      parentDimensions.height * (topPercentage / 100),
                WINDOWS_PADDING,
              ),
              window.innerHeight - panelDimensions.height - WINDOWS_PADDING,
            )}px)`
          : "auto",
        left: useLeft
          ? `calc(${Math.min(
              Math.max(
                xCenter
                  ? parentDimensions.width / 2 + position.left - panelDimensions.width / 2
                  : position.left +
                      leftPx +
                      parentDimensions.width * (leftPercentage / 100),
                WINDOWS_PADDING,
              ),
              window.innerWidth - panelDimensions.width - WINDOWS_PADDING,
            )}px)`
          : "auto",
        bottom: !useTop
          ? `calc(${Math.min(
              Math.max(
                yCenter
                  ? parentDimensions.height / 2 + position.bottom - panelDimensions.height / 2
                  : position.bottom +
                      bottomPx +
                      parentDimensions.height * (bottomPercentage / 100),
                WINDOWS_PADDING,
              ),
              window.innerHeight - panelDimensions.height - WINDOWS_PADDING,
            )}px)`
          : "auto",
        right: !useLeft
          ? `calc(${Math.min(
              Math.max(
                xCenter
                  ? parentDimensions.height / 2 + position.right - panelDimensions.height / 2
                  : position.right +
                      rightPx +
                      parentDimensions.width * (rightPercentage / 100),
                WINDOWS_PADDING,
              ),
              window.innerWidth - panelDimensions.width - WINDOWS_PADDING,
            )}px)`
          : "auto",
        zIndex: "100",
      }}
    >
      <div
        style={{
          transition: "opacity " + animationDuration + "ms ease-in",
          opacity: 0,
        }}
        ref={panelRef}
      >
        {show && <div>{children}</div>}
      </div>
    </div>,
    document.body,
  );
};
