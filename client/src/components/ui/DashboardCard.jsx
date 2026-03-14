import { motion } from "framer-motion";

export default function DashboardCard({ className = "", children }) {
  return (
    <motion.article
      className={`dashboard-card ${className}`.trim()}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.article>
  );
}
