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
  opacityAnimation?: {
    duration: number;
  };
  scaleAnimation?: {
    duration: number;
    startScale: number;
  };
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
  opacityAnimation = { duration: 1 },
  scaleAnimation = { duration: 0, startScale: 100 },
  parentRef,
  offsetPx = {},
  offsetPercentage = {},
  useLeft = true,
  useTop = true,
  xCenter = false,
  yCenter = false,
  ...divProps
}) => {
  opacityAnimation.duration = Math.max(opacityAnimation.duration, 1);
  scaleAnimation.duration = Math.max(scaleAnimation.duration, 0);
  scaleAnimation.startScale = Math.max(scaleAnimation.startScale, 0);
  const WINDOWS_PADDING = 8; //px
  const panelRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
  const [wrapperDimensions, setWrapperDimensions] = useState({
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
    if (parentRef?.current) {
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
  }, [isOpen, parentRef]);

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
  }, [setIsOpen, buttonRef]);

  useEffect(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setWrapperDimensions({
        width: rect.width,
        height: rect.height,
      });
    }
  }, [wrapperRef]);

  useEffect(() => {
    if (panelRef.current) {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      if (isOpen == true) {
        setShow(true);

        panelRef.current.style.opacity = "1";
        panelRef.current.style.transform = `scale(1)`;
      } else {
        panelRef.current.style.opacity = "0";
        panelRef.current.style.transform = `scale(${
          scaleAnimation.startScale / 100
        })`;
        setShow(false);
      }
    }
  }, [isOpen, opacityAnimation.duration , scaleAnimation.startScale]);

  console.log(window.innerWidth);

  console.log(
    position.right + rightPx + parentDimensions.width * (rightPercentage / 100),
    WINDOWS_PADDING,

    window.innerWidth - wrapperDimensions.width - WINDOWS_PADDING,
  );

  return ReactDOM.createPortal(
    <div
      ref={wrapperRef}
      {...divProps}
      style={{
        position: "absolute",
        top: useTop
          ? `calc(${Math.min(
              Math.max(
                yCenter
                  ? parentDimensions.height / 2 +
                      position.top -
                      wrapperDimensions.height / 2
                  : position.top +
                      topPx +
                      parentDimensions.height * (topPercentage / 100),
                WINDOWS_PADDING,
              ),
              window.innerHeight - wrapperDimensions.height - WINDOWS_PADDING,
            )}px)`
          : "auto",
        left: useLeft
          ? `calc(${Math.min(
              Math.max(
                xCenter
                  ? parentDimensions.width / 2 +
                      position.left -
                      wrapperDimensions.width / 2
                  : position.left +
                      leftPx +
                      parentDimensions.width * (leftPercentage / 100),
                WINDOWS_PADDING,
              ),
              window.innerWidth - wrapperDimensions.width - WINDOWS_PADDING,
            )}px)`
          : "auto",
        bottom: !useTop
          ? `calc(${Math.min(
              Math.max(
                yCenter
                  ? parentDimensions.height / 2 +
                      position.bottom -
                      wrapperDimensions.height / 2
                  : position.bottom +
                      bottomPx +
                      parentDimensions.height * (bottomPercentage / 100),
                WINDOWS_PADDING,
              ),
              window.innerHeight - wrapperDimensions.height - WINDOWS_PADDING,
            )}px)`
          : "auto",
        right: !useLeft
          ? `calc(${Math.min(
              Math.max(
                xCenter
                  ? parentDimensions.height / 2 +
                      position.right -
                      wrapperDimensions.height / 2
                  : position.right +
                      rightPx +
                      parentDimensions.width * (rightPercentage / 100),
                WINDOWS_PADDING,
              ),
              window.innerWidth - wrapperDimensions.width - WINDOWS_PADDING,
            )}px)`
          : "auto",
        zIndex: "100",
        visibility: show ? "visible" : "hidden",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      <div
        style={{
          transition: `opacity ${opacityAnimation.duration}ms ease-in, 
           transform ${scaleAnimation.duration}ms ease-in`,
          opacity: 0,
          transform: `scale(${scaleAnimation.startScale / 100})`,
        }}
        ref={panelRef}
      >
        <div
        // style={
        //   show
        //     ? {}
        //     : {
        //         visibility: "hidden",
        //         pointerEvents: "none",
        //       }
        // }
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};
