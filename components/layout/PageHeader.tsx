import { motion } from "framer-motion";

interface PageHeaderProps {
    title: string;
    description: string;
    badge?: string;
}

export function PageHeader({ title, description, badge }: PageHeaderProps) {
    return (
        <div className="relative pt-32 pb-12 overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-background/50"></div>
            <div className="container px-4 md:px-6 mx-auto text-center">
                {badge && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4"
                    >
                        {badge}
                    </motion.div>
                )}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl md:text-5xl font-bold font-mono tracking-tight mb-4"
                >
                    {title}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-muted-foreground text-lg max-w-2xl mx-auto"
                >
                    {description}
                </motion.p>
            </div>
        </div>
    );
}
