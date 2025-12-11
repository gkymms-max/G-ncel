import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mb-6 p-6 bg-gray-100 rounded-full"
      >
        <Icon className="h-16 w-16 text-gray-400" />
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-semibold text-gray-900 mb-2"
      >
        {title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-gray-600 text-center mb-6 max-w-md"
      >
        {description}
      </motion.p>
      
      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button onClick={onAction} size="lg">
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
