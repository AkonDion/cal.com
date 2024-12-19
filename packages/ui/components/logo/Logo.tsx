import classNames from "@calcom/lib/classNames";

export default function Logo({
  small,
  icon,
  inline = true,
  className,
}: {
  small?: boolean;
  icon?: boolean;
  inline?: boolean;
  className?: string;
}) {
  const darkModeLogo = icon ? "/ch-icon-white.svg" : "/comforthub-logo-white.svg";
  const lightModeLogo = icon ? "/ch-icon-black.svg" : "/comforthub-logo-black.svg";

  return (
    <h3 className={classNames("logo", inline && "inline", className)}>
      <strong>
        <img
          className={classNames(small ? "h-4 w-auto" : "h-5 w-auto", "dark:hidden")}
          alt="ComfortHub"
          title="ComfortHub"
          src={lightModeLogo}
        />
        <img
          className={classNames(small ? "h-4 w-auto" : "h-5 w-auto", "hidden dark:block")}
          alt="ComfortHub"
          title="ComfortHub"
          src={darkModeLogo}
        />
      </strong>
    </h3>
  );
}
