import React from "react";

interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "stroke"> {
  size?: number | string;
  stroke?: number | string;
}

function createIcon(name: string, paths: React.ReactNode) {
  const Icon = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, stroke = 2, className, ...props }, ref) => (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        {paths}
      </svg>
    ),
  );
  Icon.displayName = name;
  return Icon;
}

export const IconCheck = createIcon("IconCheck", (
  <path d="M5 12l5 5l10 -10" />
));

export const IconChevronDown = createIcon("IconChevronDown", (
  <path d="M6 9l6 6l6 -6" />
));

export const IconChevronRight = createIcon("IconChevronRight", (
  <path d="M9 6l6 6l-6 6" />
));

export const IconCopy = createIcon("IconCopy", (
  <>
    <path d="M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666" />
    <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
  </>
));

export const IconDeviceMobile = createIcon("IconDeviceMobile", (
  <>
    <path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14" />
    <path d="M11 4h2" />
    <path d="M12 17v.01" />
  </>
));

export const IconDots = createIcon("IconDots", (
  <>
    <path d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M18 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
  </>
));

export const IconFolder = createIcon("IconFolder", (
  <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
));

export const IconMenu2 = createIcon("IconMenu2", (
  <>
    <path d="M4 6l16 0" />
    <path d="M4 12l16 0" />
    <path d="M4 18l16 0" />
  </>
));

export const IconMicrophone = createIcon("IconMicrophone", (
  <>
    <path d="M9 5a3 3 0 0 1 3 -3a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3a3 3 0 0 1 -3 -3l0 -5" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M8 21l8 0" />
    <path d="M12 17l0 4" />
  </>
));

export const IconMicrophoneOff = createIcon("IconMicrophoneOff", (
  <>
    <path d="M3 3l18 18" />
    <path d="M9 5a3 3 0 0 1 6 0v5a3 3 0 0 1 -.13 .874m-2 2a3 3 0 0 1 -3.87 -2.872v-1" />
    <path d="M5 10a7 7 0 0 0 10.846 5.85m2 -2a6.967 6.967 0 0 0 1.152 -3.85" />
    <path d="M8 21l8 0" />
    <path d="M12 17l0 4" />
  </>
));

export const IconMoon = createIcon("IconMoon", (
  <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008" />
));

export const IconPlayerRecord = createIcon("IconPlayerRecord", (
  <path d="M5 12a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
));

export const IconSun = createIcon("IconSun", (
  <>
    <path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
    <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />
  </>
));

export const IconX = createIcon("IconX", (
  <>
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </>
));
