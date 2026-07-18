import trivialIcon from "@renderer/assets/icons/trivial.png";

type MainLogoProps = {
  className?: string;
};

export default function MainLogo({ className }: MainLogoProps) {
  const defaultClassName =
    " select-none transition-filter duration-300 drop-shadow-[0_0_0.8em_#f0b02e66] hover:drop-shadow-[0_0_1.2em_#f0b02eaa]  ";
  const finalClassName = defaultClassName + className;

  return (
    <img
      alt="logo"
      className={finalClassName + " bg-white/10"}
      src={trivialIcon}
      onDragStart={(e) => e.preventDefault()}
    />
  );
}
