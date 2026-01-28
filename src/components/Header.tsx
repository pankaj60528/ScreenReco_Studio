import { motion } from 'framer-motion';
import { Video, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Video className="w-5 h-5 text-primary-foreground" />
              </div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-4 h-4 text-accent" />
              </motion.div>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">ScreenRec</h1>
              <p className="text-xs text-muted-foreground">Record • Trim • Share</p>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              New Recording
            </Link>
          </nav>
        </div>
      </div>
    </motion.header>
  );
};
