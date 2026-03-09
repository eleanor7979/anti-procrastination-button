import { motion } from "framer-motion";

interface BigRedButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const BigRedButton = ({ onClick, disabled }: BigRedButtonProps) => {
  return (
    <div className="flex flex-col items-center gap-8">
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className="relative w-56 h-56 rounded-full bg-primary text-primary-foreground font-bold text-xl uppercase tracking-wider animate-pulse-glow disabled:opacity-40 disabled:animate-none cursor-pointer select-none"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <span className="absolute inset-3 rounded-full border-2 border-primary-foreground/20 flex items-center justify-center">
          <span className="text-center leading-tight px-4">
            STOP<br />PROCRASTINATING
          </span>
        </span>
      </motion.button>
      <p className="text-muted-foreground text-sm">
        {disabled ? "Add some projects first!" : "Press to get started on something"}
      </p>
    </div>
  );
};

export default BigRedButton;
