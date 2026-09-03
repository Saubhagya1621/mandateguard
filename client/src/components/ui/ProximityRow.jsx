import { motion } from "framer-motion";

function ProximityRow({ children, onClick, isHovered, distance }) {
  const targetOpacity = isHovered ? 0.5 : Math.max(0, 0.5 - distance * 0.15);

  return (
    <motion.div
      onClick={onClick}
      animate={{
        backgroundColor: `rgba(216, 211, 199, ${targetOpacity})`,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr_1fr] gap-4 px-5 py-4 items-center cursor-pointer"
    >
      {children}
    </motion.div>
  );
}

export default ProximityRow;