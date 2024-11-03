import { motion } from "framer-motion";

type AnimationWrapperProps = {
  key: string;
  children: React.ReactNode;
};

export const AnimationWrapper = ({ key, children }: AnimationWrapperProps) => {
  return (
    <motion.div
      key={key}
      transition={{ duration: 0.15 }}
      initial={{ opacity: 0, translateX: 30 }}
      animate={{ opacity: 1, translateX: 0 }}
      exit={{ opacity: 0, translateX: 30 }}
    >
      {children}
    </motion.div>
  );
};
