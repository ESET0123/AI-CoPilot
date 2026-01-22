import logging
import sys

class ColoredFormatter(logging.Formatter):
    """Custom formatter with prefixes like your Node.js backend"""
    
    def format(self, record):
        # Add prefix based on context
        if hasattr(record, 'prefix'):
            prefix = f"[{record.prefix}]"
        else:
            prefix = "[Intent Service]"
        
        # Format the message
        msg = record.getMessage()
        return f"{prefix} {msg}"

def setup_logger():
    """Configure logging to match Node.js backend style"""
    
    formatter = ColoredFormatter()
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    
    logger = logging.getLogger("intent_service")
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)
    logger.propagate = False
    
    return logger

logger = setup_logger()

# Helper function to log with custom prefix
def log_with_prefix(prefix: str, message: str, level: str = "info"):
    """Log a message with a custom prefix"""
    extra = {'prefix': prefix}
    if level == "info":
        logger.info(message, extra=extra)
    elif level == "error":
        logger.error(message, extra=extra)
    elif level == "warning":
        logger.warning(message, extra=extra)
    elif level == "debug":
        logger.debug(message, extra=extra)